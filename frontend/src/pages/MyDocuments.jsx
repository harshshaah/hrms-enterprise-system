import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, FileText, Download, Eye } from "lucide-react";
import { getDocumentsByEmployee } from "../services/documentService";
import { useAuth } from "../context/AuthContext";

function MyDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.employee) {
        throw new Error("Employee profile not found.");
      }

      const response = await getDocumentsByEmployee(user.employee);
      setDocuments(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch personal documents:", err);
      setError(err?.message || "Failed to load your documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDocuments();
  }, [user]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Access your important personal and professional documents.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMyDocuments}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Documents Found</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have any uploaded documents yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => (
            <div
              key={doc._id || doc.id}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={24} />
                </div>
                
                <h3 className="text-base font-semibold text-gray-900 line-clamp-1" title={doc.documentName}>
                  {doc.documentName}
                </h3>
                
                <p className="mt-1 text-sm font-medium capitalize text-gray-500">
                  {doc.documentType?.replace("-", " ")}
                </p>
                
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
                  <span>Uploaded: {formatDate(doc.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50 p-4">
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    <Eye size={16} />
                    View
                  </a>
                )}
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    download={doc.fileName || doc.documentName}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    <Download size={16} />
                    Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDocuments;
