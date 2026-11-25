# API Documentation Reference

All API routes are served under `/api/v1`. Authentication is performed via standard Bearer tokens:
```http
Authorization: Bearer <accessToken>
```

---

## 1. Authentication Module (`/auth`)

### 1.1 Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "6743fc1234567890abcdef12",
        "firstName": "System",
        "lastName": "Admin",
        "email": "admin@example.com",
        "role": "admin",
        "status": "active",
        "employee": null
      }
    }
  }
  ```

### 1.2 Register
- **Endpoint:** `POST /api/v1/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "Password123!",
    "role": "employee"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": "6743fc1234567890abcdef13",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "employee",
      "status": "active"
    }
  }
  ```

### 1.3 Forgot Password
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Access:** Public
- **Request Body:** `{ "email": "john.doe@example.com" }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "If that email is registered, a password reset link has been sent."
  }
  ```

### 1.4 Reset Password
- **Endpoint:** `POST /api/v1/auth/reset-password`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "token": "4f8a9e7b2c1d3f5a8e0b9c2d1e4f7a8b",
    "newPassword": "BrandNewPassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password has been reset successfully. You can now login."
  }
  ```

### 1.5 Change Password
- **Endpoint:** `POST /api/v1/auth/change-password`
- **Access:** Authenticated (Any role)
- **Request Body:**
  ```json
  {
    "oldPassword": "CurrentPassword123!",
    "newPassword": "NewSecurePassword123!"
  }
  ```

---

## 2. Employee Module (`/employees`)

| Method | Route | Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/employees` | `admin`, `hr`, `employee` | Retrieve list of all employees |
| `GET` | `/employees/me/profile` | `admin`, `hr`, `employee` | Retrieve own linked employee profile |
| `GET` | `/employees/:id` | `admin`, `hr`, `employee` | Retrieve specific employee by ID |
| `POST` | `/employees` | `admin`, `hr` | Create new employee (with optional user account) |
| `PATCH` | `/employees/me/profile` | `admin`, `hr`, `employee` | Update personal employee details |
| `PATCH` | `/employees/:id` | `admin`, `hr` | Update any employee profile |
| `PATCH` | `/employees/:id/activate` | `admin`, `hr` | Activate an inactive employee |
| `DELETE` | `/employees/:id` | `admin` | Soft-deactivate an employee |

### Create Employee Payload (`POST /employees`):
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567890",
  "department": "6743ab9876543210fedcba98",
  "designation": "Software Engineer",
  "joiningDate": "2026-01-15T00:00:00.000Z",
  "salary": 75000,
  "dateOfBirth": "1995-06-20T00:00:00.000Z",
  "gender": "female",
  "createLoginAccount": true,
  "loginPassword": "InitialPassword123!"
}
```

---

## 3. Department Module (`/departments`)

| Method | Route | Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/departments` | `admin`, `hr`, `employee` | List all departments |
| `GET` | `/departments/:id` | `admin`, `hr`, `employee` | Get department details |
| `POST` | `/departments` | `admin`, `hr` | Create new department |
| `PATCH` | `/departments/:id` | `admin`, `hr` | Update department details |
| `PATCH` | `/departments/:id/activate` | `admin`, `hr` | Activate department |
| `DELETE` | `/departments/:id` | `admin` | Deactivate department |

### Create Department Payload:
```json
{
  "name": "Engineering",
  "code": "ENG",
  "description": "Software Development & Architecture",
  "headOfDepartment": "Alex Director"
}
```

---

## 4. Attendance Module (`/attendance`)

| Method | Route | Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/attendance` | `admin`, `hr`, `employee` | Filter attendance (`employee`, `date`, `status`) |
| `GET` | `/attendance/summary`| `admin`, `hr` | Today's aggregate counts (present, absent, etc.) |
| `GET` | `/attendance/:id` | `admin`, `hr`, `employee` | Get single attendance record |
| `POST` | `/attendance` | `admin`, `hr` | Log attendance record |
| `PATCH` | `/attendance/:id` | `admin`, `hr` | Update attendance check-in/out |
| `DELETE` | `/attendance/:id` | `admin` | Delete attendance record |

