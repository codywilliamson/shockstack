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
  examples: string[];
  bestFor: string;
  tradeoffs: string[];
  nextSteps: { label: string; href: string };
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
    examples: [
      "Linear-style product dashboards",
      "Notion-style workspaces",
      "Vercel-style deploy UIs",
    ],
    bestFor:
      "Teams shipping a commercial SaaS with a marketing surface and an authenticated product.",
    tradeoffs: [
      "Astro endpoints handle most API work; adopt .NET only if domain logic outgrows them",
      "Drizzle keeps migrations with the app — easy early, watch coupling as teams split",
    ],
    nextSteps: {
      label: "Start with the setup guide",
      href: "/docs/getting-started",
    },
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
    examples: [
      "Support tooling",
      "Billing admin consoles",
      "Ops dashboards for finance/CS",
    ],
    bestFor:
      "Internal tools that need strict auth, audit trails, and service boundaries from day one.",
    tradeoffs: [
      ".NET + Aspire adds orchestration overhead, pays off once you have 2+ services",
      "Docker parity matters the moment more than one dev touches infra",
    ],
    nextSteps: { label: "Read the backend guide", href: "/docs/backend" },
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
    examples: [
      "Product documentation sites",
      "Developer changelogs",
      "Marketing + blog hubs",
    ],
    bestFor:
      "Content-heavy sites where SEO, read time, and authoring flow matter most.",
    tradeoffs: [
      "Keep JS opt-in per island; don't reach for Vue unless the page genuinely needs it",
      "Skip auth/data until you actually have private content or comments",
    ],
    nextSteps: { label: "See content collections", href: "/docs/content" },
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
    examples: [
      "Landing + waitlist + demo app",
      "Early YC-stage products",
      "Solo-founder prototypes",
    ],
    bestFor:
      "Founders validating an idea who need shippable today, not a scalable platform tomorrow.",
    tradeoffs: [
      "Add auth + drizzle the moment you have real users",
      "Docker/.NET arrive when the second service or second dev does",
    ],
    nextSteps: {
      label: "Quickstart in 2 minutes",
      href: "/docs/getting-started",
    },
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
    examples: [
      "Agency platforms with per-client workspaces",
      "Vertical SaaS with org/teams",
      "Enterprise portals",
    ],
    bestFor:
      "Products where tenancy, RBAC, and cross-service data integrity are first-class concerns.",
    tradeoffs: [
      "Higher ceiling means more moving parts — invest in observability early",
      "Backend owns data, so keep the frontend thin on business logic",
    ],
    nextSteps: { label: "Read the auth + tenancy guide", href: "/docs/auth" },
  },
  {
    id: "ecommerce-storefront",
    title: "E-commerce Storefront",
    summary:
      "Ship a fast, SEO-first storefront with interactive cart/checkout and a persistent product catalog.",
    outcomes: [
      "category + product pages stay fast and indexable",
      "cart + account flows hydrate only where needed",
      "inventory + orders live in typed SQL from day one",
    ],
    include: ["astro", "vue", "tailwind", "tokens", "auth", "drizzle"],
    skip: ["dotnet-api", "aspire"],
    examples: [
      "D2C storefronts",
      "Headless Shopify replacements",
      "Subscription product sites",
    ],
    bestFor:
      "Storefronts where conversion hinges on page speed and the cart must feel snappy.",
    tradeoffs: [
      "Keep payments behind server endpoints; never trust the island",
      "Adopt Docker the moment a warehouse/ERP integration lands",
    ],
    nextSteps: { label: "See the database guide", href: "/docs/database" },
  },
  {
    id: "api-first-devtool",
    title: "API-First Dev Tool",
    summary:
      "Pair a polished docs/marketing site with a serious typed backend for CLI, SDK, or API products.",
    outcomes: [
      "docs and quickstarts feel instant",
      "API owns schema, auth, and versioning",
      "one command boots the whole dev loop",
    ],
    include: ["astro", "tailwind", "tokens", "dotnet-api", "aspire", "docker"],
    skip: ["vue", "drizzle"],
    examples: [
      "Developer platforms with CLIs",
      "SDK + API products",
      "Webhook/infra tooling",
    ],
    bestFor:
      "Teams whose product is an API and whose site's job is to make it legible.",
    tradeoffs: [
      "Frontend stays mostly static — resist sneaking a SPA in",
      "Aspire earns its keep once you have API + worker + db locally",
    ],
    nextSteps: { label: "Read the API guide", href: "/docs/backend" },
  },
];

// picker questions + scoring

export type PickerQuestionId =
  | "projectType"
  | "users"
  | "data"
  | "backend"
  | "infra";

export interface PickerOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  optionWeights: Partial<Record<StackOptionId, number>>;
  useCaseWeights: Partial<Record<string, number>>;
}

export interface PickerQuestion {
  id: PickerQuestionId;
  prompt: string;
  helper: string;
  options: PickerOption[];
}

