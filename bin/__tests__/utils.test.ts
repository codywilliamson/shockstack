import { describe, it, expect } from "vitest";
import { semverGte } from "../commands/doctor.js";
import { toPascalCase } from "../commands/add.js";
import { looksLikeProduction } from "../commands/db.js";

describe("semverGte", () => {
  it("returns true for equal versions", () => {
    expect(semverGte("22.0.0", "22.0.0")).toBe(true);
  });

  it("handles v prefix", () => {
    expect(semverGte("v22.1.0", "22.0.0")).toBe(true);
  });

  it("returns true for higher major", () => {
    expect(semverGte("23.0.0", "22.0.0")).toBe(true);
  });

  it("returns false for lower major", () => {
    expect(semverGte("21.9.0", "22.0.0")).toBe(false);
  });

  it("returns false for lower minor", () => {
    expect(semverGte("22.0.0", "22.1.0")).toBe(false);
  });

  it("ignores patch and compares minor correctly", () => {
    expect(semverGte("10.4.1", "10.4.0")).toBe(true);
  });
});

describe("toPascalCase", () => {
  it("converts kebab-case", () => {
    expect(toPascalCase("hello-world")).toBe("HelloWorld");
  });

  it("converts snake_case", () => {
    expect(toPascalCase("my_component")).toBe("MyComponent");
  });

  it("capitalizes single word", () => {
    expect(toPascalCase("already")).toBe("Already");
  });

  it("converts multi-dash name", () => {
    expect(toPascalCase("multi-dash-name")).toBe("MultiDashName");
  });

  it("converts space-separated words", () => {
    expect(toPascalCase("with spaces")).toBe("WithSpaces");
  });
});

describe("looksLikeProduction", () => {
  it("returns false for localhost", () => {
    expect(looksLikeProduction("postgresql://localhost:5432/db")).toBe(false);
  });

  it("returns false for 127.0.0.1", () => {
    expect(looksLikeProduction("postgresql://127.0.0.1:5432/db")).toBe(false);
  });

  it("returns false for :5432/shockstack", () => {
    expect(looksLikeProduction("postgresql://host:5432/shockstack")).toBe(
      false,
    );
  });

  it("returns true for production-looking URL", () => {
    expect(
      looksLikeProduction("postgresql://prod-db.example.com:5432/myapp"),
    ).toBe(true);
  });

  it("is case insensitive", () => {
    expect(looksLikeProduction("postgresql://Localhost:5432/db")).toBe(false);
  });
});
