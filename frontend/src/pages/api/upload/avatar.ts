import type { APIContext } from "astro";
import { R2StorageAdapter } from "../../../lib/storage/r2";
import { LocalStorageAdapter } from "../../../lib/storage/local";
import type { StorageAdapter } from "../../../lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

function getStorageAdapter(context: APIContext): StorageAdapter | null {
  // try R2 bucket from CF runtime
  const runtime = (context.locals as any).runtime;
  const bucket = runtime?.env?.BUCKET;

  if (bucket) {
    const publicUrl =
      import.meta.env.R2_PUBLIC_URL || "https://uploads.shockstack.dev";
    return new R2StorageAdapter(bucket, publicUrl);
  }

  // local dev fallback — write to public/uploads
  if (import.meta.env.DEV) {
    const baseDir = new URL("../../../public/uploads", import.meta.url)
      .pathname;
    return new LocalStorageAdapter(baseDir, "/uploads");
  }

  return null;
}

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

    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ error: "Invalid file type" }), {
        status: 400,
      });
    }

    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large (max 2MB)" }),
        { status: 400 },
      );
    }

    const storage = getStorageAdapter(context);
    if (!storage) {
      return new Response(JSON.stringify({ error: "Storage not configured" }), {
        status: 500,
      });
    }

    const ext = file.type.split("/")[1];
    const key = `avatars/${user.id}.${ext}`;
    const data = await file.arrayBuffer();
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
