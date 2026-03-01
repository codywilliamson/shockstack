# Auth Showcase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a user menu, settings page (profile + security tabs), profile photo upload to R2, and a demo user seed to showcase the auth system.

**Architecture:** Header gets a Vue user menu dropdown (reka-ui). Settings pages use a sidebar-tabbed layout with Vue form components. Photo upload goes through an API endpoint to a swappable storage adapter (R2 default). Demo user is seeded via a script.

**Tech Stack:** Astro 5, Vue 3, reka-ui (DropdownMenu), Better Auth client API, Cloudflare R2, Drizzle ORM

---

### Task 1: Install reka-ui

**Files:**

- Modify: `frontend/package.json`

**Step 1: Install the package**

Run: `pnpm --filter frontend add reka-ui`

**Step 2: Verify installation**

Run: `pnpm --filter frontend list reka-ui`
Expected: reka-ui version listed

**Step 3: Commit**

```bash
git add frontend/package.json pnpm-lock.yaml
git commit -m "chore: add reka-ui dependency"
```

---

### Task 2: Enable changeEmail in Better Auth config

**Files:**

- Modify: `frontend/src/lib/auth.ts`

**Step 1: Add changeEmail to auth config**

In `frontend/src/lib/auth.ts`, add `changeEmail` to the `emailAndPassword` config:

```ts
emailAndPassword: {
  enabled: true,
  changeEmail: {
    enabled: true,
  },
},
```

**Step 2: Verify typecheck passes**

Run: `cd frontend && npx astro check`
Expected: no new errors

**Step 3: Commit**

```bash
git add frontend/src/lib/auth.ts
git commit -m "feat(auth): enable change email support"
```

---

### Task 3: Add /settings to protected routes in middleware

**Files:**

- Modify: `frontend/src/middleware.ts`

**Step 1: Update protectedRoutes array**

Change line 3 of `frontend/src/middleware.ts`:

```ts
const protectedRoutes = ["/dashboard", "/settings"];
```

**Step 2: Verify typecheck passes**

Run: `cd frontend && npx astro check`
Expected: no new errors

**Step 3: Commit**

```bash
git add frontend/src/middleware.ts
git commit -m "feat(auth): protect /settings routes"
```

---

### Task 4: Create UserMenu Vue component

**Files:**

- Create: `frontend/src/components/ui/UserMenu.vue`

**Step 1: Create the component**

Create `frontend/src/components/ui/UserMenu.vue`:

```vue
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
  <a
    v-if="!user"
    href="/login"
    class="bg-accent-purple text-bg-primary rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
  >
    Sign In
  </a>

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
      />
      <span v-else class="text-fg-secondary text-xs font-medium">{{
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
          <p class="text-fg-primary text-sm font-medium">{{ user.name }}</p>
          <p class="text-fg-muted text-xs">{{ user.email }}</p>
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
```

**Step 2: Verify typecheck passes**

Run: `cd frontend && npx astro check`
Expected: no errors related to UserMenu

**Step 3: Commit**

```bash
git add frontend/src/components/ui/UserMenu.vue
git commit -m "feat: add user menu dropdown component"
```

---

### Task 5: Wire UserMenu into Header

**Files:**

- Modify: `frontend/src/components/layout/Header.astro`
- Modify: `frontend/src/middleware.ts` (make user available on all dynamic routes)

**Step 1: Update middleware to resolve user on non-static routes**

The middleware already resolves user for non-static routes and sets `locals.user`. The header is rendered on all pages, but `Astro.locals.user` will be `null` on static routes. This is fine — UserMenu handles `null` by showing "Sign In".

No middleware change needed.

**Step 2: Update Header.astro**

Replace the full content of `frontend/src/components/layout/Header.astro` with:

```astro
---
import ThemeToggle from "../ui/ThemeToggle.vue";
import UserMenu from "../ui/UserMenu.vue";

const user = Astro.locals.user ?? null;
---

<header class="border-border-default border-b">
  <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
    <a href="/" class="flex items-center gap-2 text-xl font-bold">
      <img src="/logo.svg" alt="" width="24" height="24" class="inline-block" />
      <span class="text-accent-purple">ShockStack</span>
    </a>
    <div class="flex items-center gap-6">
      <a
        href="/blog"
        class="text-fg-secondary hover:text-fg-primary transition-colors"
        >Blog</a
      >
      <a
        href="/docs"
        class="text-fg-secondary hover:text-fg-primary transition-colors"
        >Docs</a
      >
      <a
        href="/theme"
        class="text-fg-secondary hover:text-fg-primary transition-colors"
        >Theme</a
      >
      <ThemeToggle client:load />
      <UserMenu user={user} client:load />
    </div>
  </nav>
</header>
```

