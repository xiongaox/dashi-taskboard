import http from "http";
import WebSocket from "ws"; // Assuming ws is available from dashi-taskboard/node_modules

function fetchTargets() {
  return new Promise((resolve, reject) => {
    http.get("http://127.0.0.1:9223/json", (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

async function dump() {
  const targets = await fetchTargets();
  const pageTarget = targets.find(t => t.type === "page" && t.url.includes("127.0.0.1"));
  if (!pageTarget) {
    console.log("No page target found", targets);
    return;
  }
  
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  ws.on("open", () => {
    ws.send(JSON.stringify({
      id: 1,
      method: "Runtime.evaluate",
      params: {
        expression: "document.body.innerHTML",
        returnByValue: true
      }
    }));
  });
  
  ws.on("message", (msg) => {
    const res = JSON.parse(msg);
    if (res.id === 1) {
      console.log(res.result.result.value);
      ws.close();
    }
  });
}
dump();

