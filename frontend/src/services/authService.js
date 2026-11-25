const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api/v1";

const TOKEN_KEY = "hrms_access_token";
const USER_KEY = "hrms_user";

export const loginUser = async (loginData) => {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Login failed",
    );
  }

  if (data?.accessToken) {
    localStorage.setItem(
      TOKEN_KEY,
      data.accessToken,
    );
  }

  if (data?.user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(data.user),
    );
  }

  return data;
};

export const registerUser = async (registerData) => {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Registration failed",
    );
  }

  return data;
};

export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};

export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const changePassword = async (oldPassword, newPassword) => {
  const token = getAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/auth/change-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to change password");
  }

  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Failed to send reset link");
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Failed to reset password");
  return data;
};