package com.pharmahealth.config;

import com.pharmahealth.model.*;
import com.pharmahealth.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

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
    private MedicineRepository medicineRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            initRoles();
            initFixedAdminAccount();
            initCategories();
            initDemoMedicines();
            initDemoCustomers();
            initDemoOrdersAndBills();
            initDemoSupportTickets();
        } catch (Exception e) {
            logger.error("Error during database demo data initialization: {}", e.getMessage(), e);
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
            admin.setAddress("PharmaHealth Headquarters, Medical Center Suite 100");

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

    private void initDemoMedicines() {
        if (medicineRepository.count() == 0) {
            List<Category> categories = categoryRepository.findAll();
            Category antibiotics = categories.stream().filter(c -> c.getName().contains("Antibiotics")).findFirst().orElse(null);
            Category painRelief = categories.stream().filter(c -> c.getName().contains("Pain Relief")).findFirst().orElse(null);
            Category cardio = categories.stream().filter(c -> c.getName().contains("Cardiovascular")).findFirst().orElse(null);
            Category vitamins = categories.stream().filter(c -> c.getName().contains("Vitamins")).findFirst().orElse(null);
            Category respiratory = categories.stream().filter(c -> c.getName().contains("Respiratory")).findFirst().orElse(null);
            Category diabetes = categories.stream().filter(c -> c.getName().contains("Diabetes")).findFirst().orElse(null);

            List<Medicine> medicines = new ArrayList<>();

            // 1. Amoxicillin
            Medicine m1 = new Medicine();
            m1.setName("Amoxicillin 500mg");
            m1.setGenericName("Amoxicillin Trihydrate");
            m1.setManufacturer("Cipla Labs Ltd");
            m1.setCategory(antibiotics);
            m1.setPrice(new BigDecimal("120.00"));
            m1.setStockQuantity(85);
            m1.setDosageForm("Capsule");
            m1.setStrength("500mg");
            m1.setPrescriptionRequired(true);
            m1.setManufactureDate(LocalDate.now().minusMonths(3));
            m1.setExpiryDate(LocalDate.now().plusMonths(24));
            m1.setDescription("Broad-spectrum antibiotic for bacterial ear, nose, throat, and respiratory infections.");
            medicines.add(m1);

            // 2. Azithromycin
            Medicine m2 = new Medicine();
            m2.setName("Azithromycin 500mg");
            m2.setGenericName("Azithromycin");
            m2.setManufacturer("Sun Pharma");
            m2.setCategory(antibiotics);
            m2.setPrice(new BigDecimal("180.00"));
            m2.setStockQuantity(60);
            m2.setDosageForm("Tablet");
            m2.setStrength("500mg");
            m2.setPrescriptionRequired(true);
            m2.setManufactureDate(LocalDate.now().minusMonths(2));
            m2.setExpiryDate(LocalDate.now().plusMonths(20));
            m2.setDescription("Macrolide antibiotic used for chest infections such as pneumonia and bronchitis.");
            medicines.add(m2);

            // 3. Paracetamol
            Medicine m3 = new Medicine();
            m3.setName("Paracetamol 650mg (Dolo)");
            m3.setGenericName("Acetaminophen / Paracetamol");
            m3.setManufacturer("Micro Labs Ltd");
            m3.setCategory(painRelief);
            m3.setPrice(new BigDecimal("32.00"));
            m3.setStockQuantity(150);
            m3.setDosageForm("Tablet");
            m3.setStrength("650mg");
            m3.setPrescriptionRequired(false);
            m3.setManufactureDate(LocalDate.now().minusMonths(1));
            m3.setExpiryDate(LocalDate.now().plusMonths(36));
            m3.setDescription("Fast-acting antipyretic and analgesic for fever relief, headache, and body aches.");
            medicines.add(m3);

            // 4. Ibuprofen
            Medicine m4 = new Medicine();
            m4.setName("Ibuprofen 400mg");
            m4.setGenericName("Ibuprofen");
            m4.setManufacturer("Abbott Healthcare");
            m4.setCategory(painRelief);
            m4.setPrice(new BigDecimal("45.00"));
            m4.setStockQuantity(90);
            m4.setDosageForm("Tablet");
            m4.setStrength("400mg");
            m4.setPrescriptionRequired(false);
            m4.setManufactureDate(LocalDate.now().minusMonths(4));
            m4.setExpiryDate(LocalDate.now().plusMonths(28));
            m4.setDescription("Non-steroidal anti-inflammatory drug (NSAID) for muscle pain, toothache, and inflammation.");
            medicines.add(m4);

            // 5. Amlodipine
            Medicine m5 = new Medicine();
            m5.setName("Amlodipine 5mg");
            m5.setGenericName("Amlodipine Besylate");
            m5.setManufacturer("Torrent Pharmaceuticals");
            m5.setCategory(cardio);
            m5.setPrice(new BigDecimal("65.00"));
            m5.setStockQuantity(110);
            m5.setDosageForm("Tablet");
            m5.setStrength("5mg");
            m5.setPrescriptionRequired(true);
            m5.setManufactureDate(LocalDate.now().minusMonths(3));
            m5.setExpiryDate(LocalDate.now().plusMonths(24));
            m5.setDescription("Calcium channel blocker prescribed for hypertension and prevention of angina pectoris.");
            medicines.add(m5);

            // 6. Atorvastatin
            Medicine m6 = new Medicine();
            m6.setName("Atorvastatin 10mg");
            m6.setGenericName("Atorvastatin Calcium");
            m6.setManufacturer("Dr. Reddy's Laboratories");
            m6.setCategory(cardio);
            m6.setPrice(new BigDecimal("140.00"));
            m6.setStockQuantity(75);
            m6.setDosageForm("Tablet");
            m6.setStrength("10mg");
            m6.setPrescriptionRequired(true);
            m6.setManufactureDate(LocalDate.now().minusMonths(2));
            m6.setExpiryDate(LocalDate.now().plusMonths(24));
            m6.setDescription("Statin medication lowering bad cholesterol (LDL) and triglycerides in coronary care.");
            medicines.add(m6);

            // 7. Vitamin C + Zinc
            Medicine m7 = new Medicine();
            m7.setName("Vitamin C + Zinc (Limcee)");
            m7.setGenericName("Ascorbic Acid with Zinc");
            m7.setManufacturer("Abbott Healthcare");
            m7.setCategory(vitamins);
            m7.setPrice(new BigDecimal("40.00"));
            m7.setStockQuantity(200);
            m7.setDosageForm("Chewable Tablet");
            m7.setStrength("500mg + 5mg");
            m7.setPrescriptionRequired(false);
            m7.setManufactureDate(LocalDate.now().minusMonths(1));
            m7.setExpiryDate(LocalDate.now().plusMonths(24));
            m7.setDescription("Immunity booster and antioxidant chewable tablets with orange flavor.");
            medicines.add(m7);

            // 8. Vitamin D3
            Medicine m8 = new Medicine();
            m8.setName("Vitamin D3 60k IU");
            m8.setGenericName("Cholecalciferol");
            m8.setManufacturer("Cadila Healthcare");
            m8.setCategory(vitamins);
            m8.setPrice(new BigDecimal("115.00"));
            m8.setStockQuantity(130);
            m8.setDosageForm("Capsule");
            m8.setStrength("60,000 IU");
            m8.setPrescriptionRequired(false);
            m8.setManufactureDate(LocalDate.now().minusMonths(2));
            m8.setExpiryDate(LocalDate.now().plusMonths(30));
            m8.setDescription("High-potency weekly vitamin D3 supplement for bone density and joint strength.");
            medicines.add(m8);

            // 9. Metformin
            Medicine m9 = new Medicine();
            m9.setName("Metformin 500mg");
            m9.setGenericName("Metformin Hydrochloride");
            m9.setManufacturer("USV Private Ltd");
            m9.setCategory(diabetes);
            m9.setPrice(new BigDecimal("55.00"));
            m9.setStockQuantity(140);
            m9.setDosageForm("Tablet");
            m9.setStrength("500mg");
            m9.setPrescriptionRequired(true);
            m9.setManufactureDate(LocalDate.now().minusMonths(2));
            m9.setExpiryDate(LocalDate.now().plusMonths(24));
            m9.setDescription("First-line oral antidiabetic medication for managing Type 2 diabetes mellitus.");
            medicines.add(m9);

            // 10. Montelukast + Levocetirizine
            Medicine m10 = new Medicine();
            m10.setName("Montelukast + Levocetirizine (Montair-LC)");
            m10.setGenericName("Montelukast Sodium & Levocetirizine");
            m10.setManufacturer("Cipla Labs Ltd");
            m10.setCategory(respiratory);
            m10.setPrice(new BigDecimal("165.00"));
            m10.setStockQuantity(95);
            m10.setDosageForm("Tablet");
            m10.setStrength("10mg + 5mg");
            m10.setPrescriptionRequired(false);
            m10.setManufactureDate(LocalDate.now().minusMonths(1));
            m10.setExpiryDate(LocalDate.now().plusMonths(24));
            m10.setDescription("Dual-action antihistamine and leukotriene receptor antagonist for allergic rhinitis.");
            medicines.add(m10);

            medicineRepository.saveAll(medicines);
            logger.info("Initialized demo medicine catalog ({} items).", medicines.size());
        }
    }

    private void initDemoCustomers() {
        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER).orElse(null);
        Set<Role> customerRoles = customerRole != null ? Set.of(customerRole) : Collections.emptySet();

        // Customer 1
        if (!userRepository.existsByUsername("rohit.sharma")) {
            User c1 = new User("rohit.sharma", "rohit.sharma@example.com", passwordEncoder.encode("password123"), "Rohit Sharma");
            c1.setPhone("+91 98765 43210");
            c1.setAddress("Flat 402, Green Valley Apartments, Mumbai, MH");
            c1.setRoles(customerRoles);
            userRepository.save(c1);
        }

        // Customer 2
        if (!userRepository.existsByUsername("ananya.verma")) {
            User c2 = new User("ananya.verma", "ananya.verma@example.com", passwordEncoder.encode("password123"), "Dr. Ananya Verma");
            c2.setPhone("+91 98123 45678");
            c2.setAddress("12B Park Street, Kolkata, WB");
            c2.setRoles(customerRoles);
            userRepository.save(c2);
        }

        // Customer 3
        if (!userRepository.existsByUsername("rahul.mehta")) {
            User c3 = new User("rahul.mehta", "rahul.mehta@example.com", passwordEncoder.encode("password123"), "Rahul Mehta");
            c3.setPhone("+91 97654 32109");
            c3.setAddress("Plot 55, Sector 14, Gurugram, HR");
            c3.setRoles(customerRoles);
            userRepository.save(c3);
        }
        logger.info("Initialized demo customer accounts.");
    }

    private void initDemoOrdersAndBills() {
        if (orderRepository.count() == 0) {
            User rohit = userRepository.findByUsername("rohit.sharma").orElse(null);
            User ananya = userRepository.findByUsername("ananya.verma").orElse(null);
            User rahul = userRepository.findByUsername("rahul.mehta").orElse(null);

            List<Medicine> allMeds = medicineRepository.findAll();
            if (rohit == null || ananya == null || rahul == null || allMeds.isEmpty()) return;

            Medicine dolo = allMeds.stream().filter(m -> m.getName().contains("Dolo")).findFirst().orElse(allMeds.get(0));
            Medicine limcee = allMeds.stream().filter(m -> m.getName().contains("Limcee")).findFirst().orElse(allMeds.get(0));
            Medicine amox = allMeds.stream().filter(m -> m.getName().contains("Amoxicillin")).findFirst().orElse(allMeds.get(0));
            Medicine montair = allMeds.stream().filter(m -> m.getName().contains("Montair")).findFirst().orElse(allMeds.get(0));
            Medicine metformin = allMeds.stream().filter(m -> m.getName().contains("Metformin")).findFirst().orElse(allMeds.get(0));
            Medicine atorva = allMeds.stream().filter(m -> m.getName().contains("Atorvastatin")).findFirst().orElse(allMeds.get(0));

            // ORDER 1: Rohit Sharma - Delivered
            Order o1 = new Order();
            o1.setUser(rohit);
            o1.setTotalAmount(new BigDecimal("184.00"));
            o1.setStatus(Order.OrderStatus.DELIVERED);
            o1.setShippingAddress(rohit.getAddress());
            o1.setContactPhone(rohit.getPhone());
            o1.setPaymentMethod("UPI");
            o1.setPaymentStatus(Order.PaymentStatus.PAID);
            o1.setTrackingNumber("PH-TRK-88912");
            o1.setDeliveryNotes("Leave with reception security");
            o1.setEstimatedDeliveryDate(LocalDateTime.now().minusDays(1));

            OrderItem i1 = new OrderItem(o1, dolo, 2, dolo.getPrice(), dolo.getPrice().multiply(BigDecimal.valueOf(2)));
            OrderItem i2 = new OrderItem(o1, limcee, 3, limcee.getPrice(), limcee.getPrice().multiply(BigDecimal.valueOf(3)));
            o1.getItems().add(i1);
            o1.getItems().add(i2);
            orderRepository.save(o1);

            Bill b1 = new Bill();
            b1.setOrder(o1);
            b1.setUser(rohit);
            b1.setInvoiceNumber("INV-2026-00101");
            b1.setSubtotal(new BigDecimal("160.00"));
            b1.setTaxAmount(new BigDecimal("24.00"));
            b1.setDiscountAmount(BigDecimal.ZERO);
            b1.setTotalAmount(new BigDecimal("184.00"));
            b1.setPaymentStatus(Bill.PaymentStatus.PAID);
            b1.setPaymentMethod("UPI");
            b1.setTransactionId("TXN-UPI-889127384");
            b1.setBillDate(LocalDateTime.now().minusDays(2));
            billRepository.save(b1);

            // ORDER 2: Ananya Verma - Shipped
            Order o2 = new Order();
            o2.setUser(ananya);
            o2.setTotalAmount(new BigDecimal("450.00"));
            o2.setStatus(Order.OrderStatus.SHIPPED);
            o2.setShippingAddress(ananya.getAddress());
            o2.setContactPhone(ananya.getPhone());
            o2.setPaymentMethod("CARD");
            o2.setPaymentStatus(Order.PaymentStatus.PAID);
            o2.setTrackingNumber("PH-TRK-99432");
            o2.setDeliveryNotes("Call upon arrival");
            o2.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(1));

            OrderItem i3 = new OrderItem(o2, amox, 1, amox.getPrice(), amox.getPrice());
            OrderItem i4 = new OrderItem(o2, montair, 2, montair.getPrice(), montair.getPrice().multiply(BigDecimal.valueOf(2)));
            o2.getItems().add(i3);
            o2.getItems().add(i4);
            orderRepository.save(o2);

            Bill b2 = new Bill();
            b2.setOrder(o2);
            b2.setUser(ananya);
            b2.setInvoiceNumber("INV-2026-00102");
            b2.setSubtotal(new BigDecimal("391.30"));
            b2.setTaxAmount(new BigDecimal("58.70"));
            b2.setDiscountAmount(BigDecimal.ZERO);
            b2.setTotalAmount(new BigDecimal("450.00"));
            b2.setPaymentStatus(Bill.PaymentStatus.PAID);
            b2.setPaymentMethod("CARD");
            b2.setTransactionId("TXN-CARD-992384112");
            b2.setBillDate(LocalDateTime.now().minusDays(1));
            billRepository.save(b2);

            // ORDER 3: Rahul Mehta - Processing
            Order o3 = new Order();
            o3.setUser(rahul);
            o3.setTotalAmount(new BigDecimal("250.00"));
            o3.setStatus(Order.OrderStatus.PROCESSING);
            o3.setShippingAddress(rahul.getAddress());
            o3.setContactPhone(rahul.getPhone());
            o3.setPaymentMethod("CASH_ON_DELIVERY");
            o3.setPaymentStatus(Order.PaymentStatus.PENDING);
            o3.setTrackingNumber("PH-TRK-10293");
            o3.setDeliveryNotes("Evening delivery preferred");
            o3.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(2));

            OrderItem i5 = new OrderItem(o3, metformin, 2, metformin.getPrice(), metformin.getPrice().multiply(BigDecimal.valueOf(2)));
            OrderItem i6 = new OrderItem(o3, atorva, 1, atorva.getPrice(), atorva.getPrice());
            o3.getItems().add(i5);
            o3.getItems().add(i6);
            orderRepository.save(o3);

            Bill b3 = new Bill();
            b3.setOrder(o3);
            b3.setUser(rahul);
            b3.setInvoiceNumber("INV-2026-00103");
            b3.setSubtotal(new BigDecimal("217.39"));
            b3.setTaxAmount(new BigDecimal("32.61"));
            b3.setDiscountAmount(BigDecimal.ZERO);
            b3.setTotalAmount(new BigDecimal("250.00"));
            b3.setPaymentStatus(Bill.PaymentStatus.PENDING);
            b3.setPaymentMethod("CASH_ON_DELIVERY");
            b3.setTransactionId("COD-PENDING-10293");
            b3.setBillDate(LocalDateTime.now());
            billRepository.save(b3);

            logger.info("Initialized demo orders and tax invoices.");
        }
    }

    private void initDemoSupportTickets() {
        if (supportTicketRepository.count() == 0) {
            User rohit = userRepository.findByUsername("rohit.sharma").orElse(null);
            User ananya = userRepository.findByUsername("ananya.verma").orElse(null);
            User rahul = userRepository.findByUsername("rahul.mehta").orElse(null);

            List<SupportTicket> tickets = new ArrayList<>();

            if (rohit != null) {
                SupportTicket t1 = new SupportTicket();
                t1.setUser(rohit);
                t1.setCategory("DELIVERY");
                t1.setSubject("Courier estimated arrival time for order #1");
                t1.setMessage("Hello, what is the expected delivery time slot for my medication shipment?");
                t1.setStatus(SupportTicket.TicketStatus.RESOLVED);
                t1.setAdminResponse("Hello Rohit, your courier is out for delivery via express partner and will arrive by 5 PM today.");
                tickets.add(t1);
            }

            if (ananya != null) {
                SupportTicket t2 = new SupportTicket();
                t2.setUser(ananya);
                t2.setCategory("ORDER");
                t2.setSubject("Prescription verification inquiry");
                t2.setMessage("I uploaded my clinical prescription for Amoxicillin, has the duty pharmacist approved it?");
                t2.setStatus(SupportTicket.TicketStatus.IN_PROGRESS);
                tickets.add(t2);
            }

            if (rahul != null) {
                SupportTicket t3 = new SupportTicket();
                t3.setUser(rahul);
                t3.setCategory("MEDICINE_INQUIRY");
                t3.setSubject("Dosage instructions for Metformin 500mg");
                t3.setMessage("Should this tablet be taken before or after meals?");
                t3.setStatus(SupportTicket.TicketStatus.RESOLVED);
                t3.setAdminResponse("Metformin 500mg should be taken with or immediately after meals to maximize efficacy and prevent gastric irritation.");
                tickets.add(t3);
            }

            supportTicketRepository.saveAll(tickets);
            logger.info("Initialized demo customer support tickets and notifications.");
        }
    }
}
