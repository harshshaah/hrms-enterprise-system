import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  RotateCcw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getDocuments,
  activateDocument,
  deactivateDocument,
} from "../services/documentService";

function Documents() {
  const navigate = useNavigate();

  const [documents, setDocuments] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getDocuments();

      setDocuments(
        response?.data || [],
      );
    } catch (error) {
      setError(
        error?.message ||
          "Failed to fetch documents",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (!search) {
        return documents;
      }

      return documents.filter(
        (document) =>
          document.employeeId
            ?.toLowerCase()
            .includes(search) ||
          document.documentName
            ?.toLowerCase()
            .includes(search) ||
          document.documentType
            ?.toLowerCase()
            .includes(search) ||
          document.fileName
            ?.toLowerCase()
            .includes(search) ||
          document.uploadedBy
            ?.toLowerCase()
            .includes(search),
      );
    }, [
      documents,
      searchTerm,
    ]);

  const handleDeactivate =
    async (id) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to deactivate this document?",
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(id);

        await deactivateDocument(id);

        await fetchDocuments();
      } catch (error) {
        setError(
          error?.message ||
            "Failed to deactivate document",
        );
      } finally {
        setActionLoading(null);
      }
    };

  const handleActivate =
    async (id) => {
      try {
        setActionLoading(id);

        await activateDocument(id);

        await fetchDocuments();
      } catch (error) {
        setError(
          error?.message ||
            "Failed to activate document",
        );
      } finally {
        setActionLoading(null);
      }
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

  const getStatusClass = (
    status,
  ) => {
    if (
      status === "active"
    ) {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    }

    return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Documents
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage employee documents
            and uploaded files.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/documents/add",
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Upload Document
        </button>
      </div>

      {/* Search / Refresh */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search by employee ID, document name, type, file name or uploader..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <button
            type="button"
            onClick={
              fetchDocuments
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Documents
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {documents.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Documents
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {
                documents.filter(
                  (document) =>
                    document.status ===
                    "active",
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Inactive Documents
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-500">
              {
                documents.filter(
                  (document) =>
                    document.status ===
                    "inactive",
                ).length
              }
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <RefreshCw
                size={20}
                className="animate-spin"
              />

              Loading documents...
            </div>
          </div>
        ) : filteredDocuments.length ===
          0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <FileText
                size={26}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No documents found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {searchTerm
                ? "No documents match your search."
                : "No employee documents have been uploaded yet."}
            </p>

            {!searchTerm && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/documents/add",
                  )
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employee
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Document
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    File
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Uploaded By
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Uploaded Date
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map(
                  (document) => (
                    <tr
                      key={
                        document._id
                      }
                      className="transition hover:bg-slate-50"
                    >
                      {/* Employee */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                            <FileText
                              size={18}
                              className="text-slate-500"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {
                                document.employeeId
                              }
                            </p>

                            <p className="text-xs text-slate-500">
                              Employee ID
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Document */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {
                              document.documentName
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {
                              document.documentType
                            }
                          </p>
                        </div>
                      </td>

                      {/* File */}
                      <td className="px-5 py-4">
                        <p
                          className="max-w-[220px] truncate text-sm text-slate-700"
                          title={
                            document.fileName
                          }
                        >
                          {
                            document.fileName
                          }
                        </p>
                      </td>

                      {/* Uploaded By */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {
                            document.uploadedBy
                          }
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {formatDate(
                            document.createdAt,
                          )}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                            document.status,
                          )}`}
                        >
                          {
                            document.status
                          }
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="View document"
                            onClick={() =>
                              navigate(
                                `/documents/${document._id}`,
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            title="Edit document"
                            onClick={() =>
                              navigate(
                                `/documents/${document._id}/edit`,
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Pencil
                              size={17}
                            />
                          </button>

                          {document.status ===
                          "active" ? (
                            <button
                              type="button"
                              title="Deactivate document"
                              onClick={() =>
                                handleDeactivate(
                                  document._id,
                                )
                              }
                              disabled={
                                actionLoading ===
                                document._id
                              }
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Activate document"
                              onClick={() =>
                                handleActivate(
                                  document._id,
                                )
                              }
                              disabled={
                                actionLoading ===
                                document._id
                              }
                              className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <RotateCcw
                                size={17}
                              />
                            </button>
                          )}
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

      {/* Result count */}
      {!loading &&
        filteredDocuments.length >
          0 && (
          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {
                filteredDocuments.length
              }
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {documents.length}
            </span>{" "}
            documents
          </div>
        )}
    </div>
  );
}

export default Documents;