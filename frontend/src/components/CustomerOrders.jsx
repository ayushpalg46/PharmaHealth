import React, { useState, useEffect } from 'react';
import { orderService, billService } from '../services/api';

export default function CustomerOrders({ currentUser, onTrackOrder, onOpenLogin }) {
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [orderRes, billRes] = await Promise.all([
        orderService.getMyOrders(),
        billService.getMyBills()
      ]);
      setOrders(orderRes.data);
      setBills(billRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-person-lock display-3 text-muted mb-3 d-block"></i>
        <h4>Authentication Required</h4>
        <p className="text-muted">Please sign in to view your orders and billing records.</p>
        <button className="btn btn-primary" onClick={onOpenLogin}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-bag-check text-primary me-2"></i>My Orders & Invoices
          </h3>
          <p className="text-muted small mb-0">View order status, download invoice receipts, or track deliveries.</p>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={loadData}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 text-muted bg-white rounded-4 shadow-sm p-5">
          <i className="bi bi-cart-x display-3 mb-3 d-block"></i>
          <h5>No Orders Placed Yet</h5>
          <p>Browse our pharmacy catalog and order medications with express delivery.</p>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map(order => {
            const matchingBill = bills.find(b => b.order?.id === order.id);

            return (
              <div key={order.id} className="col-lg-6">
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
                  <div className="card-header bg-light p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted small">Order ID</span>
                      <strong className="d-block text-dark">#{order.id}</strong>
                    </div>
                    <div>
                      <span className="text-muted small">Tracking</span>
                      <strong className="d-block text-primary">{order.trackingNumber || 'Pending'}</strong>
                    </div>
                    <div>
                      <span className={`badge ${order.status === 'DELIVERED' ? 'bg-success' : 'bg-primary'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="card-body p-3">
                    <div className="mb-3">
                      <div className="small text-muted mb-1">Ordered Medicines:</div>
                      <div className="list-group list-group-flush border rounded-3">
                        {order.items?.map(it => (
                          <div key={it.id} className="list-group-item py-2 d-flex justify-content-between small">
                            <span>{it.medicine?.name} <span className="text-muted">x{it.quantity}</span></span>
                            <span className="fw-semibold">${it.totalPrice?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
                      <span className="small text-muted">Grand Total:</span>
                      <span className="fw-bold text-dark fs-5">${order.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="small text-secondary mb-3">
                      <i className="bi bi-geo-alt me-1 text-primary"></i>
                      <span>{order.shippingAddress}</span>
                    </div>

                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={() => onTrackOrder(order)}
                      >
                        <i className="bi bi-truck me-1"></i> Live Tracking
                      </button>

                      {matchingBill && (
                        <button 
                          className="btn btn-outline-secondary btn-sm flex-grow-1"
                          onClick={() => setSelectedBill(matchingBill)}
                        >
                          <i className="bi bi-receipt me-1"></i> View Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bill Receipt Modal */}
      {selectedBill && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-receipt text-info me-2"></i>Invoice #{selectedBill.invoiceNumber}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedBill(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4 pb-2 border-bottom">
                  <h4 className="fw-bold text-primary mb-0">PharmaHealth Dispensary</h4>
                  <p className="text-muted small">Certified Clinical & Pharmaceutical Services</p>
                </div>

                <div className="row g-2 small mb-3">
                  <div className="col-6">
                    <span className="text-muted">Billed To:</span>
                    <strong className="d-block">{selectedBill.user?.fullName || selectedBill.user?.username}</strong>
                    <span>{selectedBill.user?.email}</span>
                  </div>
                  <div className="col-6 text-end">
                    <span className="text-muted">Date:</span>
                    <strong className="d-block">{new Date(selectedBill.billDate).toLocaleDateString()}</strong>
                    <span className="badge bg-success-subtle text-success">{selectedBill.paymentStatus}</span>
                  </div>
                </div>

                <div className="table-responsive mb-3">
                  <table className="table table-sm">
                    <thead>
                      <tr className="table-light small">
                        <th>Description</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Order #{selectedBill.order?.id} Pharmaceuticals</td>
                        <td className="text-end">${selectedBill.subtotal?.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Pharmacy Tax & Handling (5%)</td>
                        <td className="text-end">${selectedBill.taxAmount?.toFixed(2)}</td>
                      </tr>
                      <tr className="fw-bold border-top">
                        <td>Total Paid</td>
                        <td className="text-end text-primary">${selectedBill.totalAmount?.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-light p-2 rounded small text-muted">
                  Transaction Reference: <code>{selectedBill.transactionId || 'N/A'}</code><br/>
                  Payment Method: {selectedBill.paymentMethod}
                </div>
              </div>
              <div className="modal-footer bg-light justify-content-between">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
                  <i className="bi bi-printer me-1"></i> Print Receipt
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setSelectedBill(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
