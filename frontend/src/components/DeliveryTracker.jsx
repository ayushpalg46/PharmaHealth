import React, { useState } from 'react';
import { orderService } from '../services/api';

export default function DeliveryTracker({ orders, onSelectOrder }) {
  const [searchTracking, setSearchTracking] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const stages = [
    { key: 'PENDING', label: 'Order Placed', icon: 'bi-check2-circle' },
    { key: 'PROCESSING', label: 'Packed & Verified', icon: 'bi-box-seam' },
    { key: 'SHIPPED', label: 'Dispatched', icon: 'bi-truck' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: 'bi-geo-alt-fill' },
    { key: 'DELIVERED', label: 'Delivered', icon: 'bi-house-heart-fill' }
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'PROCESSING': return 1;
      case 'SHIPPED': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return -1;
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTracking.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await orderService.trackDelivery(searchTracking.trim());
      setTrackedOrder(res.data);
    } catch (err) {
      setError('No delivery found with tracking number: ' + searchTracking);
      setTrackedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const displayOrder = trackedOrder || (orders && orders[0]) || null;
  const currentStageIndex = displayOrder ? getStageIndex(displayOrder.status) : -1;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="text-center mb-5">
        <span className="badge bg-info-subtle text-info fw-semibold px-3 py-1 rounded-pill mb-2">LIVE TRACKING</span>
        <h2 className="fw-bold text-white">Track Your Pharmaceutical Delivery</h2>
        <p className="text-muted">Enter your tracking code or choose from your recent orders below.</p>

        {/* Tracking Search Form */}
        <div className="row justify-content-center mt-4">
          <div className="col-md-7 col-lg-6">
            <form onSubmit={handleSearch} className="input-group shadow-sm">
              <input 
                type="text" 
                className="form-control form-control-lg border-primary" 
                placeholder="e.g. PH-TRK-784912" 
                value={searchTracking}
                onChange={(e) => setSearchTracking(e.target.value)}
              />
              <button className="btn btn-primary px-4 fw-semibold" type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Track Package'}
              </button>
            </form>
            {error && <div className="text-danger small mt-2">{error}</div>}
          </div>
        </div>
      </div>

      {displayOrder ? (
        <div className="card shadow border-0 rounded-4 overflow-hidden mb-5">
          <div className="card-header p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <span className="text-muted small d-block">Tracking ID</span>
              <h5 className="mb-0 fw-bold text-info">{displayOrder.trackingNumber || `ORD-${displayOrder.id}`}</h5>
            </div>
            <div>
              <span className="text-muted small d-block">Current Status</span>
              <span className={`badge fs-6 ${displayOrder.status === 'DELIVERED' ? 'bg-success' : 'bg-primary'}`}>
                {displayOrder.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-muted small d-block">Estimated Arrival</span>
              <span className="fw-semibold text-white">
                {displayOrder.estimatedDeliveryDate 
                  ? new Date(displayOrder.estimatedDeliveryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Within 24-48 Hours'}
              </span>
            </div>
          </div>

          <div className="card-body p-4 p-md-5">
            {/* Visual Step Progress Bar */}
            <div className="position-relative mb-5">
              <div className="d-flex justify-content-between position-relative z-1">
                {stages.map((stg, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stg.key} className="text-center" style={{ width: '18%' }}>
                      <div 
                        className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm ${
                          isCompleted ? 'bg-primary text-white' : 'text-muted border'
                        }`}
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          fontSize: '1.25rem',
                          backgroundColor: isCompleted ? 'var(--accent-blue)' : 'rgba(4, 26, 20, 0.7)',
                          borderColor: isCompleted ? 'var(--accent-blue-light)' : 'rgba(255, 255, 255, 0.15)'
                        }}
                      >
                        <i className={`bi ${stg.icon}`}></i>
                      </div>
                      <div className={`small fw-bold ${isCurrent ? 'text-info' : isCompleted ? 'text-white' : 'text-muted'}`}>
                        {stg.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier & Delivery Details Box */}
            <div className="row g-4 p-4 rounded-4" style={{ backgroundColor: 'rgba(4, 26, 20, 0.6)', border: '1px solid var(--border-color)' }}>
              <div className="col-md-6">
                <h6 className="fw-bold text-info mb-2">
                  <i className="bi bi-geo-alt me-1"></i> Shipping Destination
                </h6>
                <p className="mb-1 text-white fw-medium">{displayOrder.shippingAddress}</p>
                <p className="small text-muted mb-0">Recipient Contact: {displayOrder.contactPhone}</p>
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold text-info mb-2">
                  <i className="bi bi-info-circle me-1"></i> Courier Updates & Notes
                </h6>
                <p className="mb-1 text-white fst-italic">
                  "{displayOrder.deliveryNotes || 'Pharmaceutical order packaged in temperature-controlled bag.'}"
                </p>
                <p className="small text-muted mb-0">Carrier: PharmaHealth Cold-Chain Logistics</p>
              </div>
            </div>

            {/* Itemized Contents */}
            <div className="mt-4">
              <h6 className="fw-bold text-white mb-3">Package Contents</h6>
              <div className="list-group list-group-flush border rounded-3">
                {displayOrder.items?.map(it => (
                  <div key={it.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong className="text-white">{it.medicine?.name}</strong>
                      <span className="text-muted small ms-2">x {it.quantity}</span>
                    </div>
                    <span className="fw-bold text-info">${it.totalPrice?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-box2 display-3 d-block mb-3 text-info"></i>
          <h5 className="text-white">No Active Delivery to Display</h5>
          <p>Place an order or enter your tracking code above to follow your medicine shipment in real time.</p>
        </div>
      )}

      {/* Recent Orders Quick Select for Logged-In Customers */}
      {orders && orders.length > 0 && (
        <div className="mt-4">
          <h5 className="fw-bold text-white mb-3">Your Recent Shipments</h5>
          <div className="row g-3">
            {orders.map(o => (
              <div key={o.id} className="col-md-6 col-lg-4">
                <div 
                  className={`card p-3 border-0 shadow-sm rounded-3 cursor-pointer ${displayOrder?.id === o.id ? 'border-primary border-2 shadow' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTrackedOrder(o)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-info">{o.trackingNumber || `ORD-${o.id}`}</span>
                    <span className="badge bg-secondary-subtle small">{o.status}</span>
                  </div>
                  <div className="small text-muted mb-2">Total: <span className="text-white fw-semibold">${o.totalAmount.toFixed(2)}</span></div>
                  <div className="small text-truncate text-secondary">
                    <i className="bi bi-geo-alt me-1 text-info"></i>{o.shippingAddress}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
