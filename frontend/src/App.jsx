import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MedicineList from './components/MedicineList';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CartModal from './components/CartModal';
import PrescriptionUploadModal from './components/PrescriptionUploadModal';
import AdminDashboard from './components/AdminDashboard';
import { authService, medicineService, orderService, prescriptionService } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [currentView, setCurrentView] = useState('store'); // 'store' | 'admin'
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);

  // Load Initial Data
  const fetchData = async () => {
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

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchTerm]);

  // Auth Handlers
  const handleLogin = async (username, password) => {
    const res = await authService.login(username, password);
    const data = res.data;
    localStorage.setItem('pharma_token', data.accessToken);
    localStorage.setItem('pharma_user', JSON.stringify(data));
    setCurrentUser(data);
  };

  const handleRegister = async (formData) => {
    await authService.register(formData);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('store');
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
    await orderService.placeOrder(orderPayload);
    setCart([]);
    fetchData(); // refresh stock
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
      />

      {/* Main Content Area */}
      <main className="flex-grow-1">
        {currentView === 'store' ? (
          <>
            {/* Hero Banner for Pharmacy */}
            <div className="bg-primary text-white py-5 text-center shadow-sm">
              <div className="container">
                <span className="badge bg-white text-primary mb-2 px-3 py-1 fw-bold">ONLINE PHARMACY</span>
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
        ) : (
          <AdminDashboard
            categories={categories}
            onRefreshMedicines={fetchData}
          />
        )}
      </main>

      <Footer />

      {/* Modals */}
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
