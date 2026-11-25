import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, Star } from "lucide-react";
import { getPerformances } from "../services/performanceService";
import { useAuth } from "../context/AuthContext";

function MyPerformance() {
  const { user } = useAuth();
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyPerformance = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.employee) {
        throw new Error("Employee profile not found.");
      }

      const response = await getPerformances();
      const allPerformances = response?.data || [];
      
      const myPerformances = allPerformances.filter(
        (p) => p.employee?._id === user.employee || p.employee === user.employee
      );

      setPerformances(myPerformances);
    } catch (err) {
      console.error("Failed to fetch personal performance:", err);
      setError(err?.message || "Failed to load your performance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPerformance();
  }, [user]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Performance</h1>
          <p className="mt-1 text-sm text-gray-500">
            View your performance reviews and ratings.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMyPerformance}
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
                <th className="px-6 py-4 font-semibold">Review Period</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">Goals Completed</th>
                <th className="px-6 py-4 font-semibold">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <Loader2 size={24} className="mx-auto animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : performances.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No performance records found.
                  </td>
                </tr>
              ) : (
                performances.map((perf) => (
                  <tr key={perf._id || perf.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {formatDate(perf.reviewDate || perf.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(perf.rating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                      {perf.goalsCompleted || 0} / {perf.totalGoals || 0}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {perf.feedback || "-"}
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

export default MyPerformance;
