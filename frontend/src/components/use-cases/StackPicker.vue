<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import PickerProgress from "./PickerProgress.vue";
import PickerStep from "./PickerStep.vue";
import PickerResult from "./PickerResult.vue";
import { usePickerState } from "./usePickerState";

const {
  answers,
  stepIndex,
  direction,
  currentQuestion,
  isComplete,
  progress,
  result,
  select,
  next,
  back,
  reset,
  goToStep,
  totalSteps,
} = usePickerState();

const containerRef = ref<HTMLElement | null>(null);
const stepKey = computed(() =>
  isComplete.value ? "result" : (currentQuestion.value?.id ?? "step"),
);

async function withTransition(run: () => void) {
  run();
  await nextTick();
  scrollIntoView();
}

function scrollIntoView() {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  if (rect.top < 0 || rect.top > window.innerHeight * 0.5) {
    containerRef.value.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }
}

function handleSelect(optionId: string) {
  if (!currentQuestion.value) return;
  select(currentQuestion.value.id, optionId);
}

async function handleAdvance() {
  await withTransition(() => next());
}

async function handleBack() {
  await withTransition(() => back());
}

async function handleReset() {
  await withTransition(() => reset());
}

async function handleTweak() {
  await withTransition(() => goToStep(totalSteps - 1));
}

async function handleJump(i: number) {
  if (i > stepIndex.value) return; // can't skip ahead
  await withTransition(() => goToStep(i));
}

// if user arrives with all answers in url, compute result already
watch(isComplete, () => scrollIntoView());
</script>

<template>
  <section
    id="picker"
    ref="containerRef"
    class="picker-card px-6 py-8 md:px-10 md:py-10"
    aria-label="ShockStack use case picker"
  >
    <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p
          class="text-accent-green mb-1 font-mono text-xs tracking-wider uppercase"
        >
          Stack Picker
        </p>
        <h2 class="text-fg-primary text-2xl font-semibold md:text-3xl">
          Find the right setup in 5 questions
        </h2>
      </div>
      <PickerProgress
        class="w-full max-w-sm"
        :step-index="stepIndex"
        :progress="progress"
        :is-complete="isComplete"
        @jump="handleJump"
      />
    </header>

    <div
      class="relative"
      data-step-root
    >
      <div
        :key="stepKey"
        class="picker-step-enter"
        :data-direction="direction"
        data-step-body
      >
        <PickerStep
          v-if="currentQuestion && !isComplete"
          :question="currentQuestion"
          :selected="answers[currentQuestion.id]"
          :is-last="stepIndex === totalSteps - 1"
          @select="handleSelect"
          @advance="handleAdvance"
        >
          <template #icon>
            <span
              class="bg-bg-tertiary border-border-default inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border"
              aria-hidden="true"
            >
              <span
                class="bg-accent-purple inline-block h-2 w-2 rounded-full"
                aria-hidden="true"
              />
            </span>
          </template>
        </PickerStep>

        <PickerResult
          v-else-if="result"
          :result="result"
          @reset="handleReset"
          @tweak="handleTweak"
        />
      </div>
    </div>

    <nav
      v-if="!isComplete"
      class="border-border-default mt-8 flex items-center justify-between gap-3 border-t pt-5"
    >
      <button
        type="button"
        class="text-fg-secondary hover:text-fg-primary inline-flex items-center gap-1 text-sm transition-colors disabled:opacity-40"
        :disabled="stepIndex === 0"
        @click="handleBack"
      >
        <span aria-hidden="true">&larr;</span> Back
      </button>
      <p class="text-fg-muted text-xs">
        Pick an option to continue — use arrow keys to navigate.
      </p>
      <button
        type="button"
        class="text-fg-secondary hover:text-fg-primary inline-flex items-center gap-1 text-sm transition-colors disabled:opacity-40"
        :disabled="!currentQuestion || !answers[currentQuestion.id]"
        @click="handleAdvance"
      >
        {{ stepIndex === totalSteps - 1 ? "See result" : "Next" }}
        <span aria-hidden="true">&rarr;</span>
      </button>
    </nav>
  </section>
</template>
