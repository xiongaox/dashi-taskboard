window.__ModuleLoader__.load({
  id: "dsh-antigravity-taskboard",
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
    const React = require("react");
    const { useEffect, useState } = React;

    const ROUTE = "/integrations/antigravity-taskboard";
    const PANEL_ID = "dsh-antigravity-taskboard-panel";
    const STYLE_ID = "dsh-antigravity-taskboard-style";
    const CSS = `
.dsh-antigravity-taskboard-trigger{box-sizing:border-box;display:flex;align-items:center;gap:8px;width:calc(100% + 8px);height:34px;margin:4px -4px;padding:6px 2px 6px 10px;border:0;border-radius:12px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;overflow:hidden}
.dsh-antigravity-taskboard-trigger:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-antigravity-taskboard-trigger.rail{justify-content:center;width:36px;height:36px;margin:8px 0 10px;padding:0;border-radius:50%}
.dsh-antigravity-taskboard-label{white-space:nowrap;overflow:hidden}
.dsh-antigravity-taskboard-panel{position:fixed;z-index:900;display:flex;flex-direction:column;box-sizing:border-box;border-left:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv3)}
.dsh-antigravity-taskboard-header{display:flex;flex:none;align-items:center;justify-content:space-between;height:48px;padding:8px 14px 8px 18px;box-sizing:border-box;color:var(--dsw-alias-label-primary)}
.dsh-antigravity-taskboard-actions{display:flex;gap:8px}
.dsh-antigravity-taskboard-action{border:0;border-radius:8px;background:transparent;color:inherit;cursor:pointer;padding:5px 9px;font:inherit}
.dsh-antigravity-taskboard-action:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-antigravity-taskboard-frame{flex:1;min-height:0;border:0;background:#fff}
`;

    function centerColumnBox() {
      for (const element of document.querySelectorAll("*")) {
        for (const className of element.classList) {
          if (!className.endsWith("_centerCol")) continue;
          const rect = element.getBoundingClientRect();
          return {
            left: rect.left,
            top: rect.top,
            right: window.innerWidth - rect.right,
            bottom: window.innerHeight - rect.bottom,
          };
        }
      }
      return { left: 0, top: 0, right: 0, bottom: 0 };
    }

    function useCenterColumnBox() {
      const [box, setBox] = useState(centerColumnBox);
      useEffect(() => {
        const measure = () => setBox(centerColumnBox());
        const observer = new ResizeObserver(measure);
        const column = [...document.querySelectorAll("*")].find((element) =>
          [...element.classList].some((className) => className.endsWith("_centerCol")),
        );
        if (column) observer.observe(column);
        window.addEventListener("resize", measure);
        return () => {
          observer.disconnect();
          window.removeEventListener("resize", measure);
        };
      }, []);
      return box;
    }

    function ChecklistIcon() {
      return React.createElement(
        "svg",
        { width: 18, height: 18, viewBox: "0 0 18 18", fill: "none", "aria-hidden": true },
        React.createElement("path", {
          d: "M3.5 4.5h1.2l.8.9 1.7-2M8 4.5h6.5M3.5 9h1.2l.8.9 1.7-2M8 9h6.5M3.5 13.5h1.2l.8.9 1.7-2M8 13.5h6.5",
          stroke: "currentColor",
          strokeWidth: 1.35,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }),
      );
    }

    function TaskboardPanel({ onClose }) {
      const box = useCenterColumnBox();
      const [generation, setGeneration] = useState(0);
      return React.createElement(
        "aside",
        {
          id: PANEL_ID,
          className: "dsh-antigravity-taskboard-panel",
          style: box,
          "aria-label": "任务面板",
        },
        React.createElement(
          "div",
          { className: "dsh-antigravity-taskboard-header" },
          React.createElement("strong", null, "任务面板"),
          React.createElement(
            "div",
            { className: "dsh-antigravity-taskboard-actions" },
            React.createElement(
              "button",
              {
                type: "button",
                className: "dsh-antigravity-taskboard-action",
                onClick: () => setGeneration((value) => value + 1),
              },
              "刷新",
            ),
            React.createElement(
              "button",
              { type: "button", className: "dsh-antigravity-taskboard-action", onClick: onClose },
              "关闭",
            ),
          ),
        ),
        React.createElement("iframe", {
          key: generation,
          className: "dsh-antigravity-taskboard-frame",
          src: `${ROUTE}?refresh=${generation}`,
          title: "Antigravity Taskboard",
        }),
      );
    }

    function TaskboardEntry({ wide }) {
      const [open, setOpen] = useState(false);
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            type: "button",
            className: `dsh-antigravity-taskboard-trigger${wide ? "" : " rail"}`,
            title: "任务面板",
            "aria-label": "任务面板",
            "aria-expanded": open,
            "aria-controls": PANEL_ID,
            onClick: () => setOpen((value) => !value),
          },
          React.createElement(ChecklistIcon),
          wide && React.createElement("span", { className: "dsh-antigravity-taskboard-label" }, "任务面板"),
        ),
        open && React.createElement(TaskboardPanel, { onClose: () => setOpen(false) }),
      );
    }

    const inject = ["slots"];

    function apply(ctx) {
      ctx.effect(() => {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.dataset.plugin = "dsh-antigravity-taskboard";
        style.textContent = CSS;
        document.head.appendChild(style);
        return () => style.remove();
      }, "antigravity-taskboard: styles");

      ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
        name: "sidebar.footer.action",
        id: "antigravity-taskboard",
        order: 0,
      }, TaskboardEntry));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
