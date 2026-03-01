import type { StorageAdapter } from "./index";

// minimal R2 bucket interface — avoids @cloudflare/workers-types dependency
interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer,
    options?: { httpMetadata?: { contentType: string } },
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
}

export class R2StorageAdapter implements StorageAdapter {
  private bucket: R2BucketLike;
  private publicUrl: string;

  constructor(bucket: R2BucketLike, publicUrl: string) {
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
