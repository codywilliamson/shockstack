export const heroOptions = [
  {
    id: "launchpad",
    label: "Launchpad",
    accent: "cyan",
    panelClass: "hero-showcase__panel--launchpad",
  },
  {
    id: "control-room",
    label: "Control Room",
    accent: "green",
    panelClass: "hero-showcase__panel--control-room",
  },
  {
    id: "blueprint",
    label: "Blueprint",
    accent: "purple",
    panelClass: "hero-showcase__panel--blueprint",
  },
  {
    id: "release-train",
    label: "Release Train",
    accent: "orange",
    panelClass: "hero-showcase__panel--release-train",
  },
  {
    id: "operator-desk",
    label: "Operator Desk",
    accent: "pink",
    panelClass: "hero-showcase__panel--operator-desk",
  },
  {
    id: "signal-grid",
    label: "Signal Grid",
    accent: "cyan",
    panelClass: "hero-showcase__panel--signal-grid",
  },
] as const;

export type HeroOption = (typeof heroOptions)[number];
