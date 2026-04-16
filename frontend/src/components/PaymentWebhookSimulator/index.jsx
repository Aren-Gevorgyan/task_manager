import { useState } from "react";
import styles from "./styles.module.scss";

const PaymentWebhookSimulator = ({ token, tasks, onSimulate }) => {
  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("paid");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!taskId) {
      return;
    }

    setIsSubmitting(true);
    await onSimulate({ taskId, status });
    setIsSubmitting(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Payment webhook simulator">
      <h2>Payment webhook simulator</h2>
      <p className={styles.description}>
        Trigger paid or failed payment webhook directly from the UI.
      </p>
      <label className={styles.field}>
        Task
        <select
          value={taskId}
          onChange={(event) => setTaskId(event.target.value)}
          className={styles.input}
          disabled={!token || isSubmitting}
          required
        >
          <option value="">Select task</option>
          {tasks.map((task) => (
            <option key={task._id} value={task._id}>
              {task.title} ({task._id})
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        Status
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={styles.input}
          disabled={!token || isSubmitting}
        >
          <option value="paid">paid</option>
          <option value="failed">failed</option>
        </select>
      </label>

      <button type="submit" className={styles.button} disabled={!token || !taskId || isSubmitting}>
        {!token ? "Login required" : isSubmitting ? "Sending..." : "Send payment webhook"}
      </button>
    </form>
  );
};

export default PaymentWebhookSimulator;
