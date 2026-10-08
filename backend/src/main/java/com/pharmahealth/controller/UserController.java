package com.pharmahealth.controller;

import com.pharmahealth.model.ERole;
import com.pharmahealth.model.User;
import com.pharmahealth.payload.response.MessageResponse;
import com.pharmahealth.repository.OrderRepository;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@Tag(name = "User & Profile Management", description = "User profile endpoints and active customer analytics")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current authenticated user profile details")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update current user profile (fullName, phone, address)")
    public ResponseEntity<?> updateProfile(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String address,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).map(user -> {
            if (fullName != null && !fullName.isBlank()) user.setFullName(fullName);
            if (phone != null && !phone.isBlank()) user.setPhone(phone);
            if (address != null && !address.isBlank()) user.setAddress(address);
            user.setUpdatedAt(LocalDateTime.now());
            User saved = userRepository.save(user);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "List active customers and their delivery order statistics (Admin POV)")
    public ResponseEntity<?> getActiveCustomers() {
        List<User> customers = userRepository.findByRole(ERole.ROLE_CUSTOMER);
        List<Map<String, Object>> response = new ArrayList<>();

        for (User c : customers) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("username", c.getUsername());
            map.put("fullName", c.getFullName());
            map.put("email", c.getEmail());
            map.put("phone", c.getPhone());
            map.put("address", c.getAddress());
            map.put("createdAt", c.getCreatedAt());

            long orderCount = orderRepository.findByUserId(c.getId()).size();
            map.put("totalOrders", orderCount);

            response.add(map);
        }

        return ResponseEntity.ok(response);
    }
}
