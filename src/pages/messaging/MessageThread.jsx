import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import messageService from '../../services/messageService';
import { formatDate } from '../../utils/formatDate';
import './Messaging.css';

const MessageThread = ({ message, onBack, onUpdate }) => {
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchThread();
    markAsRead();
  }, [message.id]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const data = await messageService.getMessageThread(message.id);
      setThread(data);
    } catch (error) {
      setError('Error loading message thread');
      console.error('Error fetching thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      if (!message.is_read && message.recipient === user.id) {
        await messageService.markAsRead(message.id);
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSending(true);
      setError('');
      
      await messageService.replyToMessage(message.id, {
        body: replyText
      });

      setReplyText('');
      await fetchThread();
    } catch (error) {
      setError('Error sending reply');
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="message-thread">
        <div className="thread-header">
          <button className="btn-back" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>
        <div className="loading">Loading thread...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="message-thread">
        <div className="thread-header">
          <button className="btn-back" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>
        <div className="error">Error loading thread</div>
      </div>
    );
  }

  return (
    <div className="message-thread">
      <div className="thread-header">
        <button className="btn-back" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h2>{thread.subject}</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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
              <span className="message-time">
                {formatDate(thread.created_at)}
              </span>
            </div>
            <div className="message-to">
              To: {thread.recipient_details?.full_name || thread.recipient_details?.username}
            </div>
            <div className="message-body">{thread.body}</div>
          </div>
        </div>

        {/* Replies */}
        {thread.replies && thread.replies.map((reply) => (
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
                <span className="message-time">
                  {formatDate(reply.created_at)}
                </span>
              </div>
              <div className="message-body">{reply.body}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <div className="reply-form">
        <form onSubmit={handleReply}>
          <textarea
            className="form-control"
            placeholder="Type your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows="3"
            disabled={sending}
          />
          <div className="reply-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending || !replyText.trim()}
            >
              {sending ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-reply"></i> Reply
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;
