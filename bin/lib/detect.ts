import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

export function hasBackend(root: string): boolean {
  return existsSync(resolve(root, "backend"));
}

export function hasAuth(root: string): boolean {
  return existsSync(resolve(root, "frontend/src/lib/auth.ts"));
}

export function hasBlog(root: string): boolean {
  return existsSync(resolve(root, "frontend/src/content/blog"));
}

export function hasDocker(root: string): boolean {
  return existsSync(resolve(root, "docker"));
}

export function hasTokens(root: string): boolean {
  return existsSync(resolve(root, "packages/tokens/dist"));
}

export function hasEnv(root: string): boolean {
  return existsSync(resolve(root, ".env"));
}

export function getThemeFiles(root: string): string[] {
  const tokensDir = resolve(root, "packages/tokens/tokens");
  if (!existsSync(tokensDir)) return [];
  return readdirSync(tokensDir)
    .filter((f) => f.endsWith(".json") && f !== "base.json")
    .map((f) => f.replace(".json", ""));
}
