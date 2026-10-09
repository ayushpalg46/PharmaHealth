import React, { useState, useEffect } from 'react';
import { medicineService, orderService, prescriptionService, billService, supportService, userService } from '../services/api';

export default function AdminDashboard({ categories, onRefreshMedicines, activeTab = 'customers', onTabChange }) {
  const [internalTab, setInternalTab] = useState(activeTab);
  const tab = onTabChange ? activeTab : internalTab;
  const setTab = onTabChange ? onTabChange : setInternalTab;

  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Response to support ticket
  const [activeTicket, setActiveTicket] = useState(null);
  const [ticketResponse, setTicketResponse] = useState('');

  // Selected Bill receipt view
  const [selectedBill, setSelectedBill] = useState(null);

  // New Medicine Form State
  const [newMed, setNewMed] = useState({
    name: '',
    manufacturer: '',
    price: '',
    stockQuantity: '',
    dosageForm: 'Tablet',
    strength: '500mg',
    imageUrl: '',
    prescriptionRequired: false,
    description: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'customers') {
        const res = await userService.getActiveCustomers();
        setCustomers(res.data);
      } else if (tab === 'inventory') {
        const res = await medicineService.getMedicines();
        setMedicines(res.data);
      } else if (tab === 'billing') {
        const res = await billService.getAllBills();
        setBills(res.data);
      } else if (tab === 'support') {
        const res = await supportService.getAllTickets();
        setTickets(res.data);
      } else if (tab === 'prescriptions') {
        const res = await prescriptionService.getAllPrescriptions();
        setPrescriptions(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
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
        name: newMed.name,
        manufacturer: newMed.manufacturer,
        price: parseFloat(newMed.price),
        stockQuantity: parseInt(newMed.stockQuantity, 10),
        dosageForm: newMed.dosageForm,
        strength: newMed.strength,
        imageUrl: newMed.imageUrl,
        prescriptionRequired: newMed.prescriptionRequired,
        description: newMed.description
      });
      alert('Medicine added to catalog!');
      loadData();
      if (onRefreshMedicines) onRefreshMedicines();
      setNewMed({
        name: '',
        manufacturer: '',
        price: '',
        stockQuantity: '',
        dosageForm: 'Tablet',
        strength: '500mg',
        imageUrl: '',
        prescriptionRequired: false,
        description: ''
      });
    } catch (err) {
      alert('Error creating medicine.');
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMed(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewMed(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await medicineService.deleteMedicine(id);
      loadData();
      if (onRefreshMedicines) onRefreshMedicines();
    } catch (err) {
      alert('Failed to delete medicine.');
    }
  };

  const handleUpdateBillStatus = async (id, status) => {
    try {
      await billService.updateBillStatus(id, status);
      loadData();
    } catch (err) {
      alert('Failed to update payment status.');
    }
  };

  const handleRespondTicket = async (e) => {
    e.preventDefault();
    if (!activeTicket) return;
    try {
      await supportService.respondToTicket(activeTicket.id, ticketResponse, 'RESOLVED');
      setActiveTicket(null);
      setTicketResponse('');
      loadData();
    } catch (err) {
      alert('Failed to respond to ticket.');
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
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Loading control center data...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: ACTIVE CUSTOMERS */}
          {tab === 'customers' && (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-white p-3">
                <h6 className="fw-bold mb-0">Active Registered Customers ({customers.length})</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Customer ID</th>
                      <th>Full Legal Name</th>
                      <th>Username / Email</th>
                      <th>Contact Phone</th>
                      <th>Registered Delivery Address</th>
                      <th>Orders Placed</th>
                      <th>Member Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-4 text-muted">No customers found.</td></tr>
                    ) : (
                      customers.map(c => (
                        <tr key={c.id}>
                          <td><strong>CUST-{c.id}</strong></td>
                          <td><strong>{c.fullName}</strong></td>
                          <td>
                            <div>{c.username}</div>
                            <div className="small text-muted">{c.email}</div>
                          </td>
                          <td>{c.phone || 'N/A'}</td>
                          <td className="small" style={{ maxWidth: '250px' }}>{c.address || 'Not specified'}</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary fs-6 px-2">
                              {c.totalOrders} Orders
                            </span>
                          </td>
                          <td className="small text-muted">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & STOCK */}
          {tab === 'inventory' && (
            <div className="row g-4">
              <div className="col-lg-4">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-header bg-primary text-white fw-semibold rounded-top-4">
                    <i className="bi bi-plus-circle me-2"></i>Add Medicine Supply
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddMedicine}>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">Medicine / Drug Name</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          required 
                          placeholder="e.g. Paracetamol Extra"
                          value={newMed.name} 
                          onChange={e => setNewMed({...newMed, name: e.target.value})} 
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">Manufacturer</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          placeholder="e.g. Sun Pharma, Cipla"
                          value={newMed.manufacturer} 
                          onChange={e => setNewMed({...newMed, manufacturer: e.target.value})} 
                        />
                      </div>
                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <label className="form-label small fw-semibold">Dosage Form</label>
                          <select 
                            className="form-select form-select-sm" 
                            value={newMed.dosageForm} 
                            onChange={e => setNewMed({...newMed, dosageForm: e.target.value})}
                          >
                            <option value="Tablet">Tablet</option>
                            <option value="Capsule">Capsule</option>
                            <option value="Syrup">Syrup</option>
                            <option value="Injection">Injection</option>
                            <option value="Ointment">Ointment / Cream</option>
                            <option value="Drops">Drops (Eye / Ear)</option>
                            <option value="Inhaler">Inhaler</option>
                            <option value="Powder">Powder</option>
                            <option value="Lotion">Lotion / Gel</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-semibold">Strength</label>
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            placeholder="e.g. 500mg, 100ml"
                            value={newMed.strength} 
                            onChange={e => setNewMed({...newMed, strength: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <label className="form-label small fw-semibold">Price (₹)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            className="form-control form-control-sm" 
                            required 
                            placeholder="e.g. 150.00"
                            value={newMed.price} 
                            onChange={e => setNewMed({...newMed, price: e.target.value})} 
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-semibold">Stock Quantity</label>
                          <input 
                            type="number" 
                            className="form-control form-control-sm" 
                            required 
                            placeholder="e.g. 100"
                            value={newMed.stockQuantity} 
                            onChange={e => setNewMed({...newMed, stockQuantity: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold text-white">Upload Medicine Photo</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="form-control form-control-sm" 
                          onChange={handleImageFileChange}
                        />
                        <div className="form-text small">Select photo directly from your device (PNG, JPG, WEBP).</div>
                        {newMed.imageUrl && (
                          <div className="mt-2 p-2 border rounded position-relative d-flex align-items-center justify-content-between" style={{ backgroundColor: 'rgba(4, 26, 20, 0.9)' }}>
                            <div className="d-flex align-items-center gap-2">
                              <img src={newMed.imageUrl} alt="Preview" style={{ height: '48px', width: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                              <span className="small text-success fw-semibold"><i className="bi bi-check-circle me-1"></i>Image attached</span>
                            </div>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={handleRemoveImage}
                              title="Remove photo"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">Description / Notes</label>
                        <textarea 
                          className="form-control form-control-sm" 
                          rows="2"
                          placeholder="Usage instructions, symptoms treated..."
                          value={newMed.description} 
                          onChange={e => setNewMed({...newMed, description: e.target.value})} 
                        ></textarea>
                      </div>
                      <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" checked={newMed.prescriptionRequired} onChange={e => setNewMed({...newMed, prescriptionRequired: e.target.checked})} id="reqRx" />
                        <label className="form-check-label small" htmlFor="reqRx">Requires Prescription (Rx)</label>
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm w-100 fw-semibold">Add Supply to Inventory</button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-lg-8">
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                  <div className="card-header bg-white p-3">
                    <h6 className="fw-bold mb-0">Medication Stock Level Inventory ({medicines.length})</h6>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light small">
                        <tr>
                          <th>Medication</th>
                          <th>Dosage & Strength</th>
                          <th>Price</th>
                          <th>In Stock</th>
                          <th>Rx Required</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map(m => (
                          <tr key={m.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {m.imageUrl ? (
                                  <img 
                                    src={m.imageUrl} 
                                    alt={m.name} 
                                    className="rounded border" 
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="badge bg-primary-subtle text-info p-2 rounded">
                                    <i className="bi bi-capsule fs-6"></i>
                                  </div>
                                )}
                                <div>
                                  <strong>{m.name}</strong>
                                  <div className="small text-muted">{m.manufacturer || 'Pharmaceutical'}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-secondary-subtle text-secondary">{m.dosageForm || 'Tablet'}</span>
                              <div className="small text-muted">{m.strength || 'Standard'}</div>
                            </td>
                            <td><strong>₹{m.price.toFixed(2)}</strong></td>
                            <td>
                              <span className={`badge ${m.stockQuantity > 50 ? 'bg-success' : m.stockQuantity > 10 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                {m.stockQuantity} units
                              </span>
                            </td>
                            <td>{m.prescriptionRequired ? 'Yes (Rx)' : 'No (OTC)'}</td>
                            <td>
                              <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteMedicine(m.id)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BILLS & PAYMENTS */}
          {tab === 'billing' && (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0">Customer Bills, Invoices & Payment History ({bills.length})</h6>
                <button className="btn btn-sm btn-outline-secondary" onClick={loadData}>
                  <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Invoice #</th>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Subtotal</th>
                      <th>Tax</th>
                      <th>Grand Total</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Transaction ID</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.length === 0 ? (
                      <tr><td colSpan="10" className="text-center py-4 text-muted">No billing records found.</td></tr>
                    ) : (
                      bills.map(b => (
                        <tr key={b.id}>
                          <td><strong>{b.invoiceNumber}</strong></td>
                          <td>#{b.order?.id}</td>
                          <td>
                            <div>{b.user?.fullName || b.user?.username}</div>
                            <div className="small text-muted">{b.user?.email}</div>
                          </td>
                          <td>₹{b.subtotal?.toFixed(2)}</td>
                          <td>₹{b.taxAmount?.toFixed(2)}</td>
                          <td className="fw-bold text-primary">₹{b.totalAmount?.toFixed(2)}</td>
                          <td><span className="badge bg-light text-dark border">{b.paymentMethod}</span></td>
                          <td>
                            <span className={`badge ${b.paymentStatus === 'PAID' ? 'bg-success text-white' : b.paymentStatus === 'PENDING' ? 'bg-warning text-dark' : 'bg-danger text-white'}`}>
                              <i className={`bi me-1 ${b.paymentStatus === 'PAID' ? 'bi-check-circle-fill' : b.paymentStatus === 'PENDING' ? 'bi-hourglass-split' : 'bi-x-circle'}`}></i>
                              {b.paymentStatus}
                            </span>
                          </td>
                          <td className="small text-muted"><code>{b.transactionId}</code></td>
                          <td>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedBill(b)}>
                              <i className="bi bi-receipt"></i> Receipt
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT TICKETS */}
          {tab === 'support' && (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-white p-3">
                <h6 className="fw-bold mb-0">Customer Support Inquiries & Helpdesk Inbox ({tickets.length})</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Ticket #</th>
                      <th>Patient / Customer</th>
                      <th>Category</th>
                      <th>Subject & Question</th>
                      <th>Current Status</th>
                      <th>Pharmacist Response</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-4 text-muted">No support tickets.</td></tr>
                    ) : (
                      tickets.map(t => (
                        <tr key={t.id}>
                          <td><strong>#{t.id}</strong></td>
                          <td>
                            <div>{t.user?.fullName || t.user?.username}</div>
                            <div className="small text-muted">{t.user?.phone || t.user?.email}</div>
                          </td>
                          <td><span className="badge bg-secondary-subtle text-secondary small">{t.category}</span></td>
                          <td style={{ maxWidth: '280px' }}>
                            <strong className="d-block text-dark">{t.subject}</strong>
                            <span className="small text-muted">{t.message}</span>
                          </td>
                          <td>
                            <span className={`badge ${t.status === 'RESOLVED' ? 'bg-success' : t.status === 'IN_PROGRESS' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="small" style={{ maxWidth: '220px' }}>
                            {t.adminResponse ? (
                              <span className="text-success"><i className="bi bi-check-circle me-1"></i>{t.adminResponse}</span>
                            ) : (
                              <span className="text-muted fst-italic">Pending reply</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="btn btn-outline-primary btn-sm rounded-pill"
                              onClick={() => {
                                setActiveTicket(t);
                                setTicketResponse(t.adminResponse || '');
                              }}
                            >
                              <i className="bi bi-reply me-1"></i>Reply & Resolve
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PRESCRIPTIONS */}
          {tab === 'prescriptions' && (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-white p-3">
                <h6 className="fw-bold mb-0">Doctor Prescriptions Pending Verification ({prescriptions.length})</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Rx ID</th>
                      <th>Patient</th>
                      <th>Doctor / Clinic</th>
                      <th>Clinical Diagnosis</th>
                      <th>Document</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-4 text-muted">No prescriptions pending.</td></tr>
                    ) : (
                      prescriptions.map(p => (
                        <tr key={p.id}>
                          <td><strong>RX-{p.id}</strong></td>
                          <td>{p.user?.fullName || p.user?.username}</td>
                          <td>{p.doctorName || 'Not specified'}</td>
                          <td>{p.diagnosis || 'None'}</td>
                          <td>
                            <a href={p.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-link">
                              <i className="bi bi-file-earmark-medical me-1"></i>View Document
                            </a>
                          </td>
                          <td>
                            <span className={`badge ${p.status === 'VERIFIED' ? 'bg-success' : p.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`}>
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
        </>
      )}

      {/* Modal: Support Ticket Response */}
      {activeTicket && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-chat-heart me-2"></i>Respond to Customer Inquiry #{activeTicket.id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setActiveTicket(null)}></button>
              </div>
              <form onSubmit={handleRespondTicket}>
                <div className="modal-body p-4">
                  <div className="bg-light p-3 rounded-3 mb-3">
                    <span className="badge bg-secondary-subtle text-secondary small mb-1">{activeTicket.category}</span>
                    <h6 className="fw-bold mb-1">{activeTicket.subject}</h6>
                    <p className="small text-muted mb-0">"{activeTicket.message}"</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Your Pharmacist / Support Advice</label>
                    <textarea 
                      className="form-control" 
                      rows="4" 
                      required 
                      value={ticketResponse} 
                      onChange={(e) => setTicketResponse(e.target.value)}
                      placeholder="Type your clinical recommendations or delivery solution here..."
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-info text-white w-100 py-2 fw-semibold">
                    Submit Response & Mark Resolved
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bill Receipt Viewer */}
      {selectedBill && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">Invoice #{selectedBill.invoiceNumber}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedBill(null)}></button>
              </div>
              <div className="modal-body p-4">
                <h5 className="fw-bold text-primary mb-1">PharmaHealth Dispensary</h5>
                <p className="text-muted small mb-3">Official Transaction Receipt</p>

                <div className="row g-2 small mb-3 border-top pt-2">
                  <div className="col-6">
                    <span className="text-muted">Customer:</span>
                    <strong>{selectedBill.user?.fullName || selectedBill.user?.username}</strong>
                    <div>{selectedBill.user?.email}</div>
                  </div>
                  <div className="col-6 text-end">
                    <span className="text-muted">Status:</span>
                    <span className="badge bg-success d-block">{selectedBill.paymentStatus}</span>
                    <span className="text-muted small">{new Date(selectedBill.billDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-top pt-2 mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Subtotal:</span>
                    <span>₹{selectedBill.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Tax (5%):</span>
                    <span>₹{selectedBill.taxAmount?.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-1">
                    <span>Total Amount:</span>
                    <span className="text-primary">₹{selectedBill.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-light p-2 rounded small text-muted">
                  Transaction: <code>{selectedBill.transactionId}</code><br/>
                  Method: {selectedBill.paymentMethod}
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedBill(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
