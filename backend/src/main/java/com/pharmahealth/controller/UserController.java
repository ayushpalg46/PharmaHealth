package com.pharmahealth.controller;

import com.pharmahealth.model.ERole;
import com.pharmahealth.model.Role;
import com.pharmahealth.model.User;
import com.pharmahealth.payload.request.SignupRequest;
import com.pharmahealth.payload.response.MessageResponse;
import com.pharmahealth.repository.OrderRepository;
import com.pharmahealth.repository.RoleRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@Tag(name = "User & Profile Management", description = "User profile endpoints, admin registration, and active customer analytics")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
            if (fullName != null && !fullName.isBlank()) user.setFullName(fullName.trim());
            if (phone != null) user.setPhone(phone.trim());
            if (address != null) user.setAddress(address.trim());
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

            long orderCount = orderRepository.countByUserId(c.getId());
            map.put("totalOrders", orderCount);

            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List administrator and staff accounts (Admin only)")
    public ResponseEntity<?> getStaffMembers() {
        List<User> admins = userRepository.findByRole(ERole.ROLE_ADMIN);
        List<Map<String, Object>> response = new ArrayList<>();

        for (User u : admins) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("fullName", u.getFullName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("createdAt", u.getCreatedAt());
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/create-admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register new Administrator account (Admin only)")
    public ResponseEntity<?> createAdminUser(@Valid @RequestBody SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName()
        );

        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_ADMIN)));
        Role pharmRole = roleRepository.findByName(ERole.ROLE_PHARMACIST)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_PHARMACIST)));
        roles.add(adminRole);
        roles.add(pharmRole);
        user.setRoles(roles);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("New Administrator registered successfully!"));
    }
}
