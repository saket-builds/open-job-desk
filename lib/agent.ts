import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

export { useBlobStorage } from "./storage";

const AGENT_SCRIPT =
  process.env.JOB_APPLICATION_AGENT_SCRIPT ??
  join(
    homedir(),
    ".agents",
    "skills",
    "job-application-agent",
    "scripts",
    "job-application.mjs",
  );

export function agentStateDir(): string {
  const appData =
    process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");
  return join(appData, "job-application-agent");
}

export async function runAgent<T = unknown>(
  args: string[],
  stdin?: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const proc = spawn("node", [AGENT_SCRIPT, ...args], {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Agent exited with code ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout) as T);
      } catch {
        reject(new Error("Agent returned invalid JSON"));
      }
    });

    if (stdin) {
      proc.stdin.write(stdin);
    }
    proc.stdin.end();
  });
}
