import { describe, it, expect } from "vitest";

describe("smoke test", () => {
  it("should pass basic assertions", () => {
    expect(1 + 1).toBe(2);
    expect("shockstack").toContain("shock");
  });

  it("should handle arrays", () => {
    const tags = ["astro", "vue", "tailwind"];
    expect(tags).toHaveLength(3);
    expect(tags).toContain("astro");
  });
});
