import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Download,
  FileText,
  Pencil,
  RefreshCw,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getDocumentById,
} from "../services/documentService";

function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getDocumentById(id);

      setDocument(
        response?.data || null,
      );
    } catch (error) {
      setError(
        error?.message ||
          "Failed to fetch document",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCw
            size={20}
            className="animate-spin"
          />
          Loading document...
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate("/documents")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Documents
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error ||
            "Document not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/documents")
            }
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Document Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View uploaded document
              information.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/documents/${id}/edit`,
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Pencil size={17} />
          Edit Document
        </button>
      </div>

      {/* Document Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <FileText
              size={30}
              className="text-slate-500"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900">
              {document.documentName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {document.fileName}
            </p>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Document Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Employee ID
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {document.employeeId}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Document Type
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {document.documentType}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Document Name
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {document.documentName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              File Name
            </p>
            <p className="mt-1 break-all text-sm font-medium text-slate-900">
              {document.fileName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Uploaded By
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {document.uploadedBy}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Uploaded Date
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(
                document.createdAt,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Last Updated
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(
                document.updatedAt,
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </p>

            <span
              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                document.status ===
                "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {document.status}
            </span>
          </div>
        </div>
      </div>

      {/* File */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Uploaded File
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Open or download the uploaded
              document.
            </p>
          </div>

          <a
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Download size={17} />
            Open File
          </a>
        </div>
      </div>
    </div>
  );
}

export default DocumentDetails;