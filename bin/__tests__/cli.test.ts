import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const tsx = resolve(root, "node_modules/.bin/tsx");
const entry = resolve(root, "bin/ss.ts");

function run(...args: string[]): {
  stdout: string;
  stderr: string;
  exitCode: number;
} {
  try {
    const stdout = execFileSync(tsx, [entry, ...args], {
      cwd: root,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 10000,
    });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? "",
      exitCode: err.status ?? 1,
    };
  }
}

describe("ss CLI", () => {
  describe("--version", () => {
    it("exits 0 and prints a semver version", () => {
      const result = run("--version");
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe("--help", () => {
    it("exits 0 and shows description with all commands", () => {
      const result = run("--help");
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("ShockStack developer experience CLI");
      for (const cmd of [
        "init",
        "doctor",
        "info",
        "dev",
        "add",
        "strip",
        "db",
      ]) {
        expect(result.stdout).toContain(cmd);
      }
    });
  });

  describe("doctor", () => {
    it("runs without crashing and checks node and pnpm", () => {
      const result = run("doctor");
      const combined = result.stdout + result.stderr;
      expect([0, 1]).toContain(result.exitCode);
      expect(combined).toContain("node");
      expect(combined).toContain("pnpm");
    });
  });

  describe("info", () => {
    it("exits 0 and shows project name and mode", () => {
      const result = run("info");
      expect(result.exitCode).toBe(0);
      const combined = result.stdout + result.stderr;
      expect(combined.toLowerCase()).toContain("shockstack");
      expect(combined.toLowerCase()).toContain("mode");
    });
  });

  describe("dev --help", () => {
    it("exits 0 and lists --frontend and --backend flags", () => {
      const result = run("dev", "--help");
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("--frontend");
      expect(result.stdout).toContain("--backend");
    });
  });

  describe("add --help", () => {
    it("exits 0 and lists page, component, and api subcommands", () => {
      const result = run("add", "--help");
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("page");
      expect(result.stdout).toContain("component");
      expect(result.stdout).toContain("api");
    });
  });

  describe("db --help", () => {
    it("exits 0 and lists seed, reset, migrate, and studio subcommands", () => {
      const result = run("db", "--help");
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("seed");
      expect(result.stdout).toContain("reset");
      expect(result.stdout).toContain("migrate");
      expect(result.stdout).toContain("studio");
    });
  });

  describe("strip --help", () => {
    it("exits 0 and describes interactive feature removal", () => {
      const result = run("strip", "--help");
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("interactively remove unused features");
    });
  });

  describe("init --help", () => {
    it("exits 0 and lists --yes and --skip-prompts flags", () => {
      const result = run("init", "--help");
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("--yes");
      expect(result.stdout).toContain("--skip-prompts");
    });
  });

  describe("nonexistent command", () => {
    it("exits non-zero for unknown commands", () => {
      const result = run("nonexistent");
      expect(result.exitCode).not.toBe(0);
    });
  });
});
