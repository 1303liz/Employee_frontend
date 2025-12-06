import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import messagingService from '../../services/messagingService';
import { formatDate } from '../../utils/formatDate';
import './AnnouncementsElite.css';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filter, setFilter] = useState('all'); // all, urgent, high, normal, low

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getActiveAnnouncements();
      // Handle paginated response
      const data = Array.isArray(response) ? response : (response.results || []);
      setAnnouncements(data);
    } catch (error) {
      setError('Error loading announcements');
      setAnnouncements([]); // Set empty array on error
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return '#FF6B6B';
      case 'high':
        return '#FFA94D';
      case 'normal':
        return '#4DABF7';
      case 'low':
        return '#A3BE8C';
      default:
        return '#4DABF7';
    }
  };

  const getPriorityGradient = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)';
      case 'high':
        return 'linear-gradient(135deg, #FFA94D 0%, #FF8C42 100%)';
      case 'normal':
        return 'linear-gradient(135deg, #4DABF7 0%, #339AF0 100%)';
      case 'low':
        return 'linear-gradient(135deg, #A3BE8C 0%, #81C784 100%)';
      default:
        return 'linear-gradient(135deg, #4DABF7 0%, #339AF0 100%)';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return '⚠️';
      case 'high':
        return '📢';
      case 'normal':
        return 'ℹ️';
      case 'low':
        return '📌';
      default:
        return 'ℹ️';
    }
  };

  const getFilteredAnnouncements = () => {
    if (filter === 'all') return announcements;
    return announcements.filter(a => a.priority?.toLowerCase() === filter);
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  if (loading) {
    return (
      <div className="announcements-elite-container">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-elite-container">
      {/* Sidebar */}
      <div className="announcements-sidebar">
        <div className="sidebar-header">
          <h2>📢 Announcements</h2>
          <p className="sidebar-subtitle">Stay informed with updates</p>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <h3 className="filter-title">Filter by Priority</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <span className="filter-icon">📋</span>
              <span>All</span>
              <span className="filter-count">{announcements.length}</span>
            </button>
            <button 
              className={`filter-btn ${filter === 'urgent' ? 'active' : ''}`}
              onClick={() => setFilter('urgent')}
              style={{ '--filter-color': '#FF6B6B' }}
            >
              <span className="filter-icon">⚠️</span>
              <span>Urgent</span>
              <span className="filter-count">
                {announcements.filter(a => a.priority?.toLowerCase() === 'urgent').length}
              </span>
            </button>
            <button 
              className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
              onClick={() => setFilter('high')}
              style={{ '--filter-color': '#FFA94D' }}
            >
              <span className="filter-icon">📢</span>
              <span>High</span>
              <span className="filter-count">
                {announcements.filter(a => a.priority?.toLowerCase() === 'high').length}
              </span>
            </button>
            <button 
              className={`filter-btn ${filter === 'normal' ? 'active' : ''}`}
              onClick={() => setFilter('normal')}
              style={{ '--filter-color': '#4DABF7' }}
            >
              <span className="filter-icon">ℹ️</span>
              <span>Normal</span>
              <span className="filter-count">
                {announcements.filter(a => a.priority?.toLowerCase() === 'normal').length}
              </span>
            </button>
            <button 
              className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
              onClick={() => setFilter('low')}
              style={{ '--filter-color': '#A3BE8C' }}
            >
              <span className="filter-icon">📌</span>
              <span>Low</span>
              <span className="filter-count">
                {announcements.filter(a => a.priority?.toLowerCase() === 'low').length}
              </span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="sidebar-stats">
          <div className="stat-card">
            <div className="stat-number">{announcements.length}</div>
            <div className="stat-label">Total Announcements</div>
          </div>
          <div className="stat-card">
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

      {/* Main Content */}
      <div className="announcements-main">
        <div className="main-header">
          <div>
            <h1>Company Announcements</h1>
            <p className="main-subtitle">
              {filter === 'all' 
                ? `Showing all ${filteredAnnouncements.length} announcements`
                : `Showing ${filteredAnnouncements.length} ${filter} priority announcements`}
            </p>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Announcements List */}
        <div className="announcements-list">
          {filteredAnnouncements.length === 0 ? (
            <div className="empty-announcements">
              <div className="empty-icon">📭</div>
              <h3>No announcements found</h3>
              <p>There are no {filter !== 'all' ? filter + ' priority' : ''} announcements at this time</p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement, index) => (
              <div
                key={announcement.id}
                className="announcement-elite-card"
                onClick={() => setSelectedAnnouncement(announcement)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className="announcement-accent"
                  style={{ background: getPriorityGradient(announcement.priority) }}
                />
                
                <div className="announcement-content-wrapper">
                  <div className="announcement-header-row">
                    <div 
                      className="announcement-priority-tag"
                      style={{ 
                        background: getPriorityGradient(announcement.priority),
                        boxShadow: `0 4px 12px ${getPriorityColor(announcement.priority)}40`
                      }}
                    >
                      <span>{getPriorityIcon(announcement.priority)}</span>
                      <span>{announcement.priority?.toUpperCase() || 'NORMAL'}</span>
                    </div>
                    <div className="announcement-date-tag">
                      <i className="fas fa-calendar-alt"></i>
                      {formatDate(announcement.created_at)}
                    </div>
                  </div>

                  <h3 className="announcement-card-title">{announcement.title}</h3>
                  
                  <p className="announcement-card-excerpt">
                    {announcement.content.substring(0, 180)}
                    {announcement.content.length > 180 && '...'}
                  </p>

                  <div className="announcement-footer-row">
                    <div className="announcement-author-info">
                      <div 
                        className="author-avatar-small"
                        style={{ background: getPriorityGradient(announcement.priority) }}
                      >
                        {announcement.sender_details?.first_name?.[0]?.toUpperCase() || 'H'}
                      </div>
                      <div className="author-details">
                        <div className="author-name-small">
                          {announcement.sender_details?.full_name || 'HR Department'}
                        </div>
                        <div className="author-role-small">
                          {announcement.sender_details?.role || 'Human Resources'}
                        </div>
                      </div>
                    </div>

                    <button className="read-more-arrow">
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <div className="announcement-modal-backdrop" onClick={() => setSelectedAnnouncement(null)}>
          <div className="announcement-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedAnnouncement(null)}>
              <i className="fas fa-times"></i>
            </button>

            <div 
              className="modal-header-section"
              style={{ background: getPriorityGradient(selectedAnnouncement.priority) }}
            >
              <div className="modal-priority-badge">
                <span>{getPriorityIcon(selectedAnnouncement.priority)}</span>
                <span>{selectedAnnouncement.priority?.toUpperCase() || 'NORMAL'}</span>
              </div>
              <h2 className="modal-title">{selectedAnnouncement.title}</h2>
            </div>

            <div className="modal-body-section">
              <div className="modal-meta-info">
                <div className="modal-author-card">
                  <div 
                    className="modal-author-avatar"
                    style={{ background: getPriorityGradient(selectedAnnouncement.priority) }}
                  >
                    {selectedAnnouncement.sender_details?.first_name?.[0]?.toUpperCase() || 'H'}
                  </div>
                  <div>
                    <div className="modal-author-name">
                      {selectedAnnouncement.sender_details?.full_name || 'HR Department'}
                    </div>
                    <div className="modal-author-role">
                      {selectedAnnouncement.sender_details?.role || 'Human Resources'}
                    </div>
                  </div>
                </div>
                <div className="modal-date-info">
                  <i className="fas fa-calendar-check"></i>
                  <span>Published {formatDate(selectedAnnouncement.created_at)}</span>
                </div>
              </div>

              <div className="modal-content-text">
                {selectedAnnouncement.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
              <label>Priority</label>
              <select
                className="form-control"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Content *</label>
              <textarea
                className="form-control"
                rows="5"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', content: '', priority: 'normal' });
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="announcements-list">
        {announcements.length === 0 ? (
          <div className="no-announcements">
            <i className="fas fa-bullhorn"></i>
            <p>No announcements yet</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`announcement-card card ${getPriorityClass(announcement.priority)}`}
            >
              <div className="announcement-header">
                <div className="announcement-priority">
                  <i className={`fas ${getPriorityIcon(announcement.priority)}`}></i>
                  <span className="priority-label">{announcement.priority}</span>
                </div>
                {user?.role === 'hr' && (
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(announcement.id)}
                    title="Delete announcement"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>

              <h3>{announcement.title}</h3>
              <p className="announcement-content">{announcement.content}</p>

              <div className="announcement-footer">
                <div className="announcement-author">
                  <i className="fas fa-user"></i>
                  <span>
                    {announcement.sender_details?.full_name || 
                     announcement.sender_details?.username || 
                     'HR'}
                  </span>
                </div>
                <div className="announcement-date">
                  <i className="fas fa-clock"></i>
                  <span>{formatDate(announcement.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
