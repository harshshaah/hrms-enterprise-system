import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getLeaveById,
  approveLeave,
  rejectLeave,
  cancelLeave,
} from "../services/leaveService";

import {
  useAuth,
} from "../context/AuthContext";

const LeaveDetails = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const { user } = useAuth();

  const [leave, setLeave] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  const [rejectRemarks, setRejectRemarks] =
    useState("");

  const userRole =
    user?.role?.toLowerCase() || "";

  const canApproveReject =
    userRole === "admin" ||
    userRole === "hr";

  const fetchLeave = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getLeaveById(id);

      setLeave(
        response.data,
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to fetch leave",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeave();
  }, [id]);

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

  const formatDateTime = (
    date,
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date,
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

  const getStatusIcon = (
    status,
  ) => {
    switch (status) {
      case "approved":
        return (
          <CheckCircle
            size={18}
          />
        );

      case "rejected":
        return (
          <XCircle
            size={18}
          />
        );

      default:
        return (
          <Clock
            size={18}
          />
        );
    }
  };

  const handleApprove =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to approve this leave?",
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(true);
        setActionError("");

        await approveLeave(
          leave._id,
        );

        await fetchLeave();
      } catch (error) {
        console.error(error);

        setActionError(
          error.message ||
            "Failed to approve leave",
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleReject =
    async () => {
      if (!rejectRemarks.trim()) {
        setActionError(
          "Please enter rejection remarks.",
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to reject this leave?",
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(true);
        setActionError("");

        await rejectLeave(
          leave._id,
          rejectRemarks.trim(),
        );

        setRejectRemarks("");

        await fetchLeave();
      } catch (error) {
        console.error(error);

        setActionError(
          error.message ||
            "Failed to reject leave",
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleCancel =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this leave?",
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(true);
        setActionError("");

        await cancelLeave(
          leave._id,
        );

        await fetchLeave();
      } catch (error) {
        console.error(error);

        setActionError(
          error.message ||
            "Failed to cancel leave",
        );
      } finally {
        setActionLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading leave details...
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
            navigate("/leaves")
          }
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />

          Back to Leaves
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate("/leaves")
          }
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />

          Back to Leaves
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Leave not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/leaves")
            }
            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
          >
            <ArrowLeft
              size={20}
            />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Leave Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View complete leave
              information
            </p>
          </div>
        </div>

        {leave.status ===
          "pending" && (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/leaves/${leave._id}/edit`,
              )
            }
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Edit Leave
          </button>
        )}
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {/* Status */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Leave Status
            </p>

            <div
              className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium capitalize ${getStatusClass(
                leave.status,
              )}`}
            >
              {getStatusIcon(
                leave.status,
              )}

              {leave.status}
            </div>
          </div>

          <CalendarDays
            size={36}
            className="text-gray-300"
          />
        </div>

        {/* Pending Actions */}
        {leave.status ===
          "pending" && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <p className="mb-4 text-sm font-medium text-gray-700">
              Leave Actions
            </p>

            <div className="flex flex-wrap gap-3">
              {/* Approve */}
              {canApproveReject && (
                <button
                  type="button"
                  onClick={
                    handleApprove
                  }
                  disabled={
                    actionLoading
                  }
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle
                    size={18}
                  />

                  {actionLoading
                    ? "Processing..."
                    : "Approve Leave"}
                </button>
              )}

              {/* Cancel */}
              <button
                type="button"
                onClick={
                  handleCancel
                }
                disabled={
                  actionLoading
                }
                className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle
                  size={18}
                />

                Cancel Leave
              </button>
            </div>

            {/* Reject */}
            {canApproveReject && (
              <div className="mt-5 max-w-xl">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rejection Remarks
                </label>

                <textarea
                  value={
                    rejectRemarks
                  }
                  onChange={(
                    event,
                  ) =>
                    setRejectRemarks(
                      event.target
                        .value,
                    )
                  }
                  rows={3}
                  maxLength={500}
                  placeholder="Enter reason for rejecting this leave..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />

                <button
                  type="button"
                  onClick={
                    handleReject
                  }
                  disabled={
                    actionLoading
                  }
                  className="mt-3 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle
                    size={18}
                  />

                  Reject Leave
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Employee Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Employee Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Employee Name
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {
                leave.employee
                  ?.firstName
              }{" "}
              {
                leave.employee
                  ?.lastName
              }
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Email
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {leave.employee
                ?.email ||
                "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Designation
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {leave.employee
                ?.designation ||
                "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Department
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {typeof leave
                .employee
                ?.department ===
              "object"
                ? leave
                    .employee
                    ?.department
                    ?.name ||
                  "-"
                : leave
                    .employee
                    ?.department ||
                  "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Leave Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Leave Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Leave Type
            </p>

            <p className="mt-1 text-sm font-medium capitalize text-gray-900">
              {leave.leaveType}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Start Date
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDate(
                leave.startDate,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              End Date
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDate(
                leave.endDate,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Total Days
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {leave.totalDays}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Reason
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {leave.reason ||
                "-"}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Remarks
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {leave.remarks ||
                "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Approval Information */}
      {leave.approvedBy && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Approval Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Action By
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {
                  leave
                    .approvedBy
                    ?.firstName
                }{" "}
                {
                  leave
                    .approvedBy
                    ?.lastName
                }
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {
                  leave
                    .approvedBy
                    ?.email
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Action Date
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {formatDateTime(
                  leave.approvedAt,
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          System Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Created At
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDateTime(
                leave.createdAt,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Last Updated
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDateTime(
                leave.updatedAt,
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetails;