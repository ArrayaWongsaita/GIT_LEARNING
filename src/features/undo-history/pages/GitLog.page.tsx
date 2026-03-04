import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  GIT_LOG_COMMAND_DOCS,
  GIT_LOG_LAB_STEPS,
  GIT_LOG_SIMULATOR_COMMITS,
  type GitLogCommitEntry,
} from "@/features/undo-history/constants/git-log-content.constant";

type GitLogMode = "default" | "oneline" | "graph" | "limit-3" | "grep-fix";

type GitLogTerminalTone =
  | "hash"
  | "message"
  | "meta"
  | "branch"
  | "tag"
  | "match"
  | "hint"
  | "normal";

type GitLogTerminalLine = {
  text: string;
  tone: GitLogTerminalTone;
};

type GitLogView = {
  lines: GitLogTerminalLine[];
  highlightedIds: string[];
};

const TERMINAL_TONE_CLASS: Record<GitLogTerminalTone, string> = {
  hash: "text-cyan-300",
  message: "text-slate-100",
  meta: "text-slate-400",
  branch: "text-violet-300",
  tag: "text-amber-300",
  match: "text-emerald-300 font-semibold",
  hint: "text-slate-500",
  normal: "text-slate-200",
};

const waitNextPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });

const cloneSimulatorCommits = () =>
  GIT_LOG_SIMULATOR_COMMITS.map((entry) => ({
    ...entry,
    tags: entry.tags ? [...entry.tags] : undefined,
  }));

const isFixCommit = (entry: GitLogCommitEntry) =>
  entry.message.toLowerCase().includes("fix");

const getDecorateSuffix = (entry: GitLogCommitEntry) => {
  const segments: string[] = [];
  if (entry.branchLabel) {
    segments.push(`HEAD -> ${entry.branchLabel}`);
  }
  if (entry.tags?.length) {
    segments.push(...entry.tags.map((tag) => `tag: ${tag}`));
  }
  return segments.length ? ` (${segments.join(", ")})` : "";
};

const buildGitLogView = (
  mode: GitLogMode,
  commits: GitLogCommitEntry[],
): GitLogView => {
  const lines: GitLogTerminalLine[] = [];

  const renderOneline = (entries: GitLogCommitEntry[]) => {
    entries.forEach((entry) => {
      lines.push({
        text: `${entry.shortHash} ${entry.message}${getDecorateSuffix(entry)}`,
        tone: isFixCommit(entry) ? "match" : "message",
      });
    });
  };

  if (mode === "default") {
    commits.forEach((entry, index) => {
      lines.push({
        text: `commit ${entry.shortHash}`,
        tone: "hash",
      });

      const decorate = getDecorateSuffix(entry);
      if (decorate) {
        lines.push({
          text: `  ${decorate.trim()}`,
          tone: "branch",
        });
      }

      lines.push({
        text: `Author: ${entry.author}`,
        tone: "meta",
      });
      lines.push({
        text: `Date:   ${entry.dateLabel}`,
        tone: "meta",
      });
      lines.push({
        text: "",
        tone: "normal",
      });
      lines.push({
        text: `    ${entry.message}`,
        tone: isFixCommit(entry) ? "match" : "message",
      });

      if (index < commits.length - 1) {
        lines.push({
          text: "",
          tone: "normal",
        });
      }
    });

    return {
      lines,
      highlightedIds: commits.map((entry) => entry.id),
    };
  }

  if (mode === "graph") {
    commits.forEach((entry, index) => {
      const decorate = getDecorateSuffix(entry);
      lines.push({
        text: `* ${entry.shortHash}${decorate ? decorate : ""}`,
        tone: "hash",
      });
      lines.push({
        text: `| ${entry.message}`,
        tone: isFixCommit(entry) ? "match" : "message",
      });
      if (entry.tags?.length) {
        lines.push({
          text: `| tags: ${entry.tags.join(", ")}`,
          tone: "tag",
        });
      }
      if (index < commits.length - 1) {
        lines.push({
          text: "|",
          tone: "hint",
        });
      }
    });

    return {
      lines,
      highlightedIds: commits.map((entry) => entry.id),
    };
  }

  if (mode === "limit-3") {
    const entries = commits.slice(0, 3);
    renderOneline(entries);
    return {
      lines,
      highlightedIds: entries.map((entry) => entry.id),
    };
  }

  if (mode === "grep-fix") {
    const entries = commits.filter(isFixCommit);
    if (!entries.length) {
      lines.push({
        text: "no commits found by --grep \"fix\"",
        tone: "hint",
      });
      return { lines, highlightedIds: [] };
    }
    renderOneline(entries);
    return {
      lines,
      highlightedIds: entries.map((entry) => entry.id),
    };
  }

  renderOneline(commits);
  return {
    lines,
    highlightedIds: commits.map((entry) => entry.id),
  };
};

const INITIAL_LOG_VIEW = buildGitLogView("default", GIT_LOG_SIMULATOR_COMMITS);

