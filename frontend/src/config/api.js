// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/api/content/chat`,
  CONVERSATIONS: `${API_BASE_URL}/api/content/conversations`,
  STREAMING_CHAT: `${API_BASE_URL}/api/content/chat/stream`
};

export const apiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default API_BASE_URL;
