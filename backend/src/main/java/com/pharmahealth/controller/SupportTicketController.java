package com.pharmahealth.controller;

import com.pharmahealth.model.SupportTicket;
import com.pharmahealth.model.User;
import com.pharmahealth.payload.response.MessageResponse;
import com.pharmahealth.repository.SupportTicketRepository;
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
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/support")
@Tag(name = "Customer Support", description = "Inquiry tickets and customer service communications")
@SecurityRequirement(name = "Bearer Authentication")
public class SupportTicketController {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "Get all customer support tickets (Admin view)")
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(supportTicketRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my support tickets (Customer view)")
    public ResponseEntity<List<SupportTicket>> getMyTickets(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(supportTicketRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create new support ticket or question")
    public ResponseEntity<?> createTicket(
            @RequestParam String subject,
            @RequestParam(required = false, defaultValue = "GENERAL") String category,
            @RequestParam String message,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setSubject(subject);
        ticket.setCategory(category);
        ticket.setMessage(message);
        ticket.setStatus(SupportTicket.TicketStatus.OPEN);

        return ResponseEntity.ok(supportTicketRepository.save(ticket));
    }

    @PatchMapping("/{id}/respond")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PHARMACIST')")
    @Operation(summary = "Respond to support ticket and update status")
    public ResponseEntity<?> respondToTicket(
            @PathVariable Long id,
            @RequestParam String response,
            @RequestParam SupportTicket.TicketStatus status) {

        return supportTicketRepository.findById(id).map(ticket -> {
            ticket.setAdminResponse(response);
            ticket.setStatus(status);
            ticket.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(supportTicketRepository.save(ticket));
        }).orElse(ResponseEntity.notFound().build());
    }
}
