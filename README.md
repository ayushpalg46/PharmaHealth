# PharmaHealth 💊🏥

PharmaHealth is a comprehensive modern pharmaceutical and healthcare management platform built with Spring Boot (Java), React, MySQL, JWT Authentication, and Docker.

---

## 🏗️ Architecture & Tech Stack

- **Backend**:
  - Java 21 / 25
  - Spring Boot 3.3.x (Spring Web, Spring Security, Spring Data JPA)
  - Maven
  - JWT Authentication & Authorization (`io.jsonwebtoken`)
  - MySQL Database connector & Hibernate ORM
  - RESTful APIs with Swagger/OpenAPI documentation
- **Frontend**:
  - React 18+ (Vite)
  - Bootstrap 5 & Bootstrap Icons
  - Axios for API communication
  - React Router for seamless navigation
- **Static Page**:
  - High-performance responsive static landing & showcase page
- **DevOps & Containers**:
  - Docker & Docker Compose
  - Render Deployment Blueprint (`render.yaml`)
  - GitHub Actions CI/CD (`.github/workflows/ci.yml`)

---

## 📁 Repository Structure

```text
PharmaHealth/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow
├── backend/                     # Spring Boot Maven application
│   ├── src/                     # Java source code and resources
│   ├── pom.xml                  # Maven dependencies & plugins
│   └── Dockerfile               # Backend container definition
├── frontend/                    # React + Vite + Bootstrap application
│   ├── src/                     # Components, pages, services, styling
│   ├── package.json             # NPM dependencies
│   └── Dockerfile               # Frontend container definition
├── static-page/                 # Static marketing / showcase landing page
│   ├── index.html
│   ├── css/style.css
│   └── assets/
├── .gitignore                   # Multi-language git ignore
├── database.sql                 # MySQL schema creation and seed data
├── docker-compose.yml           # Multi-service local environment setup
├── Dockerfile                   # Multi-stage production container build
├── README.md                    # Project documentation
└── render.yaml                  # Render cloud deployment blueprint
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Git**
- **Docker & Docker Compose** (Recommended for full-stack run)
- **Java 21+** & **Maven**
- **Node.js 20+** & **npm**
- **MySQL 8.0**

### 2. Run with Docker Compose (Fastest)

```bash
docker-compose up --build
```

- **Backend API**: http://localhost:8080
- **Frontend App**: http://localhost:3000
- **Static Showcase**: http://localhost:8000
- **MySQL**: localhost:3306

### 3. Running Backend Locally

```bash
cd backend
mvn spring-boot:run
```

The Spring Boot backend connects to MySQL on `localhost:3306` with credentials defined in `application.properties`.

### 4. Running Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

---

## 🔐 Default Seed Credentials

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `password123` |
| **Pharmacist** | `pharmacist1` | `password123` |
| **Customer** | `johndoe` | `password123` |

---

## 📄 License
MIT License.
