# Vinodelnya - Complete Deployment Guide

## ✅ What's Included

### Backend (Spring Boot + Java 21)
- ✅ **Authentication**: JWT-based with admin/admin and user/user accounts
- ✅ **Entities**: User, Person, Category, Entry, Event with full CRUD
- ✅ **API**: RESTful endpoints with pagination, sorting, and filtering
- ✅ **Database**: PostgreSQL with Flyway migrations and sample data
- ✅ **Security**: Role-based access (ADMIN/USER) with method-level security
- ✅ **Documentation**: OpenAPI/Swagger integration

### Frontend (Angular 17 + PrimeNG)
- ✅ **Components**: Login, Dashboard, Persons, Categories, Entries, Events, Reports
- ✅ **Layout**: Sidebar navigation with responsive design
- ✅ **Authentication**: JWT token management with auto-refresh
- ✅ **Tables**: Server-side pagination, sorting, filtering with totals
- ✅ **Forms**: Modal dialogs with validation and role-based permissions

### Infrastructure
- ✅ **Docker**: Multi-container setup with PostgreSQL, Backend, Frontend
- ✅ **Environment**: Configurable via .env file
- ✅ **Networking**: Proper CORS configuration and proxy setup

## 🚀 Quick Start

1. **Navigate to project**:
   ```bash
   cd /Users/di/prog/java/vinodelnya
   ```

2. **Start the application**:
   ```bash
   ./start.sh
   ```

3. **Access the application**:
   - 🌐 **Frontend**: http://localhost:8080
   - 🔧 **Backend API**: http://localhost:8081/api/v1
   - 📚 **API Docs**: http://localhost:8081/swagger-ui/index.html

4. **Login credentials**:
   - 👨‍💼 **Admin**: `admin/admin` (full CRUD access)
   - 👤 **User**: `user/user` (read-only access)

## 📊 Sample Data Included

### Persons (Workers)
- Simona Popović (Head vintner)
- Marko Jovanović (Assistant winemaker)
- Ana Nikolić (Vineyard manager)
- Stefan Mirković (Vineyard supervisor)
- Jovana Đorđević (Wine cellar master)
- +8 more workers with different specializations

### Categories
- Vineyard Expense (🟢 #2E8B57)
- Winery Expense (🔵 #4682B4)
- Labor Cost (🟡 #DAA520)
- Marketing (🔴 #DC143C)
- Equipment (🟤 #8B4513)
- Transportation (🟠 #FF6B35)
- +6 more categories with colors

### Entries
- 50+ sample entries spanning January-March 2025
- Various work types: pruning, equipment maintenance, marketing, etc.
- Different workers and expense categories
- Realistic amounts and work hours

### Events
- 3 sample wine tasting/tour events
- Different group sizes and pricing
- Contact information and special arrangements

## 🛠 Development Mode

### Backend Development
```bash
cd backend
./gradlew bootRun
```

### Frontend Development
```bash
cd frontend/vinodelnja-ui
npm install
npm start
```

## 📋 API Features

### Filtering Support
- **String fields**: `.contains`, `.eq`, `.in`
- **Numeric fields**: `.gte`, `.lte`, `.between`
- **Date fields**: `.gte`, `.lte`, `.between`
- **Boolean fields**: `.eq`

### Multi-entity Filtering
- Select multiple persons: `person.in=1,2,3`
- Select multiple categories: `category.in=1,2,3`
- Combined filters with date ranges

### Totals
- **Page totals**: Sum of current page data
- **Grand totals**: Sum of all filtered data
- **Work hours**: Total hours worked
- **Financial**: Amount paid + amount due

## 🎯 Key Features Demonstration

1. **Role-based Access**: Login as admin vs user to see different permissions
2. **Server-side Pagination**: Tables load data efficiently with large datasets
3. **Advanced Filtering**: Multi-select filters for persons and categories
4. **Real-time Totals**: Page and grand totals update with filtering
5. **Responsive Design**: Works on desktop and mobile devices

## 🔧 Configuration

All configuration in `.env` file:
- Database credentials
- JWT secrets
- CORS settings
- Application profiles

The system is fully functional and ready for demonstration!