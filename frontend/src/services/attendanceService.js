import apiRequest from "./api";

export const getAttendance = async (
  filters = {},
) => {
  const params =
    new URLSearchParams();

  if (filters.employee) {
    params.append(
      "employee",
      filters.employee,
    );
  }

  if (filters.date) {
    params.append(
      "date",
      filters.date,
    );
  }

  if (filters.status) {
    params.append(
      "status",
      filters.status,
    );
  }

  const queryString =
    params.toString();

  return apiRequest(
    `/attendance${
      queryString
        ? `?${queryString}`
        : ""
    }`,
  );
};

export const getAttendanceById =
  async (id) => {
    return apiRequest(
      `/attendance/${id}`,
    );
  };

export const createAttendance =
  async (attendanceData) => {
    return apiRequest(
      "/attendance",
      {
        method: "POST",
        body: JSON.stringify(
          attendanceData,
        ),
      },
    );
  };

export const updateAttendance =
  async (
    id,
    attendanceData,
  ) => {
    return apiRequest(
      `/attendance/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(
          attendanceData,
        ),
      },
    );
  };

export const deleteAttendance =
  async (id) => {
    return apiRequest(
      `/attendance/${id}`,
      {
        method: "DELETE",
      },
    );
  };

export const getAttendanceSummary =
  async (date = "") => {
    const params =
      new URLSearchParams();

    if (date) {
      params.append(
        "date",
        date,
      );
    }

    const queryString =
      params.toString();

    return apiRequest(
      `/attendance/summary${
        queryString
          ? `?${queryString}`
          : ""
      }`,
    );
  };