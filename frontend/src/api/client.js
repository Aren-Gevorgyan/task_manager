const API_BASE_URL = "http://localhost:3000";

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const withAuth = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const loginRequest = async ({ username, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return parseResponse(response);
};

export const getTasks = async (status) => {
  const query = status && status !== "all" ? `?status=${status}` : "";
  const response = await fetch(`${API_BASE_URL}/tasks${query}`);
  return parseResponse(response);
};

export const createTask = async ({ title, assignee, dueDate }, token) => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify({
      title,
      assignee,
      dueDate: dueDate || null,
    }),
  });
  return parseResponse(response);
};

export const updateTask = async (taskId, updates, token) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: withAuth(token),
    body: JSON.stringify(updates),
  });
  return parseResponse(response);
};

export const deleteTask = async (taskId, token) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: withAuth(token),
  });
  return parseResponse(response);
};
