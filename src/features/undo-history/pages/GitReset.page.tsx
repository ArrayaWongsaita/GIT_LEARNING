import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  GIT_RESET_COMMAND_DOCS,
  GIT_RESET_GUARDRAILS,
  GIT_RESET_INITIAL_FILES,
  GIT_RESET_INITIAL_HISTORY,
  GIT_RESET_LAB_STEPS,
  type GitResetCommitEntry,
  type GitResetSimulatorFile,
} from "@/features/undo-history/constants/git-reset-content.constant";

type TerminalTone =
  | "label"
  | "branch"
  | "section-staged"
  | "section-working"
  | "section-untracked"
  | "hint"
  | "entry-staged"
  | "entry-working"
  | "entry-untracked"
  | "clean"
  | "log-head"
  | "log-base"
  | "warning"
  | "normal";

type TerminalLine = {
  text: string;
  tone: TerminalTone;
};

const TERMINAL_TONE_CLASS: Record<TerminalTone, string> = {
  label: "text-slate-400 uppercase tracking-wide",
  branch: "text-cyan-300",
  "section-staged": "text-emerald-300 font-semibold",
  "section-working": "text-amber-300 font-semibold",
  "section-untracked": "text-rose-300 font-semibold",
  hint: "text-slate-400",
  "entry-staged": "text-emerald-200",
  "entry-working": "text-amber-200",
  "entry-untracked": "text-rose-200",
  clean: "text-emerald-300",
  "log-head": "text-violet-300 font-semibold",
  "log-base": "text-slate-200",
  warning: "text-rose-300 font-semibold",
  normal: "text-slate-200",
};

const cloneInitialFiles = () => GIT_RESET_INITIAL_FILES.map((file) => ({ ...file }));

const cloneInitialHistory = () =>
  GIT_RESET_INITIAL_HISTORY.map((entry) => ({
    ...entry,
    files: [...entry.files],
  }));