**Step 3: Verify dev server renders correctly**

Run: `pnpm --filter frontend dev`
Expected: Header shows "Sign In" button when logged out. When logged in, shows avatar/initials with dropdown.

**Step 4: Commit**

```bash
git add frontend/src/components/layout/Header.astro
git commit -m "feat: wire user menu into header"
```

---

### Task 6: Create SettingsSidebar component

**Files:**

- Create: `frontend/src/components/layout/SettingsSidebar.astro`

**Step 1: Create the sidebar**

Create `frontend/src/components/layout/SettingsSidebar.astro`:

```astro
---
interface Props {
  currentPath: string;
}

const { currentPath } = Astro.props;

const links = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/security", label: "Security" },
];
---

<aside class="shrink-0 lg:w-56">
  <nav class="lg:sticky lg:top-8">
    <h3
      class="text-fg-muted mb-3 text-xs font-semibold tracking-wider uppercase"
    >
      Settings
    </h3>
    <ul class="space-y-1">
      {
        links.map(({ href, label }) => {
          const isActive = currentPath === href;
          return (
            <li>
              <a
                href={href}
                class:list={[
                  "block rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent-purple/10 text-accent-purple font-medium"
                    : "text-fg-secondary hover:text-fg-primary hover:bg-bg-tertiary",
                ]}
              >
                {label}
              </a>
            </li>
          );
        })
      }
    </ul>
  </nav>
</aside>
```

**Step 2: Commit**

```bash
git add frontend/src/components/layout/SettingsSidebar.astro
git commit -m "feat: add settings sidebar component"
```

---

### Task 7: Create SettingsLayout

**Files:**

- Create: `frontend/src/layouts/SettingsLayout.astro`

**Step 1: Create the layout**

Create `frontend/src/layouts/SettingsLayout.astro`:

```astro
---
import BaseLayout from "./BaseLayout.astro";
import SettingsSidebar from "../components/layout/SettingsSidebar.astro";

interface Props {
  title: string;
}

const { title } = Astro.props;
const currentPath = Astro.url.pathname;
---

<BaseLayout title={title} noindex>
  <div class="flex flex-col gap-8 py-8 lg:flex-row">
    <SettingsSidebar currentPath={currentPath} />
    <div class="min-w-0 flex-1">
      <slot />
    </div>
  </div>
</BaseLayout>
```

**Step 2: Commit**

```bash
git add frontend/src/layouts/SettingsLayout.astro
git commit -m "feat: add settings layout with sidebar"
```

---

### Task 8: Create settings index page (redirect)

**Files:**

- Create: `frontend/src/pages/settings/index.astro`

**Step 1: Create the redirect page**

Create `frontend/src/pages/settings/index.astro`:

```astro
---
return Astro.redirect("/settings/profile");
---
```

**Step 2: Commit**

```bash
git add frontend/src/pages/settings/index.astro
git commit -m "feat: add settings index redirect"
```

---

### Task 9: Create ProfileSettings Vue component

**Files:**

- Create: `frontend/src/components/settings/ProfileSettings.vue`

**Step 1: Create the component**

Create `frontend/src/components/settings/ProfileSettings.vue`:

```vue
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
      <h2 class="text-lg font-semibold">Profile</h2>
      <p class="text-fg-muted text-sm">Update your display name and photo.</p>
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
          />
          <span v-else class="text-fg-muted text-lg font-medium">{{
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
            />
          </label>
        </div>
      </div>

      <form class="space-y-4" @submit.prevent="handleSave">
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
          />
        </div>

        <div>
          <label class="text-fg-secondary mb-1 block text-sm">Email</label>
          <p class="text-fg-muted text-sm">
            {{ user.email }}
            <span class="text-fg-muted/60 ml-1 text-xs"
              >(change in Security tab)</span
            >
          </p>
        </div>

        <p v-if="error" class="text-accent-red text-sm">
          {{ error }}
        </p>
        <p v-if="success" class="text-accent-green text-sm">
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
```

**Step 2: Verify typecheck**

Run: `cd frontend && npx astro check`
Expected: no new errors

**Step 3: Commit**

```bash
git add frontend/src/components/settings/ProfileSettings.vue
git commit -m "feat: add profile settings component"
```

---

### Task 10: Create SecuritySettings Vue component

**Files:**

- Create: `frontend/src/components/settings/SecuritySettings.vue`

**Step 1: Create the component**

Create `frontend/src/components/settings/SecuritySettings.vue`:

