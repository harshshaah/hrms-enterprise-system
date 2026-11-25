import {
  ArrowLeft,
  Save,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  createAttendance,
} from "../services/attendanceService";

import {
  getEmployees,
} from "../services/employeeService";

function AddAttendance() {
  const navigate = useNavigate();

  const [employees, setEmployees] =
    useState([]);

  const [formData, setFormData] =
    useState({
      employee: "",
      date: "",
      checkIn: "",
      checkOut: "",
      status: "present",
      workingHours: "",
      remarks: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [employeesLoading, setEmployeesLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchEmployees =
      async () => {
        try {
          setEmployeesLoading(true);

          const response =
            await getEmployees();

          setEmployees(
            response.data || [],
          );
        } catch (error) {
          console.error(
            "Failed to fetch employees:",
            error,
          );

          setError(
            error.message ||
              "Failed to fetch employees",
          );
        } finally {
          setEmployeesLoading(false);
        }
      };

    fetchEmployees();
  }, []);

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

  const calculateWorkingHours =
    () => {
      if (
        !formData.checkIn ||
        !formData.checkOut
      ) {
        return;
      }

      const checkIn =
        new Date(
          `${formData.date}T${formData.checkIn}`,
        );

      const checkOut =
        new Date(
          `${formData.date}T${formData.checkOut}`,
        );

      if (
        checkOut <= checkIn
      ) {
        return;
      }

      const difference =
        checkOut.getTime() -
        checkIn.getTime();

      const hours =
        difference /
        (1000 * 60 * 60);

      setFormData(
        (previous) => ({
          ...previous,
          workingHours:
            Number(
              hours.toFixed(2),
            ),
        }),
      );
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (!formData.employee) {
        setError(
          "Please select an employee.",
        );

        return;
      }

      if (!formData.date) {
        setError(
          "Please select a date.",
        );

        return;
      }

      try {
        setLoading(true);

        const payload = {
          employee:
            formData.employee,

          date:
            formData.date,

          checkIn:
            formData.checkIn
              ? `${formData.date}T${formData.checkIn}:00`
              : undefined,

          checkOut:
            formData.checkOut
              ? `${formData.date}T${formData.checkOut}:00`
              : undefined,

          status:
            formData.status,

          workingHours:
            formData.workingHours
              ? Number(
                  formData.workingHours,
                )
              : 0,

          remarks:
            formData.remarks.trim(),
        };

        await createAttendance(
          payload,
        );

        navigate("/attendance");
      } catch (error) {
        console.error(
          "Failed to create attendance:",
          error,
        );

        setError(
          error.message ||
            "Failed to create attendance",
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate("/attendance")
          }
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Add Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create an attendance record
            for an employee.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Employee + Date */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500">
                  {" "}*
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
                disabled={
                  employeesLoading
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100"
              >
                <option value="">
                  {employeesLoading
                    ? "Loading employees..."
                    : "Select Employee"}
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
                      {employee.firstName}{" "}
                      {employee.lastName}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="date"
                name="date"
                value={
                  formData.date
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>

          {/* Check In + Check Out */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Check In
              </label>

              <input
                type="time"
                name="checkIn"
                value={
                  formData.checkIn
                }
                onChange={
                  handleChange
                }
                onBlur={
                  calculateWorkingHours
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Check Out
              </label>

              <input
                type="time"
                name="checkOut"
                value={
                  formData.checkOut
                }
                onChange={
                  handleChange
                }
                onBlur={
                  calculateWorkingHours
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>

          {/* Status + Working Hours */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
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
                step="0.5"
                placeholder="e.g. 9"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
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
              rows="4"
              placeholder="Enter remarks..."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() =>
                navigate("/attendance")
              }
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {loading
                ? "Saving..."
                : "Save Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAttendance;