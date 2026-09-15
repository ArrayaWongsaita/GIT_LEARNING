import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  GIT_COMMIT_COMMAND_DOCS,
  GIT_COMMIT_INITIAL_HISTORY,
  GIT_COMMIT_INITIAL_STAGED_FILES,
  GIT_COMMIT_LAB_STEPS,
  type GitCommitEntry,
  type GitCommitSimulatorFile,
} from "@/features/basic-git-command/constants/git-commit-content.constant";

const DEFAULT_COMMIT_MESSAGE = "feat: update files";
const COMMIT_MESSAGE_MAX_HEADER_LENGTH = 72;
const COMMIT_MESSAGE_PATTERN =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9./_-]+\))?(!)?: .+/;

type MessageValidationStatus = "valid" | "warning";

type MessageValidation = {
  status: MessageValidationStatus;
  hints: string[];
};

const cloneInitialStagedFiles = () =>
  GIT_COMMIT_INITIAL_STAGED_FILES.map((file) => ({ ...file }));

const cloneInitialHistory = () =>
  GIT_COMMIT_INITIAL_HISTORY.map((entry) => ({
    ...entry,
    files: [...entry.files],
  }));

const STAGED_FILE_TEMPLATE = new Map(
  GIT_COMMIT_INITIAL_STAGED_FILES.map((file) => [file.name, file]),
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

const restoreFilesByNames = (names: string[]): GitCommitSimulatorFile[] =>
  names.map((name) => {
    const template = STAGED_FILE_TEMPLATE.get(name);
    if (template) {
      return { ...template };
    }
    return {
      id: createFileIdFromName(name),
      name,
      changeType: "modified",
    };
  });

type TerminalTone =
  | "label"
  | "branch"
  | "section"
  | "hint"
  | "entry-modified"
  | "entry-new"
  | "clean"
  | "log-head"
  | "log-user"
  | "log-base"
  | "log-meta"
  | "error"
  | "normal";

type TerminalLine = {
  text: string;
  tone: TerminalTone;
};

const TERMINAL_TONE_CLASS: Record<TerminalTone, string> = {
  label: "text-slate-400 uppercase tracking-wide",
  branch: "text-cyan-300",
  section: "text-emerald-300 font-semibold",
  hint: "text-slate-400",
  "entry-modified": "text-amber-200",
  "entry-new": "text-rose-200",
  clean: "text-emerald-300",
  "log-head": "text-violet-300 font-semibold",
  "log-user": "text-blue-300",
  "log-base": "text-slate-300",
  "log-meta": "text-slate-400",
  error: "text-rose-300",
  normal: "text-slate-200",
};

const renderGitStatusLines = (stagedFiles: GitCommitSimulatorFile[]) => {
  const lines: TerminalLine[] = [
    { text: "On branch main", tone: "branch" },
    { text: "", tone: "normal" },
  ];

  if (!stagedFiles.length) {
    lines.push({ text: "nothing to commit, working tree clean", tone: "clean" });
    return lines;
  }

  lines.push(
    { text: "Changes to be committed:", tone: "section" },
    { text: '  (use "git restore --staged <file>..." to unstage)', tone: "hint" },
    { text: "", tone: "normal" },
  );

  stagedFiles.forEach((file) => {
    const label = file.changeType === "new" ? "new file" : "modified";
    lines.push({
      text: `\t${label}:\t${file.name}`,
      tone: file.changeType === "new" ? "entry-new" : "entry-modified",
    });
  });

  return lines;
};

const renderGitLogLines = (history: GitCommitEntry[]): TerminalLine[] => {
  if (!history.length) {
    return [
      {
        text: "fatal: your current branch 'main' does not have any commits yet",
        tone: "error",
      },
    ];
  }

  return history.slice(0, 5).flatMap((entry, index) => {
    const pointer = index === 0 ? " (HEAD -> main)" : "";
    const tone: TerminalTone =
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
        tone: "log-meta",
      },
    ];
  });
};

