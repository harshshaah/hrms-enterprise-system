import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Edit,
  UserCheck,
  UserX,
  Plus,
  Search,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getUsers,
  activateUser,
  deactivateUser,
} from "../services/userService";

function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response =
        await getUsers();

      setUsers(
        response?.data || [],
      );
    } catch (error) {
      console.error(
        "Fetch Users Error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to fetch users.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (
    user,
  ) => {
    try {
      setError("");

      if (
        user.status ===
        "active"
      ) {
        await deactivateUser(
          user._id,
        );
      } else {
        await activateUser(
          user._id,
        );
      }

      await fetchUsers();
    } catch (error) {
      console.error(
        "Update User Status Error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to update user status.",
      );
    }
  };

  const filteredUsers =
    useMemo(() => {
      return users.filter(
        (user) => {
          const searchValue =
            search
              .toLowerCase()
              .trim();

          const fullName =
            `${user.firstName || ""} ${
              user.lastName || ""
            }`.toLowerCase();

          const email =
            user.email?.toLowerCase() ||
            "";

          const matchesSearch =
            !searchValue ||
            fullName.includes(
              searchValue,
            ) ||
            email.includes(
              searchValue,
            );

          const matchesRole =
            roleFilter === "all" ||
            user.role ===
              roleFilter;

          const matchesStatus =
            statusFilter === "all" ||
            user.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        },
      );
    }, [
      users,
      search,
      roleFilter,
      statusFilter,
    ]);

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const hasFilters =
    search ||
    roleFilter !== "all" ||
    statusFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage system users and
            their access roles.
          </p>
        </div>

        {/* Add User */}
        <button
          type="button"
          onClick={() =>
            navigate("/users/add")
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={17} />

          Add User
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Role */}
          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value,
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            <option value="all">
              All Roles
            </option>

            <option value="admin">
              Admin
            </option>

            <option value="hr">
              HR
            </option>

            <option value="employee">
              Employee
            </option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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

          {/* Clear */}
          {hasFilters && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={16} />

              Clear
            </button>
          )}

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            title="Refresh Users"
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                isLoading
                  ? "animate-spin"
                  : ""
              }
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>
        </div>
      </div>

      {/* Result Count */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {users.length}
            </span>{" "}
            users
          </p>
        </div>
      )}

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <RefreshCw
                size={18}
                className="animate-spin"
              />

              Loading users...
            </div>
          </div>
        ) : filteredUsers.length ===
          0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Search
                size={20}
                className="text-slate-400"
              />
            </div>

            <p className="text-sm font-medium text-slate-700">
              No users found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search
              or filters.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-4"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(
                  (user) => (
                    <tr
                      key={
                        user._id
                      }
                      className="transition hover:bg-slate-50"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold uppercase text-slate-700">
                            {user.firstName?.charAt(
                              0,
                            )}

                            {user.lastName?.charAt(
                              0,
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {
                                user.firstName
                              }{" "}
                              {
                                user.lastName
                              }
                            </p>

                            <p className="text-xs text-slate-500">
                              User Account
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                          {user.role}
                        </span>
                      </td>

                      {/* Employee */}
                      <td className="px-6 py-4">
                        {user.employee ? (
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {
                                user
                                  .employee
                                  .firstName
                              }{" "}
                              {
                                user
                                  .employee
                                  .lastName
                              }
                            </p>

                            <p className="text-xs text-slate-500">
                              {
                                user
                                  .employee
                                  .designation
                              }
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                            user.status ===
                            "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {
                            user.status
                          }
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* Edit */}
                          <button
                            type="button"
                            title="Edit User"
                            onClick={() =>
                              navigate(
                                `/users/${user._id}/edit`,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Edit
                              size={16}
                            />
                          </button>

                          {/* Activate / Deactivate */}
                          <button
                            type="button"
                            title={
                              user.status ===
                              "active"
                                ? "Deactivate User"
                                : "Activate User"
                            }
                            onClick={() =>
                              handleToggleStatus(
                                user,
                              )
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                              user.status ===
                              "active"
                                ? "border-red-200 text-red-500 hover:bg-red-50"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {user.status ===
                            "active" ? (
                              <UserX
                                size={
                                  16
                                }
                              />
                            ) : (
                              <UserCheck
                                size={
                                  16
                                }
                              />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;