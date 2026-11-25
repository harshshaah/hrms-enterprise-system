import apiRequest from "./api";

export const getMySettings = async () => {
  return apiRequest("/settings");
};

export const updateMySettings = async (
  settingsData,
) => {
  return apiRequest("/settings", {
    method: "PATCH",
    body: JSON.stringify(
      settingsData,
    ),
  });
};