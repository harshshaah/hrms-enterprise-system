import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Users,
  Loader2,
  RefreshCw,
  X,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getEmployees,
  deactivateEmployee,
  activateEmployee,
} from "../services/employeeService";

function Employees() {
  const navigate = useNavigate();

  const [employees, setEmployees] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sortField, setSortField] =
    useState("name");

  const [sortDirection, setSortDirection] =
    useState("asc");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage] =
    useState(10);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(null);

  const [deleteEmployee, setDeleteEmployee] =
    useState(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response =
        await getEmployees();

      setEmployees(
        response?.data || [],
      );
    } catch (error) {
      console.error(
        "Employees Error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to fetch employees.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /*
   * Search + Status Filter + Sorting
   */
  const filteredEmployees = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    let result = employees.filter(
      (employee) => {
        const fullName =
          `${employee.firstName || ""} ${
            employee.lastName || ""
          }`.toLowerCase();

        const email =
          employee.email?.toLowerCase() ||
          "";

        const phone =
          employee.phone?.toLowerCase() ||
          "";

        const designation =
          employee.designation?.toLowerCase() ||
          "";

        const department =
          typeof employee.department ===
          "object"
            ? employee.department?.name
                ?.toLowerCase() || ""
            : employee.department
                ?.toLowerCase() || "";

        const matchesSearch =
          !searchValue ||
          fullName.includes(
            searchValue,
          ) ||
          email.includes(
            searchValue,
          ) ||
          phone.includes(
            searchValue,
          ) ||
          designation.includes(
            searchValue,
          ) ||
          department.includes(
            searchValue,
          );

        const matchesStatus =
          statusFilter === "all" ||
          employee.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    );

    result.sort((first, second) => {
      let firstValue = "";
      let secondValue = "";

      switch (sortField) {
        case "name":
          firstValue =
            `${first.firstName || ""} ${
              first.lastName || ""
            }`.trim();

          secondValue =
            `${second.firstName || ""} ${
              second.lastName || ""
            }`.trim();

          break;

        case "department":
          firstValue =
            typeof first.department ===
            "object"
              ? first.department?.name ||
                ""
              : first.department || "";

          secondValue =
            typeof second.department ===
            "object"
              ? second.department?.name ||
                ""
              : second.department || "";

          break;

        case "designation":
          firstValue =
            first.designation || "";

          secondValue =
            second.designation || "";

          break;

        case "joiningDate":
          firstValue = first.joiningDate
            ? new Date(
                first.joiningDate,
              ).getTime()
            : 0;

          secondValue =
            second.joiningDate
              ? new Date(
                  second.joiningDate,
                ).getTime()
              : 0;

          break;

        case "status":
          firstValue =
            first.status || "";

          secondValue =
            second.status || "";

          break;

        default:
          break;
      }

      if (
        typeof firstValue ===
          "string" &&
        typeof secondValue ===
          "string"
      ) {
        const comparison =
          firstValue.localeCompare(
            secondValue,
            undefined,
            {
              sensitivity:
                "base",
            },
          );

        return sortDirection ===
          "asc"
          ? comparison
          : -comparison;
      }

      if (
        firstValue <
        secondValue
      ) {
        return sortDirection ===
          "asc"
          ? -1
          : 1;
      }

      if (
        firstValue >
        secondValue
      ) {
        return sortDirection ===
          "asc"
          ? 1
          : -1;
      }

      return 0;
    });

    return result;
  }, [
    employees,
    search,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEmployees.length /
        itemsPerPage,
    ),
  );

  const paginatedEmployees =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        itemsPerPage;

      return filteredEmployees.slice(
        startIndex,
        startIndex +
          itemsPerPage,
      );
    }, [
      filteredEmployees,
      currentPage,
      itemsPerPage,
    ]);

  /*
   * Reset page when search/filter changes
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
  ]);

  /*
   * Keep page valid after data changes
   */
  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages,
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(
        (previous) =>
          previous === "asc"
            ? "desc"
            : "asc",
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <ChevronsUpDown
          size={14}
          className="text-slate-400"
        />
      );
    }

    return sortDirection ===
      "asc" ? (
      <ArrowUp
        size={14}
        className="text-slate-700"
      />
    ) : (
      <ArrowDown
        size={14}
        className="text-slate-700"
      />
    );
  };

  const formatDepartment = (
    department,
  ) => {
    if (!department) {
      return "-";
    }

    if (
      typeof department ===
      "object"
    ) {
      return (
        department?.name || "-"
      );
    }

    return department;
  };

  const formatDate = (date) => {
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

  const getInitials = (
    employee,
  ) => {
    return (
      `${
        employee.firstName?.charAt(
          0,
        ) || ""
      }${
        employee.lastName?.charAt(
          0,
        ) || ""
      }`.toUpperCase() || "EM"
    );
  };

  const formatStatus = (
    status,
  ) => {
    if (!status) {
      return "-";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const handleDeactivate =
    async () => {
      if (!deleteEmployee?._id) {
        return;
      }

      try {
        setActionLoading(
          deleteEmployee._id,
        );

        await deactivateEmployee(
          deleteEmployee._id,
        );

        setDeleteEmployee(null);

        await fetchEmployees();
      } catch (error) {
        console.error(
          "Deactivate Employee Error:",
          error,
        );

        setError(
          error?.message ||
            "Failed to deactivate employee.",
        );
      } finally {
        setActionLoading(null);
      }
    };

  const handleActivate =
    async (employee) => {
      try {
        setActionLoading(
          employee._id,
        );

        setError("");

        await activateEmployee(
          employee._id,
        );

        await fetchEmployees();
      } catch (error) {
        console.error(
          "Activate Employee Error:",
          error,
        );

        setError(
          error?.message ||
            "Failed to activate employee.",
        );
      } finally {
        setActionLoading(null);
      }
    };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Employees
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage all employees in your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/employees/add",
            )
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />

          Add Employee
        </button>
      </div>

      {/* Search + Filter + Refresh */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
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
              placeholder="Search by name, email, phone, department..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchEmployees}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                isLoading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="text-red-400 hover:text-red-600"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Employee Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2
                size={20}
                className="animate-spin"
              />

              Loading employees...
            </div>
          </div>
        ) : filteredEmployees.length ===
          0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Users
                size={25}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              {search ||
              statusFilter !==
                "all"
                ? "No employees found"
                : "No employees yet"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search ||
              statusFilter !==
                "all"
                ? "Try changing your search or filter."
                : "Start by adding your first employee."}
            </p>

            {!search &&
              statusFilter ===
                "all" && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/employees/add",
                    )
                  }
                  className="mt-4 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  <Plus size={17} />

                  Add Employee
                </button>
              )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "name",
                          )
                        }
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
                      >
                        Employee

                        {renderSortIcon(
                          "name",
                        )}
                      </button>
                    </th>

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "department",
                          )
                        }
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
                      >
                        Department

                        {renderSortIcon(
                          "department",
                        )}
                      </button>
                    </th>

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "designation",
                          )
                        }
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
                      >
                        Designation

                        {renderSortIcon(
                          "designation",
                        )}
                      </button>
                    </th>

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "joiningDate",
                          )
                        }
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
                      >
                        Joining Date

                        {renderSortIcon(
                          "joiningDate",
                        )}
                      </button>
                    </th>

                    <th className="px-6 py-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          handleSort(
                            "status",
                          )
                        }
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
                      >
                        Status

                        {renderSortIcon(
                          "status",
                        )}
                      </button>
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedEmployees.map(
                    (employee) => {
                      const isActive =
                        employee.status ===
                        "active";

                      const isActionLoading =
                        actionLoading ===
                        employee._id;

                      return (
                        <tr
                          key={
                            employee._id
                          }
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          {/* Employee */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                                {employee.profilePhoto ? (
                                  <img
                                    src={
                                      employee.profilePhoto
                                    }
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getInitials(
                                    employee,
                                  )
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {
                                    employee.firstName
                                  }{" "}
                                  {
                                    employee.lastName
                                  }
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {
                                    employee.email
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-700">
                              {formatDepartment(
                                employee.department,
                              )}
                            </span>
                          </td>

                          {/* Designation */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-700">
                              {employee.designation ||
                                "-"}
                            </span>
                          </td>

                          {/* Joining Date */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">
                              {formatDate(
                                employee.joiningDate,
                              )}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isActive
                                    ? "bg-emerald-500"
                                    : "bg-slate-400"
                                }`}
                              />

                              {formatStatus(
                                employee.status,
                              )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              {/* View */}
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/employees/${employee._id}`,
                                  )
                                }
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                title="View Employee"
                              >
                                <Eye
                                  size={17}
                                />
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/employees/${employee._id}/edit`,
                                  )
                                }
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                title="Edit Employee"
                              >
                                <Pencil
                                  size={17}
                                />
                              </button>

                              {isActive ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteEmployee(
                                      employee,
                                    )
                                  }
                                  disabled={
                                    isActionLoading
                                  }
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Deactivate Employee"
                                >
                                  {isActionLoading ? (
                                    <Loader2
                                      size={
                                        17
                                      }
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={
                                        17
                                      }
                                    />
                                  )}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleActivate(
                                      employee,
                                    )
                                  }
                                  disabled={
                                    isActionLoading
                                  }
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Activate Employee"
                                >
                                  {isActionLoading ? (
                                    <Loader2
                                      size={
                                        17
                                      }
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <UserCheck
                                      size={
                                        17
                                      }
                                    />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {filteredEmployees
                    .length === 0
                    ? 0
                    : (currentPage -
                        1) *
                        itemsPerPage +
                      1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-700">
                  {Math.min(
                    currentPage *
                      itemsPerPage,
                    filteredEmployees.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {
                    filteredEmployees.length
                  }
                </span>{" "}
                employees
              </p>

              <div className="flex items-center gap-1">
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
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        page,
                      )
                    }
                    className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition ${
                      currentPage ===
                      page
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

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
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Deactivate Confirmation Modal */}
      {deleteEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                  <UserX
                    size={20}
                    className="text-red-600"
                  />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  Deactivate Employee?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to
                  deactivate{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      deleteEmployee.firstName
                    }{" "}
                    {
                      deleteEmployee.lastName
                    }
                  </span>
                  ? The employee will no
                  longer be active.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteEmployee(
                    null,
                  )
                }
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteEmployee(
                    null,
                  )
                }
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeactivate
                }
                disabled={
                  actionLoading ===
                  deleteEmployee._id
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ===
                deleteEmployee._id ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Deactivating...
                  </>
                ) : (
                  <>
                    <UserX size={17} />

                    Deactivate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;