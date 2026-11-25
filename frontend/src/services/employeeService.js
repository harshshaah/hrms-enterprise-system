import apiRequest from "./api";

export const createEmployee = async (
  employeeData,
) => {
  return apiRequest(
    "/employees",
    {
      method: "POST",
      body: JSON.stringify(
        employeeData,
      ),
    },
  );
};

export const getEmployees = async () => {
  return apiRequest(
    "/employees",
  );
};

export const getEmployeeById = async (
  id,
) => {
  return apiRequest(
    `/employees/${id}`,
  );
};

export const getMyProfile = async () => {
  return apiRequest(
    "/employees/me/profile",
  );
};

export const updateEmployee = async (
  id,
  employeeData,
) => {
  return apiRequest(
    `/employees/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(
        employeeData,
      ),
    },
  );
};

export const updateMyProfile = async (
  profileData,
) => {
  return apiRequest(
    "/employees/me/profile",
    {
      method: "PATCH",
      body: JSON.stringify(
        profileData,
      ),
    },
  );
};

export const deactivateEmployee = async (
  id,
) => {
  return apiRequest(
    `/employees/${id}`,
    {
      method: "DELETE",
    },
  );
};

export const activateEmployee = async (
  id,
) => {
  return apiRequest(
    `/employees/${id}/activate`,
    {
      method: "PATCH",
    },
  );
};

export const getDepartmentsForEmployee =
  async () => {
    const response =
      await apiRequest(
        "/departments",
      );

    return (
      response?.data || []
    ).filter(
      (department) =>
        department.status ===
        "active",
    );
  };