import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import messageService from '../../services/messageService';
import Inbox from './Inbox';
import ComposeMessage from './ComposeMessage';
import MessageThread from './MessageThread';
import Announcements from './Announcements';
import './Messaging.css';

const MessagingDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await messageService.getUnreadCount();
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setActiveTab('thread');
  };

  const handleBackToInbox = () => {
    setSelectedMessage(null);
    setActiveTab('inbox');
    fetchUnreadCount();
  };

  const handleCompose = () => {
    setIsComposing(true);
    setActiveTab('compose');
  };

  const handleMessageSent = () => {
    setIsComposing(false);
    setActiveTab('sent');
  };

  const handleCancelCompose = () => {
    setIsComposing(false);
    setActiveTab('inbox');
  };

  const renderContent = () => {
    if (activeTab === 'thread' && selectedMessage) {
      return (
        <MessageThread
          message={selectedMessage}
          onBack={handleBackToInbox}
          onUpdate={fetchUnreadCount}
        />
      );
    }

    switch (activeTab) {
      case 'inbox':
        return (
          <Inbox
            type="inbox"
            onMessageClick={handleMessageClick}
            onUnreadCountUpdate={setUnreadCount}
          />
        );
      case 'sent':
        return (
          <Inbox
            type="sent"
            onMessageClick={handleMessageClick}
          />
        );
      case 'compose':
        return (
          <ComposeMessage
            onMessageSent={handleMessageSent}
            onCancel={handleCancelCompose}
          />
        );
      case 'announcements':
        return <Announcements />;
      default:
        return null;
    }
  };

  return (
    <div className="messaging-dashboard">
      <div className="messaging-header">
        <h1>Messaging</h1>
        <button
          className="btn btn-primary compose-btn"
          onClick={handleCompose}
        >
          <i className="fas fa-plus"></i> New Message
        </button>
      </div>

      <div className="messaging-container">
        <div className="messaging-sidebar">
          <nav className="messaging-nav">
            <button
              className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
            >
              <i className="fas fa-inbox"></i>
              <span>Inbox</span>
              {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>
            <button
              className={`nav-item ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              <i className="fas fa-paper-plane"></i>
              <span>Sent</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'compose' ? 'active' : ''}`}
              onClick={handleCompose}
            >
              <i className="fas fa-edit"></i>
              <span>Compose</span>
            </button>
            {user?.role === 'hr' && (
              <button
                className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
                onClick={() => setActiveTab('announcements')}
              >
                <i className="fas fa-bullhorn"></i>
                <span>Announcements</span>
              </button>
            )}
          </nav>
        </div>

        <div className="messaging-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MessagingDashboard;
