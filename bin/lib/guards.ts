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
