import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, FileText } from "lucide-react";
import { getPayrolls } from "../services/payrollService";
import { useAuth } from "../context/AuthContext";

function MyPayroll() {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <Loader2 size={24} className="mx-auto animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No payroll records found.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll._id || payroll.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {payroll.month} {payroll.year}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MyPayroll;
