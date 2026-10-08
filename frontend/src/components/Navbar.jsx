import React from 'react';

export default function Navbar({ 
  currentUser, 
  onLogout, 
  onOpenLogin, 
  onOpenRegister, 
  onOpenCart, 
  cartCount, 
  onOpenPrescription, 
  onViewChange, 
  currentView 
}) {
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.roles?.includes('ROLE_PHARMACIST');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow py-3">
      <div className="container">
        {/* Brand */}
        <a 
          className="navbar-brand d-flex align-items-center gap-2" 
          href="#" 
          onClick={(e) => { e.preventDefault(); onViewChange('store'); }}
        >
          <span className="badge bg-primary p-2 rounded-3 fs-5">
            <i className="bi bi-capsule"></i>
          </span>
          <span className="fw-bold tracking-tight fs-4 text-white">
            Pharma<span className="text-info">Health</span>
          </span>
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#pharmaNavbar">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="pharmaNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            {/* Catalog / Medicines */}
            <li className="nav-item">
              <button 
                className={`btn btn-link nav-link ${currentView === 'store' ? 'active text-info fw-semibold' : 'text-light text-opacity-75'}`}
                onClick={() => onViewChange('store')}
              >
                <i className="bi bi-shop me-1"></i> Medicines & Supplies
              </button>
            </li>

            {/* Delivery Tracking */}
            <li className="nav-item">
              <button 
                className={`btn btn-link nav-link ${currentView === 'tracker' ? 'active text-info fw-semibold' : 'text-light text-opacity-75'}`}
                onClick={() => onViewChange('tracker')}
              >
                <i className="bi bi-truck me-1"></i> Track Delivery
              </button>
            </li>

            {/* Customer Orders (for logged-in non-admins or customer POV) */}
            {currentUser && !isAdmin && (
              <li className="nav-item">
                <button 
                  className={`btn btn-link nav-link ${currentView === 'orders' ? 'active text-info fw-semibold' : 'text-light text-opacity-75'}`}
                  onClick={() => onViewChange('orders')}
                >
                  <i className="bi bi-receipt-cutoff me-1"></i> My Orders & Bills
                </button>
              </li>
            )}

            {/* Customer Support */}
            <li className="nav-item">
              <button 
                className={`btn btn-link nav-link ${currentView === 'support' ? 'active text-info fw-semibold' : 'text-light text-opacity-75'}`}
                onClick={() => onViewChange('support')}
              >
                <i className="bi bi-chat-heart me-1"></i> Customer Support
              </button>
            </li>

            {/* Upload Rx Prescription */}
            <li className="nav-item">
              <button 
                className="btn btn-link nav-link text-light text-opacity-75"
                onClick={onOpenPrescription}
              >
                <i className="bi bi-file-earmark-medical me-1"></i> Upload Rx
              </button>
            </li>

            {/* Admin Control Center POV */}
            {isAdmin && (
              <li className="nav-item">
                <button 
                  className={`btn btn-link nav-link ${currentView === 'admin' ? 'active text-warning fw-bold' : 'text-warning text-opacity-75'}`}
                  onClick={() => onViewChange('admin')}
                >
                  <i className="bi bi-speedometer2 me-1"></i> Admin Portal
                </button>
              </li>
            )}
          </ul>

          {/* Right Action Items */}
          <div className="d-flex align-items-center gap-3">
            {/* Cart Button */}
            <button className="btn btn-outline-light position-relative" onClick={onOpenCart}>
              <i className="bi bi-cart3"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile & Auth */}
            {currentUser ? (
              <div className="d-flex align-items-center gap-2">
                <button 
                  className={`btn btn-sm d-flex align-items-center gap-2 ${currentView === 'profile' ? 'btn-info text-white' : 'btn-outline-info'}`}
                  onClick={() => onViewChange('profile')}
                >
                  <i className="bi bi-person-circle"></i>
                  <span>Profile</span>
                  <span className={`badge ${isAdmin ? 'bg-warning text-dark' : 'bg-primary'}`}>
                    {isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </button>

                <button className="btn btn-outline-secondary btn-sm" onClick={onLogout} title="Sign Out">
                  <i className="bi bi-box-arrow-right"></i>
                </button>
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
