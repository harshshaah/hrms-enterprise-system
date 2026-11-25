# Authentication & Authorization Flow

## 1. Authentication Lifecycle

The application implements a stateless **JSON Web Token (JWT)** architecture using NestJS Passport.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend Client
    participant API as /auth/login
    participant JWT as JwtService
    participant Local as localStorage
    participant Guard as JwtAuthGuard

    Client->>API: POST /auth/login { email, password }
    API->>API: Validate credentials & status
    API->>JWT: signAsync({ sub, email, role })
    JWT-->>API: Signed JWT Token
    API-->>Client: { accessToken, user }
    Client->>Local: Save hrms_access_token & hrms_user
    Note over Client,Guard: Authenticated Operations
    Client->>Guard: GET /employees (Header: Bearer <token>)
    Guard->>Guard: Validate signature & expiry
    Guard-->>Client: 200 OK + Data
```

---

## 2. Token Details & Payload

- **Token Type:** JSON Web Token (Bearer)
- **Algorithm:** HMAC SHA-256 (`HS256`)
- **Default Lifetime:** 7 days (`JWT_EXPIRES_IN=7d`)
- **Payload Structure:**
  ```json
  {
    "sub": "6743fc1234567890abcdef12",
    "email": "user@example.com",
    "role": "admin",
    "iat": 1732512000,
    "exp": 1733116800
  }
  ```

---

## 3. Password Hashing & Encryption

- **Algorithm:** `bcrypt` with work factor 10.
- Password hashes are stored in the `password` field of the `users` collection.
- Passwords are automatically excluded from query results using `.select('-password')` in User queries.

---

## 4. Password Recovery Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant App as Frontend (/forgot-password)
    participant Auth as AuthService
    participant Mail as EmailService
    participant Reset as Frontend (/reset-password?token=...)

    User->>App: Submits email address
    App->>Auth: POST /auth/forgot-password { email }
    Auth->>Auth: Generate 32-character random hex token
    Auth->>Auth: Save resetPasswordToken & resetPasswordExpires (1 hour)
    Auth->>Mail: sendPasswordResetEmail(email, token)
    Mail-->>User: Delivers password reset link
    User->>Reset: Opens link with token
    Reset->>Auth: POST /auth/reset-password { token, newPassword }
    Auth->>Auth: Validate token & expiry (resetPasswordExpires > Date.now())
    Auth->>Auth: Hash new password & clear token fields
    Auth-->>User: Password reset successfully
```

---

## 5. Role-Based Access Control (RBAC)

### 5.1 System Roles
1. **`admin`**: Super-administrator. Complete CRUD across all collections including Users and Settings.
2. **`hr`**: Human Resource Operations. Full management across Employees, Departments, Attendance, Leaves, Payroll, Documents, and Reports.
3. **`employee`**: Individual contributor. Restricted to self-service endpoints (`/me/profile`, `/my-attendance`, `/my-leaves`, `/my-payroll`, `/my-documents`).

### 5.2 Server Guard Architecture
Every protected route passes through two sequential guards:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
```
1. **`JwtAuthGuard`**: Ensures token validity and attaches payload to `request.user`.
2. **`RolesGuard`**: Reads `@Roles('admin', 'hr')` metadata via NestJS `Reflector`. Rejects non-conforming requests with `403 ForbiddenException`.

