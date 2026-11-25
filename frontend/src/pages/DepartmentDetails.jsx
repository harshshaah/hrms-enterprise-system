import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  User,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getDepartmentById,
} from "../services/departmentService";

function DepartmentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [department, setDepartment] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response =
          await getDepartmentById(id);

        setDepartment(response?.data || null);
      } catch (error) {
        console.error(
          "Fetch Department Error:",
          error,
        );

        setError(
          error?.message ||
            "Failed to fetch department",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartment();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading department...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate("/departments")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to Departments
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          Department not found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/departments")
            }
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Department Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View department information
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/departments/${department._id}/edit`,
            )
          }
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Edit Department
        </button>
      </div>

      {/* Department Overview */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
              <Building2
                size={28}
                className="text-slate-600"
              />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">
                  {department.name}
                </h2>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    department.status ===
                    "active"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {department.status
                    ?.charAt(0)
                    .toUpperCase() +
                    department.status?.slice(
                      1,
                    )}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Department Code:{" "}
                <span className="font-semibold text-slate-700">
                  {department.code}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {/* Department Name */}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Building2
                size={19}
                className="text-slate-400"
              />

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Department Name
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {department.name}
                </p>
              </div>
            </div>
          </div>

          {/* Department Code */}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <FileText
                size={19}
                className="text-slate-400"
              />

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Department Code
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {department.code}
                </p>
              </div>
            </div>
          </div>

          {/* Head */}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <User
                size={19}
                className="text-slate-400"
              />

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Head of Department
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {department.headOfDepartment ||
                    "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Created At */}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <CalendarDays
                size={19}
                className="text-slate-400"
              />

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Created At
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {department.createdAt
                    ? new Date(
                        department.createdAt,
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-slate-200 px-6 py-5">
          <p className="mb-2 text-xs font-medium text-slate-400">
            Description
          </p>

          <p className="text-sm leading-6 text-slate-600">
            {department.description ||
              "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DepartmentDetails;