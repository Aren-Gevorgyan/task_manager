import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PaymentWebhookSimulator from "./index";

const tasks = [
  { _id: "task-1", title: "Task one" },
  { _id: "task-2", title: "Task two" },
];

describe("PaymentWebhookSimulator", () => {
  it("does not call onSimulate when no task is selected", () => {
    const onSimulate = vi.fn();

    render(<PaymentWebhookSimulator token="token" tasks={tasks} onSimulate={onSimulate} />);

    const form = screen.getByRole("form", { name: /payment webhook simulator/i });
    fireEvent.submit(form);

    expect(onSimulate).not.toHaveBeenCalled();
  });

  it("submits selected task and status", async () => {
    const onSimulate = vi.fn().mockResolvedValue(undefined);

    render(<PaymentWebhookSimulator token="token" tasks={tasks} onSimulate={onSimulate} />);

    fireEvent.change(screen.getByLabelText(/task/i), { target: { value: "task-2" } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: "failed" } });
    fireEvent.click(screen.getByRole("button", { name: /send payment webhook/i }));

    await waitFor(() => {
      expect(onSimulate).toHaveBeenCalledWith({ taskId: "task-2", status: "failed" });
    });
  });

  it("shows loading state while submit promise is pending", async () => {
    let resolveSubmit;
    const onSimulate = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<PaymentWebhookSimulator token="token" tasks={tasks} onSimulate={onSimulate} />);

    fireEvent.change(screen.getByLabelText(/task/i), { target: { value: "task-1" } });
    fireEvent.click(screen.getByRole("button", { name: /send payment webhook/i }));

    expect(screen.getByRole("button", { name: /sending\.\.\./i }).disabled).toBe(true);

    resolveSubmit();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send payment webhook/i }).disabled).toBe(false);
    });
  });
});
