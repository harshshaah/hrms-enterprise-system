import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Pencil,
  CalendarDays,
  IndianRupee,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import EmployeeDocuments from "../components/EmployeeDocuments";

import {
  getEmployeeById,
} from "../services/employeeService";

function EmployeeDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response =
        await getEmployeeById(id);

      setEmployee(response.data);
    } catch (error) {
      console.error(
        "Fetch Employee Error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to fetch employee details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDepartment = (
    department,
  ) => {
    if (!department) {
      return "-";
    }

    if (
      typeof department ===
      "object"
    ) {
      return department.name || "-";
    }

    return department
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date,
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const formatSalary = (salary) => {
    if (
      salary === null ||
      salary === undefined ||
      salary === ""
    ) {
      return "-";
    }

    return `₹${Number(
      salary,
    ).toLocaleString("en-IN")}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />

          <p className="mt-3 text-sm text-slate-500">
            Loading employee details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() =>
            navigate("/employees")
          }
          className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to Employees
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchEmployee}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const fullName =
    `${employee.firstName || ""} ${
      employee.lastName || ""
    }`.trim();

  const isActive =
    employee.status === "active";

  const initials =
    `${employee.firstName?.charAt(0) || ""}${
      employee.lastName?.charAt(0) || ""
    }`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/employees")
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Employee Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View employee information.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/employees/${id}/edit`,
            )
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Pencil size={17} />
          Edit Employee
        </button>
      </div>

      {/* Profile Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-2xl font-bold text-slate-700">
              {employee.profilePhoto ? (
                <img
                  src={
                    employee.profilePhoto
                  }
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials || (
                  <UserRound
                    size={28}
                  />
                )
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {fullName ||
                  "Unnamed Employee"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {employee.designation ||
                  "-"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {formatDepartment(
                    employee.department,
                  )}
                </span>

                <span className="text-xs text-slate-400">
                  ID: {employee._id}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
              isActive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {formatStatus(
              employee.status,
            )}
          </span>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Basic employee information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              First Name
            </p>

            <p className="mt-1.5 text-sm font-medium text-slate-800">
              {employee.firstName ||
                "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Last Name
            </p>

            <p className="mt-1.5 text-sm font-medium text-slate-800">
              {employee.lastName ||
                "-"}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays
              size={18}
              className="mt-0.5 text-slate-400"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Date of Birth
              </p>

              <p className="mt-1.5 text-sm font-medium text-slate-800">
                {formatDate(
                  employee.dateOfBirth,
                )}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Gender
            </p>

            <p className="mt-1.5 text-sm font-medium text-slate-800">
              {formatStatus(
                employee.gender,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Contact Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Employee contact and address
            details.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail
              size={18}
              className="mt-0.5 text-slate-400"
            />

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </p>

              {employee.email ? (
                <a
                  href={`mailto:${employee.email}`}
                  className="mt-1.5 block break-all text-sm font-medium text-slate-800 hover:text-slate-600"
                >
                  {employee.email}
                </a>
              ) : (
                <p className="mt-1.5 text-sm font-medium text-slate-800">
                  -
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <Phone
              size={18}
              className="mt-0.5 text-slate-400"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Phone
              </p>

              {employee.phone ? (
                <a
                  href={`tel:${employee.phone}`}
                  className="mt-1.5 block text-sm font-medium text-slate-800 hover:text-slate-600"
                >
                  {employee.phone}
                </a>
              ) : (
                <p className="mt-1.5 text-sm font-medium text-slate-800">
                  -
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3 md:col-span-2">
            <MapPin
              size={18}
              className="mt-0.5 text-slate-400"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Address
              </p>

              <p className="mt-1.5 text-sm font-medium leading-6 text-slate-800">
                {[
                  employee.address,
                  employee.city,
                  employee.state,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Job Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Employee role and employment
            details.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Department */}
          <div className="flex items-start gap-3">
            <Briefcase
              size={18}
              className="mt-0.5 text-slate-400"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Department
              </p>

              <p className="mt-1.5 text-sm font-medium text-slate-800">
                {formatDepartment(
                  employee.department,
                )}
              </p>
            </div>
          </div>

          {/* Designation */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Designation
            </p>

            <p className="mt-1.5 text-sm font-medium text-slate-800">
              {employee.designation ||
                "-"}
            </p>
          </div>

          {/* Joining Date */}
          <div className="flex items-start gap-3">
            <CalendarDays
              size={18}
              className="mt-0.5 text-slate-400"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Joining Date
              </p>

              <p className="mt-1.5 text-sm font-medium text-slate-800">
                {formatDate(
                  employee.joiningDate,
                )}
              </p>
            </div>
          </div>

          {/* Salary */}
          <div className="flex items-start gap-3">
            <IndianRupee
              size={18}
              className="mt-0.5 text-slate-400"
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Annual Salary
              </p>

              <p className="mt-1.5 text-sm font-medium text-slate-800">
                {formatSalary(
                  employee.salary,
                )}
              </p>
            </div>
          </div>

          {/* Employee ID */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Employee ID
            </p>

            <p className="mt-1.5 break-all text-sm font-medium text-slate-800">
              {employee._id || "-"}
            </p>
          </div>

          {/* Created At */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Created At
            </p>

            <p className="mt-1.5 text-sm font-medium text-slate-800">
              {formatDate(
                employee.createdAt,
              )}
            </p>
          </div>

          {/* Last Updated */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Last Updated
            </p>

            <p className="mt-1.5 text-sm font-medium text-slate-800">
              {formatDate(
                employee.updatedAt,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Employee Documents */}
      <EmployeeDocuments
        employeeId={employee._id}
      />

      {/* Bottom Actions */}
      <div className="flex flex-col-reverse gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            navigate("/employees")
          }
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Back to Employees
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/employees/${id}/edit`,
            )
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Pencil size={17} />
          Edit Employee
        </button>
      </div>
    </div>
  );
}

export default EmployeeDetails;