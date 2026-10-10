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
      await onRegister({
        ...formData,
        roles: ['ROLE_CUSTOMER']
      });
      setSuccess('Account created successfully! You can now sign in.');
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
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-person-plus me-2"></i>Create Customer Account
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
              {success && <div className="alert alert-success py-2 small mb-3">{success}</div>}

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Username <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    required
                    placeholder="e.g. johndoe"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Full Legal Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="fullName"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Contact Phone <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Delivery / Shipping Address <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  name="address"
                  rows="2"
                  required
                  placeholder="Flat/House No., Street, Area, City, Pin Code"
                  value={formData.address}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary text-white w-100 py-2 fw-semibold mt-2" disabled={loading}>
                {loading ? 'Creating Customer Account...' : 'Register Customer Account'}
              </button>
            </div>
          </form>
          <div className="modal-footer justify-content-center bg-light small py-3">
            <span className="text-muted">Already have an account? </span>
            <button className="btn btn-link p-0 small fw-semibold text-primary" onClick={() => { onClose(); onSwitchToLogin(); }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
