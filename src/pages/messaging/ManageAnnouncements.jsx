import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import messagingService from '../../services/messagingService';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import Loader from '../../components/Loader';
import './ManageAnnouncementsModern.css';

const ManageAnnouncements = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is HR
    if (user?.role !== 'HR' && user?.role !== 'hr') {
      navigate('/messaging');
      return;
    }
    fetchAnnouncements();
  }, [user, navigate]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getAnnouncements();
      // Handle paginated response
      const data = Array.isArray(response) ? response : (response.results || []);
      setAnnouncements(data);
      setError('');
    } catch (err) {
      console.error('Failed to load announcements:', err);
      setError('Failed to load announcements');
      setAnnouncements([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      if (editingId) {
        await messagingService.updateAnnouncement(editingId, formData);
        setSuccess('Announcement updated successfully!');
      } else {
        await messagingService.createAnnouncement(formData);
        setSuccess('Announcement created successfully!');
      }
      
      setFormData({ title: '', content: '', priority: 'normal' });
      setShowForm(false);
      setEditingId(null);
      await fetchAnnouncements();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save announcement:', err);
      setError(err.response?.data?.detail || 'Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await messagingService.deleteAnnouncement(id);
      setSuccess('Announcement deleted successfully!');
      await fetchAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      setError('Failed to delete announcement');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', content: '', priority: 'normal' });
    setError('');
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#FF6B6B',
      high: '#FFA94D',
      normal: '#4DABF7',
      low: '#A3BE8C'
    };
    return colors[priority?.toLowerCase()] || '#4DABF7';
  };

  const getPriorityGradient = (priority) => {
    const gradients = {
      urgent: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)',
      high: 'linear-gradient(135deg, #FFA94D 0%, #FF8C42 100%)',
      normal: 'linear-gradient(135deg, #4DABF7 0%, #339AF0 100%)',
      low: 'linear-gradient(135deg, #A3BE8C 0%, #81C784 100%)'
    };
    return gradients[priority?.toLowerCase()] || gradients.normal;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      urgent: '⚠️',
      high: '📢',
      normal: 'ℹ️',
      low: '📌'
    };
    return icons[priority?.toLowerCase()] || 'ℹ️';
  };

  if (loading) return <Loader />;

  return (
    <div className="manage-announcements-modern">
      {/* Top Bar */}
      <div className="manage-top-bar">
        <div className="top-bar-left">
          <button className="back-btn" onClick={() => navigate('/messaging')}>
            <i className="fas fa-arrow-left"></i>
            <span>Back</span>
          </button>
          <div className="page-title-section">
            <h1>📢 Manage Announcements</h1>
            <p className="page-subtitle">Create and manage company-wide announcements</p>
          </div>
        </div>
        {!showForm && (
          <button className="create-announcement-btn" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus"></i>
            <span>Create Announcement</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert-banner error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div className="alert-banner success">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="form-modal-overlay" onClick={handleCancelForm}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h2>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h2>
              <button className="modal-close" onClick={handleCancelForm}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="announcement-form-modern">
              <div className="form-grid">
                <div className="form-field full-width">
                  <label htmlFor="title">Announcement Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-input"
                    placeholder="Enter announcement title..."
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="priority">Priority Level</label>
                  <div className="priority-selector">
                    {['low', 'normal', 'high', 'urgent'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`priority-option ${formData.priority === p ? 'active' : ''}`}
                        style={{
                          '--priority-color': getPriorityColor(p),
                          background: formData.priority === p ? getPriorityGradient(p) : 'white'
                        }}
                        onClick={() => setFormData({ ...formData, priority: p })}
                      >
                        <span className="priority-emoji">{getPriorityIcon(p)}</span>
                        <span className="priority-name">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-field full-width">
                  <label htmlFor="content">Announcement Content *</label>
                  <textarea
                    id="content"
                    name="content"
                    className="form-textarea"
                    rows="8"
                    placeholder="Write your announcement here..."
                    value={formData.content}
                    onChange={handleChange}
                    required
                  />
                  <div className="char-count">{formData.content.length} characters</div>
                </div>
              </div>

              <div className="form-modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancelForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                  style={{ background: getPriorityGradient(formData.priority) }}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      <span>{editingId ? 'Update Announcement' : 'Publish Announcement'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card-modern">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <i className="fas fa-bullhorn"></i>
          </div>
          <div className="stat-info">
            <div className="stat-number">{announcements.length}</div>
            <div className="stat-label">Total Announcements</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <div className="stat-number">
              {announcements.filter(a => a.priority === 'urgent').length}
            </div>
            <div className="stat-label">Urgent</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FFA94D 0%, #FF8C42 100%)' }}>
            <i className="fas fa-flag"></i>
          </div>
          <div className="stat-info">
            <div className="stat-number">
              {announcements.filter(a => a.priority === 'high').length}
            </div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4DABF7 0%, #339AF0 100%)' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <div className="stat-number">
              {announcements.filter(a => {
                const date = new Date(a.created_at);
                const today = new Date();
                const diffTime = Math.abs(today - date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length}
            </div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
      </div>

      {/* Announcements Grid */}
      <div className="announcements-management-grid">
        {announcements.length === 0 ? (
          <div className="empty-state-manage">
            <div className="empty-illustration">
              <i className="fas fa-bullhorn"></i>
            </div>
            <h3>No Announcements Yet</h3>
            <p>Create your first announcement to get started</p>
            <button className="btn-create-first" onClick={() => setShowForm(true)}>
              <i className="fas fa-plus"></i>
              Create First Announcement
            </button>
          </div>
        ) : (
          announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className="manage-announcement-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div 
                className="card-accent-bar"
                style={{ background: getPriorityGradient(announcement.priority) }}
              />

              <div className="card-content">
                <div className="card-header-row">
                  <div 
                    className="priority-badge-manage"
                    style={{ 
                      background: getPriorityGradient(announcement.priority),
                      boxShadow: `0 4px 12px ${getPriorityColor(announcement.priority)}40`
                    }}
                  >
                    <span>{getPriorityIcon(announcement.priority)}</span>
                    <span>{announcement.priority?.toUpperCase()}</span>
                  </div>

                  <div className="card-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(announcement)}
                      title="Edit announcement"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(announcement.id)}
                      title="Delete announcement"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <h3 className="card-title">{announcement.title}</h3>
                
                <p className="card-content-text">
                  {announcement.content.substring(0, 200)}
                  {announcement.content.length > 200 && '...'}
                </p>

                <div className="card-footer-row">
                  <div className="author-info-manage">
                    <div 
                      className="author-avatar-manage"
                      style={{ background: getPriorityGradient(announcement.priority) }}
                    >
                      {announcement.sender_details?.first_name?.[0]?.toUpperCase() || 'H'}
                    </div>
                    <div className="author-text">
                      <div className="author-name-manage">
                        {announcement.sender_details?.full_name || 'HR Department'}
                      </div>
                      <div className="author-role-manage">
                        {announcement.sender_details?.role || 'Human Resources'}
                      </div>
                    </div>
                  </div>

                  <div className="date-info-manage">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(announcement.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageAnnouncements;
