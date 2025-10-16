// src/config/constants.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  CHAT: '/api/content/chat',
  CONVERSATIONS: '/api/content/conversations',
  STREAMING_CHAT: '/api/content/chat/stream'
};

// Helper function for building full URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
