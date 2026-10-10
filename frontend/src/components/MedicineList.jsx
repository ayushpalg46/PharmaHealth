import React from 'react';

export default function MedicineList({ medicines, categories, selectedCategory, onSelectCategory, onAddToCart, searchTerm, onSearchChange }) {
  return (
    <div className="container py-4">
      {/* Search and Filters Header */}
      <div className="row g-3 mb-4 align-items-center">
        <div className="col-md-7">
          <div className="input-group">
            <span className="input-group-text border-end-0">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0 shadow-none" 
              placeholder="Search by brand name, generic formulation, or manufacturer..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-5">
          <div className="d-flex gap-2 overflow-auto py-1">
            <button 
              className={`btn btn-sm text-nowrap rounded-pill ${selectedCategory === null ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => onSelectCategory(null)}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`btn btn-sm text-nowrap rounded-pill ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="row g-4">
        {medicines.length === 0 ? (
          <div className="col-12 text-center py-5">
            <i className="bi bi-capsule fs-1 text-primary d-block mb-3"></i>
            <h5 className="text-light">No medicines found matching your criteria</h5>
          </div>
        ) : (
          medicines.map((med) => (
            <div key={med.id} className="col-sm-6 col-lg-3">
              <div className="card h-100 card-medicine border-0 shadow-sm overflow-hidden">
                <div className="position-relative text-center border-bottom" style={{ height: '160px', backgroundColor: 'rgba(2, 132, 199, 0.25)', overflow: 'hidden' }}>
                  {med.imageUrl ? (
                    <img 
                      src={med.imageUrl} 
                      alt={med.name} 
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-100 h-100 justify-content-center align-items-center"
                    style={{ display: med.imageUrl ? 'none' : 'flex' }}
                  >
                    <i className="bi bi-capsule text-primary display-4"></i>
                  </div>
                  <span className={`position-absolute top-0 end-0 m-2 ${med.prescriptionRequired ? 'badge-prescription' : 'badge-otc'}`}>
                    {med.prescriptionRequired ? 'Rx Required' : 'OTC'}
                  </span>
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <span className="badge bg-secondary-subtle small me-1">
                      {med.dosageForm || 'Tablet'} • {med.strength || 'Standard'}
                    </span>
                  </div>
                  <h6 className="card-title fw-bold text-white mb-1">{med.name}</h6>
                  <p className="small text-muted mb-2">{med.manufacturer || 'Certified Pharma'}</p>
                  <p className="small text-secondary flex-grow-1 mb-3">
                    {med.description ? med.description.substring(0, 75) + '...' : 'Clinical pharmaceutical grade medication.'}
                  </p>
                  <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top border-secondary border-opacity-25">
                    <div>
                      <span className="fs-5 fw-bold text-white">₹{med.price.toFixed(2)}</span>
                    </div>
                    <button 
                      className="btn btn-primary btn-sm rounded-pill px-3"
                      onClick={() => onAddToCart(med)}
                      disabled={med.stockQuantity <= 0}
                    >
                      {med.stockQuantity > 0 ? (
                        <>
                          <i className="bi bi-cart-plus me-1"></i> Add
                        </>
                      ) : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
