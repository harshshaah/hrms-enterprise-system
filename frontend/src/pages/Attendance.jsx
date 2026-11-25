import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Eye,
  Filter,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  deleteAttendance,
  getAttendance,
  getAttendanceSummary,
} from "../services/attendanceService";

import { getEmployees } from "../services/employeeService";

import { getCurrentUser } from "../services/authService";

function Attendance() {
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const userRole =
    currentUser?.role?.toLowerCase() || "";

  const canAddAttendance =
    userRole === "admin" ||
    userRole === "hr";

  const canEditAttendance =
    userRole === "admin" ||
    userRole === "hr";

  const canDeleteAttendance =
    userRole === "admin";

  const [attendance, setAttendance] =
    useState([]);

  const [employees, setEmployees] =
    useState([]);

  const [summary, setSummary] =
    useState({
      total: 0,
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
    });

  const [filters, setFilters] =
    useState({
      employee: "",
      date: "",
      status: "",
    });

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [summaryLoading, setSummaryLoading] =
    useState(true);

  const [employeeLoading, setEmployeeLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [employeeError, setEmployeeError] =
    useState("");

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const [sortField, setSortField] =
    useState("date");

  const [sortDirection, setSortDirection] =
    useState("desc");

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [
    filters.employee,
    filters.date,
    filters.status,
  ]);

  useEffect(() => {
    fetchSummary();
  }, [filters.date]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    filters.employee,
    filters.date,
    filters.status,
  ]);

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      setEmployeeError("");

      const response =
        await getEmployees();

      setEmployees(
        response?.data || [],
      );
    } catch (err) {
      console.error(
        "Failed to fetch employees:",
        err,
      );

      setEmployeeError(
        err?.message ||
          "Failed to load employees",
      );
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchAttendance = async (
    isRefresh = false,
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await getAttendance(filters);

      setAttendance(
        response?.data || [],
      );
    } catch (err) {
      console.error(
        "Failed to fetch attendance:",
        err,
      );

      setError(
        err?.message ||
          "Failed to load attendance",
      );

      setAttendance([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);

      const response =
        await getAttendanceSummary(
          filters.date,
        );

      setSummary(
        response?.data || {
          total: 0,
          present: 0,
          absent: 0,
          halfDay: 0,
          leave: 0,
        },
      );
    } catch (err) {
      console.error(
        "Failed to fetch attendance summary:",
        err,
      );

      setSummary({
        total: 0,
        present: 0,
        absent: 0,
        halfDay: 0,
        leave: 0,
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleFilterChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setSearch("");

    setFilters({
      employee: "",
      date: "",
      status: "",
    });
  };

  const handleSort = (
    field,
  ) => {
    if (sortField === field) {
      setSortDirection(
        (previous) =>
          previous === "asc"
            ? "desc"
            : "asc",
      );

      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const getEmployeeName = (
    employee,
  ) => {
    if (!employee) {
      return "Unknown Employee";
    }

    const name =
      `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.trim();

    return name || "Unknown Employee";
  };

  const getEmployeeEmail = (
    employee,
  ) => {
    return employee?.email || "-";
  };

  const formatDate = (
    date,
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date,
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const formatTime = (
    date,
  ) => {
    if (!date) {
      return "-";
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

  const getStatusLabel = (
    status,
  ) => {
    switch (status) {
      case "present":
        return "Present";

      case "absent":
        return "Absent";

      case "half-day":
        return "Half Day";

      case "leave":
        return "Leave";

      default:
        return status || "-";
    }
  };

  const getStatusClass = (
    status,
  ) => {
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

  const filteredAttendance =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      let result =
        [...attendance];

      if (searchValue) {
        result =
          result.filter(
            (item) => {
              const employeeName =
                getEmployeeName(
                  item.employee,
                ).toLowerCase();

              const employeeEmail =
                getEmployeeEmail(
                  item.employee,
                ).toLowerCase();

              const remarks =
                (
                  item.remarks || ""
                ).toLowerCase();

              const status =
                (
                  item.status || ""
                ).toLowerCase();

              return (
                employeeName.includes(
                  searchValue,
                ) ||
                employeeEmail.includes(
                  searchValue,
                ) ||
                remarks.includes(
                  searchValue,
                ) ||
                status.includes(
                  searchValue,
                )
              );
            },
          );
      }

      result.sort(
        (a, b) => {
          let valueA;
          let valueB;

          switch (sortField) {
            case "employee":
              valueA =
                getEmployeeName(
                  a.employee,
                ).toLowerCase();

              valueB =
                getEmployeeName(
                  b.employee,
                ).toLowerCase();

              break;

            case "date":
              valueA =
                new Date(
                  a.date || 0,
                ).getTime();

              valueB =
                new Date(
                  b.date || 0,
                ).getTime();

              break;

            case "checkIn":
              valueA = a.checkIn
                ? new Date(
                    a.checkIn,
                  ).getTime()
                : 0;

              valueB = b.checkIn
                ? new Date(
                    b.checkIn,
                  ).getTime()
                : 0;

              break;

            case "checkOut":
              valueA = a.checkOut
                ? new Date(
                    a.checkOut,
                  ).getTime()
                : 0;

              valueB = b.checkOut
                ? new Date(
                    b.checkOut,
                  ).getTime()
                : 0;

              break;

            case "status":
              valueA =
                (
                  a.status || ""
                ).toLowerCase();

              valueB =
                (
                  b.status || ""
                ).toLowerCase();

              break;

            case "workingHours":
              valueA =
                Number(
                  a.workingHours || 0,
                );

              valueB =
                Number(
                  b.workingHours || 0,
                );

              break;

            default:
              valueA = 0;
              valueB = 0;
          }

          if (valueA < valueB) {
            return sortDirection ===
              "asc"
              ? -1
              : 1;
          }

          if (valueA > valueB) {
            return sortDirection ===
              "asc"
              ? 1
              : -1;
          }

          return 0;
        },
      );

      return result;
    }, [
      attendance,
      search,
      sortField,
      sortDirection,
    ]);

  const totalPages =
    Math.ceil(
      filteredAttendance.length /
        itemsPerPage,
    );

  const paginatedAttendance =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        itemsPerPage;

      return filteredAttendance.slice(
        startIndex,
        startIndex +
          itemsPerPage,
      );
    }, [
      filteredAttendance,
      currentPage,
    ]);

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const handleDelete = async (
    id,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this attendance record?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(id);
      setError("");

      await deleteAttendance(id);

      await Promise.all([
        fetchAttendance(),
        fetchSummary(),
      ]);
    } catch (err) {
      console.error(
        "Failed to delete attendance:",
        err,
      );

      setError(
        err?.message ||
          "Failed to delete attendance",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchAttendance(true),
      fetchSummary(),
      fetchEmployees(),
    ]);
  };

  const SortIcon = ({
    field,
  }) => {
    if (sortField !== field) {
      return (
        <ChevronsUpDown
          size={14}
          className="text-gray-400"
        />
      );
    }

    return sortDirection ===
      "asc" ? (
      <ArrowUp
        size={14}
        className="text-gray-700"
      />
    ) : (
      <ArrowDown
        size={14}
        className="text-gray-700"
      />
    );
  };

  const hasActiveFilters =
    Boolean(
      search ||
        filters.employee ||
        filters.date ||
        filters.status,
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor employee attendance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          {canAddAttendance && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/attendance/add",
                )
              }
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <Plus size={18} />

              Add Attendance
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: "Total",
            value: summary.total,
          },
          {
            label: "Present",
            value: summary.present,
          },
          {
            label: "Absent",
            value: summary.absent,
          },
          {
            label: "Half Day",
            value: summary.halfDay,
          },
          {
            label: "Leave",
            value: summary.leave,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {item.label}
            </p>

            <div className="mt-2">
              {summaryLoading ? (
                <Loader2
                  size={22}
                  className="animate-spin text-gray-400"
                />
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter
              size={18}
              className="text-gray-500"
            />

            <h2 className="font-semibold text-gray-900">
              Filters
            </h2>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <X size={15} />

              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Search
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Employee, email, remarks..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              />
            </div>
          </div>

          {/* Employee */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Employee
            </label>

            <select
              name="employee"
              value={filters.employee}
              onChange={
                handleFilterChange
              }
              disabled={employeeLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50"
            >
              <option value="">
                All Employees
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
                    {getEmployeeName(
                      employee,
                    )}
                  </option>
                ),
              )}
            </select>

            {employeeError && (
              <p className="mt-1 text-xs text-red-600">
                {employeeError}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Date
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={
                  handleFilterChange
                }
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={
                handleFilterChange
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
            >
              <option value="">
                All Status
              </option>

              <option value="present">
                Present
              </option>

              <option value="absent">
                Absent
              </option>

              <option value="half-day">
                Half Day
              </option>

              <option value="leave">
                Leave
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="text-red-500 hover:text-red-700"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left">
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        "employee",
                      )
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    Employee
                    <SortIcon field="employee" />
                  </button>
                </th>

                <th className="px-5 py-3 text-left">
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        "date",
                      )
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    Date
                    <SortIcon field="date" />
                  </button>
                </th>

                <th className="px-5 py-3 text-left">
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        "checkIn",
                      )
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    Check In
                    <SortIcon field="checkIn" />
                  </button>
                </th>

                <th className="px-5 py-3 text-left">
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        "checkOut",
                      )
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    Check Out
                    <SortIcon field="checkOut" />
                  </button>
                </th>

                <th className="px-5 py-3 text-left">
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        "status",
                      )
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>

                <th className="px-5 py-3 text-left">
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        "workingHours",
                      )
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    Working Hours
                    <SortIcon field="workingHours" />
                  </button>
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Remarks
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2
                        size={30}
                        className="animate-spin text-gray-400"
                      />

                      <p className="text-sm text-gray-500">
                        Loading attendance...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedAttendance.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <CalendarDays
                        size={40}
                        className="mb-3 text-gray-300"
                      />

                      <p className="font-medium text-gray-700">
                        No attendance records found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your filters or add a new attendance record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAttendance.map(
                  (item) => (
                    <tr
                      key={
                        item._id
                      }
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {getEmployeeName(
                              item.employee,
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {getEmployeeEmail(
                              item.employee,
                            )}
                          </p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {formatDate(
                          item.date,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {formatTime(
                          item.checkIn,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {formatTime(
                          item.checkOut,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            item.status,
                          )}`}
                        >
                          {getStatusLabel(
                            item.status,
                          )}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-700">
                        {Number(
                          item.workingHours ||
                            0,
                        ).toFixed(2)}{" "}
                        hrs
                      </td>

                      <td className="max-w-[220px] px-5 py-4 text-sm text-gray-600">
                        <span
                          className="block truncate"
                          title={
                            item.remarks ||
                            ""
                          }
                        >
                          {item.remarks ||
                            "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {/* View - All Roles */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/attendance/${item._id}`,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                            title="View"
                          >
                            <Eye
                              size={17}
                            />
                          </button>

                          {/* Edit - Admin + HR */}
                          {canEditAttendance && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/attendance/${item._id}/edit`,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                              title="Edit"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>
                          )}

                          {/* Delete - Admin Only */}
                          {canDeleteAttendance && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  item._id,
                                )
                              }
                              disabled={
                                actionLoadingId ===
                                item._id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete"
                            >
                              {actionLoadingId ===
                              item._id ? (
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={17}
                                />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading &&
          filteredAttendance.length >
            0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {(currentPage -
                    1) *
                    itemsPerPage +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700">
                  {Math.min(
                    currentPage *
                      itemsPerPage,
                    filteredAttendance.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {filteredAttendance.length}
                </span>{" "}
                records
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (previous) =>
                        previous - 1,
                    )
                  }
                  className="flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={16}
                  />

                  Previous
                </button>

                <span className="px-2 text-sm text-gray-600">
                  Page{" "}
                  <span className="font-semibold text-gray-900">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {totalPages}
                  </span>
                </span>

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (previous) =>
                        previous + 1,
                    )
                  }
                  className="flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next

                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default Attendance;