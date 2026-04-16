import { useCallback, useEffect, useState } from "react";
import { loginRequest, createTask, deleteTask, getTasks, updateTask } from "../../api/client";
import EventLogPanel from "../EventLogPanel";
import LoginForm from "../LoginForm";
import TaskForm from "../TaskForm";
import TaskTable from "../TaskTable";
import styles from "./styles.module.scss";

const defaultTaskInput = {
  title: "",
  assignee: "",
  dueDate: "",
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [taskInput, setTaskInput] = useState(defaultTaskInput);
  const [eventLog, setEventLog] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const appendEvent = (entry) => {
    setEventLog((current) => [
      { id: `${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString(), ...entry },
      ...current,
    ]);
  };

  const loadTasks = useCallback(async (statusFilter = filter) => {
    setIsLoadingTasks(true);
    setTaskError("");
    try {
      const fetchedTasks = await getTasks(statusFilter);
      setTasks(fetchedTasks);
    } catch (error) {
      setTaskError(error.message || "Failed to fetch tasks");
    } finally {
      setIsLoadingTasks(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTasks(filter);
  }, [filter, loadTasks]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const ws = new WebSocket(`ws://localhost:3000?token=${encodeURIComponent(token)}`);

    ws.onmessage = (messageEvent) => {
      try {
        const parsed = JSON.parse(messageEvent.data);
        appendEvent({
          type: parsed.event,
          payload: parsed.payload,
        });

        if (parsed.event === "task_updated" || parsed.event === "webhook_received") {
          loadTasks(filter);
        }
      } catch (error) {
        appendEvent({
          type: "parse_error",
          payload: error ? { message: error.message } : { message: "Received malformed websocket message" },
        });
      }
    };

    ws.onerror = () => {
      appendEvent({
        type: "ws_error",
        payload: { message: "WebSocket connection error" },
      });
    };

    return () => {
      ws.close();
    };
  }, [token, filter, loadTasks]);

  const handleLogin = async (credentials) => {
    setAuthError("");
    try {
      const response = await loginRequest(credentials);
      setToken(response.token);
      localStorage.setItem("token", response.token);
      appendEvent({ type: "login_success", payload: { username: credentials.username } });
    } catch (error) {
      setAuthError(error.message || "Login failed");
    }
  };

  const handleLogout = () => {
    setToken("");
    setTasks([]);
    setTaskError("");
    localStorage.removeItem("token");
  };

  const handleAuthFailure = (error, fallbackMessage) => {
    const message = error?.message || fallbackMessage;
    if (message === "Invalid auth token") {
      handleLogout();
      setAuthError("Session expired. Please login again.");
      appendEvent({
        type: "auth_expired",
        payload: { message: "Signed out automatically due to invalid auth token" },
      });
      return true;
    }

    return false;
  };

  const handleTaskInputChange = (field, value) => {
    setTaskInput((current) => ({ ...current, [field]: value }));
  };

  const handleCreateTask = async () => {
    setTaskError("");
    setIsSubmittingTask(true);
    try {
      await createTask(taskInput, token);
      setTaskInput(defaultTaskInput);
      await loadTasks(filter);
    } catch (error) {
      if (handleAuthFailure(error, "Failed to create task")) {
        return;
      }
      setTaskError(error.message || "Failed to create task");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    setTaskError("");
    try {
      await updateTask(taskId, updates, token);
      await loadTasks(filter);
    } catch (error) {
      if (handleAuthFailure(error, "Failed to update task")) {
        return;
      }
      setTaskError(error.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    setTaskError("");
    try {
      await deleteTask(taskId, token);
      await loadTasks(filter);
    } catch (error) {
      if (handleAuthFailure(error, "Failed to delete task")) {
        return;
      }
      setTaskError(error.message || "Failed to delete task");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <header className={styles.header}>
          <h1>Task Manager Admin</h1>
          {token ? (
            <button type="button" onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          ) : null}
        </header>

        <LoginForm onLogin={handleLogin} isLoggedIn={Boolean(token)} error={authError} />

        <TaskForm
          token={token}
          taskInput={taskInput}
          onTaskInputChange={handleTaskInputChange}
          onCreateTask={handleCreateTask}
          isSubmitting={isSubmittingTask}
        />

        <TaskTable
          token={token}
          tasks={tasks}
          filter={filter}
          onFilterChange={setFilter}
          onTaskUpdate={handleTaskUpdate}
          onDeleteTask={handleDeleteTask}
          isLoading={isLoadingTasks}
          error={taskError}
        />
      </section>

      <EventLogPanel entries={eventLog} />
    </main>
  );
};

export default App;
