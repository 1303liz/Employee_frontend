import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import messagingService from '../../services/messagingService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';
import './InboxModern.css';

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('messages');
  const [messageFilter, setMessageFilter] = useState('received'); // 'all', 'received', 'sent'
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calculate stats
  const stats = {
    allInclusive: messages.length,
    unread: messages.filter(m => !m.is_read && m.type === 'received').length,
    days200: messages.filter(m => {
      const daysDiff = Math.floor((new Date() - new Date(m.created_at)) / (1000 * 60 * 60 * 24));
      return daysDiff <= 200;
    }).length,
    days20: messages.filter(m => {
      const daysDiff = Math.floor((new Date() - new Date(m.created_at)) / (1000 * 60 * 60 * 24));
      return daysDiff <= 20;
    }).length
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, messageFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'messages') {
        let inboxData, sentData, countData;
        
        if (messageFilter === 'all' || messageFilter === 'received') {
          const [inboxResponse, countResponse] = await Promise.all([
            messagingService.getInbox(),
            messagingService.getUnreadCount()
          ]);
          // Handle paginated response
          inboxData = Array.isArray(inboxResponse) ? inboxResponse : (inboxResponse.results || []);
          countData = countResponse;
        }
        
        if (messageFilter === 'all' || messageFilter === 'sent') {
          const sentResponse = await messagingService.getSentMessages();
          // Handle paginated response
          sentData = Array.isArray(sentResponse) ? sentResponse : (sentResponse.results || []);
        }
        
        // Combine and sort messages
        let allMessages = [];
        if (messageFilter === 'all') {
          const receivedMessages = inboxData.map(m => ({ ...m, type: 'received' }));
          const sentMessages = sentData.map(m => ({ ...m, type: 'sent' }));
          allMessages = [...receivedMessages, ...sentMessages].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
        } else if (messageFilter === 'received') {
          allMessages = inboxData.map(m => ({ ...m, type: 'received' }));
        } else {
          allMessages = sentData.map(m => ({ ...m, type: 'sent' }));
        }
        
        setMessages(allMessages);
        if (countData) {
          setUnreadCount(countData.count);
        }
      } else {
        const announcementsResponse = await messagingService.getActiveAnnouncements();
        // Handle paginated response for announcements
        const announcementsData = Array.isArray(announcementsResponse) 
          ? announcementsResponse 
          : (announcementsResponse.results || []);
        setAnnouncements(announcementsData);
      }
      setError('');
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    if (!message.is_read && message.type === 'received') {
      messagingService.markAsRead(message.id).then(() => {
        fetchData();
      });
    }
  };

  const handleComposeClick = () => {
    navigate('/messaging/compose');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    try {
      await messagingService.replyToMessage(selectedMessage.id, { body: replyText });
      setReplyText('');
      fetchData();
      alert('Reply sent successfully!');
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="inbox-modern-container">
      {/* Header */}
      <div className="inbox-modern-header">
        <div className="inbox-header-left">
          <h1>Messages</h1>
          <p className="inbox-subtitle">{user?.email || 'internal.group.at.employee@yourcompany.com'}</p>
          <p className="inbox-description">Inbox • Folder • Address</p>
        </div>
        <button className="compose-btn-modern" onClick={handleComposeClick}>
          <span>✏️</span> Compose
        </button>
      </div>

      {/* Stats Bar */}
      <div className="inbox-stats-bar">
        <div className="stat-item">
          <div className="stat-value">{stats.allInclusive}</div>
          <div className="stat-label">All Inclusive</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{color: '#5C6BC0'}}>{stats.unread}</div>
          <div className="stat-label">20 Jun 2015</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{color: '#26A69A'}}>{stats.days200}</div>
          <div className="stat-label">200 Days</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{color: '#66BB6A'}}>{stats.days20}</div>
          <div className="stat-label">20 Days</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="inbox-main-content">
        {/* Messages List */}
        <div className="inbox-messages-list">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={`${message.type}-${message.id}`}
                className={`inbox-message-card ${selectedMessage?.id === message.id ? 'selected' : ''} ${!message.is_read && message.type === 'received' ? 'unread' : ''}`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="message-card-avatar">
                  {message.type === 'received' 
                    ? (message.sender_details?.first_name?.[0] || 'U').toUpperCase()
                    : (message.recipient_details?.first_name?.[0] || 'U').toUpperCase()
                  }
                </div>
                <div className="message-card-content-area">
                  <div className="message-card-header-row">
                    <div className="message-sender-name">
                      {message.type === 'received' 
                        ? message.sender_details?.full_name || message.sender_details?.username
                        : message.recipient_details?.full_name || message.recipient_details?.username
                      }
                    </div>
                    <div className="message-time">{formatDate(message.created_at)}</div>
                  </div>
                  <div className="message-subject-text">{message.subject}</div>
                  <div className="message-preview-text">
                    {message.body.substring(0, 100)}
                    {message.body.length > 100 && '...'}
                  </div>
                  {message.replies_count > 0 && (
                    <div className="message-reply-count">
                      <span>Last Reply: 2 days ago</span>
                      <span>• Unread Messages: {message.replies_count}</span>
                      <span>• Last 5 message</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-inbox">
              <p>📭 No messages</p>
            </div>
          )}
        </div>

        {/* Message Detail View */}
        {selectedMessage && (
          <div className="inbox-message-detail">
            <div className="message-detail-header">
              <div className="message-detail-avatar">
                {selectedMessage.type === 'received' 
                  ? (selectedMessage.sender_details?.first_name?.[0] || 'U').toUpperCase()
                  : (selectedMessage.recipient_details?.first_name?.[0] || 'U').toUpperCase()
                }
              </div>
              <div className="message-detail-info">
                <div className="message-detail-name">
                  {selectedMessage.type === 'received' 
                    ? selectedMessage.sender_details?.full_name || selectedMessage.sender_details?.username
                    : selectedMessage.recipient_details?.full_name || selectedMessage.recipient_details?.username
                  }
                </div>
                <div className="message-detail-meta">
                  {formatDate(selectedMessage.created_at)}
                </div>
              </div>
            </div>
            <div className="message-detail-subject">
              <strong>{selectedMessage.subject}</strong>
            </div>
            <div className="message-detail-body">
              {selectedMessage.body}
            </div>

            {/* Reply Form */}
            <form className="message-reply-form" onSubmit={handleReplySubmit}>
              <textarea
                className="reply-textarea"
                placeholder="Write your message here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows="4"
              />
              <button type="submit" className="send-reply-btn">
                <span>✈️</span> Send Reply
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
