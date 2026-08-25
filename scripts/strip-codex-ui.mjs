import fs from "fs";

const file = "web/src/App.tsx";
let content = fs.readFileSync(file, "utf8");

// Remove AiChat imports
content = content.replace(/import type \{ AiChatOpenThreadRequest \} from "\.\/components\/AiChat";\r?\n/, "");
content = content.replace(/const AiChat = lazy\(\(\) => import\("\.\/components\/AiChat"\)\.then\(\(module\) => \(\{\r?\n  default: module\.AiChat,\r?\n\}\)\)\);\r?\n/, "");

// Remove local-ai branch in openTaskConversation
content = content.replace(
`  function openTaskConversation(conversation: TaskConversationItem) {
    if (conversation.kind === "local-ai" && conversation.aiThreadId) {
      setAiOpenThreadRequest((current) => ({
        threadId: conversation.aiThreadId!,
        requestId: (current?.requestId ?? 0) + 1,
      }));
      return;
    }`,
`  function openTaskConversation(conversation: TaskConversationItem) {`
);

// Remove Codex empty state prompt block
content = content.replace(
`        ) : boardView !== "readme"
          && hasLoadedTasks
          && tasks.length === 0
          && selectedProject
          && aiImportReadyProjectId === selectedProject.id ? (
          <div className="page-empty">
            <h2>{text("当前项目还没有任务", "This project has no issues yet")}</h2>
            <p>{text(
              "让 Codex 检查当前项目目录对应的对话，并整理任务状态。",
              "Ask Codex to inspect conversations for this project directory and organize their task status.",
            )}</p>
            <div className="page-empty-actions">
              <button
                className="button primary"
                type="button"
                onClick={() => setAiOpenThreadRequest((current) => ({
                  projectId: selectedProject.id,
                  issueId: null,
                  composerText: text(
                    "只检查当前项目目录对应的 Codex 对话。请将其中已完成、处理中和待执行的任务整理并导入当前项目的 Taskboard。",
                    "Only inspect Codex conversations associated with this project directory. Organize completed, in-progress, and pending tasks, then import them into this project's Taskboard.",
                  ),
                  requestId: (current?.requestId ?? 0) + 1,
                }))}
              >
                {text("导入当前项目任务状态", "Import current project task status")}
              </button>
              <button
                className="button secondary"
                type="button"
                onClick={() => setEditor({ task: null, status: "todo" })}
              >
                {text("添加议题", "Add issue")}
              </button>
            </div>
          </div>`,
`        ) : boardView !== "readme"
          && hasLoadedTasks
          && tasks.length === 0
          && selectedProject ? (
          <div className="page-empty">
            <h2>{text("当前项目还没有任务", "This project has no issues yet")}</h2>
            <div className="page-empty-actions">
              <button
                className="button primary"
                type="button"
                onClick={() => setEditor({ task: null, status: "todo" })}
              >
                {text("添加议题", "Add issue")}
              </button>
            </div>
          </div>`
);

// Remove the <AiChat /> component from rendering
content = content.replace(
`      {localAiChatAvailable && !isAllProjects && (
        <Suspense fallback={null}>
          <AiChat
            available
            projectId={selectedProjectId}
            issueId={detailTaskId}
            onThreadsChange={setAiThreads}
            openThreadRequest={aiOpenThreadRequest}
          />
        </Suspense>
      )}`,
``
);

fs.writeFileSync(file, content, "utf8");
console.log("Stripped all codex UI from App.tsx");
