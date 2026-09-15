import { type ReactNode, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  GIT_PULL_FLOW_STEPS,
  GIT_PULL_SIMULATOR_MODE_OPTIONS,
  GIT_PULL_SIMULATOR_SCENARIOS,
  type GitPullScenarioName,
  type GitPullSimulatorCommit,
  type GitPullWorkingTreeSnapshot,
} from "@/features/remote-collaboration/constants/git-pull-content.constant";

type TerminalTone =
  | "label"
  | "branch"
  | "hint"
  | "remote"
  | "clean"
  | "log-head"
  | "log-remote"
  | "log-local"
  | "log-merge"
  | "log-base"
  | "log-meta";

type TerminalLine = {
  text: string;
  tone: TerminalTone;
};

type HistoryComparison = {
  status: "up-to-date" | "ahead" | "behind" | "diverged";
  ahead: number;
  behind: number;
};

type StageColumnProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

type CommitCardProps = {
  entry: GitPullSimulatorCommit;
  onRef: (element: HTMLDivElement | null) => void;
};

const DEFAULT_MODE: GitPullScenarioName = "fast-forward";

const TERMINAL_TONE_CLASS: Record<TerminalTone, string> = {
  label: "text-slate-400 uppercase tracking-wide",
  branch: "text-cyan-300",
  hint: "text-slate-400",
  remote: "text-sky-300",
  clean: "text-emerald-300",
  "log-head": "text-violet-300 font-semibold",
  "log-remote": "text-sky-300",
  "log-local": "text-amber-300",
  "log-merge": "text-primary font-semibold",
  "log-base": "text-slate-300",
  "log-meta": "text-slate-400",
};

const COMMIT_VARIANT_CLASS: Record<GitPullSimulatorCommit["variant"], string> = {
  default: "border-border bg-background",
  "local-change": "border-amber-500/30 bg-amber-500/10",
  "merge-result": "border-primary/35 bg-primary/10",
};

const WORKING_TREE_VARIANT_CLASS: Record<GitPullWorkingTreeSnapshot["variant"], string> = {
  default: "border-border bg-background",
  "merge-result": "border-primary/35 bg-primary/10",
};

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

const cloneHistory = (history: GitPullSimulatorCommit[]) =>
  history.map((entry) => ({
    ...entry,
    files: [...entry.files],
  }));

const cloneWorkingTree = (workingTree: GitPullWorkingTreeSnapshot) => ({
  ...workingTree,
  files: [...workingTree.files],
});

const compareHistories = (
  localHistory: GitPullSimulatorCommit[],
  trackingHistory: GitPullSimulatorCommit[],
): HistoryComparison => {
  const trackingIndexById = new Map(
    trackingHistory.map((entry, index) => [entry.id, index]),
  );
  const firstSharedLocalIndex = localHistory.findIndex((entry) =>
    trackingIndexById.has(entry.id),
  );

  if (firstSharedLocalIndex === -1) {
    return {
      status: "diverged",
      ahead: localHistory.length,
      behind: trackingHistory.length,
    };
  }

  const firstSharedEntryId = localHistory[firstSharedLocalIndex]?.id;
  const firstSharedTrackingIndex = trackingIndexById.get(firstSharedEntryId) ?? 0;

  if (firstSharedLocalIndex === 0 && firstSharedTrackingIndex === 0) {
    return { status: "up-to-date", ahead: 0, behind: 0 };
  }

  if (firstSharedLocalIndex > 0 && firstSharedTrackingIndex === 0) {
    return {
      status: "ahead",
      ahead: firstSharedLocalIndex,
      behind: 0,
    };
  }

  if (firstSharedLocalIndex === 0 && firstSharedTrackingIndex > 0) {
    return {
      status: "behind",
      ahead: 0,
      behind: firstSharedTrackingIndex,
    };
  }

  return {
    status: "diverged",
    ahead: firstSharedLocalIndex,
    behind: firstSharedTrackingIndex,
  };
};

