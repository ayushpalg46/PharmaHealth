import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

export default function UserProfile({ currentUser, onUpdateUser, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.roles?.includes('ROLE_PHARMACIST');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await userService.getMyProfile();
        setProfile(res.data);
        setFullName(res.data.fullName || '');
        setPhone(res.data.phone || '');
        setAddress(res.data.address || '');
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const handleStartEdit = () => {
    setFullName(profile?.fullName || '');
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
    setMessage('');
    setError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFullName(profile?.fullName || '');
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
    setError('');
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updateData = {
        fullName,
        phone,
        ...(isAdmin ? {} : { address })
      };
      const res = await userService.updateProfile(updateData);
      setProfile(res.data);
      setMessage('Profile updated successfully!');
      if (onUpdateUser) {
        onUpdateUser(res.data);
      }
      setIsEditing(false);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container py-4" style={{ maxWidth: '820px' }}>
      {/* Top Profile Header Banner */}
      <div 
        className="card border-0 shadow-sm rounded-4 p-4 mb-4" 
        style={{ 
          backgroundColor: '#0b1638', 
          border: '1px solid rgba(16, 185, 129, 0.3)' 
        }}
      >
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center shadow-sm text-white"
              style={{
                width: '64px',
                height: '64px',
                fontSize: '1.8rem',
                backgroundColor: '#071026',
                border: '2px solid rgba(16, 185, 129, 0.6)'
              }}
            >
              <i className={isAdmin ? 'bi bi-shield-lock-fill text-success' : 'bi bi-person-fill text-success'}></i>
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-white">
                {profile?.fullName || currentUser.username}
              </h4>
              <div className="text-white-50 small mt-1">
                <span>@{profile?.username || currentUser.username}</span>
                <span className="mx-2">•</span>
                <span>{profile?.email || currentUser.email}</span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 align-self-start align-self-sm-center">
            {!isEditing ? (
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 d-flex align-items-center gap-2 fw-semibold text-white"
                onClick={handleStartEdit}
              >
                <i className="bi bi-pencil-square"></i>
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            )}

            <button
              onClick={onLogout}
              className="btn btn-outline-danger btn-sm px-3"
              title="Log out of account"
            >
              <i className="bi bi-box-arrow-right me-1"></i> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card (Overview Mode or Edit Mode) */}
      <div 
        className="card border-0 shadow-sm rounded-4 p-4 p-md-5" 
        style={{ 
          backgroundColor: '#0b1638', 
          border: '1px solid rgba(16, 185, 129, 0.2)' 
        }}
      >
        {/* Card Header */}
        <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom border-secondary border-opacity-25">
          <div>
            <h5 className="fw-bold mb-1 text-white">
              <i className={`bi ${isEditing ? 'bi-pencil-fill text-warning' : 'bi-person-badge text-success'} me-2`}></i>
              {isEditing 
                ? (isAdmin ? 'Edit Admin Profile' : 'Edit Customer Profile') 
                : (isAdmin ? 'Admin Profile Overview' : 'Customer Profile Overview')}
            </h5>
            <p className="text-muted small mb-0">
              {isEditing
                ? 'Update your personal details below and click Save Changes.'
                : 'View your account details and contact information.'}
            </p>
          </div>
          {loading && (
            <div className="spinner-border spinner-border-sm text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {message && (
          <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-4">
            <i className="bi bi-check-circle-fill"></i>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-4">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* VIEW 1: PROFILE OVERVIEW (READ-ONLY CLEAN TILES) */}
        {/* ------------------------------------------------ */}
        {!isEditing ? (
          <div className="row g-3">
            {/* 1. Name */}
            <div className="col-md-6">
              <div 
                className="p-3 rounded-3 h-100" 
                style={{ backgroundColor: '#071026', border: '1px solid rgba(16, 185, 129, 0.25)' }}
              >
                <div className="d-flex align-items-center gap-2 text-success small mb-1 fw-semibold">
                  <i className="bi bi-person"></i>
                  <span>Full Name</span>
                </div>
                <div className="fs-6 fw-bold text-white">
                  {profile?.fullName || <span className="text-muted fw-normal">Not specified</span>}
                </div>
              </div>
            </div>

            {/* 2. Email Address */}
            <div className="col-md-6">
              <div 
                className="p-3 rounded-3 h-100" 
                style={{ backgroundColor: '#071026', border: '1px solid rgba(16, 185, 129, 0.25)' }}
              >
                <div className="d-flex align-items-center gap-2 text-success small mb-1 fw-semibold">
                  <i className="bi bi-envelope"></i>
                  <span>Email Address</span>
                </div>
                <div className="fs-6 fw-bold text-white">
                  {profile?.email || currentUser.email || <span className="text-muted fw-normal">N/A</span>}
                </div>
              </div>
            </div>

            {/* 3. Username */}
            <div className="col-md-6">
              <div 
                className="p-3 rounded-3 h-100" 
                style={{ backgroundColor: '#071026', border: '1px solid rgba(16, 185, 129, 0.25)' }}
              >
                <div className="d-flex align-items-center gap-2 text-success small mb-1 fw-semibold">
                  <i className="bi bi-at"></i>
                  <span>Username</span>
                </div>
                <div className="fs-6 fw-bold text-white">
                  @{profile?.username || currentUser.username}
                </div>
              </div>
            </div>

            {/* 4. Phone Number */}
            <div className="col-md-6">
              <div 
                className="p-3 rounded-3 h-100" 
                style={{ backgroundColor: '#071026', border: '1px solid rgba(16, 185, 129, 0.25)' }}
              >
                <div className="d-flex align-items-center gap-2 text-success small mb-1 fw-semibold">
                  <i className="bi bi-telephone"></i>
                  <span>Phone Number</span>
                </div>
                <div className="fs-6 fw-bold text-white">
                  {profile?.phone || <span className="text-muted fw-normal">Not provided</span>}
                </div>
              </div>
            </div>

            {/* 5. Address (ONLY for Customer) */}
            {!isAdmin && (
              <div className="col-12">
                <div 
                  className="p-3 rounded-3" 
                  style={{ backgroundColor: '#071026', border: '1px solid rgba(16, 185, 129, 0.25)' }}
                >
                  <div className="d-flex align-items-center gap-2 text-success small mb-1 fw-semibold">
                    <i className="bi bi-geo-alt"></i>
                    <span>Delivery Address</span>
                  </div>
                  <div className="fs-6 text-white" style={{ whiteSpace: 'pre-line' }}>
                    {profile?.address || <span className="text-muted">No delivery address provided</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --------------------------------------------- */
          /* VIEW 2: PROFILE EDIT FORM                     */
          /* --------------------------------------------- */
          <form onSubmit={handleSave}>
            <div className="row g-3 mb-3">
              {/* 1. Name */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-white">
                  <i className="bi bi-person me-1 text-info"></i> Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* 2. Email Address (Read-Only identifier) */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-white">
                  <i className="bi bi-envelope me-1 text-info"></i> Email Address
                </label>
                <input
                  type="email"
                  className="form-control text-muted"
                  value={profile?.email || currentUser.email || ''}
                  disabled
                  readOnly
                />
              </div>

              {/* 3. Username (Read-Only identifier) */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-white">
                  <i className="bi bi-at me-1 text-info"></i> Username
                </label>
                <input
                  type="text"
                  className="form-control text-muted"
                  value={profile?.username || currentUser.username || ''}
                  disabled
                  readOnly
                />
              </div>

              {/* 4. Phone Number */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-white">
                  <i className="bi bi-telephone me-1 text-info"></i> Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* 5. Address (ONLY for Customer) */}
            {!isAdmin && (
              <div className="mb-4">
                <label className="form-label small fw-semibold text-white">
                  <i className="bi bi-geo-alt me-1 text-info"></i> Delivery Address <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat/House No., Street, City, State, Postal Pin Code"
                  required
                ></textarea>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 pt-2">
              <button
                type="button"
                className="btn btn-outline-secondary px-3 py-2 fw-semibold"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2 text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
