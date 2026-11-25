import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Plus,
  Save,
  Star,
  X,
} from "lucide-react";

import {
  getEmployeesForPerformance,
  getPerformanceById,
  updatePerformance,
} from "../services/performanceService";

const EditPerformance = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employees, setEmployees] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [goalInput, setGoalInput] =
    useState("");

  const [achievementInput, setAchievementInput] =
    useState("");

  const [formData, setFormData] = useState({
    employee: "",
    reviewYear: "",
    reviewPeriod: "",
    rating: 0,
    goals: [],
    achievements: [],
    strengths: "",
    weaknesses: "",
    managerFeedback: "",
    status: "pending",
    reviewDate: "",
    remarks: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          performance,
          employeeList,
        ] = await Promise.all([
          getPerformanceById(id),
          getEmployeesForPerformance(),
        ]);

        const record =
          performance?.data ||
          performance;

        setEmployees(
          Array.isArray(
            employeeList,
          )
            ? employeeList
            : [],
        );

        setFormData({
          employee:
            typeof record.employee ===
            "object"
              ? record.employee?._id ||
                ""
              : record.employee ||
                "",
          reviewYear:
            record.reviewYear ||
            "",
          reviewPeriod:
            record.reviewPeriod ||
            "",
          rating:
            Number(
              record.rating || 0,
            ),
          goals:
            Array.isArray(
              record.goals,
            )
              ? record.goals
              : [],
          achievements:
            Array.isArray(
              record.achievements,
            )
              ? record.achievements
              : [],
          strengths:
            record.strengths || "",
          weaknesses:
            record.weaknesses || "",
          managerFeedback:
            record.managerFeedback ||
            "",
          status:
            record.status ||
            "pending",
          reviewDate: record.reviewDate
            ? new Date(
                record.reviewDate,
              )
                .toISOString()
                .split("T")[0]
            : "",
          remarks:
            record.remarks || "",
        });
      } catch (error) {
        setError(
          error?.message ||
            "Failed to load performance",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]:
          name === "reviewYear"
            ? Number(value)
            : value,
      }),
    );
  };

  const addGoal = () => {
    const value =
      goalInput.trim();

    if (!value) {
      return;
    }

    setFormData(
      (current) => ({
        ...current,
        goals: [
          ...current.goals,
          value,
        ],
      }),
    );

    setGoalInput("");
  };

  const removeGoal = (
    index,
  ) => {
    setFormData(
      (current) => ({
        ...current,
        goals:
          current.goals.filter(
            (_, goalIndex) =>
              goalIndex !== index,
          ),
      }),
    );
  };

  const addAchievement = () => {
    const value =
      achievementInput.trim();

    if (!value) {
      return;
    }

    setFormData(
      (current) => ({
        ...current,
        achievements: [
          ...current.achievements,
          value,
        ],
      }),
    );

    setAchievementInput("");
  };

  const removeAchievement = (
    index,
  ) => {
    setFormData(
      (current) => ({
        ...current,
        achievements:
          current.achievements.filter(
            (
              _,
              achievementIndex,
            ) =>
              achievementIndex !==
              index,
          ),
      }),
    );
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setError("");

    if (!formData.employee) {
      setError(
        "Please select an employee.",
      );
      return;
    }

    if (!formData.reviewPeriod) {
      setError(
        "Please select a review period.",
      );
      return;
    }

    if (!formData.rating) {
      setError(
        "Please select a rating.",
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        reviewYear: Number(
          formData.reviewYear,
        ),
        rating: Number(
          formData.rating,
        ),
        reviewDate:
          formData.reviewDate ||
          undefined,
      };

      await updatePerformance(
        id,
        payload,
      );

      navigate(
        `/performance/${id}`,
      );
    } catch (error) {
      setError(
        error?.message ||
          "Failed to update performance",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

  const labelClass =
    "text-sm font-medium text-gray-700";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-500">
        Loading performance...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/performance/${id}`,
            )
          }
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Performance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update employee performance
            review.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Review Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Review Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Employee */}
            <div>
              <label
                className={labelClass}
              >
                Employee
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <select
                name="employee"
                value={
                  formData.employee
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Select employee
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={
                        employee._id
                      }
                      value={
                        employee._id
                      }
                    >
                      {employee.firstName}{" "}
                      {employee.lastName}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Review Year */}
            <div>
              <label
                className={labelClass}
              >
                Review Year
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="number"
                name="reviewYear"
                min="2000"
                value={
                  formData.reviewYear
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            {/* Review Period */}
            <div>
              <label
                className={labelClass}
              >
                Review Period
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <select
                name="reviewPeriod"
                value={
                  formData.reviewPeriod
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Select review period
                </option>

                <option value="Q1">
                  Q1
                </option>

                <option value="Q2">
                  Q2
                </option>

                <option value="Q3">
                  Q3
                </option>

                <option value="Q4">
                  Q4
                </option>

                <option value="Annual">
                  Annual
                </option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                className={labelClass}
              >
                Status
              </label>

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              >
                <option value="pending">
                  Pending
                </option>

                <option value="in-progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            {/* Review Date */}
            <div>
              <label
                className={labelClass}
              >
                Review Date
              </label>

              <input
                type="date"
                name="reviewDate"
                value={
                  formData.reviewDate
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Rating
          </h2>

          <div className="mt-5 flex gap-3">
            {[1, 2, 3, 4, 5].map(
              (rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    setFormData(
                      (current) => ({
                        ...current,
                        rating,
                      }),
                    )
                  }
                  className={`flex h-12 w-12 items-center justify-center rounded-lg border transition ${
                    formData.rating >=
                    rating
                      ? "border-yellow-400 bg-yellow-50 text-yellow-500"
                      : "border-gray-300 text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <Star
                    size={22}
                    fill={
                      formData.rating >=
                      rating
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              ),
            )}
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Selected rating:{" "}
            <span className="font-semibold text-gray-900">
              {formData.rating} / 5
            </span>
          </p>
        </div>

        {/* Goals & Achievements */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Goals */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Goals
            </h2>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={goalInput}
                onChange={(event) =>
                  setGoalInput(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event.preventDefault();
                    addGoal();
                  }
                }}
                placeholder="Enter goal"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />

              <button
                type="button"
                onClick={addGoal}
                className="shrink-0 rounded-lg bg-slate-900 px-4 text-white hover:bg-slate-800"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {formData.goals.map(
                (goal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  >
                    <span>
                      {goal}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeGoal(
                          index,
                        )
                      }
                      className="ml-3 text-gray-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Achievements
            </h2>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={
                  achievementInput
                }
                onChange={(event) =>
                  setAchievementInput(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event.preventDefault();
                    addAchievement();
                  }
                }}
                placeholder="Enter achievement"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />

              <button
                type="button"
                onClick={
                  addAchievement
                }
                className="shrink-0 rounded-lg bg-slate-900 px-4 text-white hover:bg-slate-800"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {formData.achievements.map(
                (
                  achievement,
                  index,
                ) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  >
                    <span>
                      {achievement}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeAchievement(
                          index,
                        )
                      }
                      className="ml-3 text-gray-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Feedback
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label
                className={labelClass}
              >
                Strengths
              </label>

              <textarea
                name="strengths"
                rows="4"
                value={
                  formData.strengths
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            <div>
              <label
                className={labelClass}
              >
                Weaknesses
              </label>

              <textarea
                name="weaknesses"
                rows="4"
                value={
                  formData.weaknesses
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            <div>
              <label
                className={labelClass}
              >
                Manager Feedback
              </label>

              <textarea
                name="managerFeedback"
                rows="4"
                value={
                  formData.managerFeedback
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            <div>
              <label
                className={labelClass}
              >
                Remarks
              </label>

              <textarea
                name="remarks"
                rows="4"
                value={
                  formData.remarks
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/performance/${id}`,
              )
            }
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />

            {saving
              ? "Updating..."
              : "Update Performance"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPerformance;