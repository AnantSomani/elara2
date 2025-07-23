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
exports.assemblyAIService = void 0;
exports.transcribeEpisode = transcribeEpisode;
exports.getTranscriptionSegments = getTranscriptionSegments;
exports.checkTranscriptionStatus = checkTranscriptionStatus;
exports.searchTranscript = searchTranscript;
var supabase_1 = require("./supabase");
var ASSEMBLYAI_API_KEY = process.env.EXPO_PUBLIC_ASSEMBLYAI_API_KEY || '';
var ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';
var AssemblyAIService = /** @class */ (function () {
    function AssemblyAIService() {
        this.apiKey = ASSEMBLYAI_API_KEY;
        if (!this.apiKey) {
            console.warn('⚠️ AssemblyAI API key not found in environment variables');
        }
    }
    /**
     * Start transcription of an episode's audio
     */
    AssemblyAIService.prototype.transcribeEpisode = function (audioUrl, episodeId) {
        return __awaiter(this, void 0, void 0, function () {
            var config, response, errorData, transcriptData, transcriptId, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 8]);
                        console.log('🎤 Starting transcription for episode:', episodeId);
                        console.log('🔗 Audio URL:', audioUrl);
                        if (!this.apiKey) {
                            throw new Error('AssemblyAI API key not configured');
                        }
                        config = {
                            audio_url: audioUrl,
                            speaker_labels: true,
                            auto_chapters: true,
                            sentiment_analysis: true,
                            entity_detection: true,
                            word_boost: ['podcast', 'AI', 'technology', 'startup', 'venture', 'investment'],
                            boost_param: 'high',
                        };
                        return [4 /*yield*/, fetch("".concat(ASSEMBLYAI_BASE_URL, "/transcript"), {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(config),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 2:
                        errorData = _a.sent();
                        throw new Error("AssemblyAI API error: ".concat(response.status, " - ").concat(errorData.error || 'Unknown error'));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        transcriptData = _a.sent();
                        transcriptId = transcriptData.id;
                        console.log('✅ Transcription started with ID:', transcriptId);
                        // Store transcript metadata in database
                        return [4 /*yield*/, this.updateEpisodeTranscriptStatus(episodeId, {
                                transcript_id: transcriptId,
                                transcription_status: 'processing',
                                audio_url: audioUrl,
                            })];
                    case 5:
                        // Store transcript metadata in database
                        _a.sent();
                        return [2 /*return*/, transcriptId];
                    case 6:
                        error_1 = _a.sent();
                        console.error('❌ Error starting transcription:', error_1);
                        // Update episode with error status
                        return [4 /*yield*/, this.updateEpisodeTranscriptStatus(episodeId, {
                                transcription_status: 'error',
                                error_message: error_1 instanceof Error ? error_1.message : 'Transcription failed',
                            })];
                    case 7:
                        // Update episode with error status
                        _a.sent();
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check transcription status
     */
    AssemblyAIService.prototype.checkTranscriptionStatus = function (transcriptId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this.apiKey) {
                            throw new Error('AssemblyAI API key not configured');
                        }
                        return [4 /*yield*/, fetch("".concat(ASSEMBLYAI_BASE_URL, "/transcript/").concat(transcriptId), {
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("AssemblyAI API error: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, {
                                id: data.id,
                                status: data.status,
                                audio_url: data.audio_url,
                                text: data.text,
                                confidence: data.confidence,
                                error: data.error,
                                processing_url: data.processing_url,
                            }];
                    case 3:
                        error_2 = _a.sent();
                        console.error('❌ Error checking transcription status:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get completed transcription with segments
     */
    AssemblyAIService.prototype.getTranscriptionSegments = function (transcriptId) {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, response, data, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!this.apiKey) {
                            throw new Error('AssemblyAI API key not configured');
                        }
                        return [4 /*yield*/, this.checkTranscriptionStatus(transcriptId)];
                    case 1:
                        status_1 = _a.sent();
                        if (status_1.status !== 'completed') {
                            throw new Error("Transcription not ready. Status: ".concat(status_1.status));
                        }
                        return [4 /*yield*/, fetch("".concat(ASSEMBLYAI_BASE_URL, "/transcript/").concat(transcriptId, "/sentences"), {
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                },
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("AssemblyAI API error: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, data.sentences.map(function (sentence, index) { return ({
                                id: "".concat(transcriptId, "-").concat(index),
                                text: sentence.text,
                                start: sentence.start,
                                end: sentence.end,
                                confidence: sentence.confidence,
                                speaker: sentence.speaker,
                            }); })];
                    case 4:
                        error_3 = _a.sent();
                        console.error('❌ Error getting transcription segments:', error_3);
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search through transcript text for relevant segments
     */
    AssemblyAIService.prototype.searchTranscript = function (episodeId, query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, episode, error, segments, queryLower_1, matchingSegments, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        console.log('🔍 Searching transcript for:', query);
                        return [4 /*yield*/, supabase_1.supabase
                                .from('episodes')
                                .select('transcript_id, full_transcript')
                                .eq('id', episodeId)
                                .single()];
                    case 1:
                        _a = _b.sent(), episode = _a.data, error = _a.error;
                        if (error || !episode) {
                            throw new Error('Episode transcript not found');
                        }
                        if (!episode.transcript_id) {
                            throw new Error('No transcript available for this episode');
                        }
                        return [4 /*yield*/, this.getTranscriptionSegments(episode.transcript_id)];
                    case 2:
                        segments = _b.sent();
                        queryLower_1 = query.toLowerCase();
                        matchingSegments = segments.filter(function (segment) {
                            return segment.text.toLowerCase().includes(queryLower_1);
                        });
                        console.log("\u2705 Found ".concat(matchingSegments.length, " matching segments"));
                        return [2 /*return*/, matchingSegments];
                    case 3:
                        error_4 = _b.sent();
                        console.error('❌ Error searching transcript:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process completed transcription and store in database
     */
    AssemblyAIService.prototype.processCompletedTranscription = function (episodeId, transcriptId) {
        return __awaiter(this, void 0, void 0, function () {
            var status_2, segments, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 6]);
                        console.log('📝 Processing completed transcription:', transcriptId);
                        return [4 /*yield*/, this.checkTranscriptionStatus(transcriptId)];
                    case 1:
                        status_2 = _a.sent();
                        if (status_2.status !== 'completed') {
                            throw new Error("Transcription not completed. Status: ".concat(status_2.status));
                        }
                        if (!status_2.text) {
                            throw new Error('No transcript text available');
                        }
                        return [4 /*yield*/, this.getTranscriptionSegments(transcriptId)];
                    case 2:
                        segments = _a.sent();
                        // Update episode with completed transcript
                        return [4 /*yield*/, this.updateEpisodeTranscriptStatus(episodeId, {
                                transcription_status: 'completed',
                                full_transcript: status_2.text,
                                transcript_confidence: status_2.confidence,
                                transcript_segments: segments,
                            })];
                    case 3:
                        // Update episode with completed transcript
                        _a.sent();
                        console.log('✅ Transcript processing completed for episode:', episodeId);
                        return [3 /*break*/, 6];
                    case 4:
                        error_5 = _a.sent();
                        console.error('❌ Error processing completed transcription:', error_5);
                        // Update with error status
                        return [4 /*yield*/, this.updateEpisodeTranscriptStatus(episodeId, {
                                transcription_status: 'error',
                                error_message: error_5 instanceof Error ? error_5.message : 'Processing failed',
                            })];
                    case 5:
                        // Update with error status
                        _a.sent();
                        throw error_5;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update episode transcript status in database
     */
    AssemblyAIService.prototype.updateEpisodeTranscriptStatus = function (episodeId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase_1.supabase
                                .from('episodes')
                                .update(updates)
                                .eq('id', episodeId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('❌ Database update error:', error);
                            throw new Error("Database update failed: ".concat(error.message));
                        }
                        console.log('✅ Episode transcript status updated:', episodeId);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('❌ Error updating episode transcript status:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if episode has completed transcript
     */
    AssemblyAIService.prototype.hasCompletedTranscript = function (episodeId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, episode, error, error_7;
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
                        if (error) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, (episode === null || episode === void 0 ? void 0 : episode.transcription_status) === 'completed'];
                    case 2:
                        error_7 = _b.sent();
                        console.error('❌ Error checking transcript status:', error_7);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AssemblyAIService;
}());
// Export singleton instance
exports.assemblyAIService = new AssemblyAIService();
// Export convenience functions
function transcribeEpisode(audioUrl, episodeId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.assemblyAIService.transcribeEpisode(audioUrl, episodeId)];
        });
    });
}
function getTranscriptionSegments(episodeId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, episode, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('episodes')
                        .select('transcript_id')
                        .eq('id', episodeId)
                        .single()];
                case 1:
                    _a = _b.sent(), episode = _a.data, error = _a.error;
                    if (error || !(episode === null || episode === void 0 ? void 0 : episode.transcript_id)) {
                        throw new Error('No transcript ID found for episode');
                    }
                    return [2 /*return*/, exports.assemblyAIService.getTranscriptionSegments(episode.transcript_id)];
            }
        });
    });
}
function checkTranscriptionStatus(episodeId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, episode, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase
                        .from('episodes')
                        .select('transcript_id')
                        .eq('id', episodeId)
                        .single()];
                case 1:
                    _a = _b.sent(), episode = _a.data, error = _a.error;
                    if (error || !(episode === null || episode === void 0 ? void 0 : episode.transcript_id)) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, exports.assemblyAIService.checkTranscriptionStatus(episode.transcript_id)];
            }
        });
    });
}
function searchTranscript(episodeId, query) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.assemblyAIService.searchTranscript(episodeId, query)];
        });
    });
}
