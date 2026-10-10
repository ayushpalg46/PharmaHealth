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
  currentView,
  adminTab,
  onAdminTabChange
}) {
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.roles?.includes('ROLE_PHARMACIST');

  const handleAdminNav = (tabKey) => {
    if (onAdminTabChange) onAdminTabChange(tabKey);
    onViewChange('admin');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow py-3">
      <div className="container">
        {/* Brand */}
        <a 
          className="navbar-brand d-flex align-items-center gap-2" 
          href="#" 
          onClick={(e) => { 
            e.preventDefault(); 
            if (isAdmin) {
              handleAdminNav('customers');
            } else {
              onViewChange('store'); 
            }
          }}
        >
          <span className={`badge ${isAdmin ? 'bg-warning text-dark' : 'bg-primary'} p-2 rounded-3 fs-5`}>
            <i className={isAdmin ? "bi bi-shield-lock-fill" : "bi bi-capsule"}></i>
          </span>
          <div className="d-flex flex-column">
            <span className="fw-bold tracking-tight fs-4 text-white lh-1">
              Pharma<span className="text-info">Health</span>
            </span>
            {isAdmin && (
              <span className="text-warning small fw-bold tracking-widest mt-1" style={{ fontSize: '0.65rem' }}>
                ADMIN CONTROL CENTER
              </span>
            )}
          </div>
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#pharmaNavbar">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="pharmaNavbar">
          <div className="mx-auto my-2 my-lg-0">
            <div className="nav-tabs-bar">
              {/* ADMIN-ONLY NAVIGATION */}
              {isAdmin ? (
                <>
                  <button 
                    className={`nav-pill-btn ${currentView === 'admin' && adminTab === 'customers' ? 'active' : ''}`}
                    onClick={() => handleAdminNav('customers')}
                  >
                    <i className="bi bi-people-fill text-info"></i>
                    <span>Customers</span>
                  </button>
                  <button 
                    className={`nav-pill-btn ${currentView === 'admin' && adminTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => handleAdminNav('inventory')}
                  >
                    <i className="bi bi-boxes text-info"></i>
                    <span>Inventory</span>
                  </button>
                  <button 
                    className={`nav-pill-btn ${currentView === 'admin' && adminTab === 'billing' ? 'active' : ''}`}
                    onClick={() => handleAdminNav('billing')}
                  >
                    <i className="bi bi-cash-coin text-info"></i>
                    <span>Bills &amp; Payments</span>
                  </button>
                  <button 
                    className={`nav-pill-btn ${currentView === 'admin' && adminTab === 'support' ? 'active' : ''}`}
                    onClick={() => handleAdminNav('support')}
                  >
                    <i className="bi bi-chat-heart text-info"></i>
                    <span>Support</span>
                  </button>
                  <button 
                    className={`nav-pill-btn ${currentView === 'admin' && adminTab === 'prescriptions' ? 'active' : ''}`}
                    onClick={() => handleAdminNav('prescriptions')}
                  >
                    <i className="bi bi-file-earmark-medical text-info"></i>
                    <span>Prescriptions</span>
                  </button>
                  <button 
                    className={`nav-pill-btn position-relative ${currentView === 'admin' && adminTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => handleAdminNav('notifications')}
                  >
                    <i className="bi bi-bell-fill text-warning"></i>
                    <span>Notifications</span>
                  </button>
                </>
              ) : (
                /* CUSTOMER / GUEST NAVIGATION */
                <>
                  <button 
                    className={`nav-pill-btn ${currentView === 'store' ? 'active' : ''}`}
                    onClick={() => onViewChange('store')}
                  >
                    <i className="bi bi-shop text-info"></i>
                    <span>Medicines</span>
                  </button>

                  {currentUser && (
                    <button 
                      className={`nav-pill-btn ${currentView === 'orders' ? 'active' : ''}`}
                      onClick={() => onViewChange('orders')}
                    >
                      <i className="bi bi-receipt-cutoff text-info"></i>
                      <span>My Orders</span>
                    </button>
                  )}

                  <button 
                    className={`nav-pill-btn ${currentView === 'support' ? 'active' : ''}`}
                    onClick={() => onViewChange('support')}
                  >
                    <i className="bi bi-chat-heart text-info"></i>
                    <span>Support</span>
                  </button>

                  <button 
                    className="nav-pill-btn"
                    onClick={onOpenPrescription}
                  >
                    <i className="bi bi-cloud-arrow-up text-info"></i>
                    <span>Upload Rx</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Action Items */}
          <div className="d-flex align-items-center gap-3">
            {/* Customer Cart Button (Hidden for Admin) */}
            {!isAdmin && (
              <button className="btn btn-outline-light position-relative" onClick={onOpenCart} title="Shopping Basket">
                <i className="bi bi-cart3"></i>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile & Auth */}
            {currentUser ? (
              <div className="d-flex align-items-center gap-2">
                <button 
                  className={`btn btn-sm d-flex align-items-center gap-2 ${currentView === 'profile' ? 'btn-info text-white' : 'btn-outline-info'}`}
                  onClick={() => onViewChange('profile')}
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{currentUser.username || 'Profile'}</span>
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
