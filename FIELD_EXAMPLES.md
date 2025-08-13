# Vinodelnya - Field Examples & Data Guidelines

## 📝 Field Examples for Data Entry

### 👥 Persons (Workers)

| Field | Example | Description |
|-------|---------|-------------|
| **Name** | `Marko Jovanović` | Full name of the worker |
| **Note** | `Head vintner with 15 years experience. Specializes in red wines.` | Professional background, skills, notes |
| **Active** | `true/false` | Whether the person is currently employed |

**Real Examples:**
- `Simona Popović` - Head vintner with 15 years experience
- `Ana Nikolić` - Vineyard manager  
- `Petar Stojanović` - Seasonal worker
- `Milica Stanković` - Quality control specialist

---

### 🏷️ Categories (Expense Types)

| Field | Example | Description |
|-------|---------|-------------|
| **Name** | `Vineyard Expense` | Category name (unique) |
| **Description** | `Costs related to vineyard maintenance and grape growing` | Detailed explanation |
| **Color** | `#2E8B57` | Hex color code for visual identification |
| **Active** | `true/false` | Whether category is currently in use |

**Real Examples:**
- `Vineyard Expense` (#2E8B57) - Costs related to vineyard maintenance and grape growing
- `Winery Expense` (#4682B4) - Equipment, facilities, and production costs  
- `Labor Cost` (#DAA520) - Worker wages and benefits
- `Marketing` (#DC143C) - Promotional activities and sales expenses
- `Transportation` (#FF6B35) - Vehicle fuel, maintenance, and transport costs

---

### 📊 Entries (Operations & Expenses)

| Field | Example | Description |
|-------|---------|-------------|
| **Date** | `2025-01-15` | Date when work was performed |
| **Description** | `Vineyard pruning work - winter maintenance` | Detailed description of work/expense |
| **Person** | `Simona Popović` | Worker who performed the task |
| **Category** | `Vineyard Expense` | Type of expense/work |
| **Work Hours** | `8.0` | Hours worked (decimal: 8.5 = 8h 30min) |
| **Amount Paid** | `240.00` | Amount already paid (EUR) |
| **Amount Due** | `0.00` | Outstanding amount (EUR) |

**Real Examples:**
- `Grape sorting and quality inspection` - Person: Milica Stanković, Category: Winery Expense, Hours: 6.5, Paid: €195.00
- `Equipment maintenance - pressing machine` - Person: Marko Jovanović, Category: Equipment, Hours: 4.0, Due: €350.00
- `Social media campaign setup` - Person: Ana Nikolić, Category: Marketing, Hours: 3.0, Paid: €150.00

---

### 🍷 Events (Wine Tastings & Tours)

| Field | Example | Description |
|-------|---------|-------------|
| **Visit Date** | `2025-02-15` | Date of the event |
| **Visit Time** | `12:00` | Start time (24h format) |
| **Company** | `Travel Dreams Ltd` | Tour company or organization |
| **Contact Name** | `Maria Santos` | Main contact person |
| **Contact Phone** | `+381 64 123 4567` | Contact phone number |
| **Adult Lunch Guests** | `8` | Adults participating in lunch |
| **Adult Tasting Guests** | `8` | Adults participating in wine tasting |
| **Children Guests** | `2` | Children under 12 |
| **Extra Guests** | `1` | Guides, drivers, etc. |
| **Hot Dish Vegetarian** | `Vegetarian pasta` | Vegetarian meal option |
| **Hot Dish Meat** | `Grilled chicken` | Meat meal option |
| **Masterclass** | `true/false` | Premium educational experience |
| **Meal Extra Info** | `Allergy: nuts` | Special dietary requirements |
| **Lunch Rate** | `25.00` | Price per person for lunch (EUR) |
| **Tasting Rate** | `15.00` | Price per person for tasting (EUR) |
| **Added Wines Value** | `45.00` | Value of additional wine purchases |
| **Extra Charge Comment** | `Extra wine bottle` | Description of additional charges |
| **Extra Charge Amount** | `30.00` | Additional charge amount |
| **Invoice Issued** | `true/false` | Whether invoice has been sent |

**Real Examples:**
- **Family Visit**: 6 lunch + 6 tasting guests, 1 child, €22 lunch/€12 tasting, Contact: Ana Petrović (+381 65 555 1234)
- **VIP Group**: 12 lunch + 15 tasting, Masterclass, €30 lunch/€20 tasting, Company: Elite Tours, Special arrangements
- **Corporate Event**: 20 guests, Special pricing, Custom menu, Company: Business Travel Co.

---

### 📈 Reports & Analytics

**Date Range Examples:**
- **Monthly**: 2025-01-01 to 2025-01-31
- **Quarterly**: 2025-01-01 to 2025-03-31  
- **Seasonal**: 2025-03-01 to 2025-05-31 (Spring)
- **Annual**: 2025-01-01 to 2025-12-31

**Filter Combinations:**
- **By Worker**: Select multiple persons (Simona, Marko, Ana)
- **By Expense Type**: Select multiple categories (Vineyard, Equipment, Labor)
- **By Date Range**: Specific period + worker combination
- **Mixed Filters**: Date range + specific categories + specific workers

---

## 💡 Data Entry Best Practices

### 📅 Date Formats
- **ISO Format**: YYYY-MM-DD (2025-01-15)
- **Time Format**: HH:MM (14:30)

### 💰 Currency
- **Format**: Use decimal notation (25.50, not 25,50)
- **Currency**: EUR (Euro) 
- **Precision**: Up to 2 decimal places

### ⏰ Work Hours
- **Format**: Decimal hours (8.5 = 8 hours 30 minutes)
- **Examples**: 0.5, 1.0, 4.25, 8.0

### 📱 Phone Numbers
- **International**: +381 64 123 4567
- **Domestic**: 064 123 4567
- **Format**: Include country code for international guests

### 🎨 Colors
- **Format**: Hex color codes (#2E8B57)
- **Suggestions**: 
  - Green tones for vineyard work
  - Blue tones for winery operations  
  - Gold tones for labor costs
  - Red tones for marketing

### 📝 Descriptions
- **Be Specific**: "Vineyard pruning - section A" vs "Pruning"
- **Include Context**: "Equipment maintenance - pressing machine" 
- **Add Details**: "Wine tasting event - VIP group with masterclass"

---

## 🔍 Search & Filter Examples

### Multi-Select Filters
- **Persons**: Select Simona + Marko + Ana to see their combined work
- **Categories**: Select Vineyard + Equipment to see related expenses
- **Date Range**: January 1-31 + specific workers = monthly worker report

### Advanced Filtering
- **URL Format**: `/entries?dateFrom=2025-01-01&dateTo=2025-01-31&person.in=1,2,3&category.in=1,2`
- **Multiple Values**: Use comma-separated IDs (1,2,3)
- **Date Ranges**: Combine with entity filters for targeted reports