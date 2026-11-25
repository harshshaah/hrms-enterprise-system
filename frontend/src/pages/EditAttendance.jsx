import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Save,
  User,
  Loader2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAttendanceById,
  updateAttendance,
} from "../services/attendanceService";

function EditAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    checkInHour: "",
    checkInMinute: "",
    checkInPeriod: "AM",
    checkOutHour: "",
    checkOutMinute: "",
    checkOutPeriod: "PM",
    status: "present",
    workingHours: "",
    remarks: "",
  });

  const [employee, setEmployee] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchAttendance();
  }, [id]);

  /*
   * Convert backend datetime to
   * 12-hour local time.
   *
   * Example:
   * 10:00 -> 10:00 AM
   * 19:00 -> 07:00 PM
   */
  const get12HourTime = (
    dateValue,
  ) => {
    const date = new Date(dateValue);

    let hours = date.getHours();

    const minutes =
      date.getMinutes();

    const period =
      hours >= 12 ? "PM" : "AM";

    hours =
      hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return {
      hour: String(
        hours,
      ).padStart(2, "0"),

      minute: String(
        minutes,
      ).padStart(2, "0"),

      period,
    };
  };

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

        setEmployee(
          data.employee,
        );

        const checkIn =
          data.checkIn
            ? get12HourTime(
                data.checkIn,
              )
            : null;

        const checkOut =
          data.checkOut
            ? get12HourTime(
                data.checkOut,
              )
            : null;

        setFormData({
          date: data.date
            ? new Date(
                data.date,
              )
                .toISOString()
                .slice(0, 10)
            : "",

          checkInHour:
            checkIn?.hour || "",

          checkInMinute:
            checkIn
              ? checkIn.minute
              : "",

          checkInPeriod:
            checkIn?.period ||
            "AM",

          checkOutHour:
            checkOut?.hour || "",

          checkOutMinute:
            checkOut
              ? checkOut.minute
              : "",

          checkOutPeriod:
            checkOut?.period ||
            "PM",

          status:
            data.status ||
            "present",

          workingHours:
            data.workingHours !==
              null &&
            data.workingHours !==
              undefined
              ? data.workingHours
              : "",

          remarks:
            data.remarks || "",
        });
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

  /*
   * Convert 12-hour time into
   * minutes from midnight.
   *
   * Example:
   * 10:00 AM -> 600
   * 07:00 PM -> 1140
   */
  const convertToMinutes =
    (
      hour,
      minute,
      period,
    ) => {
      let hours =
        Number(hour);

      const minutes =
        Number(minute);

      if (
        !hour ||
        !minute ||
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
      ) {
        return null;
      }

      if (
        period === "AM"
      ) {
        if (hours === 12) {
          hours = 0;
        }
      } else {
        if (hours !== 12) {
          hours += 12;
        }
      }

      return (
        hours * 60 +
        minutes
      );
    };

  const calculateWorkingHours =
    () => {
      const checkInMinutes =
        convertToMinutes(
          formData.checkInHour,
          formData.checkInMinute,
          formData.checkInPeriod,
        );

      const checkOutMinutes =
        convertToMinutes(
          formData.checkOutHour,
          formData.checkOutMinute,
          formData.checkOutPeriod,
        );

      if (
        checkInMinutes ===
          null ||
        checkOutMinutes ===
          null
      ) {
        return;
      }

      const difference =
        checkOutMinutes -
        checkInMinutes;

      if (difference < 0) {
        setError(
          "Check-out time cannot be earlier than check-in time",
        );

        return;
      }

      setError("");

      setFormData(
        (previous) => ({
          ...previous,
          workingHours:
            Number(
              (
                difference /
                60
              ).toFixed(2),
            ),
        }),
      );
    };

  /*
   * Convert 12-hour form values
   * to ISO datetime.
   */
  const buildDateTime = (
    date,
    hour,
    minute,
    period,
  ) => {
    if (
      !date ||
      !hour ||
      !minute
    ) {
      return null;
    }

    let hours =
      Number(hour);

    if (period === "AM") {
      if (hours === 12) {
        hours = 0;
      }
    } else {
      if (hours !== 12) {
        hours += 12;
      }
    }

    const formattedHour =
      String(hours).padStart(
        2,
        "0",
      );

    const formattedMinute =
      String(
        Number(minute),
      ).padStart(
        2,
        "0",
      );

    /*
     * No UTC conversion here.
     * Browser/server receives the
     * selected local date and time.
     */
    return `${date}T${formattedHour}:${formattedMinute}:00`;
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      try {
        setSaving(true);
        setError("");

        if (!formData.date) {
          setError(
            "Date is required",
          );

          return;
        }

        const checkInMinutes =
          convertToMinutes(
            formData.checkInHour,
            formData.checkInMinute,
            formData.checkInPeriod,
          );

        const checkOutMinutes =
          convertToMinutes(
            formData.checkOutHour,
            formData.checkOutMinute,
            formData.checkOutPeriod,
          );

        if (
          checkInMinutes !==
            null &&
          checkOutMinutes !==
            null &&
          checkOutMinutes <
            checkInMinutes
        ) {
          setError(
            "Check-out time cannot be earlier than check-in time",
          );

          return;
        }

        /*
         * Recalculate working hours
         * before submitting.
         */
        let workingHours =
          formData.workingHours;

        if (
          checkInMinutes !==
            null &&
          checkOutMinutes !==
            null
        ) {
          const difference =
            checkOutMinutes -
            checkInMinutes;

          workingHours =
            Number(
              (
                difference /
                60
              ).toFixed(2),
            );
        }

        const checkIn =
          buildDateTime(
            formData.date,
            formData.checkInHour,
            formData.checkInMinute,
            formData.checkInPeriod,
          );

        const checkOut =
          buildDateTime(
            formData.date,
            formData.checkOutHour,
            formData.checkOutMinute,
            formData.checkOutPeriod,
          );

        const payload = {
          date: formData.date,

          ...(checkIn && {
            checkIn,
          }),

          ...(checkOut && {
            checkOut,
          }),

          status:
            formData.status,

          workingHours:
            workingHours !==
              ""
              ? Number(
                  workingHours,
                )
              : 0,

          remarks:
            formData.remarks.trim(),
        };

        await updateAttendance(
          id,
          payload,
        );

        navigate(
          `/attendance/${id}`,
        );
      } catch (err) {
        console.error(
          "Failed to update attendance:",
          err,
        );

        setError(
          err?.message ||
            "Failed to update attendance",
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin"
        />
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
              `/attendance/${id}`,
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update attendance record
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={
          handleSubmit
        }
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* Employee */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Employee
          </label>

          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <User
              size={18}
              className="text-gray-500"
            />

            <div>
              <p className="font-medium text-gray-900">
                {employee
                  ? `${employee.firstName || ""} ${
                      employee.lastName || ""
                    }`.trim()
                  : "Unknown Employee"}
              </p>

              {employee?.email && (
                <p className="text-xs text-gray-500">
                  {employee.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Date
          </label>

          <div className="relative">
            <CalendarDays
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="date"
              name="date"
              value={
                formData.date
              }
              onChange={
                handleChange
              }
              required
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
          </div>
        </div>

        {/* Check In / Check Out */}
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Check In */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Check In
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Clock3
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  name="checkInHour"
                  value={
                    formData.checkInHour
                  }
                  onChange={
                    handleChange
                  }
                  onBlur={
                    calculateWorkingHours
                  }
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                >
                  <option value="">
                    Hour
                  </option>

                  {Array.from(
                    {
                      length: 12,
                    },
                    (
                      _,
                      index,
                    ) => {
                      const hour =
                        String(
                          index + 1,
                        ).padStart(
                          2,
                          "0",
                        );

                      return (
                        <option
                          key={
                            hour
                          }
                          value={
                            hour
                          }
                        >
                          {hour}
                        </option>
                      );
                    },
                  )}
                </select>
              </div>

              <select
                name="checkInMinute"
                value={
                  formData.checkInMinute
                }
                onChange={
                  handleChange
                }
                onBlur={
                  calculateWorkingHours
                }
                className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="">
                  Min
                </option>

                {Array.from(
                  {
                    length: 60,
                  },
                  (
                    _,
                    index,
                  ) => {
                    const minute =
                      String(
                        index,
                      ).padStart(
                        2,
                        "0",
                      );

                    return (
                      <option
                        key={
                          minute
                        }
                        value={
                          minute
                        }
                      >
                        {minute}
                      </option>
                    );
                  },
                )}
              </select>

              <select
                name="checkInPeriod"
                value={
                  formData.checkInPeriod
                }
                onChange={
                  handleChange
                }
                onBlur={
                  calculateWorkingHours
                }
                className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="AM">
                  AM
                </option>

                <option value="PM">
                  PM
                </option>
              </select>
            </div>
          </div>

          {/* Check Out */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Check Out
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Clock3
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  name="checkOutHour"
                  value={
                    formData.checkOutHour
                  }
                  onChange={
                    handleChange
                  }
                  onBlur={
                    calculateWorkingHours
                  }
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                >
                  <option value="">
                    Hour
                  </option>

                  {Array.from(
                    {
                      length: 12,
                    },
                    (
                      _,
                      index,
                    ) => {
                      const hour =
                        String(
                          index + 1,
                        ).padStart(
                          2,
                          "0",
                        );

                      return (
                        <option
                          key={
                            hour
                          }
                          value={
                            hour
                          }
                        >
                          {hour}
                        </option>
                      );
                    },
                  )}
                </select>
              </div>

              <select
                name="checkOutMinute"
                value={
                  formData.checkOutMinute
                }
                onChange={
                  handleChange
                }
                onBlur={
                  calculateWorkingHours
                }
                className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="">
                  Min
                </option>

                {Array.from(
                  {
                    length: 60,
                  },
                  (
                    _,
                    index,
                  ) => {
                    const minute =
                      String(
                        index,
                      ).padStart(
                        2,
                        "0",
                      );

                    return (
                      <option
                        key={
                          minute
                        }
                        value={
                          minute
                        }
                      >
                        {minute}
                      </option>
                    );
                  },
                )}
              </select>

              <select
                name="checkOutPeriod"
                value={
                  formData.checkOutPeriod
                }
                onChange={
                  handleChange
                }
                onBlur={
                  calculateWorkingHours
                }
                className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              >
                <option value="AM">
                  AM
                </option>

                <option value="PM">
                  PM
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Working Hours / Status */}
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={
                formData.status
              }
              onChange={
                handleChange
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            >
              <option value="present">
                Present
              </option>

              <option value="absent">
                Absent
              </option>

              <option value="half-day">
                Half Day
              </option>

              <option value="leave">
                Leave
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Working Hours
            </label>

            <input
              type="number"
              name="workingHours"
              value={
                formData.workingHours
              }
              onChange={
                handleChange
              }
              min="0"
              max="24"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            />
          </div>
        </div>

        {/* Remarks */}
        <div className="mb-6">
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
            rows={4}
            placeholder="Enter remarks..."
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/attendance/${id}`,
              )
            }
            disabled={saving}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Save size={18} />

                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAttendance;