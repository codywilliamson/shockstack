<script setup lang="ts">
import { ref, onMounted } from "vue";

const theme = ref<"dark" | "light">("dark");

onMounted(() => {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    theme.value = stored;
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    theme.value = "light";
  }
  document.documentElement.setAttribute("data-theme", theme.value);
});

function toggle() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme.value);
  localStorage.setItem("theme", theme.value);
}
</script>

<template>
  <button
    class="text-fg-secondary hover:text-fg-primary rounded-md p-2 transition-colors"
    :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
    @click="toggle"
  >
    <svg
      v-if="theme === 'dark'"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="5"
      />
      <line
        x1="12"
        y1="1"
        x2="12"
        y2="3"
      />
      <line
        x1="12"
        y1="21"
        x2="12"
        y2="23"
      />
      <line
        x1="4.22"
        y1="4.22"
        x2="5.64"
        y2="5.64"
      />
      <line
        x1="18.36"
        y1="18.36"
        x2="19.78"
        y2="19.78"
      />
      <line
        x1="1"
        y1="12"
        x2="3"
        y2="12"
      />
      <line
        x1="21"
        y1="12"
        x2="23"
        y2="12"
      />
      <line
        x1="4.22"
        y1="19.78"
        x2="5.64"
        y2="18.36"
      />
      <line
        x1="18.36"
        y1="5.64"
        x2="19.78"
        y2="4.22"
      />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>
