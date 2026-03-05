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
