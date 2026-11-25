import { useEffect, useMemo, useState } from "react";

import {
  Check,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
  deleteLeave,
} from "../services/leaveService";

import {
  getCurrentUser,
} from "../services/authService";

const Leave = () => {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const currentUser =
    getCurrentUser();

  const userRole =
    currentUser?.role?.toLowerCase() || "";

  const canApproveReject =
    userRole === "admin" ||
    userRole === "hr";

  const canDelete =
    userRole === "admin";

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getLeaves();

      setLeaves(
        response.data || [],
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to fetch leaves",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApprove = async (
    id,
  ) => {
    if (actionLoading) return;
    try {
      setActionLoading(id);
      setError("");

      await approveLeave(id);

      await fetchLeaves();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to approve leave",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (
    id,
  ) => {
    if (actionLoading) return;
    const remarks =
      window.prompt(
        "Enter rejection remarks:",
      );

    if (remarks === null) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      await rejectLeave(
        id,
        remarks,
      );

      await fetchLeaves();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to reject leave",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (
    id,
  ) => {
    if (actionLoading) return;
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this leave?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      await cancelLeave(id);

      await fetchLeaves();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to cancel leave",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (
    id,
  ) => {
    if (actionLoading) return;
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this leave?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      await deleteLeave(id);

      await fetchLeaves();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to delete leave",
      );
    } finally {
      setActionLoading(null);
    }
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

  const getStatusClass = (
    status,
  ) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "cancelled":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const filteredLeaves = useMemo(() => {
    const searchValue =
      search
        .trim()
        .toLowerCase();

    return leaves.filter(
      (leave) => {
        const employeeName =
          `${leave.employee?.firstName || ""} ${
            leave.employee?.lastName || ""
          }`.toLowerCase();

        const employeeEmail =
          (
            leave.employee
              ?.email || ""
          ).toLowerCase();

        const leaveType =
          (
            leave.leaveType || ""
          ).toLowerCase();

        const reason =
          (
            leave.reason || ""
          ).toLowerCase();

        const matchesSearch =
          !searchValue ||
          employeeName.includes(
            searchValue,
          ) ||
          employeeEmail.includes(
            searchValue,
          ) ||
          leaveType.includes(
            searchValue,
          ) ||
          reason.includes(
            searchValue,
          );

        const matchesStatus =
          statusFilter ===
            "all" ||
          leave.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    );
  }, [
    leaves,
    search,
    statusFilter,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Leave Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage employee leave requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchLeaves}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/leaves/add",
              )
            }
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />

            Apply Leave
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search employee, email, leave type or reason..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={18}
              className="text-gray-400"
            />

            <select
              value={
                statusFilter
              }
              onChange={(
                event,
              ) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>
        </div>

        {/* Result Count */}
        <div className="mt-3 text-xs text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-700">
            {
              filteredLeaves.length
            }
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700">
            {leaves.length}
          </span>{" "}
          leave records
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Employee
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Leave Type
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Start Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  End Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Days
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    Loading leaves...
                  </td>
                </tr>
              ) : filteredLeaves.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No leave records found.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(
                  (leave) => (
                    <tr
                      key={
                        leave._id
                      }
                      className="transition hover:bg-gray-50"
                    >
                      {/* Employee */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {
                            leave
                              .employee
                              ?.firstName
                          }{" "}
                          {
                            leave
                              .employee
                              ?.lastName
                          }
                        </div>

                        <div className="text-xs text-gray-500">
                          {
                            leave
                              .employee
                              ?.email
                          }
                        </div>
                      </td>

                      {/* Leave Type */}
                      <td className="px-6 py-4">
                        <span className="capitalize text-sm text-gray-700">
                          {
                            leave.leaveType
                          }
                        </span>
                      </td>

                      {/* Start Date */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(
                          leave.startDate,
                        )}
                      </td>

                      {/* End Date */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(
                          leave.endDate,
                        )}
                      </td>

                      {/* Days */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {
                          leave.totalDays
                        }
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                            leave.status,
                          )}`}
                        >
                          {
                            leave.status
                          }
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/leaves/${leave._id}`,
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                            title="View"
                          >
                            <Eye
                              size={
                                18
                              }
                            />
                          </button>

                          {/* Edit */}
                          {leave.status ===
                            "pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/leaves/${leave._id}/edit`,
                                )
                              }
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-yellow-50 hover:text-yellow-600"
                              title="Edit"
                            >
                              <Pencil
                                size={
                                  18
                                }
                              />
                            </button>
                          )}

                          {/* Approve */}
                          {canApproveReject &&
                            leave.status ===
                              "pending" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleApprove(
                                    leave._id,
                                  )
                                }
                                disabled={Boolean(actionLoading)}
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                                title="Approve"
                              >
                                {actionLoading === leave._id ? (
                                  <Loader2
                                    size={18}
                                    className="animate-spin text-green-600"
                                  />
                                ) : (
                                  <Check
                                    size={
                                      18
                                    }
                                  />
                                )}
                              </button>
                            )}

                          {/* Reject */}
                          {canApproveReject &&
                            leave.status ===
                              "pending" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleReject(
                                    leave._id,
                                  )
                                }
                                disabled={Boolean(actionLoading)}
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                title="Reject"
                              >
                                <X
                                  size={
                                    18
                                  }
                                />
                              </button>
                            )}

                          {/* Cancel */}
                          {leave.status ===
                            "pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCancel(
                                  leave._id,
                                )
                              }
                              disabled={Boolean(actionLoading)}
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50"
                              title="Cancel"
                            >
                              <X
                                size={
                                  18
                                }
                              />
                            </button>
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  leave._id,
                                )
                              }
                              disabled={Boolean(actionLoading)}
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2
                                size={
                                  18
                                }
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leave;