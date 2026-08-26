import { accessSync, constants } from "node:fs";
import os from "node:os";
import path from "node:path";

function executableFile(candidate) {
  try {
    accessSync(candidate, constants.X_OK);
    return candidate;
  } catch {
    return null;
  }
}

export function resolveAntigravityExecutable({
  explicit = process.env.ANTIGRAVITY_EXECUTABLE || process.env.CODEX_EXECUTABLE,
  appPath,
  env = process.env,
  platform = process.platform,
  homeDirectory = os.homedir(),
} = {}) {
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();

  if (platform === "win32") {
    const localAppPath = path.join(
      env.LOCALAPPDATA || path.join(homeDirectory, "AppData", "Local"),
      "Programs",
      "antigravity",
      "Antigravity.exe",
    );
    const found = executableFile(localAppPath);
    if (found) return found;
  }

  if (platform === "darwin") {
    for (const appDir of ["/Applications", path.join(homeDirectory, "Applications")]) {
      for (const name of ["Antigravity.app", "ChatGPT.app", "Codex.app"]) {
        const candidate = path.join(appDir, name, "Contents", "MacOS", name.replace(".app", ""));
        if (executableFile(candidate)) return candidate;
      }
    }
  }

  return "Antigravity";
}

export const resolveCodexExecutable = resolveAntigravityExecutable;
