# ss CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a TypeScript CLI (`ss`) for ShockStack that provides setup automation, scaffolding, smart dev server, and database convenience commands.

**Architecture:** Single entry point `bin/ss.ts` with Commander for subcommand routing. Each command is a separate module in `bin/commands/`. Shared utilities in `bin/lib/` handle project detection, logging, guards, and prompts. Templates in `bin/templates/` use Handlebars for scaffolding.

**Tech Stack:** TypeScript, tsx (shebang), Commander, @inquirer/prompts, Handlebars

---

### Task 1: Project Wiring + Entry Point

**Files:**

- Modify: `package.json` (add bin field + dependencies)
- Create: `bin/ss.ts`

**Step 1: Add dependencies**

Run: `cd /home/shockbirds/dev/shockstack && pnpm add -D commander @inquirer/prompts handlebars`

**Step 2: Add bin field to package.json**

Add to root `package.json`:

```json
"bin": {
  "ss": "./bin/ss.ts"
}
```

**Step 3: Create entry point**

Create `bin/ss.ts`:

```typescript
#!/usr/bin/env tsx
import { Command } from "commander";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8"),
);

const program = new Command()
  .name("ss")
  .description("ShockStack developer experience CLI")
  .version(pkg.version);

// commands registered here as they're built

program.parse();
```

**Step 4: Make executable and test**

Run:

```bash
chmod +x bin/ss.ts
pnpm install
ss --version
```

Expected: prints `1.6.1`

Run: `ss --help`
Expected: shows help text with description

**Step 5: Commit**

```bash
git add bin/ss.ts package.json pnpm-lock.yaml
git commit -m "feat(cli): add ss entry point with commander wiring"
```

---

### Task 2: Shared Lib — log.ts

**Files:**

- Create: `bin/lib/log.ts`

**Step 1: Create styled logger**

Create `bin/lib/log.ts`:

```typescript
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};

export const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}!${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  step: (current: number, total: number, msg: string) =>
    console.log(`${colors.dim}[${current}/${total}]${colors.reset} ${msg}`),
  dim: (msg: string) => console.log(`${colors.dim}${msg}${colors.reset}`),
  blank: () => console.log(),
};

export function table(
  rows: {
    label: string;
    value: string;
    status?: "pass" | "fail" | "warn" | "skip";
  }[],
) {
  const maxLabel = Math.max(...rows.map((r) => r.label.length));
  for (const row of rows) {
    const icon =
      row.status === "pass"
        ? `${colors.green}✓`
        : row.status === "fail"
          ? `${colors.red}✗`
          : row.status === "warn"
            ? `${colors.yellow}!`
            : row.status === "skip"
              ? `${colors.dim}–`
              : " ";
    console.log(
      `  ${icon}${colors.reset} ${row.label.padEnd(maxLabel + 2)}${row.value}`,
    );
  }
}
```

**Step 2: Commit**

```bash
git add bin/lib/log.ts
git commit -m "feat(cli): add styled log utilities"
```

---

### Task 3: Shared Lib — detect.ts + context.ts

**Files:**

- Create: `bin/lib/detect.ts`
- Create: `bin/lib/context.ts`

**Step 1: Create feature detection**

Create `bin/lib/detect.ts`:

```typescript
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
```

**Step 2: Create project context**

Create `bin/lib/context.ts`:

```typescript
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
```

**Step 3: Commit**

```bash
git add bin/lib/detect.ts bin/lib/context.ts
git commit -m "feat(cli): add project detection and context utilities"
```

---

### Task 4: Shared Lib — guards.ts

**Files:**

- Create: `bin/lib/guards.ts`

**Step 1: Create guard utilities**

Create `bin/lib/guards.ts`:

```typescript
import { execFileSync } from "node:child_process";
import { input } from "@inquirer/prompts";
import { findRoot, getContext } from "./context.js";
import { log } from "./log.js";

export function assertRepoRoot(): string {
  const root = findRoot();
  if (!root) {
    log.error("not in a ShockStack project. run this from the repo root.");
    process.exit(1);
  }
  return root;
}

export function assertFeatureEnabled(
  root: string,
  feature: "backend" | "auth" | "blog",
): void {
  const ctx = getContext(root);
  if (!ctx.features[feature]) {
    log.error(`${feature} is not enabled in this project.`);
    log.info(`run 'ss init' to set up features.`);
    process.exit(1);
  }
}

export async function confirmDestructive(message: string): Promise<void> {
  log.warn(message);
  const answer = await input({ message: "type 'yes' to confirm:" });
  if (answer.trim().toLowerCase() !== "yes") {
    log.info("aborted.");
    process.exit(0);
  }
}

export function isGitDirty(root: string): boolean {
  try {
    const result = execFileSync("git", ["status", "--porcelain"], {
      cwd: root,
      encoding: "utf-8",
    });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

export function warnIfDirty(root: string): void {
  if (isGitDirty(root)) {
    log.warn("you have uncommitted changes. consider committing first.");
  }
}
```

