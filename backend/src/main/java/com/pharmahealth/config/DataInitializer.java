package com.pharmahealth.config;

import com.pharmahealth.model.Category;
import com.pharmahealth.model.ERole;
import com.pharmahealth.model.Role;
import com.pharmahealth.model.User;
import com.pharmahealth.repository.CategoryRepository;
import com.pharmahealth.repository.RoleRepository;
import com.pharmahealth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            initRoles();
            initFixedAdminAccount();
            initCategories();
        } catch (Exception e) {
            logger.error("Error during database initialization: {}", e.getMessage(), e);
        }
    }

    private void initRoles() {
        for (ERole roleEnum : ERole.values()) {
            if (roleRepository.findByName(roleEnum).isEmpty()) {
                roleRepository.save(new Role(roleEnum));
                logger.info("Initialized system role: {}", roleEnum);
            }
        }
    }

    private void initFixedAdminAccount() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                    "admin",
                    "admin@pharmahealth.com",
                    passwordEncoder.encode("admin123"),
                    "System Administrator"
            );
            admin.setPhone("+1-800-555-0100");

            Set<Role> roles = new HashSet<>();
            roleRepository.findByName(ERole.ROLE_ADMIN).ifPresent(roles::add);
            roleRepository.findByName(ERole.ROLE_PHARMACIST).ifPresent(roles::add);
            admin.setRoles(roles);

            userRepository.save(admin);
            logger.info("Fixed Admin Account initialized (username: admin, email: admin@pharmahealth.com)");
        }
    }

    private void initCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> defaultCategories = List.of(
                    new Category("Antibiotics", "Medications used to treat and prevent bacterial infections"),
                    new Category("Pain Relief & Analgesics", "Drugs formulated to alleviate pain and reduce fever"),
                    new Category("Cardiovascular & Blood Pressure", "Medications supporting heart health and blood circulation"),
                    new Category("Vitamins & Supplements", "Essential dietary supplements and multivitamins"),
                    new Category("Respiratory Care", "Inhalers, anti-allergy, and asthma treatment formulas"),
                    new Category("Diabetes Care", "Glucose management and insulin therapy support")
            );
            categoryRepository.saveAll(defaultCategories);
            logger.info("Initialized default medicine categories.");
        }
    }
}
