<script setup lang="ts">
import { ref } from "vue";
import Sheet from "./SheetPanel.vue";
import ThemeToggle from "./ThemeToggle.vue";

const open = ref(false);

const navLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Theme", href: "/theme" },
];

function navigate(href: string) {
  open.value = false;
  window.location.href = href;
}
</script>

<template>
  <Sheet
    v-model:open="open"
    side="right"
    title="Navigation"
  >
    <template #trigger>
      <button
        class="text-fg-secondary hover:text-fg-primary hover:bg-bg-tertiary rounded-md p-2 transition-colors outline-none md:hidden"
        aria-label="Open menu"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line
            x1="3"
            y1="6"
            x2="21"
            y2="6"
          />
          <line
            x1="3"
            y1="12"
            x2="21"
            y2="12"
          />
          <line
            x1="3"
            y1="18"
            x2="21"
            y2="18"
          />
        </svg>
      </button>
    </template>

    <nav class="flex flex-col gap-1">
      <button
        v-for="link in navLinks"
        :key="link.href"
        class="mobile-nav-link"
        @click="navigate(link.href)"
      >
        {{ link.label }}
      </button>

      <div class="border-border-default my-3 border-t" />

      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-fg-muted text-sm">Theme</span>
        <ThemeToggle />
      </div>
    </nav>
  </Sheet>
</template>

<style scoped>
.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-md);
  color: var(--color-fg-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  transition: all 0.15s ease;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
}

.mobile-nav-link:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-fg-primary);
}
</style>
