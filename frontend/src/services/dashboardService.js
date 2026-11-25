import apiRequest from "./api";

export const getDashboard = async () => {
  return apiRequest(
    "/dashboard",
  );
};

export const getEmployeeDashboard =
  async () => {
    return apiRequest(
      "/dashboard/me",
    );
  };