export const THEME_OPTIONS = [
  {
    value: "dark",
    label: "Dracula",
    preview: {
      page: "#282a36",
      surface: "#44475a",
      accent: "#bd93f9",
      text: "#f8f8f2",
    },
  },
  {
    value: "light",
    label: "Alucard",
    preview: {
      page: "#f8f8f2",
      surface: "#e8e8e0",
      accent: "#7c3aed",
      text: "#282a36",
    },
  },
  {
    value: "nord",
    label: "Nord",
    preview: {
      page: "#2e3440",
      surface: "#3b4252",
      accent: "#88c0d0",
      text: "#eceff4",
    },
  },
  {
    value: "gruvbox",
    label: "Gruvbox",
    preview: {
      page: "#282828",
      surface: "#3c3836",
      accent: "#b8bb26",
      text: "#ebdbb2",
    },
  },
  {
    value: "gruvbox-light",
    label: "Gruvbox Light",
    preview: {
      page: "#fbf1c7",
      surface: "#ebdbb2",
      accent: "#79740e",
      text: "#3c3836",
    },
  },
  {
    value: "midnight",
    label: "Midnight",
    preview: {
      page: "#0b1020",
      surface: "#121a2f",
      accent: "#22d3ee",
      text: "#e6edf7",
    },
  },
  {
    value: "dawn",
    label: "Dawn",
    preview: {
      page: "#faf4ed",
      surface: "#f2e9de",
      accent: "#907aa9",
      text: "#575279",
    },
  },
] as const;

export type ThemeName = (typeof THEME_OPTIONS)[number]["value"];

export const VALID_THEMES: ThemeName[] = THEME_OPTIONS.map(
  (theme) => theme.value,
);

export const DEFAULT_THEME: ThemeName = "dark";
export const LIGHT_PREFERRED_THEME: ThemeName = "light";

export function isThemeName(value: string | null): value is ThemeName {
  if (value === null) return false;
  return VALID_THEMES.includes(value as ThemeName);
}
