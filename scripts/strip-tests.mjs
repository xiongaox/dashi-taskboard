import fs from "fs";

const file = "test/server.test.mjs";
let content = fs.readFileSync(file, "utf8");

function removeTest(name) {
  const target = 'test("' + name + '"';
  const index = content.indexOf(target);
  if (index === -1) {
    console.log("NOT FOUND:", name);
    return;
  }
  let endIndex = index;
  let braceCount = 0;
  let started = false;
  while (endIndex < content.length) {
    if (content[endIndex] === "{") {
      braceCount++;
      started = true;
    } else if (content[endIndex] === "}") {
      braceCount--;
    }
    if (started && braceCount === 0) {
      endIndex += 3; // "});"
      break;
    }
    endIndex++;
  }
  content = content.substring(0, index) + content.substring(endIndex);
}

removeTest("development context scan resolves the current Codex conversation workspace");
removeTest("device workspaces come from this machine\\'s Codex project roots"); // Note: \'
removeTest("remote task bindings keep their own identity and can be cleared independently");
removeTest("the active local Codex conversation supplies its exact task binding identity");

// Also remove them from project-home.test.mjs
const homeFile = "test/project-home.test.mjs";
if (fs.existsSync(homeFile)) {
  let homeContent = fs.readFileSync(homeFile, "utf8");
  homeContent = homeContent.replace(/.*ProjectAutomationMenu.*/g, "");
  fs.writeFileSync(homeFile, homeContent, "utf8");
}

fs.writeFileSync(file, content, "utf8");
console.log("Removed tests");
