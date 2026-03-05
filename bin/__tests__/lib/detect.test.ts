import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  hasBackend,
  hasAuth,
  hasBlog,
  hasDocker,
  hasTokens,
  hasEnv,
  getThemeFiles,
} from "../../lib/detect.js";

let root: string;

beforeEach(() => {
  root = join(
    tmpdir(),
    `detect-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(root, { recursive: true });
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("hasBackend", () => {
  it("returns true when backend/ exists", () => {
    mkdirSync(join(root, "backend"), { recursive: true });
    expect(hasBackend(root)).toBe(true);
  });

  it("returns false when backend/ does not exist", () => {
    expect(hasBackend(root)).toBe(false);
  });
});

describe("hasAuth", () => {
  it("returns true when frontend/src/lib/auth.ts exists", () => {
    mkdirSync(join(root, "frontend/src/lib"), { recursive: true });
    writeFileSync(join(root, "frontend/src/lib/auth.ts"), "");
    expect(hasAuth(root)).toBe(true);
  });

  it("returns false when auth.ts does not exist", () => {
    expect(hasAuth(root)).toBe(false);
  });
});

describe("hasBlog", () => {
  it("returns true when frontend/src/content/blog/ exists", () => {
    mkdirSync(join(root, "frontend/src/content/blog"), { recursive: true });
    expect(hasBlog(root)).toBe(true);
  });

  it("returns false when blog/ does not exist", () => {
    expect(hasBlog(root)).toBe(false);
  });
});

describe("hasDocker", () => {
  it("returns true when docker/ exists", () => {
    mkdirSync(join(root, "docker"), { recursive: true });
    expect(hasDocker(root)).toBe(true);
  });

  it("returns false when docker/ does not exist", () => {
    expect(hasDocker(root)).toBe(false);
  });
});

describe("hasTokens", () => {
  it("returns true when packages/tokens/dist/ exists", () => {
    mkdirSync(join(root, "packages/tokens/dist"), { recursive: true });
    expect(hasTokens(root)).toBe(true);
  });

  it("returns false when dist/ does not exist", () => {
    expect(hasTokens(root)).toBe(false);
  });
});

describe("hasEnv", () => {
  it("returns true when .env exists", () => {
    writeFileSync(join(root, ".env"), "");
    expect(hasEnv(root)).toBe(true);
  });

  it("returns false when .env does not exist", () => {
    expect(hasEnv(root)).toBe(false);
  });
});

describe("getThemeFiles", () => {
  it("returns empty array when tokens dir does not exist", () => {
    expect(getThemeFiles(root)).toEqual([]);
  });

  it("returns theme names excluding base.json", () => {
    const tokensDir = join(root, "packages/tokens/tokens");
    mkdirSync(tokensDir, { recursive: true });
    writeFileSync(join(tokensDir, "base.json"), "{}");
    writeFileSync(join(tokensDir, "dracula.json"), "{}");
    writeFileSync(join(tokensDir, "alucard.json"), "{}");
    expect(getThemeFiles(root).sort()).toEqual(["alucard", "dracula"]);
  });
});
