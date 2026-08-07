# Visitor Pass Management System (MERN Stack)

Production-grade, clean, and easily explainable Visitor Pass Management System architecture designed for technical interviews.

---

## Tech Stack Overview

### Backend
- **Node.js & Express.js**: REST API web framework
- **MongoDB & Mongoose**: Database & Object Data Modeling (ODM)
- **JWT & bcrypt**: Authentication & Password hashing
- **express-validator**: Request data validation
- **morgan & cors & cookie-parser**: HTTP logging, cross-origin resource sharing, and cookie parsing

### Frontend
- **React (Vite)**: Fast component-based UI development
- **React Router DOM v6**: Client-side single-page app routing
- **Tailwind CSS**: Utility-first CSS styling
- **Axios**: HTTP request client
- **React Hook Form & Zod**: Form state handling & schema validation
- **Context API**: Global state management

---

## Directory Architecture

```
visitor-pass-management-system/
├── server/
│   ├── config/          # Database & third-party configurations (e.g. db.js)
│   ├── controllers/     # Express route handlers (Extract req parameters, invoke services)
│   ├── middleware/      # Auth checks, error handling, validation middleware
│   ├── models/          # Mongoose database schemas & models
│   ├── routes/          # Express route definitions linking URLs to controllers
│   ├── services/        # Business logic operations & database queries
│   ├── validations/     # Request body validation rules
│   ├── utils/           # Helper utility functions
│   ├── constants/       # Global constants (Roles, HTTP Status Codes)
│   ├── seed/            # Initial database seed scripts
│   ├── app.js           # Express app setup & middleware mounting
│   └── server.js        # Server entry point & listener
│
├── client/
│   ├── src/
│   │   ├── assets/      # Static images and icons
│   │   ├── components/  # Reusable UI components (buttons, inputs, tables, cards, modal, loader)
│   │   ├── context/     # React Context API providers (AuthContext)
│   │   ├── hooks/       # Custom React hooks (useAuth)
│   │   ├── layouts/     # Page layout wrappers (Navbar, Sidebar, DashboardLayout)
│   │   ├── pages/       # Page views (Login, Dashboards, Unauthorized, 404)
│   │   ├── routes/      # Client-side routing configuration (AppRoutes)
│   │   ├── services/    # API client configurations (Axios base instance)
│   │   ├── utils/       # Helper formatting functions
│   │   ├── constants/   # Route & Role constants
│   │   ├── App.jsx      # Provider wrapper
│   │   └── main.jsx     # React DOM entry point
│   ├── vite.config.js   # Vite bundling & server proxy settings
│   └── tailwind.config.js# Tailwind CSS design token setup
│
├── package.json         # Root scripts runner
└── README.md            # Documentation
```

---

## Setup & Running Locally

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Start Backend Server**
   ```bash
   npm run dev:server
   ```
   Backend will launch at `http://localhost:5000`

3. **Start Frontend Client**
   ```bash
   npm run dev:client
   ```
   Frontend will launch at `http://localhost:5173`
