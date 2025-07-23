"use strict";
// MOCK API for frontend design/dev only
// To enable: set EXPO_PUBLIC_USE_MOCKS=true in your .env.local
// To disable: set EXPO_PUBLIC_USE_MOCKS=false
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
exports.processPodcastLink = processPodcastLink;
exports.getEpisodeData = getEpisodeData;
exports.sendQuestion = sendQuestion;
exports.processPodcastIndexEpisode = processPodcastIndexEpisode;
exports.getPodcastIndexStatus = getPodcastIndexStatus;
exports.pollPodcastIndexStatus = pollPodcastIndexStatus;
function processPodcastEpisode(episodeData, audioUrl, podcastTitle) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Simulate network delay
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 500); })];
                case 1:
                    // Simulate network delay
                    _a.sent();
                    return [2 /*return*/, {
                            episodeId: 'mock-episode-id',
                            transcriptionStarted: false,
                        }];
            }
        });
    });
}
function processPodcastLink(youtubeUrl) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Simulate network delay
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 500); })];
                case 1:
                    // Simulate network delay
                    _a.sent();
                    return [2 /*return*/, {
                            episodeId: 'mock-episode-id',
                            transcriptionStarted: false,
                        }];
            }
        });
    });
}
function getEpisodeData(episodeId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 300); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, {
                            id: episodeId,
                            title: 'Mock Podcast Episode',
                            enclosureUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                            hosts: ['Chamath', 'Sacks', 'Friedberg', 'Jason'],
                            processingStatus: 'completed',
                        }];
            }
        });
    });
}
function sendQuestion(episodeId, question) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 800); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, {
                            answer: "Mock answer to: \"".concat(question, "\""),
                            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                            hostVoice: 'Chamath',
                        }];
            }
        });
    });
}
function processPodcastIndexEpisode(episodeData_1) {
    return __awaiter(this, arguments, void 0, function (episodeData, forceReprocess) {
        if (forceReprocess === void 0) { forceReprocess = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Simulate network delay
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 1000); })];
                case 1:
                    // Simulate network delay
                    _a.sent();
                    return [2 /*return*/, {
                            episodeId: episodeData.guid,
                            status: 'processing',
                            message: 'Mock Podcast Index episode processing started',
                            startedAt: new Date().toISOString(),
                        }];
            }
        });
    });
}
function getPodcastIndexStatus(episodeId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Simulate network delay
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 300); })];
                case 1:
                    // Simulate network delay
                    _a.sent();
                    return [2 /*return*/, {
                            episodeId: episodeId,
                            processingStatus: 'completed',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        }];
            }
        });
    });
}
function pollPodcastIndexStatus(episodeId_1) {
    return __awaiter(this, arguments, void 0, function (episodeId, maxAttempts, intervalMs) {
        if (maxAttempts === void 0) { maxAttempts = 30; }
        if (intervalMs === void 0) { intervalMs = 2000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Simulate processing time
                return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, 2000); })];
                case 1:
                    // Simulate processing time
                    _a.sent();
                    return [2 /*return*/, {
                            episodeId: episodeId,
                            processingStatus: 'completed',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        }];
            }
        });
    });
}
