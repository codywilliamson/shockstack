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

export function toPascalCase(str: string): string {
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
