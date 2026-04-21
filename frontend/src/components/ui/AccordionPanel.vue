<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "reka-ui";

interface Item {
  value: string;
  title: string;
  content: string;
}

defineProps<{
  items: Item[];
  type?: "single" | "multiple";
  collapsible?: boolean;
}>();
</script>

<template>
  <AccordionRoot
    :type="type ?? 'single'"
    :collapsible="collapsible ?? true"
    class="accordion-root"
  >
    <AccordionItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      class="accordion-item"
    >
      <AccordionHeader class="accordion-header">
        <AccordionTrigger class="accordion-trigger">
          <span>{{ item.title }}</span>
          <svg
            class="accordion-chevron"
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
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="accordion-content">
        <div class="accordion-content-inner">
          {{ item.content }}
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>

<style scoped>
.accordion-root {
  width: 100%;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-xl);
  background-color: var(--color-bg-secondary);
  overflow: hidden;
}

.accordion-item + .accordion-item {
  border-top: 1px solid var(--color-border-default);
}

.accordion-header {
  display: flex;
  margin: 0;
}

.accordion-trigger {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  color: var(--color-fg-primary);
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.accordion-trigger:hover {
  background-color: var(--color-bg-tertiary);
}

.accordion-trigger:focus-visible {
  outline: 2px solid var(--color-accent-purple);
  outline-offset: -2px;
}

.accordion-chevron {
  color: var(--color-fg-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.accordion-trigger[data-state="open"] .accordion-chevron {
  transform: rotate(180deg);
  color: var(--color-accent-purple);
}

.accordion-content {
  overflow: hidden;
  color: var(--color-fg-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
}

.accordion-content[data-state="open"] {
  animation: accordion-down 0.2s ease-out;
}
.accordion-content[data-state="closed"] {
  animation: accordion-up 0.2s ease-in;
}

.accordion-content-inner {
  padding: 0 1.25rem 1rem;
}

@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--reka-accordion-content-height);
  }
}
@keyframes accordion-up {
  from {
    height: var(--reka-accordion-content-height);
  }
  to {
    height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .accordion-content[data-state="open"],
  .accordion-content[data-state="closed"] {
    animation-duration: 0.01ms;
  }
  .accordion-chevron {
    transition: none;
  }
}
</style>
