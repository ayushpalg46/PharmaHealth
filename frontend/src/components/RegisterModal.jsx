import React, { useState } from 'react';

export default function RegisterModal({ isOpen, onClose, onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    role: 'customer'
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
        roles: [formData.role]
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
              <i className="bi bi-person-plus me-2"></i>Create PharmaHealth Account
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
                  <label className="form-label small fw-semibold">Full Legal Name</label>
                  <input type="text" className="form-control" name="fullName" required value={formData.fullName} onChange={handleChange} />
                </div>
              </div>

              <div className="row g-2 mb-2">
                <div className="col-7">
                  <label className="form-label small fw-semibold">Email</label>
                  <input type="email" className="form-control" name="email" required value={formData.email} onChange={handleChange} />
                </div>
                <div className="col-5">
                  <label className="form-label small fw-semibold">Register As</label>
                  <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                    <option value="customer">Customer POV</option>
                    <option value="admin">Admin POV</option>
                  </select>
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold">Password</label>
                <input type="password" className="form-control" name="password" required value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Contact Phone</label>
                  <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Delivery Address</label>
                  <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary text-white w-100 py-2 fw-semibold" disabled={loading}>
                {loading ? 'Creating...' : 'Register Account'}
              </button>
            </div>
          </form>
          <div className="modal-footer justify-content-center bg-light small">
            <span>Already have an account? </span>
            <button className="btn btn-link p-0 small fw-semibold" onClick={() => { onClose(); onSwitchToLogin(); }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
