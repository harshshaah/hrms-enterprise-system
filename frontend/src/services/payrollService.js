import apiRequest from "./api";

export const createPayroll = async (
  payrollData,
) => {
  return apiRequest(
    "/payroll",
    {
      method: "POST",
      body: JSON.stringify(
        payrollData,
      ),
    },
  );
};

export const getPayrolls = async (
  filters = {},
) => {
  const params =
    new URLSearchParams();

  if (filters.month) {
    params.append(
      "month",
      filters.month,
    );
  }

  if (filters.year) {
    params.append(
      "year",
      filters.year,
    );
  }

  if (filters.status) {
    params.append(
      "status",
      filters.status,
    );
  }

  if (filters.page) {
    params.append(
      "page",
      filters.page,
    );
  }

  if (filters.limit) {
    params.append(
      "limit",
      filters.limit,
    );
  }

  if (filters.search?.trim()) {
    params.append(
      "search",
      filters.search.trim(),
    );
  }

  if (filters.sortBy) {
    params.append(
      "sortBy",
      filters.sortBy,
    );
  }

  if (filters.sortOrder) {
    params.append(
      "sortOrder",
      filters.sortOrder,
    );
  }

  const queryString =
    params.toString();

  return apiRequest(
    queryString
      ? `/payroll?${queryString}`
      : "/payroll",
  );
};

export const getPayrollById =
  async (id) => {
    return apiRequest(
      `/payroll/${id}`,
    );
  };

export const updatePayroll = async (
  id,
  payrollData,
) => {
  return apiRequest(
    `/payroll/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(
        payrollData,
      ),
    },
  );
};

export const markPayrollAsPaid =
  async (id) => {
    return apiRequest(
      `/payroll/${id}/pay`,
      {
        method: "PATCH",
      },
    );
  };

export const cancelPayroll =
  async (id) => {
    return apiRequest(
      `/payroll/${id}/cancel`,
      {
        method: "PATCH",
      },
    );
  };

export const deletePayroll =
  async (id) => {
    return apiRequest(
      `/payroll/${id}`,
      {
        method: "DELETE",
      },
    );
  };

export const getPayrollStats =
  async () => {
    return apiRequest(
      "/payroll/stats",
    );
  };

export const getEmployeesForPayroll =
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

export const calculateStatutoryPayroll = async (payload) => {
  return apiRequest("/payroll/calculate-statutory", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};