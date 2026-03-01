# Auth Showcase — Design Document

> User menu, profile page, settings (email/password), profile photo upload, and demo user seed.

## Scope

Showcase the auth system with real, functional UI: a header user menu, a settings page with profile and security tabs, profile photo upload to R2, and a seeded demo user for easy demos.

## User Menu

Vue component (`UserMenu.vue`) using reka-ui `DropdownMenu` for accessibility.

**Logged in:** circular avatar button (photo or initials fallback), far-right in header after theme toggle. Dropdown contains:

- User name + email (display only)
- Profile link → `/settings/profile`
- Settings link → `/settings`
- Divider
- Sign out action

**Logged out:** "Sign In" button linking to `/login`.

## Settings Page

Protected route at `/settings` with sidebar-tabbed layout.

### Layout

`SettingsLayout.astro` wraps settings content with a left sidebar (mirrors DocsSidebar pattern). Routes via Astro file-based routing:

- `/settings/index.astro` — redirects to `/settings/profile`
- `/settings/profile.astro` — profile tab
- `/settings/security.astro` — security tab

### Profile Tab

Vue component `ProfileSettings.vue`:

- Profile photo: circular preview + upload button
- Display name: editable text field
- Email: read-only display
- Save button with loading/success/error states

### Security Tab

Vue component `SecuritySettings.vue`:

- Change email: shows current, new email field, password confirmation
- Change password: current password, new password, confirm
- Each as independent form/card (separate submit)
- Loading/success/error states per form

## Profile Photo Upload

### Storage Adapter Pattern

```
frontend/src/lib/storage/
  ├── index.ts    # StorageAdapter interface + factory
  └── r2.ts       # R2 implementation (CF Workers binding)
```

**Interface:**

- `upload(key: string, file: Buffer, contentType: string): Promise<string>`
- `delete(key: string): Promise<void>`

### Upload Flow

1. Client: select image → preview + resize (max 256x256, jpeg)
2. POST `/api/upload/avatar` with file
3. Server: validate type + size (≤2MB), call storage adapter
4. Save URL to `users.image` via Better Auth
5. Return URL, client updates preview

### R2 Config

CF Workers R2 binding (`env.BUCKET`). Wrangler config updated with R2 bucket binding. Public bucket for serving.

## Demo User Seed

Script at `frontend/src/lib/db/seed.ts`:

- Creates: `Demo User` / `demo@shockstack.dev` / `password123`
- Default placeholder avatar
- Idempotent (skips if exists)
- Uses Better Auth `signUp` for proper password hashing
- Run via `pnpm --filter frontend db:seed`

Login page shows demo credentials hint in dev mode.

## Route Protection

Add `/settings` and `/settings/*` to protected routes in `middleware.ts`. Same redirect-to-login pattern as `/dashboard`.

## Components Summary

| Component               | Type                       | Location               |
| ----------------------- | -------------------------- | ---------------------- |
| `UserMenu.vue`          | Vue + reka-ui DropdownMenu | `components/ui/`       |
| `ProfileSettings.vue`   | Vue                        | `components/settings/` |
| `SecuritySettings.vue`  | Vue                        | `components/settings/` |
| `SettingsLayout.astro`  | Astro layout               | `layouts/`             |
| `SettingsSidebar.astro` | Astro                      | `components/layout/`   |

## New Routes

| Route                | Page                           | Protection    |
| -------------------- | ------------------------------ | ------------- |
| `/settings`          | Redirect → `/settings/profile` | Auth required |
| `/settings/profile`  | Profile settings               | Auth required |
| `/settings/security` | Security settings              | Auth required |

## New API Endpoints

| Endpoint             | Method | Purpose              |
| -------------------- | ------ | -------------------- |
| `/api/upload/avatar` | POST   | Profile photo upload |
