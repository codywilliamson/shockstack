<script setup lang="ts">
import { ref, watch } from "vue";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "reka-ui";
import { pageNavLinks } from "./site-nav";

const props = withDefaults(
  defineProps<{
    mobile?: boolean;
    panelOpen?: boolean;
  }>(),
  {
    mobile: false,
    panelOpen: true,
  },
);

const mobileOpen = ref(false);

watch(
  () => props.panelOpen,
  (isOpen) => {
    if (!isOpen) {
      mobileOpen.value = false;
    }
  },
);

function navigate(href: string) {
  mobileOpen.value = false;
  window.location.href = href;
}
</script>

<template>
  <div
    v-if="mobile"
    class="pages-menu-mobile"
  >
    <button
      type="button"
      class="mobile-pages-trigger"
      :aria-expanded="mobileOpen ? 'true' : 'false'"
      @click="mobileOpen = !mobileOpen"
    >
      <span>Pages</span>
      <svg
        class="pages-menu-chevron"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <div
      class="mobile-pages-panel"
      :data-open="mobileOpen ? 'true' : 'false'"
    >
      <div class="mobile-pages-panel-inner">
        <button
          v-for="link in pageNavLinks"
          :key="link.href"
          type="button"
          class="mobile-pages-link"
          @click="navigate(link.href)"
        >
          {{ link.label }}
        </button>
      </div>
    </div>
  </div>

  <DropdownMenuRoot v-else>
    <DropdownMenuTrigger
      type="button"
      class="desktop-pages-trigger"
      aria-label="Open pages menu"
    >
      <span>Pages</span>
      <svg
        class="pages-menu-chevron"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="desktop-pages-content"
        :side-offset="10"
        align="end"
      >
        <DropdownMenuItem
          v-for="link in pageNavLinks"
          :key="link.href"
          as="a"
          :href="link.href"
          class="desktop-pages-link"
        >
          {{ link.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style scoped>
.desktop-pages-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: none;
  padding: 0;
  background: none;
  color: var(--color-fg-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease;
}

.desktop-pages-trigger:hover,
.desktop-pages-trigger[data-state="open"] {
  color: var(--color-fg-primary);
}

:deep(.desktop-pages-content) {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 11rem;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: 0.375rem;
  background-color: color-mix(
    in srgb,
    var(--color-bg-secondary) 94%,
    var(--color-bg-tertiary)
  );
  box-shadow: var(--shadow-lg);
  z-index: 50;
}

:deep(.desktop-pages-link) {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  padding: 0.5rem 0.625rem;
  color: var(--color-fg-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

:deep(.desktop-pages-link:hover),
:deep(.desktop-pages-link[data-highlighted]) {
  background-color: var(--color-bg-tertiary);
  color: var(--color-fg-primary);
}

.mobile-pages-trigger {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: var(--radius-md);
  background: none;
  color: var(--color-fg-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.mobile-pages-trigger:hover,
.mobile-pages-trigger[aria-expanded="true"] {
  background-color: color-mix(
    in srgb,
    var(--color-accent-purple) 10%,
    var(--color-bg-secondary)
  );
  color: var(--color-fg-primary);
}

.mobile-pages-panel {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.18s ease,
    opacity 0.18s ease;
}

.mobile-pages-panel[data-open="true"] {
  grid-template-rows: 1fr;
  opacity: 1;
}

.mobile-pages-panel-inner {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  overflow: hidden;
  padding: 0.375rem 0 0 0.75rem;
}

.mobile-pages-link {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border: none;
  border-left: 1px solid
    color-mix(in srgb, var(--color-accent-purple) 30%, transparent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  padding: 0.5rem 0.75rem;
  background: none;
  color: var(--color-fg-muted);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.mobile-pages-link:hover {
  border-color: var(--color-accent-purple);
  background-color: color-mix(
    in srgb,
    var(--color-accent-purple) 7%,
    transparent
  );
  color: var(--color-fg-primary);
}

.pages-menu-chevron {
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.desktop-pages-trigger[data-state="open"] .pages-menu-chevron,
.mobile-pages-trigger[aria-expanded="true"] .pages-menu-chevron {
  transform: rotate(180deg);
}

.desktop-pages-trigger:focus-visible,
:deep(.desktop-pages-link:focus-visible),
.mobile-pages-trigger:focus-visible,
.mobile-pages-link:focus-visible {
  outline: 2px solid var(--color-accent-purple);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .desktop-pages-trigger,
  :deep(.desktop-pages-link),
  .mobile-pages-trigger,
  .mobile-pages-panel,
  .mobile-pages-link,
  .pages-menu-chevron {
    transition-duration: 0.01ms !important;
  }
}
</style>
