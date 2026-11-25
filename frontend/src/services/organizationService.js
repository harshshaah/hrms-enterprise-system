import apiRequest from "./api";

export const getMySubscription = async () => {
  return apiRequest("/organizations/my-subscription");
};

export const upgradeSubscription = async (data) => {
  return apiRequest("/organizations/upgrade-subscription", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

