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
exports.generateEmbedding = generateEmbedding;
exports.generateChatCompletion = generateChatCompletion;
exports.generateHostResponse = generateHostResponse;
exports.generateBatchEmbeddings = generateBatchEmbeddings;
exports.validateApiKey = validateApiKey;
var axios_1 = require("axios");
var OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
var openaiClient = axios_1.default.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
        'Authorization': "Bearer ".concat(OPENAI_API_KEY),
        'Content-Type': 'application/json',
    },
});
/**
 * Generate text embedding using OpenAI
 */
function generateEmbedding(text) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, openaiClient.post('/embeddings', {
                            model: 'text-embedding-3-small',
                            input: text,
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.data[0].embedding];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error generating embedding:', error_1);
                    throw new Error('Failed to generate embedding');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate chat completion using GPT-4
 */
function generateChatCompletion(messages_1) {
    return __awaiter(this, arguments, void 0, function (messages, options) {
        var _a, model, _b, maxTokens, _c, temperature, response, error_2;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = options.model, model = _a === void 0 ? 'gpt-4o' : _a, _b = options.maxTokens, maxTokens = _b === void 0 ? 300 : _b, _c = options.temperature, temperature = _c === void 0 ? 0.7 : _c;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, openaiClient.post('/chat/completions', {
                            model: model,
                            messages: messages,
                            max_tokens: maxTokens,
                            temperature: temperature,
                        })];
                case 2:
                    response = _d.sent();
                    return [2 /*return*/, response.data.choices[0].message.content];
                case 3:
                    error_2 = _d.sent();
                    console.error('Error generating chat completion:', error_2);
                    throw new Error('Failed to generate response');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate a response in a podcast host's style
 */
function generateHostResponse(question, context, hostName, hostStyle) {
    return __awaiter(this, void 0, void 0, function () {
        var messages;
        return __generator(this, function (_a) {
            messages = [
                {
                    role: 'system',
                    content: "You are ".concat(hostName, ". ").concat(hostStyle, "\n\nAnswer the user's question based on the provided context from the episode. Stay in character and maintain the host's speaking style. Keep responses concise but informative (2-3 sentences max for text-to-speech).")
                },
                {
                    role: 'user',
                    content: "Context from episode:\n".concat(context, "\n\nQuestion: ").concat(question)
                }
            ];
            return [2 /*return*/, generateChatCompletion(messages, {
                    maxTokens: 250,
                    temperature: 0.8,
                })];
        });
    });
}
/**
 * Generate multiple embeddings for batch processing
 */
function generateBatchEmbeddings(texts) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, openaiClient.post('/embeddings', {
                            model: 'text-embedding-3-small',
                            input: texts,
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.data.map(function (item) { return item.embedding; })];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error generating batch embeddings:', error_3);
                    throw new Error('Failed to generate batch embeddings');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Validate OpenAI API key
 */
function validateApiKey() {
    return __awaiter(this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, openaiClient.get('/models')];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
                case 2:
                    error_4 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