const renderGitStatusLines = (
  localHistory: GitPullSimulatorCommit[],
  trackingHistory: GitPullSimulatorCommit[],
): TerminalLine[] => {
  const comparison = compareHistories(localHistory, trackingHistory);
  const lines: TerminalLine[] = [{ text: "On branch main", tone: "branch" }];

  if (comparison.status === "up-to-date") {
    lines.push({
      text: "Your branch is up to date with 'origin/main'.",
      tone: "clean",
    });
  } else if (comparison.status === "behind") {
    lines.push(
      {
        text: `Your branch is behind 'origin/main' by ${comparison.behind} commit${
          comparison.behind > 1 ? "s" : ""
        }, and can be fast-forwarded.`,
        tone: "remote",
      },
      { text: '  (use "git pull" to update your local branch)', tone: "hint" },
    );
  } else if (comparison.status === "ahead") {
    lines.push(
      {
        text: `Your branch is ahead of 'origin/main' by ${comparison.ahead} commit${
          comparison.ahead > 1 ? "s" : ""
        }.`,
        tone: "remote",
      },
      { text: '  (use "git push" to publish your local commits)', tone: "hint" },
    );
  } else {
    lines.push(
      {
        text: "Your branch and 'origin/main' have diverged,",
        tone: "remote",
      },
      {
        text: `and have ${comparison.ahead} and ${comparison.behind} different commit${
          comparison.ahead + comparison.behind > 2 ? "s" : ""
        } each, respectively.`,
        tone: "remote",
      },
      { text: '  (use "git pull" if you want to integrate the remote branch)', tone: "hint" },
    );
  }

  lines.push(
    { text: "", tone: "log-base" },
    { text: "nothing to commit, working tree clean", tone: "clean" },
  );

  return lines;
};

