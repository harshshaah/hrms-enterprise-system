import {
  ArrowLeft,
  Upload,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  createEmployee,
  getDepartmentsForEmployee,
} from "../services/employeeService";

import { createUser } from "../services/userService";

function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    department: "",
    designation: "",
    joiningDate: "",
    salary: "",
    createLoginAccount: false,
    loginPassword: "",
    confirmPassword: "",
  });

  const [departments, setDepartments] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // LOAD DEPARTMENTS
  // ==========================================

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setIsLoadingDepartments(true);

        const data = await getDepartmentsForEmployee();

        setDepartments(data);
      } catch (error) {
        console.error("Fetch Departments Error:", error);

        alert(
          error?.message || "Failed to load departments."
        );
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (name === "createLoginAccount" && !checked) {
      setErrors((previous) => ({
        ...previous,
        loginPassword: "",
        confirmPassword: "",
      }));
    }
  };

  // ==========================================
  // HANDLE PHOTO
  // ==========================================

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        profilePhoto: "Please select a valid image file.",
      }));

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        profilePhoto: "Image size must be less than 5MB.",
      }));

      return;
    }

    setProfilePhoto(file);

    setErrors((previous) => ({
      ...previous,
      profilePhoto: "",
    }));
  };

  // ==========================================
  // REMOVE PHOTO
  // ==========================================

  const removePhoto = () => {
    setProfilePhoto(null);
  };

  // ==========================================
  // VALIDATE FORM
  // ==========================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required.";
    }

    if (!formData.department) {
      newErrors.department = "Department is required.";
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required.";
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = "Joining date is required.";
    }

    if (!formData.salary) {
      newErrors.salary = "Salary is required.";
    } else if (Number(formData.salary) <= 0) {
      newErrors.salary = "Salary must be greater than 0.";
    }

    // Login account validation
    if (formData.createLoginAccount) {
      if (!formData.loginPassword) {
        newErrors.loginPassword = "Login password is required.";
      } else if (formData.loginPassword.length < 6) {
        newErrors.loginPassword =
          "Password must be at least 6 characters.";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword =
          "Please confirm the password.";
      } else if (
        formData.loginPassword !== formData.confirmPassword
      ) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // ========================================
      // EMPLOYEE DATA
      // ========================================

      const employeeData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        department: formData.department,
        designation: formData.designation.trim(),
        joiningDate: formData.joiningDate,
        salary: Number(formData.salary),
      };

      // ========================================
      // CREATE EMPLOYEE
      // ========================================

      const employeeResponse = await createEmployee(employeeData);

      const employee =
        employeeResponse?.data || employeeResponse;

      const employeeId =
        employee?._id || employee?.id;

      if (!employeeId) {
        throw new Error(
          "Employee was created, but employee ID was not returned."
        );
      }

      // ========================================
      // CREATE LOGIN ACCOUNT
      // ========================================

      if (formData.createLoginAccount) {
        const userData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.loginPassword,
          role: "employee",
          status: "active",
          employee: employeeId,
        };

        await createUser(userData);
      }

      // ========================================
      // SUCCESS
      // ========================================

      alert(
        formData.createLoginAccount
          ? "Employee and login account created successfully."
          : "Employee created successfully."
      );

      navigate("/employees");
    } catch (error) {
      console.error("Create Employee Error:", error);

      const errorMessage =
        error?.message || "Failed to create employee.";

      if (errorMessage.toLowerCase().includes("email")) {
        setErrors((previous) => ({
          ...previous,
          email: errorMessage,
        }));
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/employees")}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Add Employee
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add a new employee to your organization.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Personal Information */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Basic information about the employee.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* First Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                First Name{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
                  errors.firstName
                    ? "border-red-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />

              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Last Name{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
                  errors.lastName
                    ? "border-red-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />

              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Date of Birth */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date of Birth
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>

            {/* Gender */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Gender{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-600 outline-none ${
                  errors.gender
                    ? "border-red-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              {errors.gender && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.gender}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Contact Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Employee contact and address details.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="employee@example.com"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
                  errors.email
                    ? "border-red-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />

              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                maxLength="10"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
                  errors.phone
                    ? "border-red-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />

              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Address */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                placeholder="Enter complete address"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>

            {/* City */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>

            {/* State */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                State
              </label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Job Information */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Job Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Employee role and employment details.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Department */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Department{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={isLoadingDepartments}
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-600 outline-none ${
                  errors.department
                    ? "border-red-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              >
                <option value="">
                  {isLoadingDepartments
                    ? "Loading departments..."
                    : "Select department"}
                </option>

                {departments.map((department) => (
                  <option
                    key={department._id}
                    value={department._id}
                  >
                    {department.name}
                  </option>
                ))}
              </select>

              {errors.department && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.department}
                </p>
              )}
            </div>

            {/* Designation */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Designation{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Software Developer"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
                  errors.designation
                    ? "border-red-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />

              {errors.designation && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.designation}
                </p>
              )}
            </div>

            {/* Joining Date */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Joining Date{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
                  errors.joiningDate
                    ? "border-red-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />

              {errors.joiningDate && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.joiningDate}
                </p>
              )}
            </div>

            {/* Salary */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Annual Salary{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter annual salary"
                min="0"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
                  errors.salary
                    ? "border-red-400"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />

              {errors.salary && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.salary}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Login Account */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Login Account
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Optionally create a login account for this employee.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="createLoginAccount"
              checked={formData.createLoginAccount}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />

            <div>
              <p className="text-sm font-medium text-slate-800">
                Create login account
              </p>

              <p className="mt-1 text-xs text-slate-500">
                The employee will be able to login using
                the email address entered above.
              </p>
            </div>
          </label>

          {formData.createLoginAccount && (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {/* Password */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Login Password{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="password"
                  name="loginPassword"
                  value={formData.loginPassword}
                  onChange={handleChange}
                  placeholder="Enter login password"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
                    errors.loginPassword
                      ? "border-red-400"
                      : "border-slate-200 focus:border-slate-400"
                  }`}
                />

                {errors.loginPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.loginPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm Password{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm login password"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-slate-200 focus:border-slate-400"
                  }`}
                />

                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Photo */}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Profile Photo
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload employee profile photo.
            </p>
          </div>

          {profilePhoto ? (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                  <img
                    src={URL.createObjectURL(profilePhoto)}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {profilePhoto.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {(profilePhoto.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={removePhoto}
                className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-10 hover:bg-slate-50">
              <Upload size={28} className="text-slate-400" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                Click to upload
              </p>

              <p className="mt-1 text-xs text-slate-400">
                PNG, JPG or JPEG up to 5MB
              </p>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}

          {errors.profilePhoto && (
            <p className="mt-2 text-xs text-red-500">
              {errors.profilePhoto}
            </p>
          )}
        </div>

        {/* Actions */}

        <div className="flex justify-end gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isLoadingDepartments}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEmployee;