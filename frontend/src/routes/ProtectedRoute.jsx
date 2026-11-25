import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
  allowedRoles,
}) {
  const {
    isAuthenticated,
    user,
  } = useAuth();

  // User login nahi hai
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Agar route ke liye specific roles diye gaye hain
  if (
    allowedRoles?.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;