const renderGitLogLines = (
  localHistory: GitPullSimulatorCommit[],
  trackingHeadId: string | undefined,
): TerminalLine[] =>
  localHistory.slice(0, 6).flatMap((entry, index) => {
    const decorations: string[] = [];

    if (index === 0) {
      decorations.push("HEAD -> main");
    }

    if (trackingHeadId === entry.id) {
      decorations.push("origin/main");
    }

    const tone: TerminalTone =
      index === 0
        ? "log-head"
        : trackingHeadId === entry.id
          ? "log-remote"
          : entry.variant === "merge-result"
            ? "log-merge"
            : entry.variant === "local-change"
              ? "log-local"
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

const describeTrackingStatus = (comparison: HistoryComparison) => {
  if (comparison.status === "up-to-date") {
    return "origin/main sync กับ Remote Repository แล้ว";
  }

  if (comparison.status === "behind") {
    return `origin/main ยังตาม server ไม่ทัน ${comparison.behind} commit`;
  }

  if (comparison.status === "ahead") {
    return `origin/main นำ server อยู่ ${comparison.ahead} commit`;
  }

  return `origin/main กับ server ยัง diverged กัน (ahead ${comparison.ahead}, behind ${comparison.behind})`;
};

const describeLocalStatus = (comparison: HistoryComparison) => {
  if (comparison.status === "up-to-date") {
    return "local main ตรงกับ origin/main แล้ว";
  }

  if (comparison.status === "behind") {
    return `local main ตาม origin/main อยู่ ${comparison.behind} commit`;
  }

  if (comparison.status === "ahead") {
    return `local main นำ origin/main อยู่ ${comparison.ahead} commit`;
  }

  return `local main diverged กับ origin/main (ahead ${comparison.ahead}, behind ${comparison.behind})`;
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

function CommitCard({ entry, onRef }: CommitCardProps) {
  return (
    <article
      ref={onRef}
      className={cn("rounded-lg border px-3 py-2", COMMIT_VARIANT_CLASS[entry.variant])}
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

export function GitPullFlowSimulator() {
  const initialScenario = GIT_PULL_SIMULATOR_SCENARIOS[DEFAULT_MODE];

  const [mode, setMode] = useState<GitPullScenarioName>(DEFAULT_MODE);
  const [remoteHistory, setRemoteHistory] = useState<GitPullSimulatorCommit[]>(
    cloneHistory(initialScenario.initialRemoteHistory),
  );
  const [trackingHistory, setTrackingHistory] = useState<GitPullSimulatorCommit[]>(
    cloneHistory(initialScenario.initialTrackingHistory),
  );
  const [localHistory, setLocalHistory] = useState<GitPullSimulatorCommit[]>(
    cloneHistory(initialScenario.initialLocalHistory),
  );
  const [workingTree, setWorkingTree] = useState<GitPullWorkingTreeSnapshot>(
    cloneWorkingTree(initialScenario.initialWorkingTree),
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [lastCommand, setLastCommand] = useState<string>("ยังไม่ได้รันคำสั่ง");
  const [simMessage, setSimMessage] = useState<string>(initialScenario.summary);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const remoteCommitRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const trackingCommitRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const localCommitRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const trackingTargetRef = useRef<HTMLDivElement | null>(null);
  const localTargetRef = useRef<HTMLDivElement | null>(null);
  const workingTargetRef = useRef<HTMLDivElement | null>(null);
  const workingSnapshotRef = useRef<HTMLDivElement | null>(null);

  const scenario = GIT_PULL_SIMULATOR_SCENARIOS[mode];
  const flowSteps = GIT_PULL_FLOW_STEPS[mode];
  const trackingVsRemote = compareHistories(trackingHistory, remoteHistory);
  const localVsTracking = compareHistories(localHistory, trackingHistory);
  const statusLines = renderGitStatusLines(localHistory, trackingHistory);
  const logLines = renderGitLogLines(localHistory, trackingHistory[0]?.id);

  const resetScenario = (nextMode: GitPullScenarioName, commandLabel: string) => {
    const nextScenario = GIT_PULL_SIMULATOR_SCENARIOS[nextMode];

    setMode(nextMode);
    setRemoteHistory(cloneHistory(nextScenario.initialRemoteHistory));
    setTrackingHistory(cloneHistory(nextScenario.initialTrackingHistory));
    setLocalHistory(cloneHistory(nextScenario.initialLocalHistory));
    setWorkingTree(cloneWorkingTree(nextScenario.initialWorkingTree));
    setCurrentStepIndex(0);
    setLastCommand(commandLabel);
    setSimMessage(nextScenario.summary);
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

  const onSelectMode = (nextMode: GitPullScenarioName) => {
    if (isAnimating || nextMode === mode) {
      return;
    }

    resetScenario(nextMode, `Scenario: ${GIT_PULL_SIMULATOR_SCENARIOS[nextMode].title}`);
  };

  const onResetDemo = () => {
    if (isAnimating) {
      return;
    }

    resetScenario(mode, "Reset Demo");
  };

  const onPull = async () => {
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    setLastCommand(scenario.command);
    setCurrentStepIndex(1);
    setSimMessage(scenario.fetchMessage);

    const remoteHeadId = scenario.initialRemoteHistory[0]?.id;
    await animateCardToDropZone(
      remoteCommitRefs.current[remoteHeadId ?? ""],
      trackingTargetRef.current,
    );

    setTrackingHistory(cloneHistory(scenario.fetchedTrackingHistory));
    await waitNextPaint();
    await pulseElement(
      trackingCommitRefs.current[scenario.fetchedTrackingHistory[0]?.id ?? ""] ??
        trackingTargetRef.current,
    );

    await wait(160);
    setCurrentStepIndex(2);
    setSimMessage(scenario.integrateMessage);

    if (mode === "fast-forward") {
      await animateCardToDropZone(
        trackingCommitRefs.current[scenario.fetchedTrackingHistory[0]?.id ?? ""],
        localTargetRef.current,
      );
    } else {
      await Promise.all([
        animateCardToDropZone(
          trackingCommitRefs.current[scenario.fetchedTrackingHistory[0]?.id ?? ""],
          localTargetRef.current,
          0,
          -14,
        ),
        animateCardToDropZone(
          localCommitRefs.current[localHistory[0]?.id ?? ""],
          localTargetRef.current,
          40,
          14,
        ),
      ]);
    }

    setLocalHistory(cloneHistory(scenario.integratedLocalHistory));
    await waitNextPaint();
    await pulseElement(
      localCommitRefs.current[scenario.integratedLocalHistory[0]?.id ?? ""] ??
        localTargetRef.current,
    );

    await wait(160);
    await animateCardToDropZone(
      localCommitRefs.current[scenario.integratedLocalHistory[0]?.id ?? ""],
      workingTargetRef.current,
    );

    setWorkingTree(cloneWorkingTree(scenario.finalWorkingTree));
    setCurrentStepIndex(3);
    setSimMessage(scenario.doneMessage);
    await waitNextPaint();
    await pulseElement(workingSnapshotRef.current ?? workingTargetRef.current);
    setIsAnimating(false);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <h2 className="text-xl font-black tracking-tight text-foreground">
        Interactive Pull Simulator
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        ดู `git pull` แบบครบลูปว่าเริ่มจาก Remote Repository, อัปเดต `origin/main`,
        integrate เข้ากับ `local main` แล้วค่อยสะท้อนผลมาที่ Working Directory
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {GIT_PULL_SIMULATOR_MODE_OPTIONS.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={option.id === mode ? "default" : "outline"}
            disabled={isAnimating}
            onClick={() => onSelectMode(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-border bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Current Mode
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">{scenario.title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{scenario.summary}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {flowSteps.map((step, index) => (
          <article
            key={step}
            className={cn(
              "rounded-xl border p-3",
              index < currentStepIndex
                ? "border-emerald-500/30 bg-emerald-500/10"
                : index === currentStepIndex
                  ? "border-primary/30 bg-primary/10"
                  : "border-border bg-muted/20",
            )}
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-sm font-bold text-foreground">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-foreground">{step}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={isAnimating} onClick={() => void onPull()}>
          {scenario.command}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isAnimating}
          onClick={onResetDemo}
        >
          Reset Demo
        </Button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-4">
        <StageColumn
          title="Remote Repository"
          subtitle={
            trackingVsRemote.behind > 0
              ? `server ahead by ${trackingVsRemote.behind} commit${trackingVsRemote.behind > 1 ? "s" : ""}`
              : "server sync กับ tracking ref แล้ว"
          }
        >
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

        <StageColumn
          title="origin/main"
          subtitle={
            trackingVsRemote.behind > 0
              ? "remote-tracking ref ยังรอรับข้อมูลจาก server"
              : "tracking ref เห็น remote ล่าสุดแล้ว"
          }
        >
          <div
            ref={trackingTargetRef}
            className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-3 text-xs font-semibold tracking-wide text-foreground"
          >
            Fetch Target
          </div>

          {trackingHistory.map((entry) => (
            <CommitCard
              key={entry.id}
              entry={entry}
              onRef={(element) => {
                trackingCommitRefs.current[entry.id] = element;
              }}
            />
          ))}
        </StageColumn>

        <StageColumn
          title="Repository (local main)"
          subtitle={
            localVsTracking.status === "behind"
              ? "local main ยังไม่ integrate ของใหม่"
              : localVsTracking.status === "diverged"
                ? "local main กับ origin/main ยัง diverged กัน"
                : localVsTracking.status === "ahead"
                  ? "local main มี commit ใหม่กว่า origin/main"
                  : "local main sync กับ origin/main แล้ว"
          }
        >
          <div
            ref={localTargetRef}
            className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-3 text-xs font-semibold tracking-wide text-primary"
          >
            Local Integration Target
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
          title="Working Directory"
          subtitle={`checked out at ${workingTree.shortHash}`}
        >
          <div
            ref={workingTargetRef}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-xs font-semibold tracking-wide text-foreground"
          >
            Working Tree Update
          </div>

          <article
            ref={workingSnapshotRef}
            className={cn(
              "rounded-lg border px-3 py-3",
              WORKING_TREE_VARIANT_CLASS[workingTree.variant],
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {workingTree.title}
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {workingTree.shortHash} on main
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{workingTree.summary}</p>
            <div className="mt-3 flex flex-col gap-1">
              {workingTree.files.map((file) => (
                <p key={file} className="text-xs leading-5 text-muted-foreground">
                  {file}
                </p>
              ))}
            </div>
          </article>
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
                Tracking Ref
              </span>
              <span className="text-right text-sm font-semibold text-foreground">
                {describeTrackingStatus(trackingVsRemote)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Local Main
              </span>
              <span className="text-right text-sm font-semibold text-foreground">
                {describeLocalStatus(localVsTracking)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Integrate
              </span>
              <span className="text-right text-sm font-semibold text-foreground">
                {mode === "fast-forward"
                  ? currentStepIndex < 3
                    ? "คาดหวัง fast-forward โดยไม่สร้าง merge commit"
                    : "fast-forward เสร็จแล้ว"
                  : currentStepIndex < 3
                    ? "จะสร้าง merge commit เมื่อ combine local + remote"
                    : "merge commit ถูกสร้างบน local main แล้ว"}
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
              git log --oneline --decorate -n 6
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
