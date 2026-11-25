# Database Architecture Documentation

## 1. Overview

The platform uses **MongoDB Atlas** as its document database, managed through the **Mongoose 9** Object Data Modeling (ODM) library within NestJS (`@nestjs/mongoose`).

---

## 2. Collections & Schemas

### 2.1 `users` Collection
Represents system authentication accounts.

```typescript
@Schema({ timestamps: true })
export class User {
  firstName: string;               // Required, trimmed
  lastName: string;                // Required, trimmed
  email: string;                   // Required, unique, lowercase, trimmed, indexed
  password: string;                // Required, bcrypt hash
  role: 'admin' | 'hr' | 'employee'; // Default: 'employee'
  status: 'active' | 'inactive';   // Default: 'active'
  employee: Types.ObjectId | null; // Ref: 'Employee', unique, sparse index
  resetPasswordToken?: string;     // Password reset random hash
  resetPasswordExpires?: Date;     // Reset token expiry (1 hour)
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 `employees` Collection
Master personnel records for organization staff.

```typescript
@Schema({ timestamps: true })
export class Employee {
  firstName: string;               // Required, trimmed
  lastName: string;                // Required, trimmed
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  email: string;                   // Required, unique, lowercase, trimmed
  phone: string;                   // Required, trimmed
  address?: string;
  city?: string;
  state?: string;
  department: Types.ObjectId;      // Ref: 'Department', required
  designation: string;             // Required, trimmed
  joiningDate: Date;               // Required
  salary: number;                  // Required, min: 0
  profilePhoto?: string;           // Cloudinary URL
  status: 'active' | 'inactive';   // Default: 'active'
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3 `departments` Collection
Organizational business units.

```typescript
@Schema({ timestamps: true })
export class Department {
  name: string;                    // Required, trimmed
  code: string;                    // Required, unique, uppercase, trimmed
  description: string;             // Default: ''
  status: 'active' | 'inactive';   // Default: 'active'
  headOfDepartment: string | null; // Staff name or identifier
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.4 `attendances` Collection
Daily attendance and time-tracking entries.

```typescript
@Schema({ timestamps: true })
export class Attendance {
  employee: Types.ObjectId;        // Ref: 'Employee', required
  date: Date;                      // Required calendar date
  checkIn: Date | null;            // Punch-in timestamp
  checkOut: Date | null;           // Punch-out timestamp
  status: 'present' | 'absent' | 'half-day' | 'leave'; // Default: 'present'
  workingHours: number;            // Auto-calculated, decimal hours
  remarks: string;                 // Notes
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.5 `leaves` Collection
Time-off requests, balances, and manager approval states.

```typescript
@Schema({ timestamps: true })
export class Leave {
  employee: Types.ObjectId;        // Ref: 'Employee', required
  leaveType: string;               // Sick, Casual, Annual, etc.
  startDate: Date;                 // Required
  endDate: Date;                   // Required
  totalDays: number;               // Required, auto-calculated
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'; // Default: 'pending'
  remarks: string;                 // Manager review notes
  approvedBy: Types.ObjectId | null;// Ref: 'User'
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.6 `payrolls` Collection
Monthly compensation calculations and payment states.

```typescript
@Schema({ timestamps: true })
export class Payroll {
  employee: Types.ObjectId;        // Ref: 'Employee', required
  month: number;                   // 1 - 12
  year: number;                    // min: 2000
  basicSalary: number;             // Base monthly pay
  allowances: number;              // Bonuses, HRA, etc.
  deductions: number;              // Tax, PF, unpaid leave
  grossSalary: number;             // basicSalary + allowances
  netSalary: number;               // grossSalary - deductions
  status: 'pending' | 'paid' | 'cancelled'; // Default: 'pending'
  paymentDate: Date | null;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

// Compound Unique Index: prevents multiple payslips for same employee/month/year
PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
PayrollSchema.index({ status: 1 });
PayrollSchema.index({ year: 1, month: 1 });
```

### 2.7 `performances` Collection
Performance appraisal reviews and scorecards.

```typescript
@Schema({ timestamps: true })
export class Performance {
  employee: Types.ObjectId;        // Ref: 'Employee', required
  reviewYear: number;              // Year of review
  reviewPeriod: string;            // Annual, Q1, Q2, etc.
  rating: 1 | 2 | 3 | 4 | 5;       // Numerical rating
  goals: string[];                 // Target milestones
  achievements: string[];          // Delivered results
  strengths: string;
  weaknesses: string;
  managerFeedback: string;
  status: 'draft' | 'submitted' | 'completed' | 'cancelled';
  reviewDate: Date | null;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

PerformanceSchema.index({ employee: 1, reviewYear: -1 });
PerformanceSchema.index({ status: 1 });
```

### 2.8 `documents` Collection
Cloudinary-hosted employee attachments.

```typescript
@Schema({ timestamps: true })
export class Document {
  employeeId: string;              // Linked employee reference, indexed
  documentType: string;            // Resume, Contract, ID, Certificate
  documentName: string;            // Human-readable title
  fileName: string;                // Original uploaded file name
  fileUrl: string;                 // Secure Cloudinary CDN URL
  uploadedBy: string;              // Uploader email
  publicId?: string;               // Cloudinary asset ID for deletion
  resourceType?: string;           // 'raw' or 'image'
  status: 'active' | 'inactive';   // Default: 'active'
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.9 `notifications` Collection
Targeted system alerts for employees and management.

```typescript
@Schema({ timestamps: true })
export class Notification {
  userId: Types.ObjectId;          // Ref: 'User', indexed
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error'; // Default: 'info'
  isRead: boolean;                 // Default: false, indexed
  link?: string;                   // Optional in-app redirection link
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.10 `settings` Collection
Per-user notification delivery toggles.

```typescript
@Schema({ timestamps: true })
export class Settings {
  user: Types.ObjectId;            // Ref: 'User', unique index
  emailNotifications: boolean;     // Default: true
  leaveNotifications: boolean;     // Default: true
  payrollNotifications: boolean;   // Default: true
  systemNotifications: boolean;    // Default: true
}
```

---

## 3. Database Indexes

| Collection | Indexed Fields | Index Type | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `email` | Unique | Fast lookup and uniqueness guarantee |
| `users` | `employee` | Sparse, Unique | 1:1 mapping between User and Employee |
| `departments` | `code` | Unique | Enforces unique uppercase codes |
| `payrolls` | `employee`, `month`, `year` | Compound Unique | Blocks duplicate payslips |
| `payrolls` | `status` | Single | Fast queries for unpaid/pending runs |
| `payrolls` | `year`, `month` | Compound | Fast reporting queries |
| `performances` | `employee`, `reviewYear` | Compound | Chronological employee review queries |
| `documents` | `employeeId` | Single | Fast retrieval of employee files |
| `notifications`| `userId`, `isRead` | Compound/Single | Quick calculation of unread notification badge |
| `settings` | `user` | Unique | 1:1 configuration per user |

