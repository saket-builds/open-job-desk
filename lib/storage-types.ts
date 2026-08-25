import type {
  ApplicationPacket,
  DeskStatus,
  LedgerEntry,
  PipelineJob,
  ProfileSummary,
  ResumeInfo,
} from "./types";

export type DeskStatusFilter = DeskStatus | "all";

export interface AppState {
  pipeline: PipelineJob[];
  ledger: LedgerEntry[];
  packet?: ApplicationPacket;
  fillToken?: string;
  profile?: ProfileSummary;
  resume?: ResumeInfo;
}

export interface StorageAdapter {
  load(): Promise<AppState>;
  save(state: AppState): Promise<void>;
  exists?(): Promise<boolean>;
}
