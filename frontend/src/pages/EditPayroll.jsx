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
  useParams,
} from "react-router-dom";

import {
  getPayrollById,
  updatePayroll,
} from "../services/payrollService";

const EditPayroll = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [
    loading,
    setLoading,
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
    payroll,
    setPayroll,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState({
    month: "",
    year: "",
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
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getPayrollById(id);

        const data =
          response?.data;

        if (!data) {
          throw new Error(
            "Payroll not found.",
          );
        }

        setPayroll(data);

        setFormData({
          month:
            data.month || "",
          year:
            data.year || "",
          basicSalary:
            data.basicSalary ?? "",
          allowances:
            data.allowances ?? 0,
          deductions:
            data.deductions ?? 0,
          remarks:
            data.remarks || "",
        });
      } catch (error) {
        setError(
          error?.message ||
            "Failed to fetch payroll.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, [id]);

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

      await updatePayroll(
        id,
        payload,
      );

      navigate(
        `/payroll/${id}`,
      );
    } catch (error) {
      setError(
        error?.message ||
          "Failed to update payroll.",
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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading payroll...
        </p>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate("/payroll")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft
            size={18}
          />
          Back to Payroll
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">
            Payroll not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/payroll/${id}`,
            )
          }
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-50"
        >
          <ArrowLeft
            size={20}
          />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Payroll
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update payroll salary information.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Employee Information */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Employee
        </p>

        <p className="mt-1 font-semibold text-gray-900">
          {
            payroll.employee
              ?.firstName
          }{" "}
          {
            payroll.employee
              ?.lastName
          }
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {
            payroll.employee
              ?.designation
          }
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Payroll Period */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Payroll Period
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

              {fieldErrors.month && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    fieldErrors.month
                  }
                </p>
              )}
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

              {fieldErrors.year && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    fieldErrors.year
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Salary Details
          </h2>

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

          {/* Summary */}
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
              navigate(
                `/payroll/${id}`,
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save
              size={17}
            />

            {submitting
              ? "Updating..."
              : "Update Payroll"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPayroll;