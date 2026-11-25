import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Award,
  CheckCircle,
  Eye,
  Pencil,
  Plus,
  Star,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

import {
  deletePerformance,
  getPerformances,
} from "../services/performanceService";

const Performance = () => {
  const navigate = useNavigate();

  const [performances, setPerformances] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState("");

  const fetchPerformances =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getPerformances();

        setPerformances(
          Array.isArray(data)
            ? data
            : data?.data || [],
        );
      } catch (error) {
        setError(
          error?.message ||
            "Failed to fetch performances",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchPerformances();
  }, []);

  const handleDelete = async (
    id,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this performance record?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(id);

      await deletePerformance(id);

      setPerformances(
        (currentPerformances) =>
          currentPerformances.filter(
            (performance) =>
              performance._id !== id,
          ),
      );
    } catch (error) {
      window.alert(
        error?.message ||
          "Failed to delete performance",
      );
    } finally {
      setDeleteLoading("");
    }
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

  const getRatingClasses = (
    rating,
  ) => {
    if (rating >= 4) {
      return "text-green-600";
    }

    if (rating >= 3) {
      return "text-yellow-600";
    }

    return "text-red-600";
  };

  const formatDate = (
    date,
  ) => {
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

  const totalRecords =
    performances.length;

  const completedRecords =
    performances.filter(
      (performance) =>
        performance.status ===
        "completed",
    ).length;

  const pendingRecords =
    performances.filter(
      (performance) =>
        performance.status ===
        "pending",
    ).length;

  const averageRating =
    totalRecords > 0
      ? (
          performances.reduce(
            (total, performance) =>
              total +
              Number(
                performance.rating ||
                  0,
              ),
            0,
          ) / totalRecords
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Performance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage employee performance
            reviews and evaluations.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/performance/add",
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus size={17} />

          Add Performance
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <XCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Failed to load performance
              records
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={
                fetchPerformances
              }
              className="mt-2 text-sm font-medium text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Reviews
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {totalRecords}
              </h2>
            </div>

            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Award size={22} />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Completed
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {completedRecords}
              </h2>
            </div>

            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <CheckCircle
                size={22}
              />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {pendingRecords}
              </h2>
            </div>

            <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* Average */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Average Rating
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {averageRating}
                <span className="ml-1 text-sm font-medium text-gray-400">
                  / 5
                </span>
              </h2>
            </div>

            <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
              <Star
                size={22}
                fill="currentColor"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Performance Records
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Showing{" "}
              {performances.length}{" "}
              performance records
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-5 py-16">
            <div className="text-sm text-gray-500">
              Loading performance
              records...
            </div>
          </div>
        ) : performances.length ===
          0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16">
            <Award
              size={42}
              className="text-gray-300"
            />

            <p className="mt-3 text-sm text-gray-500">
              No performance records
              found.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/performance/add",
                )
              }
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={16} />

              Add Performance
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Review
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Rating
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Review Date
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {performances.map(
                  (performance) => (
                    <tr
                      key={
                        performance._id
                      }
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      {/* Employee */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {typeof performance.employee ===
                            "object"
                              ? `${performance.employee?.firstName || ""} ${performance.employee?.lastName || ""}`.trim()
                              : performance.employee}
                          </p>

                          {typeof performance.employee ===
                            "object" &&
                            performance.employee
                              ?.designation && (
                              <p className="text-xs text-gray-500">
                                {
                                  performance
                                    .employee
                                    .designation
                                }
                              </p>
                            )}
                        </div>
                      </td>

                      {/* Review */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {
                            performance.reviewPeriod
                          }
                        </p>

                        <p className="text-xs text-gray-500">
                          {
                            performance.reviewYear
                          }
                        </p>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-4">
                        <div
                          className={`inline-flex items-center gap-1 font-semibold ${getRatingClasses(
                            performance.rating,
                          )}`}
                        >
                          <Star
                            size={16}
                            fill="currentColor"
                          />

                          <span>
                            {
                              performance.rating
                            }
                          </span>

                          <span className="font-normal text-gray-400">
                            / 5
                          </span>
                        </div>
                      </td>

                      {/* Review Date */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatDate(
                          performance.reviewDate,
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                            performance.status,
                          )}`}
                        >
                          {
                            performance.status ||
                            "pending"
                          }
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="View"
                            onClick={() =>
                              navigate(
                                `/performance/${performance._id}`,
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                          >
                            <Eye
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              navigate(
                                `/performance/${performance._id}/edit`,
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                          >
                            <Pencil
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            disabled={
                              deleteLoading ===
                              performance._id
                            }
                            onClick={() =>
                              handleDelete(
                                performance._id,
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Performance;