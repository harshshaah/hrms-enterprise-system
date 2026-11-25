import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Calculator,
  Save,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createPayroll,
  getEmployeesForPayroll,
} from "../services/payrollService";

const AddPayroll = () => {
  const navigate = useNavigate();

  const [
    employees,
    setEmployees,
  ] = useState([]);

  const [
    loadingEmployees,
    setLoadingEmployees,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    formData,
    setFormData,
  ] = useState({
    employee: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: "",
    allowances: "",
    deductions: "",
    remarks: "",
  });

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState({});

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);

        const data =
          await getEmployeesForPayroll();

        setEmployees(data);
      } catch (error) {
        setError(
          error?.message ||
            "Failed to fetch employees.",
        );
      } finally {
        setLoadingEmployees(false);
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

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors(
      (previous) => ({
        ...previous,
        [name]: "",
      }),
    );

    setError("");
  };

  const grossSalary = useMemo(() => {
    const basic =
      Number(formData.basicSalary) || 0;

    const allowances =
      Number(formData.allowances) || 0;

    return basic + allowances;
  }, [
    formData.basicSalary,
    formData.allowances,
  ]);

  const netSalary = useMemo(() => {
    const deductions =
      Number(formData.deductions) || 0;

    return grossSalary - deductions;
  }, [
    grossSalary,
    formData.deductions,
  ]);

  const formatCurrency = (
    amount,
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      },
    ).format(amount || 0);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.employee) {
      errors.employee =
        "Please select an employee.";
    }

    if (!formData.month) {
      errors.month =
        "Please select a month.";
    }

    if (!formData.year) {
      errors.year =
        "Please enter year.";
    }

    if (
      !formData.basicSalary ||
      Number(formData.basicSalary) <= 0
    ) {
      errors.basicSalary =
        "Basic salary must be greater than 0.";
    }

    if (
      Number(formData.allowances) < 0
    ) {
      errors.allowances =
        "Allowances cannot be negative.";
    }

    if (
      Number(formData.deductions) < 0
    ) {
      errors.deductions =
        "Deductions cannot be negative.";
    }

    if (
      Number(formData.deductions) >
      grossSalary
    ) {
      errors.deductions =
        "Deductions cannot be greater than gross salary.";
    }

    setFieldErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        employee:
          formData.employee,

        month: Number(
          formData.month,
        ),

        year: Number(
          formData.year,
        ),

        basicSalary: Number(
          formData.basicSalary,
        ),

        allowances: Number(
          formData.allowances || 0,
        ),

        deductions: Number(
          formData.deductions || 0,
        ),

        remarks:
          formData.remarks.trim(),
      };

      await createPayroll(
        payload,
      );

      navigate("/payroll");
    } catch (error) {
      setError(
        error?.message ||
          "Failed to create payroll.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const months = [
    {
      value: 1,
      label: "January",
    },
    {
      value: 2,
      label: "February",
    },
    {
      value: 3,
      label: "March",
    },
    {
      value: 4,
      label: "April",
    },
    {
      value: 5,
      label: "May",
    },
    {
      value: 6,
      label: "June",
    },
    {
      value: 7,
      label: "July",
    },
    {
      value: 8,
      label: "August",
    },
    {
      value: 9,
      label: "September",
    },
    {
      value: 10,
      label: "October",
    },
    {
      value: 11,
      label: "November",
    },
    {
      value: 12,
      label: "December",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate("/payroll")
          }
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-50"
        >
          <ArrowLeft
            size={20}
          />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Add Payroll
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create monthly payroll for an
            employee.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Employee & Period */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Payroll Period
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select employee and payroll month.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Employee
                <span className="text-red-500">
                  {" "}
                  *
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
                  loadingEmployees
                }
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  fieldErrors.employee
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              >
                <option value="">
                  {loadingEmployees
                    ? "Loading employees..."
                    : "Select employee"}
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
                      {
                        employee.firstName
                      }{" "}
                      {
                        employee.lastName
                      }{" "}
                      -{" "}
                      {
                        employee.designation
                      }
                    </option>
                  ),
                )}
              </select>

              {fieldErrors.employee && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    fieldErrors.employee
                  }
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Month
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <select
                name="month"
                value={
                  formData.month
                }
                onChange={
                  handleChange
                }
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  fieldErrors.month
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              >
                {months.map(
                  (month) => (
                    <option
                      key={
                        month.value
                      }
                      value={
                        month.value
                      }
                    >
                      {
                        month.label
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Year
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="number"
                name="year"
                value={
                  formData.year
                }
                onChange={
                  handleChange
                }
                min="2000"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  fieldErrors.year
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Salary Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Salary Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter salary components for this
              payroll period.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Basic Salary
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="number"
                name="basicSalary"
                value={
                  formData.basicSalary
                }
                onChange={
                  handleChange
                }
                min="0"
                placeholder="35000"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  fieldErrors.basicSalary
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              />

              {fieldErrors.basicSalary && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    fieldErrors.basicSalary
                  }
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Allowances
              </label>

              <input
                type="number"
                name="allowances"
                value={
                  formData.allowances
                }
                onChange={
                  handleChange
                }
                min="0"
                placeholder="5000"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  fieldErrors.allowances
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              />

              {fieldErrors.allowances && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    fieldErrors.allowances
                  }
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Deductions
              </label>

              <input
                type="number"
                name="deductions"
                value={
                  formData.deductions
                }
                onChange={
                  handleChange
                }
                min="0"
                placeholder="2000"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  fieldErrors.deductions
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              />

              {fieldErrors.deductions && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    fieldErrors.deductions
                  }
                </p>
              )}
            </div>
          </div>

          {/* Salary Summary */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calculator
                  size={17}
                />

                Gross Salary
              </div>

              <p className="mt-2 text-xl font-bold text-gray-900">
                {formatCurrency(
                  grossSalary,
                )}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Calculator
                  size={17}
                />

                Net Salary
              </div>

              <p className="mt-2 text-xl font-bold text-blue-700">
                {formatCurrency(
                  netSalary,
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
            maxLength="500"
            placeholder="Enter any payroll remarks..."
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {
              formData.remarks
                .length
            }
            /500
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/payroll")
            }
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              loadingEmployees
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save
              size={17}
            />

            {submitting
              ? "Creating..."
              : "Create Payroll"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPayroll;