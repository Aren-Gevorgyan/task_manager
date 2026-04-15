import styles from "./styles.module.scss";

const EventLogPanel = ({ entries }) => {
  return (
    <aside className={styles.panel} aria-label="Live event log">
      <h2>Live activity feed</h2>
      {!entries.length ? <p className={styles.empty}>No events yet.</p> : null}
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={styles.item}>
            <p className={styles.meta}>
              <strong>{entry.type}</strong> at {new Date(entry.timestamp).toLocaleTimeString()}
            </p>
            <pre className={styles.payload}>{JSON.stringify(entry.payload, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default EventLogPanel;
