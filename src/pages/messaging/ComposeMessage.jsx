import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import messagingService from '../../services/messagingService';
import Loader from '../../components/Loader';

const ComposeMessage = () => {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    body: ''
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await messagingService.getContacts();
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.recipient || !formData.subject || !formData.body) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSending(true);
      await messagingService.sendMessage(formData);
      setSuccess('Message sent successfully!');
      setTimeout(() => {
        navigate('/messaging');
      }, 1500);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.detail || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    navigate('/messaging');
  };

  if (loading) return <Loader />;

  return (
    <div className="compose-message-container">
      <div className="page-header">
        <h1>✉️ Compose Message</h1>
        <button className="btn btn-secondary" onClick={handleCancel}>
          ← Back to Inbox
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} className="message-form">
          <div className="form-group">
            <label htmlFor="recipient">To: *</label>
            <select
              id="recipient"
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
              required
            >
              <option value="">-- Select recipient --</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.full_name} ({contact.role})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject: *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter message subject"
              maxLength="255"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Message: *</label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              placeholder="Type your message here..."
              rows="10"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
            >
              {sending ? 'Sending...' : '📤 Send Message'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={sending}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeMessage;
