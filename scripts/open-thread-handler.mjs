import WebSocket from "ws";
import { execSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rawArg = process.argv[2] || "";
const match = rawArg.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
const threadId = match ? match[1] : rawArg.replace(/^antigravity:\/\/threads\/?/i, "").trim();

if (!threadId) {
  process.exit(0);
}

async function findAntigravityCdp() {
  // Check common ports including dynamic Electron ports
  const knownPorts = [64777, 9222, 9229, 9230, 9231];
  
  // Also scan netstat for localhost listening ports belonging to Antigravity if needed
  try {
    const netstatOut = execSync('netstat -ano | findstr "LISTENING"', { encoding: "utf8" });
    const portMatches = Array.from(netstatOut.matchAll(/127\.0\.0\.1:(\d+)/g)).map(m => Number(m[1]));
    for (const p of portMatches) {
      if (!knownPorts.includes(p)) knownPorts.push(p);
    }
  } catch {}

  for (const port of knownPorts) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 200);
      const res = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      const page = data.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return { port, page };
    } catch {}
  }
  return null;
}

async function main() {
  const cdp = await findAntigravityCdp();
  if (cdp) {
    await new Promise((resolve) => {
      const ws = new WebSocket(cdp.page.webSocketDebuggerUrl);
      const timeout = setTimeout(() => {
        ws.close();
        resolve();
      }, 2000);

      ws.on("open", () => {
        const expression = `
          (() => {
            const id = "${threadId}".toLowerCase();
            const link = Array.from(document.querySelectorAll('a[href*="/c/"]')).find(a => {
              const h = (a.getAttribute('href') || '').toLowerCase();
              return h.includes(id);
            });
            if (link) {
              link.click();
              return 'clicked';
            }
            window.location.href = '/c/' + id;
            return 'navigated';
          })()
        `;
        ws.send(JSON.stringify({
          id: 1,
          method: "Runtime.evaluate",
          params: { expression, returnByValue: true },
        }));
      });

      ws.on("message", () => {
        clearTimeout(timeout);
        ws.close();
        resolve();
      });

      ws.on("error", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  // Bring Antigravity window to the foreground with Win32 API focus
  try {
    const psScript = path.join(__dirname, "activate-antigravity.ps1");
    spawnSync("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-WindowStyle",
      "Hidden",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      psScript,
    ], { stdio: "ignore" });
  } catch {}

  // Fallback to WScript.Shell AppActivate
  try {
    execSync(`powershell -NoProfile -Command "$wshell = New-Object -ComObject WScript.Shell; $wshell.AppActivate('Antigravity')"`, {
      stdio: "ignore",
    });
  } catch {}
}

main().catch(() => {});
