import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
} from "../services/shiftService";

export default function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    startTime: "09:30",
    endTime: "18:30",
    gracePeriodMinutes: 15,
    halfDayHours: 4.5,
    fullDayHours: 8.5,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    isDefault: false,
    description: "",
  });

  const fetchAllShifts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getShifts();
      setShifts(res?.data || []);
    } catch (err) {
      console.error("Failed to load shifts:", err);
      setError(err?.message || "Failed to load shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllShifts();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      code: "",
      startTime: "09:30",
      endTime: "18:30",
      gracePeriodMinutes: 15,
      halfDayHours: 4.5,
      fullDayHours: 8.5,
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      isDefault: shifts.length === 0,
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shift) => {
    setEditingId(shift._id);
    setFormData({
      name: shift.name,
      code: shift.code,
      startTime: shift.startTime,
      endTime: shift.endTime,
      gracePeriodMinutes: shift.gracePeriodMinutes ?? 15,
      halfDayHours: shift.halfDayHours ?? 4.5,
      fullDayHours: shift.fullDayHours ?? 8.5,
      workingDays: shift.workingDays || ["monday", "tuesday", "wednesday", "thursday", "friday"],
      isDefault: Boolean(shift.isDefault),
      description: shift.description || "",
    });
    setIsModalOpen(true);
  };

  const handleWorkingDayToggle = (day) => {
    setFormData((prev) => {
      const exists = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: exists
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      if (editingId) {
        await updateShift(editingId, formData);
        setSuccess("Shift updated successfully!");
      } else {
        await createShift(formData);
        setSuccess("Shift created successfully!");
      }

      setIsModalOpen(false);
      await fetchAllShifts();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setError(err?.message || "Failed to save shift");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;
    try {
      await deleteShift(id);
      setSuccess("Shift deleted successfully!");
      await fetchAllShifts();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err?.message || "Failed to delete shift");
    }
  };

  const createDefaultShiftIfEmpty = async () => {
    try {
      setSubmitting(true);
      await createShift({
        name: "General Shift",
        code: "GEN",
        startTime: "09:30",
        endTime: "18:30",
        gracePeriodMinutes: 15,
        halfDayHours: 4.5,
        fullDayHours: 8.5,
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        isDefault: true,
        description: "Default standard 9:30 AM to 6:30 PM working shift",
      });
      await fetchAllShifts();
      setSuccess("Default General Shift created!");
    } catch (err) {
      setError(err?.message || "Failed to create default shift");
    } finally {
      setSubmitting(false);
    }
  };

  const DAYS = [
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
    { key: "saturday", label: "Sat" },
    { key: "sunday", label: "Sun" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-blue-600" size={26} />
            Shift Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Define working hours, grace periods, and late mark thresholds for your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Create New Shift
        </button>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Shifts Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      ) : shifts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Clock size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No shifts created yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Get started by initializing a standard 09:30 AM - 06:30 PM shift with 15-minute grace period.
          </p>
          <button
            type="button"
            onClick={createDefaultShiftIfEmpty}
            disabled={submitting}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
          >
            <Sparkles size={16} />
            Initialize Default Shift
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shifts.map((shift) => (
            <div
              key={shift._id}
              className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-lg">{shift.name}</h3>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono font-bold text-gray-700">
                        {shift.code}
                      </span>
                    </div>
                    {shift.isDefault && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} /> Default Shift
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(shift)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(shift._id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Timing Badge */}
                <div className="mt-4 rounded-xl bg-blue-50/70 border border-blue-100 p-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-700 font-semibold">Hours:</span>
                    <span className="font-mono font-bold text-blue-900 text-sm">
                      {shift.startTime} &rarr; {shift.endTime}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-[11px] text-blue-800">
                    <span>Grace Period:</span>
                    <strong>{shift.gracePeriodMinutes || 15} mins buffer</strong>
                  </div>
                </div>

                {/* Rules */}
                <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Full-Day Requirement:</span>
                    <strong className="text-gray-900">{shift.fullDayHours || 8.5} hrs</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Half-Day Requirement:</span>
                    <strong className="text-gray-900">{shift.halfDayHours || 4.5} hrs</strong>
                  </div>
                </div>

                {/* Working Days */}
                <div className="mt-4">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Working Days
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {DAYS.map((day) => {
                      const active = (shift.workingDays || []).includes(day.key);
                      return (
                        <span
                          key={day.key}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            active
                              ? "bg-slate-900 text-white"
                              : "bg-gray-100 text-gray-400 line-through"
                          }`}
                        >
                          {day.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {shift.description && (
                <p className="mt-4 text-xs text-gray-500 italic border-t border-gray-100 pt-3">
                  "{shift.description}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? "Edit Shift" : "Create New Shift"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Shift Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. General Shift"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="GEN"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Start Time (24h) *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    End Time (24h) *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Grace (Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.gracePeriodMinutes}
                    onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Half-Day (Hrs)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.halfDayHours}
                    onChange={(e) => setFormData({ ...formData, halfDayHours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Full-Day (Hrs)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.fullDayHours}
                    onChange={(e) => setFormData({ ...formData, fullDayHours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Working Days Checkbox list */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Working Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => {
                    const isChecked = formData.workingDays.includes(day.key);
                    return (
                      <button
                        type="button"
                        key={day.key}
                        onClick={() => handleWorkingDayToggle(day.key)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                          isChecked
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-xs font-semibold text-gray-800">
                  Set as Default Shift for this organization
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {submitting ? "Saving..." : editingId ? "Update Shift" : "Create Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

