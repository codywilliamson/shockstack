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
