import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  FileText,
  Upload,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getEmployees,
} from "../services/employeeService";

import {
  uploadDocument,
} from "../services/documentService";

function AddDocument() {
  const navigate = useNavigate();

  const [employees, setEmployees] =
    useState([]);

  const [formData, setFormData] =
    useState({
      employeeId: "",
      documentType: "",
      documentName: "",
    });

  const [file, setFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [employeesLoading, setEmployeesLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [fileError, setFileError] =
    useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);

        const response =
          await getEmployees();

        setEmployees(
          response?.data || [],
        );
      } catch (error) {
        setError(
          error?.message ||
            "Failed to fetch employees",
        );
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );

    setError("");
  };

  const handleFileChange = (
    event,
  ) => {
    const selectedFile =
      event.target.files?.[0];

    setFileError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type,
      )
    ) {
      setFile(null);
      setFileError(
        "Only PDF, JPG and PNG files are allowed.",
      );
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      selectedFile.size >
      maxSize
    ) {
      setFile(null);
      setFileError(
        "File size must be less than 5 MB.",
      );
      return;
    }

    setFile(
      selectedFile,
    );
  };

  const removeFile = () => {
    setFile(null);
    setFileError("");

    const fileInput =
      document.getElementById(
        "document-file",
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setError("");

    if (
      !formData.employeeId
    ) {
      setError(
        "Please select an employee.",
      );
      return;
    }

    if (
      !formData.documentType.trim()
    ) {
      setError(
        "Please enter document type.",
      );
      return;
    }

    if (
      !formData.documentName.trim()
    ) {
      setError(
        "Please enter document name.",
      );
      return;
    }

    if (!file) {
      setFileError(
        "Please select a document file.",
      );
      return;
    }

    try {
      setLoading(true);

      await uploadDocument({
        employeeId:
          formData.employeeId,
        documentType:
          formData.documentType.trim(),
        documentName:
          formData.documentName.trim(),
        file,
      });

      navigate("/documents");
    } catch (error) {
      setError(
        error?.message ||
          "Failed to upload document.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate("/documents")
          }
          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft
            size={20}
          />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Upload Document
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Upload and assign a document
            to an employee.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <FileText
                size={20}
                className="text-slate-600"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Document Information
              </h2>

              <p className="text-sm text-slate-500">
                Enter the document details.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Employee */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Employee
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                name="employeeId"
                value={
                  formData.employeeId
                }
                onChange={
                  handleChange
                }
                disabled={
                  employeesLoading
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  {employeesLoading
                    ? "Loading employees..."
                    : "Select employee"}
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
                      {employee.firstName}{" "}
                      {employee.lastName}{" "}
                      {employee.employeeId
                        ? `(${employee.employeeId})`
                        : ""}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Document Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Document Type
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="text"
                name="documentType"
                value={
                  formData.documentType
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Aadhaar Card, Resume, Offer Letter"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Document Name */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Document Name
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="text"
                name="documentName"
                value={
                  formData.documentName
                }
                onChange={
                  handleChange
                }
                placeholder="Enter document name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-900">
              Upload File
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Supported formats: PDF, JPG and
              PNG. Maximum size: 5 MB.
            </p>
          </div>

          {file ? (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                  <FileText
                    size={20}
                    className="text-slate-500"
                  />
                </div>

                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium text-slate-900"
                    title={
                      file.name
                    }
                  >
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  removeFile
                }
                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="document-file"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Upload
                  size={22}
                  className="text-slate-500"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-900">
                Click to upload a document
              </p>

              <p className="mt-1 text-xs text-slate-500">
                PDF, JPG or PNG up to 5 MB
              </p>

              <input
                id="document-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={
                  handleFileChange
                }
                className="hidden"
              />
            </label>
          )}

          {fileError && (
            <p className="mt-3 text-sm text-red-600">
              {fileError}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate("/documents")
            }
            disabled={loading}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}

            {loading
              ? "Uploading..."
              : "Upload Document"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddDocument;