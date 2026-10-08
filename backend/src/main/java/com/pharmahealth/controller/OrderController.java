package com.pharmahealth.controller;

import com.pharmahealth.model.*;
import com.pharmahealth.payload.request.OrderRequest;
import com.pharmahealth.payload.response.MessageResponse;
import com.pharmahealth.repository.*;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
@Tag(name = "Order & Delivery Management", description = "Order processing, deliveries, and tracking")
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

    @Autowired
    private BillRepository billRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "List all customer orders with delivery status (Admin view)")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List current user orders (Customer view)")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(orderRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @GetMapping("/track/{trackingNumber}")
    @Operation(summary = "Track delivery by tracking number")
    public ResponseEntity<?> trackDelivery(@PathVariable String trackingNumber) {
        List<Order> allOrders = orderRepository.findAll();
        for (Order o : allOrders) {
            if (trackingNumber.equalsIgnoreCase(o.getTrackingNumber())) {
                return ResponseEntity.ok(o);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    @Transactional
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Place order, decrease stock, generate tracking number and invoice bill")
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
        order.setTrackingNumber("PH-TRK-" + (100000 + new Random().nextInt(900000)));
        order.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(2));
        order.setDeliveryNotes("Order confirmed. Preparing for dispensary packing.");

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

            // Decrement inventory stock
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

        // Automatically generate Billing record & invoice
        Bill bill = new Bill();
        bill.setOrder(saved);
        bill.setUser(user);
        bill.setInvoiceNumber("INV-PH-" + (1000 + new Random().nextInt(9000)));
        bill.setSubtotal(calculatedTotal);
        bill.setTaxAmount(calculatedTotal.multiply(BigDecimal.valueOf(0.05))); // 5% pharmacy tax
        bill.setDiscountAmount(BigDecimal.ZERO);
        bill.setTotalAmount(calculatedTotal.add(bill.getTaxAmount()));
        bill.setPaymentStatus(Bill.PaymentStatus.PAID);
        bill.setPaymentMethod(order.getPaymentMethod());
        bill.setTransactionId("TXN-" + System.currentTimeMillis());
        bill.setBillDate(LocalDateTime.now());
        billRepository.save(bill);

        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "Update delivery status and milestones")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status,
            @RequestParam(required = false) String deliveryNotes) {

        return orderRepository.findById(id).map(order -> {
            order.setStatus(status);
            if (deliveryNotes != null && !deliveryNotes.isBlank()) {
                order.setDeliveryNotes(deliveryNotes);
            } else {
                switch (status) {
                    case PROCESSING:
                        order.setDeliveryNotes("Pharmacist verifying and packing pharmaceuticals.");
                        break;
                    case SHIPPED:
                        order.setDeliveryNotes("Dispatched via Cold-Chain Express Courier.");
                        break;
                    case OUT_FOR_DELIVERY:
                        order.setDeliveryNotes("Out for delivery with courier agent.");
                        break;
                    case DELIVERED:
                        order.setDeliveryNotes("Delivered and received at customer destination.");
                        break;
                    case CANCELLED:
                        order.setDeliveryNotes("Order cancelled.");
                        break;
                    default:
                        break;
                }
            }
            order.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(orderRepository.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}
