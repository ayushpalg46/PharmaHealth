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

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-dark text-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <img src="/perLogo.png" alt="PharmaHealth" style={{ height: '32px', width: 'auto' }} className="rounded-2" />
              <h5 className="modal-title fw-bold mb-0">Sign In to PharmaHealth</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              
              <div className="mb-3">
                <label className="form-label small fw-semibold">Username or Email</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter your username"
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" className="btn btn-primary text-white w-100 py-2 fw-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
          <div className="modal-footer justify-content-center bg-light small py-3">
            <span className="text-muted">Don't have a customer account? </span>
            <button className="btn btn-link p-0 small fw-semibold text-primary" onClick={() => { onClose(); onSwitchToRegister(); }}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
