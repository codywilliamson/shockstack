<script setup lang="ts">
import { ref } from "vue";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "reka-ui";
import { authClient } from "../../lib/auth-client";

const props = defineProps<{
  user: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
}>();

const signingOut = ref(false);

const initials = props.user
  ? props.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  : "";

async function signOut() {
  signingOut.value = true;
  await authClient.signOut();
  window.location.href = "/";
}
</script>

<template>
  <template v-if="!user" />

  <DropdownMenuRoot v-else>
    <DropdownMenuTrigger
      class="border-border-default bg-bg-secondary hover:border-accent-purple/50 focus:border-accent-purple flex size-8 items-center justify-center overflow-hidden rounded-full border transition-colors outline-none"
      aria-label="User menu"
    >
      <img
        v-if="user.image"
        :src="user.image"
        :alt="user.name"
        class="size-full object-cover"
      >
      <span
        v-else
        class="text-fg-secondary text-xs font-medium"
      >{{
        initials
      }}</span>
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="border-border-default bg-bg-secondary z-50 min-w-[200px] rounded-lg border p-1 shadow-lg"
        :side-offset="8"
        align="end"
      >
        <DropdownMenuLabel class="px-2 py-1.5">
          <p class="text-fg-primary text-sm font-medium">
            {{ user.name }}
          </p>
          <p class="text-fg-muted text-xs">
            {{ user.email }}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator class="bg-border-default my-1 h-px" />

        <DropdownMenuItem
          as="a"
          href="/settings/profile"
          class="text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm transition-colors outline-none"
        >
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          as="a"
          href="/settings/security"
          class="text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm transition-colors outline-none"
        >
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator class="bg-border-default my-1 h-px" />

        <DropdownMenuItem
          class="text-accent-red hover:bg-accent-red/10 flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm transition-colors outline-none"
          :disabled="signingOut"
          @click="signOut"
        >
          {{ signingOut ? "Signing out..." : "Sign out" }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
