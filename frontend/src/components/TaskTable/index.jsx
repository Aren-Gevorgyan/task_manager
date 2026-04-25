import { useState } from "react";
import styles from "./styles.module.scss";

const statusOptions = ["pending", "done", "cancelled"];

const TaskTable = ({
  token,
  tasks,
  filter,
  onFilterChange,
  onTaskUpdate,
  onDeleteTask,
  isLoading,
  error,
}) => {
  const [drafts, setDrafts] = useState({});

  const handleDraftChange = (taskId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [taskId]: {
        ...current[taskId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (taskId) => {
    const task = tasks.find((item) => item._id === taskId);
    if (!task) {
      return;
    }

    const draft = drafts[taskId] || {};
    const resolvedDraft = {
      title: draft.title ?? task.title ?? "",
      assignee: draft.assignee ?? task.assignee ?? "",
      dueDate:
        draft.dueDate ?? (task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""),
      status: draft.status ?? task.status,
    };

    const originalDueDate = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "";
    const hasChanges =
      resolvedDraft.title !== (task.title ?? "") ||
      resolvedDraft.assignee !== (task.assignee ?? "") ||
      resolvedDraft.dueDate !== originalDueDate ||
      resolvedDraft.status !== task.status;

    if (!hasChanges) {
      return;
    }

    await onTaskUpdate(taskId, {
      title: resolvedDraft.title,
      assignee: resolvedDraft.assignee,
      dueDate: resolvedDraft.dueDate || null,
      status: resolvedDraft.status,
    });

    setDrafts((current) => {
      const next = { ...current };
      delete next[taskId];
      return next;
    });
  };

  return (
    <section className={styles.wrapper} aria-label="Task list section">
      <div className={styles.header}>
        <h2>Tasks</h2>
        <label className={styles.filterLabel}>
          Filter
          <select
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
            className={styles.select}
            aria-label="Filter tasks by status"
          >
            <option value="all">All</option>
            {statusOptions.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? <p>Loading tasks...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      {!isLoading && !tasks.length ? <p>No tasks found.</p> : null}

      {tasks.length ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Due date</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map((task) => (
                <tr key={task._id}>
                  {(() => {
                    const draft = drafts[task._id] || {};
                    const title = draft.title ?? task.title ?? "";
                    const status = draft.status ?? task.status;
                    const assignee = draft.assignee ?? task.assignee ?? "";
                    const dueDate =
                      draft.dueDate ??
                      (task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
                    const hasChanges =
                      title !== (task.title ?? "") ||
                      assignee !== (task.assignee ?? "") ||
                      dueDate !== (task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "") ||
                      status !== task.status;

                    return (
                      <>
                  <td>
                    <input
                      value={title}
                      onChange={(event) => handleDraftChange(task._id, "title", event.target.value)}
                      disabled={!token}
                      className={styles.input}
                      aria-label={`Edit title for ${task.title}`}
                    />
                  </td>
                  <td>
                    <select
                      value={status}
                      onChange={(event) => handleDraftChange(task._id, "status", event.target.value)}
                      disabled={!token}
                      aria-label={`Change status for ${task.title}`}
                      className={styles.select}
                    >
                      {statusOptions.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      value={assignee}
                      onChange={(event) =>
                        handleDraftChange(task._id, "assignee", event.target.value)
                      }
                      disabled={!token}
                      className={styles.input}
                      aria-label={`Edit assignee for ${task.title}`}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) => handleDraftChange(task._id, "dueDate", event.target.value)}
                      disabled={!token}
                      className={styles.input}
                      aria-label={`Edit due date for ${task.title}`}
                    />
                  </td>
                  <td>{task.paymentStatus || "-"}</td>
                  <td className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => handleSave(task._id)}
                      disabled={!token || !hasChanges}
                      className={styles.saveButton}
                      aria-label={`Save task ${task.title}`}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task._id)}
                      disabled={!token}
                      className={styles.deleteButton}
                      aria-label={`Delete task ${task.title}`}
                    >
                      Delete
                    </button>
                  </td>
                      </>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default TaskTable;
