import fs from "fs";

const file = "web/src/App.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
`    const taskThreadId = normalizeCodexThreadId(task.threadId);
    return [task.id, taskCardPresentation(
      task,
      aiThreads,
      unread,
      runningNativeThreadId,
      hostContext?.threadTodoProgress ?? null,
      taskThreadId ? codexThreadProgress[taskThreadId] ?? null : undefined,
    )];
  })) as Record<string, TaskCardPresentation>, [
    aiThreads,
    codexThreadProgress,
    hostContext?.threadId,
    hostContext?.threadRunning,
    hostContext?.threadTodoProgress,
    readActivityKeys,
    tasks,
  ]);`,
`    return [task.id, taskCardPresentation(
      task,
      unread,
      runningNativeThreadId,
      hostContext?.threadTodoProgress ?? null,
    )];
  })) as Record<string, TaskCardPresentation>, [
    hostContext?.threadId,
    hostContext?.threadRunning,
    hostContext?.threadTodoProgress,
    readActivityKeys,
    tasks,
  ]);`
);

content = content.replace(
`      <TaskDetail
        key={detailTask.id}
        task={detailTask}
        tasks={tasks.filter((task) => task.projectId === detailTask.projectId)}
        referenceTasks={referenceTasks.filter((task) => task.projectId === detailTask.projectId)}
        currentUser={currentUser}
        availableLabels={availableLabels}
        developmentScan={developmentScan}
        developmentScanLoading={developmentScanLoading}
        commentsRevision={commentsRevision}
        attachmentsRevision={attachmentsRevision}
        onCreateLabel={persistProjectLabel}
        onDeleteLabel={removeProjectLabel}
        onUpdate={(current, changes) => updateTaskProperties(current, changes)}
        onOpenTask={openTaskDetail}
        onAddRelation={(current, type, relatedTaskId, origin) => (
          mutateTaskRelation("add", current, type, relatedTaskId, origin)
        )}
        onRemoveRelation={(current, type, relatedTaskId, origin) => (
          mutateTaskRelation("remove", current, type, relatedTaskId, origin)
        )}
        onOpenThread={openThread}
        onOpenLegacyLocalThread={openLegacyLocalThread}
        onOpenInThread={openTaskInThread}
        onCopy={(text, message) => void copyText(text, message)}
        openingThread={openingThreadTaskId === detailTask.id}
        onError={setActionError}
      />
    ) : boardView !== "readme"
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
      </div>
    ) : (`,
`      <TaskDetail
        key={detailTask.id}
        task={detailTask}
        tasks={tasks.filter((task) => task.projectId === detailTask.projectId)}
        referenceTasks={referenceTasks.filter((task) => task.projectId === detailTask.projectId)}
        currentUser={currentUser}
        availableLabels={availableLabels}
        developmentScan={developmentScan}
        developmentScanLoading={developmentScanLoading}
        commentsRevision={commentsRevision}
        attachmentsRevision={attachmentsRevision}
        onCreateLabel={persistProjectLabel}
        onDeleteLabel={removeProjectLabel}
        onUpdate={(current, changes) => updateTaskProperties(current, changes)}
        onOpenTask={openTaskDetail}
        onAddRelation={(current, type, relatedTaskId, origin) => (
          mutateTaskRelation("add", current, type, relatedTaskId, origin)
        )}
        onRemoveRelation={(current, type, relatedTaskId, origin) => (
          mutateTaskRelation("remove", current, type, relatedTaskId, origin)
        )}
        onOpenThread={openThread}
        onOpenLegacyLocalThread={openLegacyLocalThread}
        onOpenInThread={openTaskInThread}
        onCopy={(text, message) => void copyText(text, message)}
        openingThread={openingThreadTaskId === detailTask.id}
        onError={setActionError}
      />
    ) : boardView !== "readme"
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
      </div>
    ) : (`
);

content = content.replace(
`  {localAiChatAvailable && !isAllProjects && (
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
console.log("Fixed App.tsx remaining codex UI");
