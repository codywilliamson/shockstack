import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { findRoot, getContext } from "../../lib/context.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = join(
    tmpdir(),
    `ss-context-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("findRoot", () => {
  it("returns null when no shockstack package.json found", () => {
    expect(findRoot(tmpDir)).toBeNull();
  });

  it("returns the root when package.json with name shockstack exists", () => {
    writeFileSync(
      join(tmpDir, "package.json"),
      JSON.stringify({ name: "shockstack", version: "1.0.0" }),
    );
    expect(findRoot(tmpDir)).toBe(tmpDir);
  });

  it("finds root from a nested subdirectory", () => {
    writeFileSync(
      join(tmpDir, "package.json"),
      JSON.stringify({ name: "shockstack", version: "1.0.0" }),
    );
    const nested = join(tmpDir, "a", "b", "c");
    mkdirSync(nested, { recursive: true });
    expect(findRoot(nested)).toBe(tmpDir);
  });
});

describe("getContext", () => {
  function setupProject(
    opts: { version?: string; features?: boolean; env?: string | false } = {},
  ) {
    const { version = "1.0.0", features = false, env = false } = opts;
    writeFileSync(
      join(tmpDir, "package.json"),
      JSON.stringify({ name: "shockstack", version }),
    );

    if (features) {
      mkdirSync(join(tmpDir, "backend"), { recursive: true });
      mkdirSync(join(tmpDir, "frontend/src/lib"), { recursive: true });
      writeFileSync(join(tmpDir, "frontend/src/lib/auth.ts"), "");
      mkdirSync(join(tmpDir, "frontend/src/content/blog"), { recursive: true });
      mkdirSync(join(tmpDir, "docker"), { recursive: true });
    }

    if (typeof env === "string") {
      writeFileSync(join(tmpDir, ".env"), env);
    }
  }

  it("returns correct name and version from package.json", () => {
    setupProject({ version: "2.5.0" });
    const ctx = getContext(tmpDir);
    expect(ctx.name).toBe("shockstack");
    expect(ctx.version).toBe("2.5.0");
  });

  it("detects features correctly when present", () => {
    setupProject({ features: true });
    const ctx = getContext(tmpDir);
    expect(ctx.features.backend).toBe(true);
    expect(ctx.features.auth).toBe(true);
    expect(ctx.features.blog).toBe(true);
    expect(ctx.features.docker).toBe(true);
  });

  it("features are false when directories don't exist", () => {
    setupProject();
    const ctx = getContext(tmpDir);
    expect(ctx.features.backend).toBe(false);
    expect(ctx.features.auth).toBe(false);
    expect(ctx.features.blog).toBe(false);
    expect(ctx.features.docker).toBe(false);
  });

  it("reads DATABASE_URL from .env when present", () => {
    setupProject({
      env: "FOO=bar\nDATABASE_URL=postgres://localhost:5432/db\nBAZ=qux",
    });
    const ctx = getContext(tmpDir);
    expect(ctx.databaseUrl).toBe("postgres://localhost:5432/db");
  });

  it("databaseUrl is null when no .env exists", () => {
    setupProject();
    const ctx = getContext(tmpDir);
    expect(ctx.databaseUrl).toBeNull();
  });

  it("databaseUrl is null when .env exists but no DATABASE_URL line", () => {
    setupProject({ env: "FOO=bar\nBAZ=qux" });
    const ctx = getContext(tmpDir);
    expect(ctx.databaseUrl).toBeNull();
  });
});
