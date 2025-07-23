"use strict";
// AUTO-SWITCH: This file exports either the real or mock API functions
// To use mocks, set EXPO_PUBLIC_USE_MOCKS=true in your .env.local
// To disable: set EXPO_PUBLIC_USE_MOCKS=false
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollPodcastIndexStatus = exports.getPodcastIndexStatus = exports.processPodcastIndexEpisode = exports.sendQuestion = exports.getEpisodeData = exports.processPodcastEpisode = void 0;
var RealAPI = require("./api.real");
var MockAPI = require("./api.mock");
var USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
var api = USE_MOCKS ? MockAPI : RealAPI;
// Export all API functions/types from the selected implementation
exports.processPodcastEpisode = api.processPodcastEpisode;
exports.getEpisodeData = api.getEpisodeData;
exports.sendQuestion = api.sendQuestion;
exports.processPodcastIndexEpisode = api.processPodcastIndexEpisode;
exports.getPodcastIndexStatus = api.getPodcastIndexStatus;
exports.pollPodcastIndexStatus = api.pollPodcastIndexStatus;
