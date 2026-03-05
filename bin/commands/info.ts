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
