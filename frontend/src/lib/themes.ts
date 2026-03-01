export const THEME_OPTIONS = [
  { value: "dark", label: "Dracula" },
  { value: "light", label: "Alucard" },
  { value: "nord", label: "Nord" },
  { value: "gruvbox", label: "Gruvbox" },
  { value: "midnight", label: "Midnight" },
  { value: "dawn", label: "Dawn" },
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
