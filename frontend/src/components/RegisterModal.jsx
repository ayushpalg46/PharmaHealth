import React, { useState } from 'react';

export default function RegisterModal({ isOpen, onClose, onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await onRegister(formData);
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => {
        onClose();
        onSwitchToLogin();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-person-plus me-2"></i>Create Patient Account
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              {success && <div className="alert alert-success py-2 small">{success}</div>}

              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Username</label>
                  <input type="text" className="form-control" name="username" required value={formData.username} onChange={handleChange} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input type="text" className="form-control" name="fullName" required value={formData.fullName} onChange={handleChange} />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold">Email Address</label>
                <input type="email" className="form-control" name="email" required value={formData.email} onChange={handleChange} />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold">Password</label>
                <input type="password" className="form-control" name="password" required value={formData.password} onChange={handleChange} />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Phone Number</label>
                  <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Delivery Address</label>
                  <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} />
                </div>
              </div>

              <button type="submit" className="btn btn-info text-white w-100 py-2 fw-semibold" disabled={loading}>
                {loading ? 'Creating...' : 'Register Account'}
              </button>
            </div>
          </form>
          <div className="modal-footer justify-content-center bg-light small">
            <span>Already have an account? </span>
            <button className="btn btn-link p-0 small" onClick={() => { onClose(); onSwitchToLogin(); }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
