<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  THEME_OPTIONS,
  DEFAULT_THEME,
  LIGHT_PREFERRED_THEME,
  isThemeName,
  type ThemeName,
} from "../../lib/themes";

const theme = ref<ThemeName>(DEFAULT_THEME);
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);

const selectedTheme = computed(
  () =>
    THEME_OPTIONS.find((option) => option.value === theme.value) ??
    THEME_OPTIONS[0],
);

function applyTheme(nextTheme: ThemeName) {
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
}

function closeDropdown() {
  isOpen.value = false;
}

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectTheme(nextTheme: ThemeName) {
  theme.value = nextTheme;
  applyTheme(nextTheme);
  closeDropdown();
  triggerRef.value?.focus();
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!isOpen.value) return;
  const target = event.target;
  if (
    target instanceof Node &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    closeDropdown();
  }
}

function handleDocumentKeyDown(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  closeDropdown();
  triggerRef.value?.focus();
}

onMounted(() => {
  const stored = localStorage.getItem("theme");
  if (isThemeName(stored)) {
    theme.value = stored;
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    theme.value = LIGHT_PREFERRED_THEME;
  }

  applyTheme(theme.value);
  document.addEventListener("pointerdown", handleDocumentPointerDown);
  document.addEventListener("keydown", handleDocumentKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
  document.removeEventListener("keydown", handleDocumentKeyDown);
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <span class="sr-only">Theme</span>
    <button
      ref="triggerRef"
      type="button"
      class="border-border-default bg-bg-secondary text-fg-secondary hover:text-fg-primary focus:border-accent-purple inline-flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition-colors outline-none sm:text-sm"
      aria-label="Select theme"
      aria-haspopup="listbox"
      :aria-expanded="isOpen ? 'true' : 'false'"
      @click="toggleDropdown"
    >
      <svg
        width="24"
        height="16"
        viewBox="0 0 24 16"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="0.5"
          y="0.5"
          width="23"
          height="15"
          rx="2.5"
          :fill="selectedTheme.preview.page"
          stroke="rgba(148, 163, 184, 0.35)"
        />
        <rect
          x="3"
          y="3"
          width="8"
          height="1.5"
          rx="0.75"
          :fill="selectedTheme.preview.text"
          fill-opacity="0.85"
        />
        <rect
          x="3"
          y="6"
          width="18"
          height="3"
          rx="1"
          :fill="selectedTheme.preview.surface"
        />
        <rect
          x="3"
          y="11"
          width="6"
          height="2"
          rx="1"
          :fill="selectedTheme.preview.accent"
        />
      </svg>
      <span class="hidden sm:inline">{{ selectedTheme.label }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-transform"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="border-border-default bg-bg-secondary absolute top-full right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border shadow-lg"
    >
      <ul
        role="listbox"
        aria-label="Theme options"
      >
        <li
          v-for="option in THEME_OPTIONS"
          :key="option.value"
        >
          <button
            type="button"
            role="option"
            class="hover:bg-bg-tertiary/70 flex w-full items-center justify-between px-2.5 py-2 text-left text-sm transition-colors"
            :class="
              option.value === theme
                ? 'bg-bg-tertiary text-fg-primary'
                : 'text-fg-secondary'
            "
            :aria-selected="option.value === theme ? 'true' : 'false'"
            @click="selectTheme(option.value)"
          >
            <span class="inline-flex items-center gap-2">
              <svg
                width="24"
                height="16"
                viewBox="0 0 24 16"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="23"
                  height="15"
                  rx="2.5"
                  :fill="option.preview.page"
                  stroke="rgba(148, 163, 184, 0.35)"
                />
                <rect
                  x="3"
                  y="3"
                  width="8"
                  height="1.5"
                  rx="0.75"
                  :fill="option.preview.text"
                  fill-opacity="0.85"
                />
                <rect
                  x="3"
                  y="6"
                  width="18"
                  height="3"
                  rx="1"
                  :fill="option.preview.surface"
                />
                <rect
                  x="3"
                  y="11"
                  width="6"
                  height="2"
                  rx="1"
                  :fill="option.preview.accent"
                />
              </svg>
              <span>{{ option.label }}</span>
            </span>
            <svg
              v-if="option.value === theme"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
