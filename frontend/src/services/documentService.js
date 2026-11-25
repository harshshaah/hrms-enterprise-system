import apiRequest from "./api";

const API_BASE_URL =
  "http://localhost:5002/api/v1";

const getToken = () => {
  return localStorage.getItem(
    "hrms_access_token",
  );
};

export const getDocuments = async () => {
  return apiRequest("/documents");
};

export const getDocumentsByEmployee = async (
  employeeId,
) => {
  return apiRequest(
    `/documents/employee/${employeeId}`,
  );
};

export const getDocumentById = async (
  id,
) => {
  return apiRequest(
    `/documents/${id}`,
  );
};

export const uploadDocument = async ({
  employeeId,
  documentType,
  documentName,
  file,
}) => {
  const formData = new FormData();

  formData.append(
    "employeeId",
    employeeId,
  );

  formData.append(
    "documentType",
    documentType,
  );

  formData.append(
    "documentName",
    documentName,
  );

  formData.append(
    "file",
    file,
  );

  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/documents/upload`,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      body: formData,
    },
  );

  const data =
    await response.json();

  if (response.status === 401) {
    localStorage.removeItem(
      "hrms_access_token",
    );

    localStorage.removeItem(
      "hrms_user",
    );

    window.location.href =
      "/login";

    throw new Error(
      "Session expired. Please login again.",
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Document upload failed",
    );
  }

  return data;
};

export const updateDocument = async (
  id,
  documentData,
) => {
  return apiRequest(
    `/documents/${id}`,
    {
      method: "PATCH",

      body: JSON.stringify(
        documentData,
      ),
    },
  );
};

export const activateDocument = async (
  id,
) => {
  return apiRequest(
    `/documents/${id}/activate`,
    {
      method: "PATCH",
    },
  );
};

export const deactivateDocument = async (
  id,
) => {
  return apiRequest(
    `/documents/${id}`,
    {
      method: "DELETE",
    },
  );
};