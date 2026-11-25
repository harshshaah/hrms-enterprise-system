import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, FileText, Printer, X, DollarSign, CheckCircle2 } from "lucide-react";
import { getPayrolls } from "../services/payrollService";
import { useAuth } from "../context/AuthContext";

function MyPayroll() {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const fetchMyPayroll = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.employee) {
        throw new Error("Employee profile not found.");
      }

      // getPayrolls returns paginated { data: [...], pagination: {...} }
      const response = await getPayrolls({ limit: 100 });
      const allPayrolls = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.payrolls)
        ? response.data.payrolls
        : [];
      
      const myPayrolls = allPayrolls.filter(
        (p) => p.employee?._id === user.employee || p.employee === user.employee
      );

      setPayrolls(myPayrolls);
    } catch (err) {
      console.error("Failed to fetch personal payroll:", err);
      setError(err?.message || "Failed to load your payroll records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPayroll();
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">Paid</span>;
      case "cancelled":
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700 border border-yellow-200">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payroll</h1>
          <p className="mt-1 text-sm text-gray-500">
            View your salary slips and payment history.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMyPayroll}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Month/Year</th>
                <th className="px-6 py-4 font-semibold">Basic Salary</th>
                <th className="px-6 py-4 font-semibold">Allowances</th>
                <th className="px-6 py-4 font-semibold">Deductions</th>
                <th className="px-6 py-4 font-semibold">Net Salary</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <Loader2 size={24} className="mx-auto animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No payroll records found.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll._id || payroll.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {payroll.month}/{payroll.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(payroll.basicSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600">
                      +{formatCurrency(payroll.allowances)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600">
                      -{formatCurrency(payroll.deductions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                      {formatCurrency(payroll.netSalary)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payroll.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedPayroll(payroll)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                      >
                        <FileText size={14} />
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Salary Slip - {selectedPayroll.month}/{selectedPayroll.year}
                </h3>
                <p className="text-xs text-gray-500">
                  {user?.firstName} {user?.lastName} &bull; Indian Statutory Format
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  title="Print Slip"
                >
                  <Printer size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayroll(null)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <h4 className="font-bold text-xs uppercase text-emerald-800 border-b border-emerald-100 pb-2 mb-3">
                    Earnings
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Basic Salary (50%)</span>
                      <strong className="font-mono">{formatCurrency(selectedPayroll.basicSalary)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">HRA</span>
                      <strong className="font-mono">{formatCurrency(selectedPayroll.hra || Math.round(selectedPayroll.basicSalary * 0.4))}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conveyance</span>
                      <strong className="font-mono">{formatCurrency(selectedPayroll.conveyanceAllowance || 1600)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Special Allowance</span>
                      <strong className="font-mono">{formatCurrency(selectedPayroll.specialAllowance || Math.max(0, selectedPayroll.allowances - (selectedPayroll.hra || 0) - (selectedPayroll.conveyanceAllowance || 0)))}</strong>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-emerald-900">
                      <span>Gross Salary</span>
                      <span className="font-mono">{formatCurrency(selectedPayroll.grossSalary)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <h4 className="font-bold text-xs uppercase text-rose-800 border-b border-rose-100 pb-2 mb-3">
                    Deductions
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EPF Employee (12%)</span>
                      <strong className="font-mono text-rose-600">-{formatCurrency(selectedPayroll.epfEmployee || Math.min(1800, Math.round(selectedPayroll.basicSalary * 0.12)))}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ESIC Employee (0.75%)</span>
                      <strong className="font-mono text-rose-600">-{formatCurrency(selectedPayroll.esicEmployee || (selectedPayroll.grossSalary <= 21000 ? Math.ceil(selectedPayroll.grossSalary * 0.0075) : 0))}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Professional Tax (PT)</span>
                      <strong className="font-mono text-rose-600">-{formatCurrency(selectedPayroll.professionalTax || (selectedPayroll.grossSalary > 10000 ? 200 : 0))}</strong>
                    </div>
                    {Boolean(selectedPayroll.lateDeduction) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Late Attendance Penalty</span>
                        <strong className="font-mono text-rose-600">-{formatCurrency(selectedPayroll.lateDeduction)}</strong>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t font-bold text-rose-900">
                      <span>Total Deductions</span>
                      <span className="font-mono">-{formatCurrency(selectedPayroll.deductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Take-Home */}
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-4 text-white">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-emerald-100">
                    Net Take-Home Salary
                  </span>
                  <p className="text-xl font-bold font-mono">
                    {formatCurrency(selectedPayroll.netSalary)}
                  </p>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase">
                  {selectedPayroll.status}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPayroll(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPayroll;
