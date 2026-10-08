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
      setError(err.response?.data?.message || 'Invalid username or password. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-shield-lock text-info me-2"></i>Sign In to PharmaHealth
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

              {/* Quick Demo Switcher */}
              <div className="bg-light p-3 rounded-3 mb-3 border">
                <div className="small fw-bold text-muted mb-2">Instant Role Demo Logins:</div>
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-warning btn-sm text-dark flex-grow-1"
                    onClick={() => handleQuickFill('admin', 'password123')}
                  >
                    <i className="bi bi-shield-fill me-1"></i> Admin POV
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-primary btn-sm flex-grow-1"
                    onClick={() => handleQuickFill('johndoe', 'password123')}
                  >
                    <i className="bi bi-person-fill me-1"></i> Customer POV
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading ? 'Authenticating with JWT...' : 'Sign In'}
              </button>
            </div>
          </form>
          <div className="modal-footer justify-content-center bg-light small">
            <span>Don't have an account? </span>
            <button className="btn btn-link p-0 small fw-semibold" onClick={() => { onClose(); onSwitchToRegister(); }}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
