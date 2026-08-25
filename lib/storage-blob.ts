import { get, head, put } from "@vercel/blob";
import type { AppState, StorageAdapter } from "./storage-types";

const BLOB_PATH = "job-desk/state.json";

export class BlobStorageAdapter implements StorageAdapter {
  async exists(): Promise<boolean> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
    try {
      await head(BLOB_PATH);
      return true;
    } catch {
      return false;
    }
  }

  async load(): Promise<AppState> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return { pipeline: [], ledger: [] };
    }

    try {
      const result = await get(BLOB_PATH, {
        access: "private",
        useCache: false,
      });
      if (!result || result.statusCode !== 200) {
        return { pipeline: [], ledger: [] };
      }

      const text = await new Response(result.stream).text();
      if (!text.trim()) {
        return { pipeline: [], ledger: [] };
      }

      return JSON.parse(text) as AppState;
    } catch {
      return { pipeline: [], ledger: [] };
    }
  }

  async save(state: AppState): Promise<void> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    await put(BLOB_PATH, JSON.stringify(state), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  }
}
