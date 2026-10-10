import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

export default function UserProfile({ currentUser, onUpdateUser, onLogout }) {
  const [profile, setProfile] = useState(null);
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
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      {/* Top Profile Header Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: 'rgba(5, 38, 30, 0.85)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center shadow-sm text-info"
              style={{
                width: '64px',
                height: '64px',
                fontSize: '1.8rem',
                backgroundColor: '#032018',
                border: '2px solid rgba(56, 189, 248, 0.4)'
              }}
            >
              <i className={isAdmin ? 'bi bi-shield-lock-fill' : 'bi bi-person-fill'}></i>
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-white">{fullName || profile?.fullName || currentUser.username}</h4>
              <div className="text-white-50 small mt-1">
                <span>@{currentUser.username}</span>
                <span className="mx-2">•</span>
                <span>{currentUser.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-outline-danger btn-sm px-3 align-self-start align-self-sm-center"
            title="Log out of account"
          >
            <i className="bi bi-box-arrow-right me-1"></i> Sign Out
          </button>
        </div>
      </div>

      {/* Main Profile Form Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5" style={{ backgroundColor: 'rgba(5, 38, 30, 0.7)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
        <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom border-secondary border-opacity-25">
          <div>
            <h5 className="fw-bold mb-1 text-white">
              <i className="bi bi-person-lines-fill text-info me-2"></i>
              {isAdmin ? 'Admin Details' : 'Customer Details'}
            </h5>
            <p className="text-muted small mb-0">
              {isAdmin
                ? 'Manage your administrator contact and identifying details.'
                : 'Manage your customer contact details and delivery shipping address.'}
            </p>
          </div>
          {loading && (
            <div className="spinner-border spinner-border-sm text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
        </div>

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

            {/* 2. Email (Read-Only identifier) */}
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

          {/* 5. Address (ONLY rendered for Customers) */}
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

          <div className="d-flex justify-content-end pt-2">
            <button
              type="submit"
              className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2"
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
      </div>
    </div>
  );
}