### Create Attendance Payload:
```json
{
  "employee": "6743fc1234567890abcdef12",
  "date": "2026-11-25T00:00:00.000Z",
  "checkIn": "2026-11-25T09:00:00.000Z",
  "checkOut": "2026-11-25T17:30:00.000Z",
  "status": "present",
  "remarks": "On-time arrival"
}
```

---

## 5. Leave Module (`/leaves`)

| Method | Route | Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/leaves` | `admin`, `hr`, `employee` | List leaves (filters: `employee`, `status`) |
| `GET` | `/leaves/:id` | `admin`, `hr`, `employee` | Get leave request details |
| `POST` | `/leaves` | All Roles | Submit new leave application |
| `PATCH` | `/leaves/:id` | `admin`, `hr` | Edit pending leave request |
| `PATCH` | `/leaves/:id/approve`| `admin`, `hr` | Approve leave application |
| `PATCH` | `/leaves/:id/reject` | `admin`, `hr` | Reject leave with optional remarks |
| `PATCH` | `/leaves/:id/cancel` | All Roles | Cancel own pending leave |
| `DELETE` | `/leaves/:id` | `admin` | Delete leave entry |

---

## 6. Payroll Module (`/payroll`)

| Method | Route | Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/payroll` | `admin`, `hr`, `employee` | Query paginated payroll ledger |
| `GET` | `/payroll/stats` | `admin`, `hr` | Total salary metrics & paid/unpaid totals |
| `GET` | `/payroll/:id` | `admin`, `hr`, `employee` | View single payslip |
| `POST` | `/payroll` | `admin`, `hr` | Generate payroll entry |
| `PATCH` | `/payroll/:id` | `admin`, `hr` | Modify allowance/deduction |
| `PATCH` | `/payroll/:id/pay` | `admin`, `hr` | Mark payroll as paid with timestamp |
| `PATCH` | `/payroll/:id/cancel`| `admin`, `hr` | Cancel pending payroll |
| `DELETE` | `/payroll/:id` | `admin` | Delete payroll record |

---

## 7. Performance Module (`/performance`)

| Method | Route | Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/performance` | `admin`, `hr`, `employee` | View performance appraisals |
| `GET` | `/performance/:id` | `admin`, `hr`, `employee` | View specific appraisal scorecard |
| `POST` | `/performance` | `admin`, `hr` | Create appraisal scorecard |
| `PATCH` | `/performance/:id` | `admin`, `hr` | Update rating or feedback |
| `DELETE` | `/performance/:id` | `admin` | Delete appraisal record |

---

## 8. Document Module (`/documents`)

| Method | Route | Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/documents/upload` | `admin`, `hr` | Upload multipart file (PDF/Image) to Cloudinary |
| `GET` | `/documents` | `admin`, `hr`, `employee` | List company documents |
| `GET` | `/documents/employee/:id` | `admin`, `hr`, `employee` | List documents for a specific employee |
| `GET` | `/documents/:id` | `admin`, `hr`, `employee` | Get document metadata |
| `PATCH` | `/documents/:id` | `admin`, `hr` | Update document title/type |
| `DELETE` | `/documents/:id` | `admin` | Deactivate document |

---

## 9. Reports & Dashboard Modules

### Reports (`/reports` - `admin`, `hr`)
- `GET /reports/summary`: Complete company headcount, payroll totals, and leave status counters.
- `GET /reports/employees`: Full employee directory export data.
- `GET /reports/attendance?startDate=...&endDate=...`: Date-filtered attendance dump.
- `GET /reports/leaves?startDate=...&endDate=...`: Leave approval report.
- `GET /reports/payroll?year=...&month=...`: Monthly salary disbursement audit.
- `GET /reports/performance?year=...`: Company-wide appraisal ratings.
- `GET /reports/departments`: Headcount grouped by department.

### Dashboards (`/dashboard`)
- `GET /dashboard`: Aggregated enterprise dashboard for Admin and HR.
- `GET /dashboard/me`: Personalized dashboard for authenticated employee.

