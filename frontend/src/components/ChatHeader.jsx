import React, { useState, useRef, useEffect } from 'react';
import { 
  LogOut, 
  User, 
  Shield, 
  Wifi, 
  WifiOff, 
  Settings, 
  ChevronDown,
  UserPlus,
  Database,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({ isConnected, onClearSession, onShowSettings }) => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const navigateToUsers = () => {
    navigate('/admin/users');
    setShowAdminDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAdminDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowAdminDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const adminMenuItems = [
    {
      icon: UserPlus,
      label: 'Manage Users',
      description: 'Create and manage user accounts',
      action: navigateToUsers,
    },
    {
      icon: Activity,
      label: 'System Status',
      description: 'View system health and metrics',
      action: () => {
        console.log('Navigate to system status');
        setShowAdminDropdown(false);
      },
    },
    {
      icon: Database,
      label: 'Data Management',
      description: 'Manage chat sessions and data',
      action: () => {
        console.log('Navigate to data management');
        setShowAdminDropdown(false);
      },
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - App title and status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-medical-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">MT</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Medical Transcription AI
              </h1>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Radiology Assistant</span>
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3 text-success-500" />
                      <span className="text-success-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-error-500" />
                      <span className="text-error-600">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-3">
          {/* User info */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-md">
              {userType === 'admin' ? (
                <Shield className="w-4 h-4 text-medical-600" />
              ) : (
                <User className="w-4 h-4 text-medical-600" />
              )}
              <span className="text-gray-700 font-medium">
                {user?.username}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                ({userType})
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            {/* Admin Settings Dropdown - only for admin */}
            {userType === 'admin' && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                  className={`flex items-center space-x-1 p-2 rounded-md transition-colors duration-200 ${
                    showAdminDropdown
                      ? 'bg-medical-50 text-medical-600'
                      : 'text-gray-400 hover:text-medical-600 hover:bg-medical-50'
                  }`}
                  title="Admin Settings"
                >
                  <Shield className="w-4 h-4" />
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                    showAdminDropdown ? 'transform rotate-180' : ''
                  }`} />
                </button>

                {/* Admin Dropdown Menu */}
                {showAdminDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-medical-600" />
                        <span className="text-sm font-medium text-gray-900">Admin Settings</span>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      {adminMenuItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <button
                            key={index}
                            onClick={item.action}
                            className="w-full flex items-start space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-200"
                          >
                            <IconComponent className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {item.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Regular Settings Button */}
            {onShowSettings && (
              <button
                onClick={onShowSettings}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                title="Chat Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            
            {/* Clear Session Button */}
            {onClearSession && (
              <button
                onClick={onClearSession}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                title="Clear Session"
              >
                Clear
              </button>
            )}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-error-600 hover:bg-error-50 rounded-md transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
