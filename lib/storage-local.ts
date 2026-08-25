import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { agentStateDir } from "./agent";
import type { AppState, StorageAdapter } from "./storage-types";

const STATE_FILE = "job-desk-state.json";

function localStatePath(): string {
  return join(agentStateDir(), STATE_FILE);
}

export class LocalStorageAdapter implements StorageAdapter {
  async load(): Promise<AppState> {
    try {
      const raw = await readFile(localStatePath(), "utf8");
      return JSON.parse(raw) as AppState;
    } catch {
      return { pipeline: [], ledger: [] };
    }
  }

  async save(state: AppState): Promise<void> {
    const dir = agentStateDir();
    await mkdir(dir, { recursive: true });
    await writeFile(localStatePath(), `${JSON.stringify(state, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
  }
}

export async function localStateExists(): Promise<boolean> {
  try {
    await access(localStatePath());
    return true;
  } catch {
    return false;
  }
}
