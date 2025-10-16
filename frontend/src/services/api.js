// src/services/api.js
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        // Handle your new error format from exceptions.py
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Content methods
  async getConversations() {
    return this.request('/api/content/conversations');
  }

  async getConversationMessages(conversationId) {
    return this.request(`/api/content/conversations/${conversationId}/messages`);
  }

  async sendMessage(data) {
    return this.request('/api/content/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Streaming chat with better error handling
  async *streamChat(data) {
    const response = await fetch(`${this.baseURL}/api/content/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, stream: true }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Streaming failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data;
            } catch (e) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
