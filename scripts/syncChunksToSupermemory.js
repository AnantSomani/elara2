// Sync script to migrate transcript_segments to Supermemory (JavaScript version)
// This script handles the data migration from pgvector to Supermemory

const { supabase } = require('../lib/supabase');
const { supermemoryClient } = require('../lib/supermemory');
const { getEpisodeData } = require('../lib/api');

class SupermemorySync {
  constructor(batchSize = 100, maxRetries = 3) {
    this.batchSize = batchSize;
    this.maxRetries = maxRetries;
    this.progress = { total: 0, synced: 0, failed: 0, skipped: 0 };
  }

  async getUnsyncedSegments(limit) {
    try {
      const { data, error } = await supabase
        .rpc('get_unsynced_segments', { limit_count: limit });
      if (error) throw new Error(`Database error: ${error.message}`);
      return data || [];
    } catch (error) {
      console.error('❌ Error getting unsynced segments:', error);
      throw error;
    }
  }

  async updateSegmentStatus(segmentId, status, supermemoryId) {
    try {
      const { error } = await supabase
        .rpc('update_segment_sync_status', {
          segment_id: segmentId,
          new_status: status,
          supermemory_id_param: supermemoryId
        });
      if (error) throw new Error(`Database error: ${error.message}`);
    } catch (error) {
      console.error('❌ Error updating segment status:', error);
      throw error;
    }
  }

  async transformSegmentToMemory(segment) {
    try {
      const episode = await getEpisodeData(segment.episode_id);
      return {
        content: segment.content,
        metadata: {
          speaker_name: segment.speaker,
          timestamp: new Date(segment.created_at).toISOString(),
          episode_id: segment.episode_id,
          podcast_title: episode && episode.podcastTitle ? episode.podcastTitle : 'Unknown Podcast',
          elara_segment_id: segment.id.toString(),
          episode_title: episode && episode.title ? episode.title : undefined,
          duration: episode && episode.durationSeconds ? episode.durationSeconds : undefined,
          start_time: segment.start_time,
          end_time: segment.end_time,
        },
        containerTags: ['elara', 'podcast', 'transcript'],
        userId: 'elara-user',
      };
    } catch (error) {
      console.error('❌ Error transforming segment:', error);
      throw error;
    }
  }

  async syncBatch(segments) {
    try {
      console.log(`🔄 Syncing batch of ${segments.length} segments...`);
      for (const segment of segments) {
        await this.updateSegmentStatus(segment.id, 'syncing');
      }
      const memories = [];
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
      console.log(`📝 Creating ${memories.length} memories in Supermemory...`);
      for (let i = 0; i < memories.length; i++) {
        const memory = memories[i];
        const segment = segments[i];
        let retries = 0;
        let success = false;
        while (retries < this.maxRetries && !success) {
          try {
            const memoryId = await supermemoryClient.createMemory(memory);
            await this.updateSegmentStatus(segment.id, 'completed', memoryId);
            this.progress.synced++;
            success = true;
            console.log(`✅ Created memory ${memoryId} for segment ${segment.id}`);
          } catch (error) {
            retries++;
            console.error(`❌ Failed to create memory for segment ${segment.id} (attempt ${retries}/${this.maxRetries}):`, error);
            if (retries >= this.maxRetries) {
              await this.updateSegmentStatus(segment.id, 'failed');
              this.progress.failed++;
              console.error(`❌ Segment ${segment.id} failed after ${this.maxRetries} attempts`);
            } else {
              const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        if (i < memories.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      console.log(`✅ Batch sync completed: ${this.progress.synced} synced, ${this.progress.failed} failed`);
    } catch (error) {
      console.error('❌ Error syncing batch:', error);
      throw error;
    }
  }

  async getSyncStats() {
    try {
      const { data, error } = await supabase
        .from('transcript_segments')
        .select('sync_status');
      if (error) throw new Error(`Database error: ${error.message}`);
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

  async syncAll() {
    try {
      console.log('🚀 Starting Supermemory sync process...');
      const isHealthy = await supermemoryClient.healthCheck();
      if (!isHealthy) throw new Error('Supermemory service is not available');
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
      let hasMore = true;
      while (hasMore) {
        const batch = await this.getUnsyncedSegments(this.batchSize);
        if (batch.length === 0) {
          hasMore = false;
          break;
        }
        await this.syncBatch(batch);
        const statsAfter = await this.getSyncStats();
        if (statsAfter.pending === 0) {
          hasMore = false;
        }
      }
      console.log('\n🎉 Sync process completed!');
      console.log(`📊 Final results:`);
      console.log(`  Total processed: ${this.progress.synced + this.progress.failed}`);
      console.log(`  Successfully synced: ${this.progress.synced}`);
      console.log(`  Failed: ${this.progress.failed}`);
    } catch (error) {
      console.error('❌ Error in syncAll:', error);
      process.exit(1);
    }
  }
}

(async () => {
  const syncer = new SupermemorySync();
  await syncer.syncAll();
})(); 