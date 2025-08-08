import api from './axios';

export const chatAPI = {
  // Send message to chat
  sendMessage: async (sessionId, message, attachedFiles = [], taskName = null) => {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("message", message);
    
    // Add task_name if provided
    if (taskName) {
      formData.append("task_name", taskName);
    }
    
    attachedFiles.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post(
      "/chat/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Clear chat session
  clearSession: async (sessionId) => {
    // sessionId is the token value
    const response = await api.delete(
      `/chat/sessions/${sessionId}`,
    );
    return response.data;
  },

  // Get memory statistics (admin only)
  getMemoryStats: async (sessionId) => {
    const response = await api.get(
      '/chat/memory/stats',
      {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      }
    );
    return response.data;
  },

  // Get LLM provider info (usually public, add header if needed)
  getLLMProvider: async () => {
    const response = await api.get('/llm/provider');
    return response.data;
  },
};
