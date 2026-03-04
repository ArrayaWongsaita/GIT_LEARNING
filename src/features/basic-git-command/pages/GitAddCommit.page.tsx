import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  GIT_ADD_COMMIT_COMMAND_DOCS,
  GIT_ADD_COMMIT_INITIAL_FILES,
  GIT_ADD_COMMIT_INITIAL_HISTORY,
  GIT_ADD_COMMIT_LAB_STEPS,
  type GitAddCommitEntry,
  type GitAddCommitSimulatorFile,
} from "@/features/basic-git-command/constants/git-add-commit-content.constant";

const DEFAULT_COMMIT_MESSAGE = "feat: stage and commit demo files";

const cloneInitialFiles = () =>
  GIT_ADD_COMMIT_INITIAL_FILES.map((file) => ({ ...file }));

const cloneInitialHistory = () =>
  GIT_ADD_COMMIT_INITIAL_HISTORY.map((entry) => ({
    ...entry,
    files: [...entry.files],
  }));

const FILE_TEMPLATE_BY_NAME = new Map(
  GIT_ADD_COMMIT_INITIAL_FILES.map((file) => [file.name, file]),
);

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const waitNextPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });

const createShortHash = () =>
  Math.random().toString(16).slice(2, 9).padEnd(7, "0");

