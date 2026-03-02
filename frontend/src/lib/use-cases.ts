export const stackOptionIds = [
  "astro",
  "vue",
  "tailwind",
  "tokens",
  "auth",
  "drizzle",
  "dotnet-api",
  "aspire",
  "docker",
] as const;

export type StackOptionId = (typeof stackOptionIds)[number];

export interface StackOption {
  id: StackOptionId;
  label: string;
  includeWhen: string;
  skipWhen: string;
}

export interface StackUseCase {
  id: string;
  title: string;
  summary: string;
  outcomes: string[];
  include: StackOptionId[];
  skip: StackOptionId[];
}

export const stackOptions: Record<StackOptionId, StackOption> = {
  astro: {
    id: "astro",
    label: "Astro SSR",
    includeWhen: "You want fast first paint and mostly static routes.",
    skipWhen: "You need a pure SPA with client-side routing everywhere.",
  },
  vue: {
    id: "vue",
    label: "Vue Islands",
    includeWhen: "You have interactive widgets or forms in isolated spots.",
    skipWhen: "Your pages are static and only need server-rendered HTML.",
  },
  tailwind: {
    id: "tailwind",
    label: "Tailwind v4",
    includeWhen: "You want speed and consistent utility-driven styling.",
    skipWhen: "Your team already has an established component CSS system.",
  },
  tokens: {
    id: "tokens",
    label: "Design Tokens",
    includeWhen: "Multiple apps or themes need one shared visual language.",
    skipWhen: "Single throwaway prototype with no long-term design reuse.",
  },
  auth: {
    id: "auth",
    label: "Better Auth",
    includeWhen: "Users need sign in, sessions, roles, or OAuth providers.",
    skipWhen: "Public-only marketing/docs with no protected user flows.",
  },
  drizzle: {
    id: "drizzle",
    label: "Drizzle ORM",
    includeWhen: "Type-safe SQL and migrations are part of the frontend app.",
    skipWhen: "Your backend owns all data access behind APIs already.",
  },
  "dotnet-api": {
    id: "dotnet-api",
    label: ".NET 10 API",
    includeWhen:
      "You need domain-heavy APIs, background jobs, or strict layering.",
    skipWhen:
      "Frontend-only site or lightweight API needs only in Astro endpoints.",
  },
  aspire: {
    id: "aspire",
    label: ".NET Aspire AppHost",
    includeWhen:
      "You run multiple local services and want one-command orchestration.",
    skipWhen: "Single-process app without service orchestration complexity.",
  },
  docker: {
    id: "docker",
    label: "Docker Compose",
    includeWhen: "You want reproducible local/CI environments across machines.",
    skipWhen:
      "Team is fully local-native and infra parity is not a concern yet.",
  },
};

export const stackUseCases: StackUseCase[] = [
  {
    id: "saas-dashboard",
    title: "B2B SaaS Dashboard",
    summary:
      "Build an authenticated product UI with fast docs/marketing routes and interactive account features.",
    outcomes: [
      "public marketing routes stay fast",
      "private dashboard ships only needed JS",
      "auth and data models evolve safely",
    ],
    include: ["astro", "vue", "tailwind", "tokens", "auth", "drizzle"],
    skip: ["dotnet-api", "aspire"],
  },
  {
    id: "internal-ops",
    title: "Internal Ops Portal",
    summary:
      "Ship admin tools for support, billing, and reporting with stronger backend boundaries.",
    outcomes: [
      "clear domain/service layers",
      "durable audit-friendly APIs",
      "stable local environments across devs",
    ],
    include: [
      "astro",
      "vue",
      "tailwind",
      "tokens",
      "auth",
      "dotnet-api",
      "aspire",
      "docker",
    ],
    skip: ["drizzle"],
  },
  {
    id: "content-platform",
    title: "Content + Docs Platform",
    summary:
      "Run docs, changelog, and blog content with optional light interactivity and theme controls.",
    outcomes: [
      "SEO-first static content",
      "clean writing workflow via content collections",
      "lightweight themed components",
    ],
    include: ["astro", "tailwind", "tokens"],
    skip: ["auth", "drizzle", "dotnet-api", "aspire"],
  },
  {
    id: "startup-mvp",
    title: "Startup MVP",
    summary:
      "Launch quickly with minimal moving pieces, then progressively enable backend and orchestration when needed.",
    outcomes: [
      "faster first release",
      "easy path to add auth/data later",
      "no early platform overbuild",
    ],
    include: ["astro", "vue", "tailwind", "tokens"],
    skip: ["dotnet-api", "aspire", "docker"],
  },
  {
    id: "multi-tenant-platform",
    title: "Multi-Tenant Platform",
    summary:
      "Scale a product with strict auth boundaries, richer APIs, and reproducible full-stack environments.",
    outcomes: [
      "tenant-aware auth + roles",
      "backend ownership of domain complexity",
      "consistent local and CI orchestration",
    ],
    include: [
      "astro",
      "vue",
      "tailwind",
      "tokens",
      "auth",
      "dotnet-api",
      "aspire",
      "docker",
    ],
    skip: ["drizzle"],
  },
];
