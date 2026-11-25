import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Building2,
  Eye,
  Pencil,
  Plus,
  Search,
  Power,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from "lucide-react";

import {
  getDepartments,
  deactivateDepartment,
  activateDepartment,
} from "../services/departmentService";

function Departments() {
  const navigate = useNavigate();

  const [departments, setDepartments] =
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

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response =
        await getDepartments();

      setDepartments(
        response?.data || [],
      );
    } catch (error) {
      console.error(
        "Fetch Departments Error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to fetch departments",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleStatusChange =
    async (department) => {
      const isActive =
        department.status === "active";

      const action = isActive
        ? "deactivate"
        : "activate";

      const confirmed = window.confirm(
        `Are you sure you want to ${action} "${department.name}"?`,
      );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoadingId(
          department._id,
        );

        setError("");

        if (isActive) {
          await deactivateDepartment(
            department._id,
          );
        } else {
          await activateDepartment(
            department._id,
          );
        }

        await fetchDepartments();
      } catch (error) {
        console.error(
          "Department Status Update Error:",
          error,
        );

        setError(
          error?.message ||
            `Failed to ${action} department`,
        );
      } finally {
        setActionLoadingId(null);
      }
    };

  /*
   * Search + Status Filter + Sorting
   */
  const filteredDepartments =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      let result =
        departments.filter(
          (department) => {
            const name =
              department.name
                ?.toLowerCase() || "";

            const code =
              department.code
                ?.toLowerCase() || "";

            const headOfDepartment =
              department.headOfDepartment
                ?.toLowerCase() || "";

            const description =
              department.description
                ?.toLowerCase() || "";

            const matchesSearch =
              !searchValue ||
              name.includes(
                searchValue,
              ) ||
              code.includes(
                searchValue,
              ) ||
              headOfDepartment.includes(
                searchValue,
              ) ||
              description.includes(
                searchValue,
              );

            const matchesStatus =
              statusFilter === "all" ||
              department.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          },
        );

      result.sort(
        (first, second) => {
          let firstValue = "";
          let secondValue = "";

          switch (sortField) {
            case "name":
              firstValue =
                first.name || "";

              secondValue =
                second.name || "";

              break;

            case "code":
              firstValue =
                first.code || "";

              secondValue =
                second.code || "";

              break;

            case "head":
              firstValue =
                first.headOfDepartment ||
                "";

              secondValue =
                second.headOfDepartment ||
                "";

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
        },
      );

      return result;
    }, [
      departments,
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
      filteredDepartments.length /
        itemsPerPage,
    ),
  );

  const paginatedDepartments =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        itemsPerPage;

      return filteredDepartments.slice(
        startIndex,
        startIndex +
          itemsPerPage,
      );
    }, [
      filteredDepartments,
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Departments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your organization departments
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/departments/add",
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />

          Add Department
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
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
              placeholder="Search department..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 md:w-44"
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
        </div>
      </div>

      {/* Department Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {/* Department */}
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
                    Department

                    {renderSortIcon(
                      "name",
                    )}
                  </button>
                </th>

                {/* Code */}
                <th className="px-6 py-4 text-left">
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        "code",
                      )
                    }
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
                  >
                    Code

                    {renderSortIcon(
                      "code",
                    )}
                  </button>
                </th>

                {/* Head */}
                <th className="px-6 py-4 text-left">
                  <button
                    type="button"
                    onClick={() =>
                      handleSort(
                        "head",
                      )
                    }
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800"
                  >
                    Head

                    {renderSortIcon(
                      "head",
                    )}
                  </button>
                </th>

                {/* Status */}
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

                {/* Actions */}
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {isLoading && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Loading departments...
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!isLoading &&
                filteredDepartments.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                          <Building2
                            size={24}
                            className="text-slate-400"
                          />
                        </div>

                        <p className="text-sm font-medium text-slate-700">
                          No departments found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try changing your search or filter
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

              {/* Departments */}
              {!isLoading &&
                paginatedDepartments.map(
                  (department) => {
                    const isActive =
                      department.status ===
                      "active";

                    const isActionLoading =
                      actionLoadingId ===
                      department._id;

                    return (
                      <tr
                        key={
                          department._id
                        }
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                      >
                        {/* Department */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                              <Building2
                                size={19}
                                className="text-slate-600"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {
                                  department.name
                                }
                              </p>

                              <p className="text-xs text-slate-400">
                                {department.description ||
                                  "No description"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-6 py-4">
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {
                              department.code
                            }
                          </span>
                        </td>

                        {/* Head */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {department.headOfDepartment ||
                            "Not assigned"}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/departments/${department._id}`,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                              title="View"
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
                                  `/departments/${department._id}/edit`,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                              title="Edit"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            {/* Activate / Deactivate */}
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  department,
                                )
                              }
                              disabled={
                                isActionLoading
                              }
                              className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                isActive
                                  ? "text-red-500 hover:bg-red-50 hover:text-red-700"
                                  : "text-green-600 hover:bg-green-50 hover:text-green-700"
                              }`}
                              title={
                                isActive
                                  ? "Deactivate"
                                  : "Activate"
                              }
                            >
                              <Power
                                size={17}
                              />
                            </button>
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
        {!isLoading &&
          filteredDepartments.length >
            0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {(currentPage -
                    1) *
                    itemsPerPage +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-700">
                  {Math.min(
                    currentPage *
                      itemsPerPage,
                    filteredDepartments.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {
                    filteredDepartments.length
                  }
                </span>{" "}
                departments
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={
                    currentPage ===
                    1
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
          )}
      </div>
    </div>
  );
}

export default Departments;