**Step 2: Commit**

```bash
git add bin/lib/guards.ts
git commit -m "feat(cli): add guard utilities for safety checks"
```

---

### Task 5: ss doctor

**Files:**

- Create: `bin/commands/doctor.ts`
- Modify: `bin/ss.ts` (register command)

**Step 1: Create doctor command**

Create `bin/commands/doctor.ts`:

```typescript
import { execFileSync } from "node:child_process";
import { assertRepoRoot } from "../lib/guards.js";
import { getContext } from "../lib/context.js";
import { log, table } from "../lib/log.js";

interface Check {
  label: string;
  run: () => { status: "pass" | "fail" | "warn" | "skip"; value: string };
}

function getVersion(cmd: string, args: string[]): string | null {
  try {
    return execFileSync(cmd, args, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

function semverGte(version: string, min: string): boolean {
  const parse = (v: string) => v.replace(/^v/, "").split(".").map(Number);
  const [aMaj, aMin = 0] = parse(version);
  const [bMaj, bMin = 0] = parse(min);
  return aMaj > bMaj || (aMaj === bMaj && aMin >= bMin);
}

export function registerDoctor(program: import("commander").Command) {
  program
    .command("doctor")
    .description("check prerequisites and project health")
    .action(async () => {
      const root = assertRepoRoot();
      const ctx = getContext(root);

      log.info("checking project health...\n");

      const checks: Check[] = [
        {
          label: "node",
          run: () => {
            const v = getVersion("node", ["--version"]);
            if (!v) return { status: "fail", value: "not found" };
            return semverGte(v, "22.0.0")
              ? { status: "pass", value: v }
              : { status: "fail", value: `${v} (need >= 22)` };
          },
        },
        {
          label: "pnpm",
          run: () => {
            const v = getVersion("pnpm", ["--version"]);
            if (!v) return { status: "fail", value: "not found" };
            return semverGte(v, "10.4.0")
              ? { status: "pass", value: v }
              : { status: "fail", value: `${v} (need >= 10.4)` };
          },
        },
        {
          label: "dotnet",
          run: () => {
            if (!ctx.features.backend)
              return { status: "skip", value: "no backend" };
            const v = getVersion("dotnet", ["--version"]);
            if (!v)
              return {
                status: "fail",
                value: "not found (backend requires .NET)",
              };
            return { status: "pass", value: v };
          },
        },
        {
          label: "docker",
          run: () => {
            if (!ctx.features.docker)
              return { status: "skip", value: "no docker/" };
            const v = getVersion("docker", ["--version"]);
            if (!v) return { status: "warn", value: "not found (optional)" };
            return {
              status: "pass",
              value: v.split(",")[0].replace("Docker version ", ""),
            };
          },
        },
        {
          label: ".env",
          run: () => {
            if (!ctx.env)
              return {
                status: "fail",
                value: "missing — copy .env.example to .env",
              };
            const missing: string[] = [];
            if (!ctx.databaseUrl) missing.push("DATABASE_URL");
            if (missing.length > 0)
              return {
                status: "fail",
                value: `missing vars: ${missing.join(", ")}`,
              };
            return { status: "pass", value: "found" };
          },
        },
        {
          label: "tokens",
          run: () => {
            return ctx.tokens.built
              ? {
                  status: "pass",
                  value: `built (${ctx.tokens.themes.length} themes)`,
                }
              : {
                  status: "fail",
                  value: "not built — run 'pnpm tokens:build'",
                };
          },
        },
      ];

      const results = checks.map((c) => ({ label: c.label, ...c.run() }));
      table(results);

      log.blank();
      const failures = results.filter((r) => r.status === "fail");
      if (failures.length > 0) {
        log.error(`${failures.length} issue(s) found.`);
        process.exit(1);
      } else {
        log.success("all checks passed.");
      }
    });
}
```

