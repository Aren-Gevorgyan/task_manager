import { useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, getTasks, updateTask } from "../../api/client";
import EventLogPanel from "../EventLogPanel";
import LoginForm from "../LoginForm";
import TaskForm from "../TaskForm";
import TaskTable from "../TaskTable";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useEventLog } from "../../hooks/useEventLog";
import { useWebSocketFeed } from "../../hooks/useWebSocketFeed";
import styles from "./styles.module.scss";

const defaultTaskInput = {
  title: "",
  assignee: "",
  dueDate: "",
};

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [taskInput, setTaskInput] = useState(defaultTaskInput);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const { eventLog, appendEvent } = useEventLog();

  const handleSessionReset = useCallback(() => {
    setTasks([]);
    setTaskError("");
    setTaskInput(defaultTaskInput);
  }, []);

  const { token, authError, handleLogin, handleLogout, handleAuthFailure } = useAuthSession({
    appendEvent,
    onSessionReset: handleSessionReset,
  });

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

  useWebSocketFeed({
    token,
    appendEvent,
    loadTasks,
    filter,
  });

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
