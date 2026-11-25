import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  RefreshCw,
  Save,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getDocumentById,
  updateDocument,
} from "../services/documentService";

function EditDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      documentType: "",
      documentName: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getDocumentById(id);

      const document =
        response?.data;

      if (!document) {
        throw new Error(
          "Document not found",
        );
      }

      setFormData({
        documentType:
          document.documentType || "",
        documentName:
          document.documentName || "",
      });
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

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    if (
      !formData.documentType.trim()
    ) {
      setError(
        "Document type is required.",
      );
      return;
    }

    if (
      !formData.documentName.trim()
    ) {
      setError(
        "Document name is required.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateDocument(id, {
        documentType:
          formData.documentType.trim(),
        documentName:
          formData.documentName.trim(),
      });

      navigate(
        `/documents/${id}`,
      );
    } catch (error) {
      setError(
        error?.message ||
          "Failed to update document",
      );
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/documents/${id}`,
            )
          }
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Document
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update document information.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Document Type
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Document Name
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/documents/${id}`,
              )
            }
            disabled={saving}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditDocument;