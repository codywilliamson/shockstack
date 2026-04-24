<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { stackOptions, type PickerResult } from "../../lib/use-cases";

const props = defineProps<{ result: PickerResult }>();
defineEmits<{ (e: "reset"): void; (e: "tweak"): void }>();

const includeOptions = computed(() =>
  props.result.includeChips.map((id) => stackOptions[id]),
);
const skipOptions = computed(() =>
  props.result.skipChips.map((id) => stackOptions[id]),
);

const copyState = ref<"idle" | "copied">("idle");

function copySummary() {
  const lines = [
    `# ShockStack for: ${props.result.winner.title}`,
    "",
    props.result.winner.summary,
    "",
    "## Include",
    ...includeOptions.value.map((o) => `- ${o.label}`),
    "",
    "## Skip for now",
    ...skipOptions.value.map((o) => `- ${o.label}`),
    "",
    "## Why",
    ...props.result.reasons.map((r) => `- ${r}`),
  ].join("\n");

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(lines).then(() => {
      copyState.value = "copied";
      window.setTimeout(() => (copyState.value = "idle"), 1800);
    });
  }
}

const chipRefs = ref<Record<string, HTMLElement>>({});
function registerChip(key: string, el: unknown) {
  if (el instanceof HTMLElement) chipRefs.value[key] = el;
}

onMounted(async () => {
  await nextTick();
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduceMotion) return;

  const chips = Object.values(chipRefs.value);
  chips.forEach((el, i) => {
    el.animate(
      [
        { opacity: 0, transform: "translateY(10px) scale(0.9)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      {
        duration: 500,
        delay: 80 + i * 55,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both",
      },
    );
  });
});
</script>

<template>
  <article class="picker-card px-6 py-8 md:px-10 md:py-10">
    <p
      class="text-accent-green mb-2 font-mono text-xs tracking-wider uppercase"
    >
      Your recommended setup
    </p>
    <h2
      class="picker-result-headline text-4xl font-bold tracking-tight md:text-5xl"
    >
      {{ result.winner.title }}
    </h2>
    <p class="text-fg-secondary mt-3 max-w-2xl text-base leading-relaxed">
      {{ result.winner.summary }}
    </p>

    <div class="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div class="space-y-6">
        <section>
          <h3
            class="text-fg-muted mb-3 font-mono text-xs tracking-wider uppercase"
          >
            Include
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="option in includeOptions"
              :key="option.id"
              :ref="(el) => registerChip(`include-${option.id}`, el)"
              class="picker-include-chip"
            >
              <span
                class="picker-chip-dot"
                aria-hidden="true"
              />
              {{ option.label }}
            </span>
          </div>
        </section>

        <section v-if="skipOptions.length">
          <h3
            class="text-fg-muted mb-3 font-mono text-xs tracking-wider uppercase"
          >
            Skip for now
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="option in skipOptions"
              :key="option.id"
              :ref="(el) => registerChip(`skip-${option.id}`, el)"
              class="picker-skip-chip"
            >
              <span
                class="picker-chip-dot"
                aria-hidden="true"
              />
              {{ option.label }}
            </span>
          </div>
        </section>

        <section v-if="result.reasons.length">
          <h3
            class="text-fg-muted mb-3 font-mono text-xs tracking-wider uppercase"
          >
            Why this fits
          </h3>
          <ul
            class="stagger-in is-revealed text-fg-secondary space-y-1 text-sm"
          >
            <li
              v-for="reason in result.reasons"
              :key="reason"
            >
              — {{ reason }}
            </li>
          </ul>
        </section>
      </div>

      <aside class="space-y-6">
        <div class="bg-bg-primary border-border-default rounded-xl border p-5">
          <p
            class="text-fg-muted mb-2 font-mono text-xs tracking-wider uppercase"
          >
            Best for
          </p>
          <p class="text-fg-primary text-sm leading-relaxed">
            {{ result.winner.bestFor }}
          </p>
          <p
            class="text-fg-muted mt-4 mb-2 font-mono text-xs tracking-wider uppercase"
          >
            Trade-offs
          </p>
          <ul class="text-fg-secondary list-disc space-y-1 pl-5 text-sm">
            <li
              v-for="tradeoff in result.winner.tradeoffs"
              :key="tradeoff"
            >
              {{ tradeoff }}
            </li>
          </ul>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <a
            :href="result.winner.nextSteps.href"
            class="bg-accent-purple text-fg-primary hover:bg-accent-pink inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {{ result.winner.nextSteps.label }}
            <span aria-hidden="true">&rarr;</span>
          </a>
          <button
            type="button"
            class="border-border-default text-fg-secondary hover:text-fg-primary inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
            @click="copySummary"
          >
            <span aria-hidden="true">{{
              copyState === "copied" ? "✓" : "⧉"
            }}</span>
            {{ copyState === "copied" ? "Copied" : "Copy setup" }}
          </button>
        </div>
      </aside>
    </div>

    <footer
      class="border-border-default mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6"
    >
      <p
        v-if="result.runnerUp"
        class="text-fg-secondary text-sm"
      >
        Also consider:
        <a
          :href="`#use-case-${result.runnerUp.id}`"
          class="text-accent-purple hover:text-accent-pink font-medium transition-colors"
        >
          {{ result.runnerUp.title }} &rarr;
        </a>
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="text-fg-secondary hover:text-fg-primary text-sm transition-colors"
          @click="$emit('tweak')"
        >
          ← Tweak answers
        </button>
        <span
          class="text-fg-muted"
          aria-hidden="true"
        >·</span>
        <button
          type="button"
          class="text-fg-secondary hover:text-fg-primary text-sm transition-colors"
          @click="$emit('reset')"
        >
          Start over
        </button>
      </div>
    </footer>
  </article>
</template>
