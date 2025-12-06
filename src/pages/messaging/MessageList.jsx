import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import messageService from '../../services/messageService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';

const MessageList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [subject, setSubject] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    fetchEmployees();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
      setError('');
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await messageService.getEmployees();
      setEmployees(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const handleStartConversation = async (e) => {
    e.preventDefault();
    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    try {
      const conversation = await messageService.startConversation(
        selectedEmployees,
        subject || 'New Conversation'
      );
      setShowNewConversation(false);
      setSelectedEmployees([]);
      setSubject('');
      navigate(`/messages/${conversation.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to start conversation');
    }
  };

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const getConversationTitle = (conversation) => {
    if (conversation.subject) return conversation.subject;
    
    const otherParticipants = conversation.participants.filter(
      p => p.id !== conversation.current_user_id
    );
    
    if (otherParticipants.length === 0) return 'You';
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return participant.first_name && participant.last_name
        ? `${participant.first_name} ${participant.last_name}`
        : participant.username;
    }
    return `${otherParticipants.length} participants`;
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.last_message) return 'No messages yet';
    const content = conversation.last_message.content;
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  if (loading) return <Loader />;

  return (
    <div className="message-list-container">
      <div className="message-list-header">
        <h1>Messages</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewConversation(!showNewConversation)}
        >
          {showNewConversation ? 'Cancel' : '+ New Message'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showNewConversation && (
        <div className="new-conversation-form card">
          <h3>Start New Conversation</h3>
          <form onSubmit={handleStartConversation}>
            <div className="form-group">
              <label>Subject (Optional)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
              />
            </div>

            <div className="form-group">
              <label>Select Recipients</label>
              <div className="employee-select-list">
                {employees.map(employee => (
                  <div 
                    key={employee.id} 
                    className="employee-select-item"
                    onClick={() => toggleEmployeeSelection(employee.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => {}}
                    />
                    <span>
                      {employee.first_name && employee.last_name
                        ? `${employee.first_name} ${employee.last_name}`
                        : employee.username}
                      {employee.role === 'HR' && (
                        <span className="role-badge">HR</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Start Conversation
            </button>
          </form>
        </div>
      )}

      <div className="conversations-list">
        {conversations.length > 0 ? (
          conversations.map(conversation => (
            <div
              key={conversation.id}
              className={`conversation-item ${conversation.unread_count > 0 ? 'unread' : ''}`}
              onClick={() => navigate(`/messages/${conversation.id}`)}
            >
              <div className="conversation-avatar">
                {getConversationTitle(conversation).charAt(0).toUpperCase()}
              </div>
              <div className="conversation-details">
                <div className="conversation-header">
                  <h3>{getConversationTitle(conversation)}</h3>
                  {conversation.last_message && (
                    <span className="conversation-time">
                      {formatDate(conversation.last_message.created_at)}
                    </span>
                  )}
                </div>
                <div className="conversation-preview">
                  <p>{getLastMessagePreview(conversation)}</p>
                  {conversation.unread_count > 0 && (
                    <span className="unread-badge">{conversation.unread_count}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No conversations yet. Start a new conversation to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
