import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Info,
  CircleCheck,
  TriangleAlert,
  CircleX,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from "../services/notificationService";

function Notifications() {
  const navigate = useNavigate();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response =
        await getNotifications();

      setNotifications(
        response?.data || [],
      );
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead =
    async (notification) => {
      if (notification.isRead) {
        if (notification.link) {
          navigate(notification.link);
        }

        return;
      }

      try {
        await markNotificationAsRead(
          notification._id,
        );

        setNotifications(
          (previous) =>
            previous.map(
              (item) =>
                item._id ===
                notification._id
                  ? {
                      ...item,
                      isRead: true,
                    }
                  : item,
            ),
        );

        if (notification.link) {
          navigate(notification.link);
        }
      } catch (error) {
        console.error(
          "Failed to mark notification as read:",
          error,
        );
      }
    };

  const handleMarkAllAsRead =
    async () => {
      try {
        setActionLoading(true);

        await markAllNotificationsAsRead();

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                isRead: true,
              }),
            ),
        );
      } catch (error) {
        console.error(
          "Failed to mark all notifications as read:",
          error,
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleDelete =
    async (notificationId) => {
      try {
        setActionLoading(true);

        await deleteNotification(
          notificationId,
        );

        setNotifications(
          (previous) =>
            previous.filter(
              (notification) =>
                notification._id !==
                notificationId,
            ),
        );
      } catch (error) {
        console.error(
          "Failed to delete notification:",
          error,
        );
      } finally {
        setActionLoading(false);
      }
    };

  const getNotificationIcon = (
    type,
  ) => {
    switch (type) {
      case "success":
        return (
          <CircleCheck
            size={20}
            className="text-emerald-500"
          />
        );

      case "warning":
        return (
          <TriangleAlert
            size={20}
            className="text-amber-500"
          />
        );

      case "error":
        return (
          <CircleX
            size={20}
            className="text-red-500"
          />
        );

      default:
        return (
          <Info
            size={20}
            className="text-blue-500"
          />
        );
    }
  };

  const formatDate = (
    createdAt,
  ) => {
    if (!createdAt) {
      return "";
    }

    return new Date(
      createdAt,
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead,
    ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Bell
              size={22}
              className="text-slate-700"
            />

            <h1 className="text-2xl font-semibold text-slate-900">
              Notifications
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Stay updated with your latest
            notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={
              handleMarkAllAsRead
            }
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={17} />

            Mark all as read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total
          </p>

          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Unread
          </p>

          <p className="mt-1 text-2xl font-semibold text-red-500">
            {unreadCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Read
          </p>

          <p className="mt-1 text-2xl font-semibold text-emerald-500">
            {notifications.length -
              unreadCount}
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length ===
          0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Bell
                size={26}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-800">
              No notifications
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              You don't have any notifications
              at the moment.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map(
              (notification) => (
                <div
                  key={
                    notification._id
                  }
                  className={`flex gap-4 border-b border-slate-100 p-5 transition last:border-b-0 ${
                    notification.isRead
                      ? "bg-white"
                      : "bg-slate-50"
                  }`}
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    {getNotificationIcon(
                      notification.type,
                    )}
                  </div>

                  {/* Content */}
                  <button
                    type="button"
                    onClick={() =>
                      handleMarkAsRead(
                        notification,
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-start gap-2">
                      <h3
                        className={`text-sm ${
                          notification.isRead
                            ? "font-medium text-slate-700"
                            : "font-semibold text-slate-900"
                        }`}
                      >
                        {
                          notification.title
                        }
                      </h3>

                      {!notification.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        notification.message
                      }
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(
                        notification.createdAt,
                      )}
                    </p>
                  </button>

                  {/* Actions */}
                  <div className="flex shrink-0 items-start gap-1">
                    {!notification.isRead && (
                      <button
                        type="button"
                        title="Mark as read"
                        onClick={() =>
                          handleMarkAsRead(
                            notification,
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Check
                          size={17}
                        />
                      </button>
                    )}

                    <button
                      type="button"
                      title="Delete"
                      onClick={() =>
                        handleDelete(
                          notification._id,
                        )
                      }
                      disabled={
                        actionLoading
                      }
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;