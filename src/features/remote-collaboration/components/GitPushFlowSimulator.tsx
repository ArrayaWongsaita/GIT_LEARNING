import { type ReactNode, useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  GIT_PUSH_SIMULATOR_ACTIONS,
  GIT_PUSH_SIMULATOR_COMMIT_MESSAGE,
  GIT_PUSH_SIMULATOR_DEMO_COMMIT,
  GIT_PUSH_SIMULATOR_FLOW_STEPS,
  GIT_PUSH_SIMULATOR_INITIAL_FILES,
  GIT_PUSH_SIMULATOR_INITIAL_LOCAL_HISTORY,
  GIT_PUSH_SIMULATOR_INITIAL_REMOTE_HISTORY,
  type GitPushSimulatorCommit,
  type GitPushSimulatorFile,
} from "@/features/remote-collaboration/constants/git-push-content.constant";

type TerminalTone =
  | "label"
  | "branch"
  | "remote"
  | "hint"
  | "section-staged"
  | "section-working"
  | "section-untracked"
  | "entry-staged"
  | "entry-working"
  | "entry-untracked"
  | "clean"
  | "log-head"
  | "log-remote"
  | "log-user"
  | "log-base"
  | "log-meta"
  | "normal";

type TerminalLine = {
  text: string;
  tone: TerminalTone;
};

const TERMINAL_TONE_CLASS: Record<TerminalTone, string> = {
  label: "text-slate-400 uppercase tracking-wide",
  branch: "text-cyan-300",
  remote: "text-sky-300",
  hint: "text-slate-400",
  "section-staged": "text-emerald-300 font-semibold",
  "section-working": "text-amber-300 font-semibold",
  "section-untracked": "text-rose-300 font-semibold",
  "entry-staged": "text-emerald-200",
  "entry-working": "text-amber-200",
  "entry-untracked": "text-rose-200",
  clean: "text-emerald-300",
  "log-head": "text-violet-300 font-semibold",
  "log-remote": "text-sky-300",
  "log-user": "text-blue-300",
  "log-base": "text-slate-300",
  "log-meta": "text-slate-400",
  normal: "text-slate-200",
};

const FILE_TYPE_LABEL: Record<GitPushSimulatorFile["changeType"], string> = {
  modified: "modified",
  new: "new file",
};

const cloneInitialFiles = () => GIT_PUSH_SIMULATOR_INITIAL_FILES.map((file) => ({ ...file }));

const cloneHistory = (history: GitPushSimulatorCommit[]) =>
  history.map((entry) => ({
    ...entry,
    files: [...entry.files],
  }));

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

const getAheadCount = (
  localHistory: GitPushSimulatorCommit[],
  remoteHistory: GitPushSimulatorCommit[],
) => {
  const remoteHeadId = remoteHistory[0]?.id;

  if (!remoteHeadId) {
    return localHistory.length;
  }

  const remoteHeadIndex = localHistory.findIndex((entry) => entry.id === remoteHeadId);
  return remoteHeadIndex === -1 ? localHistory.length : remoteHeadIndex;
};

const createUserCommit = (
  commitIndex: number,
  files: GitPushSimulatorFile[],
): GitPushSimulatorCommit => {
  const hashPrefix = GIT_PUSH_SIMULATOR_DEMO_COMMIT.shortHash.slice(0, 6);

  return {
    id: `${GIT_PUSH_SIMULATOR_DEMO_COMMIT.id}-${commitIndex}`,
    shortHash: `${hashPrefix}${Math.min(commitIndex, 15).toString(16)}`.slice(0, 7),
    message: GIT_PUSH_SIMULATOR_DEMO_COMMIT.message,
    files: files.map((file) => file.name),
    createdAtLabel: GIT_PUSH_SIMULATOR_DEMO_COMMIT.createdAtLabel,
    isUserCommit: true,
  };
};

