# 🚘 Fleet Management System - Project Plan

> Comprehensive project roadmap and phase breakdown for the Fleet Management System implementation.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Phases](#project-phases)
- [Phase Details](#phase-details)
- [Timeline](#timeline)
- [Key Metrics](#key-metrics)

---

## Overview

The Fleet Management System is a comprehensive solution designed to help judiciary staff efficiently manage vehicle logistics, track fuel consumption, schedule maintenance, manage insurance, and monitor driver information. The system consists of three interconnected components:

1. **Web Dashboard** (Next.js) - Administrative and management interface
2. **Mobile App** (React Native) - Driver-focused mobile application
3. **Backend API** (Node.js/Express) - Core business logic and data management

---

## Project Phases

### Phase 1 – Requirements & Design ✅ COMPLETE

**Objectives:**
- Gather comprehensive requirements from judiciary staff
- Define user roles and access levels
- Design database schema
- Create UI/UX mockups

**Deliverables:**
- ✅ User role definitions
- ✅ Database schema design
- ✅ UI/UX mockups for web and mobile
- ✅ Project documentation

**User Roles Defined:**
1. **Admin:** Full system access, manage users, system configuration
2. **Fleet Manager:** Manage vehicles, drivers, maintenance, insurance, fuel tracking, reports
3. **Driver:** View assigned vehicle, log fuel entries, receive notifications
4. **Auditor/Viewer:** Read-only access to reports and analytics

---

### Phase 2 – Database & Backend Setup 🔄 IN PROGRESS

**Status:** Core infrastructure being established

**Objectives:**
- Set up PostgreSQL database
- Create Express.js REST API
- Implement authentication and authorization
- Build core API endpoints

**Database Schema:**

```sql
-- Users and Authentication
users (id, email, password_hash, role, created_at, updated_at)
  → admin, fleet_manager, driver, auditor

-- Fleet Management
drivers (id, user_id, license_number, license_expiry, retirement_date, vehicle_id, created_at, updated_at)
vehicles (id, name, registration_number, status, make, model, year, mileage, created_at, updated_at)

-- Operations
fuel_logs (id, vehicle_id, driver_id, liters, cost, odometer, receipt_photo_url, date, created_at)
maintenance_logs (id, vehicle_id, service_type, cost, date, notes, created_at)

-- Compliance
insurance (id, vehicle_id, provider, policy_number, expiry_date, coverage_amount, created_at, updated_at)
```

**API Endpoints to Implement:**

**Authentication**
```
POST   /api/auth/register        - User registration
POST   /api/auth/login           - User login
GET    /api/auth/me              - Current user info
POST   /api/auth/refresh         - Refresh JWT token
POST   /api/auth/logout          - Logout
```

**Vehicles**
```
GET    /api/vehicles             - List all vehicles (with filters)
POST   /api/vehicles             - Create new vehicle
GET    /api/vehicles/:id         - Get vehicle details
PATCH  /api/vehicles/:id         - Update vehicle info
DELETE /api/vehicles/:id         - Delete vehicle (soft delete)
PATCH  /api/vehicles/:id/status  - Update vehicle status
GET    /api/vehicles/:id/history - View vehicle history (fuel, maintenance)
```

**Drivers**
```
GET    /api/drivers              - List all drivers
POST   /api/drivers              - Create driver
GET    /api/drivers/:id          - Get driver details
PATCH  /api/drivers/:id          - Update driver info
DELETE /api/drivers/:id          - Delete driver
GET    /api/drivers/:id/vehicles - Get assigned vehicle
```

**Fuel Tracking**
```
POST   /api/fuel/log             - Log fuel entry (with receipt upload)
GET    /api/fuel/logs            - Get fuel history (with filters)
GET    /api/fuel/logs/:id        - Get specific fuel entry
PATCH  /api/fuel/logs/:id        - Update fuel entry
DELETE /api/fuel/logs/:id        - Delete fuel entry
GET    /api/fuel/consumption     - Calculate consumption stats (km/litre)
GET    /api/fuel/anomalies       - Detect abnormal consumption
```

**Maintenance**
```
POST   /api/maintenance/log      - Log service/maintenance
GET    /api/maintenance/logs     - Get maintenance history
GET    /api/maintenance/logs/:id - Get specific entry
PATCH  /api/maintenance/logs/:id - Update maintenance record
DELETE /api/maintenance/logs/:id - Delete maintenance record
GET    /api/maintenance/due      - Get overdue maintenance items
GET    /api/maintenance/scheduled- Get scheduled services
```

**Insurance**
```
POST   /api/insurance            - Add insurance policy
GET    /api/insurance            - Get all policies
GET    /api/insurance/:id        - Get policy details
PATCH  /api/insurance/:id        - Update policy
DELETE /api/insurance/:id        - Delete policy
GET    /api/insurance/expiring   - Get expiring soon (within 30 days)
POST   /api/insurance/:id/document - Upload policy document
```

**Reports**
```
GET    /api/reports/vehicles     - Vehicle usage report
GET    /api/reports/fuel         - Fuel consumption analytics
GET    /api/reports/drivers      - Driver information report
GET    /api/reports/maintenance  - Maintenance costs report
GET    /api/reports/export       - Export reports (PDF/Excel)
```

**Deliverables:**
- [ ] PostgreSQL database with schema
- [ ] Express.js API with core endpoints
- [ ] JWT authentication system
- [ ] Role-based access control middleware
- [ ] Database validation and constraints
- [ ] Error handling and logging
- [ ] API documentation (Swagger/OpenAPI)

---

### Phase 3 – Web Dashboard (Next.js) ⏳ PENDING

**Timeline:** February 2026

**Objectives:**
- Build responsive web dashboard
- Implement fleet management features
- Create reporting and analytics pages
- Deploy to production

**Dashboard Page:**
- Fleet status overview
  - Available vehicles count
  - In-use vehicles count
  - Under-maintenance vehicles
  - Out-of-service vehicles
- Key metrics
  - Total fuel cost (month/year)
  - Average km/litre
  - Overdue maintenance count
  - Insurance expiring soon count
- Real-time alerts banner
- Quick action buttons
- Weather widget

**Vehicles Module:**
- Vehicle list with search and filters
  - Filter by status, make, model, year
  - Sort by mileage, registration date
- Add new vehicle form
- Edit vehicle details
- Update vehicle status
- View vehicle history
  - Fuel logs
  - Maintenance records
  - Insurance details
- Delete vehicle (with confirmation)

**Drivers Module:**
- Driver list with filters
  - Filter by status, assignment
- Add new driver form
- Edit driver information
  - License number and expiry
  - Retirement date countdown
  - Contact information
- Assign/reassign vehicle
- View driver history
- License expiry alerts
- Retirement countdown alerts

**Fuel Tracking:**
- Fuel log list with filters
- View consumption analytics
  - km/litre per vehicle
  - Monthly/yearly trends
  - Cost analysis
- Anomaly detection
  - Flag unusual consumption
  - Generate alerts
- Export fuel reports

**Maintenance Module:**
- Maintenance log list
- Schedule maintenance
- Log completed services
- View overdue items
  - Alert banner for overdue
  - Estimated cost
  - Schedule next service
- Maintenance history per vehicle
- Cost tracking and trends

**Insurance Module:**
- Insurance policy list
- Add new insurance policy
- Upload policy documents
- Set expiry reminders
- View expiring policies
  - 30-day warning alerts
  - 7-day critical alerts
- Policy history and renewals

**Reports Module:**
- Vehicle Usage Report
  - Total km traveled
  - Availability percentage
  - Downtime analysis
- Fuel Report
  - Consumption by vehicle
  - Cost per km
  - Monthly trends
- Driver Report
  - Retirement countdown
  - License expiry dates
  - Assignment history
- Maintenance Report
  - Service costs summary
  - Overdue items
  - Upcoming services
- Export Options
  - PDF generation
  - Excel export
  - Email delivery
  - Scheduled exports

**UI Components:**
- Navigation sidebar
- Header with user profile
- Alert banner system
- Status indicators (color-coded)
- Data tables with pagination
- Modal forms
- Charts and graphs
- Loading states
- Error boundaries

**Deliverables:**
- [ ] Responsive web dashboard
- [ ] All modules and pages
- [ ] Real-time alert system
- [ ] Report generation and export
- [ ] Role-based page access
- [ ] Deployed on Vercel
- [ ] User documentation

---

### Phase 4 – Mobile App (React Native/Expo) ⏳ PENDING

**Timeline:** March 2026

**Objectives:**
- Build driver-focused mobile app
- Implement fuel logging functionality
- Set up push notifications
- Deploy to Play Store

**Driver Login:**
- Email/password authentication
- JWT token management
- Biometric login (fingerprint/face)
- Remember me functionality
- Logout functionality

**Driver Dashboard:**
- Assigned vehicle card
  - Vehicle details
  - Current status
  - Mileage
  - Last fuel entry date
- Quick access buttons
  - Log fuel
  - View vehicle details
  - View notifications
  - View profile
- Recent fuel entries list

**Fuel Tracking:**
- Fuel entry form
  - Liters consumed
  - Cost paid
  - Odometer reading
  - Date of refueling
  - Fuel station (optional)
  - Notes (optional)
- Receipt photo upload
  - Camera integration
  - Gallery picker
  - Image compression
- Confirm and submit
- Fuel history list
  - Filter by date range
  - Calculate average consumption
  - Sort options

**Notifications:**
- Push notification handling
  - New vehicle assignment
  - Maintenance reminder
  - Insurance expiry warning
  - Fuel anomaly alert
  - Retirement warning (30, 7 days)
  - Shift assignment notification
- Notification history
- Mark as read/unread
- In-app notification bell

**Driver Profile:**
- Display driver information
  - Full name
  - License number
  - License expiry date (with countdown)
  - Retirement date (with countdown)
  - Contact information
  - Current assignment
- Edit profile (partial)
- Change password
- Logout button

**Offline Functionality:**
- Store fuel entries locally
- Sync when connection restored
- Offline indicator
- Queue management for uploads

**Deliverables:**
- [ ] Fully functional mobile app
- [ ] Push notification integration
- [ ] Offline-first architecture
- [ ] Deployed on Play Store
- [ ] App screenshots and store listing
- [ ] User manual for drivers

---

### Phase 5 – Notifications & Alerts ⏳ PENDING

**Timeline:** April 2026

**Objectives:**
- Implement web alert system
- Set up Firebase Cloud Messaging
- Configure alert rules
- Test notification delivery

**Web Alert System:**
- Alert banner component
  - Color-coded (red/yellow/green)
  - Dismissible
  - Multiple alerts support
  - Auto-dismiss option
- Alert types
  - Insurance expiry (30, 7 days before)
  - Maintenance overdue (1, 7 days)
  - Driver retirement (90, 30, 7 days)
  - Fuel consumption anomaly
  - Vehicle status change

**Mobile Push Notifications (FCM):**
- Vehicle assignment notification
  - Vehicle details
  - Assignment date/time
  - Assigned by
- Fuel anomaly alert
  - Consumption percentage deviation
  - Recommended action
- Maintenance reminder
  - Due date
  - Service type
- Insurance expiry alert
  - Days remaining
  - Renewal instructions
- Retirement warning
  - Days until retirement
  - HR contact information
- Weather alerts
  - Storm warning
  - Heavy rain alert
  - Flood warning

**Alert Rules:**
| Alert Type | Trigger | Frequency | Recipients |
|-----------|---------|-----------|-----------|
| Insurance Expiry | 30 days before | Once | Fleet Manager, Admin |
| Insurance Critical | 7 days before | Daily | Fleet Manager, Admin |
| Maintenance Overdue | Service date passed | Daily | Fleet Manager, Admin |
| Fuel Anomaly | 20% deviation | Per entry | Fleet Manager |
| Retirement Warning | 90 days before | Once | Manager |
| License Expiry | 30 days before | Once | Driver |

**Deliverables:**
- [ ] Web alert system fully functional
- [ ] Firebase Cloud Messaging configured
- [ ] Push notification delivery tested
- [ ] Alert rules engine
- [ ] Notification preferences UI
- [ ] Email notification template

---

### Phase 6 – Reports & Analytics ⏳ PENDING

**Timeline:** May 2026

**Objectives:**
- Build comprehensive reporting system
- Implement analytics and dashboards
- Set up export functionality
- Create scheduled reports

**Vehicle Reports:**
- Fleet Status Report
  - Available: count & list
  - In-use: count & list
  - Under-maintenance: count & list
  - Out-of-service: count & list
- Vehicle Utilization
  - Total km traveled
  - Average monthly km
  - Days in use vs available
  - Downtime analysis
- Vehicle History
  - Complete service history
  - Insurance records
  - Fuel consumption
  - Mileage progression

**Fuel Reports:**
- Fuel Consumption Analysis
  - Average km/litre per vehicle
  - Liters consumed per month
  - Total monthly cost
  - Cost per km analysis
- Fuel Anomaly Detection
  - Unusual consumption patterns
  - Driver comparison
  - Historical trends
- Fuel Cost Trends
  - Monthly cost progression
  - Yearly comparison
  - Projected annual budget
  - Cost per vehicle

**Driver Reports:**
- Driver Retirement Report
  - Retirement countdown
  - Days remaining (sorted)
  - Critical alerts (< 30 days)
  - HR notification list
- License Expiry Report
  - License expiry dates
  - Renewal notifications
  - Critical alerts (< 7 days)
- Driver Performance
  - Assignment history
  - Fuel entry frequency
  - Compliance metrics
  - Safety incidents (if tracked)

**Maintenance Reports:**
- Maintenance Schedule
  - Upcoming services
  - Overdue services
  - Service history
- Maintenance Costs
  - Total monthly cost
  - Cost per vehicle
  - Service type breakdown
  - Quarterly/yearly totals
- Maintenance Trends
  - Most common issues
  - Average repair time
  - Cost forecasting

**Export Options:**
- PDF Export
  - Professional formatting
  - Logo and branding
  - Charts and tables
  - Multi-page support
- Excel Export
  - Multiple sheets
  - Formulas for calculations
  - Pivot table ready
  - Sortable and filterable
- Email Delivery
  - Schedule report generation
  - Automatic email sending
  - Distribution list management
  - Attachment formats
- Print Preview
  - Page layout control
  - Print-friendly formatting

**Deliverables:**
- [ ] All report modules implemented
- [ ] Analytics dashboard with charts
- [ ] PDF/Excel export working
- [ ] Scheduled report automation
- [ ] Report performance optimized
- [ ] Report documentation

---

### Phase 7 – Weather Integration ⏳ PENDING

**Timeline:** May 2026

**Objectives:**
- Integrate weather API
- Display weather information
- Generate weather-based alerts

**OpenWeatherMap Integration:**
- API key configuration
- Current weather retrieval
- 5-day forecast
- Location-based weather
- Historical weather data

**Dashboard Weather Widget:**
- Current temperature
- Weather condition
- Wind speed
- Humidity
- UV index
- Air quality index

**Weather-Based Alerts:**
- Storm warning (lightning detected)
- Heavy rain alert (> 10mm/hour)
- Flood warning (extreme rain)
- Extreme heat warning (> 35°C)
- Extreme cold warning (< 0°C)
- Poor visibility warning (heavy fog)

**Trip Recommendations:**
- Safety recommendations based on weather
- Best time for vehicle trips
- Route suggestions

**Deliverables:**
- [ ] Weather API integrated
- [ ] Weather widget on dashboard
- [ ] Weather alerts configured
- [ ] Weather-based trip recommendations

---

### Phase 8 – Testing & Deployment ⏳ PENDING

**Timeline:** June 2026

**Objectives:**
- Comprehensive testing
- Production deployment
- Staff training
- Go-live support

**Testing Phase:**
- Unit Tests (Backend)
  - API endpoints
  - Authentication
  - Authorization
  - Database queries
  - Error handling
- Integration Tests
  - API + Database
  - External services (Firebase)
  - File upload/download
- UI Testing (Web)
  - Component tests
  - Page navigation
  - Form validation
  - Responsive design
- Mobile Testing
  - Android and iOS
  - Push notifications
  - Offline functionality
  - Performance

**Pilot Launch:**
- Select 10-20 vehicles
- Select 5-10 drivers
- 2-week test period
- Daily monitoring
- Feedback collection
- Bug fixes and improvements

**Deployment:**
- Production database setup
- Backend deployment (Render/AWS)
- Web app deployment (Vercel)
- Mobile app deployment (Play Store)
- Domain and SSL setup
- Monitoring and logging

**Training:**
- Admin training (system setup, user management)
- Fleet Manager training (all features)
- Driver training (mobile app, fuel logging)
- Support staff training (help desk procedures)
- Documentation (user manuals, quick guides, FAQs)

**Deliverables:**
- [ ] All tests passing (> 80% coverage)
- [ ] Pilot launch completed successfully
- [ ] Production deployment checklist
- [ ] Training materials and sessions
- [ ] Support procedures documented
- [ ] Go-live support team assigned

---

### Phase 9 – Future Enhancements 📝 PLANNED

**Post-launch features to consider:**

**GPS & Location Tracking:**
- Real-time vehicle location on map
- Route history and analytics
- Geofence alerts (unauthorized movement)
- Fuel consumption correlation with location

**AI & Machine Learning:**
- Predictive maintenance forecasting
- Fuel consumption predictions
- Anomaly detection improvements
- Driver behavior analysis

**Advanced Analytics:**
- Machine learning-based insights
- Predictive maintenance forecasting
- Anomaly detection for consumption
- Driver performance scoring

**Expense Tracking:**
- Tire replacement costs
- Oil and fluid changes
- Repair costs by category
- Parts inventory management

**Driver Performance:**
- Fuel efficiency scoring
- Maintenance compliance
- Assignment completion rate
- Safety metrics

**HR Integration:**
- Government HR system sync
- Automatic retirement date updates
- License expiry from central database
- Payroll integration

**Multi-Location Support:**
- Multiple depot management
- Inter-depot vehicle transfers
- Location-specific reporting
- Distributed fuel management

---

## Timeline

| Phase | Target Start | Target End | Status | Owner |
|-------|--------------|-----------|--------|-------|
| 1. Requirements & Design | Dec 2025 | Dec 2025 | ✅ Complete | PM |
| 2. Backend & Database | Jan 2026 | Jan 2026 | 🔄 In Progress | Backend Team |
| 3. Web Dashboard | Feb 2026 | Feb 2026 | ⏳ Pending | Frontend Team |
| 4. Mobile App | Mar 2026 | Mar 2026 | ⏳ Pending | Mobile Team |
| 5. Notifications & Alerts | Apr 2026 | Apr 2026 | ⏳ Pending | Backend Team |
| 6. Reports & Analytics | May 2026 | May 2026 | ⏳ Pending | Frontend Team |
| 7. Weather Integration | May 2026 | May 2026 | ⏳ Pending | Backend Team |
| 8. Testing & Deployment | Jun 2026 | Jun 2026 | ⏳ Pending | QA/DevOps |
| 9. Future Enhancements | Q3+ 2026 | Q4+ 2026 | 📝 Planned | Product |

---

## Key Metrics

### Success Criteria

| Metric | Target | Current |
|--------|--------|---------|
| System Uptime | 99.5% | - |
| API Response Time | < 200ms | - |
| Page Load Time | < 2s | - |
| Test Coverage | > 80% | - |
| User Adoption | 100% of staff | - |
| Data Accuracy | 100% | - |
| Bug-free go-live | Yes | - |

### Performance Targets

- API response time: < 200ms (p95)
- Page load time: < 2 seconds
- Mobile app: < 50MB
- Database queries: < 100ms (p95)

### Quality Targets

- Unit test coverage: > 80%
- Integration test coverage: > 70%
- E2E test coverage: > 60%
- Zero critical bugs at launch

---

## Risk Management

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Database performance issues | Medium | High | Load testing, optimization |
| Integration delays with Firebase | Medium | Medium | Early integration, fallback plan |
| Staff adoption resistance | Low | Medium | Training, support, incentives |
| Timeline delays | Medium | High | Buffer time, agile approach |
| Security vulnerabilities | Low | High | Code review, penetration testing |

---

**Last Updated:** January 9, 2026  
**Project Lead:** Fleet Management Team  
**Status:** Active Development
