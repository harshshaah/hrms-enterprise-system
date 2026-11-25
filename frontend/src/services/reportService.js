import apiRequest from "./api";

// =====================================================
// REPORT SUMMARY
// =====================================================

export const getReportSummary = async () => {
  return apiRequest(
    "/reports/summary",
  );
};

// =====================================================
// EMPLOYEE REPORT
// =====================================================

export const getEmployeeReport = async () => {
  return apiRequest(
    "/reports/employees",
  );
};

// =====================================================
// ATTENDANCE REPORT
// =====================================================

export const getAttendanceReport = async (
  startDate,
  endDate,
) => {
  const params =
    new URLSearchParams();

  if (startDate) {
    params.append(
      "startDate",
      startDate,
    );
  }

  if (endDate) {
    params.append(
      "endDate",
      endDate,
    );
  }

  const queryString =
    params.toString();

  return apiRequest(
    `/reports/attendance${
      queryString
        ? `?${queryString}`
        : ""
    }`,
  );
};

// =====================================================
// LEAVE REPORT
// =====================================================

export const getLeaveReport = async (
  startDate,
  endDate,
) => {
  const params =
    new URLSearchParams();

  if (startDate) {
    params.append(
      "startDate",
      startDate,
    );
  }

  if (endDate) {
    params.append(
      "endDate",
      endDate,
    );
  }

  const queryString =
    params.toString();

  return apiRequest(
    `/reports/leaves${
      queryString
        ? `?${queryString}`
        : ""
    }`,
  );
};

// =====================================================
// PAYROLL REPORT
// =====================================================

export const getPayrollReport = async (
  year,
  month,
) => {
  const params =
    new URLSearchParams();

  if (year) {
    params.append(
      "year",
      year,
    );
  }

  if (month) {
    params.append(
      "month",
      month,
    );
  }

  const queryString =
    params.toString();

  return apiRequest(
    `/reports/payroll${
      queryString
        ? `?${queryString}`
        : ""
    }`,
  );
};

// =====================================================
// PERFORMANCE REPORT
// =====================================================

export const getPerformanceReport =
  async (year) => {
    const params =
      new URLSearchParams();

    if (year) {
      params.append(
        "year",
        year,
      );
    }

    const queryString =
      params.toString();

    return apiRequest(
      `/reports/performance${
        queryString
          ? `?${queryString}`
          : ""
      }`,
    );
  };

// =====================================================
// DEPARTMENT REPORT
// =====================================================

export const getDepartmentReport =
  async () => {
    return apiRequest(
      "/reports/departments",
    );
  };