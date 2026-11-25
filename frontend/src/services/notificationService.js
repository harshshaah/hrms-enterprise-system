import apiRequest from "./api";

export const getNotifications = async () => {
  return apiRequest("/notifications", {
    method: "GET",
  });
};

export const getUnreadNotificationCount =
  async () => {
    return apiRequest(
      "/notifications/unread-count",
      {
        method: "GET",
      },
    );
  };

export const markNotificationAsRead =
  async (notificationId) => {
    return apiRequest(
      `/notifications/${notificationId}/read`,
      {
        method: "PATCH",
      },
    );
  };

export const markAllNotificationsAsRead =
  async () => {
    return apiRequest(
      "/notifications/read-all",
      {
        method: "PATCH",
      },
    );
  };

export const deleteNotification =
  async (notificationId) => {
    return apiRequest(
      `/notifications/${notificationId}`,
      {
        method: "DELETE",
      },
    );
  };