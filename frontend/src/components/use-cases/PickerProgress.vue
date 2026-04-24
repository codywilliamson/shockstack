<script setup lang="ts">
import { computed } from "vue";
import { pickerQuestions } from "../../lib/use-cases";

const props = defineProps<{
  stepIndex: number;
  progress: number;
  isComplete: boolean;
}>();

const emit = defineEmits<{ (e: "jump", index: number): void }>();

const percent = computed(() => Math.round(props.progress * 100));
const total = pickerQuestions.length;

function dotState(i: number): "done" | "current" | "pending" {
  if (props.isComplete || i < props.stepIndex) return "done";
  if (i === props.stepIndex) return "current";
  return "pending";
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      class="text-fg-muted flex items-center justify-between font-mono text-xs tracking-wider uppercase"
    >
      <span>
        {{
          isComplete
            ? "Complete"
            : `Step ${Math.min(stepIndex + 1, total)} of ${total}`
        }}
      </span>
      <span>{{ percent }}%</span>
    </div>

    <div
      class="picker-progress-track"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="picker-progress-fill"
        :style="{ width: `${Math.max(percent, 4)}%` }"
      />
    </div>

    <div class="mt-1 flex items-center gap-3">
      <template
        v-for="(q, i) in pickerQuestions"
        :key="q.id"
      >
        <button
          type="button"
          class="picker-dot"
          :data-state="dotState(i)"
          :aria-label="`Go to step ${i + 1}: ${q.prompt}`"
          @click="emit('jump', i)"
        />
        <span
          v-if="i < total - 1"
          class="bg-border-muted h-px flex-1"
          aria-hidden="true"
        />
      </template>
    </div>
  </div>
</template>
