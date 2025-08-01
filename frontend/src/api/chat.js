import api from './axios';

export const chatAPI = {
  // Send message to chat
  sendMessage: async (authToken, message, { username = '' } = {}) => {
    // session_id is the token, and Authorization header is set
    const response = await api.post(
      '/chat/',
      {
        session_id: authToken,
        message: message,
      },
    );
    return response.data;
  },

  // Clear chat session
  clearSession: async (authToken, { username = '' } = {}) => {
    // sessionId is the token value
    const response = await api.delete(
      `/chat/sessions/${authToken}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Username': username,
        },
      }
    );
    return response.data;
  },

  // Get memory statistics (admin only)
  getMemoryStats: async (authToken, { username = '' } = {}) => {
    const response = await api.get('/chat/memory/stats', {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'X-User-Username': username,
      },
    });
    return response.data;
  },

  // Get health status (usually public, but add header if needed)
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Get LLM provider info (usually public, add header if needed)
  getLLMProvider: async () => {
    const response = await api.get('/llm/provider');
    return response.data;
  },
};
