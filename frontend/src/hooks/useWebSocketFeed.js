import { useEffect } from "react";

const buildEventSummary = (event, data) => {
  if (event === "webhook_received") {
    return `Webhook: Payment ${data?.status || "unknown"} for task ${data?.taskId || "n/a"}`;
  }

  if (event === "task_updated") {
    return `Task updated: ${data?.title || "Untitled"} -> ${data?.status || "unknown"}`;
  }

  if (event === "connected") {
    return data?.message || "WebSocket connected";
  }

  return `Event received: ${event}`;
};

export const useWebSocketFeed = ({ token, appendEvent, loadTasks, filter }) => {
  useEffect(() => {
    if (!token) {
      return undefined;
    }

    // Build websocket URL from current page origin so Nginx can proxy /ws to backend.
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = window.location.host;
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws?token=${encodeURIComponent(token)}`);

    ws.onmessage = (messageEvent) => {
      try {
        const parsed = JSON.parse(messageEvent.data);
        // ignore connected event
        if (parsed.event === "connected") {
          return;
        }
        const data = parsed.data || parsed.payload || {};
        appendEvent({
          type: parsed.event,
          message: buildEventSummary(parsed.event, data),
          data,
        });

        if (parsed.event === "task_updated" || parsed.event === "webhook_received") {
          loadTasks(filter);
        }
      } catch (error) {
        appendEvent({
          type: "parse_error",
          message: "WebSocket parse error",
          payload: error
            ? { message: error.message }
            : { message: "Received malformed websocket message" },
        });
      }
    };

    ws.onerror = () => {
      // appendEvent({
      //   type: "ws_error",
      //   message: "WebSocket connection error",
      //   data: { message: "WebSocket connection error" },
      // });
    };

    return () => {
      ws.close();
    };
  }, [appendEvent, filter, loadTasks, token]);
};
