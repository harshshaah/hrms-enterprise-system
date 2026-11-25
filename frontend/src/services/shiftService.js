import apiRequest from "./api";

export const getShifts = async () => {
  return apiRequest("/shifts");
};

export const getShiftById = async (id) => {
  return apiRequest(`/shifts/${id}`);
};

export const createShift = async (shiftData) => {
  return apiRequest("/shifts", {
    method: "POST",
    body: JSON.stringify(shiftData),
  });
};

export const updateShift = async (id, shiftData) => {
  return apiRequest(`/shifts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(shiftData),
  });
};

export const deleteShift = async (id) => {
  return apiRequest(`/shifts/${id}`, {
    method: "DELETE",
  });
};