**Step 2: Register in entry point**

Add to `bin/ss.ts` before `program.parse()`:

```typescript
import { registerDoctor } from "./commands/doctor.js";
registerDoctor(program);
```

**Step 3: Test**

Run: `ss doctor`
Expected: table of pass/fail checks for node, pnpm, .env, tokens, etc.

**Step 4: Commit**

```bash
git add bin/commands/doctor.ts bin/ss.ts
git commit -m "feat(cli): add ss doctor command"
```

---

### Task 6: ss info

**Files:**

- Create: `bin/commands/info.ts`
- Modify: `bin/ss.ts` (register command)

**Step 1: Create info command**

Create `bin/commands/info.ts`:

```typescript
import { assertRepoRoot } from "../lib/guards.js";
import { getContext } from "../lib/context.js";
import { log, table } from "../lib/log.js";

export function registerInfo(program: import("commander").Command) {
  program
    .command("info")
    .description("show project state and active features")
    .action(async () => {
      const root = assertRepoRoot();
      const ctx = getContext(root);

      const mode = ctx.features.backend ? "full-stack" : "frontend-only";

      log.info(`${ctx.name} v${ctx.version}\n`);

      table([
        { label: "mode", value: mode },
        {
          label: "backend",
          value: ctx.features.backend ? "enabled" : "disabled",
          status: ctx.features.backend ? "pass" : "skip",
        },
        {
          label: "auth",
          value: ctx.features.auth ? "enabled" : "disabled",
          status: ctx.features.auth ? "pass" : "skip",
        },
        {
          label: "blog",
          value: ctx.features.blog ? "enabled" : "disabled",
          status: ctx.features.blog ? "pass" : "skip",
        },
        {
          label: "docker",
          value: ctx.features.docker ? "present" : "absent",
          status: ctx.features.docker ? "pass" : "skip",
        },
        {
          label: "tokens",
          value: ctx.tokens.built
            ? `built (${ctx.tokens.themes.length} themes)`
            : "not built",
          status: ctx.tokens.built ? "pass" : "warn",
        },
        {
          label: "database",
          value: ctx.databaseUrl ? "configured" : "not configured",
          status: ctx.databaseUrl ? "pass" : "warn",
        },
        {
          label: ".env",
          value: ctx.env ? "found" : "missing",
          status: ctx.env ? "pass" : "fail",
        },
      ]);

      if (ctx.tokens.themes.length > 0) {
        log.blank();
        log.dim(`  themes: ${ctx.tokens.themes.join(", ")}`);
      }
    });
}
```

**Step 2: Register in entry point**

Add to `bin/ss.ts`:

```typescript
import { registerInfo } from "./commands/info.js";
registerInfo(program);
```

**Step 3: Test**

Run: `ss info`
Expected: project name, version, feature status table, theme list

**Step 4: Commit**

```bash
git add bin/commands/info.ts bin/ss.ts
git commit -m "feat(cli): add ss info command"
```

---

### Task 7: ss dev

**Files:**

- Create: `bin/commands/dev.ts`
- Modify: `bin/ss.ts` (register command)

**Step 1: Create dev command**

Create `bin/commands/dev.ts`:

```typescript
import { execFileSync, spawn } from "node:child_process";
import { assertRepoRoot } from "../lib/guards.js";
import { getContext } from "../lib/context.js";
import { log } from "../lib/log.js";

function hasDotnet(): boolean {
  try {
    execFileSync("dotnet", ["--version"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function isPortInUse(port: number): boolean {
  try {
    execFileSync("lsof", ["-i", `:${port}`], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function registerDev(program: import("commander").Command) {
  program
    .command("dev")
    .description("start the dev server (auto-detects stack)")
    .option("--frontend", "force frontend-only mode")
    .option("--backend", "force full-stack mode via Aspire")
    .action(async (opts) => {
      const root = assertRepoRoot();
      const ctx = getContext(root);

      let mode: "frontend" | "backend";

      if (opts.frontend) {
        mode = "frontend";
      } else if (opts.backend) {
        mode = "backend";
        if (!ctx.features.backend) {
          log.error("backend/ directory not found. cannot use --backend flag.");
          process.exit(1);
        }
        if (!hasDotnet()) {
          log.error(".NET SDK not found. install it to use --backend flag.");
          process.exit(1);
        }
      } else if (ctx.features.backend && hasDotnet()) {
        mode = "backend";
      } else {
        if (ctx.features.backend && !hasDotnet()) {
          log.warn(
            "backend/ exists but .NET SDK not found. falling back to frontend-only.",
          );
        }
        mode = "frontend";
      }

      if (mode === "frontend" && isPortInUse(4321)) {
        log.error(
          "port 4321 is already in use. stop the other process or use a different port.",
        );
        log.dim("  find it: lsof -i :4321");
        process.exit(1);
      }

      if (mode === "backend") {
        log.info(
          "starting full-stack via Aspire (postgres + API + frontend)...",
        );
        const child = spawn(
          "dotnet",
          ["run", "--project", "backend/src/ShockStack.AppHost"],
          {
            cwd: root,
            stdio: "inherit",
          },
        );
        child.on("exit", (code) => process.exit(code ?? 0));
      } else {
        log.info("starting frontend dev server...");
        const child = spawn("pnpm", ["--filter", "frontend", "dev"], {
          cwd: root,
          stdio: "inherit",
        });
        child.on("exit", (code) => process.exit(code ?? 0));
      }
    });
}
```

