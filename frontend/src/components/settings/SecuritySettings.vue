<script setup lang="ts">
import { ref } from "vue";
import { authClient } from "../../lib/auth-client";

defineProps<{
  user: {
    email: string;
  };
}>();

// change email
const newEmail = ref("");
const emailLoading = ref(false);
const emailSuccess = ref("");
const emailError = ref("");

async function handleChangeEmail() {
  emailLoading.value = true;
  emailError.value = "";
  emailSuccess.value = "";

  try {
    const result = await authClient.changeEmail({
      newEmail: newEmail.value,
    });

    if (result.error) {
      emailError.value = result.error.message || "Failed to change email";
      return;
    }

    emailSuccess.value = "Email updated successfully";
    newEmail.value = "";
    setTimeout(() => (emailSuccess.value = ""), 3000);
  } catch {
    emailError.value = "An unexpected error occurred";
  } finally {
    emailLoading.value = false;
  }
}

// change password
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const passwordLoading = ref(false);
const passwordSuccess = ref("");
const passwordError = ref("");

async function handleChangePassword() {
  passwordError.value = "";
  passwordSuccess.value = "";

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = "Passwords do not match";
    return;
  }

  if (newPassword.value.length < 8) {
    passwordError.value = "Password must be at least 8 characters";
    return;
  }

  passwordLoading.value = true;

  try {
    const result = await authClient.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      revokeOtherSessions: true,
    });

    if (result.error) {
      passwordError.value = result.error.message || "Failed to change password";
      return;
    }

    passwordSuccess.value = "Password changed successfully";
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    setTimeout(() => (passwordSuccess.value = ""), 3000);
  } catch {
    passwordError.value = "An unexpected error occurred";
  } finally {
    passwordLoading.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold">
        Security
      </h2>
      <p class="text-fg-muted text-sm">
        Manage your email and password.
      </p>
    </div>

    <!-- change email -->
    <div class="border-border-default rounded-lg border p-6">
      <h3 class="mb-4 font-medium">
        Change email
      </h3>
      <p class="text-fg-muted mb-4 text-sm">
        Current email: <span class="text-fg-secondary">{{ user.email }}</span>
      </p>
      <form
        class="space-y-4"
        @submit.prevent="handleChangeEmail"
      >
        <div>
          <label
            for="new-email"
            class="text-fg-secondary mb-1 block text-sm"
          >
            New email
          </label>
          <input
            id="new-email"
            v-model="newEmail"
            type="email"
            required
            class="border-border-default bg-bg-secondary text-fg-primary focus:border-accent-purple w-full max-w-sm rounded-lg border px-3 py-2 outline-none"
          >
        </div>

        <p
          v-if="emailError"
          class="text-accent-red text-sm"
        >
          {{ emailError }}
        </p>
        <p
          v-if="emailSuccess"
          class="text-accent-green text-sm"
        >
          {{ emailSuccess }}
        </p>

        <button
          type="submit"
          :disabled="emailLoading"
          class="bg-accent-purple text-bg-primary rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {{ emailLoading ? "Updating..." : "Update email" }}
        </button>
      </form>
    </div>

    <!-- change password -->
    <div class="border-border-default rounded-lg border p-6">
      <h3 class="mb-4 font-medium">
        Change password
      </h3>
      <form
        class="space-y-4"
        @submit.prevent="handleChangePassword"
      >
        <div>
          <label
            for="current-password"
            class="text-fg-secondary mb-1 block text-sm"
          >
            Current password
          </label>
          <input
            id="current-password"
            v-model="currentPassword"
            type="password"
            required
            class="border-border-default bg-bg-secondary text-fg-primary focus:border-accent-purple w-full max-w-sm rounded-lg border px-3 py-2 outline-none"
          >
        </div>

        <div>
          <label
            for="new-password"
            class="text-fg-secondary mb-1 block text-sm"
          >
            New password
          </label>
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            required
            minlength="8"
            class="border-border-default bg-bg-secondary text-fg-primary focus:border-accent-purple w-full max-w-sm rounded-lg border px-3 py-2 outline-none"
          >
        </div>

        <div>
          <label
            for="confirm-password"
            class="text-fg-secondary mb-1 block text-sm"
          >
            Confirm new password
          </label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            required
            minlength="8"
            class="border-border-default bg-bg-secondary text-fg-primary focus:border-accent-purple w-full max-w-sm rounded-lg border px-3 py-2 outline-none"
          >
        </div>

        <p
          v-if="passwordError"
          class="text-accent-red text-sm"
        >
          {{ passwordError }}
        </p>
        <p
          v-if="passwordSuccess"
          class="text-accent-green text-sm"
        >
          {{ passwordSuccess }}
        </p>

        <button
          type="submit"
          :disabled="passwordLoading"
          class="bg-accent-purple text-bg-primary rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {{ passwordLoading ? "Changing..." : "Change password" }}
        </button>
      </form>
    </div>
  </div>
</template>
