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
