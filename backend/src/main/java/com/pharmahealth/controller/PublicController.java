package com.pharmahealth.controller;

import com.pharmahealth.model.Category;
import com.pharmahealth.model.Medicine;
import com.pharmahealth.repository.CategoryRepository;
import com.pharmahealth.repository.MedicineRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public")
@Tag(name = "Public APIs", description = "Public health, catalogue, and medicine discovery endpoints")
public class PublicController {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint for container orchestrators and status monitoring")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", System.currentTimeMillis());
        status.put("service", "PharmaHealth REST API");
        return ResponseEntity.ok(status);
    }

    @GetMapping("/categories")
    @Operation(summary = "Fetch all medicine categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/medicines")
    @Operation(summary = "Search and list public medicines")
    public ResponseEntity<List<Medicine>> getMedicines(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search) {

        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(medicineRepository.searchMedicines(search.trim()));
        }

        if (categoryId != null) {
            return ResponseEntity.ok(medicineRepository.findByCategoryId(categoryId));
        }

        return ResponseEntity.ok(medicineRepository.findAll());
    }

    @GetMapping("/medicines/{id}")
    @Operation(summary = "Fetch single medicine details")
    public ResponseEntity<?> getMedicineById(@PathVariable Long id) {
        return medicineRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
