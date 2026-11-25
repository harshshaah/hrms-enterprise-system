import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FileText,
  Eye,
  Upload,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getDocumentsByEmployee,
  uploadDocument,
  deactivateDocument,
} from "../services/documentService";

const DOCUMENT_TYPES = [
  {
    value: "aadhaar",
    label: "Aadhaar",
  },
  {
    value: "pan",
    label: "PAN Card",
  },
  {
    value: "resume",
    label: "Resume",
  },
  {
    value: "offer_letter",
    label: "Offer Letter",
  },
  {
    value: "joining_letter",
    label: "Joining Letter",
  },
  {
    value: "experience_letter",
    label: "Experience Letter",
  },
  {
    value: "salary_slip",
    label: "Salary Slip",
  },
  {
    value: "other",
    label: "Other",
  },
];

function EmployeeDocuments({
  employeeId,
}) {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showUploadForm, setShowUploadForm] =
    useState(false);

  const [formData, setFormData] =
    useState({
      documentType: "aadhaar",
      documentName: "",
      file: null,
    });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getDocumentsByEmployee(
          employeeId,
        );

      setDocuments(
        response?.data || [],
      );
    } catch (error) {
      setError(
        error.message ||
          "Failed to fetch documents",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchDocuments();
    }
  }, [employeeId]);

  const handleInputChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setError(
        "Only PDF, JPG and PNG files are allowed",
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "File size must be less than 5 MB",
      );

      event.target.value = "";

      return;
    }

    setError("");

    setFormData((previous) => ({
      ...previous,
      file,
    }));
  };

  const handleUpload = async (
    event,
  ) => {
    event.preventDefault();

    if (!formData.file) {
      setError(
        "Please select a document file",
      );

      return;
    }

    if (
      !formData.documentName.trim()
    ) {
      setError(
        "Document name is required",
      );

      return;
    }

    try {
      setUploading(true);
      setError("");

      await uploadDocument({
        employeeId,

        documentType:
          formData.documentType,

        documentName:
          formData.documentName.trim(),

        file: formData.file,
      });

      setFormData({
        documentType: "aadhaar",
        documentName: "",
        file: null,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      setShowUploadForm(false);

      await fetchDocuments();
    } catch (error) {
      setError(
        error.message ||
          "Document upload failed",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeactivate = async (
    id,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this document?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deactivateDocument(
        id,
      );

      await fetchDocuments();
    } catch (error) {
      setError(
        error.message ||
          "Failed to delete document",
      );
    }
  };

  const getDocumentTypeLabel = (
    type,
  ) => {
    const documentType =
      DOCUMENT_TYPES.find(
        (item) =>
          item.value === type,
      );

    return (
      documentType?.label ||
      type
    );
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

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Employee Documents
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage employee documents
            and files
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDocuments}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              setShowUploadForm(
                true,
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Upload
              size={16}
            />

            Upload Document
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Upload New Document
            </h3>

            <button
              type="button"
              onClick={() =>
                setShowUploadForm(
                  false,
                )
              }
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={
              handleUpload
            }
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Document Type
              </label>

              <select
                name="documentType"
                value={
                  formData.documentType
                }
                onChange={
                  handleInputChange
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
              >
                {DOCUMENT_TYPES.map(
                  (item) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Document Name
              </label>

              <input
                type="text"
                name="documentName"
                value={
                  formData.documentName
                }
                onChange={
                  handleInputChange
                }
                placeholder="e.g. Aadhaar Card"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                File
              </label>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={
                  handleFileChange
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                PDF, JPG or PNG. Maximum
                file size: 5 MB.
              </p>
            </div>

            <div className="flex justify-end gap-2 md:col-span-2">
              <button
                type="button"
                onClick={() =>
                  setShowUploadForm(
                    false,
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading
                  ? "Uploading..."
                  : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            Loading documents...
          </div>
        ) : documents.length ===
          0 ? (
          <div className="px-6 py-12 text-center">
            <FileText
              size={40}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm font-medium text-gray-700">
              No documents found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Upload the first document
              for this employee.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Document
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Type
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Uploaded By
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </th>

                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {documents.map(
                (document) => (
                  <tr
                    key={
                      document._id
                    }
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                          <FileText
                            size={18}
                            className="text-gray-600"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {
                              document.documentName
                            }
                          </p>

                          <p className="max-w-[250px] truncate text-xs text-gray-500">
                            {
                              document.fileName
                            }
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {getDocumentTypeLabel(
                        document.documentType,
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {
                        document.uploadedBy
                      }
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(
                        document.createdAt,
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          document.status ===
                          "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {
                          document.status
                        }
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={
                            document.fileUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Eye
                            size={14}
                          />

                          View
                        </a>

                        {document.status ===
                          "active" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeactivate(
                                document._id,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2
                              size={14}
                            />

                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EmployeeDocuments;