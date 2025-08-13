# 🔧 Vinodelnya API - Spring Boot Backend

RESTful API service for the Vinodelnya winery management system.

## 🚀 Quick Start

```bash
# Start PostgreSQL database (Docker)
docker run -d --name vinodelnya-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=vinodelnya \
  -p 5432:5432 postgres:16

# Run the application
./gradlew bootRun
```

## 📋 Requirements

- **Java**: 21+
- **PostgreSQL**: 16+
- **Gradle**: 8.x (via wrapper)

## 🔗 Endpoints

- **Base URL**: http://localhost:8081/api/v1
- **Health Check**: http://localhost:8081/api/v1/actuator/health
- **API Docs**: http://localhost:8081/swagger-ui/index.html

## 🗄️ Database

Flyway migrations are located in `src/main/resources/db/migration/`:
- V1: Initial schema (users, persons, categories, entries)
- V2: Sample data
- V3: Events table
- V4: Sample events
- V5: Extended sample data

## 🔐 Authentication

JWT-based authentication with two roles:
- **ADMIN**: Full CRUD operations
- **USER**: Read-only access

Default users:
- admin/admin (ADMIN role)
- user/user (USER role)

## 🧪 Testing

```bash
# Run unit tests
./gradlew test

# Build without tests
./gradlew build -x test
```

## 🐳 Docker

```bash
# Build image
docker build -t vinodelnya-api .

# Run container
docker run -p 8081:8081 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/vinodelnya \
  vinodelnya-api
```