**Step 2: Register in entry point**

Add to `bin/ss.ts`:

```typescript
import { registerDev } from "./commands/dev.js";
registerDev(program);
```

**Step 3: Test**

Run: `ss dev --help`
Expected: shows options for --frontend and --backend

**Step 4: Commit**

```bash
git add bin/commands/dev.ts bin/ss.ts
git commit -m "feat(cli): add ss dev command with auto-detection"
```

---

### Task 8: ss db

**Files:**

- Create: `bin/commands/db.ts`
- Modify: `bin/ss.ts` (register command)

**Step 1: Create db command**

Create `bin/commands/db.ts`:

```typescript
import { spawn } from "node:child_process";
import { assertRepoRoot } from "../lib/guards.js";
import { getContext } from "../lib/context.js";
import { confirmDestructive } from "../lib/guards.js";
import { log } from "../lib/log.js";

function run(cmd: string, args: string[], cwd: string): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

function looksLikeProduction(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    !lower.includes("localhost") &&
    !lower.includes("127.0.0.1") &&
    !lower.includes(":5432/shockstack")
  );
}

export function registerDb(program: import("commander").Command) {
  const db = program.command("db").description("database convenience commands");

  db.command("seed")
    .description("run the seed script")
    .action(async () => {
      const root = assertRepoRoot();
      log.info("seeding database...");
      const code = await run("pnpm", ["--filter", "frontend", "db:seed"], root);
      if (code === 0) log.success("database seeded.");
      else {
        log.error("seed failed.");
        process.exit(code);
      }
    });

  db.command("reset")
    .description("drop all tables, migrate, and seed")
    .option("--force", "skip confirmation")
    .action(async (opts) => {
      const root = assertRepoRoot();
      const ctx = getContext(root);

      if (ctx.databaseUrl && looksLikeProduction(ctx.databaseUrl)) {
        log.error(
          "DATABASE_URL looks like a production database. refusing to reset.",
        );
        log.info("use a local database URL to reset.");
        process.exit(1);
      }

      if (!opts.force) {
        await confirmDestructive(
          "this will drop all tables and recreate the database.",
        );
      }

      log.info("resetting database...");

      const frontendDir = `${root}/frontend`;

      log.step(1, 3, "pushing schema (drop + recreate)...");
      let code = await run(
        "pnpm",
        ["drizzle-kit", "push", "--force"],
        frontendDir,
      );
      if (code !== 0) {
        log.error("schema push failed.");
        process.exit(code);
      }

      log.step(2, 3, "running migrations...");
      code = await run("pnpm", ["drizzle-kit", "migrate"], frontendDir);
      if (code !== 0) {
        log.error("migration failed.");
        process.exit(code);
      }

      log.step(3, 3, "seeding...");
      code = await run("pnpm", ["--filter", "frontend", "db:seed"], root);
      if (code !== 0) {
        log.error("seed failed.");
        process.exit(code);
      }

      log.success("database reset complete.");
    });

  db.command("migrate")
    .description("run drizzle migrations")
    .action(async () => {
      const root = assertRepoRoot();
      log.info("running migrations...");
      const code = await run(
        "pnpm",
        ["drizzle-kit", "migrate"],
        `${root}/frontend`,
      );
      if (code === 0) log.success("migrations complete.");
      else {
        log.error("migration failed.");
        process.exit(code);
      }
    });

  db.command("studio")
    .description("launch drizzle studio")
    .action(async () => {
      const root = assertRepoRoot();
      log.info("launching drizzle studio...");
      const code = await run(
        "pnpm",
        ["drizzle-kit", "studio"],
        `${root}/frontend`,
      );
      process.exit(code);
    });
}
```

