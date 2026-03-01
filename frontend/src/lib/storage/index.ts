export interface StorageAdapter {
  upload(key: string, data: ArrayBuffer, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
}

export { R2StorageAdapter } from "./r2";
export { LocalStorageAdapter } from "./local";
