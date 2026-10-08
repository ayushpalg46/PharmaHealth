-- ========================================================
-- PharmaHealth Database Schema & Seed Data (MySQL)
-- ========================================================

CREATE DATABASE IF NOT EXISTS defaultdb;
USE defaultdb;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Roles Table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. User Roles Join Table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Categories Table
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Medicines Table
CREATE TABLE medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150),
    manufacturer VARCHAR(150),
    category_id BIGINT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    prescription_required BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_medicine_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Prescriptions Table
CREATE TABLE prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    doctor_name VARCHAR(100),
    diagnosis TEXT,
    file_url VARCHAR(255),
    status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prescription_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Orders Table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    prescription_id BIGINT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    shipping_address TEXT NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CARD',
    payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    tracking_number VARCHAR(50),
    delivery_notes VARCHAR(255),
    estimated_delivery_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Order Items Table
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_items_medicine FOREIGN KEY (medicine_id) REFERENCES medicines (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Bills & Invoices Table
CREATE TABLE bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('PAID', 'PENDING', 'FAILED', 'REFUNDED') DEFAULT 'PAID',
    payment_method VARCHAR(50) DEFAULT 'CARD',
    transaction_id VARCHAR(100),
    bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_bill_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Support Tickets Table
CREATE TABLE support_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(150) NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    message TEXT NOT NULL,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'OPEN',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- Initial Seed Data
-- ========================================================

-- Roles
INSERT INTO roles (id, name) VALUES 
(1, 'ROLE_ADMIN'),
(2, 'ROLE_PHARMACIST'),
(3, 'ROLE_CUSTOMER');

-- Users (Password: 'password123')
INSERT INTO users (id, username, email, password, full_name, phone, address) VALUES
(1, 'admin', 'admin@pharmahealth.com', '$2a$10$wKqK69h9K3z1jAeknL513uRk2q04yH.kM0DkmH0Z0Q2d9mCgR3q9q', 'System Administrator', '+1-800-555-0100', '100 Health Way, Suite 400, New York, NY'),
(2, 'pharmacist1', 'pharmacist@pharmahealth.com', '$2a$10$wKqK69h9K3z1jAeknL513uRk2q04yH.kM0DkmH0Z0Q2d9mCgR3q9q', 'Dr. Sarah Connor', '+1-800-555-0101', '742 Evergreen Terrace, Springfield, OR'),
(3, 'johndoe', 'john.doe@example.com', '$2a$10$wKqK69h9K3z1jAeknL513uRk2q04yH.kM0DkmH0Z0Q2d9mCgR3q9q', 'John Doe', '+1-800-555-0199', '123 Elm Street, Austin, TX');

-- User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(1, 2),
(2, 2),
(3, 3);

-- Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Antibiotics', 'Medications used to treat and prevent bacterial infections'),
(2, 'Pain Relief & Analgesics', 'Drugs formulated to alleviate pain and reduce fever'),
(3, 'Cardiovascular & Blood Pressure', 'Medications supporting heart health and blood circulation'),
(4, 'Vitamins & Supplements', 'Essential dietary supplements and multivitamins'),
(5, 'Respiratory Care', 'Inhalers, anti-allergy, and asthma treatment formulas'),
(6, 'Diabetes Care', 'Glucose management and insulin therapy support');

-- Medicines
INSERT INTO medicines (id, name, generic_name, manufacturer, category_id, price, stock_quantity, dosage_form, strength, prescription_required, expiry_date, description) VALUES
(1, 'Amoxicillin Trihydrate', 'Amoxicillin', 'Pfizer Healthcare', 1, 14.50, 250, 'Capsule', '500mg', TRUE, '2028-12-31', 'Broad-spectrum antibiotic used to treat bacterial infections.'),
(2, 'Paracetamol Extra', 'Acetaminophen', 'GSK Consumer Health', 2, 6.99, 500, 'Tablet', '500mg', FALSE, '2029-06-30', 'Fast-acting pain reliever and fever reducer.'),
(3, 'Ibuprofen Adv', 'Ibuprofen', 'Bayer Pharmaceuticals', 2, 8.25, 420, 'Tablet', '400mg', FALSE, '2028-09-15', 'Nonsteroidal anti-inflammatory drug (NSAID) for muscle and joint pain.'),
(4, 'Atorvastatin Calcium', 'Atorvastatin', 'Sun Pharma Ltd', 3, 22.00, 180, 'Tablet', '20mg', TRUE, '2027-11-20', 'Lowers LDL cholesterol and triglycerides in the bloodstream.'),
(5, 'Metformin HCL', 'Metformin Hydrochloride', 'Novartis', 6, 11.50, 320, 'Tablet', '850mg', TRUE, '2028-05-10', 'First-line medication for the treatment of type 2 diabetes mellitus.'),
(6, 'Vitamin C + Zinc Immune Boost', 'Ascorbic Acid & Zinc', 'NatureMade Labs', 4, 15.99, 600, 'Chewable', '1000mg', FALSE, '2029-04-12', 'Comprehensive immune system booster for daily wellness.'),
(7, 'Salbutamol Inhaler', 'Albuterol', 'Cipla Health', 5, 18.75, 140, 'Inhaler', '100mcg', TRUE, '2028-08-30', 'Bronchodilator for rapid relief of asthma and bronchospasm.'),
(8, 'Omega-3 Fish Oil Ultra Pure', 'Fish Oil EPA/DHA', 'Nordic Naturals', 4, 24.50, 310, 'Softgel', '1200mg', FALSE, '2028-10-15', 'Supports heart, brain, and joint function with concentrated EPA/DHA.');

-- Sample Order for John Doe
INSERT INTO orders (id, user_id, prescription_id, total_amount, status, shipping_address, contact_phone, payment_method, payment_status, tracking_number, delivery_notes, estimated_delivery_date) VALUES
(1, 3, NULL, 30.49, 'OUT_FOR_DELIVERY', '123 Elm Street, Austin, TX', '+1-800-555-0199', 'CARD', 'PAID', 'PH-TRK-784912', 'Courier van in neighborhood. Estimated delivery by 4 PM.', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY));

-- Order Items
INSERT INTO order_items (id, order_id, medicine_id, quantity, unit_price, total_price) VALUES
(1, 1, 2, 2, 6.99, 13.98),
(2, 1, 6, 1, 15.99, 15.99);

-- Bill
INSERT INTO bills (id, order_id, user_id, invoice_number, subtotal, tax_amount, discount_amount, total_amount, payment_status, payment_method, transaction_id) VALUES
(1, 1, 3, 'INV-PH-1042', 29.97, 1.50, 0.00, 31.47, 'PAID', 'CARD', 'TXN-984321948');

-- Support Ticket
INSERT INTO support_tickets (id, user_id, subject, category, message, status, admin_response) VALUES
(1, 3, 'Delivery estimate confirmation', 'DELIVERY', 'Hello, can you confirm if my package requires temperature control?', 'RESOLVED', 'Yes, our cold-chain courier maintains 2-8°C with insulated packaging.');
