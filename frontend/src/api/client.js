import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

const toErrorMessage = (error, fallbackMessage = "Request failed") => {
  const messageFromServer = error?.response?.data?.message;
  const messageFromAxios = error?.message;
  return messageFromServer || messageFromAxios || fallbackMessage;
};

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export const loginRequest = async ({ username, password }) => {
  try {
    const response = await client.post("/auth/login", { username, password });
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Login failed"));
  }
};

export const getTasks = async (status) => {
  try {
    const response = await client.get("/tasks", {
      params: status && status !== "all" ? { status } : {},
    });
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Failed to fetch tasks"));
  }
};

export const createTask = async ({ title, assignee, dueDate }, token) => {
  try {
    const response = await client.post(
      "/tasks",
      { title, assignee, dueDate: dueDate || null },
      { headers: authHeaders(token) },
    );
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Failed to create task"));
  }
};

export const updateTask = async (taskId, updates, token) => {
  try {
    const response = await client.patch(`/tasks/${taskId}`, updates, { headers: authHeaders(token) });
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Failed to update task"));
  }
};

export const deleteTask = async (taskId, token) => {
  try {
    await client.delete(`/tasks/${taskId}`, { headers: authHeaders(token) });
    return null;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Failed to delete task"));
  }
};

export const simulatePaymentWebhook = async ({ taskId, status }, token) => {
  try {
    const response = await client.post(
      "/webhooks/payment/simulate",
      { taskId, status },
      { headers: authHeaders(token) },
    );
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Failed to simulate payment webhook"));
  }
};

export const registerCallback = async ({ url }, token) => {
  try {
    const response = await client.post(
      "/callbacks/register",
      { url, event: "task.completed" },
      { headers: authHeaders(token) },
    );
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, "Failed to register callback"));
  }
};
