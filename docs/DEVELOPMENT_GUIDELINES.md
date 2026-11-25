# Development Guidelines & Standards

This document establishes the architectural principles, code conventions, and Git workflows for contributing to the Enterprise HRMS codebase.

---

## 1. Architectural Principles

1. **Separation of Concerns:** Keep Controllers thin. Business logic belongs in Services. Data retrieval and aggregation belongs in Repositories.
2. **Strict Typing:** Never use `any` unless interacting with external untyped binary buffers. Define explicit TypeScript interfaces and DTOs.
3. **Immutability & Statelessness:** Store no session state in server memory; rely exclusively on JWT tokens and database persistence.
4. **Defensive Validation:** Never trust client data. Validate all incoming request properties using `class-validator` decorators.

---

## 2. Backend Code Standards (NestJS)

### DTOs & Validation
- Every POST and PATCH route must specify a dedicated DTO class.
- Decorate every field with appropriate validation decorators: `@IsString()`, `@IsEmail()`, `@IsNumber()`, `@IsOptional()`.
- Use `@Type(() => Number)` or `@Type(() => Date)` when transforming payload properties.

### Error Handling
- Use NestJS built-in exceptions (`NotFoundException`, `ConflictException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`).
- Never return uncaught errors or raw database stack traces to the client.

### Naming Conventions
- Controllers: `*.controller.ts` (e.g. `employee.controller.ts`)
- Services: `*.service.ts` (e.g. `employee.service.ts`)
- Repositories: `*.repository.ts` (e.g. `employee.repository.ts`)
- Schemas: `*.schema.ts` (e.g. `employee.schema.ts`)
- DTOs: `*.dto.ts` (e.g. `create-employee.dto.ts`)

---

## 3. Frontend Code Standards (React 19)

### Component Design
- Prefer functional components and hooks (`useState`, `useEffect`, `useContext`, `useMemo`).
- Keep view pages in `src/pages/` and extract reusable UI widgets into `src/components/`.
- Handle loading and empty states explicitly.

### API Integration
- Do not call `fetch()` directly in UI components. Call dedicated methods from `src/services/`.
- Always handle errors with toast messages using `sonner` (`toast.error(error.message)`).

---

## 4. Git Commit Guidelines

Write clean, imperative commit messages using the Conventional Commits pattern:
- `feat: add leave overlap conflict verification`
- `fix: resolve working hours decimal rounding in attendance`
- `docs: update API reference for payroll status endpoints`
- `refactor: extract report export logic into ReportGenerator utility`

