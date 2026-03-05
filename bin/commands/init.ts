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
