<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "reka-ui";

defineProps<{
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  delayMs?: number;
}>();
</script>

<template>
  <TooltipProvider :delay-duration="delayMs ?? 200">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side ?? 'top'"
          :side-offset="6"
          class="tooltip-content"
        >
          {{ content }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style scoped>
.tooltip-content {
  background-color: var(--color-bg-tertiary);
  color: var(--color-fg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  font-family: var(--font-sans);
  box-shadow: var(--shadow-md);
  max-width: 16rem;
  z-index: 50;
  animation: tooltip-in 0.12s ease-out;
}

.tooltip-content[data-state="delayed-open"] {
  animation: tooltip-in 0.12s ease-out;
}

.tooltip-content[data-state="closed"] {
  animation: tooltip-out 0.08s ease-in;
}

@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tooltip-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tooltip-content {
    animation-duration: 0.01ms !important;
  }
}
</style>
