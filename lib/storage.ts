import { bootstrapAppState } from "./state-bootstrap";
import { BlobStorageAdapter } from "./storage-blob";
import { LocalStorageAdapter } from "./storage-local";
import { MemoryStorageAdapter } from "./storage-memory";
import type { AppState, StorageAdapter } from "./storage-types";

export function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL);
}

export function getStorage(): StorageAdapter {
  if (useBlobStorage()) {
    return new BlobStorageAdapter();
  }
  if (process.env.VERCEL) {
    return new MemoryStorageAdapter();
  }
  return new LocalStorageAdapter();
}

async function loadInitializedState(): Promise<AppState> {
  const storage = getStorage();
  let state = await storage.load();
  if (state.pipeline.length === 0) {
    state = await bootstrapAppState(state);
    const alreadyStored = storage.exists ? await storage.exists() : false;
    if (!alreadyStored) {
      await storage.save(state);
    }
  }
  return state;
}

export async function loadAppState(): Promise<AppState> {
  return loadInitializedState();
}

export async function withState<T>(
  fn: (state: AppState) => Promise<{ state: AppState; result: T }>,
): Promise<T> {
  const storage = getStorage();
  const state = await loadInitializedState();
  const { state: next, result } = await fn(state);
  await storage.save(next);
  return result;
}
