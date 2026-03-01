import { mkdir, writeFile, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { StorageAdapter } from "./index";

export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;
  private baseUrl: string;

  constructor(baseDir: string, baseUrl: string) {
    this.baseDir = baseDir;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async upload(
    key: string,
    data: ArrayBuffer,
    _contentType: string,
  ): Promise<string> {
    const filePath = join(this.baseDir, key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, new Uint8Array(data));
    return `${this.baseUrl}/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.baseDir, key);
    await unlink(filePath).catch(() => {});
  }
}
