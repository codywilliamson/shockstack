<script setup lang="ts">
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from "reka-ui";

defineProps<{
  title: string;
  description: string;
  items?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
}>();

defineEmits<{ confirm: [] }>();

const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <AlertDialogRoot v-model:open="open">
    <slot name="trigger" />

    <AlertDialogPortal>
      <AlertDialogOverlay class="confirm-overlay" />
      <AlertDialogContent class="confirm-content">
        <AlertDialogTitle class="text-fg-primary text-lg font-semibold">
          {{ title }}
        </AlertDialogTitle>
        <AlertDialogDescription class="text-fg-muted mt-2 text-sm">
          {{ description }}
        </AlertDialogDescription>

        <ul
          v-if="items?.length && items.length <= 10"
          class="mt-3 max-h-40 space-y-1 overflow-y-auto"
        >
          <li
            v-for="item in items"
            :key="item"
            class="text-fg-secondary flex items-center gap-2 text-sm"
          >
            <span class="bg-accent-purple h-1.5 w-1.5 rounded-full" />
            {{ item }}
          </li>
        </ul>
        <p
          v-else-if="items?.length"
          class="text-fg-muted mt-3 text-sm"
        >
          {{ items.length }} items will be affected.
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <AlertDialogCancel
            class="border-border-default text-fg-secondary hover:bg-bg-tertiary rounded-lg border px-4 py-2 text-sm transition-colors"
          >
            {{ cancelLabel ?? "Cancel" }}
          </AlertDialogCancel>
          <AlertDialogAction
            class="bg-accent-purple text-bg-primary rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            @click="$emit('confirm')"
          >
            {{ confirmLabel ?? "Confirm" }}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
  animation: confirm-fade-in 0.2s ease-out;
}

.confirm-overlay[data-state="closed"] {
  animation: confirm-fade-out 0.15s ease-in;
}

.confirm-content {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 50;
  width: min(28rem, calc(100vw - 2rem));
  transform: translate(-50%, -50%);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-xl);
  animation: confirm-content-in 0.2s ease-out;
}

.confirm-content[data-state="closed"] {
  animation: confirm-content-out 0.15s ease-in;
}

@keyframes confirm-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes confirm-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes confirm-content-in {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
@keyframes confirm-content-out {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
}

@media (prefers-reduced-motion: reduce) {
  .confirm-overlay,
  .confirm-content {
    animation-duration: 0.01ms !important;
  }
}
</style>
