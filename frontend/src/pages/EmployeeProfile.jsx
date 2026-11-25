import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Camera,
  Mail,
  User,
  Shield,
  Save,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../services/userService";

const EmployeeProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
    });

  const [passwordData, setPasswordData] =
    useState({
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

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getMyProfile();

      const data =
        response?.data;

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
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load profile",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PROFILE INPUT CHANGE
  // =====================================================

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );
  };

  // =====================================================
  // PASSWORD INPUT CHANGE
  // =====================================================

  const handlePasswordChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setPasswordData(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

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
          updatedUser.firstName ||
          "",

        lastName:
          updatedUser.lastName ||
          "",
      });

      setSuccess(
        "Profile updated successfully.",
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err?.message ||
          "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handlePasswordSubmit =
    async (event) => {
      event.preventDefault();

      try {
        setError("");
        setSuccess("");

        if (
          !passwordData.currentPassword ||
          !passwordData.newPassword ||
          !passwordData.confirmPassword
        ) {
          setError(
            "Please fill all password fields.",
          );

          return;
        }

        if (
          passwordData.newPassword.length <
          6
        ) {
          setError(
            "New password must be at least 6 characters.",
          );

          return;
        }

        if (
          passwordData.newPassword !==
          passwordData.confirmPassword
        ) {
          setError(
            "New password and confirm password do not match.",
          );

          return;
        }

        setChangingPassword(true);

        await changeMyPassword({
          currentPassword:
            passwordData.currentPassword,

          newPassword:
            passwordData.newPassword,
        });

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setSuccess(
          "Password changed successfully.",
        );

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } catch (err) {
        setError(
          err?.message ||
            "Failed to change password.",
        );
      } finally {
        setChangingPassword(false);
      }
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error ||
            "User profile not found."}
        </div>
      </div>
    );
  }

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="mb-3 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={16} />

            Back
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and update your personal
            information.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {success}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-2xl font-semibold uppercase text-gray-600">
              {initials || (
                <User size={32} />
              )}
            </div>

            <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-white">
              <Camera size={14} />
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {user.firstName}{" "}
              {user.lastName}
            </h2>

            <p className="mt-1 text-sm capitalize text-gray-500">
              {user.role}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Mail size={15} />
                {user.email}
              </span>

              <span className="flex items-center gap-1.5 capitalize">
                <Shield size={15} />
                {user.role}
              </span>
            </div>
          </div>

          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                user.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.status}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Personal Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update your personal details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                First Name
              </label>

              <div className="relative">
                <User
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="firstName"
                  value={
                    formData.firstName
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Last Name
              </label>

              <div className="relative">
                <User
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="lastName"
                  value={
                    formData.lastName
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={
                    user.email || ""
                  }
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-500"
                />
              </div>

              <p className="mt-1.5 text-xs text-gray-400">
                Email is managed by HR/Admin.
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </label>

              <div className="relative">
                <Shield
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={
                    user.role || ""
                  }
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm capitalize text-gray-500"
                />
              </div>

              <p className="mt-1.5 text-xs text-gray-400">
                Role is managed by Admin.
              </p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your account details and current
              status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">
                Account Status
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    user.status ===
                    "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Member Since
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {user.createdAt
                  ? new Date(
                      user.createdAt,
                    ).toLocaleDateString(
                      "en-IN",
                    )
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Save size={16} />
            )}

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form
        onSubmit={
          handlePasswordSubmit
        }
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Change Password
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update your account password.
          </p>
        </div>

        <div className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Current Password
            </label>

            <div className="relative">
              <Lock
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                name="currentPassword"
                value={
                  passwordData.currentPassword
                }
                onChange={
                  handlePasswordChange
                }
                required
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    (previous) =>
                      !previous,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showCurrentPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              New Password
            </label>

            <div className="relative">
              <Lock
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                name="newPassword"
                value={
                  passwordData.newPassword
                }
                onChange={
                  handlePasswordChange
                }
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    (previous) =>
                      !previous,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showNewPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>

            <p className="mt-1.5 text-xs text-gray-400">
              Password must be at least 6
              characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>

            <div className="relative">
              <Lock
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={
                  passwordData.confirmPassword
                }
                onChange={
                  handlePasswordChange
                }
                required
                minLength={6}
                placeholder="Re-enter new password"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) =>
                      !previous,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Password Action */}
        <div className="mt-6 flex justify-end border-t border-gray-200 pt-5">
          <button
            type="submit"
            disabled={
              changingPassword
            }
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {changingPassword ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Lock size={16} />
            )}

            {changingPassword
              ? "Changing..."
              : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeProfile;