#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const rootDir = process.cwd();

const checkSets = [
  {
    type: "directory",
    path: "docs/system",
    extensions: new Set([".md", ".mdx"]),
    checkDeepPaths: true,
  },
  {
    type: "directory",
    path: "frontend/src/content/docs",
    extensions: new Set([".md", ".mdx"]),
    checkDeepPaths: true,
  },
  {
    type: "file",
    path: "README.md",
    checkDeepPaths: false,
  },
];

const frameworkVersionRegex =
  /\b(?:Astro|Vue|Tailwind|React|Next(?:\.js)?|Nuxt|Svelte|Angular|Node(?:\.js)?|pnpm|npm|TypeScript|ESLint|Prettier|\.NET|Style Dictionary)\s+v?\d+(?:\.\d+){0,2}\+?\b/i;
const semverRegex = /\bv\d+\.\d+(?:\.\d+)?\b|\b\d+\.\d+\.\d+\b/;
const comparatorRegex = /\b(?:>=|<=|>|<)\s*\d+(?:\.\d+)?\b/;
const inlineCodeRegex = /`([^`]+)`/g;

function walkDirectory(directoryPath, extensions) {
  const results = [];

  for (const entry of readdirSync(directoryPath)) {
    const fullPath = join(directoryPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...walkDirectory(fullPath, extensions));
      continue;
    }

    if (extensions.has(extname(fullPath))) {
      results.push(fullPath);
    }
  }

  return results;
}

function isDeepPathReference(value) {
  const candidate = value.trim();

  if (!candidate || candidate.includes(" ")) {
    return false;
  }

  if (/^(https?:\/\/|mailto:|#)/i.test(candidate)) {
    return false;
  }

  if (/[\[\]{}*]/.test(candidate)) {
    return false;
  }

  if (!candidate.includes("/")) {
    return false;
  }

  const normalized = candidate.replace(/^[./]+/, "");
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length < 3) {
    return false;
  }

  const endsWithFile = /\.[A-Za-z0-9]+$/.test(segments.at(-1) ?? "");
  const rootedProjectPath =
    /^(frontend|backend|packages|docs|docker|\.github|src)$/.test(
      segments[0] ?? "",
    );

  return endsWithFile || rootedProjectPath;
}

function sanitizeLineForVersionCheck(line) {
  return line.replace(/https?:\/\/\S+/g, "").replace(/\[[^\]]*]\([^)]+\)/g, "");
}

function scanFile(filePath, options) {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const violations = [];

  let inFence = false;
  let inFrontmatter = false;
  const hasFrontmatter = lines[0]?.trim() === "---";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (hasFrontmatter && lineNumber === 1) {
      inFrontmatter = true;
      continue;
    }

    if (inFrontmatter) {
      if (trimmed === "---") {
        inFrontmatter = false;
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      inFence = !inFence;
      continue;
    }

    if (inFence || trimmed.includes("docs-check:ignore-line")) {
      continue;
    }

    if (!trimmed.includes("docs-check:ignore-version")) {
      const sanitizedLine = sanitizeLineForVersionCheck(line);
      if (
        frameworkVersionRegex.test(sanitizedLine) ||
        semverRegex.test(sanitizedLine) ||
        comparatorRegex.test(sanitizedLine)
      ) {
        violations.push({
          file: relative(rootDir, filePath),
          line: lineNumber,
          rule: "version-reference",
          message: "Avoid hardcoded version numbers in docs narrative text.",
          snippet: trimmed,
        });
      }
    }

    if (!options.checkDeepPaths || trimmed.includes("docs-check:ignore-path")) {
      continue;
    }

    inlineCodeRegex.lastIndex = 0;
    let match = inlineCodeRegex.exec(line);
    while (match) {
      const codeSpan = match[1] ?? "";
      if (isDeepPathReference(codeSpan)) {
        violations.push({
          file: relative(rootDir, filePath),
          line: lineNumber,
          rule: "deep-path-reference",
          message: "Avoid deep file path references in docs prose.",
          snippet: `\`${codeSpan}\``,
        });
      }
      match = inlineCodeRegex.exec(line);
    }
  }

  return violations;
}

function collectFilesToScan() {
  const files = [];

  for (const set of checkSets) {
    const fullPath = join(rootDir, set.path);
    let pathExists = true;
    try {
      statSync(fullPath);
    } catch {
      pathExists = false;
    }

    if (!pathExists) {
      continue;
    }

    if (set.type === "file") {
      files.push({ filePath: fullPath, checkDeepPaths: set.checkDeepPaths });
      continue;
    }

    const directoryFiles = walkDirectory(fullPath, set.extensions);
    for (const filePath of directoryFiles) {
      files.push({ filePath, checkDeepPaths: set.checkDeepPaths });
    }
  }

  return files.sort((a, b) => a.filePath.localeCompare(b.filePath));
}

const filesToScan = collectFilesToScan();
const allViolations = [];

for (const file of filesToScan) {
  const violations = scanFile(file.filePath, {
    checkDeepPaths: file.checkDeepPaths,
  });
  allViolations.push(...violations);
}

if (allViolations.length > 0) {
  console.error("docs style check failed");
  console.error("");

  for (const violation of allViolations) {
    console.error(
      `${violation.file}:${violation.line} [${violation.rule}] ${violation.message}`,
    );
    if (violation.snippet) {
      console.error(`  -> ${violation.snippet}`);
    }
  }

  console.error("");
  console.error(
    "use concept-focused language and avoid version pins or deep implementation paths in docs prose.",
  );
  process.exit(1);
}

console.log(`docs style check passed (${filesToScan.length} files scanned)`);
