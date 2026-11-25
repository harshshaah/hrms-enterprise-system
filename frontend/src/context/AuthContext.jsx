import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { getMyProfile } from "../services/userService";

const AuthContext = createContext(null);

const TOKEN_KEY = "hrms_access_token";
const USER_KEY = "hrms_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser =
      localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Failed to parse stored user:",
        error,
      );

      localStorage.removeItem(USER_KEY);

      return null;
    }
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    getMyProfile()
      .then((res) => {
        if (res?.data) {
          const u = res.data;
          const freshUser = {
            id: u._id || u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
            status: u.status,
            employee:
              typeof u.employee === "object" && u.employee?._id
                ? u.employee._id
                : u.employee || null,
            organization:
              typeof u.organization === "object" && u.organization?._id
                ? u.organization._id
                : u.organization || null,
          };
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
          setUser(freshUser);
        }
      })
      .catch((err) => {
        console.warn("Could not sync user profile:", err?.message);
      });
  }, []);

  const login = (authData) => {
    const accessToken =
      authData?.accessToken;

    const userData =
      authData?.user;

    if (!accessToken || !userData) {
      throw new Error(
        "Invalid login response",
      );
    }

    localStorage.setItem(
      TOKEN_KEY,
      accessToken,
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(userData),
    );

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(
      TOKEN_KEY,
    );

    localStorage.removeItem(
      USER_KEY,
    );

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated:
          !!user &&
          !!localStorage.getItem(
            TOKEN_KEY,
          ),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}