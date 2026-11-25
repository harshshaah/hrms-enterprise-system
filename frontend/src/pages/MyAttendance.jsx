import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getAttendance } from "../services/attendanceService";
import { useAuth } from "../context/AuthContext";
import ClockWidget from "../components/ClockWidget";

function MyAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.employee) {
        throw new Error("Employee profile not found for this user.");
      }

      const response = await getAttendance({ employee: user.employee });
      setAttendance(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch personal attendance:", err);
      setError(err?.message || "Failed to load your attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [user]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "present":
        return "bg-green-50 text-green-700 border-green-200";
      case "absent":
        return "bg-red-50 text-red-700 border-red-200";
      case "half-day":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "leave":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "-";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Live Clock & Shift Status Widget */}
      <ClockWidget onAttendanceChange={fetchMyAttendance} />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Attendance Log</h2>
          <p className="mt-1 text-sm text-gray-500">
            View your daily check-in, check-out and punctuality history.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMyAttendance}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Shift</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Check In</th>
                <th className="px-6 py-4 font-semibold">Check Out</th>
                <th className="px-6 py-4 font-semibold">Working Hrs</th>
                <th className="px-6 py-4 font-semibold">Punctuality</th>
                <th className="px-6 py-4 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center">
                    <Loader2 size={24} className="mx-auto animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id || record.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-700">
                      {record.shift?.name || "General"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(
                          record.status
                        )}`}
                      >
                        {getStatusLabel(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatTime(record.checkIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatTime(record.checkOut)}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">
                      {record.workingHours ? `${record.workingHours} hrs` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.isLate ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                          <AlertTriangle size={12} /> Late ({record.lateMinutes}m)
                        </span>
                      ) : record.checkIn ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> On Time
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-gray-500">
                      {record.remarks || "-"}
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

export default MyAttendance;