```vue
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
      <h2 class="text-lg font-semibold">Security</h2>
      <p class="text-fg-muted text-sm">Manage your email and password.</p>
    </div>

    <!-- change email -->
    <div class="border-border-default rounded-lg border p-6">
      <h3 class="mb-4 font-medium">Change email</h3>
      <p class="text-fg-muted mb-4 text-sm">
        Current email: <span class="text-fg-secondary">{{ user.email }}</span>
      </p>
      <form class="space-y-4" @submit.prevent="handleChangeEmail">
        <div>
          <label for="new-email" class="text-fg-secondary mb-1 block text-sm">
            New email
          </label>
          <input
            id="new-email"
            v-model="newEmail"
            type="email"
            required
            class="border-border-default bg-bg-secondary text-fg-primary focus:border-accent-purple w-full max-w-sm rounded-lg border px-3 py-2 outline-none"
          />
        </div>

        <p v-if="emailError" class="text-accent-red text-sm">
          {{ emailError }}
        </p>
        <p v-if="emailSuccess" class="text-accent-green text-sm">
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
      <h3 class="mb-4 font-medium">Change password</h3>
      <form class="space-y-4" @submit.prevent="handleChangePassword">
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
          />
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
          />
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
          />
        </div>

        <p v-if="passwordError" class="text-accent-red text-sm">
          {{ passwordError }}
        </p>
        <p v-if="passwordSuccess" class="text-accent-green text-sm">
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
```

**Step 2: Verify typecheck**

Run: `cd frontend && npx astro check`
Expected: no new errors

**Step 3: Commit**

```bash
git add frontend/src/components/settings/SecuritySettings.vue
git commit -m "feat: add security settings component"
```

---

### Task 11: Create settings pages

**Files:**

- Create: `frontend/src/pages/settings/profile.astro`
- Create: `frontend/src/pages/settings/security.astro`

**Step 1: Create profile page**

Create `frontend/src/pages/settings/profile.astro`:

```astro
---
import SettingsLayout from "../../layouts/SettingsLayout.astro";
import ProfileSettings from "../../components/settings/ProfileSettings.vue";

const user = Astro.locals.user!;
---

<SettingsLayout title="Profile Settings">
  <ProfileSettings user={user} client:load />
</SettingsLayout>
```

**Step 2: Create security page**

Create `frontend/src/pages/settings/security.astro`:

```astro
---
import SettingsLayout from "../../layouts/SettingsLayout.astro";
import SecuritySettings from "../../components/settings/SecuritySettings.vue";

const user = Astro.locals.user!;
---

<SettingsLayout title="Security Settings">
  <SecuritySettings user={user} client:load />
</SettingsLayout>
```

**Step 3: Commit**

```bash
git add frontend/src/pages/settings/profile.astro frontend/src/pages/settings/security.astro
git commit -m "feat: add settings profile and security pages"
```

---

### Task 12: Create storage adapter interface and R2 implementation

**Files:**

- Create: `frontend/src/lib/storage/index.ts`
- Create: `frontend/src/lib/storage/r2.ts`

**Step 1: Create the storage interface**

Create `frontend/src/lib/storage/index.ts`:

```ts
export interface StorageAdapter {
  upload(key: string, data: ArrayBuffer, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
}

export { R2StorageAdapter } from "./r2";
```

**Step 2: Create R2 adapter**

Create `frontend/src/lib/storage/r2.ts`:

```ts
import type { StorageAdapter } from "./index";

export class R2StorageAdapter implements StorageAdapter {
  private bucket: R2Bucket;
  private publicUrl: string;

  constructor(bucket: R2Bucket, publicUrl: string) {
    this.bucket = bucket;
    this.publicUrl = publicUrl.replace(/\/$/, "");
  }

  async upload(
    key: string,
    data: ArrayBuffer,
    contentType: string,
  ): Promise<string> {
    await this.bucket.put(key, data, {
      httpMetadata: { contentType },
    });
    return `${this.publicUrl}/${key}`;
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }
}
```

**Step 3: Update wrangler.jsonc with R2 binding**

Add R2 bucket binding to `frontend/wrangler.jsonc`:

```jsonc
{
  "name": "shockstack",
  "compatibility_date": "2025-01-01",
  "main": "./dist/_worker.js",
  "assets": {
    "directory": "./dist/client",
  },
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "shockstack-uploads",
    },
  ],
}
```

**Step 4: Commit**

```bash
git add frontend/src/lib/storage/ frontend/wrangler.jsonc
git commit -m "feat: add storage adapter with R2 implementation"
```

---

### Task 13: Create avatar upload API endpoint

**Files:**

- Create: `frontend/src/pages/api/upload/avatar.ts`

**Step 1: Create the endpoint**

Create `frontend/src/pages/api/upload/avatar.ts`:

