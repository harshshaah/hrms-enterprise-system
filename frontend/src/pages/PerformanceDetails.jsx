import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  Star,
  User,
} from "lucide-react";

import {
  getPerformanceById,
} from "../services/performanceService";

const PerformanceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [performance, setPerformance] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchPerformance =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getPerformanceById(id);

          setPerformance(
            data?.data || data,
          );
        } catch (error) {
          setError(
            error?.message ||
              "Failed to fetch performance",
          );
        } finally {
          setLoading(false);
        }
      };

    fetchPerformance();
  }, [id]);

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

  const getStatusClasses = (
    status,
  ) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "in-progress":
        return "bg-blue-100 text-blue-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-500">
        Loading performance...
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate("/performance")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Back to Performance
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error ||
            "Performance record not found."}
        </div>
      </div>
    );
  }

  const employeeName =
    typeof performance.employee ===
    "object"
      ? `${performance.employee?.firstName || ""} ${performance.employee?.lastName || ""}`.trim()
      : performance.employee;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/performance",
              )
            }
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Performance Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View employee performance
              review details.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/performance/${id}/edit`,
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Pencil size={17} />
          Edit Performance
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Employee */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User size={23} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Employee
              </p>

              <h2 className="mt-1 font-semibold text-gray-900">
                {employeeName ||
                  "Unknown Employee"}
              </h2>

              {typeof performance.employee ===
                "object" &&
                performance.employee
                  ?.designation && (
                  <p className="mt-1 text-xs text-gray-500">
                    {
                      performance
                        .employee
                        .designation
                    }
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Review */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CalendarDays
                size={23}
              />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Review
              </p>

              <h2 className="mt-1 font-semibold text-gray-900">
                {performance.reviewPeriod}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {performance.reviewYear}
              </p>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Overall Rating
          </p>

          <div className="mt-2 flex items-center gap-2">
            <Star
              size={24}
              className="text-yellow-500"
              fill="currentColor"
            />

            <span className="text-3xl font-bold text-gray-900">
              {performance.rating}
            </span>

            <span className="text-sm text-gray-400">
              / 5
            </span>
          </div>

          <span
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
              performance.status,
            )}`}
          >
            {performance.status ||
              "pending"}
          </span>
        </div>
      </div>

      {/* Review Date */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Review Information
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">
              Review Year
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {performance.reviewYear}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Review Period
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {performance.reviewPeriod}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Review Date
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {formatDate(
                performance.reviewDate,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Goals & Achievements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Goals */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Goals
          </h2>

          {performance.goals?.length ? (
            <ul className="mt-4 space-y-3">
              {performance.goals.map(
                (goal, index) => (
                  <li
                    key={index}
                    className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  >
                    {goal}
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              No goals added.
            </p>
          )}
        </div>

        {/* Achievements */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Achievements
          </h2>

          {performance.achievements
            ?.length ? (
            <ul className="mt-4 space-y-3">
              {performance.achievements.map(
                (
                  achievement,
                  index,
                ) => (
                  <li
                    key={index}
                    className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  >
                    {achievement}
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              No achievements added.
            </p>
          )}
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Feedback
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Strengths
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {performance.strengths ||
                "No strengths added."}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Weaknesses
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {performance.weaknesses ||
                "No weaknesses added."}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Manager Feedback
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {performance.managerFeedback ||
                "No manager feedback added."}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Remarks
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {performance.remarks ||
                "No remarks added."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDetails;