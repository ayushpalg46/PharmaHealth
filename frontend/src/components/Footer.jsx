import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-5 mt-auto border-top border-secondary border-opacity-25">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img 
                src="/perLogo.png" 
                alt="PharmaHealth" 
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
                className="rounded-2"
              />
              <span className="fw-bold fs-5 text-white">
                Pharma<span className="text-success">Health</span>
              </span>
            </div>
            <p className="text-secondary small">
              Smart healthcare, certified pharmaceutical dispensary, and digital prescription verification system.
            </p>
          </div>
          <div className="col-md-2">
            <h6 className="fw-bold mb-3">Categories</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2">Antibiotics</li>
              <li className="mb-2">Pain Relief</li>
              <li className="mb-2">Cardiovascular</li>
              <li className="mb-2">Diabetes Care</li>
            </ul>
          </div>
          <div className="col-md-2">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Doctor Directory</a></li>
              <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Rx Upload</a></li>
              <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Privacy Policy</a></li>
              <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Terms of Service</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="fw-bold mb-3">24/7 Pharmacy Support</h6>
            <p className="text-secondary small mb-1">
              <i className="bi bi-telephone-fill text-info me-2"></i> +1 (800) 555-0100
            </p>
            <p className="text-secondary small">
              <i className="bi bi-envelope-fill text-info me-2"></i> support@pharmahealth.com
            </p>
          </div>
        </div>
        <hr className="my-4 border-secondary border-opacity-25" />
        <div className="d-flex justify-content-between align-items-center small text-secondary">
          <span>&copy; 2026 PharmaHealth Management System. All rights reserved.</span>
          <span>Powered by Spring Boot 3 & React</span>
        </div>
      </div>
    </footer>
  );
}
