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
  
  const browserTarget = targets.find(t => t.type === "browser");
  if (!browserTarget) {
    console.log("No browser target found. Targets:", targets);
    return;
  }
  const ws = new WebSocket(browserTarget.webSocketDebuggerUrl);
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

  const res = await send("Target.getTargets", {});
  console.log("All targets from Target.getTargets:", res.result.targetInfos.map(t => t.type + " | " + t.url + " | " + t.title));
  ws.close();
}
main();