**Step 2: Register in entry point**

Add to `bin/ss.ts`:

```typescript
import { registerDb } from "./commands/db.js";
registerDb(program);
```

**Step 3: Test**

Run: `ss db --help`
Expected: shows seed, reset, migrate, studio subcommands

**Step 4: Commit**

```bash
git add bin/commands/db.ts bin/ss.ts
git commit -m "feat(cli): add ss db commands (seed, reset, migrate, studio)"
```

---

### Task 9: ss add (scaffolding)

**Files:**

- Create: `bin/templates/page.astro.hbs`
- Create: `bin/templates/component.vue.hbs`
- Create: `bin/templates/endpoint.cs.hbs`
- Create: `bin/commands/add.ts`
- Modify: `bin/ss.ts` (register command)

**Step 1: Create page template**

Create `bin/templates/page.astro.hbs`:

```handlebars
---
{{#if auth}}
import { auth } from "../lib/auth"

const session = await auth.api.getSession({ headers: Astro.request.headers })
if (!session) return Astro.redirect("/login")
{{/if}}
import BaseLayout from "../layouts/BaseLayout.astro"
---

<BaseLayout title="{{title}}">
  <main class="mx-auto max-w-4xl px-4 py-16">
    <h1 class="text-fg-primary text-3xl font-bold">{{title}}</h1>
  </main>
</BaseLayout>
```

**Step 2: Create component template**

Create `bin/templates/component.vue.hbs`:

```handlebars
<script setup lang="ts">
  {{#if props}}
    interface Props { // define props here } const props = defineProps<Props>()
  {{/if}}
</script>

<template>
  <div>
    <p>{{name}} component</p>
  </div>
</template>
```

**Step 3: Create endpoint template**

Create `bin/templates/endpoint.cs.hbs`:

```handlebars
using Microsoft.AspNetCore.Mvc;
using ShockStack.Api.Models;

namespace ShockStack.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class {{name}}Controller : ControllerBase
{
    [{{method}}("")]
    public IActionResult {{methodName}}()
    {
        return Ok(ApiResponse<object>.Ok(new { message = "{{name}} endpoint" }));
    }
}
```

**Step 4: Create add command**

Create `bin/commands/add.ts`:

```typescript
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { confirm, select } from "@inquirer/prompts";
import Handlebars from "handlebars";
import { assertRepoRoot, assertFeatureEnabled } from "../lib/guards.js";
import { log } from "../lib/log.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = resolve(__dirname, "../templates");

function renderTemplate(name: string, data: Record<string, unknown>): string {
  const raw = readFileSync(resolve(templatesDir, name), "utf-8");
  return Handlebars.compile(raw)(data);
}

function writeFile(path: string, content: string, dryRun: boolean): void {
  if (dryRun) {
    log.info(`would create: ${path}`);
    log.dim(content);
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  log.success(`created: ${path}`);
}

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

export function registerAdd(program: import("commander").Command) {
  const add = program
    .command("add")
    .description("scaffold new files from templates");

  add
    .command("page <name>")
    .description("scaffold an Astro page")
    .option("--dry-run", "preview without writing files")
    .action(async (name: string, opts) => {
      const root = assertRepoRoot();
      const target = resolve(root, `frontend/src/pages/${name}.astro`);

      if (existsSync(target)) {
        log.error(`page already exists: ${target}`);
        process.exit(1);
      }

      const auth = await confirm({
        message: "add auth guard?",
        default: false,
      });
      const title = toPascalCase(name);
      const content = renderTemplate("page.astro.hbs", { title, auth });
      writeFile(target, content, opts.dryRun);
    });

  add
    .command("component <name>")
    .description("scaffold a Vue component")
    .option("--dry-run", "preview without writing files")
    .action(async (name: string, opts) => {
      const root = assertRepoRoot();
      const pascal = toPascalCase(name);
      const target = resolve(root, `frontend/src/components/${pascal}.vue`);

      if (existsSync(target)) {
        log.error(`component already exists: ${target}`);
        process.exit(1);
      }

      const props = await confirm({
        message: "add props interface?",
        default: true,
      });
      const content = renderTemplate("component.vue.hbs", {
        name: pascal,
        props,
      });
      writeFile(target, content, opts.dryRun);
    });

  add
    .command("api <name>")
    .description("scaffold a .NET API endpoint")
    .option("--dry-run", "preview without writing files")
    .action(async (name: string, opts) => {
      const root = assertRepoRoot();
      assertFeatureEnabled(root, "backend");

      const pascal = toPascalCase(name);
      const target = resolve(
        root,
        `backend/src/ShockStack.Api/Controllers/${pascal}Controller.cs`,
      );

      if (existsSync(target)) {
        log.error(`controller already exists: ${target}`);
        process.exit(1);
      }

      const method = await select({
        message: "HTTP method?",
        choices: [
          { name: "GET", value: "HttpGet" },
          { name: "POST", value: "HttpPost" },
          { name: "PUT", value: "HttpPut" },
          { name: "DELETE", value: "HttpDelete" },
        ],
      });

      const methodNames: Record<string, string> = {
        HttpGet: "Get",
        HttpPost: "Create",
        HttpPut: "Update",
        HttpDelete: "Delete",
      };

      const content = renderTemplate("endpoint.cs.hbs", {
        name: pascal,
        method,
        methodName: methodNames[method],
      });
      writeFile(target, content, opts.dryRun);
    });
}
```