export const pickerQuestions: PickerQuestion[] = [
  {
    id: "projectType",
    prompt: "What are you building?",
    helper: "Pick the closest fit — you can nudge the answer later.",
    options: [
      {
        id: "marketing",
        label: "Marketing + docs",
        description: "A site whose job is content, SEO, and first impressions.",
        icon: "content-platform",
        optionWeights: { astro: 3, tailwind: 2, tokens: 2 },
        useCaseWeights: { "content-platform": 6 },
      },
      {
        id: "saas",
        label: "SaaS product",
        description: "A marketing surface plus an authenticated app.",
        icon: "saas-dashboard",
        optionWeights: { vue: 2, auth: 2, drizzle: 2 },
        useCaseWeights: { "saas-dashboard": 6, "multi-tenant-platform": 2 },
      },
      {
        id: "internal",
        label: "Internal tool",
        description: "Ops, support, billing — used by your own team.",
        icon: "internal-ops",
        optionWeights: { vue: 2, auth: 3, "dotnet-api": 3 },
        useCaseWeights: { "internal-ops": 6 },
      },
      {
        id: "mvp",
        label: "MVP / prototype",
        description: "Small surface, shipping today, refactor tomorrow.",
        icon: "startup-mvp",
        optionWeights: { astro: 2, vue: 1, tailwind: 2 },
        useCaseWeights: { "startup-mvp": 6 },
      },
      {
        id: "ecommerce",
        label: "Storefront",
        description: "Products, cart, checkout — conversion matters.",
        icon: "ecommerce-storefront",
        optionWeights: { vue: 2, drizzle: 3, auth: 2 },
        useCaseWeights: { "ecommerce-storefront": 6 },
      },
      {
        id: "devtool",
        label: "API / dev tool",
        description: "Your product is an API, CLI, or SDK. The site sells it.",
        icon: "api-first-devtool",
        optionWeights: { "dotnet-api": 3, docker: 2 },
        useCaseWeights: { "api-first-devtool": 6 },
      },
    ],
  },
  {
    id: "users",
    prompt: "Who uses it, and how?",
    helper: "Auth needs shape half the stack.",
    options: [
      {
        id: "public",
        label: "Public only",
        description: "Anonymous visitors, no login.",
        icon: "content-platform",
        optionWeights: { auth: -3 },
        useCaseWeights: { "content-platform": 3, "startup-mvp": 1 },
      },
      {
        id: "signed-in",
        label: "Sign-in required",
        description: "Users have accounts and sessions.",
        icon: "saas-dashboard",
        optionWeights: { auth: 4, drizzle: 1 },
        useCaseWeights: { "saas-dashboard": 2, "ecommerce-storefront": 2 },
      },
      {
        id: "roles",
        label: "Roles + permissions",
        description: "Admins, members, fine-grained access.",
        icon: "internal-ops",
        optionWeights: { auth: 4, "dotnet-api": 2 },
        useCaseWeights: { "internal-ops": 3, "multi-tenant-platform": 2 },
      },
      {
        id: "multi-tenant",
        label: "Multi-tenant",
        description: "Orgs, teams, workspaces with isolated data.",
        icon: "multi-tenant-platform",
        optionWeights: { auth: 4, "dotnet-api": 3, docker: 2 },
        useCaseWeights: { "multi-tenant-platform": 6 },
      },
    ],
  },
  {
    id: "data",
    prompt: "How much data lives in your app?",
    helper: "This decides whether Drizzle pulls its weight.",
    options: [
      {
        id: "none",
        label: "None",
        description: "Everything's static or content-collections.",
        icon: "content-platform",
        optionWeights: { drizzle: -3 },
        useCaseWeights: { "content-platform": 3, "startup-mvp": 1 },
      },
      {
        id: "light",
        label: "Light CMS-ish",
        description: "A bit of user-generated content, comments, forms.",
        icon: "saas-dashboard",
        optionWeights: { drizzle: 2 },
        useCaseWeights: { "saas-dashboard": 1 },
      },
      {
        id: "crud",
        label: "Real CRUD",
        description: "Users create and own core product data.",
        icon: "ecommerce-storefront",
        optionWeights: { drizzle: 3, auth: 1 },
        useCaseWeights: { "saas-dashboard": 2, "ecommerce-storefront": 3 },
      },
      {
        id: "domain-heavy",
        label: "Domain-heavy",
        description: "Workflows, background jobs, strict invariants.",
        icon: "internal-ops",
        optionWeights: { "dotnet-api": 4, aspire: 2 },
        useCaseWeights: { "internal-ops": 3, "multi-tenant-platform": 3 },
      },
    ],
  },
  {
    id: "backend",
    prompt: "Where does the backend live?",
    helper: "Astro endpoints are great — until they aren't.",
    options: [
      {
        id: "frontend-only",
        label: "Frontend-only",
        description: "No server code to speak of.",
        icon: "content-platform",
        optionWeights: { "dotnet-api": -4, aspire: -3 },
        useCaseWeights: { "content-platform": 3, "startup-mvp": 2 },
      },
      {
        id: "astro-endpoints",
        label: "Astro endpoints",
        description: "A few API routes next to my pages.",
        icon: "saas-dashboard",
        optionWeights: { drizzle: 2, "dotnet-api": -2 },
        useCaseWeights: {
          "saas-dashboard": 2,
          "ecommerce-storefront": 1,
          "startup-mvp": 1,
        },
      },
      {
        id: "dotnet",
        label: "Dedicated .NET API",
        description: "Separate service, typed domain, its own lifecycle.",
        icon: "api-first-devtool",
        optionWeights: { "dotnet-api": 4, drizzle: -2 },
        useCaseWeights: {
          "internal-ops": 2,
          "api-first-devtool": 3,
          "multi-tenant-platform": 2,
        },
      },
      {
        id: "multi-service",
        label: "Multi-service",
        description: "API + workers + queues + more.",
        icon: "multi-tenant-platform",
        optionWeights: { "dotnet-api": 4, aspire: 4, docker: 2 },
        useCaseWeights: { "multi-tenant-platform": 3, "internal-ops": 2 },
      },
    ],
  },
  {
    id: "infra",
    prompt: "How do you want to run it locally?",
    helper: "Infra parity is cheap early and expensive late.",
    options: [
      {
        id: "native",
        label: "Local-native",
        description: "Fastest feedback loop, skip containers.",
        icon: "startup-mvp",
        optionWeights: { docker: -3, aspire: -1 },
        useCaseWeights: { "startup-mvp": 2, "content-platform": 1 },
      },
      {
        id: "docker",
        label: "Docker parity",
        description: "Everyone gets the same stack on every machine.",
        icon: "ecommerce-storefront",
        optionWeights: { docker: 4 },
        useCaseWeights: { "ecommerce-storefront": 1, "internal-ops": 1 },
      },
      {
        id: "aspire",
        label: "Aspire orchestration",
        description: "One command to boot every service.",
        icon: "multi-tenant-platform",
        optionWeights: { aspire: 4, docker: 2, "dotnet-api": 1 },
        useCaseWeights: {
          "multi-tenant-platform": 2,
          "internal-ops": 2,
          "api-first-devtool": 2,
        },
      },
    ],
  },
];

