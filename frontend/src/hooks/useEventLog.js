import { useCallback, useState } from "react";

export const useEventLog = () => {
  const [eventLog, setEventLog] = useState([]);

  const appendEvent = useCallback((entry) => {
    setEventLog((current) => [
      { id: `${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString(), ...entry },
      ...current,
    ]);
  }, []);

  return { eventLog, appendEvent };
};
