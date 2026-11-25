import apiRequest from "./api";

// Get all leaves
export const getLeaves = async () => {
  return apiRequest("/leaves");
};

// Get leave by ID
export const getLeaveById = async (id) => {
  return apiRequest(
    `/leaves/${id}`,
  );
};

// Get leaves by employee
export const getLeavesByEmployee =
  async (employeeId) => {
    return apiRequest(
      `/leaves?employee=${encodeURIComponent(
        employeeId,
      )}`,
    );
  };

// Get leaves by status
export const getLeavesByStatus =
  async (status) => {
    return apiRequest(
      `/leaves?status=${encodeURIComponent(
        status,
      )}`,
    );
  };

// Create leave
export const createLeave = async (
  leaveData,
) => {
  return apiRequest(
    "/leaves",
    {
      method: "POST",
      body: JSON.stringify(
        leaveData,
      ),
    },
  );
};

// Update leave
export const updateLeave = async (
  id,
  leaveData,
) => {
  return apiRequest(
    `/leaves/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(
        leaveData,
      ),
    },
  );
};

// Approve leave
export const approveLeave = async (
  id,
) => {
  return apiRequest(
    `/leaves/${id}/approve`,
    {
      method: "PATCH",
    },
  );
};

// Reject leave
export const rejectLeave = async (
  id,
  remarks,
) => {
  return apiRequest(
    `/leaves/${id}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({
        remarks,
      }),
    },
  );
};

// Cancel leave
export const cancelLeave = async (
  id,
) => {
  return apiRequest(
    `/leaves/${id}/cancel`,
    {
      method: "PATCH",
    },
  );
};

// Delete leave
export const deleteLeave = async (
  id,
) => {
  return apiRequest(
    `/leaves/${id}`,
    {
      method: "DELETE",
    },
  );
};