export type PickerAnswers = Partial<Record<PickerQuestionId, string>>;

export interface PickerResult {
  winner: StackUseCase;
  runnerUp: StackUseCase | null;
  includeChips: StackOptionId[];
  skipChips: StackOptionId[];
  reasons: string[];
}

const ALL_OPTIONS = stackOptionIds;

export function scoreAnswers(answers: PickerAnswers): PickerResult {
  const optionScores: Record<StackOptionId, number> = Object.fromEntries(
    ALL_OPTIONS.map((id) => [id, 0]),
  ) as Record<StackOptionId, number>;

  const useCaseScores: Record<string, number> = Object.fromEntries(
    stackUseCases.map((uc) => [uc.id, 0]),
  );

  const reasons: string[] = [];

  for (const question of pickerQuestions) {
    const answerId = answers[question.id];
    if (!answerId) continue;
    const option = question.options.find((o) => o.id === answerId);
    if (!option) continue;

    for (const [optId, weight] of Object.entries(option.optionWeights)) {
      optionScores[optId as StackOptionId] += weight ?? 0;
    }
    for (const [ucId, weight] of Object.entries(option.useCaseWeights)) {
      useCaseScores[ucId] = (useCaseScores[ucId] ?? 0) + (weight ?? 0);
    }

    reasons.push(reasonFor(question, option));
  }

  const ranked = [...stackUseCases].sort(
    (a, b) => (useCaseScores[b.id] ?? 0) - (useCaseScores[a.id] ?? 0),
  );
  const winner = ranked[0] ?? stackUseCases[0];
  const runnerUp =
    ranked[1] && useCaseScores[ranked[1].id] > 0 ? ranked[1] : null;

  const include = new Set<StackOptionId>(winner.include);
  const skip = new Set<StackOptionId>(winner.skip);

  for (const id of ALL_OPTIONS) {
    const score = optionScores[id];
    if (score >= 3 && !include.has(id)) {
      include.add(id);
      skip.delete(id);
    } else if (score <= -3 && !skip.has(id)) {
      skip.add(id);
      include.delete(id);
    }
  }

  // coherence: aspire requires .net api
  if (include.has("aspire") && !include.has("dotnet-api")) {
    include.add("dotnet-api");
    skip.delete("dotnet-api");
  }
  // coherence: if skipping .net api, also skip aspire
  if (skip.has("dotnet-api") && include.has("aspire")) {
    include.delete("aspire");
    skip.add("aspire");
  }

  return {
    winner,
    runnerUp,
    includeChips: ALL_OPTIONS.filter((id) => include.has(id)),
    skipChips: ALL_OPTIONS.filter((id) => skip.has(id)),
    reasons,
  };
}

function reasonFor(question: PickerQuestion, option: PickerOption): string {
  switch (question.id) {
    case "projectType":
      return `You're shipping a ${option.label.toLowerCase()}.`;
    case "users":
      return `Users: ${option.label.toLowerCase()}.`;
    case "data":
      return `Data posture: ${option.label.toLowerCase()}.`;
    case "backend":
      return `Backend: ${option.label.toLowerCase()}.`;
    case "infra":
      return `Infra: ${option.label.toLowerCase()}.`;
  }
}
