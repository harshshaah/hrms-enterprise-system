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
  Printer,
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 print:hidden"
          >
            <Printer size={16} />
            Print Payslip
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/payroll/${payroll._id}/edit`,
              )
            }
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 print:hidden"
          >
            Edit Payroll
          </button>
        </div>
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

      {/* Indian Statutory Salary Slip Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:border-none print:shadow-none">
        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Payslip Breakdown (INR)
            </h2>
          </div>
          <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
            Zimyo Statutory Ledger
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings Column */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 border-b border-emerald-100 pb-2 mb-3">
              Gross Earnings
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Basic Salary (50%)</span>
                <span className="font-mono font-medium">{formatCurrency(payroll.basicSalary)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>House Rent Allowance (HRA)</span>
                <span className="font-mono font-medium">{formatCurrency(payroll.hra || Math.round(payroll.basicSalary * 0.4))}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Conveyance Allowance</span>
                <span className="font-mono font-medium">{formatCurrency(payroll.conveyanceAllowance || 1600)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Special Allowance</span>
                <span className="font-mono font-medium">{formatCurrency(payroll.specialAllowance || Math.max(0, payroll.allowances - (payroll.hra || 0) - (payroll.conveyanceAllowance || 0)))}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-900 pt-3 border-t border-gray-200">
                <span>Total Gross Earnings</span>
                <span className="font-mono text-base">{formatCurrency(payroll.grossSalary)}</span>
              </div>
            </div>
          </div>

          {/* Deductions Column */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-800 border-b border-rose-100 pb-2 mb-3">
              Statutory Deductions
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Employee PF (12%)</span>
                <span className="font-mono text-red-600 font-medium">-{formatCurrency(payroll.epfEmployee || Math.min(1800, Math.round(payroll.basicSalary * 0.12)))}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Employee ESIC (0.75%)</span>
                <span className="font-mono text-red-600 font-medium">-{formatCurrency(payroll.esicEmployee || (payroll.grossSalary <= 21000 ? Math.ceil(payroll.grossSalary * 0.0075) : 0))}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Professional Tax (PT)</span>
                <span className="font-mono text-red-600 font-medium">-{formatCurrency(payroll.professionalTax || (payroll.grossSalary > 10000 ? 200 : 0))}</span>
              </div>
              {Boolean(payroll.tds) && (
                <div className="flex justify-between text-gray-700">
                  <span>TDS / Income Tax</span>
                  <span className="font-mono text-red-600 font-medium">-{formatCurrency(payroll.tds)}</span>
                </div>
              )}
              {Boolean(payroll.lateDeduction) && (
                <div className="flex justify-between text-gray-700">
                  <span>Late Marks / Attendance Deduction</span>
                  <span className="font-mono text-red-600 font-medium">-{formatCurrency(payroll.lateDeduction)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-rose-900 pt-3 border-t border-gray-200">
                <span>Total Deductions</span>
                <span className="font-mono text-base">-{formatCurrency(payroll.deductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Employer Statutory Contribution Bar */}
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 flex flex-col sm:flex-row justify-between gap-2">
          <span>
            Employer PF Share (12%): <strong className="text-slate-800">{formatCurrency(payroll.epfEmployer || Math.min(1800, Math.round(payroll.basicSalary * 0.12)))}</strong> (EPS 8.33% + EPF 3.67%)
          </span>
          <span>
            Employer ESIC Share (3.25%): <strong className="text-slate-800">{formatCurrency(payroll.esicEmployer || (payroll.grossSalary <= 21000 ? Math.ceil(payroll.grossSalary * 0.0325) : 0))}</strong>
          </span>
        </div>

        {/* Net Salary Payable */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white shadow-md">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Net Payable (Take Home)
            </span>
            <p className="text-2xl font-extrabold font-mono mt-0.5">
              {formatCurrency(payroll.netSalary)}
            </p>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            {payroll.status}
          </span>
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