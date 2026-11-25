import { useAuth } from "../context/AuthContext";

import Dashboard from "../pages/Dashboard";
import EmployeeDashboard from "../pages/EmployeeDashboard";

function RoleBasedDashboard() {
  const { user } = useAuth();

  const role =
    user?.role?.toLowerCase();

  if (role === "employee") {
    return <EmployeeDashboard />;
  }

  return <Dashboard />;
}

export default RoleBasedDashboard;