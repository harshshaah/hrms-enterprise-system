import {
  useEffect,
  useState,
} from "react";

import {
  BarChart3,
  Users,
  Building2,
  CalendarCheck,
  CalendarDays,
  Wallet,
  Star,
  RefreshCw,
  FileText,
  Search,
  X,
  Download,
} from "lucide-react";

import { exportToExcel, exportToPDF } from "../utils/ReportGenerator";

import {
  getReportSummary,
  getEmployeeReport,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getPerformanceReport,
  getDepartmentReport,
} from "../services/reportService";

const reportTypes = [
  {
    key: "summary",
    label: "Summary",
    icon: BarChart3,
  },
  {
    key: "employees",
    label: "Employees",
    icon: Users,
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: CalendarCheck,
  },
  {
    key: "leaves",
    label: "Leaves",
    icon: CalendarDays,
  },
  {
    key: "payroll",
    label: "Payroll",
    icon: Wallet,
  },
  {
    key: "performance",
    label: "Performance",
    icon: Star,
  },
  {
    key: "departments",
    label: "Departments",
    icon: Building2,
  },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getEmployeeName = (employee) => {
  if (!employee) {
    return "-";
  }

  const name = [
    employee.firstName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return name || "-";
};

const getStatusClass = (status) => {
  switch (status) {
    case "active":
    case "approved":
    case "paid":
    case "completed":
    case "present":
      return "bg-emerald-100 text-emerald-700";

    case "pending":
    case "draft":
    case "submitted":
      return "bg-amber-100 text-amber-700";

    case "inactive":
    case "rejected":
    case "cancelled":
    case "absent":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

function Reports() {
  const [selectedReport, setSelectedReport] =
    useState("summary");

  const [summary, setSummary] =
    useState(null);

  const [reportData, setReportData] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [selectedYear, setSelectedYear] =
    useState(new Date().getFullYear());

  const [selectedMonth, setSelectedMonth] =
    useState("");

  const [search, setSearch] =
    useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      if (selectedReport === "summary") {
        const response =
          await getReportSummary();

        setSummary(response?.data || null);
        setReportData([]);
      }

      if (selectedReport === "employees") {
        const response =
          await getEmployeeReport();

        setReportData(response?.data || []);
      }

      if (selectedReport === "attendance") {
        const response =
          await getAttendanceReport(
            startDate,
            endDate,
          );

        setReportData(response?.data || []);
      }

      if (selectedReport === "leaves") {
        const response =
          await getLeaveReport(
            startDate,
            endDate,
          );

        setReportData(response?.data || []);
      }

      if (selectedReport === "payroll") {
        const response =
          await getPayrollReport(
            selectedYear,
            selectedMonth,
          );

        setReportData(response?.data || []);
      }

      if (selectedReport === "performance") {
        const response =
          await getPerformanceReport(
            selectedYear,
          );

        setReportData(response?.data || []);
      }

      if (selectedReport === "departments") {
        const response =
          await getDepartmentReport();

        setReportData(response?.data || []);
      }
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load report",
      );

      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedReport]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedMonth("");
    setSelectedYear(
      new Date().getFullYear(),
    );
    setSearch("");
  };

  const filteredData = reportData.filter(
    (item) => {
      if (!search.trim()) {
        return true;
      }

      const searchText =
        search.toLowerCase().trim();

      const employeeName =
        getEmployeeName(
          item.employee,
        ).toLowerCase();

      const department = String(
        item.department ||
          item.employee?.department ||
          "",
      ).toLowerCase();

      const email = String(
        item.email ||
          item.employee?.email ||
          "",
      ).toLowerCase();

      const designation = String(
        item.designation ||
          item.employee?.designation ||
          "",
      ).toLowerCase();

      return (
        employeeName.includes(searchText) ||
        department.includes(searchText) ||
        email.includes(searchText) ||
        designation.includes(searchText)
      );
    },
  );

  const getColumnsForReport = (type) => {
    switch (type) {
      case "employees":
        return [
          { header: "Name", formatter: (i) => `${i.firstName} ${i.lastName}` },
          { header: "Email", accessor: "email" },
          { header: "Department", accessor: "department" },
          { header: "Designation", accessor: "designation" },
          { header: "Status", accessor: "status" },
        ];
      case "attendance":
        return [
          { header: "Date", formatter: (i) => formatDate(i.date) },
          { header: "Employee", formatter: (i) => getEmployeeName(i.employee) },
          { header: "Status", accessor: "status" },
          { header: "Check In", accessor: "checkInTime" },
          { header: "Check Out", accessor: "checkOutTime" },
        ];
      case "leaves":
        return [
          { header: "Employee", formatter: (i) => getEmployeeName(i.employee) },
          { header: "Type", accessor: "leaveType" },
          { header: "Start Date", formatter: (i) => formatDate(i.startDate) },
          { header: "End Date", formatter: (i) => formatDate(i.endDate) },
          { header: "Status", accessor: "status" },
        ];
      case "payroll":
        return [
          { header: "Employee", formatter: (i) => getEmployeeName(i.employee) },
          { header: "Basic Salary", accessor: "basicSalary" },
          { header: "Allowances", accessor: "allowances" },
          { header: "Deductions", accessor: "deductions" },
          { header: "Net Salary", accessor: "netSalary" },
          { header: "Status", accessor: "status" },
        ];
      case "performance":
        return [
          { header: "Employee", formatter: (i) => getEmployeeName(i.employee) },
          { header: "Review Period", accessor: "reviewPeriod" },
          { header: "Rating", accessor: "rating" },
          { header: "Feedback", accessor: "feedback" },
        ];
      case "departments":
        return [
          { header: "Name", accessor: "name" },
          { header: "Manager", formatter: (i) => getEmployeeName(i.manager) },
          { header: "Status", accessor: "status" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <BarChart3 size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Reports
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Analyze employees, attendance,
              leaves, payroll and performance.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {selectedReport !== "summary" && reportData.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportToPDF(reportData, getColumnsForReport(selectedReport), `${selectedReport}_report`, `${selectedReport.toUpperCase()} REPORT`)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Download size={16} />
                PDF
              </button>
              <button
                type="button"
                onClick={() => exportToExcel(reportData, `${selectedReport}_report`)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Download size={16} />
                Excel
              </button>
            </div>
          )}
          
          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex min-w-max gap-1">
          {reportTypes.map((report) => {
            const Icon = report.icon;

            const isActive =
              selectedReport === report.key;

            return (
              <button
                key={report.key}
                type="button"
                onClick={() => {
                  setSelectedReport(
                    report.key,
                  );

                  setSearch("");
                  setError("");
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={17} />
                {report.label}
              </button>
            );
          })}
        </div>
      </div>

      {selectedReport !== "summary" &&
        selectedReport !== "employees" &&
        selectedReport !== "departments" && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Report Filters
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select filters and refresh the
                  report.
                </p>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                <X size={15} />
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(selectedReport === "attendance" ||
                selectedReport === "leaves") && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      End Date
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </>
              )}

              {(selectedReport === "payroll" ||
                selectedReport === "performance") && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Year
                  </label>

                  <select
                    value={selectedYear}
                    onChange={(event) =>
                      setSelectedYear(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  >
                    {Array.from(
                      { length: 7 },
                      (_, index) =>
                        new Date().getFullYear() -
                        index,
                    ).map((year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedReport === "payroll" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Month
                  </label>

                  <select
                    value={selectedMonth}
                    onChange={(event) =>
                      setSelectedMonth(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="">
                      All Months
                    </option>

                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, index) => (
                      <option
                        key={month}
                        value={index + 1}
                      >
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={fetchReport}
                  disabled={loading}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

      {selectedReport !== "summary" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search report..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <RefreshCw
              size={20}
              className="animate-spin"
            />
            Loading report...
          </div>
        </div>
      )}

      {!loading &&
        selectedReport === "summary" &&
        summary && (
          <SummaryReport
            summary={summary}
          />
        )}

      {!loading &&
        selectedReport === "employees" && (
          <EmployeeReport
            data={filteredData}
          />
        )}

      {!loading &&
        selectedReport === "attendance" && (
          <AttendanceReport
            data={filteredData}
          />
        )}

      {!loading &&
        selectedReport === "leaves" && (
          <LeaveReport
            data={filteredData}
          />
        )}

      {!loading &&
        selectedReport === "payroll" && (
          <PayrollReport
            data={filteredData}
          />
        )}

      {!loading &&
        selectedReport === "performance" && (
          <PerformanceReport
            data={filteredData}
          />
        )}

      {!loading &&
        selectedReport === "departments" && (
          <DepartmentReport
            data={filteredData}
          />
        )}
    </div>
  );
}

function SummaryReport({ summary }) {
  const cards = [
    {
      title: "Total Employees",
      value: summary.employees?.total || 0,
      subtitle: `${summary.employees?.active || 0} active`,
      icon: Users,
    },
    {
      title: "Departments",
      value: summary.departments?.total || 0,
      subtitle: "Active departments",
      icon: Building2,
    },
    {
      title: "Attendance",
      value: summary.attendance?.total || 0,
      subtitle: "Attendance records",
      icon: CalendarCheck,
    },
    {
      title: "Leave Requests",
      value: summary.leaves?.total || 0,
      subtitle: `${summary.leaves?.pending || 0} pending`,
      icon: CalendarDays,
    },
    {
      title: "Payroll",
      value: summary.payroll?.total || 0,
      subtitle: `${summary.payroll?.paid || 0} paid`,
      icon: Wallet,
    },
    {
      title: "Performance",
      value: summary.performance?.total || 0,
      subtitle: `Average ${Number(
        summary.performance?.averageRating || 0,
      ).toFixed(1)}/5`,
      icon: Star,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {card.subtitle}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">
            Leave Overview
          </h2>

          <div className="mt-5 space-y-4">
            <SummaryProgress
              label="Pending"
              value={summary.leaves?.pending || 0}
              total={summary.leaves?.total || 0}
            />

            <SummaryProgress
              label="Approved"
              value={summary.leaves?.approved || 0}
              total={summary.leaves?.total || 0}
            />

            <SummaryProgress
              label="Rejected"
              value={summary.leaves?.rejected || 0}
              total={summary.leaves?.total || 0}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">
            Payroll Overview
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <InfoBox
              label="Gross Salary"
              value={formatCurrency(
                summary.payroll?.totalGrossSalary,
              )}
            />

            <InfoBox
              label="Net Salary"
              value={formatCurrency(
                summary.payroll?.totalNetSalary,
              )}
            />

            <InfoBox
              label="Allowances"
              value={formatCurrency(
                summary.payroll?.totalAllowances,
              )}
            />

            <InfoBox
              label="Deductions"
              value={formatCurrency(
                summary.payroll?.totalDeductions,
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryProgress({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-slate-600">
          {label}
        </span>

        <span className="font-medium text-slate-900">
          {value} ({percentage}%)
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ReportTable({
  headers,
  children,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeeReport({ data }) {
  if (!data.length) {
    return (
      <EmptyReport message="No employee records found." />
    );
  }

  return (
    <ReportTable
      headers={[
        "Employee",
        "Department",
        "Designation",
        "Phone",
        "Salary",
        "Status",
      ]}
    >
      {data.map((employee) => (
        <tr
          key={employee._id}
          className="hover:bg-slate-50"
        >
          <td className="px-5 py-4">
            <div className="font-medium text-slate-900">
              {getEmployeeName(employee)}
            </div>

            <div className="text-xs text-slate-500">
              {employee.email || "-"}
            </div>
          </td>

          <td className="px-5 py-4 text-slate-600">
            {employee.department || "-"}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {employee.designation || "-"}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {employee.phone || "-"}
          </td>

          <td className="px-5 py-4 font-medium text-slate-900">
            {formatCurrency(employee.salary)}
          </td>

          <td className="px-5 py-4">
            <StatusBadge status={employee.status} />
          </td>
        </tr>
      ))}
    </ReportTable>
  );
}

function AttendanceReport({ data }) {
  if (!data.length) {
    return (
      <EmptyReport message="No attendance records found for the selected filters." />
    );
  }

  return (
    <ReportTable
      headers={[
        "Employee",
        "Department",
        "Date",
        "Check In",
        "Check Out",
        "Hours",
        "Status",
      ]}
    >
      {data.map((item) => (
        <tr
          key={item._id}
          className="hover:bg-slate-50"
        >
          <td className="px-5 py-4 font-medium text-slate-900">
            {getEmployeeName(item.employee)}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {item.employee?.department || "-"}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {formatDate(item.date)}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {item.checkIn
              ? new Date(
                  item.checkIn,
                ).toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )
              : "-"}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {item.checkOut
              ? new Date(
                  item.checkOut,
                ).toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )
              : "-"}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {item.workingHours || 0}
          </td>

          <td className="px-5 py-4">
            <StatusBadge status={item.status} />
          </td>
        </tr>
      ))}
    </ReportTable>
  );
}

function LeaveReport({ data }) {
  if (!data.length) {
    return (
      <EmptyReport message="No leave records found for the selected filters." />
    );
  }

  return (
    <ReportTable
      headers={[
        "Employee",
        "Leave Type",
        "Start Date",
        "End Date",
        "Days",
        "Status",
        "Reason",
      ]}
    >
      {data.map((item) => (
        <tr
          key={item._id}
          className="hover:bg-slate-50"
        >
          <td className="px-5 py-4 font-medium text-slate-900">
            {getEmployeeName(item.employee)}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {item.leaveType || "-"}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {formatDate(item.startDate)}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {formatDate(item.endDate)}
          </td>

          <td className="px-5 py-4 font-medium text-slate-900">
            {item.totalDays || 0}
          </td>

          <td className="px-5 py-4">
            <StatusBadge status={item.status} />
          </td>

          <td className="max-w-xs px-5 py-4 text-slate-600">
            <span className="line-clamp-2">
              {item.reason || "-"}
            </span>
          </td>
        </tr>
      ))}
    </ReportTable>
  );
}

function PayrollReport({ data }) {
  if (!data.length) {
    return (
      <EmptyReport message="No payroll records found for the selected filters." />
    );
  }

  return (
    <ReportTable
      headers={[
        "Employee",
        "Period",
        "Basic",
        "Allowances",
        "Deductions",
        "Net Salary",
        "Status",
      ]}
    >
      {data.map((item) => (
        <tr
          key={item._id}
          className="hover:bg-slate-50"
        >
          <td className="px-5 py-4">
            <div className="font-medium text-slate-900">
              {getEmployeeName(item.employee)}
            </div>

            <div className="text-xs text-slate-500">
              {item.employee?.designation || "-"}
            </div>
          </td>

          <td className="px-5 py-4 text-slate-600">
            {item.month}/{item.year}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {formatCurrency(item.basicSalary)}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {formatCurrency(item.allowances)}
          </td>

          <td className="px-5 py-4 text-red-600">
            {formatCurrency(item.deductions)}
          </td>

          <td className="px-5 py-4 font-semibold text-slate-900">
            {formatCurrency(item.netSalary)}
          </td>

          <td className="px-5 py-4">
            <StatusBadge status={item.status} />
          </td>
        </tr>
      ))}
    </ReportTable>
  );
}

function PerformanceReport({ data }) {
  if (!data.length) {
    return (
      <EmptyReport message="No performance records found for the selected year." />
    );
  }

  return (
    <ReportTable
      headers={[
        "Employee",
        "Department",
        "Review Period",
        "Year",
        "Rating",
        "Status",
        "Review Date",
      ]}
    >
      {data.map((item) => (
        <tr
          key={item._id}
          className="hover:bg-slate-50"
        >
          <td className="px-5 py-4 font-medium text-slate-900">
            {getEmployeeName(item.employee)}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {item.employee?.department || "-"}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {item.reviewPeriod || "-"}
          </td>

          <td className="px-5 py-4 text-slate-600">
            {item.reviewYear || "-"}
          </td>

          <td className="px-5 py-4">
            <div className="flex items-center gap-1 text-amber-500">
              <Star
                size={16}
                fill="currentColor"
              />

              <span className="font-semibold">
                {item.rating || 0}/5
              </span>
            </div>
          </td>

          <td className="px-5 py-4">
            <StatusBadge status={item.status} />
          </td>

          <td className="px-5 py-4 text-slate-600">
            {formatDate(item.reviewDate)}
          </td>
        </tr>
      ))}
    </ReportTable>
  );
}

function DepartmentReport({ data }) {
  if (!data.length) {
    return (
      <EmptyReport message="No active departments found." />
    );
  }

  return (
    <ReportTable
      headers={[
        "Department",
        "Code",
        "Description",
        "Employees",
        "Status",
      ]}
    >
      {data.map((department) => (
        <tr
          key={department._id}
          className="hover:bg-slate-50"
        >
          <td className="px-5 py-4 font-semibold text-slate-900">
            {department.name}
          </td>

          <td className="px-5 py-4">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              {department.code}
            </span>
          </td>

          <td className="max-w-sm px-5 py-4 text-slate-600">
            {department.description || "-"}
          </td>

          <td className="px-5 py-4 font-semibold text-slate-900">
            {department.employeeCount}
          </td>

          <td className="px-5 py-4">
            <StatusBadge status={department.status} />
          </td>
        </tr>
      ))}
    </ReportTable>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
        status,
      )}`}
    >
      {status || "unknown"}
    </span>
  );
}

function EmptyReport({ message }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
      <FileText
        size={34}
        className="mx-auto mb-3 text-slate-300"
      />

      <h3 className="font-semibold text-slate-900">
        No Data
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}

export default Reports;