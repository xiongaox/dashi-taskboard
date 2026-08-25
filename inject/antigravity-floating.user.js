
(() => {
  if (document.getElementById("antigravity-taskboard-frame")) return;
  const frame = document.createElement("iframe");
  frame.id = "antigravity-taskboard-frame";
  frame.src = "http://127.0.0.1:47823";
  frame.style.position = "fixed";
  frame.style.left = "20px";
  frame.style.bottom = "20px";
  frame.style.width = "400px";
  frame.style.height = "500px";
  frame.style.border = "1px solid #555";
  frame.style.borderRadius = "8px";
  frame.style.zIndex = "999999";
  frame.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
  document.body.appendChild(frame);
})();

