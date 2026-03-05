const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};

export const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}!${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  step: (current: number, total: number, msg: string) =>
    console.log(`${colors.dim}[${current}/${total}]${colors.reset} ${msg}`),
  dim: (msg: string) => console.log(`${colors.dim}${msg}${colors.reset}`),
  blank: () => console.log(),
};

export function table(
  rows: {
    label: string;
    value: string;
    status?: "pass" | "fail" | "warn" | "skip";
  }[],
) {
  const maxLabel = Math.max(...rows.map((r) => r.label.length));
  for (const row of rows) {
    const icon =
      row.status === "pass"
        ? `${colors.green}✓`
        : row.status === "fail"
          ? `${colors.red}✗`
          : row.status === "warn"
            ? `${colors.yellow}!`
            : row.status === "skip"
              ? `${colors.dim}–`
              : " ";
    console.log(
      `  ${icon}${colors.reset} ${row.label.padEnd(maxLabel + 2)}${row.value}`,
    );
  }
}
