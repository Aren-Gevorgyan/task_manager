import { useState } from "react";
import styles from "./styles.module.scss";

const CallbackRegistration = ({ token, onRegister }) => {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!url) {
      return;
    }

    setIsSubmitting(true);
    await onRegister({ url });
    setIsSubmitting(false);
    setUrl("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Callback registration form">
      <h2>Callback registration</h2>
      <p className={styles.description}>Registers URL for event: task.completed</p>

      <label className={styles.field}>
        Callback URL
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className={styles.input}
          placeholder="https://webhook.site/your-id"
          disabled={!token || isSubmitting}
          required
        />
      </label>

      <button type="submit" className={styles.button} disabled={!token || !url || isSubmitting}>
        {!token ? "Login required" : isSubmitting ? "Registering..." : "Register callback"}
      </button>
    </form>
  );
};

export default CallbackRegistration;
