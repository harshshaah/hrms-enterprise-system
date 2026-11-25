import apiRequest from "./api";

export const createPerformance = async (
  performanceData,
) => {
  return apiRequest(
    "/performance",
    {
      method: "POST",
      body: JSON.stringify(
        performanceData,
      ),
    },
  );
};

export const getPerformances =
  async () => {
    return apiRequest(
      "/performance",
    );
  };

export const getPerformanceById =
  async (id) => {
    return apiRequest(
      `/performance/${id}`,
    );
  };

export const updatePerformance =
  async (
    id,
    performanceData,
  ) => {
    return apiRequest(
      `/performance/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(
          performanceData,
        ),
      },
    );
  };

export const deletePerformance =
  async (id) => {
    return apiRequest(
      `/performance/${id}`,
      {
        method: "DELETE",
      },
    );
  };

export const getEmployeesForPerformance =
  async () => {
    const response =
      await apiRequest(
        "/employees",
      );

    return (
      response?.data || []
    ).filter(
      (employee) =>
        employee.status ===
        "active",
    );
  };