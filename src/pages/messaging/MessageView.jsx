import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import messagingService from '../../services/messagingService';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import Loader from '../../components/Loader';
import './Messaging.css';

const MessageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchThread();
    markAsRead();
  }, [id]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const data = await messagingService.getMessageThread(id);
      setThread(data);
      setError('');
    } catch (err) {
      console.error('Failed to load thread:', err);
      setError('Failed to load message');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await messagingService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSending(true);
      await messagingService.replyToMessage(id, { body: replyText });
      setReplyText('');
      await fetchThread();
    } catch (err) {
      console.error('Failed to send reply:', err);
      setError('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await messagingService.deleteMessage(id);
      navigate('/messaging');
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Failed to delete message');
    }
  };

  if (loading) return <Loader />;

  if (!thread) {
    return (
      <div className="messaging-container">
        <div className="error-message">{error || 'Message not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/messaging')}>
          ← Back to Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="messaging-container">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/messaging')}>
          ← Back to Inbox
        </button>
        <div className="header-actions">
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="message-thread-container">
        <div className="thread-header-info">
          <h2>{thread.subject}</h2>
          <div className="thread-participants">
            <span>From: {thread.sender_details?.full_name || thread.sender_details?.username}</span>
            <span>To: {thread.recipient_details?.full_name || thread.recipient_details?.username}</span>
          </div>
        </div>

        <div className="thread-messages">
          {/* Original Message */}
          <div className={`thread-message ${thread.sender === user.id ? 'sent' : 'received'}`}>
            <div className="message-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="sender-name">
                  {thread.sender_details?.full_name || thread.sender_details?.username}
                </span>
                <span className="message-time">{formatDate(thread.created_at)}</span>
              </div>
              <div className="message-body">{thread.body}</div>
            </div>
          </div>

          {/* Replies */}
          {thread.replies && thread.replies.length > 0 && (
            <>
              {thread.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`thread-message reply ${reply.sender === user.id ? 'sent' : 'received'}`}
                >
                  <div className="message-avatar">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">
                        {reply.sender_details?.full_name || reply.sender_details?.username}
                      </span>
                      <span className="message-time">{formatDate(reply.created_at)}</span>
                    </div>
                    <div className="message-body">{reply.body}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Reply Form */}
        <div className="reply-form">
          <h3>Reply</h3>
          <form onSubmit={handleReply}>
            <textarea
              className="form-control"
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows="4"
              disabled={sending}
            />
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending || !replyText.trim()}
              >
                {sending ? '📤 Sending...' : '💬 Send Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessageView;
