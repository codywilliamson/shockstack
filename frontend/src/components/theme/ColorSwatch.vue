<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  name: string;
  cssVar: string;
  tailwindClass: string;
  variant?: "accent" | "bg" | "fg" | "border";
}>();

const hex = ref("");
const copied = ref(false);
let observer: MutationObserver | null = null;
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return rgb;
  const [r, g, b] = match.map(Number);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function readColor() {
  const el = document.documentElement;
  const raw = getComputedStyle(el).getPropertyValue(props.cssVar).trim();
  hex.value = raw.startsWith("#") ? raw : rgbToHex(raw);
}

async function copyHex() {
  try {
    await navigator.clipboard.writeText(hex.value);
    copied.value = true;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => (copied.value = false), 1500);
  } catch {}
}

onMounted(() => {
  readColor();
  observer = new MutationObserver(readColor);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
});

onUnmounted(() => {
  observer?.disconnect();
  if (copyTimeout) clearTimeout(copyTimeout);
});
</script>

<template>
  <button
    class="swatch"
    :title="`Copy ${hex}`"
    @click="copyHex"
  >
    <!-- color preview -->
    <div
      v-if="variant === 'fg'"
      class="swatch-preview swatch-preview--fg"
    >
      <span
        class="swatch-text-sample"
        :style="{ color: `var(${cssVar})` }"
      >Aa</span>
    </div>
    <div
      v-else-if="variant === 'border'"
      class="swatch-preview swatch-preview--border"
    >
      <div
        class="swatch-border-box"
        :style="{ borderColor: `var(${cssVar})` }"
      />
    </div>
    <div
      v-else
      class="swatch-preview"
      :style="{ backgroundColor: `var(${cssVar})` }"
    />

    <!-- info -->
    <div class="swatch-info">
      <span class="swatch-name">{{ name }}</span>
      <span class="swatch-hex">{{ copied ? "Copied!" : hex }}</span>
      <code class="swatch-var">{{ cssVar }}</code>
      <code class="swatch-tw">{{ tailwindClass }}</code>
    </div>
  </button>
</template>

<style scoped>
.swatch {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.swatch:hover {
  border-color: var(--color-accent-purple);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.swatch-preview {
  width: 100%;
  height: 3.5rem;
  border-radius: var(--radius-lg);
}

.swatch-preview--fg {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
}

.swatch-text-sample {
  font-size: 1.5rem;
  font-weight: 700;
}

.swatch-preview--border {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
}

.swatch-border-box {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid;
  border-radius: var(--radius-md);
}

.swatch-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.swatch-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-fg-primary);
}

.swatch-hex {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-accent-purple);
}

.swatch-var,
.swatch-tw {
  font-size: 0.625rem;
  color: var(--color-fg-muted);
  word-break: break-all;
}
</style>