export default function GitLogPage() {
  const [commits] = useState<GitLogCommitEntry[]>(cloneSimulatorCommits);
  const [lastCommand, setLastCommand] = useState<string>("git log");
  const [simMessage, setSimMessage] = useState<string>(
    "เริ่มจากดู history แบบเต็มก่อน แล้วค่อยสลับมุมมองด้วยคำสั่งแต่ละแบบ",
  );
  const [terminalLines, setTerminalLines] = useState<GitLogTerminalLine[]>(
    INITIAL_LOG_VIEW.lines,
  );
  const [highlightedCommitIds, setHighlightedCommitIds] = useState<string[]>(
    INITIAL_LOG_VIEW.highlightedIds,
  );
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});

  const commitsRef = useRef<GitLogCommitEntry[]>(cloneSimulatorCommits());
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const commitRefs = useRef<Record<string, HTMLElement | null>>({});
  const copyResetTimerRef = useRef<Record<string, number>>({});

  useEffect(() => {
    commitsRef.current = commits;
  }, [commits]);

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

  const runSimulatorMode = async (
    mode: GitLogMode,
    command: string,
    message: string,
  ) => {
    setLastCommand(command);
    setSimMessage(message);

    const nextView = buildGitLogView(mode, commitsRef.current);
    setTerminalLines(nextView.lines);
    setHighlightedCommitIds(nextView.highlightedIds);

    await waitNextPaint();

    const terminalElement = terminalRef.current;
    if (terminalElement) {
      void animate(terminalElement, {
        opacity: [0.35, 1],
        translateY: [8, 0],
        duration: 260,
        ease: "outQuad",
      });
    }

    nextView.highlightedIds.forEach((commitId, index) => {
      const cardElement = commitRefs.current[commitId];
      if (!cardElement) return;
      void animate(cardElement, {
        scale: [1, 1.02, 1],
        duration: 360,
        delay: index * 50,
        ease: "outQuad",
      });
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <SetupGuideHeader
        badge="Undo & History"
        title="git log: อ่านประวัติ Commit ให้เป็น"
        description="git log คือจุดเริ่มสำคัญก่อนทำ undo/reset เพราะช่วยให้เห็นว่ามี commit อะไรเกิดขึ้นบ้างและควรย้อนตรงไหน"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่ง git log ที่ใช้บ่อยในการตรวจประวัติและค้น commit ที่ต้องการ
        </p>

        <div className="mt-4 space-y-4">
          {GIT_LOG_COMMAND_DOCS.map((doc) => {
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
        <h2 className="text-xl font-black tracking-tight text-foreground">Interactive Log Simulator</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          กดคำสั่งแต่ละแบบเพื่อดูว่า output ของ git log เปลี่ยนยังไง และ commit ไหนถูกเน้นเมื่อมีเงื่อนไขกรอง
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() =>
              void runSimulatorMode(
                "default",
                "git log",
                "แสดงประวัติแบบเต็มพร้อม author/date/message",
              )
            }
          >
            git log
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              void runSimulatorMode(
                "oneline",
                "git log --oneline",
                "สลับเป็นประวัติแบบย่อเพื่ออ่านภาพรวมเร็วขึ้น",
              )
            }
          >
            git log --oneline
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              void runSimulatorMode(
                "graph",
                "git log --oneline --graph --decorate",
                "แสดง graph และ pointer ของ branch/tag",
              )
            }
          >
            git log --oneline --graph --decorate
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              void runSimulatorMode(
                "limit-3",
                "git log -n 3",
                "แสดงเฉพาะ 3 commit ล่าสุด",
              )
            }
          >
            git log -n 3
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              void runSimulatorMode(
                "grep-fix",
                'git log --grep "fix" --oneline',
                "กรองเฉพาะ commit ที่มีคำว่า fix ใน message",
              )
            }
          >
            git log --grep "fix" --oneline
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              void runSimulatorMode(
                "default",
                "Reset View",
                "รีเซ็ตกลับมุมมองเริ่มต้นของ git log",
              )
            }
          >
            Reset View
          </Button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Commit Timeline</h3>
            <div className="mt-3 space-y-2">
              {commits.map((commit) => {
                const isHighlighted = highlightedCommitIds.includes(commit.id);

                return (
                  <article
                    key={commit.id}
                    ref={(element) => {
                      commitRefs.current[commit.id] = element;
                    }}
                    className={`rounded-lg border px-3 py-3 transition-colors ${
                      isHighlighted
                        ? "border-primary/45 bg-primary/10"
                        : "border-border bg-background"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">{commit.dateLabel}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {commit.shortHash} {commit.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      author: {commit.author}
                    </p>
                    {commit.branchLabel || commit.tags?.length ? (
                      <p className="mt-1 text-xs text-primary">
                        {commit.branchLabel ? `branch: ${commit.branchLabel}` : ""}
                        {commit.tags?.length
                          ? ` ${commit.branchLabel ? "·" : ""} tags: ${commit.tags.join(", ")}`
                          : ""}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Last command
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{lastCommand}</p>
            <p className="mt-1 text-sm text-muted-foreground">{simMessage}</p>

            <div
              ref={terminalRef}
              className="mt-3 overflow-x-auto rounded-lg border border-border bg-black p-3 font-mono text-xs md:text-sm"
            >
              {terminalLines.map((line, index) => (
                <p
                  key={`${index}-${line.text}`}
                  className={`leading-6 whitespace-pre ${TERMINAL_TONE_CLASS[line.tone]}`}
                >
                  {line.text || " "}
                </p>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทำตามทีละขั้นเพื่อฝึกสร้าง history แล้วอ่านด้วย git log หลายรูปแบบบนเครื่องจริง
        </p>

        <ol className="mt-4 space-y-3">
          {GIT_LOG_LAB_STEPS.map((step, index) => (
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
