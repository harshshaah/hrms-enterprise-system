import React, { useState, useEffect } from "react";
import {
  Clock,
  LogIn,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Timer,
  Loader2,
} from "lucide-react";
import {
  clockIn,
  clockOut,
  getTodayAttendance,
  getLateSummary,
} from "../services/attendanceService";

export default function ClockWidget({ onAttendanceChange }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayData, setTodayData] = useState(null);
  const [lateSummary, setLateSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  // Real-time clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today status
  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      setError("");
      const [todayRes, lateRes] = await Promise.all([
        getTodayAttendance(),
        getLateSummary(),
      ]);
      setTodayData(todayRes?.data || null);
      setLateSummary(lateRes?.data || null);
    } catch (err) {
      console.error("Failed to fetch today attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  // Elapsed time counter
  useEffect(() => {
    if (todayData?.attendance?.checkIn && !todayData?.attendance?.checkOut) {
      const checkInTime = new Date(todayData.attendance.checkIn).getTime();
      const updateTimer = () => {
        const diffMs = Math.max(0, Date.now() - checkInTime);
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setElapsedTime(
          `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        );
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else if (todayData?.attendance?.workingHours) {
      const hrs = Math.floor(todayData.attendance.workingHours);
      const mins = Math.round((todayData.attendance.workingHours - hrs) * 60);
      setElapsedTime(`${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`);
    }
  }, [todayData]);

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      await clockIn();
      await fetchTodayStatus();
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      setError(err?.message || "Failed to clock in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      await clockOut();
      await fetchTodayStatus();
      if (onAttendanceChange) onAttendanceChange();
    } catch (err) {
      setError(err?.message || "Failed to clock out");
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimeString = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const attendance = todayData?.attendance;
  const shift = todayData?.shift;
  const isClockedIn = Boolean(attendance?.checkIn && !attendance?.checkOut);
  const isShiftComplete = Boolean(attendance?.checkIn && attendance?.checkOut);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-bold ml-2">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live Clock & Shift Info */}
        <div className="space-y-3 lg:border-r lg:border-slate-100 lg:pr-6">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Calendar size={14} className="text-blue-600" />
            {currentTime.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>

          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {currentTime.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </div>

          {shift ? (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>{shift.name} ({shift.code})</span>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                  {shift.startTime} - {shift.endTime}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Grace Buffer: <strong className="text-slate-700">{shift.gracePeriodMinutes || 15} mins</strong> &bull; Half-Day: {shift.halfDayHours || 4.5}h
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Standard Shift (09:30 AM - 06:30 PM)
            </div>
          )}
        </div>

        {/* Punch State & Action Button */}
        <div className="flex flex-col justify-center items-center text-center space-y-4 lg:border-r lg:border-slate-100 lg:pr-6">
          {loading ? (
            <Loader2 size={28} className="animate-spin text-slate-400" />
          ) : !attendance?.checkIn ? (
            <>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Not Clocked In Today
              </div>
              <button
                type="button"
                onClick={handleClockIn}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                Clock In Now
              </button>
            </>
          ) : isClockedIn ? (
            <>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Clocked In at {formatTimeString(attendance.checkIn)}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-2xl font-bold text-slate-900">
                <Timer size={20} className="text-slate-400" />
                {elapsedTime}
              </div>

              <button
                type="button"
                onClick={handleClockOut}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 transition disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogOut size={18} />
                )}
                Clock Out
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                <CheckCircle2 size={14} className="text-blue-600" />
                Shift Completed
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>In: <strong>{formatTimeString(attendance.checkIn)}</strong> | Out: <strong>{formatTimeString(attendance.checkOut)}</strong></p>
                <p className="font-semibold text-slate-900">Total: {attendance.workingHours} hrs</p>
              </div>
            </>
          )}
        </div>

        {/* Late Mark & Deduction Policy Card */}
        <div className="space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Attendance & Compliance
            </h4>

            {attendance?.checkIn && (
              <div className="mb-2">
                {attendance.isLate ? (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    <AlertTriangle size={13} className="text-amber-600" />
                    Late by {attendance.lateMinutes} minutes
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    On Time Check-in
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-700">
                <span>Month Late Marks:</span>
                <span className="font-bold text-slate-900">
                  {lateSummary?.totalLateMarks || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Estimated Deduction:</span>
                <span className="font-bold text-rose-600">
                  {lateSummary?.lateDeductionDays || 0} Day(s)
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            * Zimyo Rule: Every 3 late marks result in a 0.5-day leave deduction.
          </p>
        </div>
      </div>
    </div>
  );
}

