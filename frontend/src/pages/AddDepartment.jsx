import { useState } from "react";
import {
  ArrowLeft,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createDepartment } from "../services/departmentService";

function AddDepartment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    headOfDepartment: "",
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "code"
          ? value.toUpperCase()
          : value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError(
        "Department name is required.",
      );
      return;
    }

    if (!formData.code.trim()) {
      setError(
        "Department code is required.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await createDepartment({
        name: formData.name.trim(),
        code: formData.code.trim(),
        description:
          formData.description.trim(),
        headOfDepartment:
          formData.headOfDepartment.trim(),
      });

      navigate("/departments");
    } catch (error) {
      console.error(
        "Create Department Error:",
        error,
      );

      setError(
        error?.message ||
          "Failed to create department.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            navigate("/departments")
          }
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Add Department
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new department for your organization
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Building2
                size={20}
                className="text-slate-600"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Department Information
              </h2>

              <p className="text-xs text-slate-500">
                Enter the basic department details
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {/* Name + Code */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Department Name
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Human Resources"
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Department Code
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. HR"
                maxLength={20}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm uppercase outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              maxLength={500}
              placeholder="Enter department description..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Head */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Head of Department
            </label>

            <input
              type="text"
              name="headOfDepartment"
              value={
                formData.headOfDepartment
              }
              onChange={handleChange}
              placeholder="Enter department head name"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() =>
                navigate("/departments")
              }
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Creating..."
                : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDepartment;