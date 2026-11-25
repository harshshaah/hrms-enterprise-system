import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getUserById,
  updateUser,
} from "../services/userService";

import {
  getEmployees,
} from "../services/employeeService";

function EditUser() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "employee",
      status: "active",
      employee: "",
    });

  const [employees, setEmployees] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLoadingEmployees, setIsLoadingEmployees] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH ACTIVE EMPLOYEES
  // =====================================================

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);

      const response =
        await getEmployees();

      const employeeList =
        response?.data || [];

      setEmployees(
        employeeList.filter(
          (employee) =>
            employee.status ===
            "active",
        ),
      );
    } catch (error) {
      console.error(
        "Fetch Employees Error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to fetch employees.",
      );
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  // =====================================================
  // FETCH USER
  // =====================================================

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response =
        await getUserById(id);

      const user =
        response?.data;

      if (!user) {
        throw new Error(
          "User not found.",
        );
      }

      const employeeId =
        typeof user.employee ===
        "object"
          ? user.employee?._id
          : user.employee;

      setFormData({
        firstName:
          user.firstName || "",

        lastName:
          user.lastName || "",

        email:
          user.email || "",

        password: "",

        role:
          user.role ||
          "employee",

        status:
          user.status ||
          "active",

        employee:
          employeeId || "",
      });
    } catch (error) {
      console.error(
        "Fetch User Error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to fetch user.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchEmployees();
  }, [id]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => {
      const updatedData = {
        ...previous,
        [name]: value,
      };

      // Remove employee mapping
      // when role is not employee
      if (
        name === "role" &&
        value !== "employee"
      ) {
        updatedData.employee = "";
      }

      return updatedData;
    });
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    try {
      setError("");

      // Employee role requires mapping
      if (
        formData.role ===
          "employee" &&
        !formData.employee
      ) {
        setError(
          "Please select an employee for employee role.",
        );

        return;
      }

      setIsSubmitting(true);

      const updateData = {
        firstName:
          formData.firstName.trim(),

        lastName:
          formData.lastName.trim(),

        email:
          formData.email.trim(),

        role:
          formData.role,

        status:
          formData.status,
      };

      // Add employee mapping only
      // for employee role
      if (
        formData.role ===
        "employee"
      ) {
        updateData.employee =
          formData.employee;
      }

      // Password is optional
      if (
        formData.password.trim()
      ) {
        updateData.password =
          formData.password;
      }

      await updateUser(
        id,
        updateData,
      );

      navigate("/users");
    } catch (error) {
      console.error(
        "Update User Error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to update user.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2
            size={18}
            className="animate-spin"
          />

          Loading user...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate("/users")
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit User
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update user account details
            and access permissions.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              First Name
            </label>

            <input
              type="text"
              name="firstName"
              value={
                formData.firstName
              }
              onChange={handleChange}
              required
              placeholder="Enter first name"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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
              value={
                formData.lastName
              }
              onChange={handleChange}
              required
              placeholder="Enter last name"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={
                formData.email
              }
              onChange={handleChange}
              required
              placeholder="Enter email address"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Password */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              New Password
            </label>

            <input
              type="password"
              name="password"
              value={
                formData.password
              }
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              minLength={6}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Leave blank if you do not
              want to change the password.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </label>

            <select
              name="role"
              value={
                formData.role
              }
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="admin">
                Admin
              </option>

              <option value="hr">
                HR
              </option>

              <option value="employee">
                Employee
              </option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              name="status"
              value={
                formData.status
              }
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

          {/* Employee Mapping */}
          {formData.role ===
            "employee" && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Employee
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                name="employee"
                value={
                  formData.employee
                }
                onChange={
                  handleChange
                }
                required
                disabled={
                  isLoadingEmployees
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  {isLoadingEmployees
                    ? "Loading employees..."
                    : "Select employee"}
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={
                        employee._id
                      }
                      value={
                        employee._id
                      }
                    >
                      {
                        employee.firstName
                      }{" "}
                      {
                        employee.lastName
                      }{" "}
                      —{" "}
                      {
                        employee.designation
                      }
                    </option>
                  ),
                )}
              </select>

              <p className="mt-1.5 text-xs text-slate-500">
                Employee role must be
                linked to an active
                employee record.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={() =>
              navigate("/users")
            }
            disabled={
              isSubmitting
            }
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingEmployees
            }
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {isSubmitting
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditUser;