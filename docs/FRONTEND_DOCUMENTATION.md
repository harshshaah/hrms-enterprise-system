# Frontend Technical Documentation

## 1. Architecture & Technology Stack

The client application is built with **React 19** using **Vite 8** as the build engine and bundler. The UI is designed using **Tailwind CSS 4** for styling, **Lucide React** for icons, **Recharts** for charts, and **Sonner** for toast notifications.

```
+--------------------------------------------------------------------------+
|                             React 19 Frontend                            |
+--------------------------------------------------------------------------+
|  Routing: React Router v7        |  State: AuthContext (React Context)  |
|  Styling: Tailwind CSS 4         |  Icons: Lucide React                 |
|  Charts: Recharts                |  Notifications: Sonner               |
|  Reporting: jsPDF, SheetJS XLSX  |  Networking: Fetch API Wrapper       |
+--------------------------------------------------------------------------+
```

---

## 2. Directory Structure

```
frontend/src/
├── assets/                  # Static media, icons, and hero illustrations
├── components/              # Shared reusable components
│   ├── EmployeeDocuments.jsx# Document listing and download card
│   ├── Navbar.jsx           # Top header navigation with user profile menu
│   ├── RoleBasedDashboard.jsx# Dynamic component router for dashboards
│   ├── Sidebar.jsx          # Collapsible RBAC navigation drawer
│   └── Statcard.jsx         # KPI metric card with icons and trends
├── context/
│   └── AuthContext.jsx      # Authentication state and token persistence
├── layouts/
│   └── DashboardLayout.jsx  # Main application layout wrapper
├── pages/                   # Application view components (34 pages)
│   ├── Login.jsx, ForgotPassword.jsx, ResetPassword.jsx
│   ├── Dashboard.jsx, EmployeeDashboard.jsx
│   ├── Employees.jsx, AddEmployee.jsx, EditEmployee.jsx, EmployeeDetails.jsx
│   ├── Departments.jsx, AddDepartment.jsx, EditDepartment.jsx, DepartmentDetails.jsx
│   ├── Attendance.jsx, AddAttendance.jsx, EditAttendance.jsx, AttendanceDetails.jsx
│   ├── Leave.jsx, AddLeave.jsx, EditLeave.jsx, LeaveDetails.jsx
│   ├── Payroll.jsx, AddPayroll.jsx, EditPayroll.jsx, PayrollDetails.jsx
│   ├── Performance.jsx, AddPerformance.jsx, EditPerformance.jsx, PerformanceDetails.jsx
│   ├── Documents.jsx, AddDocument.jsx, EditDocument.jsx, DocumentDetails.jsx
│   ├── Users.jsx, AddUser.jsx, EditUser.jsx
│   ├── MyAttendance.jsx, MyLeave.jsx, MyPayroll.jsx, MyPerformance.jsx, MyDocuments.jsx
│   ├── Notifications.jsx, Reports.jsx, Settings.jsx, EmployeeProfile.jsx
├── routes/
│   ├── AppRoutes.jsx        # Complete declarative route mapping
│   └── ProtectedRoute.jsx   # Route guard enforcing authentication and RBAC
├── services/                # API integration layer (13 service modules)
│   ├── api.js               # Centralized fetch client with bearer auth injection
│   ├── authService.js       # Login, register, password reset endpoints
│   ├── employeeService.js   # Employee CRUD, profiles, deactivations
│   ├── departmentService.js # Department management endpoints
│   ├── attendanceService.js # Attendance logging, daily summaries
│   ├── leaveService.js      # Leave requests, approvals, rejections
│   ├── payrollService.js    # Payroll creation, payouts, status updates
│   ├── performanceService.js# Performance evaluation reviews
│   ├── documentService.js   # Cloudinary document uploads and downloads
│   ├── notificationService.js# In-app alerts and unread counters
│   ├── reportService.js     # Analytical aggregation reports
│   ├── settingsService.js   # Notification preferences
│   └── userService.js       # Admin user account management
└── utils/
    └── ReportGenerator.js   # Client-side Excel (XLSX) and PDF export engine
```

---

## 3. State Management & Authentication Flow

### 3.1 AuthContext (`src/context/AuthContext.jsx`)
Global state is managed via React's Context API.
- **Stored Values:**
  - `user`: Authenticated user profile (`id`, `firstName`, `lastName`, `email`, `role`, `status`, `employee`).
  - `isAuthenticated`: Boolean derived from the presence of `user` and `hrms_access_token` in `localStorage`.
- **Actions:**
  - `login(authData)`: Persists JWT token to `hrms_access_token` and user record to `hrms_user`.
  - `logout()`: Clears credentials from `localStorage` and resets state to `null`.

### 3.2 Role-Based Routing (`src/routes/ProtectedRoute.jsx`)
```jsx
// Simplified Guard Logic
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
```

---

## 4. Centralized API Integration (`src/services/api.js`)

All network communication flows through the centralized `apiRequest` wrapper:
1. **Base URL:** Loaded dynamically from `import.meta.env.VITE_API_BASE_URL` with fallback to `http://localhost:5002/api/v1`.
2. **Token Injection:** Automatically appends `Authorization: Bearer <token>` to request headers if `hrms_access_token` is present.
3. **Session Interception:** When a `401 Unauthorized` response is returned, the client immediately purges local credentials and redirects to `/login`.

---

## 5. Reporting & Document Export Engine (`src/utils/ReportGenerator.js`)

The application includes an in-browser reporting utility supporting two export formats:
1. **Excel Export (`exportToExcel`):** Uses SheetJS (`xlsx`) to convert JSON dataset into formatted worksheets and downloads `.xlsx` files.
2. **PDF Export (`exportToPDF`):** Uses `jspdf` and `jspdf-autotable` to generate paginated PDF reports with brand styling, table headers, and custom column formatters.

