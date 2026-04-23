export const features = [
  {
    title: "Astro 5 SSR",
    description:
      "Island architecture with server-side rendering. Deploy to Cloudflare Workers or Docker.",
    color: "orange",
    svgInner: `<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>`,
  },
  {
    title: "Vue 3 Islands",
    description:
      "Interactive components hydrate on demand. Ship zero JS by default, add reactivity where needed.",
    color: "green",
    svgInner: `<path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle>`,
  },
  {
    title: "Design Tokens",
    description:
      "Style Dictionary v5 generates CSS vars, Tailwind config, TS constants, and JSON from a single source.",
    color: "purple",
    svgInner: `<circle cx="13.5" cy="6.5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="12" r="2.5"></circle><circle cx="13.5" cy="17.5" r="2.5"></circle>`,
  },
  {
    title: "Better Auth",
    description:
      "Email/password and OAuth out of the box. JWT validation shared with the .NET backend.",
    color: "pink",
    svgInner: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path>`,
  },
  {
    title: ".NET 10 Backend",
    description:
      "Optional clean architecture API with EF Core, Aspire orchestration, and shared auth.",
    color: "cyan",
    svgInner: `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>`,
  },
  {
    title: "Tailwind 4",
    description:
      "Latest Tailwind with Vite plugin integration. Token-powered theme with fourteen built-in palettes.",
    color: "yellow",
    svgInner: `<path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path>`,
  },
  {
    title: "CI/CD Pipeline",
    description:
      "GitHub Actions with semantic-release, commitlint, and automated deployments baked in.",
    color: "green",
    svgInner: `<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>`,
  },
  {
    title: "Docker Ready",
    description:
      "Multi-stage Dockerfiles, compose configs, and Aspire AppHost for single-command orchestration.",
    color: "orange",
    svgInner: `<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>`,
  },
] as const satisfies {
  title: string;
  description: string;
  color: string;
  svgInner: string;
}[];
