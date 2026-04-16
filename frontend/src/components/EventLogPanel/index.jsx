import styles from "./styles.module.scss";

const EventLogPanel = ({ entries }) => {
  return (
    <aside className={styles.panel} aria-label="Live event log">
      <h2>Live activity feed</h2>
      {!entries.length ? <p className={styles.empty}>No events yet.</p> : null}
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={styles.item}>
            <p className={styles.message}>
              🔔 {new Date(entry.timestamp).toLocaleTimeString()} - {entry.message || entry.type}
            </p>
            <pre className={styles.payload}>
              {JSON.stringify({ event: entry.type, data: entry.data || entry.payload || {} }, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default EventLogPanel;
