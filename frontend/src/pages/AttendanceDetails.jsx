import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Edit3,
  Loader2,
  MessageSquare,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getAttendanceById,
} from "../services/attendanceService";

function AttendanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attendance, setAttendance] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchAttendance();
  }, [id]);

  const fetchAttendance =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAttendanceById(id);

        const data =
          response?.data;

        if (!data) {
          setError(
            "Attendance record not found",
          );
          return;
        }

        setAttendance(data);
      } catch (err) {
        console.error(
          "Failed to fetch attendance:",
          err,
        );

        setError(
          err?.message ||
            "Failed to load attendance",
        );
      } finally {
        setLoading(false);
      }
    };

  const formatDate = (
    dateValue,
  ) => {
    if (!dateValue) {
      return "-";
    }

    const date =
      new Date(dateValue);

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const formatTime = (
    dateValue,
  ) => {
    if (!dateValue) {
      return "-";
    }

    const date =
      new Date(dateValue);

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      },
    );
  };

  const getEmployeeName =
    () => {
      if (
        !attendance?.employee
      ) {
        return "Unknown Employee";
      }

      return `${attendance.employee.firstName || ""} ${
        attendance.employee.lastName || ""
      }`.trim();
    };

  const getStatusClasses =
    (status) => {
      switch (status) {
        case "present":
          return "bg-green-100 text-green-700";

        case "absent":
          return "bg-red-100 text-red-700";

        case "half-day":
          return "bg-yellow-100 text-yellow-700";

        case "leave":
          return "bg-blue-100 text-blue-700";

        default:
          return "bg-gray-100 text-gray-700";
      }
    };

  const getStatusLabel =
    (status) => {
      switch (status) {
        case "present":
          return "Present";

        case "absent":
          return "Absent";

        case "half-day":
          return "Half Day";

        case "leave":
          return "Leave";

        default:
          return status || "-";
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-gray-600"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate("/attendance")
          }
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Back to Attendance
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!attendance) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/attendance",
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft
              size={20}
            />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View attendance information
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/attendance/${id}/edit`,
            )
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Edit3 size={17} />
          Edit Attendance
        </button>
      </div>

      {/* Employee Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <User
              size={26}
              className="text-gray-600"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {getEmployeeName()}
            </h2>

            <div className="mt-1 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:gap-4">
              {attendance.employee
                ?.email && (
                <span>
                  {
                    attendance
                      .employee
                      .email
                  }
                </span>
              )}

              {attendance.employee
                ?.designation && (
                <span>
                  {
                    attendance
                      .employee
                      .designation
                  }
                </span>
              )}
            </div>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
              attendance.status,
            )}`}
          >
            {getStatusLabel(
              attendance.status,
            )}
          </span>
        </div>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Date */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <CalendarDays
                size={20}
                className="text-gray-600"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Attendance Date
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {formatDate(
                  attendance.date,
                )}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Status
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {getStatusLabel(
                attendance.status,
              )}
            </p>
          </div>
        </div>

        {/* Working Hours */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Clock3
                size={20}
                className="text-gray-600"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Working Hours
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {Number(
                  attendance.workingHours ||
                    0,
                ).toFixed(2)}{" "}
                hrs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Check In
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatTime(
                  attendance.checkIn,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Check Out
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatTime(
                  attendance.checkOut,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-gray-900">
          Time Summary
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Check In
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {formatTime(
                attendance.checkIn,
              )}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Check Out
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {formatTime(
                attendance.checkOut,
              )}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Total Working Time
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {Number(
                attendance.workingHours ||
                  0,
              ).toFixed(2)}{" "}
              hrs
            </p>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <MessageSquare
              size={20}
              className="text-gray-600"
            />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              Remarks
            </h2>

            <p className="text-sm text-gray-500">
              Additional attendance information
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {attendance.remarks?.trim()
              ? attendance.remarks
              : "No remarks added."}
          </p>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/attendance",
            )
          }
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft size={17} />
          Back to Attendance
        </button>
      </div>
    </div>
  );
}

export default AttendanceDetails;