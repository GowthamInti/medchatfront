import api from './axios';

export const chatAPI = {
  // Send message to chat
  sendMessage: async (sessionId, message, { username = '' } = {}) => {
    // session_id is the token, and Authorization header is set
    const response = await api.post(
      '/chat/',
      {
        session_id: sessionId,
        message: message,
      },
    );
    return response.data;
  },

  // Clear chat session
  clearSession: async (sessionId, { username = '' } = {}) => {
    // sessionId is the token value
    const response = await api.delete(
      `/chat/sessions/${sessionId}`,
    );
    return response.data;
  },

  // Get memory statistics (admin only)
  getMemoryStats: async (sessionId, { username = '' } = {}) => {
    const response = await api.get('/chat/memory/stats', 
    );
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
