// Sync script to migrate transcript_segments to Supermemory
// This script handles the data migration from pgvector to Supermemory

import { supabase } from '../lib/supabase';
import { supermemoryClient, type SupermemoryMemory } from '../lib/supermemory';
import { getEpisodeData } from '../lib/api';

interface TranscriptSegment {
  id: number;
  episode_id: string;
  content: string;
  speaker: string;
  start_time: number;
  end_time: number;
  embedding: number[];
  created_at: string;
}

interface SyncProgress {
  total: number;
  synced: number;
  failed: number;
  skipped: number;
}

class SupermemorySync {
  private batchSize: number;
  private maxRetries: number;
  private progress: SyncProgress;

  constructor(batchSize: number = 100, maxRetries: number = 3) {
    this.batchSize = batchSize;
    this.maxRetries = maxRetries;
    this.progress = { total: 0, synced: 0, failed: 0, skipped: 0 };
  }

  /**
   * Get unsynced segments from database
   */
  private async getUnsyncedSegments(limit: number): Promise<TranscriptSegment[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_unsynced_segments', { limit_count: limit });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting unsynced segments:', error);
      throw error;
    }
  }

  /**
   * Update segment sync status in database
   */
  private async updateSegmentStatus(
    segmentId: number, 
    status: 'syncing' | 'completed' | 'failed', 
    supermemoryId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('update_segment_sync_status', {
          segment_id: segmentId,
          new_status: status,
          supermemory_id_param: supermemoryId
        });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating segment status:', error);
      throw error;
    }
  }

  /**
   * Transform segment to Supermemory format
   */
  private async transformSegmentToMemory(segment: TranscriptSegment): Promise<SupermemoryMemory> {
    try {
      // Get episode data for metadata
      const episode = await getEpisodeData(segment.episode_id);
      
      return {
        text: segment.content,
        metadata: {
          speaker: segment.speaker,
          timestamp: new Date(segment.created_at).toISOString(),
          episode_id: segment.episode_id,
          podcast_title: episode?.podcastTitle || 'Unknown Podcast',
          elara_segment_id: segment.id.toString(),
          episode_title: episode?.title,
          duration: episode?.durationSeconds,
          start_time: segment.start_time,
          end_time: segment.end_time,
        },
      };
    } catch (error) {
      console.error('❌ Error transforming segment:', error);
      throw error;
    }
  }

  /**
   * Sync a batch of segments to Supermemory
   */
  private async syncBatch(segments: TranscriptSegment[]): Promise<void> {
    try {
      console.log(`🔄 Syncing batch of ${segments.length} segments...`);

      // Mark segments as syncing
      for (const segment of segments) {
        await this.updateSegmentStatus(segment.id, 'syncing');
      }

      // Transform segments to Supermemory format
      const memories: SupermemoryMemory[] = [];
      for (const segment of segments) {
        try {
          const memory = await this.transformSegmentToMemory(segment);
          memories.push(memory);
        } catch (error) {
          console.error(`❌ Error transforming segment ${segment.id}:`, error);
          await this.updateSegmentStatus(segment.id, 'failed');
          this.progress.failed++;
          continue;
        }
      }

      if (memories.length === 0) {
        console.log('⚠️ No valid memories to sync in this batch');
        return;
      }

      // Create memories in Supermemory
      let retries = 0;
      let success = false;

      while (retries < this.maxRetries && !success) {
        try {
          const memoryIds = await supermemoryClient.batchCreateMemories(memories);
          
          // Update database with success status
          for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const memoryId = memoryIds[i];
            
            if (memoryId) {
              await this.updateSegmentStatus(segment.id, 'completed', memoryId);
              this.progress.synced++;
            } else {
              await this.updateSegmentStatus(segment.id, 'failed');
              this.progress.failed++;
            }
          }
          
          success = true;
          console.log(`✅ Successfully synced ${memories.length} segments to Supermemory`);
          
        } catch (error) {
          retries++;
          console.error(`❌ Batch sync failed (attempt ${retries}/${this.maxRetries}):`, error);
          
          if (retries >= this.maxRetries) {
            // Mark all segments as failed
            for (const segment of segments) {
              await this.updateSegmentStatus(segment.id, 'failed');
              this.progress.failed++;
            }
          } else {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }
      }

    } catch (error) {
      console.error('❌ Error syncing batch:', error);
      throw error;
    }
  }

  /**
   * Get sync statistics
   */
  private async getSyncStats(): Promise<{ total: number; pending: number; completed: number; failed: number }> {
    try {
      const { data, error } = await supabase
        .from('transcript_segments')
        .select('sync_status');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const stats = {
        total: data.length,
        pending: data.filter(s => s.sync_status === 'pending').length,
        completed: data.filter(s => s.sync_status === 'completed').length,
        failed: data.filter(s => s.sync_status === 'failed').length,
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting sync stats:', error);
      throw error;
    }
  }

  /**
   * Main sync process
   */
  async syncAll(): Promise<void> {
    try {
      console.log('🚀 Starting Supermemory sync process...');

      // Check Supermemory health
      const isHealthy = await supermemoryClient.healthCheck();
      if (!isHealthy) {
        throw new Error('Supermemory service is not available');
      }

      // Get initial stats
      const stats = await this.getSyncStats();
      this.progress.total = stats.total;
      
      console.log('📊 Current sync status:');
      console.log(`  Total segments: ${stats.total}`);
      console.log(`  Pending: ${stats.pending}`);
      console.log(`  Completed: ${stats.completed}`);
      console.log(`  Failed: ${stats.failed}`);

      if (stats.pending === 0) {
        console.log('✅ All segments are already synced!');
        return;
      }

      // Sync in batches
      let hasMore = true;
      let batchNumber = 1;

      while (hasMore) {
        console.log(`\n📦 Processing batch ${batchNumber}...`);
        
        const segments = await this.getUnsyncedSegments(this.batchSize);
        
        if (segments.length === 0) {
          hasMore = false;
          console.log('✅ No more segments to sync');
          break;
        }

        await this.syncBatch(segments);
        
        // Progress update
        const progressPercent = ((this.progress.synced + this.progress.failed) / this.progress.total * 100).toFixed(1);
        console.log(`📈 Progress: ${progressPercent}% (${this.progress.synced} synced, ${this.progress.failed} failed)`);
        
        batchNumber++;
        
        // Small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Final stats
      console.log('\n🎉 Sync process completed!');
      console.log(`📊 Final results:`);
      console.log(`  Total processed: ${this.progress.synced + this.progress.failed}`);
      console.log(`  Successfully synced: ${this.progress.synced}`);
      console.log(`  Failed: ${this.progress.failed}`);

    } catch (error) {
      console.error('❌ Sync process failed:', error);
      throw error;
    }
  }

  /**
   * Sync specific episode
   */
  async syncEpisode(episodeId: string): Promise<void> {
    try {
      console.log(`🎙️ Syncing episode: ${episodeId}`);

      // Get all segments for this episode
      const { data: segments, error } = await supabase
        .from('transcript_segments')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('sync_status', 'pending');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!segments || segments.length === 0) {
        console.log('✅ No pending segments for this episode');
        return;
      }

      console.log(`📦 Found ${segments.length} segments to sync`);

      // Process in batches
      for (let i = 0; i < segments.length; i += this.batchSize) {
        const batch = segments.slice(i, i + this.batchSize);
        await this.syncBatch(batch);
      }

      console.log(`✅ Episode sync completed: ${episodeId}`);

    } catch (error) {
      console.error('❌ Episode sync failed:', error);
      throw error;
    }
  }
}

// Export for use in other scripts
export { SupermemorySync };

// CLI usage
if (require.main === module) {
  const sync = new SupermemorySync();
  
  const episodeId = process.argv[2];
  
  if (episodeId) {
    sync.syncEpisode(episodeId).catch(console.error);
  } else {
    sync.syncAll().catch(console.error);
  }
} 