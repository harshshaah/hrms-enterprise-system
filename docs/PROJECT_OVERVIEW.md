# Project Overview: Enterprise HRMS

## 1. Executive Summary

The **Enterprise Human Resource Management System (HRMS)** is a comprehensive full-stack platform built to digitize, centralize, and automate organizational personnel operations. Designed for modern corporate scale, it replaces disparate spreadsheets, physical documents, and isolated trackers with an integrated, secure cloud solution.

---

## 2. Business Problem & Solution

### 2.1 The Problem
Traditional enterprise HR workflows suffer from:
- **Scattered Records:** Employee profiles, certifications, and banking details stored across disparate files.
- **Attendance Inaccuracies:** Manual punch cards or unverified logs resulting in payroll errors.
- **Leave Discrepancies:** Email-based leave approvals leading to overlapping absences and department under-staffing.
- **Slow Payroll Processing:** Manual formula calculation of basic pay, allowances, and statutory deductions.
- **Disorganized Documentation:** Lost identification papers, agreements, and credential certificates.

### 2.2 The Solution
Enterprise HRMS provides an automated digital ecosystem:
- **Single Source of Truth:** Centralized database for every employee and department.
- **Biometric/Digital Attendance:** Real-time clock-in/out logging with automatic duration computation.
- **Workflow-Driven Leaves:** Intelligent conflict check that blocks overlapping dates before submission.
- **Integrated Payroll Engine:** One-click payroll calculation linking employee salary rules.
- **Cloud Document Locker:** Multi-tenant Cloudinary storage for encrypted employee attachments.
- **Role-Based Views:** Tailored portals for Administrators, HR Personnel, and standard Employees.

---

## 3. User Personas & Use Cases

### Persona 1: System Administrator
- **Goals:** Maintain system security, provision user accounts, oversee global settings, and audit operations.
- **Key Actions:**
  - Create and manage User accounts.
  - Activate or deactivate employee records.
  - Configure company notification preferences.
  - Review company-wide analytics reports.

### Persona 2: HR Manager
- **Goals:** Execute day-to-day HR operations, staff onboarding, leave processing, and compensation payouts.
- **Key Actions:**
  - Onboard new employees with automatic login credential creation.
  - Manage company departments and organizational hierarchy.
  - Log and audit daily attendance logs.
  - Review, approve, or reject employee leave requests with audit notes.
  - Generate monthly payroll runs and mark salaries as paid.
  - Upload compliance documents and contracts to employee profiles.
  - Export monthly compliance and performance reports to Excel/PDF.

### Persona 3: Staff Employee
- **Goals:** Self-service personal profile, track attendance hours, request time off, and access compensation records.
- **Key Actions:**
  - View personal dashboard with today's punch status and leave summary.
  - Apply for leave and track approval status in real time.
  - Review monthly payslips and compensation breakdowns.
  - Inspect personal performance appraisal feedback and goal ratings.
  - Access personal uploaded corporate documents.
  - Update personal contact information and password securely.

---

## 4. Key Functional Modules

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Enterprise HRMS Modules                         │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────┤
│  Personnel   │ Attendance   │ Leave Mgmt   │ Payroll      │ Performance│
│  Directory   │ & Time-sheet │ & Approvals  │ Processing   │ Reviews    │
├──────────────┼──────────────┼──────────────┼──────────────┼────────────┤
│  Department  │ Cloud File   │ Notification │ Report &     │ Settings & │
│  Hierarchy   │ Vault        │ Dispatch     │ Analytics    │ Security   │
└──────────────┴──────────────┴──────────────┴──────────────┴────────────┘
```

1. **Authentication & Identity:** JWT-based stateless auth, salted bcrypt hashing, forgot-password reset flows via secure email tokens.
2. **Employee Directory:** Biographical data, department assignment, compensation baseline, profile photo, and active/inactive status.
3. **Department Organization:** Corporate divisions, unique uppercase codes, and department head designations.
4. **Attendance Tracking:** Daily record capture, working hours calculated to two decimal places, and daily summary statistics.
5. **Leave Processing:** Validation preventing date overlap, status states (`pending`, `approved`, `rejected`, `cancelled`), and automatic email notifications.
6. **Payroll Disbursement:** Monthly compensation ledger with basic pay, allowances, deductions, and gross/net calculations.
7. **Performance Appraisals:** Annual reviews with structured goals, accomplishments, strengths, weaknesses, and 1-5 rating metrics.
8. **Document Locker:** Cloudinary asset streaming with MIME type validation (PDF, PNG, JPEG) up to 5MB.
9. **Reporting & Analytics:** Aggregated insights across all modules with direct export to formatted Excel (`.xlsx`) and PDF (`.pdf`).
10. **System Preferences:** Granular email and in-app alert toggles.

---

## 5. Non-Functional Requirements & Performance

- **Security:** Strict Role-Based Access Control on both frontend routes and backend controller endpoints.
- **Data Integrity:** Compound unique indexes prevent duplicate records (e.g., payroll entries for the same month/year or duplicate attendance per calendar day).
- **Scalability:** Stateless NestJS microservices-ready architecture with MongoDB Atlas clustering.
- **Portability:** Container-ready Node.js runtime and environment-agnostic configuration via `.env`.

