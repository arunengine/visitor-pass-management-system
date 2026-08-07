# Enterprise Visitor Pass Management System

A production-grade, full-stack **Visitor Pass Management System** built using the **MERN** stack (MongoDB, Express.js, React, Node.js). Designed for technical interviews with clean architecture, strict role-based access control (RBAC), real-time live dashboard analytics, audit activity logging, and enterprise report generation with CSV export.

---

## 🚀 Key Features

### 1. 🔐 Security & Authentication
- **HttpOnly Cookie JWT Authentication**: Secure session management preventing XSS vector attacks.
- **Bcrypt Password Hashing**: Passwords stored using salt-factored bcrypt hashes.
- **Role-Based Access Control (RBAC)**: Strict role guards for `ADMIN`, `RECEPTIONIST`, and `EMPLOYEE`.

### 2. 👨‍💼 Employee & User Management
- **Auto-Generated Employee Codes**: Sequential employee codes (`EMP001`, `EMP002`, ...).
- **Soft Deletion (`isDeleted`)**: Preserves relational integrity for visitor historical data.
- **Linked Accounts**: 1-to-1 strict relationship between User Accounts and Active Employees.
- **Self-Protection Guard**: Prevents Admin users from self-deactivating or self-deleting.

### 3. 🎫 Visitor Registration
- **Auto-Generated Visitor IDs**: Sequential visitor IDs (`VIS0001`, `VIS0002`, ...).
- **Strict Business Validation Rules (1–5)**:
  - Prevents active overlap visits.
  - Prevents same-day duplicate registrations.
  - Rejects past date/time scheduling.
  - Host pending limit guard (Max 3 pending requests per employee).

### 4. ✍️ Approval Workflow
- **State Transition (`PENDING` ➔ `APPROVED` / `REJECTED`)**: Unidirectional state machine with idempotency guards.
- **Host Ownership Guard**: Host employees can only review, approve, or decline visitor requests assigned to them.
- **Approval Remarks**: Host employees can attach remarks when approving or declining meeting requests.

### 5. 🚪 Visitor Check-In & Check-Out
- **State Transition (`APPROVED` ➔ `CHECKED_IN` ➔ `CHECKED_OUT`)**:
  - Rule 6: Only approved visitors can check in.
  - Rule 7: Re-check-in prevention guard.
  - Rule 8: Enforces check-out timestamp > check-in timestamp.
  - Rule 9: Rejection guard prevents checked-in access for declined visitors.
  - Rule 10: Active list visibility filtering for cancelled registrations.

### 6. 📊 Reports & CSV Export
- **Preset Date Filtering**: `Today`, `This Week`, `This Month`, and `Custom Range` (`startDate`, `endDate`).
- **MongoDB Aggregation Pipelines**:
  - **Department-Wise Breakdown**: Computes total visitors grouped by host department.
  - **Top 5 Most Visited Host Employees**: Ranks host employees by total appointment frequency.
- **One-Click CSV Export**: Downloads current filtered report logs directly into a `.csv` file.

### 7. 📜 System Activity History
- **Automated Audit Logs**: Saves system activity logs for `VISITOR_CREATED`, `VISITOR_UPDATED`, `VISITOR_CANCELLED`, `VISITOR_APPROVED`, `VISITOR_REJECTED`, `VISITOR_CHECKED_IN`, and `VISITOR_CHECKED_OUT`.

### 8. 📈 Live Dashboards
- Real-time MongoDB metrics aggregated for Admin Control Center, Reception Desk Portal, and Employee Host Portal.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 (Vite), React Router DOM v6, Tailwind CSS, Axios, React Hook Form, Zod Validation, Lucide Icons.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose ORM), JSON Web Tokens (JWT), Bcrypt.js, Express Validator, Morgan, Cookie Parser, CORS.

---

## 📁 Directory Structure

