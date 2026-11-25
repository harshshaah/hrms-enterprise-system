import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Eye,
  EyeOff,
  Lock,
  Save,
  Settings as SettingsIcon,
  User,
} from "lucide-react";

import { toast } from "sonner";

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../services/userService";

import {
  getMySettings,
  updateMySettings,
} from "../services/settingsService";

const Settings = () => {
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    leaveNotifications: true,
    payrollNotifications: true,
    systemNotifications: true,
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [updatingNotification, setUpdatingNotification] =
    useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const [
        profileResponse,
        settingsResponse,
      ] = await Promise.all([
        getMyProfile(),
        getMySettings(),
      ]);

      const data =
        profileResponse?.data;

      const settingsData =
        settingsResponse?.data;

      if (!data) {
        throw new Error(
          "User profile not found",
        );
      }

      setUser(data);

      setFormData({
        firstName:
          data.firstName || "",
        lastName:
          data.lastName || "",
      });

      if (settingsData) {
        setNotifications({
          emailNotifications:
            settingsData.emailNotifications ??
            true,

          leaveNotifications:
            settingsData.leaveNotifications ??
            true,

          payrollNotifications:
            settingsData.payrollNotifications ??
            true,

          systemNotifications:
            settingsData.systemNotifications ??
            true,
        });
      }
    } catch (err) {
      toast.error(
        err?.message ||
          "Failed to load settings",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleNotificationChange = async (
    name,
  ) => {
    if (updatingNotification) {
      return;
    }

    const previousNotifications =
      notifications;

    const updatedNotifications = {
      ...notifications,
      [name]: !notifications[name],
    };

    setNotifications(
      updatedNotifications,
    );

    try {
      setUpdatingNotification(name);

      await updateMySettings(
        updatedNotifications,
      );

      toast.success(
        "Notification preference updated.",
      );
    } catch (err) {
      setNotifications(
        previousNotifications,
      );

      toast.error(
        err?.message ||
          "Failed to update notification preference.",
      );
    } finally {
      setUpdatingNotification(null);
    }
  };

  const handleAccountSubmit = async (
    event,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);

      const response =
        await updateMyProfile(
          formData,
        );

      const updatedUser =
        response?.data;

      if (!updatedUser) {
        throw new Error(
          "Profile update failed",
        );
      }

      setUser(updatedUser);

      setFormData({
        firstName:
          updatedUser.firstName || "",
        lastName:
          updatedUser.lastName || "",
      });

      toast.success(
        "Account settings updated successfully.",
      );
    } catch (err) {
      toast.error(
        err?.message ||
          "Failed to update account settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (
    event,
  ) => {
    event.preventDefault();

    if (
      passwordData.newPassword.length < 6
    ) {
      toast.error(
        "New password must be at least 6 characters.",
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      toast.error(
        "New password and confirm password do not match.",
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response =
        await changeMyPassword(
          passwordData,
        );

      toast.success(
        response?.message ||
          "Password changed successfully.",
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      toast.error(
        err?.message ||
          "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <SettingsIcon size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your account and system preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <form
        onSubmit={handleAccountSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <User size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Account
            </h2>

            <p className="text-sm text-slate-500">
              Manage your personal account information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              First Name
            </label>

            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Last Name
            </label>

            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Email is managed by HR/Admin.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </label>

            <input
              type="text"
              value={user?.role || ""}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm capitalize text-slate-500"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Role is managed by Admin.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Security */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Lock size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Security
            </h2>

            <p className="text-sm text-slate-500">
              Manage your account security.
            </p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-800">
              Change Password
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Update your account password securely.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Current Password */}
            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={
                passwordData.currentPassword
              }
              onChange={
                handlePasswordChange
              }
              show={showCurrentPassword}
              setShow={
                setShowCurrentPassword
              }
            />

            {/* New Password */}
            <PasswordInput
              label="New Password"
              name="newPassword"
              value={
                passwordData.newPassword
              }
              onChange={
                handlePasswordChange
              }
              show={showNewPassword}
              setShow={setShowNewPassword}
            />

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={
                passwordData.confirmPassword
              }
              onChange={
                handlePasswordChange
              }
              show={
                showConfirmPassword
              }
              setShow={
                setShowConfirmPassword
              }
            />
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock size={16} />

              {changingPassword
                ? "Changing..."
                : "Change Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Bell size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Notifications
            </h2>

            <p className="text-sm text-slate-500">
              Choose which notifications you want to receive.
            </p>
          </div>
        </div>

        <div className="mt-5 divide-y divide-slate-100">
          <NotificationOption
            title="Email Notifications"
            description="Receive important HRMS updates through email."
            checked={
              notifications.emailNotifications
            }
            loading={
              updatingNotification ===
              "emailNotifications"
            }
            onChange={() =>
              handleNotificationChange(
                "emailNotifications",
              )
            }
          />

          <NotificationOption
            title="Leave Notifications"
            description="Receive updates about leave requests and approvals."
            checked={
              notifications.leaveNotifications
            }
            loading={
              updatingNotification ===
              "leaveNotifications"
            }
            onChange={() =>
              handleNotificationChange(
                "leaveNotifications",
              )
            }
          />

          <NotificationOption
            title="Payroll Notifications"
            description="Receive notifications related to payroll."
            checked={
              notifications.payrollNotifications
            }
            loading={
              updatingNotification ===
              "payrollNotifications"
            }
            onChange={() =>
              handleNotificationChange(
                "payrollNotifications",
              )
            }
          />

          <NotificationOption
            title="System Notifications"
            description="Receive important system notifications."
            checked={
              notifications.systemNotifications
            }
            loading={
              updatingNotification ===
              "systemNotifications"
            }
            onChange={() =>
              handleNotificationChange(
                "systemNotifications",
              )
            }
          />
        </div>
      </div>

      {/* Account Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Account Status
        </h2>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Current Status
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your current HRMS account status.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              user?.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {user?.status || "unknown"}
          </span>
        </div>
      </div>
    </div>
  );
};

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  show,
  setShow,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          required
          minLength={6}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />

        <button
          type="button"
          onClick={() =>
            setShow(
              (previous) => !previous,
            )
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        >
          {show ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </div>
  );
};

const NotificationOption = ({
  title,
  description,
  checked,
  onChange,
  loading,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        disabled={loading}
        aria-pressed={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-slate-900"
            : "bg-slate-300"
        } ${
          loading
            ? "cursor-not-allowed opacity-60"
            : ""
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
};

export default Settings;