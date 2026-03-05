<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui";

defineProps<{
  side?: "left" | "right";
  title?: string;
  description?: string;
}>();

const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="sheet-overlay" />
      <DialogContent
        class="sheet-content"
        :class="side === 'left' ? 'sheet-left' : 'sheet-right'"
      >
        <div
          class="border-border-default flex items-center justify-between border-b px-5 py-4"
        >
          <div>
            <DialogTitle
              v-if="title"
              class="text-fg-primary text-base font-semibold"
            >
              {{ title }}
            </DialogTitle>
            <DialogDescription
              v-if="description"
              class="text-fg-muted mt-0.5 text-sm"
            >
              {{ description }}
            </DialogDescription>
          </div>
          <DialogClose
            class="text-fg-muted hover:text-fg-primary hover:bg-bg-tertiary rounded-md p-1.5 transition-colors outline-none"
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              />
            </svg>
          </DialogClose>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          <slot />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background-color: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
  animation: sheet-overlay-in 0.2s ease-out;
}

.sheet-overlay[data-state="closed"] {
  animation: sheet-overlay-out 0.2s ease-in;
}

.sheet-content {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  width: min(20rem, 85vw);
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-default);
  box-shadow: var(--shadow-xl);
}

.sheet-right {
  right: 0;
  border-left: 1px solid var(--color-border-default);
  animation: sheet-slide-in-right 0.25s ease-out;
}

.sheet-right[data-state="closed"] {
  animation: sheet-slide-out-right 0.2s ease-in;
}

.sheet-left {
  left: 0;
  border-right: 1px solid var(--color-border-default);
  animation: sheet-slide-in-left 0.25s ease-out;
}

.sheet-left[data-state="closed"] {
  animation: sheet-slide-out-left 0.2s ease-in;
}

@keyframes sheet-overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes sheet-overlay-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes sheet-slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes sheet-slide-out-right {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}
@keyframes sheet-slide-in-left {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes sheet-slide-out-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sheet-overlay,
  .sheet-content {
    animation-duration: 0.01ms !important;
  }
}
</style>
