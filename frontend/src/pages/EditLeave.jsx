import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  Save,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getLeaveById,
  updateLeave,
} from "../services/leaveService";

const EditLeave = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [formData, setFormData] =
    useState({
      leaveType: "casual",
      startDate: "",
      endDate: "",
      reason: "",
      remarks: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchLeave =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getLeaveById(id);

          const leave =
            response.data;

          if (!leave) {
            throw new Error(
              "Leave not found",
            );
          }

          if (
            leave.status !==
            "pending"
          ) {
            setError(
              "Only pending leaves can be edited.",
            );

            return;
          }

          setFormData({
            leaveType:
              leave.leaveType ||
              "casual",

            startDate:
              leave.startDate
                ? leave.startDate.split(
                    "T",
                  )[0]
                : "",

            endDate:
              leave.endDate
                ? leave.endDate.split(
                    "T",
                  )[0]
                : "",

            reason:
              leave.reason || "",

            remarks:
              leave.remarks || "",
          });
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

    fetchLeave();
  }, [id]);

  const calculateDays = (
    startDate,
    endDate,
  ) => {
    if (
      !startDate ||
      !endDate
    ) {
      return 0;
    }

    const start =
      new Date(
        `${startDate}T00:00:00`,
      );

    const end =
      new Date(
        `${endDate}T00:00:00`,
      );

    if (start > end) {
      return 0;
    }

    const difference =
      end.getTime() -
      start.getTime();

    return (
      Math.floor(
        difference /
          (1000 *
            60 *
            60 *
            24),
      ) + 1
    );
  };

  const totalDays =
    calculateDays(
      formData.startDate,
      formData.endDate,
    );

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

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setError("");

    if (!formData.startDate) {
      setError(
        "Please select a start date.",
      );

      return;
    }

    if (!formData.endDate) {
      setError(
        "Please select an end date.",
      );

      return;
    }

    if (
      new Date(
        `${formData.startDate}T00:00:00`,
      ) >
      new Date(
        `${formData.endDate}T00:00:00`,
      )
    ) {
      setError(
        "End date cannot be before start date.",
      );

      return;
    }

    if (!formData.reason.trim()) {
      setError(
        "Please enter a leave reason.",
      );

      return;
    }

    try {
      setSubmitting(true);

      await updateLeave(id, {
        leaveType:
          formData.leaveType,

        startDate:
          new Date(
            `${formData.startDate}T00:00:00`,
          ).toISOString(),

        endDate:
          new Date(
            `${formData.endDate}T00:00:00`,
          ).toISOString(),

        reason:
          formData.reason.trim(),

        remarks:
          formData.remarks.trim(),
      });

      navigate(
        `/leaves/${id}`,
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to update leave",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading leave...
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
            navigate(
              `/leaves/${id}`,
            )
          }
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />

          Back to Leave
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/leaves/${id}`,
            )
          }
          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Leave
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update pending leave
            request
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Leave Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Leave Type
              <span className="text-red-500">
                {" "}
                *
              </span>
            </label>

            <select
              name="leaveType"
              value={
                formData.leaveType
              }
              onChange={
                handleChange
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="casual">
                Casual Leave
              </option>

              <option value="sick">
                Sick Leave
              </option>

              <option value="paid">
                Paid Leave
              </option>

              <option value="unpaid">
                Unpaid Leave
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

          {/* Total Days */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Total Days
            </label>

            <input
              type="number"
              value={totalDays}
              readOnly
              min="0"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none"
            />

            <p className="mt-1 text-xs text-gray-400">
              Automatically
              calculated from
              dates.
            </p>
          </div>

          {/* Start Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Start Date
              <span className="text-red-500">
                {" "}
                *
              </span>
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                name="startDate"
                value={
                  formData.startDate
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              End Date
              <span className="text-red-500">
                {" "}
                *
              </span>
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                name="endDate"
                value={
                  formData.endDate
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reason
              <span className="text-red-500">
                {" "}
                *
              </span>
            </label>

            <textarea
              name="reason"
              value={
                formData.reason
              }
              onChange={
                handleChange
              }
              rows="4"
              maxLength="500"
              placeholder="Enter reason for leave"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Remarks */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Remarks
            </label>

            <textarea
              name="remarks"
              value={
                formData.remarks
              }
              onChange={
                handleChange
              }
              rows="3"
              maxLength="500"
              placeholder="Optional remarks"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/leaves/${id}`,
              )
            }
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />

            {submitting
              ? "Updating..."
              : "Update Leave"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLeave;