# 🍷 Vinodelnya - Winery Management System

A comprehensive winery management application with separated GUI and API services.

## 📁 Project Structure

```
vinodelnya-app/
├── api/                    # Spring Boot Backend API
│   ├── src/
│   ├── build.gradle
│   ├── Dockerfile
│   └── ...
├── gui/                    # Angular Frontend
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml      # Multi-service deployment
├── start.sh               # Quick start script
├── DEPLOYMENT.md          # Deployment guide
├── FIELD_EXAMPLES.md      # Data entry examples
└── README.md             # This file
```

## Features

- **Entries**: Main operations table with date, description, category, person, work hours, and amounts
- **Persons**: Worker management with notes and status
- **Categories**: Expense category management with colors
- **Reports**: Summaries with time periods, filters, and totals
- **Role-based Access**: ADMIN (full CRUD) and USER (read-only) roles

## Technology Stack

- **Backend**: Java 21, Spring Boot 3.x, PostgreSQL 16, JWT Auth
- **Frontend**: Angular 17+, PrimeNG
- **Containerization**: Docker, Docker Compose

## Quick Start

1. Clone and setup:
   ```bash
   git clone <repository>
   cd vinodelnja
   cp .env.example .env
   ```

2. Build and run:
   ```bash
   docker compose build
   docker compose up -d
   ```

3. Access:
   - UI: http://localhost:8080
   - API: http://localhost:8081/api/v1
   - Swagger: http://localhost:8081/swagger-ui/index.html

## Default Credentials

- Admin: `admin/admin` (full access)
- User: `user/user` (read-only)

## API Endpoints

### Authentication
- `POST /auth/login` - Login with credentials
- `POST /auth/refresh` - Refresh access token

### Persons, Categories, Entries
- `GET /{resource}` - List with pagination, sorting, filtering
- `GET /{resource}/{id}` - Get by ID
- `POST /{resource}` - Create (ADMIN only)
- `PUT /{resource}/{id}` - Update (ADMIN only)
- `DELETE /{resource}/{id}` - Delete (ADMIN only)

### Reports
- `GET /reports/summary` - Generate summary reports with totals

## 🛠️ Development

### Backend API (Spring Boot)

```bash
cd api
./gradlew bootRun
```

- **Framework**: Spring Boot 3.3.0 + Java 21
- **Database**: PostgreSQL 16
- **Security**: JWT Authentication
- **Documentation**: OpenAPI/Swagger

### Frontend GUI (Angular)

```bash
cd gui
npm install
npm start
```

- **Framework**: Angular 17
- **UI Library**: PrimeNG
- **Internationalization**: English & Georgian
- **Themes**: Light & Dark modes

## Database

PostgreSQL 16 with Flyway migrations. Schema includes:
- `users` - Authentication and roles
- `persons` - Worker information
- `categories` - Expense categories
- `entries` - Main operations data