const FILE_ID_BY_NAME = new Map(
  GIT_RESET_INITIAL_FILES.map((file) => [file.name, file.id]),
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

const renderGitStatusLines = (files: GitResetSimulatorFile[]): TerminalLine[] => {
  const staged = files.filter((file) => file.state === "staged");
  const working = files.filter((file) => file.state === "working");
  const workingModified = working.filter((file) => file.changeType === "modified");
  const workingNew = working.filter((file) => file.changeType === "new");

  const lines: TerminalLine[] = [
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
      const label = file.changeType === "new" ? "new file" : "modified";
      lines.push({
        text: `\t${label}:\t${file.name}`,
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

  if (!staged.length && !working.length) {
    lines.push({
      text: "nothing to commit, working tree clean",
      tone: "clean",
    });
  }

  return lines;
};

const renderGitLogLines = (history: GitResetCommitEntry[]): TerminalLine[] => {
  if (!history.length) {
    return [{ text: "no commits in history", tone: "warning" }];
  }

  return history.slice(0, 5).flatMap((entry, index) => {
    const pointer = index === 0 ? " (HEAD -> main)" : "";
    return [
      {
        text: `${entry.shortHash} ${entry.message}${pointer}`,
        tone: index === 0 ? "log-head" : "log-base",
      },
      {
        text: `  files: ${entry.files.join(", ")} · ${entry.createdAtLabel}`,
        tone: "hint",
      },
    ];
  });
};

export default function GitResetPage() {
  const [files, setFiles] = useState<GitResetSimulatorFile[]>(cloneInitialFiles);
  const [history, setHistory] = useState<GitResetCommitEntry[]>(cloneInitialHistory);
  const [lastCommand, setLastCommand] = useState<string>("ยังไม่ได้รันคำสั่ง");
  const [simMessage, setSimMessage] = useState<string>(
    "เลือกโหมด reset เพื่อดูความต่างของ staged, working และ clean",
  );
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});

  const filesRef = useRef<GitResetSimulatorFile[]>(cloneInitialFiles());
  const historyRef = useRef<GitResetCommitEntry[]>(cloneInitialHistory());
  const copyResetTimerRef = useRef<Record<string, number>>({});
  const commitRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stagingRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const workingRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hardDropRef = useRef<HTMLDivElement | null>(null);

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

  const animateCommitToTargetList = async (
    fromRect: DOMRect | undefined,
    fileName: string,
    toState: "staged" | "working",
    delay = 0,
  ) => {
    if (delay > 0) {
      await wait(delay);
    }

    if (!fromRect) {
      return true;
    }

    const fileId = FILE_ID_BY_NAME.get(fileName);
    if (!fileId) {
      return false;
    }

    const targetRegistry = toState === "staged" ? stagingRefs.current : workingRefs.current;
    const targetElement = targetRegistry[fileId];
    if (!targetElement) {
      return false;
    }

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
        scale: [0.95, 1.02, 1],
        opacity: [0.45, 1],
        duration: 320,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
      targetElement.style.opacity = previousOpacity;
    }

    return true;
  };

  const animateCommitToDiscard = async (sourceElement: HTMLDivElement | null) => {
    const targetElement = hardDropRef.current;
    if (!sourceElement || !targetElement) {
      return false;
    }

    const fromRect = sourceElement.getBoundingClientRect();
    const toRect = targetElement.getBoundingClientRect();
    const targetX =
      toRect.left + toRect.width / 2 - fromRect.left - fromRect.width / 2;
    const targetY =
      toRect.top + toRect.height / 2 - fromRect.top - fromRect.height / 2;
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
        scale: [1, 0.9, 0.75],
        opacity: [1, 0.4, 0],
        duration: 340,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
    }

    return true;
  };

  const withCommitReset = async (
    command: string,
    nextState: "staged" | "working" | "clean",
  ) => {
    setLastCommand(command);
    const latestCommit = historyRef.current[0];

    if (!latestCommit || !latestCommit.isUserCommit) {
      setSimMessage("ไม่มี commit ล่าสุดให้ย้อน");
      return;
    }

    const sourceElement = commitRefs.current[latestCommit.id];
    const fromRect = sourceElement?.getBoundingClientRect();

    setHistory((prev) => prev.slice(1));
    setFiles((prev) =>
      prev.map((file) =>
        latestCommit.files.includes(file.name)
          ? {
              ...file,
              state: nextState,
            }
          : file,
      ),
    );

    if (nextState === "clean") {
      await animateCommitToDiscard(sourceElement);
      setSimMessage("ย้อน commit และล้าง staged/working changes แล้ว");
      return;
    }

    await waitNextPaint();
    await Promise.all(
      latestCommit.files.map((fileName, index) =>
        animateCommitToTargetList(fromRect, fileName, nextState, index * 80),
      ),
    );

    if (nextState === "staged") {
      setSimMessage("ย้อน commit แล้ว ไฟล์กลับมา staged");
      return;
    }

    setSimMessage("ย้อน commit แล้ว ไฟล์กลับมา working (unstaged)");
  };

  const onResetSoft = async () => {
    await withCommitReset("git reset --soft HEAD~1", "staged");
  };

  const onResetMixed = async () => {
    await withCommitReset("git reset --mixed HEAD~1", "working");
  };

  const onResetHard = async () => {
    await withCommitReset("git reset --hard HEAD~1", "clean");
  };

  const onResetDemo = () => {
    setLastCommand("Reset Demo");
    setFiles(cloneInitialFiles());
    setHistory(cloneInitialHistory());
    setSimMessage("รีเซ็ตสถานะจำลองเรียบร้อย พร้อมเริ่มใหม่");
  };

  const stagedFiles = useMemo(
    () => files.filter((file) => file.state === "staged"),
    [files],
  );
  const workingFiles = useMemo(
    () => files.filter((file) => file.state === "working"),
    [files],
  );
  const statusLines = useMemo(() => renderGitStatusLines(files), [files]);
  const logLines = useMemo(() => renderGitLogLines(history), [history]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <SetupGuideHeader
        badge="Undo & History"
        title="git reset: ย้อน commit อย่างเข้าใจผลกระทบ (soft/mixed/hard)"
        description="git reset ทั้ง 3 โหมดให้ผลต่างกันชัดเจน: --soft เก็บ staged, --mixed กลับไป working, และ --hard ล้าง staged/working ควรเช็ก history และ status ทุกครั้งก่อนรัน"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่ง reset หลักที่ใช้จริง พร้อมคำสั่งตรวจสอบผลก่อนและหลังการย้อน commit
        </p>

        <div className="mt-4 space-y-4">
          {GIT_RESET_COMMAND_DOCS.map((doc) => {
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

        <article className="mt-5 rounded-xl border border-rose-300/35 bg-rose-500/10 p-4">
          <h3 className="text-base font-bold text-foreground">
            Guardrails ก่อนใช้ git reset --hard
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            ทำตาม checklist นี้ก่อนทุกครั้งเพื่อลดความเสี่ยงทิ้งงานผิดไฟล์
          </p>

          <div className="mt-3 space-y-3">
            {GIT_RESET_GUARDRAILS.map((item) => {
              const commandKey = `guardrail-${item.id}`;
              const status = copyStatusByCommand[commandKey];
              const guardrailCommand = item.command;

              return (
                <div key={item.id} className="rounded-lg border border-border/60 bg-background/80 p-3">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  {guardrailCommand ? (
                    <div className="mt-2">
                      <CommandBlock
                        command={guardrailCommand}
                        status={status}
                        onCopy={() =>
                          handleCopyCommand(commandKey, guardrailCommand)
                        }
                      />
                    </div>
                  ) : null}
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Interactive Reset Simulator</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ลอง reset แต่ละโหมดเพื่อดูว่า commit ล่าสุดหายไปอย่างไร และไฟล์กลับไปอยู่ที่ไหน
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => void onResetSoft()}>
            git reset --soft HEAD~1
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => void onResetMixed()}>
            git reset --mixed HEAD~1
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => void onResetHard()}>
            git reset --hard HEAD~1
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onResetDemo}>
            Reset Demo
          </Button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1.25fr]">
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
                    className="rounded-lg border border-amber-300/35 bg-amber-500/10 px-3 py-2"
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
                      stagingRefs.current[file.id] = element;
                    }}
                    className="rounded-lg border border-emerald-300/35 bg-emerald-500/10 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.changeType}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                  ไม่มีไฟล์ใน Staging Area
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Repository (Commit History)</h3>

            <div
              ref={hardDropRef}
              className="mt-3 rounded-lg border border-rose-400/35 bg-rose-500/10 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300"
            >
              Hard Reset Discard Zone
            </div>

            <div className="mt-3 space-y-2">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  ref={(element) => {
                    commitRefs.current[entry.id] = element;
                  }}
                  className={`rounded-lg border px-3 py-3 ${
                    index === 0
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
                </div>
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
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทำตามขั้นตอนบนเครื่องจริงเพื่อเห็นผลต่างของ --soft, --mixed และ --hard แบบครบวงจร
        </p>

        <ol className="mt-4 space-y-3">
          {GIT_RESET_LAB_STEPS.map((step, index) => (
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
                        onCopy={() => handleCopyCommand(commandKey, commandItem.command)}
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
