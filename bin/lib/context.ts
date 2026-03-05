import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import {
  hasBackend,
  hasAuth,
  hasBlog,
  hasDocker,
  hasTokens,
  hasEnv,
  getThemeFiles,
} from "./detect.js";

export interface ProjectContext {
  root: string;
  name: string;
  version: string;
  features: {
    backend: boolean;
    auth: boolean;
    blog: boolean;
    docker: boolean;
  };
  tokens: {
    built: boolean;
    themes: string[];
  };
  env: boolean;
  databaseUrl: string | null;
}

export function findRoot(from: string = process.cwd()): string | null {
  let dir = resolve(from);
  while (dir !== dirname(dir)) {
    const pkgPath = resolve(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        if (pkg.name === "shockstack") return dir;
      } catch {}
    }
    dir = dirname(dir);
  }
  return null;
}

export function getContext(root: string): ProjectContext {
  const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf-8"));

  let databaseUrl: string | null = null;
  const envPath = resolve(root, ".env");
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    const match = envContent.match(/^DATABASE_URL=(.+)$/m);
    if (match) databaseUrl = match[1].trim();
  }

  return {
    root,
    name: pkg.name,
    version: pkg.version,
    features: {
      backend: hasBackend(root),
      auth: hasAuth(root),
      blog: hasBlog(root),
      docker: hasDocker(root),
    },
    tokens: {
      built: hasTokens(root),
      themes: getThemeFiles(root),
    },
    env: hasEnv(root),
    databaseUrl,
  };
}
