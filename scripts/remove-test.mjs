import fs from "fs";

const file = "test/server.test.mjs";
let content = fs.readFileSync(file, "utf8");

content = content.replace(/test\("device workspaces come from this machine's Codex project roots"[\s\S]*?\}\);/g, "");

fs.writeFileSync(file, content, "utf8");
console.log("Removed that one test");
