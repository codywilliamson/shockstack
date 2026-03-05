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

export function semverGte(version: string, min: string): boolean {
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
