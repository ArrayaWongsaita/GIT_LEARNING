import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  GIT_FETCH_COMMAND_DOCS,
  GIT_FETCH_FLOW_STEPS,
  GIT_FETCH_LAB_STEPS,
  GIT_FETCH_SAFETY_NOTES,
  type GitFetchScenarioName,
} from "@/features/remote-collaboration/constants/git-fetch-content.constant";

type FetchStatusTone = "neutral" | "info" | "success";

type FetchNode = {
  id: string;
  label: string;
  commit: string;
  note: string;
};

type FetchStatus = {
  headline: string;
  detail: string;
  tone: FetchStatusTone;
};

type FetchGraphState = {
  remoteRef: FetchNode;
  trackingRef: FetchNode;
  localBranch: FetchNode;
  workingTree: FetchNode;
  transferMessage: string;
  status: FetchStatus;
};

const STATUS_TONE_CLASS: Record<FetchStatusTone, string> = {
  neutral: "border-border bg-card text-foreground",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const TRACKING_BASE_GRAPH: FetchGraphState = {
  remoteRef: {
    id: "remote-ref",
    label: "remote main",
    commit: "c5",
    note: "server มี commit ใหม่กว่า local cache",
  },
  trackingRef: {
    id: "tracking-ref",
    label: "origin/main",
    commit: "c3",
    note: "remote-tracking ref ในเครื่องยังตามไม่ทัน",
  },
  localBranch: {
    id: "local-branch",
    label: "local main",
    commit: "c3",
    note: "branch ปัจจุบันยังอิงข้อมูลเก่าที่คุณรู้ล่าสุด",
  },
  workingTree: {
    id: "working-tree",
    label: "working tree",
    commit: "c3",
    note: "ไฟล์ในเครื่องยังไม่เปลี่ยนก่อนและหลัง fetch",
  },
  transferMessage: "พร้อมดึงข้อมูลจาก remote main มายัง origin/main",
  status: {
    headline: "Ready",
    detail: "พร้อมเริ่มจำลองการทำงานของ git fetch",
    tone: "neutral",
  },
};

const TRACKING_UPDATED_GRAPH: FetchGraphState = {
  remoteRef: {
    id: "remote-ref",
    label: "remote main",
    commit: "c5",
    note: "server ยังคงเป็นแหล่งข้อมูลล่าสุด",
  },
  trackingRef: {
    id: "tracking-ref",
    label: "origin/main",
    commit: "c5",
    note: "tracking ref ถูกอัปเดตแล้ว แต่ยังไม่ได้รวมเข้ากับ local main",
  },
  localBranch: {
    id: "local-branch",
    label: "local main",
    commit: "c3",
    note: "local branch ยังอยู่ commit เดิมจนกว่าจะ merge หรือ rebase",
  },
  workingTree: {
    id: "working-tree",
    label: "working tree",
    commit: "c3",
    note: "ไม่มีไฟล์ใดถูกแก้โดย git fetch",
  },
  transferMessage: "fetch complete: origin/main ขยับตาม remote แล้ว",
  status: {
    headline: "Tracking Ref Updated",
    detail: "fetch สำเร็จ แต่ local main และ working tree ยังไม่ถูก integrate",
    tone: "success",
  },
};

const FEATURE_BASE_GRAPH: FetchGraphState = {
  remoteRef: {
    id: "remote-ref",
    label: "remote feature",
    commit: "f7",
    note: "เพื่อนร่วมทีม push branch ใหม่ขึ้น server แล้ว",
  },
  trackingRef: {
    id: "tracking-ref",
    label: "origin/feature/promo-banner",
    commit: "f5",
    note: "tracking ref ในเครื่องยังเก่ากว่า branch บน remote",
  },
  localBranch: {
    id: "local-branch",
    label: "local main",
    commit: "m3",
    note: "คุณยังยืนอยู่บน main ระหว่าง fetch branch ของเพื่อน",
  },
  workingTree: {
    id: "working-tree",
    label: "working tree",
    commit: "m3",
    note: "ไฟล์ในเครื่องยังนิ่ง แม้คุณจะ fetch feature branch เพิ่ม",
  },
  transferMessage: "พร้อมดึง remote feature branch เข้ามาอัปเดต tracking ref",
  status: {
    headline: "Ready",
    detail: "พร้อมดูตัวอย่างการ fetch branch งานของคนอื่นโดยไม่ checkout ทันที",
    tone: "info",
  },
};

const FEATURE_UPDATED_GRAPH: FetchGraphState = {
  remoteRef: {
    id: "remote-ref",
    label: "remote feature",
    commit: "f7",
    note: "branch บน server ยังคงเป็นต้นทางของข้อมูลล่าสุด",
  },
  trackingRef: {
    id: "tracking-ref",
    label: "origin/feature/promo-banner",
    commit: "f7",
    note: "tracking ref ใหม่พร้อมให้ inspect, checkout หรือ rebase ต่อ",
  },
  localBranch: {
    id: "local-branch",
    label: "local main",
    commit: "m3",
    note: "คุณยังอยู่บน local main เพราะ fetch ยังไม่สลับ branch ให้",
  },
  workingTree: {
    id: "working-tree",
    label: "working tree",
    commit: "m3",
    note: "working tree ยังคงเดิมจนกว่าคุณจะเลือกขั้นถัดไปเอง",
  },
  transferMessage: "fetch complete: origin/feature/promo-banner พร้อมใช้งานแล้ว",
  status: {
    headline: "Feature Branch Synced",
    detail: "branch งานของเพื่อนถูกอัปเดตเข้ามาใน local repository โดยไม่แตะ branch ปัจจุบัน",
    tone: "success",
  },
};

const WAIT_STEP_MS = 560;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function GitFetchPage() {
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const [graphState, setGraphState] = useState<FetchGraphState>(TRACKING_BASE_GRAPH);
  const [currentStep, setCurrentStep] = useState<string>(
    "พร้อมเริ่มจำลองการทำงานของ git fetch",
  );
  const [scenario, setScenario] = useState<GitFetchScenarioName | null>(null);
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
        "0 0 0 0 rgba(14, 165, 233, 0)",
        "0 0 0 6px rgba(14, 165, 233, 0.2)",
        "0 0 0 0 rgba(14, 165, 233, 0)",
      ],
      duration: 420,
      ease: "outQuad",
    });
  };

  const resetBoard = () => {
    setScenario(null);
    setIsAnimating(false);
    setGraphState(TRACKING_BASE_GRAPH);
    setCurrentStep("พร้อมเริ่มจำลองการทำงานของ git fetch");
  };

  const playScenario = async (name: GitFetchScenarioName) => {
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    setScenario(name);

    const steps = GIT_FETCH_FLOW_STEPS[name];

    if (name === "update-tracking-ref") {
      setGraphState(TRACKING_BASE_GRAPH);
    } else {
      setGraphState(FEATURE_BASE_GRAPH);
    }

    setCurrentStep(steps[0]);
    await animateBoardFlash();
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[1]);
    await animateNodePulse("remote-ref");
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[2]);

    if (name === "update-tracking-ref") {
      setGraphState(TRACKING_UPDATED_GRAPH);
    } else {
      setGraphState(FEATURE_UPDATED_GRAPH);
    }

    await animateNodePulse("tracking-ref");
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[3]);
    await animateNodePulse("local-branch");
    await animateNodePulse("working-tree");
    await animateNodePulse("fetch-status");
    setIsAnimating(false);
  };

  const flowStepList = scenario ? GIT_FETCH_FLOW_STEPS[scenario] : [];
  const statusToneClass = STATUS_TONE_CLASS[graphState.status.tone];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <SetupGuideHeader
        badge="Remote Collaboration"
        title="git fetch"
        description="เข้าใจว่า git fetch ดึงข้อมูลจาก remote มาอัปเดต remote-tracking refs เท่านั้น โดยยังไม่ merge เข้า branch ปัจจุบัน พร้อมดูภาพการทำงานและฝึกคำสั่งจริง"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Command Explanation
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่ง fetch ที่ใช้บ่อยในงานจริง เพื่อดึงข้อมูลล่าสุดจาก remote มาเก็บไว้ก่อนตัดสินใจ
          integrate เอง
        </p>

        <div className="mt-4 space-y-4">
          {GIT_FETCH_COMMAND_DOCS.map((doc) => {
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
          Fetch Visual Flow
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ดูภาพการทำงานของ git fetch สองสถานการณ์: อัปเดต origin/main และดึง feature branch ของเพื่อน
          โดยทั้งสองกรณีจะยังไม่ merge เข้า branch ปัจจุบัน
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isAnimating}
            onClick={() => {
              void playScenario("update-tracking-ref");
            }}
          >
            Play Tracking Ref Update
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isAnimating}
            onClick={() => {
              void playScenario("fetch-feature-branch");
            }}
          >
            Play Fetch Feature Branch
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
            {[
              graphState.remoteRef,
              graphState.trackingRef,
              graphState.localBranch,
              graphState.workingTree,
            ].map((node) => (
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

          <div className="mt-3 rounded-lg border border-dashed border-sky-500/40 bg-sky-500/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
              Transfer Lane
            </p>
            <p className="mt-1 text-sm text-foreground">{graphState.transferMessage}</p>
          </div>

          <div
            ref={(el) => {
              nodeRefs.current["fetch-status"] = el;
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
        <h2 className="text-xl font-black tracking-tight text-foreground">Safety Notes</h2>
        <ul className="mt-3 list-disc space-y-2 rounded-xl border border-border bg-muted/30 p-4 pl-8 text-sm leading-6 text-foreground">
          {GIT_FETCH_SAFETY_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ฝึก fetch จาก repository ที่ทำงานอยู่จริง แล้วแยกให้ออกว่าขั้นตอนไหนคือการดึงข้อมูล และขั้นตอนไหนคือการ integrate
        </p>

        <ol className="mt-4 space-y-4">
          {GIT_FETCH_LAB_STEPS.map((step, stepIndex) => (
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
