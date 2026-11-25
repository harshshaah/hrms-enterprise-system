import {
  CalendarCheck,
  CalendarDays,
  Clock3,
  FileText,
  Wallet,
  Award,
  User,
  Bell,
  RefreshCw,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getEmployeeDashboard,
} from "../services/dashboardService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [
    dashboardData,
    setDashboardData,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response =
  await getEmployeeDashboard();

console.log(
  "EMPLOYEE DASHBOARD RESPONSE:",
  response,
);

console.log(
  "EMPLOYEE DATA:",
  response?.data?.employee,
);

setDashboardData(
  response?.data || null,
);
    } catch (error) {
      console.error(
        "Employee Dashboard Error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to fetch dashboard data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const employee =
    dashboardData?.employee;

  const attendance =
    dashboardData?.attendance?.today;

  const leaves =
    dashboardData?.leaves;

  const firstName =
    employee?.firstName ||
    "Employee";

  const fullName =
    `${employee?.firstName || ""} ${
      employee?.lastName || ""
    }`.trim() ||
    "Employee";

  const getDepartmentName =
    (department) => {
      if (!department) {
        return "N/A";
      }

      if (typeof department === "string") {
        return department;
      }

      return (
        department.name ||
        "N/A"
      );
    };

  const formatStatus =
    (status) => {
      if (!status) {
        return "Not Marked";
      }

      return status
        .split("-")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() +
            word.slice(1),
        )
        .join(" ");
    };

  const formatTime =
    (date) => {
      if (!date) {
        return "--";
      }

      return new Date(
        date,
      ).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        },
      );
    };

  const getAttendanceStyle =
    (status) => {
      switch (status) {
        case "present":
          return "bg-emerald-50 text-emerald-600";

        case "absent":
          return "bg-red-50 text-red-600";

        case "half-day":
          return "bg-amber-50 text-amber-600";

        case "leave":
          return "bg-sky-50 text-sky-600";

        default:
          return "bg-slate-100 text-slate-500";
      }
    };

  const stats = [
    {
      title: "Today's Attendance",
      value: isLoading
        ? "..."
        : formatStatus(
            attendance?.status,
          ),
      icon: CalendarCheck,
    },
    {
      title: "Leave Balance",
      value: "N/A",
      icon: CalendarDays,
    },
    {
      title: "Pending Leaves",
      value: isLoading
        ? "..."
        : leaves?.pending || 0,
      icon: Clock3,
    },
    {
      title: "Latest Payroll",
      value: "N/A",
      icon: Wallet,
    },
  ];

  const leaveChartData = [
    { name: "Pending", count: leaves?.pending || 0, fill: "#f59e0b" },
    { name: "Approved", count: leaves?.approved || 0, fill: "#10b981" },
    { name: "Rejected", count: leaves?.rejected || 0, fill: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {firstName} 👋
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's an overview of your work information.
          </p>

          {!isLoading &&
            employee && (
              <p className="mt-2 text-xs text-slate-400">
                {employee.designation} •{" "}
                {getDepartmentName(
                  employee.department,
                )}
              </p>
            )}
        </div>

        <button
          type="button"
          onClick={fetchDashboard}
          disabled={isLoading}
          className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              isLoading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                  <Icon
                    size={21}
                    className="text-slate-600"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Attendance */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Today's Attendance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your attendance information for today
              </p>
            </div>

            <CalendarCheck
              size={21}
              className="text-slate-400"
            />
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Status
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getAttendanceStyle(
                  attendance?.status,
                )}`}
              >
                {isLoading
                  ? "Loading..."
                  : formatStatus(
                      attendance?.status,
                    )}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Check In
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {isLoading
                  ? "..."
                  : formatTime(
                      attendance?.checkIn,
                    )}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Check Out
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {isLoading
                  ? "..."
                  : formatTime(
                      attendance?.checkOut,
                    )}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Working Hours
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {isLoading
                  ? "..."
                  : attendance?.workingHours ??
                    0}
              </span>
            </div>
          </div>
        </div>

        {/* Leave Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Leave Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your leave request status
              </p>
            </div>

            <CalendarDays
              size={21}
              className="text-slate-400"
            />
          </div>

          <div className="h-[250px] w-full mt-6">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            ) : (leaves?.total || 0) === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">No leave data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-600">Total Leaves:</span>
            <span className="text-sm font-semibold text-slate-900">{leaves?.total || 0}</span>
          </div>
        </div>
      </div>

      {/* Employee Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            My Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your basic employment information
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Full Name"
            value={
              isLoading
                ? "..."
                : fullName
            }
          />

          <InfoItem
            label="Email"
            value={
              isLoading
                ? "..."
                : employee?.email || "-"
            }
          />

          <InfoItem
            label="Designation"
            value={
              isLoading
                ? "..."
                : employee?.designation ||
                  "-"
            }
          />

          <InfoItem
            label="Department"
            value={
              isLoading
                ? "..."
                : getDepartmentName(
                    employee?.department,
                  )
            }
          />
        </div>
      </div>

      {/* Quick Access */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Quick Access
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Quickly access your HR information
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAccessCard
            icon={User}
            title="My Profile"
            description="View your profile"
            onClick={() =>
              navigate("/profile")
            }
          />

          <QuickAccessCard
            icon={FileText}
            title="My Documents"
            description="View your documents"
            onClick={() =>
              navigate("/my-documents")
            }
          />

          <QuickAccessCard
            icon={Award}
            title="Performance"
            description="View your performance"
            onClick={() =>
              navigate("/my-performance")
            }
          />

          <QuickAccessCard
            icon={Bell}
            title="Notifications"
            description="View notifications"
            onClick={() =>
              navigate("/notifications")
            }
          />
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function QuickAccessCard({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
        <Icon
          size={19}
          className="text-slate-600"
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </button>
  );
}

export default EmployeeDashboard;