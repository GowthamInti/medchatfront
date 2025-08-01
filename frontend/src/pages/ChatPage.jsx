import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import ChatHeader from '../components/ChatHeader';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { authAPI } from '../api/auth'; // Make sure this import is correct!

const ChatPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, userType } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  // Admin Add User states
  const [addUserForm, setAddUserForm] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');

  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    isConnected,
    messagesEndRef,
    sendMessage,
    clearSession,
    getTranscriptionSuggestions,
    getGrammarSuggestions,
    setError: setChatError,
  } = useChat();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Handle session clearing
  const handleClearSession = async () => {
    if (window.confirm('Are you sure you want to clear the current conversation? This action cannot be undone.')) {
      try {
        await clearSession();
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  };

  // Clear chat error after a delay
  useEffect(() => {
    if (chatError) {
      const timer = setTimeout(() => {
        setChatError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [chatError, setChatError]);

  // Show loading screen while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-medical-600" />
          <p className="text-gray-600">Loading Medical Transcription AI...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Add user form handlers for admin
  const handleAddUserChange = (e) => {
    setAddUserForm({ ...addUserForm, [e.target.name]: e.target.value });
    setAddUserError('');
    setAddUserSuccess('');
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddUserLoading(true);
    try {
      await authAPI.addUser(addUserForm);
      setAddUserSuccess('User added successfully!');
      setAddUserForm({ username: '', password: '', email: '', full_name: '' });
    } catch (err) {
      setAddUserError(err.response?.data?.detail || 'Failed to add user');
    }
    setAddUserLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <ChatHeader
        isConnected={isConnected}
        onClearSession={handleClearSession}
        onShowSettings={() => setShowSettings(!showSettings)}
      />

      {/* Error notification */}
      {chatError && (
        <div className="mx-4 mt-4 p-3 bg-error-50 border border-error-200 rounded-lg flex items-center space-x-2 animate-slide-in">
          <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0" />
          <span className="text-error-800 text-sm">{chatError}</span>
          <button
            onClick={() => setChatError(null)}
            className="ml-auto text-error-600 hover:text-error-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Chat messages area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-medical-600 text-2xl font-bold">MT</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Medical Transcription AI
                </h2>
                <p className="text-gray-600 mb-4">
                  I'm here to help you create professional radiology reports from your transcriptions.
                  Start by typing your raw transcription below.
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Supports all radiology modalities</p>
                  <p>• Grammar and structure correction</p>
                  <p>• Professional medical formatting</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="pb-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {chatLoading && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Processing your transcription...</span>
          </div>
        </div>
      )}

      {/* Chat input */}
      <ChatInput
        onSendMessage={sendMessage}
        isLoading={chatLoading}
        disabled={!isConnected}
        transcriptionSuggestions={getTranscriptionSuggestions()}
        grammarSuggestions={getGrammarSuggestions()}
      />

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 text-medical-600 mr-2" />
              Settings
            </h3>
            {userType === 'admin' ? (
              <form className="space-y-3" onSubmit={handleAddUserSubmit}>
                <div className="text-lg font-medium text-medical-700 mb-2 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add User
                </div>
                <input
                  type="text"
                  name="username"
                  value={addUserForm.username}
                  onChange={handleAddUserChange}
                  required
                  placeholder="Username"
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="password"
                  name="password"
                  value={addUserForm.password}
                  onChange={handleAddUserChange}
                  required
                  placeholder="Password"
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="email"
                  name="email"
                  value={addUserForm.email}
                  onChange={handleAddUserChange}
                  required
                  placeholder="Email"
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  name="full_name"
                  value={addUserForm.full_name}
                  onChange={handleAddUserChange}
                  required
                  placeholder="Full Name"
                  className="w-full px-3 py-2 border rounded"
                />
                {addUserError && (
                  <div className="flex items-center text-error-700 bg-error-50 border border-error-200 rounded p-2">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>{addUserError}</span>
                  </div>
                )}
                {addUserSuccess && (
                  <div className="flex items-center text-success-700 bg-success-50 border border-success-200 rounded p-2">
                    <UserPlus className="w-4 h-4 mr-2" />
                    <span>{addUserSuccess}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={addUserLoading}
                  className="w-full flex items-center justify-center py-2 px-4 rounded bg-medical-600 text-white font-medium hover:bg-medical-700 transition"
                >
                  {addUserLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Add User
                </button>
              </form>
            ) : (
              <p className="text-gray-600 mb-4">
                Settings panel - Coming soon!
              </p>
            )}
            <button
              onClick={() => setShowSettings(false)}
              className="w-full px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors duration-200 mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
