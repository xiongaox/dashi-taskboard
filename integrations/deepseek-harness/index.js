import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const name = "antigravity-taskboard";
export const inject = ["webServer"];

const ROUTE = "/integrations/antigravity-taskboard";
const RUNTIME_FILE = process.env.CODEX_TASKBOARD_RUNTIME_FILE
  ?? path.join(os.homedir(), "Library/Application Support/Antigravity Taskboard/launcher-runtime.json");

async function activeTaskboardUrl() {
  const descriptor = JSON.parse(await readFile(RUNTIME_FILE, "utf8"));
  if (descriptor?.version !== 1 || typeof descriptor.url !== "string") {
    throw new Error("The active Antigravity Taskboard runtime is invalid");
  }
  const url = new URL(`${descriptor.url.replace(/\/$/, "")}/`);
  url.searchParams.set("host", "deepseek-harness");
  return url.href;
}

export function apply(ctx) {
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: ROUTE,
      handler: async (_request, response) => {
        try {
          response.writeHead(307, {
            location: await activeTaskboardUrl(),
            "cache-control": "no-store",
          });
          response.end();
        } catch {
          response.writeHead(503, {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
          });
          response.end("Antigravity Taskboard is not running.");
        }
      },
    }),
    "antigravity-taskboard: active runtime route",
  );
}
