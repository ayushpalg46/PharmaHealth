import React, { useState } from 'react';

export default function PrescriptionUploadModal({ isOpen, onClose, onUpload, currentUser, onOpenLogin }) {
  const [doctorName, setDoctorName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to upload a prescription.');
      onClose();
      onOpenLogin();
      return;
    }
    setLoading(true);
    try {
      await onUpload({
        doctorName,
        diagnosis,
        fileUrl: fileName ? `https://pharmahealth-cdn.storage/${fileName}` : 'https://via.placeholder.com/600x800.png?text=Prescription+File'
      });
      setSuccess(true);
    } catch (err) {
      alert('Failed to submit prescription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-file-earmark-medical me-2"></i>Upload Doctor's Prescription
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            {success ? (
              <div className="text-center py-3">
                <i className="bi bi-check2-circle text-success display-4 mb-2"></i>
                <h5>Prescription Submitted!</h5>
                <p className="text-muted small">Our certified pharmacist will review and verify it within 15 minutes.</p>
                <button className="btn btn-primary btn-sm" onClick={() => { setSuccess(false); onClose(); }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Doctor / Clinic Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Dr. House, General Hospital" 
                    required 
                    value={doctorName} 
                    onChange={(e) => setDoctorName(e.target.value)} 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Diagnosis / Doctor Notes</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="e.g. Acute bronchitis, 500mg Amoxicillin daily" 
                    value={diagnosis} 
                    onChange={(e) => setDiagnosis(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Upload Document (Image or PDF)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    onChange={(e) => setFileName(e.target.files[0]?.name || '')} 
                  />
                  <div className="form-text small">Accepted formats: JPG, PNG, PDF (Max 10MB)</div>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit for Clinical Verification'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
