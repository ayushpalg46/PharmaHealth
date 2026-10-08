import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(username, password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-shield-lock me-2"></i>Sign In to PharmaHealth
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              
              <div className="mb-3">
                <label className="form-label small fw-semibold">Username</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="e.g. admin or johndoe"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>

              <div className="small text-muted bg-light p-2 rounded mb-3">
                <strong>Demo Accounts:</strong><br/>
                • Admin: <code>admin</code> / <code>password123</code><br/>
                • Customer: <code>johndoe</code> / <code>password123</code>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
          <div className="modal-footer justify-content-center bg-light small">
            <span>Don't have an account? </span>
            <button className="btn btn-link p-0 small" onClick={() => { onClose(); onSwitchToRegister(); }}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
