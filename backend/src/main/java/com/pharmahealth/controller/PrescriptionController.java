package com.pharmahealth.controller;

import com.pharmahealth.model.Prescription;
import com.pharmahealth.model.User;
import com.pharmahealth.payload.response.MessageResponse;
import com.pharmahealth.repository.PrescriptionRepository;
import com.pharmahealth.repository.UserRepository;
import com.pharmahealth.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/prescriptions")
@Tag(name = "Prescription Management", description = "Prescription upload, verification, and workflow")
@SecurityRequirement(name = "Bearer Authentication")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "List all customer prescriptions for verification")
    public ResponseEntity<List<Prescription>> getAllPrescriptions() {
        return ResponseEntity.ok(prescriptionRepository.findAll());
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List current user prescriptions")
    public ResponseEntity<List<Prescription>> getMyPrescriptions(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(prescriptionRepository.findByUserId(userDetails.getId()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload or create new prescription request")
    public ResponseEntity<?> createPrescription(
            @RequestParam(required = false) String doctorName,
            @RequestParam(required = false) String diagnosis,
            @RequestParam(required = false) String fileUrl,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        Prescription prescription = new Prescription();
        prescription.setUser(user);
        prescription.setDoctorName(doctorName);
        prescription.setDiagnosis(diagnosis);
        prescription.setFileUrl(fileUrl != null ? fileUrl : "https://via.placeholder.com/600x800.png?text=Prescription+Document");
        prescription.setStatus(Prescription.PrescriptionStatus.PENDING);

        return ResponseEntity.ok(prescriptionRepository.save(prescription));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "Update prescription status (VERIFIED / REJECTED)")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam Prescription.PrescriptionStatus status) {

        return prescriptionRepository.findById(id).map(prescription -> {
            prescription.setStatus(status);
            return ResponseEntity.ok(prescriptionRepository.save(prescription));
        }).orElse(ResponseEntity.notFound().build());
    }
}
