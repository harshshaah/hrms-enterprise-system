import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";
import RegisterCompany from "../pages/RegisterCompany";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import RoleBasedDashboard from "../components/RoleBasedDashboard";

import Employees from "../pages/Employees";
import AddEmployee from "../pages/AddEmployee";
import EmployeeDetails from "../pages/EmployeeDetails";
import EditEmployee from "../pages/EditEmployee";

import Departments from "../pages/Departments";
import AddDepartment from "../pages/AddDepartment";
import DepartmentDetails from "../pages/DepartmentDetails";
import EditDepartment from "../pages/EditDepartment";

import Attendance from "../pages/Attendance";
import AddAttendance from "../pages/AddAttendance";
import AttendanceDetails from "../pages/AttendanceDetails";
import EditAttendance from "../pages/EditAttendance";

import Leave from "../pages/Leave";
import AddLeave from "../pages/AddLeave";
import LeaveDetails from "../pages/LeaveDetails";
import EditLeave from "../pages/EditLeave";

import Payroll from "../pages/Payroll";
import AddPayroll from "../pages/AddPayroll";
import PayrollDetails from "../pages/PayrollDetails";
import EditPayroll from "../pages/EditPayroll";

import Performance from "../pages/Performance";
import AddPerformance from "../pages/AddPerformance";
import PerformanceDetails from "../pages/PerformanceDetails";
import EditPerformance from "../pages/EditPerformance";

import Users from "../pages/Users";
import EditUser from "../pages/EditUser";
import AddUser from "../pages/AddUser";

import EmployeeProfile from "../pages/EmployeeProfile";
import Settings from "../pages/Settings";
import Notifications from "../pages/Notifications";

import Documents from "../pages/Documents";
import AddDocument from "../pages/AddDocument";
import DocumentDetails from "../pages/DocumentDetails";
import EditDocument from "../pages/EditDocument";

import Reports from "../pages/Reports";

// Employee Specific Pages
import MyAttendance from "../pages/MyAttendance";
import MyLeave from "../pages/MyLeave";
import MyPayroll from "../pages/MyPayroll";
import MyPerformance from "../pages/MyPerformance";
import MyDocuments from "../pages/MyDocuments";

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register-company" element={<RegisterCompany />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ============================== */}
      {/* AUTHENTICATED ROUTES */}
      {/* ============================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* ============================== */}
          {/* ROLE BASED DASHBOARD */}
          {/* ============================== */}
          <Route path="/" element={<RoleBasedDashboard />} />
          <Route path="/dashboard" element={<RoleBasedDashboard />} />

          {/* ============================== */}
          {/* COMMON ROUTES (Admin + HR + Employee) */}
          {/* ============================== */}
          <Route path="/profile" element={<EmployeeProfile />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* ============================== */}
          {/* EMPLOYEE ONLY ROUTES */}
          {/* ============================== */}
          <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
            <Route path="/my-attendance" element={<MyAttendance />} />
            <Route path="/my-leaves" element={<MyLeave />} />
            <Route path="/my-payroll" element={<MyPayroll />} />
            <Route path="/my-performance" element={<MyPerformance />} />
            <Route path="/my-documents" element={<MyDocuments />} />
          </Route>

          {/* ============================== */}
          {/* ADMIN + HR ROUTES */}
          {/* ============================== */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "hr"]} />}>
            {/* Employees */}
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/add" element={<AddEmployee />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/employees/:id/edit" element={<EditEmployee />} />

            {/* Departments */}
            <Route path="/departments" element={<Departments />} />
            <Route path="/departments/add" element={<AddDepartment />} />
            <Route path="/departments/:id" element={<DepartmentDetails />} />
            <Route path="/departments/:id/edit" element={<EditDepartment />} />

            {/* Attendance */}
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance/add" element={<AddAttendance />} />
            <Route path="/attendance/:id" element={<AttendanceDetails />} />
            <Route path="/attendance/:id/edit" element={<EditAttendance />} />

            {/* Leaves */}
            <Route path="/leaves" element={<Leave />} />
            <Route path="/leaves/add" element={<AddLeave />} />
            <Route path="/leaves/:id" element={<LeaveDetails />} />
            <Route path="/leaves/:id/edit" element={<EditLeave />} />

            {/* Payroll */}
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/payroll/add" element={<AddPayroll />} />
            <Route path="/payroll/:id" element={<PayrollDetails />} />
            <Route path="/payroll/:id/edit" element={<EditPayroll />} />

            {/* Performance */}
            <Route path="/performance" element={<Performance />} />
            <Route path="/performance/add" element={<AddPerformance />} />
            <Route path="/performance/:id" element={<PerformanceDetails />} />
            <Route path="/performance/:id/edit" element={<EditPerformance />} />

            {/* Documents */}
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/add" element={<AddDocument />} />
            <Route path="/documents/:id" element={<DocumentDetails />} />
            <Route path="/documents/:id/edit" element={<EditDocument />} />

            {/* Reports */}
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* ============================== */}
          {/* ADMIN ONLY ROUTES */}
          {/* ============================== */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            {/* Users */}
            <Route path="/users" element={<Users />} />
            <Route path="/users/add" element={<AddUser />} />
            <Route path="/users/:id/edit" element={<EditUser />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;