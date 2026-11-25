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

export const createRazorpayOrder = async (data) => {
  return apiRequest("/organizations/create-razorpay-order", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const verifyRazorpayPayment = async (data) => {
  return apiRequest("/organizations/verify-razorpay-payment", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

