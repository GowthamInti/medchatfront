import { useState, useCallback, useRef, useEffect } from 'react';
import { chatAPI } from '../api/chat';
import { useAuth } from './useAuth';

export const useChat = () => {
  const { user, token: authToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send message
const sendMessage = useCallback(async (messageContent, options = {}, attachedFiles = [], taskName = null) => {
  if (!authToken) {
    setError('You must be logged in to use the chat.');
    return;
  }
  if (!messageContent.trim()) return;

  setError(null);
  setIsLoading(true);

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: messageContent.trim(),
    timestamp: new Date().toISOString(),
    user: user?.username || 'User',
    taskName: taskName || undefined,
    attachedFiles: attachedFiles.length > 0 ? attachedFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    })) : undefined,
  };

  setMessages(prev => [...prev, userMessage]);

  try {
    // Start with the original message
    let enhancedMessage = messageContent;

    // Keep grammar rules only — remove output template formatting
    if (options.grammarRules) {
      enhancedMessage += `\n\nGrammar Requirements:\n${options.grammarRules}`;
    }

    // Add file info if present
    if (attachedFiles.length > 0) {
      enhancedMessage += `\n\nAttached Files: ${attachedFiles.map(f => f.name).join(', ')}`;
    }

    // Send to API
    const sessionId = authToken;

    const response = await chatAPI.sendMessage(
      sessionId,
      enhancedMessage,
      attachedFiles,
      taskName
    );

    // AI response
    const aiMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: response.response,
      timestamp: new Date().toISOString(),
      llmProvider: response.llm_provider,
      model: response.model,
      sessionId: response.session_id,
      taskName: taskName || undefined,
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsConnected(true);
  } catch (error) {
    console.error('Error sending message:', error);
    setError(error.response?.data?.detail || 'Failed to send message');
    setIsConnected(false);

    const errorMessage = {
      id: Date.now() + 1,
      type: 'error',
      content: 'Sorry, I encountered an error processing your request. Please try again.',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
}, [authToken, user]);


  // Clear chat session
  const clearSession = useCallback(async () => {
    if (!authToken) {
      setError('You must be logged in to clear the session.');
      return;
    }
    try {
      setIsLoading(true);
      await chatAPI.clearSession(authToken, { // <-- sessionId is token!
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Username': user?.username || '',
        },
      });
      setMessages([]);
      setError(null);
    } catch (error) {
      console.error('Error clearing session:', error);
      setError('Failed to clear session');
    } finally {
      setIsLoading(false);
    }
  }, [authToken, user]);

  // Get quick transcription suggestions
  const getTranscriptionSuggestions = useCallback(() => [
    {
      title: 'Chest X-Ray',
      prompt: 'Please transcribe this chest X-ray finding with proper medical formatting',
      type: 'chest-xray',
    },
    {
      title: 'CT Scan',
      prompt: 'Format this CT scan report with standard radiology structure',
      type: 'ct-scan',
    },
    {
      title: 'MRI Report',
      prompt: 'Create a structured MRI report from this transcription',
      type: 'mri',
    },
    {
      title: 'Ultrasound',
      prompt: 'Format this ultrasound finding with proper terminology',
      type: 'ultrasound',
    },
    {
      title: 'Grammar Check',
      prompt: 'Please review and correct the grammar in this medical text',
      type: 'grammar-correction',
    },
    {
      title: 'Medical Format',
      prompt: 'Format this text according to medical documentation standards',
      type: 'medical-formatting',
    },
  ], []);

  // Get grammar improvement suggestions
  const getGrammarSuggestions = useCallback(() => [
    'Correct medical terminology and spelling',
    'Improve sentence structure and clarity',
    'Standardize abbreviations and formatting',
    'Ensure proper tense and voice consistency',
    'Add appropriate medical report sections',
  ], []);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    messagesEndRef,
    sendMessage,
    clearSession,
    getTranscriptionSuggestions,
    getGrammarSuggestions,
    setError,
  };
};