const renderGitStatusLines = (
  files: GitPushSimulatorFile[],
  aheadCount: number,
): TerminalLine[] => {
  const stagedFiles = files.filter((file) => file.state === "staged");
  const workingFiles = files.filter((file) => file.state === "working");
  const workingModified = workingFiles.filter((file) => file.changeType === "modified");
  const workingNew = workingFiles.filter((file) => file.changeType === "new");

  const lines: TerminalLine[] = [{ text: "On branch main", tone: "branch" }];

  if (aheadCount > 0) {
    lines.push(
      {
        text: `Your branch is ahead of 'origin/main' by ${aheadCount} commit${
          aheadCount > 1 ? "s" : ""
        }.`,
        tone: "remote",
      },
      { text: '  (use "git push" to publish your local commits)', tone: "hint" },
    );
  } else {
    lines.push({
      text: "Your branch is up to date with 'origin/main'.",
      tone: "clean",
    });
  }

  lines.push({ text: "", tone: "normal" });

  if (stagedFiles.length) {
    lines.push(
      { text: "Changes to be committed:", tone: "section-staged" },
      { text: '  (use "git restore --staged <file>..." to unstage)', tone: "hint" },
      { text: "", tone: "normal" },
    );

    stagedFiles.forEach((file) => {
      lines.push({
        text: `\t${FILE_TYPE_LABEL[file.changeType]}:\t${file.name}`,
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

  if (!stagedFiles.length && !workingFiles.length) {
    lines.push({
      text: "nothing to commit, working tree clean",
      tone: "clean",
    });
  }

  return lines;
};

const renderGitLogLines = (
  localHistory: GitPushSimulatorCommit[],
  remoteHeadId: string | undefined,
): TerminalLine[] =>
  localHistory.slice(0, 5).flatMap((entry, index) => {
    const decorations: string[] = [];

    if (index === 0) {
      decorations.push("HEAD -> main");
    }

    if (remoteHeadId === entry.id) {
      decorations.push("origin/main");
    }

    const tone: TerminalTone =
      index === 0
        ? "log-head"
        : remoteHeadId === entry.id
          ? "log-remote"
          : entry.isUserCommit
            ? "log-user"
            : "log-base";

    const suffix = decorations.length ? ` (${decorations.join(", ")})` : "";

    return [
      {
        text: `${entry.shortHash} ${entry.message}${suffix}`,
        tone,
      },
      {
        text: `  files: ${entry.files.join(", ")} · ${entry.createdAtLabel}`,
        tone: "log-meta",
      },
    ];
  });

type StageColumnProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

function StageColumn({ title, subtitle, children }: StageColumnProps) {
  return (
    <section className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs leading-5 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="mt-3 flex min-h-44 flex-col gap-2">{children}</div>
    </section>
  );
}

type CommitCardProps = {
  entry: GitPushSimulatorCommit;
  onRef: (element: HTMLDivElement | null) => void;
};

function CommitCard({ entry, onRef }: CommitCardProps) {
  return (
    <article
      ref={onRef}
      className={cn(
        "rounded-lg border px-3 py-2",
        entry.isUserCommit
          ? "border-primary/35 bg-primary/10"
          : "border-border bg-background",
      )}
    >
      <p className="text-sm font-semibold text-foreground">
        {entry.shortHash} {entry.message}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        files: {entry.files.join(", ")} · {entry.createdAtLabel}
      </p>
    </article>
  );
}

export function GitPushFlowSimulator() {
  const [files, setFiles] = useState<GitPushSimulatorFile[]>(cloneInitialFiles);
  const [localHistory, setLocalHistory] = useState<GitPushSimulatorCommit[]>(
    cloneHistory(GIT_PUSH_SIMULATOR_INITIAL_LOCAL_HISTORY),
  );
  const [remoteHistory, setRemoteHistory] = useState<GitPushSimulatorCommit[]>(
    cloneHistory(GIT_PUSH_SIMULATOR_INITIAL_REMOTE_HISTORY),
  );
  const [lastCommand, setLastCommand] = useState<string>("ยังไม่ได้รันคำสั่ง");
  const [simMessage, setSimMessage] = useState<string>(
    "เริ่มจาก Working Directory แล้วค่อย stage, commit และ push เพื่อดูว่า remote รับเฉพาะสิ่งที่อยู่ใน commit เท่านั้น",
  );
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const filesRef = useRef<GitPushSimulatorFile[]>(cloneInitialFiles());
  const commitCounterRef = useRef<number>(0);
  const workingRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stagedRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const localCommitRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const remoteCommitRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const localRepoDropRef = useRef<HTMLDivElement | null>(null);
  const remoteRepoDropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const moveFileToState = async (
    fileId: string,
    toState: GitPushSimulatorFile["state"],
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

  const animateCardToDropZone = async (
    sourceElement: HTMLDivElement | null,
    targetElement: HTMLDivElement | null,
    delay = 0,
    spreadX = 0,
  ) => {
    if (delay > 0) {
      await wait(delay);
    }

    if (!sourceElement || !targetElement) {
      return false;
    }

    const fromRect = sourceElement.getBoundingClientRect();
    const toRect = targetElement.getBoundingClientRect();
    const cloneElement = sourceElement.cloneNode(true) as HTMLDivElement;
    const targetX =
      toRect.left + toRect.width / 2 - fromRect.left - fromRect.width / 2 + spreadX;
    const targetY = toRect.top + toRect.height / 2 - fromRect.top - fromRect.height / 2;

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
        duration: 340,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
    }

    return true;
  };

  const pulseElement = async (element: HTMLDivElement | null) => {
    if (!element) {
      return;
    }

    await animate(element, {
      scale: [1, 1.03, 1],
      duration: 260,
      ease: "outQuad",
    });
  };

  const aheadCount = getAheadCount(localHistory, remoteHistory);
  const workingFiles = files.filter((file) => file.state === "working");
  const stagedFiles = files.filter((file) => file.state === "staged");
  const statusLines = renderGitStatusLines(files, aheadCount);
  const logLines = renderGitLogLines(localHistory, remoteHistory[0]?.id);

  const onAddAppTs = async () => {
    if (isAnimating) {
      return;
    }

    const addAppCommand = GIT_PUSH_SIMULATOR_ACTIONS.find(
      (action) => action.id === "add-app-ts",
    )?.command;
    setLastCommand(addAppCommand ?? "git add app.ts");
    setIsAnimating(true);

    const appFile = filesRef.current.find((file) => file.id === "app-ts");

    if (!appFile) {
      setSimMessage("app.ts ถูก commit ไปแล้ว ตอนนี้ไม่มี pending change ของไฟล์นี้ให้ stage");
      setIsAnimating(false);
      return;
    }

    if (appFile.state === "staged") {
      setSimMessage("app.ts อยู่ใน Staging Area แล้ว");
      setIsAnimating(false);
      return;
    }

    const moved = await moveFileToState("app-ts", "staged");
    setSimMessage(
      moved
        ? "ย้าย app.ts จาก Working Directory ไป Staging Area แล้ว"
        : "ไม่พบ app.ts ใน Working Directory",
    );

    await pulseElement(stagedRefs.current["app-ts"]);
    setIsAnimating(false);
  };

  const onAddAll = async () => {
    if (isAnimating) {
      return;
    }

    const addAllCommand = GIT_PUSH_SIMULATOR_ACTIONS.find(
      (action) => action.id === "add-all",
    )?.command;
    setLastCommand(addAllCommand ?? "git add .");

    const workingFileIds = filesRef.current
      .filter((file) => file.state === "working")
      .map((file) => file.id);

    if (!workingFileIds.length) {
      setSimMessage("ไม่มีไฟล์ใน Working Directory ให้เพิ่มแล้ว");
      return;
    }

    setIsAnimating(true);

    let movedCount = 0;

    for (const [index, fileId] of workingFileIds.entries()) {
      const moved = await moveFileToState(fileId, "staged", index * 60);

      if (moved) {
        movedCount += 1;
      }
    }

    setSimMessage(`ย้ายไฟล์ ${movedCount} รายการเข้า Staging Area แล้ว`);
    setIsAnimating(false);
  };

  const onCommit = async () => {
    if (isAnimating) {
      return;
    }

    const commitCommand = GIT_PUSH_SIMULATOR_ACTIONS.find(
      (action) => action.id === "commit",
    )?.command;
    setLastCommand(commitCommand ?? `git commit -m "${GIT_PUSH_SIMULATOR_COMMIT_MESSAGE}"`);

    if (!stagedFiles.length) {
      setSimMessage("ยังไม่มีไฟล์ใน Staging Area ให้ commit");
      return;
    }

    setIsAnimating(true);

    await Promise.all(
      stagedFiles.map((file, index) =>
        animateCardToDropZone(
          stagedRefs.current[file.id],
          localRepoDropRef.current,
          index * 70,
          (index % 2 === 0 ? -1 : 1) * 10,
        ),
      ),
    );

    commitCounterRef.current += 1;
    const newCommit = createUserCommit(commitCounterRef.current, stagedFiles);

    setFiles((prev) => prev.filter((file) => file.state !== "staged"));
    setLocalHistory((prev) => [newCommit, ...prev]);
    setSimMessage(
      `สร้าง local commit ${newCommit.shortHash} แล้ว ตอนนี้ local main พร้อม push ไป origin/main`,
    );

    await waitNextPaint();
    await pulseElement(localCommitRefs.current[newCommit.id] ?? localRepoDropRef.current);
    setIsAnimating(false);
  };

  const onPush = async () => {
    if (isAnimating) {
      return;
    }

    const pushCommand = GIT_PUSH_SIMULATOR_ACTIONS.find(
      (action) => action.id === "push",
    )?.command;
    setLastCommand(pushCommand ?? "git push origin main");

    if (!aheadCount) {
      setSimMessage("local main ยังไม่ได้มี commit ใหม่ที่ต้อง push");
      return;
    }

    setIsAnimating(true);

    const commitsToPush = [...localHistory.slice(0, aheadCount)].reverse();

    for (const commit of commitsToPush) {
      await animateCardToDropZone(
        localCommitRefs.current[commit.id],
        remoteRepoDropRef.current,
      );
    }

    const nextRemoteHistory = cloneHistory(localHistory);
    setRemoteHistory(nextRemoteHistory);
    setSimMessage(
      `push สำเร็จ: ส่ง ${aheadCount} commit${aheadCount > 1 ? "s" : ""} ไปยัง Remote Repository แล้ว`,
    );

    await waitNextPaint();
    await pulseElement(remoteCommitRefs.current[localHistory[0]?.id ?? ""] ?? remoteRepoDropRef.current);
    setIsAnimating(false);
  };

  const onResetDemo = () => {
    if (isAnimating) {
      return;
    }

    const resetCommand = GIT_PUSH_SIMULATOR_ACTIONS.find(
      (action) => action.id === "reset",
    )?.command;

    setLastCommand(resetCommand ?? "Reset Demo");
    setFiles(cloneInitialFiles());
    setLocalHistory(cloneHistory(GIT_PUSH_SIMULATOR_INITIAL_LOCAL_HISTORY));
    setRemoteHistory(cloneHistory(GIT_PUSH_SIMULATOR_INITIAL_REMOTE_HISTORY));
    setSimMessage("รีเซ็ต simulator แล้ว พร้อมเริ่มดู flow จาก Working Directory ใหม่อีกครั้ง");
    commitCounterRef.current = 0;
  };

  const actionState = {
    "add-app-ts": {
      disabled: isAnimating,
      onClick: onAddAppTs,
    },
    "add-all": {
      disabled: isAnimating,
      onClick: onAddAll,
    },
    commit: {
      disabled: isAnimating || !stagedFiles.length,
      onClick: onCommit,
    },
    push: {
      disabled: isAnimating || aheadCount === 0,
      onClick: onPush,
    },
    reset: {
      disabled: isAnimating,
      onClick: onResetDemo,
    },
  } as const;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <h2 className="text-xl font-black tracking-tight text-foreground">
        Interactive 4-Stages Simulator
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        ใช้ปุ่มคำสั่งด้านล่างเพื่อดูไฟล์เคลื่อนผ่านทั้ง 3 local stages แล้วค่อย publish
        commit ไปยัง Remote Repository: Working Directory -&gt; Staging Area -&gt;
        Repository -&gt; Remote Repository
      </p>

      <ol className="mt-4 grid gap-3 md:grid-cols-2">
        {GIT_PUSH_SIMULATOR_FLOW_STEPS.map((step, index) => (
          <li
            key={step}
            className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3"
          >
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {index + 1}
            </span>
            <span className="text-sm leading-6 text-foreground">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        {GIT_PUSH_SIMULATOR_ACTIONS.map((action) => (
          <Button
            key={action.id}
            type="button"
            size="sm"
            variant={action.variant}
            disabled={actionState[action.id].disabled}
            onClick={() => {
              void actionState[action.id].onClick();
            }}
          >
            {action.label}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        <StageColumn
          title="Working Directory"
          subtitle={`${workingFiles.length} pending file${workingFiles.length === 1 ? "" : "s"}`}
        >
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
                <p className="text-xs text-muted-foreground">
                  {FILE_TYPE_LABEL[file.changeType]}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              ไม่มีไฟล์ค้างใน Working Directory
            </p>
          )}
        </StageColumn>

        <StageColumn
          title="Staging Area"
          subtitle={`${stagedFiles.length} file${stagedFiles.length === 1 ? "" : "s"} ready to commit`}
        >
          {stagedFiles.length ? (
            stagedFiles.map((file) => (
              <div
                key={file.id}
                ref={(element) => {
                  stagedRefs.current[file.id] = element;
                }}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2"
              >
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {FILE_TYPE_LABEL[file.changeType]}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              ยังไม่มีไฟล์ใน Staging Area
            </p>
          )}
        </StageColumn>

        <StageColumn
          title="Repository"
          subtitle={`local main ${aheadCount > 0 ? `ahead by ${aheadCount}` : "is synced"}`}
        >
          <div
            ref={localRepoDropRef}
            className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-3 text-xs font-semibold tracking-wide text-primary"
          >
            Local Commit Target
          </div>

          {localHistory.map((entry) => (
            <CommitCard
              key={entry.id}
              entry={entry}
              onRef={(element) => {
                localCommitRefs.current[entry.id] = element;
              }}
            />
          ))}
        </StageColumn>

        <StageColumn
          title="Remote Repository"
          subtitle={aheadCount > 0 ? "origin/main รอรับ commit ใหม่" : "origin/main ตาม local แล้ว"}
        >
          <div
            ref={remoteRepoDropRef}
            className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-3 text-xs font-semibold tracking-wide text-foreground"
          >
            Remote Push Target
          </div>

          {remoteHistory.map((entry) => (
            <CommitCard
              key={entry.id}
              entry={entry}
              onRef={(element) => {
                remoteCommitRefs.current[entry.id] = element;
              }}
            />
          ))}
        </StageColumn>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section
          className="rounded-xl border border-border bg-muted/30 p-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Current Status
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">{lastCommand}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{simMessage}</p>

          <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Local main
              </span>
              <span className="text-sm font-semibold text-foreground">
                {aheadCount > 0
                  ? `ahead ${aheadCount} commit${aheadCount > 1 ? "s" : ""}`
                  : "up to date"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Next action
              </span>
              <span className="text-sm font-semibold text-foreground">
                {stagedFiles.length
                  ? "git commit"
                  : aheadCount > 0
                    ? "git push"
                    : workingFiles.length
                      ? "git add"
                      : "Reset Demo"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="overflow-x-auto rounded-lg border border-border bg-black p-3 font-mono text-xs md:text-sm">
            <p className={`leading-6 whitespace-pre ${TERMINAL_TONE_CLASS.label}`}>git status</p>
            {statusLines.map((line, index) => (
              <p
                key={`status-${index}-${line.text}`}
                className={`leading-6 whitespace-pre ${TERMINAL_TONE_CLASS[line.tone]}`}
              >
                {line.text || " "}
              </p>
            ))}

            <p className={`mt-2 leading-6 whitespace-pre ${TERMINAL_TONE_CLASS.label}`}>
              git log --oneline --decorate -n 5
            </p>
            {logLines.map((line, index) => (
              <p
                key={`log-${index}-${line.text}`}
                className={`leading-6 whitespace-pre ${TERMINAL_TONE_CLASS[line.tone]}`}
              >
                {line.text || " "}
              </p>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
