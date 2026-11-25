import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, Globe, Lock, Mail, Phone, ShieldCheck, Sparkles, User } from "lucide-react";
import { registerCompany } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function RegisterCompany() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    companyName: "",
    companySlug: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    employeeCountRange: "1-10",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompanyNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    setFormData((prev) => ({
      ...prev,
      companyName: name,
      companySlug: slug,
    }));
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.companySlug || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await registerCompany(formData);
      if (response?.data) {
        login(response.data);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err?.message || "Failed to register company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Building2 size={26} />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Launch Your Company HR Workspace
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" /> Company Details
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleCompanyNameChange}
                    placeholder="e.g. Acme Technologies"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Workspace URL Slug *
                  </label>
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <span className="inline-flex items-center px-2.5 bg-gray-50 text-gray-500 text-xs border-r border-gray-200">
                      app.hrms/
                    </span>
                    <input
                      type="text"
                      required
                      name="companySlug"
                      value={formData.companySlug}
                      onChange={handleChange}
                      placeholder="acme"
                      className="w-full px-3 py-2 text-sm border-0 focus:ring-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@company.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Team Size
                  </label>
                  <select
                    name="employeeCountRange"
                    value={formData.employeeCountRange}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="1-10">1 - 10 Employees</option>
                    <option value="11-50">11 - 50 Employees</option>
                    <option value="51-200">51 - 200 Employees</option>
                    <option value="200+">200+ Enterprise</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" /> Super-Admin Account Details
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Admin Password * (Min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-4">
              <div className="flex items-start gap-3">
                <Sparkles size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <p className="font-semibold">Included in your 14-day Free Trial:</p>
                  <ul className="mt-1 list-disc list-inside space-y-0.5 text-blue-800">
                    <li>Unlimited Departments, Attendance, Leaves & Payroll</li>
                    <li>PDF & Excel Instant Report Generation</li>
                    <li>Secure Cloudinary document vault for compliance files</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Setting up your workspace..." : "Create Workspace & Start Free Trial"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterCompany;