export default function GitCommitPage() {
  const [stagedFiles, setStagedFiles] =
    useState<GitCommitSimulatorFile[]>(cloneInitialStagedFiles);
  const [history, setHistory] = useState<GitCommitEntry[]>(cloneInitialHistory);
  const [commitMessage, setCommitMessage] = useState<string>(DEFAULT_COMMIT_MESSAGE);
  const [lastCommand, setLastCommand] = useState<string>("ยังไม่ได้รันคำสั่ง");
  const [simMessage, setSimMessage] = useState<string>(
    "เริ่มจากพิมพ์ข้อความ commit แล้วกดปุ่ม git commit -m เพื่อดูไฟล์ย้ายจาก Staging Area ไป Repository",
  );
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});

  const stagedFilesRef = useRef<GitCommitSimulatorFile[]>(cloneInitialStagedFiles());
  const historyRef = useRef<GitCommitEntry[]>(cloneInitialHistory());
  const copyResetTimerRef = useRef<Record<string, number>>({});
  const stagingRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const repoDropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    stagedFilesRef.current = stagedFiles;
  }, [stagedFiles]);

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

  const animateStagingToRepo = async (
    fileId: string,
    delay = 0,
    spreadX = 0,
  ) => {
    if (delay > 0) {
      await wait(delay);
    }

    const sourceElement = stagingRefs.current[fileId];
    const targetElement = repoDropRef.current;

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
        duration: 320,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
    }

    return true;
  };

  const animateRepoToStaging = async (fileId: string, delay = 0) => {
    if (delay > 0) {
      await wait(delay);
    }

    const sourceElement = repoDropRef.current;
    const targetElement = stagingRefs.current[fileId];

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

  const onCommit = async () => {
    const normalizedMessage = commitMessage.trim();
    setLastCommand(
      normalizedMessage ? `git commit -m "${normalizedMessage}"` : 'git commit -m ""',
    );

    if (!normalizedMessage) {
      setSimMessage("กรอก commit message ก่อนสร้าง commit");
      return;
    }

    const currentStaged = stagedFilesRef.current;
    if (!currentStaged.length) {
      setSimMessage("nothing to commit (staging area ว่าง)");
      return;
    }

    const filesToCommit = currentStaged.map((file) => ({ ...file }));

    await Promise.all(
      filesToCommit.map((file, index) =>
        animateStagingToRepo(file.id, index * 80, (index % 2 === 0 ? -1 : 1) * 10),
      ),
    );

    const newCommit: GitCommitEntry = {
      id: `user-${Date.now()}`,
      message: normalizedMessage,
      shortHash: createShortHash(),
      files: filesToCommit.map((file) => file.name),
      createdAtLabel: "just now",
      isUserCommit: true,
    };

    setHistory((prev) => [newCommit, ...prev]);
    setStagedFiles([]);
    setSimMessage(
      `commit สำเร็จ: ${newCommit.shortHash} พร้อมไฟล์ ${filesToCommit.length} รายการ`,
    );
  };

  const onResetSoft = async () => {
    setLastCommand("git reset --soft HEAD~1");

    const latestCommit = historyRef.current[0];
    if (!latestCommit || !latestCommit.isUserCommit) {
      setSimMessage("ไม่มี commit ล่าสุดจากการจำลองให้ย้อนด้วย soft reset");
      return;
    }

    const restoredFiles = restoreFilesByNames(latestCommit.files);

    setHistory((prev) => prev.slice(1));
    setStagedFiles(restoredFiles);

    await waitNextPaint();

    await Promise.all(
      restoredFiles.map((file, index) => animateRepoToStaging(file.id, index * 80)),
    );

    setSimMessage(
      `undo สำเร็จ: นำไฟล์ ${restoredFiles.length} รายการกลับเข้า Staging Area แล้ว`,
    );
  };

  const onResetDemo = () => {
    setLastCommand("Reset Demo");
    setCommitMessage(DEFAULT_COMMIT_MESSAGE);
    setStagedFiles(cloneInitialStagedFiles());
    setHistory(cloneInitialHistory());
    setSimMessage("รีเซ็ตสถานะจำลองเรียบร้อย พร้อมเริ่มใหม่");
  };

  const statusLines = useMemo(() => renderGitStatusLines(stagedFiles), [stagedFiles]);
  const logLines = useMemo(() => renderGitLogLines(history), [history]);
  const commitMessageValidation = useMemo<MessageValidation>(() => {
    const header = commitMessage.split("\n")[0]?.trim() ?? "";
    const hints: string[] = [];

    if (!header) {
      hints.push("ควรใส่ commit header เช่น feat(auth): add social login");
      return { status: "warning", hints };
    }

    if (!COMMIT_MESSAGE_PATTERN.test(header)) {
      hints.push(
        "รูปแบบแนะนำ: <type>(scope)!: subject เช่น fix(api): handle null profile",
      );
    }

    if (header.length > COMMIT_MESSAGE_MAX_HEADER_LENGTH) {
      hints.push(
        `header ยาวเกินแนะนำ (${header.length}/${COMMIT_MESSAGE_MAX_HEADER_LENGTH}) ควรสั้นลง`,
      );
    }

    if (header.endsWith(".")) {
      hints.push("ไม่ควรใส่จุดท้าย subject เพื่อให้ summary กระชับ");
    }

    return hints.length
      ? { status: "warning", hints }
      : {
          status: "valid",
          hints: ["รูปแบบ commit message ดีแล้ว ใช้เป็นมาตรฐานทีมได้"],
        };
  }, [commitMessage]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SetupGuideHeader
        badge="Commit Workflow"
        title="git commit: บันทึกจาก Staging Area เข้า Repository"
        description="ฝึก flow ของ git commit แบบเห็นภาพเคลื่อนไหวจริง: ไฟล์จะย้ายจาก Staging Area เข้า Repository เป็น snapshot ใหม่ และสามารถย้อน commit ล่าสุดด้วย git reset --soft HEAD~1"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่งหลักของการ commit และ undo ที่ใช้จริงใน workflow ประจำวัน
        </p>

        <div className="mt-4 space-y-4">
          {GIT_COMMIT_COMMAND_DOCS.map((doc) => {
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
        <h2 className="text-xl font-black tracking-tight text-foreground">Interactive Simulator</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ป้อน commit message แล้วกดคำสั่งเพื่อดูไฟล์ move จาก Staging Area ไป Repository
          และลอง undo commit ล่าสุดเพื่อดูการย้อนกลับ
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
          <Input
            value={commitMessage}
            onChange={(event) => setCommitMessage(event.target.value)}
            placeholder="feat: describe your change"
            aria-label="Commit message"
          />
          <Button type="button" size="sm" onClick={onCommit}>
            git commit -m
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onResetSoft}>
            git reset --soft HEAD~1
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onResetDemo}>
            Reset Demo
          </Button>
        </div>

        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            commitMessageValidation.status === "valid"
              ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
              : "border-amber-500/40 bg-amber-500/10 text-foreground"
          }`}
        >
          <p
            className={`font-semibold ${
              commitMessageValidation.status === "valid"
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-amber-700 dark:text-amber-300"
            }`}
          >
            {commitMessageValidation.status === "valid"
              ? "Validator: รูปแบบดี"
              : "Validator: คำแนะนำ"}
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {commitMessageValidation.hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                    className="rounded-lg border border-border bg-background px-3 py-2"
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
          ทำตามลำดับบนเครื่องของตัวเองเพื่อเห็น flow จริง: stage -&gt; commit -&gt;
          reset --soft -&gt; staged อีกครั้ง
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          แนะนำให้ตั้งชื่อ commit ตาม Conventional Commits เช่น <code>feat(scope): ...</code> หรือ{" "}
          <code>docs(scope): ...</code>
        </p>

        <ol className="mt-4 space-y-3">
          {GIT_COMMIT_LAB_STEPS.map((step, index) => (
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

              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Expected:</span> {step.expected}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
