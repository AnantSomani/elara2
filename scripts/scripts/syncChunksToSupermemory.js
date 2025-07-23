"use strict";
// Sync script to migrate transcript_segments to Supermemory
// This script handles the data migration from pgvector to Supermemory
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupermemorySync = void 0;
var supabase_1 = require("../lib/supabase");
var supermemory_1 = require("../lib/supermemory");
var api_1 = require("../lib/api");
var SupermemorySync = /** @class */ (function () {
    function SupermemorySync(batchSize, maxRetries) {
        if (batchSize === void 0) { batchSize = 100; }
        if (maxRetries === void 0) { maxRetries = 3; }
        this.batchSize = batchSize;
        this.maxRetries = maxRetries;
        this.progress = { total: 0, synced: 0, failed: 0, skipped: 0 };
    }
    /**
     * Get unsynced segments from database
     */
    SupermemorySync.prototype.getUnsyncedSegments = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase_1.supabase
                                .rpc('get_unsynced_segments', { limit_count: limit })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Database error: ".concat(error.message));
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_1 = _b.sent();
                        console.error('❌ Error getting unsynced segments:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update segment sync status in database
     */
    SupermemorySync.prototype.updateSegmentStatus = function (segmentId, status, supermemoryId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase_1.supabase
                                .rpc('update_segment_sync_status', {
                                segment_id: segmentId,
                                new_status: status,
                                supermemory_id_param: supermemoryId
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Database error: ".concat(error.message));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('❌ Error updating segment status:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Transform segment to Supermemory format
     */
    SupermemorySync.prototype.transformSegmentToMemory = function (segment) {
        return __awaiter(this, void 0, void 0, function () {
            var episode, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, api_1.getEpisodeData)(segment.episode_id)];
                    case 1:
                        episode = _a.sent();
                        return [2 /*return*/, {
                                content: segment.content, // Use 'content' instead of 'text'
                                metadata: {
                                    speaker_name: segment.speaker, // Use 'speaker_name' to match our schema
                                    timestamp: new Date(segment.created_at).toISOString(),
                                    episode_id: segment.episode_id,
                                    podcast_title: (episode === null || episode === void 0 ? void 0 : episode.podcastTitle) || 'Unknown Podcast',
                                    elara_segment_id: segment.id.toString(),
                                    episode_title: episode === null || episode === void 0 ? void 0 : episode.title,
                                    duration: episode === null || episode === void 0 ? void 0 : episode.durationSeconds,
                                    start_time: segment.start_time,
                                    end_time: segment.end_time,
                                },
                                containerTags: ['elara', 'podcast', 'transcript'], // Add container tags
                                userId: 'elara-user', // Add user ID
                            }];
                    case 2:
                        error_3 = _a.sent();
                        console.error('❌ Error transforming segment:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sync a batch of segments to Supermemory
     */
    SupermemorySync.prototype.syncBatch = function (segments) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, segments_1, segment, memories, _a, segments_2, segment, memory, error_4, i, memory, segment, retries, success, _loop_1, this_1, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 19, , 20]);
                        console.log("\uD83D\uDD04 Syncing batch of ".concat(segments.length, " segments..."));
                        _i = 0, segments_1 = segments;
                        _b.label = 1;
                    case 1:
                        if (!(_i < segments_1.length)) return [3 /*break*/, 4];
                        segment = segments_1[_i];
                        return [4 /*yield*/, this.updateSegmentStatus(segment.id, 'syncing')];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        memories = [];
                        _a = 0, segments_2 = segments;
                        _b.label = 5;
                    case 5:
                        if (!(_a < segments_2.length)) return [3 /*break*/, 11];
                        segment = segments_2[_a];
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 8, , 10]);
                        return [4 /*yield*/, this.transformSegmentToMemory(segment)];
                    case 7:
                        memory = _b.sent();
                        memories.push(memory);
                        return [3 /*break*/, 10];
                    case 8:
                        error_4 = _b.sent();
                        console.error("\u274C Error transforming segment ".concat(segment.id, ":"), error_4);
                        return [4 /*yield*/, this.updateSegmentStatus(segment.id, 'failed')];
                    case 9:
                        _b.sent();
                        this.progress.failed++;
                        return [3 /*break*/, 10];
                    case 10:
                        _a++;
                        return [3 /*break*/, 5];
                    case 11:
                        if (memories.length === 0) {
                            console.log('⚠️ No valid memories to sync in this batch');
                            return [2 /*return*/];
                        }
                        // Create memories individually in Supermemory
                        console.log("\uD83D\uDCDD Creating ".concat(memories.length, " memories in Supermemory..."));
                        i = 0;
                        _b.label = 12;
                    case 12:
                        if (!(i < memories.length)) return [3 /*break*/, 18];
                        memory = memories[i];
                        segment = segments[i];
                        retries = 0;
                        success = false;
                        _loop_1 = function () {
                            var memoryId, error_6, delay_1;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 3, , 8]);
                                        return [4 /*yield*/, supermemory_1.supermemoryClient.createMemory(memory)];
                                    case 1:
                                        memoryId = _c.sent();
                                        // Update database with success status
                                        return [4 /*yield*/, this_1.updateSegmentStatus(segment.id, 'completed', memoryId)];
                                    case 2:
                                        // Update database with success status
                                        _c.sent();
                                        this_1.progress.synced++;
                                        success = true;
                                        console.log("\u2705 Created memory ".concat(memoryId, " for segment ").concat(segment.id));
                                        return [3 /*break*/, 8];
                                    case 3:
                                        error_6 = _c.sent();
                                        retries++;
                                        console.error("\u274C Failed to create memory for segment ".concat(segment.id, " (attempt ").concat(retries, "/").concat(this_1.maxRetries, "):"), error_6);
                                        if (!(retries >= this_1.maxRetries)) return [3 /*break*/, 5];
                                        // Mark segment as failed
                                        return [4 /*yield*/, this_1.updateSegmentStatus(segment.id, 'failed')];
                                    case 4:
                                        // Mark segment as failed
                                        _c.sent();
                                        this_1.progress.failed++;
                                        console.error("\u274C Segment ".concat(segment.id, " failed after ").concat(this_1.maxRetries, " attempts"));
                                        return [3 /*break*/, 7];
                                    case 5:
                                        delay_1 = Math.min(1000 * Math.pow(2, retries - 1), 10000);
                                        console.log("\u23F3 Waiting ".concat(delay_1, "ms before retry..."));
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                                    case 6:
                                        _c.sent();
                                        _c.label = 7;
                                    case 7: return [3 /*break*/, 8];
                                    case 8: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _b.label = 13;
                    case 13:
                        if (!(retries < this.maxRetries && !success)) return [3 /*break*/, 15];
                        return [5 /*yield**/, _loop_1()];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 15:
                        if (!(i < memories.length - 1)) return [3 /*break*/, 17];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 16:
                        _b.sent();
                        _b.label = 17;
                    case 17:
                        i++;
                        return [3 /*break*/, 12];
                    case 18:
                        console.log("\u2705 Batch sync completed: ".concat(this.progress.synced, " synced, ").concat(this.progress.failed, " failed"));
                        return [3 /*break*/, 20];
                    case 19:
                        error_5 = _b.sent();
                        console.error('❌ Error syncing batch:', error_5);
                        throw error_5;
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get sync statistics
     */
    SupermemorySync.prototype.getSyncStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, stats, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase_1.supabase
                                .from('transcript_segments')
                                .select('sync_status')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Database error: ".concat(error.message));
                        }
                        stats = {
                            total: data.length,
                            pending: data.filter(function (s) { return s.sync_status === 'pending'; }).length,
                            completed: data.filter(function (s) { return s.sync_status === 'completed'; }).length,
                            failed: data.filter(function (s) { return s.sync_status === 'failed'; }).length,
                        };
                        return [2 /*return*/, stats];
                    case 2:
                        error_7 = _b.sent();
                        console.error('❌ Error getting sync stats:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Main sync process
     */
    SupermemorySync.prototype.syncAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isHealthy, stats, hasMore, batchNumber, segments, progressPercent, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        console.log('🚀 Starting Supermemory sync process...');
                        return [4 /*yield*/, supermemory_1.supermemoryClient.healthCheck()];
                    case 1:
                        isHealthy = _a.sent();
                        if (!isHealthy) {
                            throw new Error('Supermemory service is not available');
                        }
                        return [4 /*yield*/, this.getSyncStats()];
                    case 2:
                        stats = _a.sent();
                        this.progress.total = stats.total;
                        console.log('📊 Current sync status:');
                        console.log("  Total segments: ".concat(stats.total));
                        console.log("  Pending: ".concat(stats.pending));
                        console.log("  Completed: ".concat(stats.completed));
                        console.log("  Failed: ".concat(stats.failed));
                        if (stats.pending === 0) {
                            console.log('✅ All segments are already synced!');
                            return [2 /*return*/];
                        }
                        hasMore = true;
                        batchNumber = 1;
                        _a.label = 3;
                    case 3:
                        if (!hasMore) return [3 /*break*/, 7];
                        console.log("\n\uD83D\uDCE6 Processing batch ".concat(batchNumber, "..."));
                        return [4 /*yield*/, this.getUnsyncedSegments(this.batchSize)];
                    case 4:
                        segments = _a.sent();
                        if (segments.length === 0) {
                            hasMore = false;
                            console.log('✅ No more segments to sync');
                            return [3 /*break*/, 7];
                        }
                        return [4 /*yield*/, this.syncBatch(segments)];
                    case 5:
                        _a.sent();
                        progressPercent = ((this.progress.synced + this.progress.failed) / this.progress.total * 100).toFixed(1);
                        console.log("\uD83D\uDCC8 Progress: ".concat(progressPercent, "% (").concat(this.progress.synced, " synced, ").concat(this.progress.failed, " failed)"));
                        batchNumber++;
                        // Small delay between batches to avoid rate limiting
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 6:
                        // Small delay between batches to avoid rate limiting
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 7:
                        // Final stats
                        console.log('\n🎉 Sync process completed!');
                        console.log("\uD83D\uDCCA Final results:");
                        console.log("  Total processed: ".concat(this.progress.synced + this.progress.failed));
                        console.log("  Successfully synced: ".concat(this.progress.synced));
                        console.log("  Failed: ".concat(this.progress.failed));
                        return [3 /*break*/, 9];
                    case 8:
                        error_8 = _a.sent();
                        console.error('❌ Sync process failed:', error_8);
                        throw error_8;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sync specific episode
     */
    SupermemorySync.prototype.syncEpisode = function (episodeId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, segments, error, i, batch, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        console.log("\uD83C\uDF99\uFE0F Syncing episode: ".concat(episodeId));
                        return [4 /*yield*/, supabase_1.supabase
                                .from('transcript_segments')
                                .select('*')
                                .eq('episode_id', episodeId)
                                .eq('sync_status', 'pending')];
                    case 1:
                        _a = _b.sent(), segments = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Database error: ".concat(error.message));
                        }
                        if (!segments || segments.length === 0) {
                            console.log('✅ No pending segments for this episode');
                            return [2 /*return*/];
                        }
                        console.log("\uD83D\uDCE6 Found ".concat(segments.length, " segments to sync"));
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < segments.length)) return [3 /*break*/, 5];
                        batch = segments.slice(i, i + this.batchSize);
                        return [4 /*yield*/, this.syncBatch(batch)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        i += this.batchSize;
                        return [3 /*break*/, 2];
                    case 5:
                        console.log("\u2705 Episode sync completed: ".concat(episodeId));
                        return [3 /*break*/, 7];
                    case 6:
                        error_9 = _b.sent();
                        console.error('❌ Episode sync failed:', error_9);
                        throw error_9;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return SupermemorySync;
}());
exports.SupermemorySync = SupermemorySync;
// CLI usage
if (require.main === module) {
    var sync = new SupermemorySync();
    var episodeId = process.argv[2];
    if (episodeId) {
        sync.syncEpisode(episodeId).catch(console.error);
    }
    else {
        sync.syncAll().catch(console.error);
    }
}
