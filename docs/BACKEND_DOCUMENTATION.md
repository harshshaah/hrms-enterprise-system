# Backend Technical Documentation

## 1. Architecture & Framework Overview

The backend service is engineered using **NestJS 12** running on Node.js and TypeScript. It follows a modular structure implementing the **Controller-Service-Repository** architectural pattern.

```
+--------------------------------------------------------------------------+
|                           NestJS Application                             |
+--------------------------------------------------------------------------+
|  Global Prefix: /api/v1          |  Validation: ValidationPipe (Whitelisted)
|  Auth: Passport JWT Strategy     |  Security: RolesGuard, bcrypt         |
|  ODM: Mongoose 9                 |  Storage: Cloudinary API v2           |
+--------------------------------------------------------------------------+
```

---

## 2. Server Bootstrap (`src/main.ts`)

- **Global Prefix:** `api/v1`
- **CORS Configuration:** Enabled for frontend origins `http://localhost:5173` and `http://localhost:5174` with credentials support.
- **Global Pipes:**
  ```typescript
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  ```
- **Port:** Defaults to `5002` or `process.env.PORT`.

---

## 3. Module Hierarchy & Responsibilities

| Module | Controllers | Services | Repositories / Schemas | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **`AuthModule`** | `AuthController` | `AuthService` | `UserSchema` | Registration, login, password resets, JWT strategy |
| **`UserModule`** | `UserController` | `UserService` | `UserSchema`, `EmployeeSchema` | User profiles, role changes, activations |
| **`OrganizationModule`**| `OrganizationController`| `OrganizationService`| `OrganizationSchema` | Multi-tenant company workspaces, trial tracking, SaaS plans |
| **`ShiftModule`** | `ShiftController` | `ShiftService` | `ShiftSchema` | Work shifts (timings, grace buffer, half-day/full-day thresholds, late deduction rules) |
| **`EmployeeModule`** | `EmployeeController` | `EmployeeService` | `EmployeeRepository`, `EmployeeSchema` | Employee profiles, salary details, onboarding rollback |
| **`DepartmentModule`** | `DepartmentController`| `DepartmentService` | `DepartmentSchema` | Department codes, organization structure |
| **`AttendanceModule`** | `AttendanceController`| `AttendanceService` | `AttendanceRepository`, `AttendanceSchema` | Clock-in/out, hours computation, daily counters |
| **`LeaveModule`** | `LeaveController` | `LeaveService` | `LeaveRepository`, `LeaveSchema` | Overlap verification, approvals, email dispatches |
| **`PayrollModule`** | `PayrollController` | `PayrollService` | `PayrollRepository`, `PayrollSchema` | Salary ledger, allowances, deductions, payouts |
| **`PerformanceModule`**| `PerformanceController`| `PerformanceService`| `PerformanceRepository`, `PerformanceSchema`| Annual appraisal ratings (1-5) and feedback |
| **`DocumentModule`** | `DocumentController` | `DocumentService` | `DocumentSchema` | Cloudinary uploads, file metadata |
| **`NotificationModule`**| `NotificationController`| `NotificationService`| `NotificationSchema` | In-app alerts, read status, unread counters |
| **`ReportModule`** | `ReportController` | `ReportService` | Multi-model aggregation | Executive analytical summaries |
| **`SettingsModule`** | `SettingsController` | `SettingsService` | `SettingsSchema` | User alert preference toggles |
| **`DashboardModule`**| `DashboardController`| `DashboardService` | `DashboardRepository` | Aggregated metrics for Admin, HR, and Employee |
| **`CloudinaryModule`**| - | `CloudinaryService`| - | Streams multipart files to Cloudinary cloud |
| **`EmailModule`** | - | `EmailService` | - | Nodemailer transactional email delivery |

---

## 4. Guards & Decorators

### 4.1 `@Roles(...)` Decorator (`src/auth/decorators/roles.decorator.ts`)
Attaches metadata containing required roles (`'admin'`, `'hr'`, `'employee'`) to route handlers using NestJS `Reflector`:
```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### 4.2 `RolesGuard` (`src/auth/guards/roles.guard.ts`)
Extracts route roles metadata and compares it against `request.user.role`. If the user lacks the required role, a `ForbiddenException` is thrown:
```typescript
if (!requiredRoles.includes(user.role)) {
  throw new ForbiddenException('You do not have permission to access this resource');
}
```

### 4.3 `JwtAuthGuard` & `JwtStrategy`
Validates standard Bearer JWT tokens in the `Authorization` header. Extracts payload (`sub`, `email`, `role`) and injects it into `request.user`.

---

## 5. Business Logic Highlights

### 5.1 Transactional Rollback on Employee Onboarding
When an employee is created with `createLoginAccount: true`:
1. Employee record is inserted into MongoDB.
2. A corresponding User account is created with `bcrypt`-hashed password.
3. If User creation encounters an error (e.g. duplicate email), the catch block immediately invokes `employeeRepository.deleteById(employee._id)` to rollback the employee record, guaranteeing state consistency.

### 5.2 Dynamic Working Hours Calculation
When both `checkIn` and `checkOut` timestamps are supplied:
```typescript
const difference = checkOut.getTime() - checkIn.getTime();
if (difference < 0) {
  throw new ConflictException('Check-out time cannot be earlier than check-in time');
}
const workingHours = Number((difference / (1000 * 60 * 60)).toFixed(2));
```

### 5.3 Leave Overlap Detection
Before persisting a new leave, `LeaveService.checkOverlap` scans existing records for the employee. Any non-cancelled/non-rejected leave overlapping with the requested date window throws a `ConflictException`.

