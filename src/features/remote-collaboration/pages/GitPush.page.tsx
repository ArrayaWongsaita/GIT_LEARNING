import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  GIT_PUSH_COMMAND_DOCS,
  GIT_PUSH_FLOW_STEPS,
  GIT_PUSH_LAB_STEPS,
  GIT_PUSH_SAFETY_NOTES,
  type GitPushScenarioName,
} from "@/features/remote-collaboration/constants/git-push-content.constant";

type PushStatusTone = "neutral" | "success" | "warning" | "danger";

type PushNode = {
  id: string;
  label: string;
  commit: string;
  note: string;
};

type PushStatus = {
  headline: string;
  detail: string;
  tone: PushStatusTone;
};

type PushGraphState = {
  localMain: PushNode;
  originMain: PushNode;
  transferMessage: string;
  status: PushStatus;
};

const STATUS_TONE_CLASS: Record<PushStatusTone, string> = {
  neutral: "border-border bg-card text-foreground",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
};

const BASELINE_GRAPH: PushGraphState = {
  localMain: {
    id: "local-main",
    label: "local main",
    commit: "p4",
    note: "local ahead by 1 commit",
  },
  originMain: {
    id: "origin-main",
    label: "origin/main",
    commit: "p3",
    note: "remote รอรับ commit ใหม่",
  },
  transferMessage: "พร้อม push จาก local main -> origin/main",
  status: {
    headline: "Ready",
    detail: "พร้อมเริ่มจำลองการทำงานของ git push",
    tone: "neutral",
  },
};

const PUSH_SUCCESS_GRAPH: PushGraphState = {
  localMain: {
    id: "local-main",
    label: "local main",
    commit: "p4",
    note: "local และ remote sync กันแล้ว",
  },
  originMain: {
    id: "origin-main",
    label: "origin/main",
    commit: "p4",
    note: "remote อัปเดตเป็น commit ล่าสุด",
  },
  transferMessage: "push complete: origin/main ขยับตาม local main",
  status: {
    headline: "Push Success",
    detail: "remote รับ commit แล้ว สามารถทำงานต่อหรือเปิด PR ได้",
    tone: "success",
  },
};

const REJECTED_BASE_GRAPH: PushGraphState = {
  localMain: {
    id: "local-main",
    label: "local main",
    commit: "p4",
    note: "local มี commit ใหม่ แต่ยังไม่ sync ล่าสุด",
  },
  originMain: {
    id: "origin-main",
    label: "origin/main",
    commit: "p5",
    note: "remote มี commit ใหม่กว่า local",
  },
  transferMessage: "remote อยู่ไกลกว่า local: เสี่ยงโดน non-fast-forward",
  status: {
    headline: "Pre-check Warning",
    detail: "ควร pull/sync ก่อน push เพื่อลดโอกาสถูก reject",
    tone: "warning",
  },
};

const PUSH_REJECTED_GRAPH: PushGraphState = {
  localMain: {
    id: "local-main",
    label: "local main",
    commit: "p4",
    note: "local ยังไม่ได้รวม commit ใหม่จาก remote",
  },
  originMain: {
    id: "origin-main",
    label: "origin/main",
    commit: "p5",
    note: "origin ปฏิเสธการเขียนทับประวัติ",
  },
  transferMessage: "push rejected: non-fast-forward",
  status: {
    headline: "Push Rejected",
    detail: "ต้อง pull/sync ก่อน แล้วค่อย push ใหม่อีกครั้ง",
    tone: "danger",
  },
};

