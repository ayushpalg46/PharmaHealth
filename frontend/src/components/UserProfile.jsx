import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

export default function UserProfile({ currentUser, onUpdateUser, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.roles?.includes('ROLE_PHARMACIST');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getMyProfile();
        setProfile(res.data);
        setFullName(res.data.fullName || '');
        setPhone(res.data.phone || '');
        setAddress(res.data.address || '');
      } catch (err) {
        console.error(err);
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
      const res = await userService.updateProfile({ fullName, phone, address });
      setProfile(res.data);
      setMessage('Profile updated successfully!');
      if (onUpdateUser) {
        onUpdateUser(res.data);
      }
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container py-4">
      {/* Header Profile Banner */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="bg-primary text-white p-4 p-md-5 position-relative">
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center shadow-lg border border-2 border-info"
              style={{ width: '90px', height: '90px', fontSize: '2.5rem', backgroundColor: '#07271e', color: '#38bdf8' }}
            >
              <i className={isAdmin ? 'bi bi-shield-check' : 'bi bi-person'}></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h3 className="fw-bold mb-0 text-white">{profile?.fullName || currentUser.username}</h3>
                <span className={`badge ${isAdmin ? 'bg-warning text-dark' : 'bg-info text-white'}`}>
                  {isAdmin ? 'Staff / Administrator' : 'Verified Patient / Customer'}
                </span>
              </div>
              <p className="mb-0 text-white-50 small">
                <i className="bi bi-envelope me-1 text-info"></i>{profile?.email || currentUser.email} • 
                <span className="ms-2">Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Role Quick Statistics */}
        <div className="card-body p-4" style={{ backgroundColor: 'rgba(4, 26, 20, 0.7)' }}>
          <div className="row g-3 text-center">
            {isAdmin ? (
              <>
                <div className="col-4 border-end border-secondary border-opacity-25">
                  <div className="fw-bold fs-4 text-info">Enterprise</div>
                  <div className="small text-muted">Role Permission Level</div>
                </div>
                <div className="col-4 border-end border-secondary border-opacity-25">
                  <div className="fw-bold fs-4 text-white">Full Access</div>
                  <div className="small text-muted">Inventory & Dispatch</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold fs-4 text-success">Enabled</div>
                  <div className="small text-muted">Audit & Billing Management</div>
                </div>
              </>
            ) : (
              <>
                <div className="col-4 border-end border-secondary border-opacity-25">
                  <div className="fw-bold fs-4 text-info">Active</div>
                  <div className="small text-muted">Prescription Account</div>
                </div>
                <div className="col-4 border-end border-secondary border-opacity-25">
                  <div className="fw-bold fs-4 text-success">Verified</div>
                  <div className="small text-muted">Delivery Address</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold fs-4 text-info">24/7</div>
                  <div className="small text-muted">Pharmacist Access</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-3 text-white">
              <i className="bi bi-gear text-info me-2"></i>Account & Contact Information
            </h5>

            {message && <div className="alert alert-success py-2 small">{message}</div>}
            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleSave}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-white">Username</label>
                  <input type="text" className="form-control" value={currentUser.username} disabled />
                  <div className="form-text small">System username cannot be modified.</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-white">Email Address</label>
                  <input type="email" className="form-control" value={currentUser.email} disabled />
                  <div className="form-text small">Registered login email identifier.</div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Full Legal Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-white">Primary Contact Phone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+91 98765 43210" 
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-white">Default Shipping / Clinical Address</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Street, Suite / Apartment, City, State, Postal Code"
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={saving}>
                  {saving ? 'Updating...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security & Action Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-bold mb-3 text-white">
              <i className="bi bi-shield-lock text-info me-2"></i>Security & Session
            </h6>
            <div className="small text-muted mb-3">
              Your session is authenticated via <strong className="text-white">JSON Web Token (JWT)</strong> with stateless verification.
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>
                <i className="bi bi-box-arrow-right me-1"></i> Terminate Session & Sign Out
              </button>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <h6 className="fw-bold mb-2 text-info">
              <i className="bi bi-patch-check-fill me-1"></i>Compliance & Privacy
            </h6>
            <p className="small mb-0 text-white">
              PharmaHealth is compliant with electronic medical records and pharmaceutical traceability guidelines. All patient data is encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
