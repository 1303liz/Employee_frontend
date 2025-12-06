import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import messagingService from '../../services/messagingService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import './Messaging.css';

const SentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSentMessages();
  }, []);

  const fetchSentMessages = async () => {
    try {
      setLoading(true);
      const data = await messagingService.getSentMessages();
      setMessages(data);
      setError('');
    } catch (err) {
      console.error('Failed to load sent messages:', err);
      setError('Failed to load sent messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (messageId) => {
    navigate(`/messaging/view/${messageId}`);
  };

  const handleDelete = async (e, messageId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await messagingService.deleteMessage(messageId);
      await fetchSentMessages();
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(message => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      message.subject.toLowerCase().includes(search) ||
      message.body.toLowerCase().includes(search) ||
      message.recipient_details?.full_name?.toLowerCase().includes(search)
    );
  });

  if (loading) return <Loader />;

  return (
    <div className="messaging-container">
      <div className="page-header">
        <h1>📤 Sent Messages</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/messaging')}>
            ← Back to Inbox
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/messaging/compose')}>
            ✉️ Compose Message
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search sent messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredMessages.length === 0 ? (
          <div className="no-messages">
            <i className="fas fa-paper-plane"></i>
            <p>{searchTerm ? 'No matching messages' : 'No sent messages yet'}</p>
          </div>
        ) : (
          <div className="message-list">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="message-item"
                onClick={() => handleMessageClick(message.id)}
              >
                <div className="message-avatar">
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="message-details">
                  <div className="message-header">
                    <span className="message-sender">
                      To: {message.recipient_details?.full_name || message.recipient_details?.username}
                    </span>
                    <span className="message-date">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="message-subject">
                    {message.subject}
                    {message.replies_count > 0 && (
                      <span className="reply-count">
                        <i className="fas fa-reply"></i> {message.replies_count}
                      </span>
                    )}
                  </div>
                  <div className="message-preview">
                    {message.body.substring(0, 100)}
                    {message.body.length > 100 && '...'}
                  </div>
                </div>
                <div className="message-actions">
                  <button
                    className="btn-icon"
                    onClick={(e) => handleDelete(e, message.id)}
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentMessages;
