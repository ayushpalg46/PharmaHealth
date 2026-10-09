import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MedicineList from './components/MedicineList';
import DeliveryTracker from './components/DeliveryTracker';
import CustomerOrders from './components/CustomerOrders';
import CustomerSupport from './components/CustomerSupport';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CartModal from './components/CartModal';
import PrescriptionUploadModal from './components/PrescriptionUploadModal';
import { authService, medicineService, orderService, prescriptionService } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.roles?.includes('ROLE_PHARMACIST');
  const [currentView, setCurrentView] = useState(isAdmin ? 'admin' : 'store'); // 'store' | 'tracker' | 'orders' | 'support' | 'admin' | 'profile'
  const [adminTab, setAdminTab] = useState('deliveries');
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);

  // Load Catalog Data
  const fetchCatalog = async () => {
    try {
      const [medRes, catRes] = await Promise.all([
        medicineService.getMedicines(selectedCategory, searchTerm),
        medicineService.getCategories()
      ]);
      setMedicines(medRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    }
  };

  const fetchUserOrders = async () => {
    if (currentUser) {
      try {
        const res = await orderService.getMyOrders();
        setMyOrders(res.data);
      } catch (err) {
        console.error('Error fetching user orders:', err);
      }
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchUserOrders();
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = async (username, password) => {
    const res = await authService.login(username, password);
    const data = res.data;
    localStorage.setItem('pharma_token', data.accessToken);
    localStorage.setItem('pharma_user', JSON.stringify(data));
    setCurrentUser(data);

    // Auto-navigate to respective POV
    if (data.roles?.includes('ROLE_ADMIN') || data.roles?.includes('ROLE_PHARMACIST')) {
      setCurrentView('admin');
    } else {
      setCurrentView('store');
    }
  };

  const handleRegister = async (formData) => {
    await authService.register(formData);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('store');
    setMyOrders([]);
  };

  // Cart Handlers
  const handleAddToCart = (medicine) => {
    setCart((prev) => {
      const existing = prev.find(item => item.medicine.id === medicine.id);
      if (existing) {
        return prev.map(item =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { medicine, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (medicineId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(medicineId);
    } else {
      setCart((prev) =>
        prev.map(item =>
          item.medicine.id === medicineId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (medicineId) => {
    setCart((prev) => prev.filter(item => item.medicine.id !== medicineId));
  };

  const handleCheckout = async (orderPayload) => {
    const res = await orderService.placeOrder(orderPayload);
    setCart([]);
    fetchCatalog(); // refresh stock
    fetchUserOrders();
    // Prompt to track the new order
    setCurrentView('tracker');
  };

  const handlePrescriptionUpload = async (payload) => {
    await prescriptionService.uploadPrescription(payload);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartTotalCount}
        onOpenPrescription={() => setIsPrescriptionOpen(true)}
        onViewChange={setCurrentView}
        currentView={currentView}
        adminTab={adminTab}
        onAdminTabChange={setAdminTab}
      />

      {/* Main Content Area */}
      <main className="flex-grow-1">
        {/* VIEW 1: MEDICINES STORE */}
        {currentView === 'store' && (
          <>
            <div className="bg-primary text-white py-5 text-center shadow-sm">
              <div className="container">
                <span className="badge bg-white text-primary mb-2 px-3 py-1 fw-bold">ONLINE PHARMACY & SUPPLIES</span>
                <h1 className="fw-bolder display-5 mb-2">Authentic Medicines & Clinical Care</h1>
                <p className="lead mb-0 text-white-50">
                  Search through thousands of laboratory-tested medications, vitamins, and healthcare supplies.
                </p>
              </div>
            </div>

            <MedicineList
              medicines={medicines}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onAddToCart={handleAddToCart}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </>
        )}

        {/* VIEW 2: DELIVERY TRACKER */}
        {currentView === 'tracker' && (
          <DeliveryTracker
            orders={myOrders}
            onSelectOrder={() => {}}
          />
        )}

        {/* VIEW 3: CUSTOMER ORDERS & BILLS */}
        {currentView === 'orders' && (
          <CustomerOrders
            currentUser={currentUser}
            onTrackOrder={() => setCurrentView('tracker')}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {/* VIEW 4: CUSTOMER SUPPORT */}
        {currentView === 'support' && (
          <CustomerSupport
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {/* VIEW 5: USER PROFILE (FOR BOTH ADMIN AND CUSTOMER) */}
        {currentView === 'profile' && (
          <UserProfile
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        {/* VIEW 6: ADMIN CONTROL CENTER */}
        {currentView === 'admin' && (
          <AdminDashboard
            categories={categories}
            onRefreshMedicines={fetchCatalog}
            activeTab={adminTab}
            onTabChange={setAdminTab}
          />
        )}
      </main>

      <Footer />

      {/* Unified Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        onSwitchToRegister={() => setIsRegisterOpen(true)}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={handleRegister}
        onSwitchToLogin={() => setIsLoginOpen(true)}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
        currentUser={currentUser}
      />

      <PrescriptionUploadModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        onUpload={handlePrescriptionUpload}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
    </div>
  );
}
