import apiRequest from "./api";

// Get all users
export const getUsers = async () => {
  return apiRequest("/users");
};

// Get current logged-in user's profile
export const getMyProfile = async () => {
  return apiRequest("/users/me/profile");
};

// Get user by ID
export const getUserById = async (id) => {
  return apiRequest(`/users/${id}`);
};

// Create user
export const createUser = async (userData) => {
  return apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// Update current logged-in user's profile
export const updateMyProfile = async (profileData) => {
  return apiRequest("/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
};

// Change current logged-in user's password
export const changeMyPassword = async (
  passwordData,
) => {
  return apiRequest("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(passwordData),
  });
};

// Update user
export const updateUser = async (
  id,
  userData,
) => {
  return apiRequest(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(userData),
  });
};

// Activate user
export const activateUser = async (id) => {
  return apiRequest(`/users/${id}/activate`, {
    method: "PATCH",
  });
};

// Deactivate user
export const deactivateUser = async (id) => {
  return apiRequest(`/users/${id}`, {
    method: "DELETE",
  });
};