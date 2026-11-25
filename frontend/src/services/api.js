const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api/v1";

const getToken = () => {
  return localStorage.getItem(
    "hrms_access_token",
  );
};

export const apiRequest = async (
  endpoint,
  options = {},
) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem(
      "hrms_access_token",
    );

    localStorage.removeItem(
      "hrms_user",
    );

    window.location.href = "/login";

    throw new Error(
      "Session expired. Please login again.",
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Something went wrong",
    );
  }

  return data;
};

export default apiRequest;