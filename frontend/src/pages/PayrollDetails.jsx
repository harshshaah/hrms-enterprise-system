import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getPayrollById,
} from "../services/payrollService";

const PayrollDetails = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [
    payroll,
    setPayroll,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getPayrollById(id);

        setPayroll(
          response?.data || null,
        );
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

  const formatMonth = (
    month,
  ) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return months[month - 1] || "-";
  };

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

  const getStatusClasses = (
    status,
  ) => {
    if (status === "paid") {
      return "bg-green-100 text-green-700";
    }

    if (status === "cancelled") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusIcon = (
    status,
  ) => {
    if (status === "paid") {
      return (
        <CheckCircle
          size={18}
        />
      );
    }

    if (status === "cancelled") {
      return (
        <XCircle
          size={18}
        />
      );
    }

    return (
      <Clock
        size={18}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading payroll details...
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
            navigate("/payroll")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft
            size={18}
          />
          Back to Payroll
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
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

  const employeeName = `${payroll.employee?.firstName || ""} ${
    payroll.employee?.lastName || ""
  }`.trim();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              Payroll Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View complete payroll information.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/payroll/${payroll._id}/edit`,
            )
          }
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Edit Payroll
        </button>
      </div>

      {/* Employee Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <User
            size={20}
            className="text-blue-600"
          />

          <h2 className="text-lg font-semibold text-gray-900">
            Employee Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Employee
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {employeeName || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Email
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {payroll.employee
                ?.email || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Designation
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {payroll.employee
                ?.designation || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Department ID
            </p>

            <p className="mt-1 break-all text-sm text-gray-700">
              {payroll.employee
                ?.department || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Payroll Overview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <CalendarDays
            size={20}
            className="text-blue-600"
          />

          <h2 className="text-lg font-semibold text-gray-900">
            Payroll Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Payroll Period
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {formatMonth(
                payroll.month,
              )}{" "}
              {payroll.year}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Status
            </p>

            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                  payroll.status,
                )}`}
              >
                {getStatusIcon(
                  payroll.status,
                )}

                {payroll.status}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Payment Date
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDate(
                payroll.paymentDate,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Created Date
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDate(
                payroll.createdAt,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <DollarSign
            size={20}
            className="text-blue-600"
          />

          <h2 className="text-lg font-semibold text-gray-900">
            Salary Breakdown
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="text-sm text-gray-600">
              Basic Salary
            </span>

            <span className="font-medium text-gray-900">
              {formatCurrency(
                payroll.basicSalary,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="text-sm text-gray-600">
              Allowances
            </span>

            <span className="font-medium text-green-600">
              +{" "}
              {formatCurrency(
                payroll.allowances,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="text-sm font-medium text-gray-700">
              Gross Salary
            </span>

            <span className="font-semibold text-gray-900">
              {formatCurrency(
                payroll.grossSalary,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="text-sm text-gray-600">
              Deductions
            </span>

            <span className="font-medium text-red-600">
              -{" "}
              {formatCurrency(
                payroll.deductions,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-4">
            <span className="font-semibold text-blue-900">
              Net Salary
            </span>

            <span className="text-xl font-bold text-blue-700">
              {formatCurrency(
                payroll.netSalary,
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Remarks
        </h2>

        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
          {payroll.remarks ||
            "No remarks added."}
        </p>
      </div>
    </div>
  );
};

export default PayrollDetails;