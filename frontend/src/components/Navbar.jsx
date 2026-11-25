import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [
    isProfileOpen,
    setIsProfileOpen,
  ] = useState(false);

  const [
    isNotificationOpen,
    setIsNotificationOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    notificationLoading,
    setNotificationLoading,
  ] = useState(false);

  const loadUnreadCount = async () => {
    try {
      const response =
        await getUnreadNotificationCount();

      setUnreadCount(
        response?.data?.count || 0,
      );
    } catch (error) {
      console.error(
        "Failed to fetch notification count:",
        error,
      );
    }
  };

  const loadNotifications = async () => {
    try {
      setNotificationLoading(true);

      const response =
        await getNotifications();

      setNotifications(
        response?.data || [],
      );
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error,
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const handleNotificationToggle =
    async () => {
      setIsNotificationOpen(
        (previous) => !previous,
      );

      setIsProfileOpen(false);

      if (!isNotificationOpen) {
        await loadNotifications();
      }
    };

  const handleNotificationClick =
    async (notification) => {
      try {
        if (!notification.isRead) {
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

          setUnreadCount(
            (previous) =>
              Math.max(previous - 1, 0),
          );
        }

        if (notification.link) {
          navigate(notification.link);
          setIsNotificationOpen(false);
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

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Failed to mark all notifications as read:",
          error,
        );
      }
    };

  const handleProfile = () => {
    setIsProfileOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsNotificationOpen(false);
  };

  const formatNotificationTime = (
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900">
              {user?.organization?.name || "HRMS"}
            </h1>
            {user?.organization?.subscription?.plan && (
              <button
                type="button"
                onClick={() => navigate("/billing")}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-600/20 hover:bg-blue-100 transition cursor-pointer"
                title="View Plans & Billing"
              >
                {user.organization.subscription.plan}
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Human Resource Management System
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <div className="relative">
            <button
              type="button"
              onClick={
                handleNotificationToggle
              }
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Notifications
                    </h3>

                    <p className="text-xs text-slate-500">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : "All caught up"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={
                        handleMarkAllAsRead
                      }
                      className="flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-slate-900"
                    >
                      <Check size={14} />

                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="max-h-96 overflow-y-auto">
                  {notificationLoading ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      Loading notifications...
                    </div>
                  ) : notifications.length ===
                    0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell
                        size={28}
                        className="mx-auto mb-2 text-slate-300"
                      />

                      <p className="text-sm font-medium text-slate-600">
                        No notifications
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        You're all caught up.
                      </p>
                    </div>
                  ) : (
                    notifications.map(
                      (notification) => (
                        <button
                          key={
                            notification._id
                          }
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification,
                            )
                          }
                          className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                            !notification.isRead
                              ? "bg-slate-50"
                              : "bg-white"
                          }`}
                        >
                          {/* Status */}
                          <div className="mt-1.5 shrink-0">
                            <span
                              className={`block h-2 w-2 rounded-full ${
                                !notification.isRead
                                  ? "bg-red-500"
                                  : "bg-slate-300"
                              }`}
                            />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm ${
                                !notification.isRead
                                  ? "font-semibold text-slate-800"
                                  : "font-medium text-slate-600"
                              }`}
                            >
                              {
                                notification.title
                              }
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                              {
                                notification.message
                              }
                            </p>

                            <p className="mt-2 text-[11px] text-slate-400">
                              {formatNotificationTime(
                                notification.createdAt,
                              )}
                            </p>
                          </div>
                        </button>
                      ),
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(
                  (previous) => !previous,
                );

                setIsNotificationOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-100"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>

              {/* User Info */}
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-slate-800">
                  {user?.firstName}{" "}
                  {user?.lastName}
                </p>

                <p className="text-xs capitalize text-slate-500">
                  {user?.role}
                </p>
              </div>

              <ChevronDown
                size={16}
                className="text-slate-400"
              />
            </button>

            {/* Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {/* User Info */}
                <div className="border-b border-slate-100 px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {user?.firstName}{" "}
                        {user?.lastName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* My Profile */}
                <button
                  type="button"
                  onClick={handleProfile}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100"
                >
                  <User size={17} />

                  My Profile
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={17} />

                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;