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
exports.generateCompletion = generateCompletion;
exports.rewriteQuestion = rewriteQuestion;
exports.extractTopics = extractTopics;
exports.summarizeContext = summarizeContext;
exports.validateApiKey = validateApiKey;
var axios_1 = require("axios");
var CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';
var claudeClient = axios_1.default.create({
    baseURL: 'https://api.anthropic.com/v1',
    headers: {
        'Authorization': "Bearer ".concat(CLAUDE_API_KEY),
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
    },
});
/**
 * Generate a completion using Claude
 */
function generateCompletion(messages_1) {
    return __awaiter(this, arguments, void 0, function (messages, options) {
        var _a, model, _b, maxTokens, _c, temperature, response, error_1;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = options.model, model = _a === void 0 ? 'claude-3-haiku-20240307' : _a, _b = options.maxTokens, maxTokens = _b === void 0 ? 150 : _b, _c = options.temperature, temperature = _c === void 0 ? 0.3 : _c;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, claudeClient.post('/messages', {
                            model: model,
                            max_tokens: maxTokens,
                            temperature: temperature,
                            messages: messages,
                        })];
                case 2:
                    response = _d.sent();
                    return [2 /*return*/, response.data.content[0].text];
                case 3:
                    error_1 = _d.sent();
                    console.error('Error generating Claude completion:', error_1);
                    throw new Error('Failed to generate Claude response');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Rewrite a question to be more specific and searchable
 */
function rewriteQuestion(question_1, episodeTitle_1) {
    return __awaiter(this, arguments, void 0, function (question, episodeTitle, hosts) {
        var hostContext, messages, rewritten, error_2;
        if (hosts === void 0) { hosts = []; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hostContext = hosts.length > 0 ? " with hosts ".concat(hosts.join(', ')) : '';
                    messages = [
                        {
                            role: 'user',
                            content: "Rewrite this question to be more specific and searchable for a podcast episode titled \"".concat(episodeTitle, "\"").concat(hostContext, ". \n\nGuidelines:\n- Make it more specific and targeted\n- Include relevant keywords that might appear in the transcript\n- Maintain the original intent\n- Keep it concise\n- Focus on the main topic or concept being asked about\n\nOriginal question: ").concat(question, "\n\nRewritten question:")
                        }
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, generateCompletion(messages, {
                            maxTokens: 100,
                            temperature: 0.3,
                        })];
                case 2:
                    rewritten = _a.sent();
                    // Fallback to original if rewrite failed or is empty
                    return [2 /*return*/, rewritten.trim() || question];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error rewriting question:', error_2);
                    return [2 /*return*/, question]; // Fallback to original question
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Extract key topics from a question
 */
function extractTopics(question) {
    return __awaiter(this, void 0, void 0, function () {
        var messages, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messages = [
                        {
                            role: 'user',
                            content: "Extract the main topics or keywords from this question that would be useful for searching a podcast transcript. Return as a comma-separated list.\n\nQuestion: ".concat(question, "\n\nTopics:")
                        }
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, generateCompletion(messages, {
                            maxTokens: 50,
                            temperature: 0.1,
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response
                            .split(',')
                            .map(function (topic) { return topic.trim(); })
                            .filter(function (topic) { return topic.length > 0; })];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error extracting topics:', error_3);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Summarize episode context for better RAG
 */
function summarizeContext(segments, question) {
    return __awaiter(this, void 0, void 0, function () {
        var context, messages, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = segments.join('\n\n');
                    messages = [
                        {
                            role: 'user',
                            content: "Summarize the following podcast segments in relation to this question: \"".concat(question, "\"\n\nFocus on the most relevant information that would help answer the question.\n\nSegments:\n").concat(context, "\n\nSummary:")
                        }
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, generateCompletion(messages, {
                            maxTokens: 200,
                            temperature: 0.3,
                        })];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error summarizing context:', error_4);
                    return [2 /*return*/, context]; // Fallback to original context
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Validate Claude API key
 */
function validateApiKey() {
    return __awaiter(this, void 0, void 0, function () {
        var messages, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    messages = [
                        { role: 'user', content: 'Hello' }
                    ];
                    return [4 /*yield*/, generateCompletion(messages, { maxTokens: 10 })];
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
