import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  GIT_REFLOG_COMMAND_DOCS,
  GIT_REFLOG_INITIAL_COMMITS,
  GIT_REFLOG_INITIAL_ENTRIES,
  GIT_REFLOG_LAB_STEPS,
  type GitReflogCommitEntry,
  type GitReflogEntry,
} from "@/features/undo-history/constants/git-reflog-content.constant";

type ReflogMode = "full" | "limit-5";

type TerminalTone =
  | "selector"
  | "hash"
  | "action"
  | "meta"
  | "head"
  | "warning"
  | "normal"
  | "label";

type TerminalLine = {
  text: string;
  tone: TerminalTone;
};

const TERMINAL_TONE_CLASS: Record<TerminalTone, string> = {
  selector: "text-cyan-300 font-semibold",
  hash: "text-violet-300",
  action: "text-emerald-300",
  meta: "text-slate-400",
  head: "text-amber-300 font-semibold",
  warning: "text-rose-300",
  normal: "text-slate-200",
  label: "text-slate-400 uppercase tracking-wide",
};

const RECOVERY_HASH = "c92af38";

const cloneInitialEntries = () =>
  GIT_REFLOG_INITIAL_ENTRIES.map((entry) => ({ ...entry }));

const cloneInitialCommits = () =>
  GIT_REFLOG_INITIAL_COMMITS.map((commit) => ({ ...commit, files: [...commit.files] }));

const renderReflogLines = (
  mode: ReflogMode,
  entries: GitReflogEntry[],
): TerminalLine[] => {
  const selectedEntries = mode === "limit-5" ? entries.slice(0, 5) : entries;

  return selectedEntries.flatMap((entry) => [
    {
      text: `${entry.selector}: ${entry.shortHash} ${entry.actionLabel}: ${entry.message}`,
      tone: entry.selector === "HEAD@{1}" ? "head" : "normal",
    },
    {
      text: `  ${entry.timeLabel}`,
      tone: "meta",
    },
  ]);
};

const renderGitLogLines = (
  commits: GitReflogCommitEntry[],
  currentHeadId: string,
): TerminalLine[] => {
  return commits.map((commit) => {
    const isCurrentHead = commit.id === currentHeadId;
    const pointer = isCurrentHead ? " (HEAD -> main)" : "";
    return {
      text: `${commit.shortHash} ${commit.message}${pointer}`,
      tone: isCurrentHead ? "head" : "normal",
    };
  });
};

const waitNextPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });

