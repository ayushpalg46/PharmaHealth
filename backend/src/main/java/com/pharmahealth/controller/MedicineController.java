package com.pharmahealth.controller;

import com.pharmahealth.model.Category;
import com.pharmahealth.model.Medicine;
import com.pharmahealth.payload.request.MedicineRequest;
import com.pharmahealth.payload.response.MessageResponse;
import com.pharmahealth.model.OrderItem;
import com.pharmahealth.repository.CategoryRepository;
import com.pharmahealth.repository.MedicineRepository;
import com.pharmahealth.repository.OrderItemRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

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
        medicine.setPrescriptionRequired(Boolean.TRUE.equals(req.getPrescriptionRequired()));
        medicine.setManufactureDate(req.getManufactureDate());
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
            medicine.setPrescriptionRequired(Boolean.TRUE.equals(req.getPrescriptionRequired()));
            medicine.setManufactureDate(req.getManufactureDate());
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
        Medicine medicine = medicineRepository.findById(id).orElse(null);
        if (medicine == null) {
            return ResponseEntity.notFound().build();
        }

        // 1. Ensure order_items.medicine_id column allows NULL in MySQL
        try {
            jdbcTemplate.execute("ALTER TABLE order_items MODIFY COLUMN medicine_id BIGINT NULL");
        } catch (DataAccessException ignored) {
        }

        // 2. Direct SQL update to decouple any order items while preserving medication names
        try {
            jdbcTemplate.update(
                    "UPDATE order_items SET medicine_id = NULL, medicine_name = COALESCE(medicine_name, ?) WHERE medicine_id = ?",
                    medicine.getName(), id
            );
        } catch (DataAccessException e) {
            // Fallback via JPA repository
            List<OrderItem> items = orderItemRepository.findByMedicineId(id);
            for (OrderItem item : items) {
                if (item.getMedicineName() == null || item.getMedicineName().isBlank()) {
                    item.setMedicineName(medicine.getName());
                }
                item.setMedicine(null);
                orderItemRepository.save(item);
            }
        }

        medicineRepository.delete(medicine);
        return ResponseEntity.ok(new MessageResponse("Medicine deleted successfully!"));
    }
}
