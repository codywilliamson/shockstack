<script setup lang="ts">
import { ref } from "vue";
import { authClient } from "../../lib/auth-client";

const props = defineProps<{
  mode: "login" | "register";
}>();

const email = ref("");
const password = ref("");
const name = ref("");
const error = ref("");
const loading = ref(false);

async function handleSubmit() {
  error.value = "";
  loading.value = true;

  try {
    if (props.mode === "register") {
      const result = await authClient.signUp.email({
        email: email.value,
        password: password.value,
        name: name.value,
      });
      if (result.error) {
        error.value = result.error.message || "Registration failed";
        return;
      }
    } else {
      const result = await authClient.signIn.email({
        email: email.value,
        password: password.value,
      });
      if (result.error) {
        error.value = result.error.message || "Login failed";
        return;
      }
    }
    window.location.href = "/dashboard";
  } catch (e) {
    error.value = "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form
    class="mx-auto w-full max-w-sm space-y-4"
    @submit.prevent="handleSubmit"
  >
    <div v-if="mode === 'register'">
      <label
        for="name"
        class="text-fg-secondary mb-1 block text-sm"
      >
        Name
      </label>
      <input
        id="name"
        v-model="name"
        type="text"
        required
        class="border-border-default bg-bg-secondary text-fg-primary focus:border-accent-purple w-full rounded-lg border px-3 py-2 outline-none"
      >
    </div>
    <div>
      <label
        for="email"
        class="text-fg-secondary mb-1 block text-sm"
      >
        Email
      </label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        class="border-border-default bg-bg-secondary text-fg-primary focus:border-accent-purple w-full rounded-lg border px-3 py-2 outline-none"
      >
    </div>
    <div>
      <label
        for="password"
        class="text-fg-secondary mb-1 block text-sm"
      >
        Password
      </label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        minlength="8"
        class="border-border-default bg-bg-secondary text-fg-primary focus:border-accent-purple w-full rounded-lg border px-3 py-2 outline-none"
      >
    </div>
    <p
      v-if="error"
      class="text-accent-red text-sm"
    >
      {{ error }}
    </p>
    <button
      type="submit"
      :disabled="loading"
      class="bg-accent-purple text-bg-primary w-full rounded-lg px-4 py-2 font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {{ loading ? "..." : mode === "login" ? "Sign In" : "Create Account" }}
    </button>
  </form>
</template>
