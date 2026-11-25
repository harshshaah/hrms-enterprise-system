import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, Plus, X, Save, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { getLeavesByEmployee, createLeave, cancelLeave, getMyLeaveBalance } from "../services/leaveService";
import { useAuth } from "../context/AuthContext";

function MyLeave() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  
  const [formData, setFormData] = useState({
    leaveType: "casual",
    startDate: "",
    endDate: "",
    reason: "",
    remarks: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.employee) {
        throw new Error("Employee profile not found.");
      }

      const [leavesRes, balanceRes] = await Promise.all([
        getLeavesByEmployee(user.employee),
        getMyLeaveBalance(),
      ]);
      setLeaves(leavesRes?.data || []);
      setBalance(balanceRes?.data || null);
    } catch (err) {
      console.error("Failed to fetch personal leaves:", err);
      setError(err?.message || "Failed to load your leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, [user]);

  const handleCancelLeave = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) return;
    
    try {
      await cancelLeave(id);
      fetchMyLeaves();
    } catch (err) {
      alert(err.message || "Failed to cancel leave");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setFormError("End date cannot be before start date.");
      return;
    }

    try {
      setSubmitting(true);
      await createLeave({
        employee: user.employee,
        leaveType: formData.leaveType,
        startDate: new Date(`${formData.startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${formData.endDate}T00:00:00`).toISOString(),
        reason: formData.reason.trim(),
        remarks: formData.remarks.trim(),
      });
      setShowApplyModal(false);
      setFormData({ leaveType: "casual", startDate: "", endDate: "", reason: "", remarks: "" });
      fetchMyLeaves();
    } catch (err) {
      setFormError(err.message || "Failed to apply for leave");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">Approved</span>;
      case "rejected":
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">Rejected</span>;
      case "cancelled":
        return <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700 border border-gray-200">Cancelled</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700 border border-yellow-200">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leaves</h1>
          <p className="mt-1 text-sm text-gray-500">
            View your leave history and apply for new leaves.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMyLeaves}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          
          <button
            type="button"
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={16} />
            Apply Leave
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Zimyo Leave Balance Quota Cards */}
      {balance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Casual Leave */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-blue-900">
              <span>Casual Leave (CL)</span>
              <span className="rounded bg-blue-200 px-1.5 py-0.5 text-[10px] text-blue-800">
                {balance.casual.remaining} Left
              </span>
            </div>
            <div className="flex justify-between text-xs text-blue-700">
              <span>Used: {balance.casual.used}</span>
              <span>Total: {balance.casual.total}</span>
            </div>
            <div className="h-1.5 w-full bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${Math.min(100, (balance.casual.used / balance.casual.total) * 100)}%` }}
              />
            </div>
          </div>

          {/* Sick Leave */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
              <span>Sick Leave (SL)</span>
              <span className="rounded bg-emerald-200 px-1.5 py-0.5 text-[10px] text-emerald-800">
                {balance.sick.remaining} Left
              </span>
            </div>
            <div className="flex justify-between text-xs text-emerald-700">
              <span>Used: {balance.sick.used}</span>
              <span>Total: {balance.sick.total}</span>
            </div>
            <div className="h-1.5 w-full bg-emerald-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${Math.min(100, (balance.sick.used / balance.sick.total) * 100)}%` }}
              />
            </div>
          </div>

          {/* Earned Leave */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-purple-900">
              <span>Earned Leave (EL/PL)</span>
              <span className="rounded bg-purple-200 px-1.5 py-0.5 text-[10px] text-purple-800">
                {balance.earned.remaining} Left
              </span>
            </div>
            <div className="flex justify-between text-xs text-purple-700">
              <span>Used: {balance.earned.used}</span>
              <span>Total: {balance.earned.total}</span>
            </div>
            <div className="h-1.5 w-full bg-purple-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full"
                style={{ width: `${Math.min(100, (balance.earned.used / balance.earned.total) * 100)}%` }}
              />
            </div>
          </div>

          {/* Unpaid LWP */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-amber-900">
              <span>Leave Without Pay (LWP)</span>
              <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] text-amber-800">
                {balance.unpaid.used} Days
              </span>
            </div>
            <div className="flex justify-between text-xs text-amber-700">
              <span>Taken this year:</span>
              <span className="font-bold">{balance.unpaid.used} days</span>
            </div>
            <div className="h-1.5 w-full bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full"
                style={{ width: `${Math.min(100, balance.unpaid.used * 10)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <Loader2 size={24} className="mx-auto animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id || leave.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium capitalize">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                      <br/>
                      <span className="text-xs text-gray-400">{leave.totalDays} days</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {leave.status === "pending" && (
                        <button
                          onClick={() => handleCancelLeave(leave._id || leave.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Apply for Leave</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {formError}
                </div>
              )}
              
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Leave Type *</label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="casual">Casual Leave (CL) - Available: {balance?.casual?.remaining ?? 12}</option>
                  <option value="sick">Sick Leave (SL) - Available: {balance?.sick?.remaining ?? 10}</option>
                  <option value="earned">Earned / Privilege Leave (EL/PL) - Available: {balance?.earned?.remaining ?? 15}</option>
                  <option value="maternity">Maternity Leave (26 Weeks)</option>
                  <option value="paternity">Paternity Leave (15 Days)</option>
                  <option value="unpaid">Leave Without Pay (LWP)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Reason *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Why are you taking this leave?"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLeave;
