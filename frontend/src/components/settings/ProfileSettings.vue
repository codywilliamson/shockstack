<script setup lang="ts">
import { ref } from "vue";
import { authClient } from "../../lib/auth-client";

const props = defineProps<{
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}>();

const name = ref(props.user.name);
const image = ref(props.user.image || "");
const previewUrl = ref(props.user.image || "");
const loading = ref(false);
const uploadLoading = ref(false);
const success = ref("");
const error = ref("");

const initials = props.user.name
  .split(" ")
  .map((n) => n[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);

async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    error.value = "Please select an image file";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    error.value = "Image must be under 2MB";
    return;
  }

  // client-side preview
  previewUrl.value = URL.createObjectURL(file);
  uploadLoading.value = true;
  error.value = "";

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/avatar", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || "Upload failed");
    }

    const { url } = await res.json();
    image.value = url;
    previewUrl.value = url;
  } catch (e: any) {
    error.value = e.message || "Upload failed";
    previewUrl.value = props.user.image || "";
  } finally {
    uploadLoading.value = false;
  }
}

async function handleSave() {
  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    const result = await authClient.updateUser({
      name: name.value,
      image: image.value || undefined,
    });

    if (result.error) {
      error.value = result.error.message || "Update failed";
      return;
    }

    success.value = "Profile updated";
    setTimeout(() => (success.value = ""), 3000);
  } catch {
    error.value = "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold">
        Profile
      </h2>
      <p class="text-fg-muted text-sm">
        Update your display name and photo.
      </p>
    </div>

    <div class="border-border-default rounded-lg border p-6">
      <!-- avatar -->
      <div class="mb-6 flex items-center gap-4">
        <div
          class="border-border-default bg-bg-tertiary flex size-16 items-center justify-center overflow-hidden rounded-full border"
        >
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="Profile photo"
            class="size-full object-cover"
          >
          <span
            v-else
            class="text-fg-muted text-lg font-medium"
          >{{
            initials
          }}</span>
        </div>
        <div>
          <label
            class="bg-bg-secondary border-border-default hover:border-accent-purple/50 cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors"
          >
            {{ uploadLoading ? "Uploading..." : "Change photo" }}
            <input
              type="file"
              accept="image/*"
              class="hidden"
              :disabled="uploadLoading"
              @change="handleUpload"
            >
          </label>
        </div>
      </div>

      <form
        class="space-y-4"
        @submit.prevent="handleSave"
      >
        <div>
          <label
            for="display-name"
            class="text-fg-secondary mb-1 block text-sm"
          >
            Display name
          </label>
          <input
            id="display-name"
            v-model="name"
            type="text"
            required
            class="border-border-default bg-bg-secondary text-fg-primary focus:border-accent-purple w-full max-w-sm rounded-lg border px-3 py-2 outline-none"
          >
        </div>

        <div>
          <label class="text-fg-secondary mb-1 block text-sm">Email</label>
          <p class="text-fg-muted text-sm">
            {{ user.email }}
            <span class="text-fg-muted/60 ml-1 text-xs">(change in Security tab)</span>
          </p>
        </div>

        <p
          v-if="error"
          class="text-accent-red text-sm"
        >
          {{ error }}
        </p>
        <p
          v-if="success"
          class="text-accent-green text-sm"
        >
          {{ success }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="bg-accent-purple text-bg-primary rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {{ loading ? "Saving..." : "Save changes" }}
        </button>
      </form>
    </div>
  </div>
</template>
