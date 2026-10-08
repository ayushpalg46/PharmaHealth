import React from 'react';

export default function Navbar({ currentUser, onLogout, onOpenLogin, onOpenRegister, onOpenCart, cartCount, onOpenPrescription, onViewChange, currentView }) {
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.roles?.includes('ROLE_PHARMACIST');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-2" href="#" onClick={(e) => { e.preventDefault(); onViewChange('store'); }}>
          <span className="badge bg-primary p-2 rounded-3 fs-5">
            <i className="bi bi-capsule"></i>
          </span>
          <span className="fw-bold tracking-tight fs-4">Pharma<span className="text-info">Health</span></span>
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <button 
                className={`btn btn-link nav-link ${currentView === 'store' ? 'active text-info fw-semibold' : ''}`}
                onClick={() => onViewChange('store')}
              >
                <i className="bi bi-shop me-1"></i> Medicines
              </button>
            </li>
            <li className="nav-item">
              <button 
                className="btn btn-link nav-link"
                onClick={onOpenPrescription}
              >
                <i className="bi bi-file-earmark-medical me-1"></i> Upload Rx
              </button>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <button 
                  className={`btn btn-link nav-link ${currentView === 'admin' ? 'active text-warning fw-semibold' : ''}`}
                  onClick={() => onViewChange('admin')}
                >
                  <i className="bi bi-speedometer2 me-1"></i> Staff Portal
                </button>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-light position-relative" onClick={onOpenCart}>
              <i className="bi bi-cart3"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="dropdown">
                <button className="btn btn-primary dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle"></i>
                  <span>{currentUser.username}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li className="dropdown-header">Logged in as {currentUser.email}</li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={onLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-outline-light btn-sm px-3" onClick={onOpenLogin}>Sign In</button>
                <button className="btn btn-info btn-sm px-3 text-white fw-semibold" onClick={onOpenRegister}>Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
