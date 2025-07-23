"use strict";
// Supermemory API client for Elara podcast app
// Uses official Supermemory API v3 structure
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
exports.supermemoryClient = exports.SupermemoryClient = void 0;
var SupermemoryClient = /** @class */ (function () {
    function SupermemoryClient() {
        this.apiKey = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY || '';
        this.baseUrl = process.env.EXPO_PUBLIC_SUPERMEMORY_BASE_URL || 'https://api.supermemory.ai/v3';
        if (!this.apiKey) {
            console.warn('⚠️ Supermemory API key not found in environment variables');
        }
    }
    /**
     * Create a new memory in Supermemory
     * Uses official API v3 structure: { content: string, metadata?: object, containerTags?: string[], userId?: string }
     */
    SupermemoryClient.prototype.createMemory = function (memory) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!this.apiKey) {
                            throw new Error('Supermemory API key not configured');
                        }
                        console.log('📝 Creating Supermemory:', {
                            content: memory.content.substring(0, 100) + '...',
                            metadata: memory.metadata,
                            containerTags: memory.containerTags
                        });
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/memories"), {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(memory),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 2:
                        errorData = _a.sent();
                        throw new Error("Supermemory API error: ".concat(response.status, " - ").concat(errorData.error || 'Unknown error'));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        result = _a.sent();
                        console.log('✅ Memory created with ID:', result.id);
                        return [2 /*return*/, result.id];
                    case 5:
                        error_1 = _a.sent();
                        console.error('❌ Error creating Supermemory:', error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search memories in Supermemory
     * Uses official API v3 structure with proper parameters
     */
    SupermemoryClient.prototype.searchMemories = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, options) {
            var searchParams, response, errorData, result, error_2;
            var _a;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        if (!this.apiKey) {
                            throw new Error('Supermemory API key not configured');
                        }
                        searchParams = {
                            q: query,
                            documentThreshold: options.documentThreshold || 0.3, // Lower threshold as suggested
                            limit: options.limit || 10,
                            onlyMatchingChunks: options.onlyMatchingChunks || false,
                        };
                        // Add user ID if provided
                        if (options.userId) {
                            searchParams.userId = options.userId;
                        }
                        // Add container tags if provided
                        if (options.containerTags && options.containerTags.length > 0) {
                            searchParams.containerTags = options.containerTags;
                        }
                        // Add space if provided
                        if (options.space) {
                            searchParams.space = options.space;
                        }
                        console.log('🔍 Searching Supermemory with params:', searchParams);
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/search"), {
                                method: 'POST', // Use POST as per official SDK
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(searchParams),
                            })];
                    case 1:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 2:
                        errorData = _b.sent();
                        throw new Error("Supermemory API error: ".concat(response.status, " - ").concat(errorData.error || 'Unknown error'));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        result = _b.sent();
                        console.log("\u2705 Found ".concat(((_a = result.results) === null || _a === void 0 ? void 0 : _a.length) || 0, " memories"));
                        return [2 /*return*/, result.results || []];
                    case 5:
                        error_2 = _b.sent();
                        console.error('❌ Error searching Supermemory:', error_2);
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get memory status by ID
     */
    SupermemoryClient.prototype.getMemoryStatus = function (memoryId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!this.apiKey) {
                            throw new Error('Supermemory API key not configured');
                        }
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/memories/").concat(memoryId), {
                                method: 'GET',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 2:
                        errorData = _a.sent();
                        throw new Error("Supermemory API error: ".concat(response.status, " - ").concat(errorData.error || 'Unknown error'));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 5:
                        error_3 = _a.sent();
                        console.error('❌ Error getting memory status:', error_3);
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update an existing memory
     */
    SupermemoryClient.prototype.updateMemory = function (memoryId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!this.apiKey) {
                            throw new Error('Supermemory API key not configured');
                        }
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/memories/").concat(memoryId), {
                                method: 'PATCH',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(updates),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 2:
                        errorData = _a.sent();
                        throw new Error("Supermemory API error: ".concat(response.status, " - ").concat(errorData.error || 'Unknown error'));
                    case 3:
                        console.log('✅ Memory updated successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        console.error('❌ Error updating Supermemory:', error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a memory
     */
    SupermemoryClient.prototype.deleteMemory = function (memoryId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!this.apiKey) {
                            throw new Error('Supermemory API key not configured');
                        }
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/memories/").concat(memoryId), {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 2:
                        errorData = _a.sent();
                        throw new Error("Supermemory API error: ".concat(response.status, " - ").concat(errorData.error || 'Unknown error'));
                    case 3:
                        console.log('✅ Memory deleted successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        console.error('❌ Error deleting Supermemory:', error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Batch create multiple memories
     */
    SupermemoryClient.prototype.batchCreateMemories = function (memories) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, result, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        if (!this.apiKey) {
                            throw new Error('Supermemory API key not configured');
                        }
                        console.log("\uD83D\uDCDD Batch creating ".concat(memories.length, " memories..."));
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/memories/batch"), {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ memories: memories }),
                            })];
                    case 1:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 2:
                        errorData = _b.sent();
                        throw new Error("Supermemory API error: ".concat(response.status, " - ").concat(errorData.error || 'Unknown error'));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        result = _b.sent();
                        console.log("\u2705 Batch created ".concat(((_a = result.ids) === null || _a === void 0 ? void 0 : _a.length) || 0, " memories"));
                        return [2 /*return*/, result.ids || []];
                    case 5:
                        error_6 = _b.sent();
                        console.error('❌ Error batch creating Supermemory:', error_6);
                        throw error_6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Health check for Supermemory service
     */
    SupermemoryClient.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.apiKey) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/health"), {
                                method: 'GET',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.ok];
                    case 2:
                        error_7 = _a.sent();
                        console.error('❌ Supermemory health check failed:', error_7);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enable Infinite Chat for a session
     * Note: This may not be available in the current API version
     */
    SupermemoryClient.prototype.enableInfiniteChat = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!this.apiKey) {
                            throw new Error('Supermemory API key not configured');
                        }
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/infinite-context/enable"), {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ session_id: sessionId }),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 2:
                        errorData = _a.sent();
                        throw new Error("Supermemory API error: ".concat(response.status, " - ").concat(errorData.error || 'Unknown error'));
                    case 3:
                        this.sessionId = sessionId;
                        console.log('✅ Infinite Chat enabled for session:', sessionId);
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _a.sent();
                        console.error('❌ Error enabling Infinite Chat:', error_8);
                        throw error_8;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get Infinite Chat context for a query
     * Note: This may not be available in the current API version
     */
    SupermemoryClient.prototype.getInfiniteContext = function (sessionId, query) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, errorData, result, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!this.apiKey) {
                            throw new Error('Supermemory API key not configured');
                        }
                        params = new URLSearchParams({
                            session_id: sessionId,
                            query: query,
                        });
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/infinite-context?").concat(params), {
                                method: 'GET',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 2:
                        errorData = _a.sent();
                        throw new Error("Supermemory API error: ".concat(response.status, " - ").concat(errorData.error || 'Unknown error'));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, result.memories || []];
                    case 5:
                        error_9 = _a.sent();
                        console.error('❌ Error getting Infinite Chat context:', error_9);
                        throw error_9;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update session memory (for Infinite Chat)
     * Note: This may not be available in the current API version
     */
    SupermemoryClient.prototype.updateSessionMemory = function (sessionId, userMessage, aiResponse) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!this.apiKey) {
                            throw new Error('Supermemory API key not configured');
                        }
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/infinite-context/update"), {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    session_id: sessionId,
                                    user_message: userMessage,
                                    ai_response: aiResponse,
                                }),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json().catch(function () { return ({}); })];
                    case 2:
                        errorData = _a.sent();
                        throw new Error("Supermemory API error: ".concat(response.status, " - ").concat(errorData.error || 'Unknown error'));
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_10 = _a.sent();
                        console.error('❌ Error updating session memory:', error_10);
                        throw error_10;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return SupermemoryClient;
}());
exports.SupermemoryClient = SupermemoryClient;
// Export singleton instance
exports.supermemoryClient = new SupermemoryClient();
