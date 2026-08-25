import http from "node:http";
import WebSocket from "ws";

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

async function main() {
  const targets = await fetchJson("http://127.0.0.1:9223/json/list");
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise(r => ws.once("open", r));
  
  let msgId = 1;
  const send = (method, params) => new Promise((resolve) => {
    const id = msgId++;
    const handler = (msg) => {
      const data = JSON.parse(msg);
      if (data.id === id) {
        ws.removeListener("message", handler);
        resolve(data);
      }
    };
    ws.on("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const res = await send("Runtime.evaluate", {
    expression: `(() => {
      const texts = [];
      function walk(node) {
        if (node.nodeType === 3) {
          const t = node.textContent.trim();
          if (t && (t.includes("计划任务") || t.includes("项目") || t.includes("Project"))) {
            let p = node.parentElement;
            texts.push(t + " -> " + (p ? p.className : "") + " | " + (p ? p.tagName : ""));
          }
        }
        if (node.shadowRoot) walk(node.shadowRoot);
        for (let child of node.childNodes) walk(child);
      }
      walk(document);
      return texts;
    })()`,
    returnByValue: true
  });
  console.log(res.result.result.value);
  ws.close();
}
main();
