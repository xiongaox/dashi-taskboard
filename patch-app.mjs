const fs = require("fs");
const file = "server/app.mjs";
let code = fs.readFileSync(file, "utf8");

const patch = `
events.on("task.moved", async ({ task }) => {
  if (task.status === "in_progress" && !task.threadId) {
    try {
      const { exec } = await import("node:child_process");
      const { promisify } = await import("node:util");
      const execAsync = promisify(exec);
      
      const prompt = \`[$manage-taskboard](~/.gemini/config/skills/manage-taskboard/SKILL.md) 帮我处理议题 \${task.identifier}\`;
      const cmd = \`agentapi new-conversation "\${prompt}"\`;
      console.log("[Antigravity] Auto-dispatching:", cmd);
      await execAsync(cmd);
    } catch (e) {
      console.error("[Antigravity] Auto-dispatch failed:", e);
    }
  }
});
`;

if (!code.includes("events.on(\\"task.moved\\", async ({ task })")) {
  code += "\\n" + patch;
  fs.writeFileSync(file, code);
}

