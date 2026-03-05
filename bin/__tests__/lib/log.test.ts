import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { log, table } from "../../lib/log.js";

describe("log", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("success calls console.log with green checkmark and message", () => {
    log.success("done");
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0]![0]).toContain("✓");
    expect(logSpy.mock.calls[0]![0]).toContain("done");
  });

  it("error calls console.error with red X and message", () => {
    log.error("failed");
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0]![0]).toContain("✗");
    expect(errorSpy.mock.calls[0]![0]).toContain("failed");
  });

  it("warn calls console.log with yellow ! and message", () => {
    log.warn("careful");
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0]![0]).toContain("!");
    expect(logSpy.mock.calls[0]![0]).toContain("careful");
  });

  it("info calls console.log with blue info icon and message", () => {
    log.info("note");
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0]![0]).toContain("ℹ");
    expect(logSpy.mock.calls[0]![0]).toContain("note");
  });

  it("step calls console.log with dimmed step counter", () => {
    log.step(2, 5, "installing");
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0]![0]).toContain("[2/5]");
    expect(logSpy.mock.calls[0]![0]).toContain("installing");
  });

  it("dim calls console.log with dimmed message", () => {
    log.dim("quiet");
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0]![0]).toContain("quiet");
  });

  it("blank calls console.log with no args", () => {
    log.blank();
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy).toHaveBeenCalledWith();
  });
});

describe("table", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("outputs rows with correct label padding", () => {
    table([
      { label: "ab", value: "v1" },
      { label: "abcdef", value: "v2" },
    ]);
    expect(logSpy).toHaveBeenCalledTimes(2);
    // shorter label should be padded to match longest
    const firstRow = logSpy.mock.calls[0]![0] as string;
    const secondRow = logSpy.mock.calls[1]![0] as string;
    expect(firstRow).toContain("ab");
    expect(firstRow).toContain("v1");
    expect(secondRow).toContain("abcdef");
    expect(secondRow).toContain("v2");
    // first label "ab" is padded to length of "abcdef" + 2 = 8
    expect(firstRow).toContain("ab      v1");
  });

  it("shows correct icon for pass status", () => {
    table([{ label: "check", value: "ok", status: "pass" }]);
    expect(logSpy.mock.calls[0]![0]).toContain("✓");
    expect(logSpy.mock.calls[0]![0]).toContain("ok");
  });

  it("shows correct icon for fail status", () => {
    table([{ label: "check", value: "bad", status: "fail" }]);
    expect(logSpy.mock.calls[0]![0]).toContain("✗");
    expect(logSpy.mock.calls[0]![0]).toContain("bad");
  });

  it("shows correct icon for warn status", () => {
    table([{ label: "check", value: "meh", status: "warn" }]);
    expect(logSpy.mock.calls[0]![0]).toContain("!");
    expect(logSpy.mock.calls[0]![0]).toContain("meh");
  });

  it("shows correct icon for skip status", () => {
    table([{ label: "check", value: "skipped", status: "skip" }]);
    expect(logSpy.mock.calls[0]![0]).toContain("–");
    expect(logSpy.mock.calls[0]![0]).toContain("skipped");
  });
});
