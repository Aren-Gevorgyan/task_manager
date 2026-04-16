import { useCallback, useState } from "react";
import { loginRequest } from "../api/client";

export const useAuthSession = ({ appendEvent, onSessionReset, onLoginSuccess }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [authError, setAuthError] = useState("");

  const handleLogout = useCallback(() => {
    setToken("");
    setAuthError("");
    localStorage.removeItem("token");
    onSessionReset();
  }, [onSessionReset]);

  const handleLogin = useCallback(
    async (credentials) => {
      setAuthError("");
      try {
        const response = await loginRequest(credentials);
        setToken(response.token);
        localStorage.setItem("token", response.token);
        appendEvent({ type: "login_success", payload: { username: credentials.username } });
        onLoginSuccess?.(response.token);
      } catch (error) {
        setAuthError(error.message || "Login failed");
      }
    },
    [appendEvent, onLoginSuccess],
  );

  const handleAuthFailure = useCallback(
    (error, fallbackMessage) => {
      const message = error?.message || fallbackMessage;
      if (message === "Invalid auth token") {
        handleLogout();
        setAuthError("Session expired. Please login again.");
        appendEvent({
          type: "auth_expired",
          payload: { message: "Signed out automatically due to invalid auth token" },
        });
        return true;
      }

      return false;
    },
    [appendEvent, handleLogout],
  );

  return {
    token,
    authError,
    handleLogin,
    handleLogout,
    handleAuthFailure,
  };
};
