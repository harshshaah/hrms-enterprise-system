import {
  useEffect,
  useState,
} from "react";

import {
  Eye,
  Pencil,
  Plus,
  CheckCircle,
  XCircle,
  DollarSign,
  RefreshCw,
  Filter,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getPayrolls,
  getPayrollStats,
  markPayrollAsPaid,
  cancelPayroll,
} from "../services/payrollService";

const Payroll = () => {
  const navigate = useNavigate();

  const [
    payrolls,
    setPayrolls,
  ] = useState([]);

  const [
    stats,
    setStats,
  ] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    cancelled: 0,
  });

  const [
    pagination,
    setPagination,
  ] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    filters,
    setFilters,
  ] = useState({
    month: "",
    year: "",
    status: "",
  });

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState({
    month: "",
    year: "",
    status: "",
  });

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    limit,
    setLimit,
  ] = useState(10);

  // Sorting
  const [
    sortBy,
    setSortBy,
  ] = useState("createdAt");

  const [
    sortOrder,
    setSortOrder,
  ] = useState("desc");

  const fetchPayrollData = async ({
    selectedFilters = appliedFilters,
    selectedSearch = appliedSearch,
    selectedPage = page,
    selectedLimit = limit,
    selectedSortBy = sortBy,
    selectedSortOrder = sortOrder,
  } = {}) => {
    try {
      setLoading(true);
      setError("");

      const [
        payrollResponse,
        statsResponse,
      ] = await Promise.all([
        getPayrolls({
          ...selectedFilters,
          page: selectedPage,
          limit: selectedLimit,
          search: selectedSearch,
          sortBy: selectedSortBy,
          sortOrder: selectedSortOrder,
        }),

        getPayrollStats(),
      ]);

      setPayrolls(
        payrollResponse?.data?.data ||
          [],
      );

      setPagination(
        payrollResponse?.data?.pagination || {
          total: 0,
          page: selectedPage,
          limit: selectedLimit,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      );

      setStats(
        statsResponse?.data || {
          total: 0,
          pending: 0,
          paid: 0,
          cancelled: 0,
        },
      );
    } catch (error) {
      setError(
        error?.message ||
          "Failed to fetch payroll data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData({
      selectedFilters: {
        month: "",
        year: "",
        status: "",
      },
      selectedSearch: "",
      selectedPage: 1,
      selectedLimit: 10,
      selectedSortBy: "createdAt",
      selectedSortOrder: "desc",
    });
  }, []);

  const handleFilterChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  const handleApplyFilters = async () => {
    setAppliedFilters(filters);
    setPage(1);

    await fetchPayrollData({
      selectedFilters: filters,
      selectedSearch: appliedSearch,
      selectedPage: 1,
      selectedLimit: limit,
      selectedSortBy: sortBy,
      selectedSortOrder: sortOrder,
    });
  };

  const handleResetFilters = async () => {
    const resetFilters = {
      month: "",
      year: "",
      status: "",
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);

    await fetchPayrollData({
      selectedFilters: resetFilters,
      selectedSearch: appliedSearch,
      selectedPage: 1,
      selectedLimit: limit,
      selectedSortBy: sortBy,
      selectedSortOrder: sortOrder,
    });
  };

  const handleSearch = async () => {
    const searchValue =
      searchInput.trim();

    setAppliedSearch(searchValue);
    setPage(1);

    await fetchPayrollData({
      selectedFilters: appliedFilters,
      selectedSearch: searchValue,
      selectedPage: 1,
      selectedLimit: limit,
      selectedSortBy: sortBy,
      selectedSortOrder: sortOrder,
    });
  };

  const handleClearSearch = async () => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);

    await fetchPayrollData({
      selectedFilters: appliedFilters,
      selectedSearch: "",
      selectedPage: 1,
      selectedLimit: limit,
      selectedSortBy: sortBy,
      selectedSortOrder: sortOrder,
    });
  };

  const handlePageChange = async (
    newPage,
  ) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages
    ) {
      return;
    }

    setPage(newPage);

    await fetchPayrollData({
      selectedFilters: appliedFilters,
      selectedSearch: appliedSearch,
      selectedPage: newPage,
      selectedLimit: limit,
      selectedSortBy: sortBy,
      selectedSortOrder: sortOrder,
    });
  };

  const handleLimitChange = async (
    event,
  ) => {
    const newLimit = Number(
      event.target.value,
    );

    setLimit(newLimit);
    setPage(1);

    await fetchPayrollData({
      selectedFilters: appliedFilters,
      selectedSearch: appliedSearch,
      selectedPage: 1,
      selectedLimit: newLimit,
      selectedSortBy: sortBy,
      selectedSortOrder: sortOrder,
    });
  };

  const handleSortChange = async (
    event,
  ) => {
    const newSortBy =
      event.target.value;

    setSortBy(newSortBy);
    setPage(1);

    await fetchPayrollData({
      selectedFilters: appliedFilters,
      selectedSearch: appliedSearch,
      selectedPage: 1,
      selectedLimit: limit,
      selectedSortBy: newSortBy,
      selectedSortOrder: sortOrder,
    });
  };

  const handleSortOrderChange = async (
    event,
  ) => {
    const newSortOrder =
      event.target.value;

    setSortOrder(newSortOrder);
    setPage(1);

    await fetchPayrollData({
      selectedFilters: appliedFilters,
      selectedSearch: appliedSearch,
      selectedPage: 1,
      selectedLimit: limit,
      selectedSortBy: sortBy,
      selectedSortOrder: newSortOrder,
    });
  };

  const handleRefresh = async () => {
    await fetchPayrollData({
      selectedFilters: appliedFilters,
      selectedSearch: appliedSearch,
      selectedPage: page,
      selectedLimit: limit,
      selectedSortBy: sortBy,
      selectedSortOrder: sortOrder,
    });
  };

  const handleMarkAsPaid = async (
    payrollId,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to mark this payroll as paid?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(payrollId);

      await markPayrollAsPaid(
        payrollId,
      );

      await fetchPayrollData({
        selectedFilters: appliedFilters,
        selectedSearch: appliedSearch,
        selectedPage: page,
        selectedLimit: limit,
        selectedSortBy: sortBy,
        selectedSortOrder: sortOrder,
      });
    } catch (error) {
      alert(
        error?.message ||
          "Failed to mark payroll as paid.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (
    payrollId,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this payroll?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(payrollId);

      await cancelPayroll(
        payrollId,
      );

      await fetchPayrollData({
        selectedFilters: appliedFilters,
        selectedSearch: appliedSearch,
        selectedPage: page,
        selectedLimit: limit,
        selectedSortBy: sortBy,
        selectedSortOrder: sortOrder,
      });
    } catch (error) {
      alert(
        error?.message ||
          "Failed to cancel payroll.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const formatMonth = (
    month,
  ) => {
    const months = [
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
    ];

    return months[month - 1] || "-";
  };

  const formatCurrency = (
    amount,
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      },
    ).format(amount || 0);
  };

  const getStatusClasses = (
    status,
  ) => {
    if (status === "paid") {
      return "bg-green-100 text-green-700";
    }

    if (status === "cancelled") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payroll
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage employee payroll and salary
            payments.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

          <button
            type="button"
            onClick={() =>
              navigate("/payroll/add")
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus
              size={18}
            />

            Add Payroll
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Payrolls
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {stats.total}
              </h2>
            </div>

            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <DollarSign
                size={22}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {stats.pending}
              </h2>
            </div>

            <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
              <DollarSign
                size={22}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Paid
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {stats.paid}
              </h2>
            </div>

            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <CheckCircle
                size={22}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Cancelled
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {stats.cancelled}
              </h2>
            </div>

            <div className="rounded-lg bg-red-100 p-3 text-red-600">
              <XCircle
                size={22}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Search
            size={18}
            className="text-gray-600"
          />

          <h2 className="text-lg font-semibold text-gray-900">
            Search Payrolls
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  handleSearch();
                }
              }}
              placeholder="Search by employee name or email..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={
              handleSearch
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search
              size={16}
            />

            Search
          </button>

          {appliedSearch && (
            <button
              type="button"
              onClick={
                handleClearSearch
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw
                size={16}
              />

              Clear
            </button>
          )}
        </div>

        {appliedSearch && (
          <p className="mt-3 text-xs text-gray-500">
            Searching for:{" "}
            <span className="font-medium text-gray-700">
              "{appliedSearch}"
            </span>
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter
            size={18}
            className="text-gray-600"
          />

          <h2 className="text-lg font-semibold text-gray-900">
            Filter Payrolls
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Month */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Month
            </label>

            <select
              name="month"
              value={filters.month}
              onChange={
                handleFilterChange
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                All Months
              </option>

              <option value="1">
                January
              </option>

              <option value="2">
                February
              </option>

              <option value="3">
                March
              </option>

              <option value="4">
                April
              </option>

              <option value="5">
                May
              </option>

              <option value="6">
                June
              </option>

              <option value="7">
                July
              </option>

              <option value="8">
                August
              </option>

              <option value="9">
                September
              </option>

              <option value="10">
                October
              </option>

              <option value="11">
                November
              </option>

              <option value="12">
                December
              </option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Year
            </label>

            <select
              name="year"
              value={filters.year}
              onChange={
                handleFilterChange
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                All Years
              </option>

              <option value="2025">
                2025
              </option>

              <option value="2026">
                2026
              </option>

              <option value="2027">
                2027
              </option>

              <option value="2028">
                2028
              </option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={
                handleFilterChange
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={
                handleApplyFilters
              }
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Filter
                size={16}
              />

              Apply
            </button>

            <button
              type="button"
              onClick={
                handleResetFilters
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw
                size={16}
              />

              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Sorting */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter
            size={18}
            className="text-gray-600"
          />

          <h2 className="text-lg font-semibold text-gray-900">
            Sort Payrolls
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Sort By */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={
                handleSortChange
              }
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="createdAt">
                Created Date
              </option>

              <option value="month">
                Month
              </option>

              <option value="year">
                Year
              </option>

              <option value="basicSalary">
                Basic Salary
              </option>

              <option value="grossSalary">
                Gross Salary
              </option>

              <option value="netSalary">
                Net Salary
              </option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Sort Order
            </label>

            <select
              value={sortOrder}
              onChange={
                handleSortOrderChange
              }
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="desc">
                Descending
              </option>

              <option value="asc">
                Ascending
              </option>
            </select>
          </div>

          {/* Current Sorting */}
          <div className="flex items-end">
            <div className="w-full rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5">
              <p className="text-xs font-medium text-blue-600">
                Current Sorting
              </p>

              <p className="mt-1 text-sm font-semibold text-blue-900">
                {sortBy ===
                "createdAt"
                  ? "Created Date"
                  : sortBy ===
                    "basicSalary"
                  ? "Basic Salary"
                  : sortBy ===
                    "grossSalary"
                  ? "Gross Salary"
                  : sortBy ===
                    "netSalary"
                  ? "Net Salary"
                  : sortBy ===
                    "month"
                  ? "Month"
                  : "Year"}

                {" - "}

                {sortOrder ===
                "asc"
                  ? "Ascending"
                  : "Descending"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Payroll Records
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Showing{" "}
              {payrolls.length}{" "}
              of{" "}
              {pagination.total}{" "}
              payroll records
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">
              Per page
            </label>

            <select
              value={limit}
              onChange={
                handleLimitChange
              }
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="5">
                5
              </option>

              <option value="10">
                10
              </option>

              <option value="20">
                20
              </option>

              <option value="50">
                50
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-5 py-16">
            <div className="text-sm text-gray-500">
              Loading payrolls...
            </div>
          </div>
        ) : payrolls.length ===
          0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16">
            <DollarSign
              size={40}
              className="text-gray-300"
            />

            <p className="mt-3 text-sm text-gray-500">
              No payroll records found.
            </p>

            {(appliedSearch ||
              appliedFilters.month ||
              appliedFilters.year ||
              appliedFilters.status) && (
              <button
                type="button"
                onClick={
                  handleResetFilters
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw
                  size={16}
                />

                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Employee
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Period
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Gross
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Net Salary
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payrolls.map(
                    (payroll) => (
                      <tr
                        key={
                          payroll._id
                        }
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {
                                payroll
                                  .employee
                                  ?.firstName
                              }{" "}
                              {
                                payroll
                                  .employee
                                  ?.lastName
                              }
                            </p>

                            <p className="text-xs text-gray-500">
                              {
                                payroll
                                  .employee
                                  ?.designation
                              }
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {formatMonth(
                            payroll.month,
                          )}{" "}
                          {payroll.year}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-gray-700">
                          {formatCurrency(
                            payroll.grossSalary,
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            payroll.netSalary,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                              payroll.status,
                            )}`}
                          >
                            {
                              payroll.status
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="View"
                              onClick={() =>
                                navigate(
                                  `/payroll/${payroll._id}`,
                                )
                              }
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                            >
                              <Eye
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                navigate(
                                  `/payroll/${payroll._id}/edit`,
                                )
                              }
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            {payroll.status ===
                              "pending" && (
                              <>
                                <button
                                  type="button"
                                  title="Mark as Paid"
                                  disabled={
                                    actionLoading ===
                                    payroll._id
                                  }
                                  onClick={() =>
                                    handleMarkAsPaid(
                                      payroll._id,
                                    )
                                  }
                                  className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <CheckCircle
                                    size={17}
                                  />
                                </button>

                                <button
                                  type="button"
                                  title="Cancel"
                                  disabled={
                                    actionLoading ===
                                    payroll._id
                                  }
                                  onClick={() =>
                                    handleCancel(
                                      payroll._id,
                                    )
                                  }
                                  className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <XCircle
                                    size={17}
                                  />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages >
              1 && (
              <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Page{" "}
                  <span className="font-medium text-gray-700">
                    {pagination.page}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700">
                    {pagination.totalPages}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(
                        pagination.page -
                          1,
                      )
                    }
                    disabled={
                      !pagination.hasPreviousPage ||
                      loading
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={16}
                    />

                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(
                        pagination.page +
                          1,
                      )
                    }
                    disabled={
                      !pagination.hasNextPage ||
                      loading
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next

                    <ChevronRight
                      size={16}
                    />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Payroll;