const createFileIdFromName = (name: string) =>
  `generated-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const restoreFilesToStaged = (names: string[]) =>
  names.map((name) => {
    const template = FILE_TEMPLATE_BY_NAME.get(name);
    if (template) {
      return { ...template, state: "staged" as const };
    }

    return {
      id: createFileIdFromName(name),
      name,
      changeType: "modified" as const,
      state: "staged" as const,
    };
  });

const getChangeLabel = (file: GitAddCommitSimulatorFile) =>
  file.changeType === "new" ? "new file" : "modified";

type StatusTone =
  | "branch"
  | "section-staged"
  | "section-working"
  | "section-untracked"
  | "hint"
  | "entry-staged"
  | "entry-working"
  | "entry-untracked"
  | "clean"
  | "success"
  | "log-head"
  | "log-user"
  | "log-base"
  | "log-meta"
  | "error"
  | "normal";

type StatusLine = {
  text: string;
  tone: StatusTone;
};

const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  branch: "text-cyan-300",
  "section-staged": "text-emerald-300 font-semibold",
  "section-working": "text-amber-300 font-semibold",
  "section-untracked": "text-rose-300 font-semibold",
  hint: "text-slate-400",
  "entry-staged": "text-emerald-200",
  "entry-working": "text-amber-200",
  "entry-untracked": "text-rose-200",
  clean: "text-emerald-300",
  success: "text-emerald-300",
  "log-head": "text-violet-300 font-semibold",
  "log-user": "text-blue-300",
  "log-base": "text-slate-300",
  "log-meta": "text-slate-400",
  error: "text-rose-300",
  normal: "text-slate-200",
};

const renderGitStatusLines = (files: GitAddCommitSimulatorFile[]) => {
  const staged = files.filter((file) => file.state === "staged");
  const working = files.filter((file) => file.state === "working");
  const workingModified = working.filter((file) => file.changeType === "modified");
  const workingNew = working.filter((file) => file.changeType === "new");

  const lines: StatusLine[] = [
    { text: "On branch main", tone: "branch" },
    { text: "", tone: "normal" },
  ];

  if (staged.length) {
    lines.push(
      { text: "Changes to be committed:", tone: "section-staged" },
      { text: '  (use "git restore --staged <file>..." to unstage)', tone: "hint" },
      { text: "", tone: "normal" },
    );
    staged.forEach((file) => {
      lines.push({
        text: `\t${getChangeLabel(file)}:\t${file.name}`,
        tone: "entry-staged",
      });
    });
    lines.push({ text: "", tone: "normal" });
  }

  if (workingModified.length) {
    lines.push(
      { text: "Changes not staged for commit:", tone: "section-working" },
      { text: '  (use "git add <file>..." to update what will be committed)', tone: "hint" },
      { text: "", tone: "normal" },
    );
    workingModified.forEach((file) => {
      lines.push({
        text: `\tmodified:\t${file.name}`,
        tone: "entry-working",
      });
    });
    lines.push({ text: "", tone: "normal" });
  }

  if (workingNew.length) {
    lines.push(
      { text: "Untracked files:", tone: "section-untracked" },
      { text: '  (use "git add <file>..." to include in what will be committed)', tone: "hint" },
      { text: "", tone: "normal" },
    );
    workingNew.forEach((file) => {
      lines.push({
        text: `\t${file.name}`,
        tone: "entry-untracked",
      });
    });
    lines.push({ text: "", tone: "normal" });
  }

  if (!working.length && staged.length) {
    lines.push({
      text: "all tracked changes are staged and ready to commit",
      tone: "success",
    });
  }

  if (!working.length && !staged.length) {
    lines.push({
      text: "nothing to commit, working tree clean",
      tone: "clean",
    });
  }

  return lines;
};

const renderGitLogLines = (history: GitAddCommitEntry[]) => {
  if (!history.length) {
    return [
      {
        text: "fatal: your current branch 'main' does not have any commits yet",
        tone: "error" as const,
      },
    ];
  }

  return history.slice(0, 5).flatMap((entry, index) => {
    const pointer = index === 0 ? " (HEAD -> main)" : "";
    const tone: StatusTone =
      index === 0
        ? "log-head"
        : entry.isUserCommit
          ? "log-user"
          : "log-base";

    return [
      {
        text: `${entry.shortHash} ${entry.message}${pointer}`,
        tone,
      },
      {
        text: `  files: ${entry.files.join(", ")} · ${entry.createdAtLabel}`,
        tone: "log-meta" as const,
      },
    ];
  });
};

export default function GitAddCommitPage() {
  const [files, setFiles] = useState<GitAddCommitSimulatorFile[]>(cloneInitialFiles);
  const [history, setHistory] = useState<GitAddCommitEntry[]>(cloneInitialHistory);
  const [commitMessage, setCommitMessage] = useState<string>(DEFAULT_COMMIT_MESSAGE);
  const [lastCommand, setLastCommand] = useState<string>("ยังไม่ได้รันคำสั่ง");
  const [simMessage, setSimMessage] = useState<string>(
    "กด git add เพื่อย้ายไฟล์จาก Working Directory ไป Staging Area แล้ว commit เข้า Repository",
  );
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});

  const filesRef = useRef<GitAddCommitSimulatorFile[]>(cloneInitialFiles());
  const historyRef = useRef<GitAddCommitEntry[]>(cloneInitialHistory());
  const copyResetTimerRef = useRef<Record<string, number>>({});
  const workingRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stagedRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const repoDropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    const timerRegistry = copyResetTimerRef.current;
    return () => {
      Object.values(timerRegistry).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  const scheduleStatusReset = (commandKey: string) => {
    const previousTimerId = copyResetTimerRef.current[commandKey];
    if (previousTimerId) {
      window.clearTimeout(previousTimerId);
    }

    copyResetTimerRef.current[commandKey] = window.setTimeout(() => {
      setCopyStatusByCommand((prev) => ({
        ...prev,
        [commandKey]: undefined,
      }));
    }, 1500);
  };

  const handleCopyCommand = async (commandKey: string, command: string) => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable");
      }
      await navigator.clipboard.writeText(command);
      setCopyStatusByCommand((prev) => ({
        ...prev,
        [commandKey]: "copied",
      }));
    } catch {
      setCopyStatusByCommand((prev) => ({
        ...prev,
        [commandKey]: "error",
      }));
    } finally {
      scheduleStatusReset(commandKey);
    }
  };

  const moveBetweenWorkingStagingWithAnimation = async (
    fileId: string,
    toState: "working" | "staged",
    delay = 0,
  ) => {
    if (delay > 0) {
      await wait(delay);
    }

    const currentFile = filesRef.current.find((file) => file.id === fileId);
    if (!currentFile || currentFile.state === toState) {
      return false;
    }

    const fromRegistry =
      currentFile.state === "working" ? workingRefs.current : stagedRefs.current;
    const toRegistry = toState === "working" ? workingRefs.current : stagedRefs.current;

    const sourceElement = fromRegistry[fileId];
    const fromRect = sourceElement?.getBoundingClientRect();

    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              state: toState,
            }
          : file,
      ),
    );

    await waitNextPaint();

    const targetElement = toRegistry[fileId];
    if (!fromRect || !targetElement) {
      return true;
    }

    const toRect = targetElement.getBoundingClientRect();
    const cloneBase = sourceElement ?? targetElement;
    const cloneElement = cloneBase.cloneNode(true) as HTMLDivElement;

    cloneElement.style.position = "fixed";
    cloneElement.style.left = `${fromRect.left}px`;
    cloneElement.style.top = `${fromRect.top}px`;
    cloneElement.style.width = `${fromRect.width}px`;
    cloneElement.style.height = `${fromRect.height}px`;
    cloneElement.style.margin = "0";
    cloneElement.style.zIndex = "9999";
    cloneElement.style.pointerEvents = "none";

    document.body.appendChild(cloneElement);

    const previousOpacity = targetElement.style.opacity;
    targetElement.style.opacity = "0";

    try {
      await animate(cloneElement, {
        translateX: [0, toRect.left - fromRect.left],
        translateY: [0, toRect.top - fromRect.top],
        scale: [1, 0.97, 1],
        opacity: [1, 0.85, 1],
        duration: 320,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
      targetElement.style.opacity = previousOpacity;
    }

    return true;
  };

  const animateStagedToRepo = async (fileId: string, delay = 0, spreadX = 0) => {
    if (delay > 0) {
      await wait(delay);
    }

    const sourceElement = stagedRefs.current[fileId];
    const targetElement = repoDropRef.current;

    if (!sourceElement || !targetElement) {
      return false;
    }

    const fromRect = sourceElement.getBoundingClientRect();
    const toRect = targetElement.getBoundingClientRect();
    const targetX =
      toRect.left + toRect.width / 2 - fromRect.left - fromRect.width / 2 + spreadX;
    const targetY = toRect.top + toRect.height / 2 - fromRect.top - fromRect.height / 2;
    const cloneElement = sourceElement.cloneNode(true) as HTMLDivElement;

    cloneElement.style.position = "fixed";
    cloneElement.style.left = `${fromRect.left}px`;
    cloneElement.style.top = `${fromRect.top}px`;
    cloneElement.style.width = `${fromRect.width}px`;
    cloneElement.style.height = `${fromRect.height}px`;
    cloneElement.style.margin = "0";
    cloneElement.style.zIndex = "9999";
    cloneElement.style.pointerEvents = "none";

    document.body.appendChild(cloneElement);

    try {
      await animate(cloneElement, {
        translateX: [0, targetX],
        translateY: [0, targetY],
        scale: [1, 0.97, 0.9],
        opacity: [1, 0.8, 0.2],
        duration: 320,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
    }

    return true;
  };

  const animateRepoToStaged = async (fileId: string, delay = 0) => {
    if (delay > 0) {
      await wait(delay);
    }

    const sourceElement = repoDropRef.current;
    const targetElement = stagedRefs.current[fileId];

    if (!sourceElement || !targetElement) {
      return false;
    }

    const fromRect = sourceElement.getBoundingClientRect();
    const toRect = targetElement.getBoundingClientRect();
    const cloneElement = targetElement.cloneNode(true) as HTMLDivElement;
    const startLeft = fromRect.left + fromRect.width / 2 - toRect.width / 2;
    const startTop = fromRect.top + fromRect.height / 2 - toRect.height / 2;
    const targetX = toRect.left - startLeft;
    const targetY = toRect.top - startTop;

    cloneElement.style.position = "fixed";
    cloneElement.style.left = `${startLeft}px`;
    cloneElement.style.top = `${startTop}px`;
    cloneElement.style.width = `${toRect.width}px`;
    cloneElement.style.height = `${toRect.height}px`;
    cloneElement.style.margin = "0";
    cloneElement.style.zIndex = "9999";
    cloneElement.style.pointerEvents = "none";

    document.body.appendChild(cloneElement);

    const previousOpacity = targetElement.style.opacity;
    targetElement.style.opacity = "0";

    try {
      await animate(cloneElement, {
        translateX: [0, targetX],
        translateY: [0, targetY],
        scale: [0.9, 0.98, 1],
        opacity: [0.3, 0.9, 1],
        duration: 340,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
      targetElement.style.opacity = previousOpacity;
    }

    return true;
  };

  const onAddOne = async (fileId: string, command: string) => {
    setLastCommand(command);
    const moved = await moveBetweenWorkingStagingWithAnimation(fileId, "staged");
    setSimMessage(
      moved
        ? `ย้าย ${command.replace("git add ", "")} ไป Staging Area แล้ว`
        : "ไฟล์นี้ไม่อยู่ใน Working Directory หรือถูก stage ไปแล้ว",
    );
  };

  const onAddAll = async () => {
    setLastCommand("git add .");
    const workingIds = filesRef.current
      .filter((file) => file.state === "working")
      .map((file) => file.id);

    if (!workingIds.length) {
      setSimMessage("ไม่มีไฟล์ใน Working Directory ให้ add แล้ว");
      return;
    }

    const results = await Promise.all(
      workingIds.map((fileId, index) =>
        moveBetweenWorkingStagingWithAnimation(fileId, "staged", index * 90),
      ),
    );

    const movedCount = results.filter(Boolean).length;
    setSimMessage(`ย้ายไฟล์ ${movedCount} รายการจาก Working Directory ไป Staging Area แล้ว`);
  };

  const onCommit = async () => {
    const message = commitMessage.trim();
    setLastCommand(message ? `git commit -m "${message}"` : 'git commit -m ""');

    if (!message) {
      setSimMessage("กรอก commit message ก่อน commit");
      return;
    }

    const stagedFiles = filesRef.current.filter((file) => file.state === "staged");
    if (!stagedFiles.length) {
      setSimMessage("nothing to commit (staging area ว่าง)");
      return;
    }

    await Promise.all(
      stagedFiles.map((file, index) =>
        animateStagedToRepo(file.id, index * 80, (index % 2 === 0 ? -1 : 1) * 10),
      ),
    );

    const newEntry: GitAddCommitEntry = {
      id: `user-${Date.now()}`,
      message,
      shortHash: createShortHash(),
      files: stagedFiles.map((file) => file.name),
      createdAtLabel: "just now",
      isUserCommit: true,
    };

    setHistory((prev) => [newEntry, ...prev]);
    setFiles((prev) => prev.filter((file) => file.state !== "staged"));
    setSimMessage(`commit สำเร็จ: ${newEntry.shortHash} (${newEntry.files.length} files)`);
  };

  const onUndoLastCommit = async () => {
    setLastCommand("git reset --soft HEAD~1");

    const latestEntry = historyRef.current[0];
    if (!latestEntry || !latestEntry.isUserCommit) {
      setSimMessage("ไม่มี commit ล่าสุดที่สามารถ undo แบบ soft reset ได้");
      return;
    }

    const restoredFiles = restoreFilesToStaged(latestEntry.files);

    setHistory((prev) => prev.slice(1));
    setFiles((prev) => {
      const remaining = prev.filter(
        (file) => !restoredFiles.some((restored) => restored.name === file.name),
      );
      return [...remaining, ...restoredFiles];
    });

    await waitNextPaint();

    await Promise.all(
      restoredFiles.map((file, index) => animateRepoToStaged(file.id, index * 90)),
    );

    setSimMessage(`undo สำเร็จ: นำไฟล์ ${restoredFiles.length} รายการกลับมา staged แล้ว`);
  };

  const onResetDemo = () => {
    setLastCommand("Reset Demo");
    setFiles(cloneInitialFiles());
    setHistory(cloneInitialHistory());
    setCommitMessage(DEFAULT_COMMIT_MESSAGE);
    setSimMessage("รีเซ็ตสถานะจำลองเรียบร้อย พร้อมเริ่มใหม่");
  };

  const workingFiles = useMemo(
    () => files.filter((file) => file.state === "working"),
    [files],
  );
  const stagedFiles = useMemo(
    () => files.filter((file) => file.state === "staged"),
    [files],
  );
  const gitStatusLines = useMemo(() => renderGitStatusLines(files), [files]);
  const gitLogLines = useMemo(() => renderGitLogLines(history), [history]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <SetupGuideHeader
        badge="Commit Workflow"
        title="git add + commit: Working -> Staging -> Repository"
        description="เรียนรู้ flow หลักของ Git ในหน้าเดียว: แก้ไฟล์ใน Working Directory, ย้ายเข้า Staging Area ด้วย git add, แล้วบันทึกเข้า Repository ด้วย git commit"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่งสำคัญสำหรับ flow add + commit พร้อมคำอธิบายและ copy ได้รายคำสั่ง
        </p>

        <div className="mt-4 space-y-4">
          {GIT_ADD_COMMIT_COMMAND_DOCS.map((doc) => {
            const commandKey = `doc-${doc.id}`;
            const status = copyStatusByCommand[commandKey];

            return (
              <article key={doc.id} className="rounded-xl border border-border bg-muted/30 p-4">
                <h3 className="text-base font-bold text-foreground">{doc.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">สำหรับ:</span> {doc.purpose}
                </p>
                <div className="mt-3">
                  <CommandBlock
                    command={doc.command}
                    status={status}
                    onCopy={() => handleCopyCommand(commandKey, doc.command)}
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {doc.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Interactive 3-Stages Simulator</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ใช้ปุ่มคำสั่งด้านล่างเพื่อดูไฟล์เคลื่อนผ่านทั้ง 3 stage: Working Directory -&gt;
          Staging Area -&gt; Repository
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
          <Input
            value={commitMessage}
            onChange={(event) => setCommitMessage(event.target.value)}
            placeholder="feat: describe your change"
            aria-label="Commit message"
          />
          <Button type="button" size="sm" onClick={() => onAddOne("app-ts", "git add app.ts")}>
            git add app.ts
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onAddAll}>
            git add .
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onCommit}>
            git commit -m
          </Button>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onUndoLastCommit}>
              git reset --soft HEAD~1
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onResetDemo}>
              Reset Demo
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Working Directory</h3>
            <div className="mt-3 space-y-2">
              {workingFiles.length ? (
                workingFiles.map((file) => (
                  <div
                    key={file.id}
                    ref={(element) => {
                      workingRefs.current[file.id] = element;
                    }}
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.changeType}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                  ไม่มีไฟล์ค้างใน Working Directory
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Staging Area</h3>
            <div className="mt-3 space-y-2">
              {stagedFiles.length ? (
                stagedFiles.map((file) => (
                  <div
                    key={file.id}
                    ref={(element) => {
                      stagedRefs.current[file.id] = element;
                    }}
                    className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.changeType}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                  ยังไม่มีไฟล์ใน Staging Area
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Repository</h3>
            <div
              ref={repoDropRef}
              className="mt-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-3 text-xs font-semibold tracking-wide text-primary"
            >
              Commit Target Zone
            </div>

            <div className="mt-3 space-y-2">
              {history.map((entry, index) => (
                <article
                  key={entry.id}
                  className={`rounded-lg border px-3 py-2 ${
                    entry.isUserCommit
                      ? "border-primary/35 bg-primary/10"
                      : "border-border bg-background"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">#{index + 1}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {entry.shortHash} {entry.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    files: {entry.files.join(", ")} · {entry.createdAtLabel}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Last command
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{lastCommand}</p>
          <p className="mt-1 text-sm text-muted-foreground">{simMessage}</p>

          <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-black p-3 font-mono text-xs md:text-sm">
            <p className={`leading-6 whitespace-pre ${STATUS_TONE_CLASS.normal}`}>git status</p>
            {gitStatusLines.map((line, index) => (
              <p
                key={`status-${index}-${line.text}`}
                className={`leading-6 whitespace-pre ${STATUS_TONE_CLASS[line.tone]}`}
              >
                {line.text || " "}
              </p>
            ))}
            <p className={`mt-2 leading-6 whitespace-pre ${STATUS_TONE_CLASS.normal}`}>
              git log --oneline --decorate -n 5
            </p>
            {gitLogLines.map((line, index) => (
              <p
                key={`log-${index}-${line.text}`}
                className={`leading-6 whitespace-pre ${STATUS_TONE_CLASS[line.tone]}`}
              >
                {line.text || " "}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทำตามลำดับนี้บนเครื่องของตัวเองเพื่อเข้าใจ flow add + commit แบบครบวงจร
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          คำแนะนำ: รันทีละคำสั่งและเช็ก <code>git status</code> / <code>git log</code> ทุก checkpoint
        </p>

        <ol className="mt-4 space-y-3">
          {GIT_ADD_COMMIT_LAB_STEPS.map((step, index) => (
            <li key={step.id} className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">
                {index + 1}. {step.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Task:</span> {step.task}
              </p>

              <div className="mt-3 space-y-3">
                {step.commands.map((commandItem, commandIndex) => {
                  const commandKey = `lab-${step.id}-${commandIndex}`;
                  const status = copyStatusByCommand[commandKey];

                  return (
                    <div key={commandKey} className="space-y-2">
                      <CommandBlock
                        command={commandItem.command}
                        status={status}
                        onCopy={() =>
                          handleCopyCommand(commandKey, commandItem.command)
                        }
                      />
                      <p className="px-1 text-sm leading-6 text-muted-foreground">
                        {commandItem.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {step.notes?.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {step.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Checkpoint
                </p>
                <p className="mt-1 text-sm text-foreground">{step.checkpoint}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
