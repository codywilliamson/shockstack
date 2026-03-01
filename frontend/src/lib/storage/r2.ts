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
