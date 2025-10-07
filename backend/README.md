# Backend Microservices

This directory contains all backend microservices for the e-commerce platform.

## 🏗️ Architecture

The backend follows a **microservices architecture** with the following components:

### Core Services

| Service | Port | Description |
|---------|------|-------------|
| **api-gateway** | 8080 | API Gateway - Single entry point with routing & security |
| **auth-service** | 8081 | Authentication & Authorization with JWT |
| **user-service** | 8082 | User & dealer management |
| **product-service** | 8083 | Product catalog management |
| **cart-service** | 8084 | Shopping cart management |
| **order-service** | 8085 | Order processing |
| **warranty-service** | 8086 | Warranty management |
| **notification-service** | 8087 | Email & notifications (Kafka consumer) |
| **blog-service** | 8088 | Blog & content management |
| **report-service** | 8089 | Analytics & reporting |
| **media-service** | 8095 | File upload & Cloudinary integration |

### Infrastructure Services

| Service | Port | Description |
|---------|------|-------------|
| **config-server** | 8888 | Centralized configuration management |
| **common-service** | N/A | Shared utilities, DTOs, and exceptions |

## 🛠️ Technology Stack

- **Framework**: Spring Boot 3.4.6, Spring Cloud 2024.0.0
- **Database**: PostgreSQL 15 (isolated per service)
- **Cache**: Redis 7
- **Message Queue**: Apache Kafka 7.4.0
- **Security**: JWT RS256 with JWKS
- **Object Mapping**: MapStruct 1.5.5.Final
- **Build Tool**: Maven
- **Containerization**: Docker multi-stage builds

## 📂 Service Structure

Each service follows **Clean Architecture** principles:

```
service-name/
├── src/main/java/com/devwonder/servicename/
│   ├── client/         # Feign clients for inter-service communication
│   ├── config/         # Spring configuration classes
│   ├── controller/     # REST API endpoints
│   ├── dto/            # Data Transfer Objects
│   ├── entity/         # JPA entities
│   ├── repository/     # Data access layer
│   ├── service/        # Business logic
│   ├── exception/      # Custom exceptions
│   └── [ServiceName]Application.java
├── src/main/resources/
│   ├── application.yml
│   └── [other configs]
├── Dockerfile          # Production Docker image
└── pom.xml            # Maven dependencies
```

## 🚀 Development

### Prerequisites

- Java 21
- Maven 3.9+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)

### Build a Service

```bash
cd service-name
mvn clean install
```

### Run a Service Locally

```bash
mvn spring-boot:run
```

### Run with Docker Compose

From project root:
```bash
docker-compose up --build [service-name]
```

## 🔧 Configuration

Services use **Spring Cloud Config Server** for centralized configuration:

- Config files located in: `config-server/src/main/resources/configs/`
- Each service pulls config from config-server on startup
- Environment-specific configs supported

## 🔐 Security

- **JWT Authentication** with RS256 asymmetric encryption
- **JWKS** endpoint for public key distribution
- **API Key** authentication for inter-service communication
- **Role-based access control** (ADMIN, DEALER, USER)

## 📊 Database

Each service has its own isolated PostgreSQL database:

- **Principle**: Database per service (data sovereignty)
- **Init Script**: `scripts/database/init-databases.sql`
- **Indexes**: `scripts/database-indexes.sql`

## 📨 Event-Driven Communication

Services communicate via **Apache Kafka**:

- **Events**: Defined in `common-service/src/main/java/com/devwonder/common/event/`
- **Topics**: Auto-created or configured in Kafka
- **Examples**: OrderCreatedEvent, LoginConfirmationEvent, PasswordResetEvent

## 📝 API Documentation

- **Swagger UI**: Available at `http://localhost:8080/swagger-ui.html` (via API Gateway)
- **OpenAPI Spec**: Each service exposes `/v3/api-docs`

## 🧪 Testing

```bash
# Unit tests
mvn test

# Integration tests
mvn verify
```

## 📦 Shared Library

**common-service** provides shared components:

- DTOs and base entities
- Custom exceptions
- Kafka event classes
- Utility functions
- Validators

Include in your service's `pom.xml`:
```xml
<dependency>
    <groupId>com.devwonder</groupId>
    <artifactId>common-service</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

## 🔄 Service Communication

### Synchronous (REST)
- Via Feign clients
- API key authentication
- Dedicated lookup controllers

### Asynchronous (Kafka)
- Event-driven
- Fire-and-forget
- Eventual consistency

## 📈 Monitoring & Health

Each service exposes:
- `/actuator/health` - Health check endpoint
- `/actuator/metrics` - Prometheus metrics

## 🐳 Docker Build

Each service has a **multi-stage Dockerfile**:
1. Builder stage: Maven build
2. Runtime stage: Optimized JRE image

Build all services:
```bash
docker-compose build
```

## 📚 Additional Resources

- Main project overview: `../PROJECT_OVERVIEW.md`
- Database schema: `../entity-relationship-diagram.drawio`
