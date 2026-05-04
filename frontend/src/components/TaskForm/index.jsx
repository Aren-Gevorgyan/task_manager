import styles from "./styles.module.scss";

const TaskForm = ({ token, taskInput, onTaskInputChange, onCreateTask, isSubmitting }) => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    await onCreateTask();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Create task form">
      <h2>Create task</h2>
      <div className={styles.row}>
        <label className={styles.field}>
          Title
          <input
            value={taskInput.title}
            onChange={(event) => onTaskInputChange("title", event.target.value)}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.field}>
          Assignee
          <input
            value={taskInput.assignee}
            onChange={(event) => onTaskInputChange("assignee", event.target.value)}
            className={styles.input}
          />
        </label>
        <label className={styles.field}>
          Due date
          <input
            type="date"
            value={taskInput.dueDate}
            onChange={(event) => onTaskInputChange("dueDate", event.target.value)}
            className={styles.input}
          />
        </label>
      </div>
      <button type="submit" className={styles.button} disabled={!token || isSubmitting}>
        {!token ? "Login required" : isSubmitting ? "Creating..." : "Create task"}
      </button>
    </form>
  );
};

export default TaskForm;
