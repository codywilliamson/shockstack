<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  THEME_OPTIONS,
  DEFAULT_THEME,
  LIGHT_PREFERRED_THEME,
  isThemeName,
  type ThemeName,
} from "../../lib/themes";

const theme = ref<ThemeName>(DEFAULT_THEME);

function applyTheme(nextTheme: ThemeName) {
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
}

onMounted(() => {
  const stored = localStorage.getItem("theme");
  if (isThemeName(stored)) {
    theme.value = stored;
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    theme.value = LIGHT_PREFERRED_THEME;
  }

  applyTheme(theme.value);
});

function handleThemeChange() {
  applyTheme(theme.value);
}
</script>

<template>
  <label
    for="theme-select"
    class="sr-only"
  > Theme </label>
  <select
    id="theme-select"
    v-model="theme"
    class="border-border-default bg-bg-secondary text-fg-secondary hover:text-fg-primary focus:border-accent-purple w-28 rounded-md border px-2 py-1.5 text-xs transition-colors outline-none sm:w-32 sm:text-sm"
    aria-label="Select theme"
    @change="handleThemeChange"
  >
    <option
      v-for="option in THEME_OPTIONS"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>
