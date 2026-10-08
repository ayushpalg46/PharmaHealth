package com.pharmahealth.controller;

import com.pharmahealth.model.Bill;
import com.pharmahealth.payload.response.MessageResponse;
import com.pharmahealth.repository.BillRepository;
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
@RequestMapping("/api/bills")
@Tag(name = "Billing & Payments", description = "Customer invoices, payment records, and financial history")
@SecurityRequirement(name = "Bearer Authentication")
public class BillController {

    @Autowired
    private BillRepository billRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "Get all customer bills and payments history (Admin)")
    public ResponseEntity<List<Bill>> getAllBills() {
        return ResponseEntity.ok(billRepository.findAllByOrderByBillDateDesc());
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my bills and payment receipts (Customer)")
    public ResponseEntity<List<Bill>> getMyBills(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(billRepository.findByUserIdOrderByBillDateDesc(userDetails.getId()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update payment status of a bill (Admin)")
    public ResponseEntity<?> updateBillPaymentStatus(
            @PathVariable Long id,
            @RequestParam Bill.PaymentStatus status) {

        return billRepository.findById(id).map(bill -> {
            bill.setPaymentStatus(status);
            return ResponseEntity.ok(billRepository.save(bill));
        }).orElse(ResponseEntity.notFound().build());
    }
}
