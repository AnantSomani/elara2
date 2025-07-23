"use strict";
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
exports.supabase = void 0;
exports.createEpisode = createEpisode;
exports.getEpisode = getEpisode;
exports.getPodcastHosts = getPodcastHosts;
exports.getEpisodeSpeakers = getEpisodeSpeakers;
exports.searchSegments = searchSegments;
exports.updateEpisodeStatus = updateEpisodeStatus;
exports.subscribeToEpisode = subscribeToEpisode;
var supabase_js_1 = require("@supabase/supabase-js");
// Initialize Supabase client
var supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
var supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
// Debug logging for environment variables (safe - only shows length/prefix)
console.log('🔧 Supabase URL configured:', supabaseUrl ? "".concat(supabaseUrl.substring(0, 30), "...") : 'MISSING');
console.log('🔧 Supabase Key configured:', supabaseKey ? "".concat(supabaseKey.substring(0, 20), "...") : 'MISSING');
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
/**
 * Create a new episode record in Supabase with podcast metadata
 */
function createEpisode(episodeData) {
    return __awaiter(this, void 0, void 0, function () {
        var insertData, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    insertData = {
                        title: episodeData.title,
                        description: episodeData.description,
                        duration_seconds: episodeData.durationSeconds,
                        thumbnail_url: episodeData.imageUrl,
                        channel_title: episodeData.podcastTitle,
                        audio_url: episodeData.enclosureUrl,
                        processing_status: 'pending',
                        created_at: new Date().toISOString(),
                    };
                    // Add optional fields if provided
                    if (episodeData.guid) {
                        insertData.guid = episodeData.guid;
                    }
                    if (episodeData.podcastId) {
                        insertData.podcast_id = episodeData.podcastId;
                    }
                    if (episodeData.publishedAt) {
                        insertData.published_at = episodeData.publishedAt;
                    }
                    // If ID is provided, use it instead of auto-generated
                    if (episodeData.id) {
                        insertData.id = episodeData.id;
                    }
                    return [4 /*yield*/, exports.supabase
                            .from('episodes')
                            .insert(insertData)
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, data.id];
            }
        });
    });
}
/**
 * Get episode data by ID
 */
function getEpisode(episodeId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🔍 getEpisode: Starting query for episode ID:', episodeId);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    console.log('🔍 getEpisode: Making Supabase query...');
                    return [4 /*yield*/, exports.supabase
                            .from('episodes')
                            .select('*')
                            .eq('id', episodeId)
                            .single()];
                case 2:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    console.log('🔍 getEpisode: Query completed. Error:', error ? 'YES' : 'NO');
                    console.log('🔍 getEpisode: Data received:', data ? 'YES' : 'NO');
                    if (error) {
                        console.error('❌ getEpisode: Supabase error:', error);
                        throw error;
                    }
                    if (!data) {
                        console.error('❌ getEpisode: No data returned');
                        throw new Error('Episode not found');
                    }
                    console.log('✅ getEpisode: Successfully found episode:', data.title);
                    return [2 /*return*/, {
                            id: data.id,
                            title: data.title || 'Loading...',
                            description: data.description,
                            enclosureUrl: data.audio_url,
                            imageUrl: data.thumbnail_url,
                            publishedAt: data.published_at,
                            durationSeconds: data.duration_seconds,
                            feedUrl: data.feed_url,
                            episodeType: data.episode_type,
                            explicit: data.explicit,
                            podcastTitle: data.channel_title,
                            processingStatus: data.processing_status,
                            createdAt: data.created_at,
                            updatedAt: data.updated_at,
                        }];
                case 3:
                    error_1 = _b.sent();
                    console.error('❌ getEpisode: Catch block error:', error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get all podcast hosts
 */
function getPodcastHosts() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, exports.supabase
                        .from('podcast_hosts')
                        .select('*')
                        .order('name')];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data.map(function (host) { return ({
                            id: host.id,
                            name: host.name,
                            voiceId: host.voice_id,
                            personalityPrompt: host.personality_prompt,
                            description: host.description,
                            createdAt: host.created_at,
                        }); })];
            }
        });
    });
}
/**
 * Get episode speaker mapping
 */
function getEpisodeSpeakers(episodeId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, exports.supabase
                        .from('episode_speakers')
                        .select('*')
                        .eq('episode_id', episodeId)
                        .order('confidence_score', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data.map(function (speaker) { return ({
                            id: speaker.id,
                            episodeId: speaker.episode_id,
                            speakerLabel: speaker.speaker_label,
                            speakerName: speaker.speaker_name,
                            confidenceScore: speaker.confidence_score,
                            createdAt: speaker.created_at,
                        }); })];
            }
        });
    });
}
/**
 * Search transcript segments using vector similarity
 */
function searchSegments(episodeId_1, queryEmbedding_1) {
    return __awaiter(this, arguments, void 0, function (episodeId, queryEmbedding, similarityThreshold, matchCount) {
        var _a, data, error;
        if (similarityThreshold === void 0) { similarityThreshold = 0.7; }
        if (matchCount === void 0) { matchCount = 5; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, exports.supabase.rpc('search_segments', {
                        target_episode_id: episodeId,
                        query_embedding: JSON.stringify(queryEmbedding),
                        similarity_threshold: similarityThreshold,
                        match_count: matchCount,
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data.map(function (segment) { return ({
                            id: segment.id,
                            episodeId: episodeId,
                            content: segment.content,
                            speaker: segment.speaker_name || 'Unknown', // Map speaker_name to speaker for compatibility
                            speakerName: segment.speaker_name,
                            startTime: segment.start_time,
                            endTime: segment.end_time,
                            embedding: undefined, // Not returned in search results
                        }); })];
            }
        });
    });
}
/**
 * Update episode processing status
 */
function updateEpisodeStatus(episodeId, status) {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.supabase
                        .from('episodes')
                        .update({
                        processing_status: status,
                        updated_at: new Date().toISOString(),
                    })
                        .eq('id', episodeId)];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Subscribe to episode status changes
 */
function subscribeToEpisode(episodeId, callback) {
    return exports.supabase
        .channel("episode_".concat(episodeId))
        .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'episodes',
        filter: "id=eq.".concat(episodeId),
    }, function (payload) {
        var data = payload.new;
        callback({
            id: data.id,
            title: data.title || 'Loading...',
            description: data.description,
            enclosureUrl: data.audio_url,
            imageUrl: data.thumbnail_url,
            publishedAt: data.published_at,
            durationSeconds: data.duration_seconds,
            feedUrl: data.feed_url,
            episodeType: data.episode_type,
            explicit: data.explicit,
            podcastTitle: data.channel_title,
            processingStatus: data.processing_status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        });
    })
        .subscribe();
}
