import fs from "fs";

const file = "web/src/taskConversations.ts";
let content = fs.readFileSync(file, "utf8");

// Remove AiChatThread import
content = content.replace(/import type \{ AiChatThread \} from "\.\/components\/AiChat";\r?\n/, "");

// Clean taskConversations
content = content.replace(
`export function taskConversations(task: Task, aiThreads: AiChatThread[]) {`,
`export function taskConversations(task: Task) {`
);

// Remove the loop for aiThreads
content = content.replace(
`  for (const thread of aiThreads) {
    if (thread.origin.projectId !== task.projectId || thread.origin.issueId !== task.id) continue;
    const normalizedId = normalizeCodexThreadId(thread.codexThreadId);
    const key = normalizedId ? \`codex:\${normalizedId}\` : \`ai:\${thread.id}\`;
    const current = items.get(key);
    const threadActivityUpdatedAt = [
      thread.updatedAt,
      thread.currentRun?.startedAt ?? "",
      thread.latestTodo?.updatedAt ?? "",
    ].reduce(newerTimestamp);
    const candidate: TaskConversationItem = {
      key,
      projectId: task.projectId,
      kind: "local-ai",
      title: thread.title || thread.origin.issueIdentifier || task.title,
      source: "local-ai",
      nativeThreadId: current?.nativeThreadId ?? thread.codexThreadId,
      threadBinding: current?.threadBinding ?? null,
      legacyLocalThreadId: current?.legacyLocalThreadId ?? null,
      aiThreadId: thread.id,
      updatedAt: current?.kind === "native"
        ? newerTimestamp(current.updatedAt, threadActivityUpdatedAt)
        : threadActivityUpdatedAt,
      currentRun: thread.currentRun ?? null,
      latestTodo: thread.latestTodo ?? null,
    };
    if (current?.kind === "local-ai") {
      const currentRunning = current.currentRun?.status === "running";
      const candidateRunning = candidate.currentRun?.status === "running";
      if (currentRunning && !candidateRunning) continue;
      if (currentRunning === candidateRunning && current.updatedAt > threadActivityUpdatedAt) continue;
    }
    items.set(key, candidate);
  }`,
""
);

// Clean taskCardPresentation
content = content.replace(
`export function taskCardPresentation(
  task: Task,
  aiThreads: AiChatThread[],
  unread: boolean,
  runningNativeThreadId: string | null = null,
  runningNativeTodoProgress: { completed: number; total: number } | null = null,
  taskNativeSession: {
    completed: number | null;
    total: number | null;
    running: boolean;
  } | null | undefined = undefined,
): TaskCardPresentation {
  const conversations = taskConversations(task, aiThreads);
  const runningAi = conversations
    .filter((conversation) => conversation.currentRun?.status === "running")
    .sort((left, right) => (
      (right.currentRun?.startedAt ?? "").localeCompare(left.currentRun?.startedAt ?? "")
    ))[0];
  const normalizedRunningNativeThreadId = normalizeCodexThreadId(runningNativeThreadId);
  const runningNative = task.status === "in_progress" && normalizedRunningNativeThreadId
    ? conversations.find((conversation) => (
        normalizeCodexThreadId(conversation.nativeThreadId) === normalizedRunningNativeThreadId
      ))
    : undefined;
  const running = runningAi ?? runningNative;
  const taskNativeTodoProgress = taskNativeSession
    && taskNativeSession.completed !== null
    && taskNativeSession.total !== null
    ? { completed: taskNativeSession.completed, total: taskNativeSession.total }
    : null;
  const latestTodo = runningAi
    ? runningAi.latestTodo
    : runningNative
      ? taskNativeTodoProgress ?? runningNativeTodoProgress ?? null
      : taskNativeSession !== undefined
        ? taskNativeTodoProgress
        : conversations.find((conversation) => conversation.latestTodo)?.latestTodo ?? null;
  return {
    conversations,
    unread,
    processing: {
      running: task.status === "in_progress"
        && (Boolean(running) || taskNativeSession?.running === true),
      completed: latestTodo?.completed ?? null,
      total: latestTodo?.total ?? null,
      startedAt: runningAi?.currentRun?.startedAt ?? null,
    },
  };
}`,
`export function taskCardPresentation(
  task: Task,
  unread: boolean,
  runningNativeThreadId: string | null = null,
  runningNativeTodoProgress: { completed: number; total: number } | null = null,
): TaskCardPresentation {
  const conversations = taskConversations(task);
  const normalizedRunningNativeThreadId = normalizeCodexThreadId(runningNativeThreadId);
  const runningNative = task.status === "in_progress" && normalizedRunningNativeThreadId
    ? conversations.find((conversation) => (
        normalizeCodexThreadId(conversation.nativeThreadId) === normalizedRunningNativeThreadId
      ))
    : undefined;
  const running = runningNative;
  const latestTodo = runningNative
    ? runningNativeTodoProgress ?? null
    : conversations.find((conversation) => conversation.latestTodo)?.latestTodo ?? null;
  return {
    conversations,
    unread,
    processing: {
      running: task.status === "in_progress" && Boolean(running),
      completed: latestTodo?.completed ?? null,
      total: latestTodo?.total ?? null,
      startedAt: null,
    },
  };
}`
);

fs.writeFileSync(file, content, "utf8");
console.log("Stripped codex UI from taskConversations.ts");
