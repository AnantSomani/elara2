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
exports.processPodcastEpisode = processPodcastEpisode;
exports.getEpisodeData = getEpisodeData;
exports.sendQuestion = sendQuestion;
exports.getTranscriptionStatus = getTranscriptionStatus;
exports.startTranscription = startTranscription;
exports.processPodcastIndexEpisode = processPodcastIndexEpisode;
exports.getPodcastIndexStatus = getPodcastIndexStatus;
exports.pollPodcastIndexStatus = pollPodcastIndexStatus;
var axios_1 = require("axios");
var supabase_1 = require("./supabase");
var openai_1 = require("./openai");
var assemblyai_1 = require("./assemblyai");
var supermemory_1 = require("./supermemory");
// Get environment variables for debugging
var supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
var supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
// API endpoints
var OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
var VOGENT_API_KEY = process.env.EXPO_PUBLIC_VOGENT_API_KEY || '';
var CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';
/**
 * Process a podcast episode for transcription and AI chat
 * This creates or updates episode data and starts transcription if needed
 */
function processPodcastEpisode(episodeData, audioUrl, podcastTitle) {
    return __awaiter(this, void 0, void 0, function () {
        var episodeId, _a, existingEpisode, dbError, needsTranscription, newEpisodeData, transcriptionId, error_1, error_2, errorMessage;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    console.log('🎙️ Processing podcast episode for transcription...');
                    console.log('📹 Episode:', episodeData.title);
                    console.log('🔗 Audio URL:', audioUrl);
                    episodeId = episodeData.id.toString();
                    // Check if episode exists in database
                    console.log('🔍 Checking database for existing episode...');
                    return [4 /*yield*/, supabase_1.supabase
                            .from('episodes')
                            .select('*')
                            .eq('id', episodeId)
                            .single()];
                case 1:
                    _a = _b.sent(), existingEpisode = _a.data, dbError = _a.error;
                    needsTranscription = true;
                    if (!(!dbError && existingEpisode)) return [3 /*break*/, 2];
                    console.log('✅ Episode found in database');
                    // Check transcription status
                    if (existingEpisode.transcriptionStatus === 'completed') {
                        console.log('✅ Episode already has completed transcription');
                        needsTranscription = false;
                    }
                    else if (existingEpisode.transcriptionStatus === 'processing') {
                        console.log('⏳ Episode transcription already in progress');
                        needsTranscription = false;
                    }
                    return [3 /*break*/, 4];
                case 2:
                    // Create new episode in database
                    console.log('🆕 Creating new episode in database...');
                    newEpisodeData = {
                        id: episodeId,
                        title: episodeData.title || 'Unknown Episode',
                        description: episodeData.description || '',
                        durationSeconds: episodeData.duration || 0,
                        imageUrl: episodeData.image || '',
                        podcastTitle: podcastTitle,
                        enclosureUrl: audioUrl,
                        publishedAt: new Date(episodeData.datePublished * 1000).toISOString(),
                    };
                    return [4 /*yield*/, (0, supabase_1.createEpisode)(newEpisodeData)];
                case 3:
                    _b.sent();
                    console.log('✅ Episode created in database');
                    _b.label = 4;
                case 4:
                    transcriptionId = void 0;
                    if (!(needsTranscription && audioUrl)) return [3 /*break*/, 8];
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    console.log('🎤 Starting transcription process...');
                    return [4 /*yield*/, (0, assemblyai_1.transcribeEpisode)(audioUrl, episodeId)];
                case 6:
                    transcriptionId = _b.sent();
                    console.log('✅ Transcription started with ID:', transcriptionId);
                    // Start monitoring transcription progress
                    monitorTranscriptionProgress(episodeId, transcriptionId).catch(function (error) {
                        console.error('❌ Transcription monitoring failed:', error);
                    });
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _b.sent();
                    console.error('❌ Failed to start transcription:', error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, {
                        episodeId: episodeId,
                        transcriptionStarted: needsTranscription,
                        transcriptionId: transcriptionId,
                    }];
                case 9:
                    error_2 = _b.sent();
                    console.error('❌ Error processing podcast episode:', error_2);
                    errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                    throw new Error("Failed to process podcast episode: ".concat(errorMessage));
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Monitor transcription progress in the background
 */
function monitorTranscriptionProgress(episodeId, transcriptId) {
    return __awaiter(this, void 0, void 0, function () {
        var maxAttempts_1, attempts_1, checkProgress_1;
        var _this = this;
        return __generator(this, function (_a) {
            try {
                console.log('👀 Monitoring transcription progress for:', episodeId);
                maxAttempts_1 = 30;
                attempts_1 = 0;
                checkProgress_1 = function () { return __awaiter(_this, void 0, void 0, function () {
                    var assemblyAIService, status_1, error_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 5, , 6]);
                                attempts_1++;
                                console.log("\uD83D\uDCCA Checking transcription progress (attempt ".concat(attempts_1, "/").concat(maxAttempts_1, ")..."));
                                return [4 /*yield*/, Promise.resolve().then(function () { return require('./assemblyai'); })];
                            case 1:
                                assemblyAIService = (_a.sent()).assemblyAIService;
                                return [4 /*yield*/, assemblyAIService.checkTranscriptionStatus(transcriptId)];
                            case 2:
                                status_1 = _a.sent();
                                console.log("\uD83D\uDCC8 Transcription status: ".concat(status_1.status));
                                if (!(status_1.status === 'completed')) return [3 /*break*/, 4];
                                console.log('🎉 Transcription completed! Processing final result...');
                                return [4 /*yield*/, assemblyAIService.processCompletedTranscription(episodeId, transcriptId)];
                            case 3:
                                _a.sent();
                                console.log('✅ Transcription processing complete');
                                return [2 /*return*/];
                            case 4:
                                if (status_1.status === 'error') {
                                    console.error('❌ Transcription failed:', status_1.error);
                                    return [2 /*return*/];
                                }
                                if (attempts_1 < maxAttempts_1 && status_1.status === 'processing') {
                                    // Continue monitoring
                                    setTimeout(checkProgress_1, 30000); // Check every 30 seconds
                                }
                                else if (attempts_1 >= maxAttempts_1) {
                                    console.warn('⚠️ Transcription monitoring timeout - stopping checks');
                                }
                                return [3 /*break*/, 6];
                            case 5:
                                error_3 = _a.sent();
                                console.error('❌ Error checking transcription progress:', error_3);
                                if (attempts_1 < maxAttempts_1) {
                                    setTimeout(checkProgress_1, 30000); // Retry in 30 seconds
                                }
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); };
                // Start monitoring after initial delay
                setTimeout(checkProgress_1, 10000); // Wait 10 seconds before first check
            }
            catch (error) {
                console.error('❌ Error setting up transcription monitoring:', error);
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Get episode data with transcription status
 */
function getEpisodeData(episodeId) {
    return __awaiter(this, void 0, void 0, function () {
        var episode, status_2, error_4, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log('📖 Getting episode data for:', episodeId);
                    return [4 /*yield*/, (0, supabase_1.getEpisode)(episodeId)];
                case 1:
                    episode = _a.sent();
                    if (!episode) {
                        throw new Error('Episode not found');
                    }
                    if (!(episode.transcriptionStatus === 'processing' && episode.transcriptId)) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, assemblyai_1.checkTranscriptionStatus)(episodeId)];
                case 3:
                    status_2 = _a.sent();
                    if (status_2 && status_2.status !== episode.transcriptionStatus) {
                        console.log("\uD83D\uDCCA Transcription status updated: ".concat(status_2.status));
                        // Status will be updated by the monitoring process
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.warn('⚠️ Could not check transcription status:', error_4);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, episode];
                case 6:
                    error_5 = _a.sent();
                    console.error('❌ Error getting episode data:', error_5);
                    throw error_5;
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Send a question about an episode and get AI response with transcript context
 * Now enhanced with Supermemory search for better context and long-term memory
 */
function sendQuestion(episodeId, question) {
    return __awaiter(this, void 0, void 0, function () {
        var episode, memoryResults, usedMemorySearch, contextText, memoryContexts, error_6, relevantSegments, error_7, questionText, episodeContext, hostName, hostStyle, response, error_8, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    console.log('💬 Processing question for episode:', episodeId);
                    console.log('❓ Question:', question);
                    return [4 /*yield*/, (0, supabase_1.getEpisode)(episodeId)];
                case 1:
                    episode = _a.sent();
                    if (!episode) {
                        throw new Error('Episode not found');
                    }
                    memoryResults = [];
                    usedMemorySearch = false;
                    contextText = '';
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    console.log('🧠 Searching Supermemory for relevant memories...');
                    return [4 /*yield*/, supermemory_1.supermemoryClient.searchMemories(question, {
                            documentThreshold: 0.3,
                            limit: 5,
                            containerTags: ['elara', 'podcast'],
                            userId: 'elara-user'
                        })];
                case 3:
                    memoryResults = _a.sent();
                    if (memoryResults.length > 0) {
                        usedMemorySearch = true;
                        console.log("\u2705 Found ".concat(memoryResults.length, " relevant memories in Supermemory"));
                        memoryContexts = memoryResults.map(function (memory) {
                            var _a;
                            var chunks = ((_a = memory.chunks) === null || _a === void 0 ? void 0 : _a.filter(function (chunk) { return chunk.isRelevant; })) || [];
                            return chunks.map(function (chunk) { return chunk.content; }).join(' ');
                        }).filter(function (text) { return text.length > 0; });
                        contextText = memoryContexts.join(' ');
                        console.log("\uD83D\uDCDD Memory context length: ".concat(contextText.length, " characters"));
                    }
                    else {
                        console.log('⚠️ No relevant memories found in Supermemory, falling back to transcript search');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _a.sent();
                    console.warn('⚠️ Supermemory search failed, falling back to transcript search:', error_6);
                    return [3 /*break*/, 5];
                case 5:
                    relevantSegments = [];
                    if (!(!usedMemorySearch && episode.transcriptionStatus === 'completed')) return [3 /*break*/, 9];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    console.log('🔍 Searching transcript for relevant content...');
                    return [4 /*yield*/, (0, assemblyai_1.searchTranscript)(episodeId, question)];
                case 7:
                    relevantSegments = _a.sent();
                    if (relevantSegments.length > 0) {
                        console.log("\u2705 Found ".concat(relevantSegments.length, " relevant transcript segments"));
                        contextText = relevantSegments
                            .map(function (segment) { return segment.text; })
                            .join(' ');
                    }
                    return [3 /*break*/, 9];
                case 8:
                    error_7 = _a.sent();
                    console.warn('⚠️ Could not search transcript:', error_7);
                    return [3 /*break*/, 9];
                case 9:
                    // Generate AI response with enhanced context
                    console.log('🤖 Generating AI response with memory-aware context...');
                    questionText = question;
                    episodeContext = contextText || "Episode: ".concat(episode.title);
                    hostName = 'Host';
                    hostStyle = usedMemorySearch
                        ? 'You are a knowledgeable podcast host with access to a comprehensive memory of podcast content. Provide helpful, accurate responses based on the episode content and related memories. Reference specific details from the memories when relevant.'
                        : 'You are a knowledgeable podcast host. Provide helpful, accurate responses based on the episode content.';
                    return [4 /*yield*/, (0, openai_1.generateHostResponse)(questionText, episodeContext, hostName, hostStyle)];
                case 10:
                    response = _a.sent();
                    console.log('✅ AI response generated');
                    console.log("\uD83D\uDCCA Used ".concat(usedMemorySearch ? 'Supermemory' : 'transcript', " search for context"));
                    // For now, return without audio synthesis to focus on text responses
                    return [2 /*return*/, {
                            answer: response,
                            audioUrl: '', // Will implement audio synthesis later
                            hostVoice: 'Host',
                            relevantSegments: !usedMemorySearch && relevantSegments.length > 0 ? relevantSegments : undefined,
                            memoryResults: usedMemorySearch && memoryResults.length > 0 ? memoryResults : undefined,
                            usedMemorySearch: usedMemorySearch,
                        }];
                case 11:
                    error_8 = _a.sent();
                    console.error('❌ Error processing question:', error_8);
                    errorMessage = error_8 instanceof Error ? error_8.message : 'Unknown error';
                    throw new Error("Failed to process question: ".concat(errorMessage));
                case 12: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get transcription status for an episode
 */
function getTranscriptionStatus(episodeId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, episode, error, error_9;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('episodes')
                            .select('transcription_status')
                            .eq('id', episodeId)
                            .single()];
                case 1:
                    _a = _b.sent(), episode = _a.data, error = _a.error;
                    if (error || !episode) {
                        return [2 /*return*/, 'not_started'];
                    }
                    return [2 /*return*/, episode.transcription_status || 'not_started'];
                case 2:
                    error_9 = _b.sent();
                    console.error('❌ Error getting transcription status:', error_9);
                    return [2 /*return*/, 'error'];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Manually trigger transcription for an episode
 */
function startTranscription(episodeId, audioUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var transcriptionId, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('🎤 Manually starting transcription for episode:', episodeId);
                    return [4 /*yield*/, (0, assemblyai_1.transcribeEpisode)(audioUrl, episodeId)];
                case 1:
                    transcriptionId = _a.sent();
                    // Start monitoring
                    monitorTranscriptionProgress(episodeId, transcriptionId).catch(function (error) {
                        console.error('❌ Transcription monitoring failed:', error);
                    });
                    return [2 /*return*/, transcriptionId];
                case 2:
                    error_10 = _a.sent();
                    console.error('❌ Error starting transcription:', error_10);
                    throw error_10;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Process a Podcast Index episode using the FastAPI backend
 */
function processPodcastIndexEpisode(episodeData_1) {
    return __awaiter(this, arguments, void 0, function (episodeData, forceReprocess) {
        var apiBaseUrl, response, error_11, errorMessage;
        if (forceReprocess === void 0) { forceReprocess = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('🎙️ Processing Podcast Index episode...');
                    console.log('📹 Episode:', episodeData.title);
                    console.log('🔗 Audio URL:', episodeData.enclosureUrl);
                    apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                    return [4 /*yield*/, axios_1.default.post("".concat(apiBaseUrl, "/process-podcast-index"), {
                            episode_data: episodeData,
                            episode_id: null, // Let the API generate one
                            force_reprocess: forceReprocess
                        })];
                case 1:
                    response = _a.sent();
                    console.log('✅ Podcast Index processing started:', response.data);
                    return [2 /*return*/, response.data];
                case 2:
                    error_11 = _a.sent();
                    console.error('❌ Error processing Podcast Index episode:', error_11);
                    errorMessage = error_11 instanceof Error ? error_11.message : 'Unknown error';
                    throw new Error("Failed to process Podcast Index episode: ".concat(errorMessage));
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check the processing status of a Podcast Index episode
 */
function getPodcastIndexStatus(episodeId) {
    return __awaiter(this, void 0, void 0, function () {
        var apiBaseUrl, response, error_12, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('📊 Checking Podcast Index processing status for:', episodeId);
                    apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                    return [4 /*yield*/, axios_1.default.get("".concat(apiBaseUrl, "/status/").concat(episodeId))];
                case 1:
                    response = _a.sent();
                    console.log('✅ Status retrieved:', response.data);
                    return [2 /*return*/, response.data];
                case 2:
                    error_12 = _a.sent();
                    console.error('❌ Error checking Podcast Index status:', error_12);
                    errorMessage = error_12 instanceof Error ? error_12.message : 'Unknown error';
                    throw new Error("Failed to check Podcast Index status: ".concat(errorMessage));
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Poll the processing status until completion or failure
 */
function pollPodcastIndexStatus(episodeId_1) {
    return __awaiter(this, arguments, void 0, function (episodeId, maxAttempts, intervalMs) {
        var attempt, status_3, error_13;
        if (maxAttempts === void 0) { maxAttempts = 30; }
        if (intervalMs === void 0) { intervalMs = 2000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    console.log('🔄 Polling Podcast Index processing status...');
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= maxAttempts)) return [3 /*break*/, 5];
                    console.log("\uD83D\uDCCA Polling attempt ".concat(attempt, "/").concat(maxAttempts, "..."));
                    return [4 /*yield*/, getPodcastIndexStatus(episodeId)];
                case 2:
                    status_3 = _a.sent();
                    if (status_3.processingStatus === 'completed') {
                        console.log('🎉 Podcast Index processing completed!');
                        return [2 /*return*/, status_3];
                    }
                    if (status_3.processingStatus === 'failed') {
                        console.error('❌ Podcast Index processing failed:', status_3.errorMessage);
                        return [2 /*return*/, status_3];
                    }
                    if (!(attempt < maxAttempts)) return [3 /*break*/, 4];
                    console.log("\u23F3 Still processing... waiting ".concat(intervalMs, "ms before next check"));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, intervalMs); })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    attempt++;
                    return [3 /*break*/, 1];
                case 5:
                    console.warn('⚠️ Polling timeout - processing may still be in progress');
                    return [4 /*yield*/, getPodcastIndexStatus(episodeId)];
                case 6: return [2 /*return*/, _a.sent()];
                case 7:
                    error_13 = _a.sent();
                    console.error('❌ Error polling Podcast Index status:', error_13);
                    throw error_13;
                case 8: return [2 /*return*/];
            }
        });
    });
}