```ts
import type { APIContext } from "astro";
import { R2StorageAdapter } from "../../../lib/storage/r2";

export async function POST(context: APIContext) {
  const user = context.locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: "Invalid file type" }), {
        status: 400,
      });
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: "File too large (max 2MB)" }),
        {
          status: 400,
        },
      );
    }

    const ext = file.type.split("/")[1];
    const key = `avatars/${user.id}.${ext}`;
    const data = await file.arrayBuffer();

    // get R2 bucket from CF runtime
    const runtime = (context.locals as any).runtime;
    const bucket = runtime?.env?.BUCKET;

    if (!bucket) {
      return new Response(JSON.stringify({ error: "Storage not configured" }), {
        status: 500,
      });
    }

    const publicUrl =
      import.meta.env.R2_PUBLIC_URL || "https://uploads.shockstack.dev";
    const storage = new R2StorageAdapter(bucket, publicUrl);
    const url = await storage.upload(key, data, file.type);

    // update user image via better auth
    const { auth } = await import("../../../lib/auth");
    await auth.api.updateUser({
      body: { image: url },
      headers: context.request.headers,
    });

    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (e) {
    console.error("Avatar upload error:", e);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}
```

**Step 2: Commit**

```bash
git add frontend/src/pages/api/upload/avatar.ts
git commit -m "feat: add avatar upload API endpoint"
```

---

### Task 14: Create demo user seed script

**Files:**

- Create: `frontend/src/lib/db/seed.ts`
- Modify: `frontend/package.json` (add `db:seed` script)

**Step 1: Create seed script**

Create `frontend/src/lib/db/seed.ts`:

```ts
import { db } from "./client";
import { users, accounts } from "./schema";
import { eq } from "drizzle-orm";

const DEMO_EMAIL = "demo@shockstack.dev";
const DEMO_PASSWORD = "password123";
const DEMO_NAME = "Demo User";

async function seed() {
  console.log("checking for existing demo user...");

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log("demo user already exists, skipping");
    process.exit(0);
  }

  console.log("seeding demo user...");

  // use better auth signup to hash password properly
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:4321";
  const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      name: DEMO_NAME,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("failed to seed demo user:", body);
    process.exit(1);
  }

  console.log(`demo user created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  process.exit(0);
}

seed().catch((e) => {
  console.error("seed error:", e);
  process.exit(1);
});
```

**Step 2: Add db:seed script to package.json**

Add to `frontend/package.json` scripts:

```json
"db:seed": "npx tsx src/lib/db/seed.ts"
```

**Step 3: Test the seed (requires running dev server + DB)**

Run: `pnpm --filter frontend db:seed`
Expected: "demo user created: demo@shockstack.dev / password123" or "demo user already exists, skipping"

**Step 4: Commit**

```bash
git add frontend/src/lib/db/seed.ts frontend/package.json
git commit -m "feat: add demo user seed script"
```

---

### Task 15: Add demo credentials hint to login page

**Files:**

- Modify: `frontend/src/pages/login.astro`

**Step 1: Update login page**

Add a demo credentials hint below the AuthForm in `frontend/src/pages/login.astro`. After the "Don't have an account?" paragraph, add:

```astro
<div
  class="border-border-default bg-bg-secondary mt-6 max-w-sm rounded-lg border p-4 text-center"
>
  <p class="text-fg-muted mb-1 text-xs font-medium tracking-wider uppercase">
    Demo Account
  </p>
  <p class="text-fg-secondary text-sm">
    <code class="bg-bg-tertiary rounded px-1 py-0.5 text-xs"
      >demo@shockstack.dev</code
    >
    /
    <code class="bg-bg-tertiary rounded px-1 py-0.5 text-xs">password123</code>
  </p>
</div>
```

**Step 2: Commit**

```bash
git add frontend/src/pages/login.astro
git commit -m "feat: add demo credentials hint to login page"
```

---

### Task 16: Final verification

**Step 1: Run typecheck**

Run: `pnpm --filter frontend typecheck`
Expected: no errors

**Step 2: Run lint**

Run: `pnpm lint`
Expected: no errors (or only pre-existing ones)

**Step 3: Manual smoke test**

Start dev: `pnpm --filter frontend dev`

Test flow:

1. Visit `/` — header shows "Sign In" button
2. Click "Sign In" → `/login` — see demo credentials hint
3. Login with demo creds → redirects to `/dashboard`
4. Header now shows avatar/initials dropdown
5. Click avatar → dropdown with Profile, Settings, Sign out
6. Click Profile → `/settings/profile` with sidebar
7. Change display name → save → success message
8. Click Security in sidebar → `/settings/security`
9. Change password form works
10. Change email form works
11. Sign out → back to "Sign In" button in header

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues from smoke test"
```
