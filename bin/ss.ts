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
