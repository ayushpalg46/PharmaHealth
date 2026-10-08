package com.pharmahealth.controller;

import com.pharmahealth.model.Category;
import com.pharmahealth.model.Medicine;
import com.pharmahealth.payload.request.MedicineRequest;
import com.pharmahealth.payload.response.MessageResponse;
import com.pharmahealth.repository.CategoryRepository;
import com.pharmahealth.repository.MedicineRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/medicines")
@Tag(name = "Medicine Management", description = "Admin & Pharmacist inventory and medicine CRUD endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class MedicineController {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "Add a new medicine to inventory")
    public ResponseEntity<?> addMedicine(@Valid @RequestBody MedicineRequest req) {
        Medicine medicine = new Medicine();
        medicine.setName(req.getName());
        medicine.setGenericName(req.getGenericName());
        medicine.setManufacturer(req.getManufacturer());
        medicine.setPrice(req.getPrice());
        medicine.setStockQuantity(req.getStockQuantity());
        medicine.setDosageForm(req.getDosageForm());
        medicine.setStrength(req.getStrength());
        medicine.setPrescriptionRequired(req.getPrescriptionRequired() != null ? req.getPrescriptionRequired() : false);
        medicine.setExpiryDate(req.getExpiryDate());
        medicine.setDescription(req.getDescription());
        medicine.setImageUrl(req.getImageUrl());

        if (req.getCategoryId() != null) {
            Category cat = categoryRepository.findById(req.getCategoryId()).orElse(null);
            medicine.setCategory(cat);
        }

        Medicine saved = medicineRepository.save(medicine);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "Update existing medicine")
    public ResponseEntity<?> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest req) {
        return medicineRepository.findById(id).map(medicine -> {
            medicine.setName(req.getName());
            medicine.setGenericName(req.getGenericName());
            medicine.setManufacturer(req.getManufacturer());
            medicine.setPrice(req.getPrice());
            medicine.setStockQuantity(req.getStockQuantity());
            medicine.setDosageForm(req.getDosageForm());
            medicine.setStrength(req.getStrength());
            medicine.setPrescriptionRequired(req.getPrescriptionRequired() != null ? req.getPrescriptionRequired() : false);
            medicine.setExpiryDate(req.getExpiryDate());
            medicine.setDescription(req.getDescription());
            medicine.setImageUrl(req.getImageUrl());
            medicine.setUpdatedAt(LocalDateTime.now());

            if (req.getCategoryId() != null) {
                Category cat = categoryRepository.findById(req.getCategoryId()).orElse(null);
                medicine.setCategory(cat);
            }

            return ResponseEntity.ok(medicineRepository.save(medicine));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete medicine from inventory (Admin only)")
    public ResponseEntity<?> deleteMedicine(@PathVariable Long id) {
        if (!medicineRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        medicineRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Medicine deleted successfully!"));
    }
}
