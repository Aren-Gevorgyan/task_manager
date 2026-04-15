import { useState } from "react";
import styles from "./styles.module.scss";

const LoginForm = ({ onLogin, isLoggedIn, error }) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    await onLogin({ username, password });
    setIsSubmitting(false);
  };

  if (isLoggedIn) {
    return <p className={styles.stateLabel}>Authenticated. Task write actions are enabled.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} aria-label="Login form">
      <h2>Login</h2>
      <label className={styles.label}>
        Username
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className={styles.input}
          required
        />
      </label>
      <label className={styles.label}>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={styles.input}
          required
        />
      </label>
      {error ? <p className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.button} disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
