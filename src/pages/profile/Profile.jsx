import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    bio: '',
    profile_photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDocument, setNewDocument] = useState({
    document_type: 'RESUME',
    document_name: '',
    document_file: null,
    description: ''
  });

  useEffect(() => {
    fetchProfileData();
    fetchDocuments();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accounts/profile/detail/');
      setProfileData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone_number: response.data.phone_number || '',
        date_of_birth: response.data.date_of_birth || '',
        address: response.data.address || '',
        emergency_contact_name: response.data.emergency_contact_name || '',
        emergency_contact_phone: response.data.emergency_contact_phone || '',
        bio: response.data.bio || '',
        profile_photo: null
      });
      if (response.data.profile_photo_url) {
        setPhotoPreview(response.data.profile_photo_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/accounts/profile/documents/');
      setDocuments(Array.isArray(response.data) ? response.data : response.data.results || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData(prev => ({ ...prev, profile_photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== '') {
          formData.append(key, profileData[key]);
        }
      });

      const response = await api.patch('/accounts/profile/update/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      if (response.data.profile_photo_url) {
        setPhotoPreview(response.data.profile_photo_url);
      }
      
      // Update auth context
      if (updateUser) {
        updateUser(response.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'document_file') {
      setNewDocument(prev => ({ ...prev, document_file: files[0] }));
    } else {
      setNewDocument(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!newDocument.document_file || !newDocument.document_name) {
      setMessage({ type: 'error', text: 'Please provide document name and file' });
      return;
    }

    try {
      setUploadingDoc(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('document_type', newDocument.document_type);
      formData.append('document_name', newDocument.document_name);
      formData.append('document_file', newDocument.document_file);
      if (newDocument.description) {
        formData.append('description', newDocument.description);
      }

      await api.post('/accounts/profile/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Document uploaded successfully!' });
      setNewDocument({
        document_type: 'RESUME',
        document_name: '',
        document_file: null,
        description: ''
      });
      document.getElementById('document_file').value = '';
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload document' 
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/accounts/profile/documents/${docId}/`);
      setMessage({ type: 'success', text: 'Document deleted successfully!' });
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      setMessage({ type: 'error', text: 'Failed to delete document' });
    }
  };

  const getDocumentIcon = (docType) => {
    const icons = {
      ID: '🪪',
      RESUME: '📄',
      CERTIFICATE: '🎓',
      CONTRACT: '📋',
      OTHER: '📎'
    };
    return icons[docType] || '📎';
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and documents</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-content">
        {/* Profile Photo Section */}
        <div className="profile-section photo-section">
          <h2>Profile Photo</h2>
          <div className="photo-upload">
            <div className="photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" />
              ) : (
                <div className="photo-placeholder">
                  <span>No Photo</span>
                </div>
              )}
            </div>
            <div className="photo-actions">
              <label htmlFor="profile_photo" className="btn btn-primary">
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </label>
              <input
                type="file"
                id="profile_photo"
                name="profile_photo"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <p className="help-text">JPG, PNG or GIF (Max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="profile-section">
          <h2>Personal Information</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={profileData.phone_number}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={profileData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergency_contact_name">Emergency Contact Name</label>
                <input
                  type="text"
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={profileData.emergency_contact_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
                <input
                  type="tel"
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  value={profileData.emergency_contact_phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Documents Section */}
        <div className="profile-section">
          <h2>Documents</h2>
          
          {/* Upload New Document */}
          <div className="document-upload">
            <h3>Upload New Document</h3>
            <form onSubmit={handleDocumentUpload}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="document_type">Document Type</label>
                  <select
                    id="document_type"
                    name="document_type"
                    value={newDocument.document_type}
                    onChange={handleDocumentChange}
                    required
                  >
                    <option value="ID">Identification Document</option>
                    <option value="RESUME">Resume/CV</option>
                    <option value="CERTIFICATE">Certificate</option>
                    <option value="CONTRACT">Employment Contract</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="document_name">Document Name</label>
                  <input
                    type="text"
                    id="document_name"
                    name="document_name"
                    value={newDocument.document_name}
                    onChange={handleDocumentChange}
                    placeholder="e.g., My Resume"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="document_file">Choose File</label>
                  <input
                    type="file"
                    id="document_file"
                    name="document_file"
                    onChange={handleDocumentChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newDocument.description}
                    onChange={handleDocumentChange}
                    rows="2"
                    placeholder="Add notes about this document..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={uploadingDoc}>
                  {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>

          {/* Document List */}
          <div className="documents-list">
            <h3>My Documents</h3>
            {documents.length === 0 ? (
              <p className="no-documents">No documents uploaded yet.</p>
            ) : (
              <div className="documents-grid">
                {documents.map(doc => (
                  <div key={doc.id} className="document-card">
                    <div className="document-icon">
                      {getDocumentIcon(doc.document_type)}
                    </div>
                    <div className="document-info">
                      <h4>{doc.document_name}</h4>
                      <p className="document-type">{doc.document_type}</p>
                      {doc.description && (
                        <p className="document-description">{doc.description}</p>
                      )}
                      <p className="document-date">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="document-actions">
                      <a
                        href={doc.document_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