**Step 5: Register in entry point**

Add to `bin/ss.ts`:

```typescript
import { registerAdd } from "./commands/add.js";
registerAdd(program);
```

**Step 6: Test**

Run: `ss add page test-page --dry-run`
Expected: prints template output without creating file

Run: `ss add component TestWidget --dry-run`
Expected: prints vue component template

**Step 7: Commit**

```bash
git add bin/templates/ bin/commands/add.ts bin/ss.ts
git commit -m "feat(cli): add ss add command with page/component/api scaffolding"
```

---

### Task 10: ss strip

**Files:**

- Create: `bin/commands/strip.ts`
- Modify: `bin/ss.ts` (register command)

**Step 1: Create strip command**

Create `bin/commands/strip.ts`:

```typescript
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { confirm, checkbox } from "@inquirer/prompts";
import { assertRepoRoot, warnIfDirty } from "../lib/guards.js";
import { getContext } from "../lib/context.js";
import { log } from "../lib/log.js";

interface StripTarget {
  name: string;
  available: boolean;
  paths: string[];
  description: string;
}

function getTargets(root: string): StripTarget[] {
  const ctx = getContext(root);
  return [
    {
      name: "backend",
      available: ctx.features.backend,
      description: "remove .NET backend, Aspire, and docker backend service",
      paths: ["backend", "docker/backend.Dockerfile"],
    },
    {
      name: "auth",
      available: ctx.features.auth,
      description:
        "remove Better Auth config, auth pages, middleware, and auth deps",
      paths: [
        "frontend/src/lib/auth.ts",
        "frontend/src/lib/auth-client.ts",
        "frontend/src/pages/login.astro",
        "frontend/src/pages/register.astro",
        "frontend/src/pages/api/auth",
        "frontend/src/components/ui/AuthForm.vue",
        "frontend/src/components/settings",
      ],
    },
    {
      name: "blog",
      available: ctx.features.blog,
      description: "remove blog content collection and pages",
      paths: ["frontend/src/content/blog", "frontend/src/pages/blog"],
    },
  ];
}

export function registerStrip(program: import("commander").Command) {
  program
    .command("strip")
    .description("interactively remove unused features")
    .action(async () => {
      const root = assertRepoRoot();
      warnIfDirty(root);

      const targets = getTargets(root).filter((t) => t.available);

      if (targets.length === 0) {
        log.info("nothing to strip — all optional features already removed.");
        return;
      }

      const selected = await checkbox({
        message: "select features to remove:",
        choices: targets.map((t) => ({
          name: `${t.name} — ${t.description}`,
          value: t.name,
        })),
      });

      if (selected.length === 0) {
        log.info("nothing selected.");
        return;
      }

      const toRemove = targets.filter((t) => selected.includes(t.name));
      const allPaths = toRemove.flatMap((t) =>
        t.paths.map((p) => resolve(root, p)).filter((p) => existsSync(p)),
      );

      log.blank();
      log.warn("the following will be permanently deleted:");
      for (const p of allPaths) {
        log.dim(`  ${p.replace(root + "/", "")}`);
      }
      log.blank();

      const confirmed = await confirm({ message: "proceed?", default: false });
      if (!confirmed) {
        log.info("aborted.");
        return;
      }

      for (const p of allPaths) {
        rmSync(p, { recursive: true, force: true });
        log.success(`removed: ${p.replace(root + "/", "")}`);
      }

      log.blank();
      log.success(`stripped: ${selected.join(", ")}`);
      log.info("run 'pnpm install' to clean up dependencies.");
    });
}
```