export default function GitReflogPage() {
  const [entries, setEntries] = useState<GitReflogEntry[]>(cloneInitialEntries);
  const [commits, setCommits] = useState<GitReflogCommitEntry[]>(cloneInitialCommits);
  const [currentHeadId, setCurrentHeadId] = useState<string>(
    cloneInitialCommits().find((item) => item.isCurrentHead)?.id ?? "",
  );
  const [reflogMode, setReflogMode] = useState<ReflogMode>("full");
  const [lastCommand, setLastCommand] = useState<string>("git reflog");
  const [simMessage, setSimMessage] = useState<string>(
    "เริ่มด้วยการดู reflog เพื่อหา HEAD ที่หายไป แล้วค่อยกู้ด้วย HEAD@{n} หรือ hash",
  );
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const [highlightedEntryIds, setHighlightedEntryIds] = useState<string[]>([]);

  const copyResetTimerRef = useRef<Record<string, number>>({});
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const entryRefs = useRef<Record<string, HTMLElement | null>>({});
  const commitRefs = useRef<Record<string, HTMLElement | null>>({});

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

  const animateTerminal = async () => {
    const terminalElement = terminalRef.current;
    if (!terminalElement) return;
    await animate(terminalElement, {
      opacity: [0.4, 1],
      translateY: [8, 0],
      duration: 260,
      ease: "outQuad",
    });
  };

  const animateEntryToCommit = async (entryId: string, targetCommitId: string) => {
    const sourceElement = entryRefs.current[entryId];
    const targetElement = commitRefs.current[targetCommitId];
    if (!sourceElement || !targetElement) {
      return false;
    }

    const fromRect = sourceElement.getBoundingClientRect();
    const toRect = targetElement.getBoundingClientRect();
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

    const previousOpacity = targetElement.style.opacity;
    targetElement.style.opacity = "0";

    try {
      await animate(cloneElement, {
        translateX: [0, toRect.left - fromRect.left],
        translateY: [0, toRect.top - fromRect.top],
        scale: [1, 0.96, 1],
        opacity: [1, 0.75, 1],
        duration: 340,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
      targetElement.style.opacity = previousOpacity;
    }

    return true;
  };

  const applyRecoveryToHash = async (
    command: string,
    hash: string,
    highlightEntryId: string,
  ) => {
    setLastCommand(command);
    setHighlightedEntryIds([highlightEntryId]);

    const targetCommit = commits.find((item) => item.shortHash === hash);
    if (!targetCommit) {
      setSimMessage("ไม่พบ hash ในประวัติจำลอง");
      await animateTerminal();
      return;
    }

    setCurrentHeadId(targetCommit.id);
    await waitNextPaint();
    await animateEntryToCommit(highlightEntryId, targetCommit.id);
    await animateTerminal();
    setSimMessage(`กู้ HEAD กลับไปที่ ${targetCommit.shortHash} สำเร็จ`);
  };

  const onShowReflog = async () => {
    setLastCommand("git reflog");
    setReflogMode("full");
    setHighlightedEntryIds([]);
    setSimMessage("แสดง reflog แบบเต็ม");
    await animateTerminal();
  };

  const onShowReflogLimit = async () => {
    setLastCommand("git reflog -n 5");
    setReflogMode("limit-5");
    setHighlightedEntryIds(entries.slice(0, 5).map((item) => item.id));
    setSimMessage("แสดง reflog เฉพาะ 5 รายการล่าสุด");
    await animateTerminal();
  };

  const onRecoverWithHeadAt1 = async () => {
    const selectorEntry = entries.find((item) => item.selector === "HEAD@{1}");
    if (!selectorEntry) {
      setLastCommand("git reset --hard HEAD@{1}");
      setHighlightedEntryIds([]);
      setSimMessage("ไม่พบ entry สำหรับกู้คืนที่ HEAD@{1}");
      await animateTerminal();
      return;
    }

    await applyRecoveryToHash(
      "git reset --hard HEAD@{1}",
      selectorEntry.shortHash,
      selectorEntry.id,
    );
  };

  const onRecoverWithHash = async () => {
    await applyRecoveryToHash(
      `git reset --hard ${RECOVERY_HASH}`,
      RECOVERY_HASH,
      entries[1]?.id ?? "",
    );
  };

  const onResetDemo = async () => {
    setEntries(cloneInitialEntries());
    setCommits(cloneInitialCommits());
    setCurrentHeadId(cloneInitialCommits().find((item) => item.isCurrentHead)?.id ?? "");
    setReflogMode("full");
    setLastCommand("Reset Demo");
    setHighlightedEntryIds([]);
    setSimMessage("รีเซ็ตสถานะจำลองของ reflog เรียบร้อย");
    await animateTerminal();
  };

  const reflogLines = useMemo(
    () => renderReflogLines(reflogMode, entries),
    [entries, reflogMode],
  );
  const gitLogLines = useMemo(
    () => renderGitLogLines(commits, currentHeadId),
    [commits, currentHeadId],
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <SetupGuideHeader
        badge="Undo & History"
        title="git reflog: ย้อนหา HEAD ที่หายไปและกู้กลับมา"
        description="git reflog คือประวัติการขยับ HEAD/local refs ในเครื่อง ใช้เป็น safety net เวลาทำ reset ผิดและต้องกู้สถานะกลับ"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่งพื้นฐานที่ใช้ดู reflog และกู้ HEAD กลับจากสถานะที่เผลอทำหาย
        </p>

        <div className="mt-4 space-y-4">
          {GIT_REFLOG_COMMAND_DOCS.map((doc) => {
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
        <h2 className="text-xl font-black tracking-tight text-foreground">Interactive Reflog Simulator</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทดลองดู reflog และกู้ HEAD ด้วย selector/hash เพื่อเข้าใจ flow การ recovery
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => void onShowReflog()}>
            git reflog
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => void onShowReflogLimit()}>
            git reflog -n 5
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => void onRecoverWithHeadAt1()}>
            git reset --hard HEAD@{"{1}"}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => void onRecoverWithHash()}>
            git reset --hard c92af38
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => void onResetDemo()}>
            Reset Demo
          </Button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1.2fr_1fr]">
          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Repository (Current Commit Timeline)</h3>
            <div className="mt-3 space-y-2">
              {commits.map((commit) => {
                const isHead = commit.id === currentHeadId;

                return (
                  <article
                    key={commit.id}
                    ref={(element) => {
                      commitRefs.current[commit.id] = element;
                    }}
                    className={`rounded-lg border px-3 py-3 ${
                      isHead ? "border-primary/45 bg-primary/10" : "border-border bg-background"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {commit.shortHash} {commit.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      files: {commit.files.join(", ")} · {commit.createdAtLabel}
                    </p>
                    {isHead ? (
                      <p className="mt-1 text-xs font-semibold text-primary">HEAD -&gt; main</p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Reflog Entries (HEAD movements)</h3>
            <div className="mt-3 space-y-2">
              {entries.map((entry) => {
                const isHighlighted = highlightedEntryIds.includes(entry.id);
                return (
                  <article
                    key={entry.id}
                    ref={(element) => {
                      entryRefs.current[entry.id] = element;
                    }}
                    className={`rounded-lg border px-3 py-3 ${
                      isHighlighted
                        ? "border-emerald-300/45 bg-emerald-500/10"
                        : "border-border bg-background"
                    }`}
                  >
                    <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-300">
                      {entry.selector}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {entry.shortHash} {entry.actionLabel}: {entry.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{entry.timeLabel}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Recovery Panel</h3>
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Target Selector
                </p>
                <p className="mt-1 font-mono text-sm text-foreground">HEAD@{"{1}"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ใช้เมื่ออยากกู้กลับไปสถานะก่อน reset ล่าสุด
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Target Hash
                </p>
                <p className="mt-1 font-mono text-sm text-foreground">{RECOVERY_HASH}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ใช้กู้แบบระบุ commit ชัดเจน
                </p>
              </div>
              <div className="rounded-lg border border-rose-300/35 bg-rose-500/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                  Warning
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground">
                  reset --hard มีผลทิ้งงาน staged/working ที่ยังไม่ commit ใช้กับ repo ทดลองก่อน
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Last command
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{lastCommand}</p>
          <p className="mt-1 text-sm text-muted-foreground">{simMessage}</p>

          <div
            ref={terminalRef}
            className="mt-3 overflow-x-auto rounded-lg border border-border bg-black p-3 font-mono text-xs md:text-sm"
          >
            <p className={`leading-6 whitespace-pre ${TERMINAL_TONE_CLASS.label}`}>git reflog</p>
            {reflogLines.map((line, index) => (
              <p
                key={`reflog-${index}-${line.text}`}
                className={`leading-6 whitespace-pre ${TERMINAL_TONE_CLASS[line.tone]}`}
              >
                {line.text || " "}
              </p>
            ))}
            <p className={`mt-2 leading-6 whitespace-pre ${TERMINAL_TONE_CLASS.label}`}>
              git log --oneline --decorate -n 5
            </p>
            {gitLogLines.map((line, index) => (
              <p
                key={`log-${index}-${line.text}`}
                className={`leading-6 whitespace-pre ${TERMINAL_TONE_CLASS[line.tone]}`}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทำตามลำดับนี้เพื่อฝึกสถานการณ์ทำ commit หาย แล้วใช้ reflog กู้กลับมาอย่างปลอดภัย
        </p>

        <ol className="mt-4 space-y-3">
          {GIT_REFLOG_LAB_STEPS.map((step, index) => (
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
