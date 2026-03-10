import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  GIT_PULL_COMMAND_DOCS,
  GIT_PULL_FLOW_STEPS,
  GIT_PULL_LAB_STEPS,
  GIT_PULL_SAFETY_NOTES,
  type GitPullScenarioName,
} from "@/features/remote-collaboration/constants/git-pull-content.constant";

type PullNode = {
  id: string;
  label: string;
  commit: string;
};

type PullGraphState = {
  originMain: PullNode;
  localMain: PullNode;
  workingTree: PullNode;
  mergeCommit?: PullNode;
};

const BASELINE_GRAPH: PullGraphState = {
  originMain: { id: "origin-main", label: "origin/main", commit: "c5" },
  localMain: { id: "local-main", label: "local main", commit: "c3" },
  workingTree: { id: "working-tree", label: "working tree", commit: "c3" },
};

const FAST_FORWARD_GRAPH: PullGraphState = {
  originMain: { id: "origin-main", label: "origin/main", commit: "c5" },
  localMain: { id: "local-main", label: "local main", commit: "c5" },
  workingTree: { id: "working-tree", label: "working tree", commit: "c5" },
};

const MERGE_GRAPH: PullGraphState = {
  originMain: { id: "origin-main", label: "origin/main", commit: "c5" },
  localMain: { id: "local-main", label: "local main", commit: "m1" },
  workingTree: { id: "working-tree", label: "working tree", commit: "m1" },
  mergeCommit: { id: "merge-main", label: "merge commit", commit: "m1" },
};

const WAIT_STEP_MS = 560;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function GitPullPage() {
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const [graphState, setGraphState] = useState<PullGraphState>(BASELINE_GRAPH);
  const [currentStep, setCurrentStep] = useState<string>("พร้อมเริ่มจำลองการทำงานของ git pull");
  const [scenario, setScenario] = useState<GitPullScenarioName | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const copyResetTimerRef = useRef<Record<string, number>>({});
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const boardRef = useRef<HTMLDivElement | null>(null);

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

  const animateNodePulse = async (nodeId: string) => {
    const target = nodeRefs.current[nodeId];
    if (!target) return;

    await animate(target, {
      scale: [1, 1.05, 1],
      duration: 300,
      ease: "outQuad",
    });
  };

  const animateBoardFlash = async () => {
    const board = boardRef.current;
    if (!board) return;

    await animate(board, {
      boxShadow: [
        "0 0 0 0 rgba(34, 211, 238, 0)",
        "0 0 0 6px rgba(34, 211, 238, 0.2)",
        "0 0 0 0 rgba(34, 211, 238, 0)",
      ],
      duration: 420,
      ease: "outQuad",
    });
  };

  const resetBoard = () => {
    setScenario(null);
    setIsAnimating(false);
    setGraphState(BASELINE_GRAPH);
    setCurrentStep("พร้อมเริ่มจำลองการทำงานของ git pull");
  };

  const playScenario = async (name: GitPullScenarioName) => {
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    setScenario(name);
    setGraphState(BASELINE_GRAPH);

    const steps = GIT_PULL_FLOW_STEPS[name];
    setCurrentStep(steps[0]);
    await animateBoardFlash();
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[1]);
    await animateNodePulse("origin-main");
    await wait(WAIT_STEP_MS);

    if (name === "fast-forward") {
      setCurrentStep(steps[2]);
      setGraphState(FAST_FORWARD_GRAPH);
      await animateNodePulse("local-main");
      await animateNodePulse("working-tree");
      await wait(WAIT_STEP_MS);
      setCurrentStep(steps[3]);
      setIsAnimating(false);
      return;
    }

    setCurrentStep(steps[2]);
    setGraphState(MERGE_GRAPH);
    await animateNodePulse("local-main");
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[3]);
    await animateNodePulse("working-tree");
    setIsAnimating(false);
  };

  const flowStepList = useMemo(() => {
    if (!scenario) return [];
    return GIT_PULL_FLOW_STEPS[scenario];
  }, [scenario]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <SetupGuideHeader
        badge="Remote Collaboration"
        title="git pull"
        description="เข้าใจ flow ของ git pull ตั้งแต่ fetch จน integrate ผ่านภาพเคลื่อนไหว และฝึกใช้คำสั่งจริงผ่าน mini lab"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Command Explanation
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่ง pull ที่ใช้บ่อยสำหรับอัปเดต local branch ให้ทันกับ remote
        </p>

        <div className="mt-4 space-y-4">
          {GIT_PULL_COMMAND_DOCS.map((doc) => {
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
                {doc.notes?.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {doc.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Pull Visual Flow
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ดูภาพการทำงานของ git pull ในสองกรณี: fast-forward และ merge case
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isAnimating}
            onClick={() => {
              void playScenario("fast-forward");
            }}
          >
            Play Fast-forward Pull
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isAnimating}
            onClick={() => {
              void playScenario("merge");
            }}
          >
            Play Pull with Merge
          </Button>
          <Button type="button" variant="outline" onClick={resetBoard}>
            Reset
          </Button>
        </div>

        <div
          ref={boardRef}
          className="mt-4 rounded-xl border border-border bg-muted/30 p-4 transition-shadow"
        >
          <div className="grid gap-3 md:grid-cols-3">
            {[graphState.originMain, graphState.localMain, graphState.workingTree].map((node) => (
              <div
                key={node.id}
                ref={(el) => {
                  nodeRefs.current[node.id] = el;
                }}
                className="rounded-lg border border-border bg-card p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {node.label}
                </p>
                <p className="mt-2 text-lg font-black text-foreground">{node.commit}</p>
              </div>
            ))}
          </div>

          {graphState.mergeCommit ? (
            <div
              ref={(el) => {
                nodeRefs.current[graphState.mergeCommit!.id] = el;
              }}
              className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {graphState.mergeCommit.label}
              </p>
              <p className="mt-2 text-lg font-black text-foreground">
                {graphState.mergeCommit.commit}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Current Step
          </p>
          <p className="mt-1 text-sm text-foreground">{currentStep}</p>
        </div>

        {flowStepList.length ? (
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {flowStepList.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Safety Notes</h2>
        <ul className="mt-3 list-disc space-y-2 rounded-xl border border-border bg-muted/30 p-4 pl-8 text-sm leading-6 text-foreground">
          {GIT_PULL_SAFETY_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ฝึก pull แบบพื้นฐานจาก repository ที่ clone มาแล้ว เพื่อให้ชิน flow จริง
        </p>

        <ol className="mt-4 space-y-4">
          {GIT_PULL_LAB_STEPS.map((step, stepIndex) => (
            <li key={step.id} className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {stepIndex + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    <span className="font-semibold text-foreground">Task:</span> {step.task}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
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

              <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3">
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
