import React, { useState } from 'react';

export default function CartModal({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onCheckout, currentUser, onNavigateToOrders }) {
  const [shippingAddress, setShippingAddress] = useState(currentUser?.address || '123 Health Ave, Springfield');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      alert('Please sign in first to place your order.');
      return;
    }
    setLoading(true);
    try {
      await onCheckout({
        shippingAddress,
        contactPhone,
        paymentMethod,
        items: cart.map(item => ({
          medicineId: item.medicine.id,
          quantity: item.quantity
        }))
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-cart3 me-2 text-info"></i>Your Pharmacy Basket
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            {success ? (
              <div className="text-center py-4">
                <i className="bi bi-check-circle-fill text-success display-3 mb-3"></i>
                <h4 className="text-white">Order Placed Successfully!</h4>
                <p className="text-muted">Your order and invoice have been generated and sent to fulfillment.</p>
                <div className="d-flex justify-content-center gap-2 mt-3">
                  <button className="btn btn-outline-light" onClick={() => { setSuccess(false); onClose(); }}>
                    Continue Shopping
                  </button>
                  <button 
                    className="btn btn-primary fw-semibold" 
                    onClick={() => { 
                      setSuccess(false); 
                      onClose(); 
                      if (onNavigateToOrders) onNavigateToOrders(); 
                    }}
                  >
                    <i className="bi bi-receipt-cutoff me-1"></i> View In My Orders
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-basket display-4 d-block mb-3"></i>
                <p>Your basket is currently empty.</p>
              </div>
            ) : (
              <div>
                <div className="table-responsive mb-3">
                  <table className="table align-middle">
                    <thead>
                      <tr className="text-muted small">
                        <th>Medicine</th>
                        <th>Price</th>
                        <th style={{ width: '120px' }}>Quantity</th>
                        <th>Subtotal</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.medicine.id}>
                          <td>
                            <strong>{item.medicine.name}</strong>
                            <div className="small text-muted">{item.medicine.strength}</div>
                          </td>
                          <td>₹{item.medicine.price.toFixed(2)}</td>
                          <td>
                            <div className="input-group input-group-sm">
                              <button 
                                className="btn btn-outline-secondary" 
                                onClick={() => onUpdateQuantity(item.medicine.id, item.quantity - 1)}
                              >-</button>
                              <span className="form-control text-center">{item.quantity}</span>
                              <button 
                                className="btn btn-outline-secondary" 
                                onClick={() => onUpdateQuantity(item.medicine.id, item.quantity + 1)}
                              >+</button>
                            </div>
                          </td>
                          <td className="fw-bold">₹{(item.medicine.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => onRemove(item.medicine.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-top pt-3">
                  <h6 className="fw-bold mb-3">Delivery Information</h6>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small">Shipping Address</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={shippingAddress} 
                        onChange={(e) => setShippingAddress(e.target.value)} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Contact Phone</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={contactPhone} 
                        onChange={(e) => setContactPhone(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <div className="border-top pt-3 mb-3">
                  <h6 className="fw-bold mb-3 text-white">Select Payment Mode</h6>
                  <div className="row g-2">
                    {[
                      { id: 'UPI', icon: 'bi-qr-code-scan', label: 'UPI / QR', sub: 'Google Pay, PhonePe, Paytm' },
                      { id: 'CARD', icon: 'bi-credit-card-2-front', label: 'Card Payment', sub: 'Visa, MasterCard, RuPay' },
                      { id: 'CASH_ON_DELIVERY', icon: 'bi-cash-stack', label: 'Cash on Delivery', sub: 'Pay cash on receipt' }
                    ].map(m => (
                      <div key={m.id} className="col-md-4">
                        <div 
                          className={`p-3 rounded-3 border text-center h-100 ${paymentMethod === m.id ? 'border-info' : 'border-secondary border-opacity-25'}`}
                          style={{ cursor: 'pointer', backgroundColor: paymentMethod === m.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.35)' }}
                          onClick={() => setPaymentMethod(m.id)}
                        >
                          <div className={`fs-4 ${m.id === 'CASH_ON_DELIVERY' ? 'text-warning' : 'text-info'} mb-1`}><i className={`bi ${m.icon}`}></i></div>
                          <strong className="d-block text-white small">{m.label}</strong>
                          <div className="text-white-50" style={{ fontSize: '0.75rem' }}>{m.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 rounded mb-3" style={{ backgroundColor: 'rgba(2, 132, 199, 0.45)', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                  <span className="fs-5 text-white">Total Amount:</span>
                  <span className="fs-4 fw-bold text-info">₹{totalAmount.toFixed(2)}</span>
                </div>

                <div>
                  <button 
                    className="btn btn-primary w-100 py-2 fw-semibold" 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? 'Processing Order...' : 'Confirm & Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