**Step 2: Register in entry point**

Add to `bin/ss.ts`:

```typescript
import { registerStrip } from "./commands/strip.js";
registerStrip(program);
```

**Step 3: Test**

Run: `ss strip --help`
Expected: shows description

**Step 4: Commit**

```bash
git add bin/commands/strip.ts bin/ss.ts
git commit -m "feat(cli): add ss strip command for feature removal"
```

---

### Task 11: ss init

**Files:**

- Create: `bin/commands/init.ts`
- Modify: `bin/ss.ts` (register command)

**Step 1: Create init command**

Create `bin/commands/init.ts`:

```typescript
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { input, confirm } from "@inquirer/prompts";
import { randomBytes } from "node:crypto";
import { assertRepoRoot, warnIfDirty } from "../lib/guards.js";
import { getContext } from "../lib/context.js";
import { log } from "../lib/log.js";

function runAsync(cmd: string, args: string[], cwd: string): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

export function registerInit(program: import("commander").Command) {
  program
    .command("init")
    .description("interactive project setup wizard")
    .option("--yes", "accept all defaults")
    .option("--skip-prompts", "skip interactive prompts, use defaults")
    .action(async (opts) => {
      const root = assertRepoRoot();
      const auto = opts.yes || opts.skipPrompts;
      const totalPhases = 7;

      log.info("welcome to ShockStack setup\n");

      // phase 1: identity
      log.step(1, totalPhases, "project identity");
      let projectName = "shockstack";
      if (!auto) {
        projectName = await input({
          message: "project name:",
          default: "shockstack",
        });
      }

      const pkgPath = resolve(root, "package.json");
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      pkg.name = projectName;
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
      log.success(`project name set to: ${projectName}`);

      // phase 2: feature selection
      log.blank();
      log.step(2, totalPhases, "feature selection");

      let wantBackend = true;
      let wantAuth = true;
      let wantBlog = true;

      if (!auto) {
        wantBackend = await confirm({
          message: "include .NET backend?",
          default: true,
        });
        wantAuth = await confirm({
          message: "include authentication?",
          default: true,
        });
        wantBlog = await confirm({ message: "include blog?", default: true });
      }

      // phase 3: strip unwanted features
      log.blank();
      log.step(3, totalPhases, "stripping unused features");

      const ctx = getContext(root);
      const toStrip: string[] = [];
      if (!wantBackend && ctx.features.backend) toStrip.push("backend");
      if (!wantAuth && ctx.features.auth) toStrip.push("auth");
      if (!wantBlog && ctx.features.blog) toStrip.push("blog");

      if (toStrip.length > 0) {
        warnIfDirty(root);

        if (!auto) {
          log.warn(`will remove: ${toStrip.join(", ")}`);
          const ok = await confirm({ message: "proceed?", default: true });
          if (!ok) {
            log.info("aborted.");
            process.exit(0);
          }
        }

        const stripPaths: Record<string, string[]> = {
          backend: ["backend", "docker/backend.Dockerfile"],
          auth: [
            "frontend/src/lib/auth.ts",
            "frontend/src/lib/auth-client.ts",
            "frontend/src/pages/login.astro",
            "frontend/src/pages/register.astro",
            "frontend/src/pages/api/auth",
            "frontend/src/components/ui/AuthForm.vue",
            "frontend/src/components/settings",
          ],
          blog: ["frontend/src/content/blog", "frontend/src/pages/blog"],
        };

        for (const feature of toStrip) {
          for (const p of stripPaths[feature] || []) {
            const full = resolve(root, p);
            if (existsSync(full)) {
              rmSync(full, { recursive: true, force: true });
            }
          }
          log.success(`stripped: ${feature}`);
        }
      } else {
        log.success("keeping all features.");
      }

      // phase 4: environment
      log.blank();
      log.step(4, totalPhases, "environment setup");

      const envPath = resolve(root, ".env");
      const envExamplePath = resolve(root, ".env.example");

      if (!existsSync(envPath) && existsSync(envExamplePath)) {
        let envContent = readFileSync(envExamplePath, "utf-8");
        const secret = randomBytes(32).toString("hex");
        envContent = envContent.replace("change-me-to-a-random-secret", secret);
        writeFileSync(envPath, envContent);
        log.success(".env created from .env.example with generated secret.");
      } else if (existsSync(envPath)) {
        log.success(".env already exists.");
      } else {
        log.warn(".env.example not found. create .env manually.");
      }

      // phase 5: install + build
      log.blank();
      log.step(5, totalPhases, "installing dependencies");

      let code = await runAsync("pnpm", ["install"], root);
      if (code !== 0) {
        log.error(
          "pnpm install failed. fix the issue and run 'ss init' again.",
        );
        process.exit(code);
      }

      log.step(5, totalPhases, "building tokens...");
      code = await runAsync("pnpm", ["tokens:build"], root);
      if (code !== 0) {
        log.error("token build failed. run 'pnpm tokens:build' manually.");
        process.exit(code);
      }

      // phase 6: doctor check
      log.blank();
      log.step(6, totalPhases, "running health check");
      try {
        execFileSync("ss", ["doctor"], { cwd: root, stdio: "inherit" });
      } catch {
        log.warn(
          "some checks failed. review above and fix before running 'ss dev'.",
        );
      }

      // phase 7: done
      log.blank();
      log.step(7, totalPhases, "done!");
      log.blank();
      log.success("ShockStack is ready.");
      log.info("run 'ss dev' to start developing.");
    });
}
```

