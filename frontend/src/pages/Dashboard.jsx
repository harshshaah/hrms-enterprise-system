import {
  Users,
  UserCheck,
  CalendarOff,
  Building2,
  Clock3,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import StatCard from "../components/Statcard";
import { getDashboard } from "../services/dashboardService";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response =
        await getDashboard();

      setDashboardData(
        response.data || null,
      );
    } catch (error) {
      console.error(
        "Dashboard Error:",
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

  const totalEmployees =
    dashboardData?.employees?.total || 0;

  const activeEmployees =
    dashboardData?.employees?.active || 0;

  const inactiveEmployees =
    dashboardData?.employees?.inactive || 0;

  const departmentCount =
    dashboardData?.departments?.active || 0;

  const presentEmployees =
    dashboardData?.attendance?.present || 0;

  const absentEmployees =
    dashboardData?.attendance?.absent || 0;

  const halfDayEmployees =
    dashboardData?.attendance?.halfDay || 0;

  const leaveEmployees =
    dashboardData?.attendance?.leave || 0;

  const attendanceTotal =
    dashboardData?.attendance?.total || 0;

  const totalLeaves =
    dashboardData?.leaves?.total || 0;

  const pendingLeaves =
    dashboardData?.leaves?.pending || 0;

  const approvedLeaves =
    dashboardData?.leaves?.approved || 0;

  const rejectedLeaves =
    dashboardData?.leaves?.rejected || 0;

  const cancelledLeaves =
    dashboardData?.leaves?.cancelled || 0;

  const presentPercentage =
    attendanceTotal > 0
      ? (
          (presentEmployees /
            attendanceTotal) *
          100
        ).toFixed(1)
      : "0.0";

  const absentPercentage =
    attendanceTotal > 0
      ? (
          (absentEmployees /
            attendanceTotal) *
          100
        ).toFixed(1)
      : "0.0";

  const halfDayPercentage =
    attendanceTotal > 0
      ? (
          (halfDayEmployees /
            attendanceTotal) *
          100
        ).toFixed(1)
      : "0.0";

  const leavePercentage =
    attendanceTotal > 0
      ? (
          (leaveEmployees /
            attendanceTotal) *
          100
        ).toFixed(1)
      : "0.0";

  const recentEmployees =
    dashboardData?.recentEmployees || [];

  const formatDepartment = (
    department,
  ) => {
    if (!department) {
      return "N/A";
    }

    const departmentName =
      typeof department === "string"
        ? department
        : department.name;

    if (!departmentName) {
      return "N/A";
    }

    return departmentName
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase(),
      )
      .join(" ");
  };

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const getEmployeeInitials = (
    firstName,
    lastName,
  ) => {
    const firstInitial =
      firstName?.charAt(0) || "";

    const lastInitial =
      lastName?.charAt(0) || "";

    return (
      `${firstInitial}${lastInitial}`.toUpperCase() ||
      "NA"
    );
  };

  const stats = [
    {
      title: "Total Employees",
      value: isLoading
        ? "..."
        : totalEmployees,
      change: "",
      icon: Users,
    },
    {
      title: "Active Employees",
      value: isLoading
        ? "..."
        : activeEmployees,
      change: "",
      icon: UserCheck,
    },
    {
      title: "Inactive Employees",
      value: isLoading
        ? "..."
        : inactiveEmployees,
      change: "",
      icon: CalendarOff,
    },
    {
      title: "Departments",
      value: isLoading
        ? "..."
        : departmentCount,
      change: "",
      icon: Building2,
    },
  ];

  const attendanceChartData = [
    { name: "Present", value: presentEmployees, color: "#10b981" },
    { name: "Absent", value: absentEmployees, color: "#ef4444" },
    { name: "Half Day", value: halfDayEmployees, color: "#f59e0b" },
    { name: "Leave", value: leaveEmployees, color: "#0ea5e9" },
  ];

  const leaveChartData = [
    { name: "Pending", count: pendingLeaves, fill: "#f59e0b" },
    { name: "Approved", count: approvedLeaves, fill: "#10b981" },
    { name: "Rejected", count: rejectedLeaves, fill: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, Admin 👋
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your organization today.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Attendance + Leave */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Attendance Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Today's employee attendance
              </p>
            </div>
            <Clock3 size={20} className="text-slate-400" />
          </div>

          <div className="h-[250px] w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            ) : attendanceTotal === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            {attendanceChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-sm font-medium text-slate-700">{item.name}:</span>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Requests */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Leave Requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current leave status
              </p>
            </div>
            <CalendarOff size={20} className="text-slate-400" />
          </div>

          <div className="h-[250px] w-full">
             {isLoading ? (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            ) : totalLeaves === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">No data available</div>
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
            <span className="text-sm font-semibold text-slate-900">{totalLeaves}</span>
          </div>
        </div>
      </div>

      {/* Recent Employees */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Employees
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recently added employees
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/employees/add")
            }
            className="flex w-fit items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <UserPlus size={16} />
            Add Employee
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Employee
                </th>

                <th className="px-6 py-4 font-semibold">
                  Department
                </th>

                <th className="px-6 py-4 font-semibold">
                  Designation
                </th>

                <th className="px-6 py-4 font-semibold">
                  Joining Date
                </th>

                <th className="px-6 py-4 font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700"></div>

                      <p className="mt-3 text-sm text-slate-500">
                        Loading employees...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : recentEmployees.length > 0 ? (
                recentEmployees.map(
                  (employee) => {
                    const fullName =
                      `${employee.firstName || ""} ${
                        employee.lastName || ""
                      }`.trim();

                    const initials =
                      getEmployeeInitials(
                        employee.firstName,
                        employee.lastName,
                      );

                    return (
                      <tr
                        key={employee._id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Employee */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                              {initials}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {fullName ||
                                  "Unknown Employee"}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {employee.email ||
                                  "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {formatDepartment(
                              employee.department,
                            )}
                          </span>
                        </td>

                        {/* Designation */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {employee.designation ||
                              "-"}
                          </span>
                        </td>

                        {/* Joining Date */}
                        <td className="px-6 py-4">
                          <span className="whitespace-nowrap text-sm text-slate-600">
                            {formatDate(
                              employee.joiningDate,
                            )}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                              employee.status ===
                              "active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                employee.status ===
                                "active"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            ></span>

                            {formatStatus(
                              employee.status,
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  },
                )
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Users
                          size={22}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="mt-3 text-sm font-medium text-slate-700">
                        No employees found
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Add an employee to see them here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isLoading &&
          recentEmployees.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <p className="text-xs text-slate-500">
                Showing {recentEmployees.length}{" "}
                recent employee
                {recentEmployees.length !== 1
                  ? "s"
                  : ""}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/employees")
                }
                className="text-xs font-medium text-slate-700 transition hover:text-slate-900"
              >
                View all employees →
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export default Dashboard;