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
  const sendMessage = useCallback(async (messageContent, options = {}, attachedFiles = []) => {
    if (!authToken) {
      setError('You must be logged in to use the chat.');
      return;
    }
    if (!messageContent.trim()) return;

    setError(null);
    setIsLoading(true);

    // Add user message with attached files
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageContent.trim(),
      timestamp: new Date().toISOString(),
      user: user?.username || 'User',
      attachedFiles: attachedFiles.length > 0 ? attachedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })) : undefined, // Only include if there are files
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Enhance the message with medical context if specified
      let enhancedMessage = messageContent;
      if (options.transcriptionType) {
        enhancedMessage = `[${options.transcriptionType.toUpperCase()} TRANSCRIPTION]
${messageContent}

Please format this as a professional radiology report with:
- Proper medical terminology
- Clear structure and organization
- Corrected grammar and syntax
- Standard medical report format`;
      }

      if (options.outputTemplate) {
        enhancedMessage += `\n\nOutput Template: ${options.outputTemplate}`;
      }

      if (options.grammarRules) {
        enhancedMessage += `\n\nGrammar Requirements: ${options.grammarRules}`;
      }

      // Add file information to the message if files are attached
      if (attachedFiles.length > 0) {
        enhancedMessage += `\n\nAttached Files: ${attachedFiles.map(f => f.name).join(', ')}`;
      }

      // Use authToken as sessionId
      const sessionId = authToken;

      // Send to API: Pass token via Authorization header and as sessionId
      const response = await chatAPI.sendMessage(
        sessionId, // <-- sessionId is the token!
        enhancedMessage,
        attachedFiles,
      );

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        llmProvider: response.llm_provider,
        model: response.model,
        sessionId: response.session_id,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsConnected(true);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.detail || 'Failed to send message');
      setIsConnected(false);

      // Add error message
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