**Step 2: Register in entry point**

Add to `bin/ss.ts`:

```typescript
import { registerInit } from "./commands/init.js";
registerInit(program);
```

**Step 3: Test**

Run: `ss init --help`
Expected: shows --yes and --skip-prompts flags

**Step 4: Commit**

```bash
git add bin/commands/init.ts bin/ss.ts
git commit -m "feat(cli): add ss init wizard with phased setup"
```

---

### Task 12: Final Wiring + Lint + Test

**Files:**

- Modify: `bin/ss.ts` (final state with all imports)

**Step 1: Verify final entry point has all commands**

`bin/ss.ts` should have all imports:

```typescript
#!/usr/bin/env tsx
import { Command } from "commander";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { registerInit } from "./commands/init.js";
import { registerDoctor } from "./commands/doctor.js";
import { registerInfo } from "./commands/info.js";
import { registerDev } from "./commands/dev.js";
import { registerDb } from "./commands/db.js";
import { registerAdd } from "./commands/add.js";
import { registerStrip } from "./commands/strip.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8"),
);

const program = new Command()
  .name("ss")
  .description("ShockStack developer experience CLI")
  .version(pkg.version);

registerInit(program);
registerDoctor(program);
registerInfo(program);
registerDev(program);
registerAdd(program);
registerStrip(program);
registerDb(program);

program.parse();
```

**Step 2: Run lint**

Run: `cd /home/shockbirds/dev/shockstack && pnpm lint`
Expected: passes or shows fixable warnings only

**Step 3: Test all commands**

Run:

```bash
ss --help
ss doctor
ss info
ss dev --help
ss add --help
ss db --help
ss strip --help
ss init --help
```

Expected: all commands show help text, doctor and info run successfully

**Step 4: Final commit**

```bash
git add -A bin/
git commit -m "feat(cli): complete ss CLI v1 with all commands wired"
```

---

## Rollout Summary

| Task | Command     | What it builds                         |
| ---- | ----------- | -------------------------------------- |
| 1    | —           | entry point + wiring                   |
| 2    | —           | log.ts (styled output)                 |
| 3    | —           | detect.ts + context.ts (project state) |
| 4    | —           | guards.ts (safety checks)              |
| 5    | `ss doctor` | prerequisite checker                   |
| 6    | `ss info`   | project state display                  |
| 7    | `ss dev`    | smart dev server                       |
| 8    | `ss db`     | database commands                      |
| 9    | `ss add`    | scaffolding                            |
| 10   | `ss strip`  | feature removal                        |
| 11   | `ss init`   | setup wizard                           |
| 12   | —           | final wiring + test                    |
