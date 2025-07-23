"use strict";
// Host-specific prompt templates and utilities
// Host data is now stored in the database (podcast_hosts table)
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
exports.HOST_PROMPTS = exports.CONTEXT_PROMPTS = void 0;
exports.getHostPrompt = getHostPrompt;
exports.getAllHosts = getAllHosts;
exports.clearHostsCache = clearHostsCache;
exports.getHostVoiceId = getHostVoiceId;
var supabase_1 = require("../lib/supabase");
// Cache for host data to avoid repeated database calls
var hostsCache = null;
var hostsCacheExpiry = null;
var CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
exports.CONTEXT_PROMPTS = {
    ragSystem: "You are responding to a question about a specific podcast episode. Use the provided context from the episode transcript to answer the question accurately. \n\n  Guidelines:\n  - Stay true to what was actually discussed in the episode\n  - If the context doesn't contain enough information, acknowledge this\n  - Maintain the host's speaking style and personality\n  - Reference specific points from the transcript when relevant\n  - Keep responses concise but informative (2-3 sentences max for TTS)",
    questionRewrite: "Rewrite the following question to be more specific and searchable for semantic search over a podcast transcript. \n\n  Guidelines:\n  - Make it more specific and targeted\n  - Include relevant keywords that might appear in the transcript\n  - Maintain the original intent\n  - Keep it concise\n  - Focus on the main topic or concept being asked about",
    fallback: "I don't have enough context from this episode to answer your question accurately. Could you try rephrasing your question or asking about a different topic that was discussed in the episode?",
};
/**
 * Get cached hosts or fetch from database
 */
function getCachedHosts() {
    return __awaiter(this, void 0, void 0, function () {
        var now, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = Date.now();
                    // Return cached data if still valid
                    if (hostsCache && hostsCacheExpiry && now < hostsCacheExpiry) {
                        return [2 /*return*/, hostsCache];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, supabase_1.getPodcastHosts)()];
                case 2:
                    hostsCache = _a.sent();
                    hostsCacheExpiry = now + CACHE_DURATION;
                    return [2 /*return*/, hostsCache];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching podcast hosts:', error_1);
                    // Return empty array if database fetch fails
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get host prompt configuration by name
 */
function getHostPrompt(hostName) {
    return __awaiter(this, void 0, void 0, function () {
        var hosts, normalizedName, nameMap, mappedName, host;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getCachedHosts()];
                case 1:
                    hosts = _a.sent();
                    normalizedName = hostName.toLowerCase().replace(/\s+/g, '');
                    nameMap = {
                        'chamath': 'Chamath',
                        'chamathpalihapitiya': 'Chamath',
                        'sacks': 'Sacks',
                        'davidsacks': 'Sacks',
                        'friedberg': 'Friedberg',
                        'davidfriedberg': 'Friedberg',
                        'calacanis': 'Calacanis',
                        'jasoncalacanis': 'Calacanis',
                        'jason': 'Calacanis',
                    };
                    mappedName = nameMap[normalizedName] || hostName;
                    host = hosts.find(function (h) { return h.name === mappedName; });
                    if (host) {
                        return [2 /*return*/, {
                                name: host.name,
                                systemPrompt: host.personalityPrompt,
                                voiceId: host.voiceId,
                            }];
                    }
                    // Fallback for unknown hosts
                    return [2 /*return*/, {
                            name: 'Podcast Host',
                            systemPrompt: "You are a knowledgeable podcast host. Your speaking style is:\n    - Conversational and engaging\n    - Well-informed on various topics\n    - Ask thoughtful questions\n    - Provide balanced perspectives\n    - Use natural speech patterns\n    - Reference the podcast context appropriately\n    - Maintain an informative yet accessible tone",
                            voiceId: 'default-voice-id',
                        }];
            }
        });
    });
}
/**
 * Get all available hosts
 */
function getAllHosts() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, getCachedHosts()];
        });
    });
}
/**
 * Clear the hosts cache (useful for testing or after host updates)
 */
function clearHostsCache() {
    hostsCache = null;
    hostsCacheExpiry = null;
}
/**
 * Get host voice ID by name
 */
function getHostVoiceId(hostName) {
    return __awaiter(this, void 0, void 0, function () {
        var hostPrompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getHostPrompt(hostName)];
                case 1:
                    hostPrompt = _a.sent();
                    return [2 /*return*/, hostPrompt.voiceId];
            }
        });
    });
}
// Legacy export for backward compatibility
exports.HOST_PROMPTS = {
// This is now deprecated - use getHostPrompt() instead
// Keeping for backward compatibility during transition
};
