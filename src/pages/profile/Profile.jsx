import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import profileService from '../../services/profileService';
import Loader from '../../components/Loader';
import '../../index.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Profile data
  const [profile, setProfile] = useState(null);
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
  });
  
  // Photo upload
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Documents
  const [documents, setDocuments] = useState([]);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [documentData, setDocumentData] = useState({
    document_type: 'RESUME',
    document_name: '',
    document_file: null,
    description: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setProfileData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        date_of_birth: data.date_of_birth || '',
        address: data.address || '',
        emergency_contact_name: data.emergency_contact_name || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
        bio: data.bio || '',
      });
      setPhotoPreview(data.profile_photo_url);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const data = await profileService.getDocuments();
      setDocuments(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    console.log('=== Profile Submit Started ===');
    console.log('Profile data to submit:', profileData);
    console.log('Photo file:', photoFile);
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      
      // Add all profile fields that have changed
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== '' && profileData[key] !== null) {
          console.log(`Adding field: ${key} = ${profileData[key]}`);
          formData.append(key, profileData[key]);
        }
      });

      // Add photo if selected
      if (photoFile) {
        console.log('Adding photo file:', photoFile.name);
        formData.append('profile_photo', photoFile);
      }

      // Log FormData contents
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      console.log('Calling API...');
      const updatedProfile = await profileService.updateProfile(formData);
      console.log('Profile updated successfully:', updatedProfile);
      
      setProfile(updatedProfile);
      setPhotoPreview(updatedProfile.profile_photo_url);
      setPhotoFile(null);
      
      // Update user context if needed
      if (updateUser) {
        updateUser(updatedProfile);
      }
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('=== Profile Update Error ===');
      console.error('Error object:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Display specific error message
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message 
        || Object.values(err.response?.data || {})[0]?.[0]
        || 'Failed to update profile';
      
      setError(errorMessage);
    } finally {
      setSaving(false);
      console.log('=== Profile Submit Finished ===');
    }
  };

  const handleDocumentInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentData(prev => ({
        ...prev,
        document_file: file
      }));
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const formData = new FormData();
      formData.append('document_type', documentData.document_type);
      formData.append('document_name', documentData.document_name);
      formData.append('document_file', documentData.document_file);
      if (documentData.description) {
        formData.append('description', documentData.description);
      }

      await profileService.uploadDocument(formData);
      
      // Reset form
      setDocumentData({
        document_type: 'RESUME',
        document_name: '',
        document_file: null,
        description: '',
      });
      setShowDocumentForm(false);
      
      // Refresh documents list
      await fetchDocuments();
      
      setSuccess('Document uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      await profileService.deleteDocument(documentId);
      await fetchDocuments();
      setSuccess('Document deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and documents</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Profile Photo Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h2>Profile Photo</h2>
        </div>
        <div className="card-body">
          <div className="profile-photo-section">
            <div className="photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="profile-photo-img" />
              ) : (
                <div className="photo-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>
            <div className="photo-upload">
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoChange}
                className="file-input"
              />
              <label htmlFor="photo-upload" className="btn btn-secondary">
                <i className="fas fa-camera"></i> Choose Photo
              </label>
              {photoFile && (
                <p className="text-muted mt-2">Selected: {photoFile.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h2>Personal Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleProfileSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="first_name" className="form-label">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  className="form-control"
                  value={profileData.first_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="last_name" className="form-label">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  className="form-control"
                  value={profileData.last_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={profileData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="phone_number" className="form-label">Phone Number</label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  className="form-control"
                  value={profileData.phone_number}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  className="form-control"
                  value={profileData.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-control"
                  value={profileData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="emergency_contact_name" className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  className="form-control"
                  value={profileData.emergency_contact_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="emergency_contact_phone" className="form-label">Emergency Contact Phone</label>
                <input
                  type="text"
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  className="form-control"
                  value={profileData.emergency_contact_phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="bio" className="form-label">Bio</label>
              <textarea
                id="bio"
                name="bio"
                className="form-control"
                rows="4"
                value={profileData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>

            {profile && (
              <div className="read-only-info mb-3">
                <div className="row">
                  <div className="col-md-4">
                    <strong>Employee ID:</strong> {profile.employee_id || 'N/A'}
                  </div>
                  <div className="col-md-4">
                    <strong>Role:</strong> {profile.role}
                  </div>
                  <div className="col-md-4">
                    <strong>Department:</strong> {profile.department || 'N/A'}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-4">
                    <strong>Hire Date:</strong> {profile.hire_date || 'N/A'}
                  </div>
                  <div className="col-md-4">
                    <strong>Status:</strong> {profile.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Documents Section */}
      <div className="card">
        <div className="card-header">
          <h2>My Documents</h2>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowDocumentForm(!showDocumentForm)}
          >
            <i className="fas fa-plus"></i> Upload Document
          </button>
        </div>
        <div className="card-body">
          {showDocumentForm && (
            <div className="document-form mb-4">
              <form onSubmit={handleDocumentSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="document_type" className="form-label">Document Type</label>
                    <select
                      id="document_type"
                      name="document_type"
                      className="form-control"
                      value={documentData.document_type}
                      onChange={handleDocumentInputChange}
                      required
                    >
                      <option value="ID">Identification Document</option>
                      <option value="RESUME">Resume/CV</option>
                      <option value="CERTIFICATE">Certificate</option>
                      <option value="CONTRACT">Employment Contract</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="document_name" className="form-label">Document Name</label>
                    <input
                      type="text"
                      id="document_name"
                      name="document_name"
                      className="form-control"
                      value={documentData.document_name}
                      onChange={handleDocumentInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="document_file" className="form-label">Choose File</label>
                  <input
                    type="file"
                    id="document_file"
                    name="document_file"
                    className="form-control"
                    onChange={handleDocumentFileChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows="2"
                    value={documentData.description}
                    onChange={handleDocumentInputChange}
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Uploading...' : 'Upload Document'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary ml-2"
                    onClick={() => setShowDocumentForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {documents.length === 0 ? (
            <p className="text-muted">No documents uploaded yet.</p>
          ) : (
            <div className="documents-list">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <span className="badge badge-info">{doc.document_type}</span>
                      </td>
                      <td>{doc.document_name}</td>
                      <td>{doc.description || '-'}</td>
                      <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                      <td>
                        <a 
                          href={doc.document_file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary mr-2"
                        >
                          <i className="fas fa-download"></i> Download
                        </a>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
