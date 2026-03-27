<script setup lang="ts">
import { ref, computed } from "vue";
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

const props = defineProps<{
  items: string[];
  noun?: string;
  confirmLabel?: string;
}>();

defineEmits<{ confirm: [] }>();

const open = defineModel<boolean>("open", { default: false });

const input = ref("");

const itemNoun = computed(() => props.noun ?? "item");
const pluralNoun = computed(() => `${itemNoun.value}s`);

const confirmText = computed(() =>
  props.items.length === 1
    ? props.items[0]
    : `delete ${props.items.length} ${pluralNoun.value}`,
);

const isValid = computed(() => input.value === confirmText.value);

function reset() {
  input.value = "";
}
</script>

<template>
  <AlertDialogRoot
    v-model:open="open"
    @update:open="(v) => !v && reset()"
  >
    <slot name="trigger" />

    <AlertDialogPortal>
      <AlertDialogOverlay class="destructive-overlay" />
      <AlertDialogContent class="destructive-content">
        <div
          class="bg-accent-red/20 mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        >
          <svg
            class="text-accent-red h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line
              x1="12"
              x2="12"
              y1="9"
              y2="13"
            />
            <line
              x1="12"
              x2="12.01"
              y1="17"
              y2="17"
            />
          </svg>
        </div>

        <AlertDialogTitle class="text-fg-primary text-lg font-semibold">
          Delete {{ items.length === 1 ? itemNoun : pluralNoun }}
        </AlertDialogTitle>
        <AlertDialogDescription class="text-fg-muted mt-2 text-sm">
          This action <strong class="text-accent-red">cannot be undone</strong>.
          {{
            items.length === 1
              ? `This will permanently delete "${items[0]}".`
              : `This will permanently delete ${items.length} ${pluralNoun}.`
          }}
        </AlertDialogDescription>

        <ul
          v-if="items.length <= 5"
          class="mt-3 space-y-1"
        >
          <li
            v-for="item in items"
            :key="item"
            class="text-fg-secondary flex items-center gap-2 text-sm"
          >
            <span class="bg-accent-red h-1.5 w-1.5 rounded-full" />
            {{ item }}
          </li>
        </ul>

        <div class="mt-4">
          <label class="text-fg-muted mb-1.5 block text-sm">
            Type
            <code
              class="bg-bg-tertiary text-accent-red rounded px-1.5 py-0.5 font-mono text-xs"
            >{{ confirmText }}</code>
            to confirm
          </label>
          <input
            v-model="input"
            type="text"
            class="border-border-default bg-bg-primary text-fg-primary focus:border-accent-red w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none"
            :placeholder="confirmText"
          >
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <AlertDialogCancel
            class="border-border-default text-fg-secondary hover:bg-bg-tertiary rounded-lg border px-4 py-2 text-sm transition-colors"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            :disabled="!isValid"
            class="bg-accent-red rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            @click="$emit('confirm')"
          >
            {{
              confirmLabel ??
                `Delete ${items.length === 1 ? itemNoun : `${items.length} ${pluralNoun}`}`
            }}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>

<style scoped>
.destructive-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
  animation: destructive-fade-in 0.2s ease-out;
}

.destructive-overlay[data-state="closed"] {
  animation: destructive-fade-out 0.15s ease-in;
}

.destructive-content {
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
  animation: destructive-content-in 0.2s ease-out;
}

.destructive-content[data-state="closed"] {
  animation: destructive-content-out 0.15s ease-in;
}

@keyframes destructive-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes destructive-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes destructive-content-in {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
@keyframes destructive-content-out {
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
  .destructive-overlay,
  .destructive-content {
    animation-duration: 0.01ms !important;
  }
}
</style>
