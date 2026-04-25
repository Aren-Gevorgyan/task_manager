import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));

    expect(result.current).toBe("initial");
  });

  it("updates value only after delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 300 } },
    );

    rerender({ value: "second", delay: 300 });

    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("second");
  });

  it("resets timer when value changes quickly", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "a", delay: 300 } },
    );

    rerender({ value: "b", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "c", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe("c");
  });
});
