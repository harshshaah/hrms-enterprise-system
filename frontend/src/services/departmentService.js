import apiRequest from "./api";

export const getDepartments = async () => {
  return apiRequest(
    "/departments",
  );
};

export const createDepartment = async (
  departmentData,
) => {
  return apiRequest(
    "/departments",
    {
      method: "POST",
      body: JSON.stringify(
        departmentData,
      ),
    },
  );
};

export const getDepartmentById = async (
  id,
) => {
  return apiRequest(
    `/departments/${id}`,
  );
};

export const updateDepartment = async (
  id,
  departmentData,
) => {
  return apiRequest(
    `/departments/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(
        departmentData,
      ),
    },
  );
};

export const deactivateDepartment =
  async (id) => {
    return apiRequest(
      `/departments/${id}`,
      {
        method: "DELETE",
      },
    );
  };

export const activateDepartment =
  async (id) => {
    return apiRequest(
      `/departments/${id}/activate`,
      {
        method: "PATCH",
      },
    );
  };