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
  const [selectedMessageThread, setSelectedMessageThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
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
    // Auto-refresh messages every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [activeTab, messageFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching messages with filter:', messageFilter);
      
      if (activeTab === 'messages') {
        let inboxData = [], sentData = [], countData = null;
        
        if (messageFilter === 'all' || messageFilter === 'received') {
          try {
            const [inboxResponse, countResponse] = await Promise.all([
              messagingService.getInbox(),
              messagingService.getUnreadCount()
            ]);
            console.log('Raw inbox response:', inboxResponse);
            console.log('Inbox response type:', typeof inboxResponse);
            console.log('Is array?', Array.isArray(inboxResponse));
            console.log('Count response:', countResponse);
            
            // Handle paginated response
            if (Array.isArray(inboxResponse)) {
              inboxData = inboxResponse;
            } else if (inboxResponse && inboxResponse.results) {
              inboxData = inboxResponse.results;
            } else if (inboxResponse && typeof inboxResponse === 'object') {
              // Check if it's a direct object with data property
              inboxData = inboxResponse.data || [];
            } else {
              inboxData = [];
            }
            
            console.log('Processed inboxData:', inboxData);
            console.log('Inbox data length:', inboxData.length);
            countData = countResponse;
          } catch (err) {
            console.error('Error fetching inbox:', err);
            console.error('Error details:', err.response);
            setError('Failed to load received messages: ' + (err.response?.data?.detail || err.message));
          }
        }
        
        if (messageFilter === 'all' || messageFilter === 'sent') {
          try {
            const sentResponse = await messagingService.getSentMessages();
            console.log('Raw sent messages response:', sentResponse);
            console.log('Sent response type:', typeof sentResponse);
            
            // Handle paginated response
            if (Array.isArray(sentResponse)) {
              sentData = sentResponse;
            } else if (sentResponse && sentResponse.results) {
              sentData = sentResponse.results;
            } else if (sentResponse && typeof sentResponse === 'object') {
              sentData = sentResponse.data || [];
            } else {
              sentData = [];
            }
            
            console.log('Processed sentData:', sentData);
            console.log('Sent data length:', sentData.length);
          } catch (err) {
            console.error('Error fetching sent messages:', err);
            console.error('Error details:', err.response);
            setError('Failed to load sent messages: ' + (err.response?.data?.detail || err.message));
          }
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
        
        console.log('Final allMessages array:', allMessages);
        console.log('Final messages count:', allMessages.length);
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

  const handleMessageClick = async (message) => {
    console.log('Selected message:', message);
    console.log('Message body:', message.body);
    setSelectedMessage(message);
    setSelectedMessageThread(null); // Reset thread while loading
    
    // Fetch the full thread with replies
    try {
      setLoadingThread(true);
      const threadData = await messagingService.getMessageThread(message.id);
      console.log('Thread data with replies:', threadData);
      setSelectedMessageThread(threadData);
      
      // Mark as read if needed (thread endpoint already handles this)
      // The backend marks both root message and replies as read
      // Just refresh to update UI
      if (!message.is_read || message.has_unread_replies) {
        // Wait a moment for backend to process, then refresh
        setTimeout(() => {
          fetchData();
          // Trigger unread count update in navbar by dispatching a custom event
          window.dispatchEvent(new Event('messageread'));
        }, 500);
      }
    } catch (err) {
      console.error('Failed to load thread:', err);
      setError('Failed to load message thread');
    } finally {
      setLoadingThread(false);
    }
  };

  const handleComposeClick = () => {
    navigate('/messaging/compose');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    try {
      setSendingReply(true);
      await messagingService.replyToMessage(selectedMessage.id, { body: replyText });
      setReplyText('');
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 3000);
      
      // Refresh the thread to show the new reply
      const threadData = await messagingService.getMessageThread(selectedMessage.id);
      setSelectedMessageThread(threadData);
      
      fetchData();
    } catch (err) {
      console.error('Failed to send reply:', err);
      setError('Failed to send reply: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSendingReply(false);
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
          <div className="stat-label">Unread</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{color: '#26A69A'}}>{stats.days200}</div>
          <div className="stat-label">Last 200 Days</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{color: '#66BB6A'}}>{stats.days20}</div>
          <div className="stat-label">Last 20 Days</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="inbox-filter-bar">
        <button 
          className={`filter-btn ${messageFilter === 'all' ? 'active' : ''}`}
          onClick={() => setMessageFilter('all')}
        >
          <i className="fas fa-inbox"></i> All Messages
        </button>
        <button 
          className={`filter-btn ${messageFilter === 'received' ? 'active' : ''}`}
          onClick={() => setMessageFilter('received')}
        >
          <i className="fas fa-envelope"></i> Received
        </button>
        <button 
          className={`filter-btn ${messageFilter === 'sent' ? 'active' : ''}`}
          onClick={() => setMessageFilter('sent')}
        >
          <i className="fas fa-paper-plane"></i> Sent
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="error-alert" style={{
          padding: '15px',
          margin: '20px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33'
        }}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

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
                {!message.is_read && message.type === 'received' && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#2196F3',
                    boxShadow: '0 0 8px rgba(33, 150, 243, 0.6)'
                  }} />
                )}
                <div className="message-card-avatar">
                  {message.type === 'received' 
                    ? (message.sender_details?.first_name?.[0] || 'U').toUpperCase()
                    : (message.recipient_details?.first_name?.[0] || 'U').toUpperCase()
                  }
                </div>
                <div className="message-card-content-area">
                  <div className="message-card-header-row">
                    <div className="message-sender-name" style={{ 
                      fontWeight: !message.is_read && message.type === 'received' ? 'bold' : 'normal'
                    }}>
                      {!message.is_read && message.type === 'received' && (
                        <span style={{ 
                          display: 'inline-block',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          fontSize: '9px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginRight: '6px',
                          fontWeight: 'bold'
                        }}>NEW</span>
                      )}
                      {message.type === 'received' 
                        ? message.sender_details?.full_name || message.sender_details?.username
                        : message.recipient_details?.full_name || message.recipient_details?.username
                      }
                    </div>
                    <div className="message-time">{formatDate(message.created_at)}</div>
                  </div>
                  <div className="message-subject-text" style={{
                    fontWeight: !message.is_read && message.type === 'received' ? '600' : 'normal'
                  }}>{message.subject}</div>
                  <div className="message-preview-text">
                    {message.body.substring(0, 100)}
                    {message.body.length > 100 && '...'}
                  </div>
                  {message.replies_count > 0 && (
                    <div className="message-reply-count" style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: message.has_unread_replies ? '#2196F3' : '#7f8c8d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ 
                        fontWeight: message.has_unread_replies ? '600' : 'normal'
                      }}>
                        💬 {message.replies_count} {message.replies_count === 1 ? 'reply' : 'replies'}
                      </span>
                      {message.has_unread_replies && (
                        <span style={{
                          backgroundColor: '#2196F3',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {message.unread_replies_count} NEW
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-inbox">
              <p style={{ fontSize: '48px', marginBottom: '10px' }}>📭</p>
              <p style={{ fontSize: '16px', color: '#7f8c8d', marginBottom: '5px' }}>
                {messageFilter === 'received' && 'No received messages'}
                {messageFilter === 'sent' && 'No sent messages'}
                {messageFilter === 'all' && 'No messages'}
              </p>
              <p style={{ fontSize: '14px', color: '#95a5a6', marginBottom: '20px' }}>
                {messageFilter === 'received' && 'You haven\'t received any messages yet.'}
                {messageFilter === 'sent' && 'You haven\'t sent any messages yet.'}
                {messageFilter === 'all' && 'Your inbox is empty.'}
              </p>
              <button 
                className="btn btn-primary"
                onClick={handleComposeClick}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  borderRadius: '6px'
                }}
              >
                ✉️ Compose New Message
              </button>
            </div>
          )}
        </div>

        {/* Message Detail View */}
        {selectedMessage ? (
          <div className="inbox-message-detail">
            {loadingThread ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#999'
              }}>
                <div>Loading message thread...</div>
              </div>
            ) : (
              <>
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
                <div className="message-detail-body" style={{
                  color: '#2c3e50',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  padding: '15px 0',
                  minHeight: '100px',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {selectedMessage.body || 'No message content'}
                </div>

                {/* Display Replies */}
                {selectedMessageThread && selectedMessageThread.replies && selectedMessageThread.replies.length > 0 && (
                  <div style={{
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '2px solid #ecf0f1'
                  }}>
                    <h4 style={{ 
                      color: '#2c3e50', 
                      marginBottom: '15px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      💬 Replies ({selectedMessageThread.replies.length})
                    </h4>
                    {selectedMessageThread.replies.map((reply, index) => (
                      <div key={reply.id} style={{
                        marginBottom: '15px',
                        padding: '15px',
                        backgroundColor: reply.sender === user.id ? '#e3f2fd' : '#f5f5f5',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${reply.sender === user.id ? '#2196F3' : '#9e9e9e'}`
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                          fontSize: '13px'
                        }}>
                          <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                            {reply.sender_details?.full_name || reply.sender_details?.username}
                            {reply.sender === user.id && <span style={{ 
                              marginLeft: '8px', 
                              color: '#2196F3',
                              fontSize: '11px'
                            }}>(You)</span>}
                          </span>
                          <span style={{ color: '#7f8c8d', fontSize: '12px' }}>
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                        <div style={{
                          color: '#34495e',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}>
                          {reply.body}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            

            {/* Reply Form - Available for all messages in a thread */}
            <form className="message-reply-form" onSubmit={handleReplySubmit}>
              {replySuccess && (
                <div style={{
                  padding: '10px',
                  marginBottom: '10px',
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  borderRadius: '6px',
                  border: '1px solid #c3e6cb'
                }}>
                  ✅ Reply sent successfully!
                </div>
              )}
              <div style={{
                marginBottom: '10px',
                fontSize: '14px',
                color: '#666'
              }}>
                <strong>Replying to:</strong> {selectedMessage.type === 'received' 
                  ? (selectedMessage.sender_details?.full_name || selectedMessage.sender_details?.username)
                  : (selectedMessage.recipient_details?.full_name || selectedMessage.recipient_details?.username)
                }
              </div>
              <textarea
                className="reply-textarea"
                placeholder="Write your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows="4"
                disabled={sendingReply}
              />
              <button 
                type="submit" 
                className="send-reply-btn"
                disabled={sendingReply || !replyText.trim()}
                style={{
                  opacity: sendingReply || !replyText.trim() ? 0.6 : 1,
                  cursor: sendingReply || !replyText.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                <span>✈️</span> {sendingReply ? 'Sending...' : 'Send Reply'}
              </button>
            </form>
          </div>
        ) : (
          <div className="inbox-message-detail" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#95a5a6'
          }}>
            <div>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>💬</div>
              <h3 style={{ color: '#7f8c8d', marginBottom: '10px' }}>Select a message</h3>
              <p>Click on a message from the list to view its content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