const WAIT_STEP_MS = 560;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function GitPushPage() {
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const [graphState, setGraphState] = useState<PushGraphState>(BASELINE_GRAPH);
  const [currentStep, setCurrentStep] = useState<string>(
    "พร้อมเริ่มจำลองการทำงานของ git push",
  );
  const [scenario, setScenario] = useState<GitPushScenarioName | null>(null);
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
        "0 0 0 0 rgba(34, 197, 94, 0)",
        "0 0 0 6px rgba(34, 197, 94, 0.2)",
        "0 0 0 0 rgba(34, 197, 94, 0)",
      ],
      duration: 420,
      ease: "outQuad",
    });
  };

  const resetBoard = () => {
    setScenario(null);
    setIsAnimating(false);
    setGraphState(BASELINE_GRAPH);
    setCurrentStep("พร้อมเริ่มจำลองการทำงานของ git push");
  };

  const playScenario = async (name: GitPushScenarioName) => {
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    setScenario(name);

    const steps = GIT_PUSH_FLOW_STEPS[name];
    setCurrentStep(steps[0]);

    if (name === "success") {
      setGraphState(BASELINE_GRAPH);
    } else {
      setGraphState(REJECTED_BASE_GRAPH);
    }

    await animateBoardFlash();
    await wait(WAIT_STEP_MS);

    if (name === "success") {
      setCurrentStep(steps[1]);
      setGraphState((prev) => ({
        ...prev,
        transferMessage: "กำลังส่ง commit จาก local main ไปยัง origin/main",
        status: {
          headline: "Push in progress",
          detail: "เริ่มขั้นตอนแพ็กและส่งข้อมูลไป remote",
          tone: "warning",
        },
      }));
      await animateNodePulse("local-main");
      await wait(WAIT_STEP_MS);

      setCurrentStep(steps[2]);
      await animateNodePulse("origin-main");
      await wait(WAIT_STEP_MS);

      setCurrentStep(steps[3]);
      setGraphState(PUSH_SUCCESS_GRAPH);
      await animateNodePulse("origin-main");
      await animateNodePulse("push-status");
      setIsAnimating(false);
      return;
    }

    setCurrentStep(steps[1]);
    setGraphState((prev) => ({
      ...prev,
      transferMessage: "พยายาม push ไป origin/main",
      status: {
        headline: "Push attempt",
        detail: "local ส่งคำขอ push แต่ remote ตรวจเจอประวัติไม่ต่อเนื่อง",
        tone: "warning",
      },
    }));
    await animateNodePulse("local-main");
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[2]);
    setGraphState(PUSH_REJECTED_GRAPH);
    await animateNodePulse("origin-main");
    await animateNodePulse("push-status");
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[3]);
    await animateNodePulse("push-status");
    setIsAnimating(false);
  };

  const flowStepList = useMemo(() => {
    if (!scenario) return [];
    return GIT_PUSH_FLOW_STEPS[scenario];
  }, [scenario]);

  const statusToneClass = STATUS_TONE_CLASS[graphState.status.tone];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <SetupGuideHeader
        badge="Remote Collaboration"
        title="git push"
        description="เข้าใจ flow ของ git push ผ่านภาพเคลื่อนไหวทั้งเคสสำเร็จและเคสถูกปฏิเสธแบบ non-fast-forward พร้อมฝึกคำสั่งใน mini lab"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Command Explanation
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่ง push ที่ใช้บ่อยในงานจริง ตั้งแต่ push พื้นฐานจนถึงแนวทางแก้ rejected push
        </p>

        <div className="mt-4 space-y-4">
          {GIT_PUSH_COMMAND_DOCS.map((doc) => {
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
          Push Visual Flow
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          จำลองการ push สองสถานการณ์: push สำเร็จ และ push ถูก reject แบบ non-fast-forward
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isAnimating}
            onClick={() => {
              void playScenario("success");
            }}
          >
            Play Push Success
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isAnimating}
            onClick={() => {
              void playScenario("rejected");
            }}
          >
            Play Rejected Push
          </Button>
          <Button type="button" variant="outline" onClick={resetBoard}>
            Reset
          </Button>
        </div>

        <div
          ref={boardRef}
          className="mt-4 rounded-xl border border-border bg-muted/30 p-4 transition-shadow"
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[graphState.localMain, graphState.originMain].map((node) => (
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
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{node.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-dashed border-primary/40 bg-primary/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Transfer Lane
            </p>
            <p className="mt-1 text-sm text-foreground">{graphState.transferMessage}</p>
          </div>

          <div
            ref={(el) => {
              nodeRefs.current["push-status"] = el;
            }}
            className={`mt-3 rounded-lg border p-3 ${statusToneClass}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide">
              {graphState.status.headline}
            </p>
            <p className="mt-1 text-sm">{graphState.status.detail}</p>
          </div>
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
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Safety Notes + Mini Lab
        </h2>

        <ul className="mt-3 list-disc space-y-2 rounded-xl border border-border bg-muted/30 p-4 pl-8 text-sm leading-6 text-foreground">
          {GIT_PUSH_SAFETY_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          ฝึก flow การ push ทั้งเคสปกติและเคสโดน reject เพื่อให้แก้สถานการณ์จริงได้เร็วขึ้น
        </p>

        <ol className="mt-4 space-y-4">
          {GIT_PUSH_LAB_STEPS.map((step, stepIndex) => (
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
