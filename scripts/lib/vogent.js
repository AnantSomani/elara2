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
exports.synthesizeSpeech = synthesizeSpeech;
exports.streamSpeech = streamSpeech;
exports.getSpeakers = getSpeakers;
exports.getSpeaker = getSpeaker;
exports.validateApiKey = validateApiKey;
exports.getHostVoiceId = getHostVoiceId;
exports.getHostVoiceSettings = getHostVoiceSettings;
exports.createAgent = createAgent;
exports.testVoice = testVoice;
var axios_1 = require("axios");
var prompts_1 = require("../constants/prompts");
var VOGENT_API_KEY = process.env.EXPO_PUBLIC_VOGENT_API_KEY || '';
var vogentClient = axios_1.default.create({
    baseURL: 'https://api.vogent.ai/v1',
    headers: {
        'Authorization': "Bearer ".concat(VOGENT_API_KEY),
        'Content-Type': 'application/json',
    },
});
/**
 * Convert text to speech using Vogent's Multispeaker TTS
 */
function synthesizeSpeech(text_1, speakerId_1) {
    return __awaiter(this, arguments, void 0, function (text, speakerId, settings) {
        var _a, temperature, _b, speed, _c, pitch, response, blob, error_1;
        if (settings === void 0) { settings = {}; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = settings.temperature, temperature = _a === void 0 ? 0.7 : _a, _b = settings.speed, speed = _b === void 0 ? 1.0 : _b, _c = settings.pitch, pitch = _c === void 0 ? 1.0 : _c;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, vogentClient.post('/tts/synthesize', {
                            text: text,
                            speaker_id: speakerId,
                            temperature: temperature,
                            speed: speed,
                            pitch: pitch,
                        }, {
                            responseType: 'arraybuffer'
                        })];
                case 2:
                    response = _d.sent();
                    blob = new Blob([response.data], { type: 'audio/wav' });
                    return [2 /*return*/, URL.createObjectURL(blob)];
                case 3:
                    error_1 = _d.sent();
                    console.error('Error synthesizing speech with Vogent:', error_1);
                    throw new Error('Failed to synthesize speech');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Stream text to speech for real-time playback
 */
function streamSpeech(text_1, speakerId_1) {
    return __awaiter(this, arguments, void 0, function (text, speakerId, settings) {
        var _a, temperature, _b, speed, _c, pitch, response, error_2;
        if (settings === void 0) { settings = {}; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = settings.temperature, temperature = _a === void 0 ? 0.7 : _a, _b = settings.speed, speed = _b === void 0 ? 1.0 : _b, _c = settings.pitch, pitch = _c === void 0 ? 1.0 : _c;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch('https://api.vogent.ai/v1/tts/stream', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(VOGENT_API_KEY),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                text: text,
                                speaker_id: speakerId,
                                temperature: temperature,
                                speed: speed,
                                pitch: pitch,
                            }),
                        })];
                case 2:
                    response = _d.sent();
                    if (!response.body) {
                        throw new Error('No response body');
                    }
                    return [2 /*return*/, response.body];
                case 3:
                    error_2 = _d.sent();
                    console.error('Error streaming speech with Vogent:', error_2);
                    throw new Error('Failed to stream speech');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get available speakers/voices
 */
function getSpeakers() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, vogentClient.get('/tts/speakers')];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.speakers.map(function (speaker) { return ({
                            speakerId: speaker.id,
                            name: speaker.name,
                            description: speaker.description,
                        }); })];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error fetching speakers:', error_3);
                    throw new Error('Failed to fetch speakers');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get speaker information by ID
 */
function getSpeaker(speakerId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, vogentClient.get("/tts/speakers/".concat(speakerId))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, {
                            speakerId: response.data.id,
                            name: response.data.name,
                            description: response.data.description,
                        }];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error fetching speaker:', error_4);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Validate Vogent API key
 */
function validateApiKey() {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getSpeakers()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
                case 2:
                    error_5 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get host voice ID from database (now async)
 */
function getHostVoiceId(hostName) {
    return __awaiter(this, void 0, void 0, function () {
        var hostPrompt, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, prompts_1.getHostPrompt)(hostName)];
                case 1:
                    hostPrompt = _a.sent();
                    return [2 /*return*/, hostPrompt.voiceId];
                case 2:
                    error_6 = _a.sent();
                    console.error('Error getting host voice ID:', error_6);
                    // Fallback to environment variables if database fails
                    return [2 /*return*/, getFallbackVoiceId(hostName)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fallback voice ID mapping using environment variables
 */
function getFallbackVoiceId(hostName) {
    var voiceMap = {
        'chamath': process.env.EXPO_PUBLIC_CHAMATH_SPEAKER_ID || 'default-speaker-id',
        'chamathpalihapitiya': process.env.EXPO_PUBLIC_CHAMATH_SPEAKER_ID || 'default-speaker-id',
        'sacks': process.env.EXPO_PUBLIC_SACKS_SPEAKER_ID || 'default-speaker-id',
        'davidsacks': process.env.EXPO_PUBLIC_SACKS_SPEAKER_ID || 'default-speaker-id',
        'friedberg': process.env.EXPO_PUBLIC_FRIEDBERG_SPEAKER_ID || 'default-speaker-id',
        'davidfriedberg': process.env.EXPO_PUBLIC_FRIEDBERG_SPEAKER_ID || 'default-speaker-id',
        'calacanis': process.env.EXPO_PUBLIC_CALACANIS_SPEAKER_ID || 'default-speaker-id',
        'jasoncalacanis': process.env.EXPO_PUBLIC_CALACANIS_SPEAKER_ID || 'default-speaker-id',
        'jason': process.env.EXPO_PUBLIC_CALACANIS_SPEAKER_ID || 'default-speaker-id',
    };
    var normalizedName = hostName.toLowerCase().replace(/\s+/g, '');
    return voiceMap[normalizedName] || process.env.EXPO_PUBLIC_DEFAULT_SPEAKER_ID || 'default-speaker-id';
}
/**
 * Get optimized voice settings for podcast hosts
 */
function getHostVoiceSettings(hostName) {
    // Customize settings per host personality
    var settingsMap = {
        'chamath': { temperature: 0.8, speed: 1.1, pitch: 1.0 }, // Direct, energetic
        'sacks': { temperature: 0.7, speed: 1.0, pitch: 1.0 }, // Measured, thoughtful
        'friedberg': { temperature: 0.6, speed: 0.95, pitch: 1.0 }, // Scientific, careful
        'calacanis': { temperature: 0.9, speed: 1.2, pitch: 1.1 }, // Enthusiastic, energetic
    };
    var normalizedName = hostName.toLowerCase().replace(/\s+/g, '');
    return settingsMap[normalizedName] || { temperature: 0.7, speed: 1.0, pitch: 1.0 };
}
/**
 * Create a voice agent for conversational AI
 */
function createAgent(config) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, vogentClient.post('/agents', {
                            name: config.name,
                            prompt: config.prompt,
                            tts_config: {
                                speaker_id: config.speakerId,
                            },
                            phone_number: config.phoneNumber,
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.id];
                case 2:
                    error_7 = _a.sent();
                    console.error('Error creating Vogent agent:', error_7);
                    throw new Error('Failed to create agent');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Test TTS with Voicelab
 */
function testVoice(text, speakerId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, blob, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, vogentClient.post('/voicelab/test', {
                            text: text,
                            speaker_id: speakerId,
                        }, {
                            responseType: 'arraybuffer'
                        })];
                case 1:
                    response = _a.sent();
                    blob = new Blob([response.data], { type: 'audio/wav' });
                    return [2 /*return*/, URL.createObjectURL(blob)];
                case 2:
                    error_8 = _a.sent();
                    console.error('Error testing voice:', error_8);
                    throw new Error('Failed to test voice');
                case 3: return [2 /*return*/];
            }
        });
    });
}
