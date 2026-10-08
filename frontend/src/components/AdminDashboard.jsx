import React, { useState, useEffect } from 'react';
import { medicineService, orderService, prescriptionService } from '../services/api';

export default function AdminDashboard({ categories, onRefreshMedicines }) {
  const [tab, setTab] = useState('inventory');
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Medicine Form State
  const [newMed, setNewMed] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    categoryId: categories[0]?.id || '',
    price: '',
    stockQuantity: '',
    dosageForm: 'Tablet',
    strength: '500mg',
    prescriptionRequired: false,
    description: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'inventory') {
        const res = await medicineService.getMedicines();
        setMedicines(res.data);
      } else if (tab === 'orders') {
        const res = await orderService.getAllOrders();
        setOrders(res.data);
      } else if (tab === 'prescriptions') {
        const res = await prescriptionService.getAllPrescriptions();
        setPrescriptions(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      await medicineService.addMedicine({
        ...newMed,
        price: parseFloat(newMed.price),
        stockQuantity: parseInt(newMed.stockQuantity, 10),
        categoryId: newMed.categoryId ? parseInt(newMed.categoryId, 10) : null
      });
      alert('Medicine added to catalog!');
      loadData();
      onRefreshMedicines();
    } catch (err) {
      alert('Error creating medicine.');
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status);
      loadData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleUpdatePrescriptionStatus = async (id, status) => {
    try {
      await prescriptionService.updateStatus(id, status);
      loadData();
    } catch (err) {
      alert('Failed to update prescription status.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-shield-check text-primary me-2"></i>Staff & Pharmacist Portal
          </h3>
          <p className="text-muted small mb-0">Manage medications, customer orders, and clinical prescriptions.</p>
        </div>
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${tab === 'inventory' ? 'btn-primary' : 'btn-outline-primary'}`} 
            onClick={() => setTab('inventory')}
          >
            <i className="bi bi-boxes me-1"></i> Inventory
          </button>
          <button 
            className={`btn btn-sm ${tab === 'orders' ? 'btn-primary' : 'btn-outline-primary'}`} 
            onClick={() => setTab('orders')}
          >
            <i className="bi bi-receipt me-1"></i> Orders
          </button>
          <button 
            className={`btn btn-sm ${tab === 'prescriptions' ? 'btn-primary' : 'btn-outline-primary'}`} 
            onClick={() => setTab('prescriptions')}
          >
            <i className="bi bi-file-earmark-medical me-1"></i> Prescriptions
          </button>
        </div>
      </div>

      {/* Tab: Inventory */}
      {tab === 'inventory' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white fw-semibold">
                <i className="bi bi-plus-circle me-2"></i>Add New Drug Formulation
              </div>
              <div className="card-body">
                <form onSubmit={handleAddMedicine}>
                  <div className="mb-2">
                    <label className="form-label small">Brand Name</label>
                    <input type="text" className="form-control form-control-sm" required value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Generic Active Compound</label>
                    <input type="text" className="form-control form-control-sm" value={newMed.genericName} onChange={e => setNewMed({...newMed, genericName: e.target.value})} />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small">Manufacturer</label>
                      <input type="text" className="form-control form-control-sm" value={newMed.manufacturer} onChange={e => setNewMed({...newMed, manufacturer: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Category</label>
                      <select className="form-select form-select-sm" value={newMed.categoryId} onChange={e => setNewMed({...newMed, categoryId: e.target.value})}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small">Unit Price ($)</label>
                      <input type="number" step="0.01" className="form-control form-control-sm" required value={newMed.price} onChange={e => setNewMed({...newMed, price: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Stock Count</label>
                      <input type="number" className="form-control form-control-sm" required value={newMed.stockQuantity} onChange={e => setNewMed({...newMed, stockQuantity: e.target.value})} />
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small">Form</label>
                      <input type="text" className="form-control form-control-sm" value={newMed.dosageForm} onChange={e => setNewMed({...newMed, dosageForm: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Strength</label>
                      <input type="text" className="form-control form-control-sm" value={newMed.strength} onChange={e => setNewMed({...newMed, strength: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" checked={newMed.prescriptionRequired} onChange={e => setNewMed({...newMed, prescriptionRequired: e.target.checked})} id="reqRx" />
                    <label className="form-check-label small" htmlFor="reqRx">Requires Clinical Prescription (Rx)</label>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm w-100">Save to Inventory</button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-semibold">
                Current Medicine Stock ({medicines.length})
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Rx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map(m => (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.name}</strong>
                          <div className="small text-muted">{m.genericName}</div>
                        </td>
                        <td>{m.category?.name || 'Uncategorized'}</td>
                        <td>${m.price.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${m.stockQuantity > 50 ? 'bg-success' : 'bg-warning'}`}>
                            {m.stockQuantity}
                          </span>
                        </td>
                        <td>{m.prescriptionRequired ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {tab === 'orders' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white fw-semibold">Incoming Customer Orders</div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">No orders yet.</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <div>{order.user?.fullName || order.user?.username}</div>
                        <div className="small text-muted">{order.contactPhone}</div>
                      </td>
                      <td className="fw-bold">${order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className="badge bg-info">{order.status}</span>
                      </td>
                      <td>
                        <select 
                          className="form-select form-select-sm w-auto"
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Prescriptions */}
      {tab === 'prescriptions' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white fw-semibold">Patient Prescriptions for Verification</div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">No prescriptions pending review.</td></tr>
                ) : (
                  prescriptions.map(p => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>{p.user?.fullName || p.user?.username}</td>
                      <td>{p.doctorName || 'Not specified'}</td>
                      <td>{p.diagnosis || 'None'}</td>
                      <td>
                        <span className={`badge ${p.status === 'VERIFIED' ? 'bg-success' : p.status === 'REJECTED' ? 'bg-danger' : 'bg-warning'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-success" onClick={() => handleUpdatePrescriptionStatus(p.id, 'VERIFIED')}>Approve</button>
                          <button className="btn btn-outline-danger" onClick={() => handleUpdatePrescriptionStatus(p.id, 'REJECTED')}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
