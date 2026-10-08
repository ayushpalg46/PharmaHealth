package com.pharmahealth.controller;

import com.pharmahealth.model.*;
import com.pharmahealth.payload.request.OrderRequest;
import com.pharmahealth.payload.response.MessageResponse;
import com.pharmahealth.repository.MedicineRepository;
import com.pharmahealth.repository.OrderRepository;
import com.pharmahealth.repository.PrescriptionRepository;
import com.pharmahealth.repository.UserRepository;
import com.pharmahealth.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
@Tag(name = "Order Management", description = "Order processing and inventory decrement endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "List all customer orders in the system")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List orders belonging to current user")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(orderRepository.findByUserId(userDetails.getId()));
    }

    @PostMapping
    @Transactional
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Place a new medicine order")
    public ResponseEntity<?> placeOrder(@Valid @RequestBody OrderRequest req, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(req.getShippingAddress());
        order.setContactPhone(req.getContactPhone());
        order.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "CARD");
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PAID);

        if (req.getPrescriptionId() != null) {
            Prescription prescription = prescriptionRepository.findById(req.getPrescriptionId()).orElse(null);
            order.setPrescription(prescription);
        }

        BigDecimal calculatedTotal = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (OrderRequest.OrderItemRequest itemReq : req.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new IllegalArgumentException("Medicine ID not found: " + itemReq.getMedicineId()));

            if (medicine.getStockQuantity() < itemReq.getQuantity()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Insufficient stock for: " + medicine.getName()));
            }

            // Decrement stock
            medicine.setStockQuantity(medicine.getStockQuantity() - itemReq.getQuantity());
            medicineRepository.save(medicine);

            BigDecimal lineTotal = medicine.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            calculatedTotal = calculatedTotal.add(lineTotal);

            OrderItem orderItem = new OrderItem(order, medicine, itemReq.getQuantity(), medicine.getPrice(), lineTotal);
            items.add(orderItem);
        }

        order.setTotalAmount(calculatedTotal);
        order.setItems(items);

        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "Update order status (PROCESSING, SHIPPED, DELIVERED, CANCELLED)")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status) {

        return orderRepository.findById(id).map(order -> {
            order.setStatus(status);
            return ResponseEntity.ok(orderRepository.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}