```text
jayamweb/
├── client/                      # React Vite Frontend App
│   ├── src/
│   │   ├── components/          # Reusable UI Components (Cards, Modals, Tables, Drawers)
│   │   ├── context/             # AuthContext State Provider
│   │   ├── hooks/               # Custom Hooks (useAuth)
│   │   ├── layouts/             # DashboardLayout, Navbar, Sidebar
│   │   ├── pages/               # AdminDashboard, ReceptionDashboard, EmployeeDashboard, Reports, ActivityHistory
│   │   ├── routes/              # AppRoutes, ProtectedRoute, RoleRoute
│   │   └── services/            # Axios API Services (auth, employee, user, visitor, dashboard, report, activity)
│   └── vite.config.js
│
└── server/                      # Node.js Express REST API Server
    ├── config/                  # Database connection (db.js)
    ├── constants/               # System enums and constants
    ├── controllers/             # Request handlers (auth, employee, user, visitor, dashboard, report, activity)
    ├── middleware/              # Auth protection, RBAC authorization, Error handler
    ├── models/                  # Mongoose models (User, Employee, Visitor, Activity)
    ├── routes/                  # Express API routers
    ├── services/                # Business logic & aggregation layer
    ├── utils/                   # JWT & Activity Logger helpers
    ├── validations/             # Express-validator schema rules
    ├── seedEmployees.js         # Employee database seeder
    ├── seedUsers.js             # User accounts database seeder
    ├── app.js                   # Express application setup
    └── server.js                # Server entry point
```

---

## 🔑 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/visitor_pass_db
JWT_SECRET=supersecretjwtkey_for_visitor_pass_management_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🚀 Installation & Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongodb://localhost:27017`) or MongoDB Atlas connection string.

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-repo/visitor-pass-system.git
cd visitor-pass-system

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd ../client
npm install
```

### 2. Seed Database with Initial Data

```bash
cd server
node seedEmployees.js
node seedUsers.js
```

### 3. Default Login Credentials

| Role | Email | Password | Linked Employee Code |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@company.com` | `Admin@123` | N/A |
| **RECEPTIONIST** | `receptionist@company.com` | `Reception@123` | N/A |
| **EMPLOYEE** | `employee@company.com` | `Employee@123` | `EMP001` (Amit Verma) |

---

## 🏃 Running the Application

### Start Backend Server
```bash
cd server
npm run dev
```
*Server runs at `http://localhost:5000`*

### Start Frontend Client
```bash
cd client
npm run dev
```
*Client runs at `http://localhost:5173`*

---

## 📡 API Documentation Overview

| Module | Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Login & receive HttpOnly cookie token |
| **Auth** | `POST` | `/api/v1/auth/logout` | All | Clear session cookie |
| **Auth** | `GET` | `/api/v1/auth/me` | All | Fetch current user details |
| **Employees** | `GET` | `/api/v1/employees` | Admin | Search, filter, and paginate active employees |
| **Employees** | `POST` | `/api/v1/employees` | Admin | Create employee (Auto-generates `EMP001`) |
| **Employees** | `PUT` | `/api/v1/employees/:id` | Admin | Update employee record |
| **Employees** | `DELETE` | `/api/v1/employees/:id` | Admin | Soft delete employee (`isDeleted: true`) |
| **Users** | `GET` | `/api/v1/users` | Admin | Fetch user accounts |
| **Users** | `POST` | `/api/v1/users` | Admin | Create user linked to active employee |
| **Visitors** | `POST` | `/api/v1/visitors` | Receptionist, Admin | Register new visitor (Auto-generates `VIS0001`) |
| **Visitors** | `GET` | `/api/v1/visitors/my-pending` | Employee, Admin | Fetch host pending requests |
| **Visitors** | `PATCH` | `/api/v1/visitors/:id/approve` | Employee, Admin | Approve pending request with remarks |
| **Visitors** | `PATCH` | `/api/v1/visitors/:id/reject` | Employee, Admin | Reject pending request with remarks |
| **Visitors** | `PATCH` | `/api/v1/visitors/:id/check-in` | Receptionist, Admin | Check in approved visitor |
| **Visitors** | `PATCH` | `/api/v1/visitors/:id/check-out` | Receptionist, Admin | Check out checked-in visitor |
| **Dashboard** | `GET` | `/api/v1/dashboard/admin` | Admin | Fetch live admin dashboard counts |
| **Reports** | `GET` | `/api/v1/reports/summary` | Receptionist, Admin | Fetch aggregated department breakdown & rankings |
| **Activity** | `GET` | `/api/v1/activities` | Receptionist, Admin | Fetch system audit history trail |

---

## 📦 Deployment Steps

1. **Build Client Bundle**:
   ```bash
   cd client
   npm run build
   ```
2. **Environment Configuration**: Set `NODE_ENV=production`, `MONGO_URI` to MongoDB Atlas cluster URI, and `CLIENT_URL` to production domain.
3. **Process Manager**: Use PM2 to run the Express backend server:
   ```bash
   pm2 start server/server.js --name "visitor-pass-api"
   ```

---

## 🏆 Project Status

**PROJECT READY FOR SUBMISSION**
