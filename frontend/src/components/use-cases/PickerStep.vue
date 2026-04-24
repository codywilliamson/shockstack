<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import type { PickerQuestion } from "../../lib/use-cases";

const props = defineProps<{
  question: PickerQuestion;
  selected: string | undefined;
  isLast: boolean;
}>();

const emit = defineEmits<{
  (e: "select", optionId: string): void;
  (e: "advance"): void;
}>();

const headingRef = ref<HTMLElement | null>(null);
const groupRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  await nextTick();
  headingRef.value?.focus();
});

function handleSelect(id: string) {
  emit("select", id);
  // small delay so the ripple + selected state render before advancing
  window.setTimeout(() => emit("advance"), 360);
}

function focusByOffset(current: HTMLElement, delta: number) {
  const items = Array.from(
    groupRef.value?.querySelectorAll<HTMLElement>("[role=radio]") ?? [],
  );
  const i = items.indexOf(current);
  if (i === -1) return;
  const next = items[(i + delta + items.length) % items.length];
  next?.focus();
}

function handleKey(event: KeyboardEvent, optionId: string) {
  const key = event.key;
  const target = event.currentTarget as HTMLElement;
  if (key === "ArrowRight" || key === "ArrowDown") {
    event.preventDefault();
    focusByOffset(target, 1);
  } else if (key === "ArrowLeft" || key === "ArrowUp") {
    event.preventDefault();
    focusByOffset(target, -1);
  } else if (key === "Enter" || key === " ") {
    event.preventDefault();
    handleSelect(optionId);
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <h3
        ref="headingRef"
        tabindex="-1"
        class="text-fg-primary text-2xl font-semibold outline-none md:text-3xl"
      >
        {{ question.prompt }}
      </h3>
      <p class="text-fg-secondary text-sm">
        {{ question.helper }}
      </p>
    </header>

    <div
      ref="groupRef"
      role="radiogroup"
      :aria-label="question.prompt"
      class="grid gap-3 sm:grid-cols-2"
    >
      <button
        v-for="option in question.options"
        :key="option.id"
        type="button"
        role="radio"
        class="picker-option p-4 text-left"
        :aria-checked="selected === option.id"
        :data-selected="selected === option.id"
        :tabindex="
          selected === option.id ||
            (!selected && option === question.options[0])
            ? 0
            : -1
        "
        @click="handleSelect(option.id)"
        @keydown="(e) => handleKey(e, option.id)"
      >
        <div class="flex items-start gap-3">
          <slot
            name="icon"
            :option="option"
          >
            <span
              class="bg-bg-tertiary border-border-default inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border"
              aria-hidden="true"
            />
          </slot>
          <div class="min-w-0">
            <p class="text-fg-primary font-medium">
              {{ option.label }}
            </p>
            <p class="text-fg-secondary mt-0.5 text-sm leading-relaxed">
              {{ option.description }}
            </p>
          </div>
          <span
            v-if="selected === option.id"
            class="text-accent-purple ml-auto flex-shrink-0 self-center"
            aria-hidden="true"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
