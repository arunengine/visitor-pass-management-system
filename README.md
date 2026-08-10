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

## 📦 Production Deployment Guide

### 1. MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a database cluster.
2. Under **Network Access**, add IP `0.0.0.0/0` to allow connection access from cloud providers (Render).
3. Under **Database Access**, create a database user with read/write access.
4. Copy the connection string format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/visitor_pass_db?retryWrites=true&w=majority`

---

### 2. Backend Deployment (Render)

1. Push your repository to GitHub.
2. Sign in to [Render.com](https://render.com) and click **New + ➔ Web Service**.
3. Connect your GitHub repository.
4. Configure Render Web Service settings:
   - **Name**: `visitor-pass-system-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add **Environment Variables** in Render Dashboard:
   - `PORT`: `5000`
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/visitor_pass_db`
   - `JWT_SECRET`: `supersecretjwtkey_for_visitor_pass_management_2026`
   - `CLIENT_URL`: `https://visitor-pass-system.vercel.app`
   - `NODE_ENV`: `production`
6. Click **Create Web Service**. Save your deployed Render URL (e.g. `https://visitor-pass-system-backend.onrender.com`).

---

### 3. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com) and click **Add New... ➔ Project**.
2. Import your GitHub repository.
3. Configure Vercel Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel Dashboard:
   - `VITE_API_URL`: `https://visitor-pass-system-backend.onrender.com/api`
5. Click **Deploy**. Vercel will build your client application and assign a domain (e.g. `https://visitor-pass-system.vercel.app`).
6. Update `CLIENT_URL` in your Render backend environment variables to match your final Vercel URL.

---

## 🛠️ Production Troubleshooting Checklist

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **CORS Blocked Error** | `CLIENT_URL` mismatch | Set `CLIENT_URL` on Render to match your exact Vercel URL (including `https://`). |
| **Cookies Not Saving** | Missing `sameSite: 'none'` or `secure: true` | Ensure `NODE_ENV=production` is set so JWT cookies use `sameSite: 'none'` and `secure: true`. |
| **404 Page Not Found on Refresh** | SPA routing broken | Verify `client/vercel.json` rewrites all routes `/(.*)` to `/index.html`. |
| **MongoDB Connection Failure** | IP whitelist blocking Render | In MongoDB Atlas Network Access, add `0.0.0.0/0`. |

---

## 🏆 Project Status

**PROJECT READY FOR SUBMISSION**
