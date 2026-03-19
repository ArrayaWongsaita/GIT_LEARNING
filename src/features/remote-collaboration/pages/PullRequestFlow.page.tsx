import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  PULL_REQUEST_FLOW_COMMAND_DOCS,
  PULL_REQUEST_FLOW_LAB_STEPS,
  PULL_REQUEST_REVIEW_MESSAGE_EXAMPLES,
  PULL_REQUEST_REVIEW_MESSAGE_STEPS,
  PULL_REQUEST_REVIEW_MESSAGE_TEMPLATES,
  PULL_REQUEST_FLOW_SAFETY_NOTES,
  PULL_REQUEST_FLOW_STEPS,
  type PullRequestFlowScenarioName,
} from "@/features/remote-collaboration/constants/pull-request-flow-content.constant";

type LaneTone = "neutral" | "info" | "success" | "warning" | "danger";

type FlowLane = {
  id: string;
  label: string;
  status: string;
  detail: string;
  tone: LaneTone;
};

type PullRequestFlowBoardState = {
  localBranch: FlowLane;
  githubPr: FlowLane;
  review: FlowLane;
  mergeStatus: FlowLane;
};

const LANE_TONE_CLASS: Record<LaneTone, string> = {
  neutral: "border-border bg-card text-foreground",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
};

const BASELINE_BOARD: PullRequestFlowBoardState = {
  localBranch: {
    id: "local-branch",
    label: "Local Branch Lane",
    status: "feature branch ready",
    detail: "เตรียม branch และ push ขึ้น origin แล้ว พร้อมเปิด PR",
    tone: "info",
  },
  githubPr: {
    id: "github-pr",
    label: "GitHub PR Lane",
    status: "PR ยังไม่ถูกเปิด",
    detail: "ยังไม่มี Pull Request บน GitHub สำหรับ branch นี้",
    tone: "neutral",
  },
  review: {
    id: "review-lane",
    label: "Review Lane",
    status: "ยังไม่เริ่ม review",
    detail: "รอ reviewer หลังจากเปิด PR",
    tone: "neutral",
  },
  mergeStatus: {
    id: "merge-status",
    label: "Merge Status Lane",
    status: "ยังไม่ merge",
    detail: "main branch ยังไม่มีงานจาก PR นี้",
    tone: "neutral",
  },
};

const CHANGES_REQUESTED_BOARD: PullRequestFlowBoardState = {
  localBranch: {
    id: "local-branch",
    label: "Local Branch Lane",
    status: "กำลังแก้ตามคอมเมนต์",
    detail: "ผู้พัฒนาอัปเดต commit ใหม่เพื่อตอบ review feedback",
    tone: "warning",
  },
  githubPr: {
    id: "github-pr",
    label: "GitHub PR Lane",
    status: "PR เปิดอยู่ (changes requested)",
    detail: "PR ยังไม่พร้อม merge จนกว่าจะแก้ครบและรีวิวรอบใหม่ผ่าน",
    tone: "warning",
  },
  review: {
    id: "review-lane",
    label: "Review Lane",
    status: "changes requested",
    detail: "reviewer ขอให้แก้ไขก่อน approve",
    tone: "danger",
  },
  mergeStatus: {
    id: "merge-status",
    label: "Merge Status Lane",
    status: "merge blocked",
    detail: "ยัง merge ไม่ได้ในสถานะ changes requested",
    tone: "danger",
  },
};

const HAPPY_PATH_DONE_BOARD: PullRequestFlowBoardState = {
  localBranch: {
    id: "local-branch",
    label: "Local Branch Lane",
    status: "branch งานเสร็จ",
    detail: "feature branch ถูก merge แล้ว พร้อมปิด branch เมื่อทีมยืนยัน",
    tone: "success",
  },
  githubPr: {
    id: "github-pr",
    label: "GitHub PR Lane",
    status: "PR merged",
    detail: "Pull Request ถูก merge เข้า main เรียบร้อย",
    tone: "success",
  },
  review: {
    id: "review-lane",
    label: "Review Lane",
    status: "approved",
    detail: "review ผ่านครบและ conversation สำคัญถูกเคลียร์",
    tone: "success",
  },
  mergeStatus: {
    id: "merge-status",
    label: "Merge Status Lane",
    status: "merged into main",
    detail: "main ได้ commit ล่าสุดจาก PR นี้แล้ว",
    tone: "success",
  },
};

const WAIT_STEP_MS = 560;
const GITHUB_PULL_REQUEST_IMAGE = {
  src: "/images/git/github/pull-requests-overview.png",
  alt: "ภาพหน้าจอ Pull requests บน GitHub",
} as const;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function PullRequestFlowPage() {
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const [boardState, setBoardState] =
    useState<PullRequestFlowBoardState>(BASELINE_BOARD);
  const [currentStep, setCurrentStep] = useState<string>(
    "พร้อมเริ่มจำลอง GitHub Pull requests",
  );
  const [scenario, setScenario] = useState<PullRequestFlowScenarioName | null>(
    null,
  );
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const copyResetTimerRef = useRef<Record<string, number>>({});
  const laneRefs = useRef<Record<string, HTMLDivElement | null>>({});
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

  const animateLanePulse = async (laneId: string) => {
    const target = laneRefs.current[laneId];
    if (!target) return;

    await animate(target, {
      scale: [1, 1.04, 1],
      duration: 320,
      ease: "outQuad",
    });
  };

  const animateBoardFlash = async () => {
    const board = boardRef.current;
    if (!board) return;

    await animate(board, {
      boxShadow: [
        "0 0 0 0 rgba(59, 130, 246, 0)",
        "0 0 0 6px rgba(59, 130, 246, 0.2)",
        "0 0 0 0 rgba(59, 130, 246, 0)",
      ],
      duration: 420,
      ease: "outQuad",
    });
  };

  const resetBoard = () => {
    setScenario(null);
    setIsAnimating(false);
    setBoardState(BASELINE_BOARD);
    setCurrentStep("พร้อมเริ่มจำลอง GitHub Pull requests");
  };

  const playScenario = async (name: PullRequestFlowScenarioName) => {
    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    setScenario(name);
    setBoardState(BASELINE_BOARD);

    const steps = PULL_REQUEST_FLOW_STEPS[name];
    setCurrentStep(steps[0]);
    await animateBoardFlash();
    await animateLanePulse("local-branch");
    await wait(WAIT_STEP_MS);

    if (name === "happy-path") {
      setCurrentStep(steps[1]);
      setBoardState((prev) => ({
        ...prev,
        githubPr: {
          ...prev.githubPr,
          status: "PR opened",
          detail: "เปิด PR บน GitHub แล้วและส่งเข้า review",
          tone: "info",
        },
        review: {
          ...prev.review,
          status: "approved",
          detail: "reviewer approve หลังตรวจโค้ด",
          tone: "success",
        },
      }));
      await animateLanePulse("github-pr");
      await animateLanePulse("review-lane");
      await wait(WAIT_STEP_MS);

      setCurrentStep(steps[2]);
      setBoardState((prev) => ({
        ...prev,
        githubPr: {
          ...prev.githubPr,
          detail: "required checks ผ่านครบ พร้อม merge",
          tone: "success",
        },
      }));
      await animateLanePulse("github-pr");
      await wait(WAIT_STEP_MS);

      setCurrentStep(steps[3]);
      setBoardState((prev) => ({
        ...prev,
        mergeStatus: {
          ...prev.mergeStatus,
          status: "merging",
          detail: "maintainer กำลัง merge PR เข้า main",
          tone: "warning",
        },
      }));
      await animateLanePulse("merge-status");
      await wait(WAIT_STEP_MS);

      setCurrentStep(steps[4]);
      setBoardState(HAPPY_PATH_DONE_BOARD);
      await animateLanePulse("merge-status");
      await animateLanePulse("github-pr");
      setIsAnimating(false);
      return;
    }

    setCurrentStep(steps[1]);
    setBoardState(CHANGES_REQUESTED_BOARD);
    await animateLanePulse("review-lane");
    await animateLanePulse("github-pr");
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[2]);
    setBoardState((prev) => ({
      ...prev,
      localBranch: {
        ...prev.localBranch,
        status: "push update แล้ว",
        detail: "ผู้พัฒนา push commit ใหม่เข้า PR เดิม",
        tone: "info",
      },
      githubPr: {
        ...prev.githubPr,
        status: "PR updated",
        detail: "GitHub รับ commit เพิ่มและรอ re-review",
        tone: "info",
      },
      review: {
        ...prev.review,
        status: "re-review pending",
        detail: "รอ reviewer ตรวจรอบใหม่",
        tone: "warning",
      },
    }));
    await animateLanePulse("local-branch");
    await animateLanePulse("github-pr");
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[3]);
    setBoardState((prev) => ({
      ...prev,
      review: {
        ...prev.review,
        status: "approved after update",
        detail: "review ผ่านหลังการแก้ไขรอบสอง",
        tone: "success",
      },
      githubPr: {
        ...prev.githubPr,
        detail: "checks ผ่านและพร้อม merge",
        tone: "success",
      },
    }));
    await animateLanePulse("review-lane");
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[4]);
    setBoardState((prev) => ({
      ...prev,
      mergeStatus: {
        ...prev.mergeStatus,
        status: "merging",
        detail: "เริ่ม merge หลังผ่าน review และ checks",
        tone: "warning",
      },
    }));
    await animateLanePulse("merge-status");
    await wait(WAIT_STEP_MS);

    setCurrentStep(steps[5]);
    setBoardState(HAPPY_PATH_DONE_BOARD);
    await animateLanePulse("merge-status");
    await animateLanePulse("github-pr");
    setIsAnimating(false);
  };

  const flowStepList = useMemo(() => {
    if (!scenario) return [];
    return PULL_REQUEST_FLOW_STEPS[scenario];
  }, [scenario]);

  const laneList = [
    boardState.localBranch,
    boardState.githubPr,
    boardState.review,
    boardState.mergeStatus,
  ];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <SetupGuideHeader
        badge="GitHub"
        title="Pull requests"
        description="เข้าใจ workflow ของ Pull requests บน GitHub ตั้งแต่เปิด PR รับรีวิว แก้ไข และ merge อย่างเป็นระบบ พร้อมมีช่องสำหรับใส่ภาพประกอบของคุณภายหลัง"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground">
              Image Placeholder
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              ผมใส่แท็ก <code>&lt;img /&gt;</code> พร้อม <code>src</code> placeholder
              ไว้ให้แล้ว คุณสามารถแทน path นี้ด้วยรูปของคุณภายหลังได้ทันที
            </p>
          </div>
          <code className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {GITHUB_PULL_REQUEST_IMAGE.src}
          </code>
        </div>

        <figure className="mt-4 overflow-hidden rounded-xl border border-dashed border-primary/35 bg-muted/20">
          <img
            src={GITHUB_PULL_REQUEST_IMAGE.src}
            alt={GITHUB_PULL_REQUEST_IMAGE.alt}
            className="h-auto w-full"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <figcaption className="border-t border-dashed border-primary/25 bg-background/80 p-4 text-sm leading-6 text-muted-foreground">
            วางภาพหน้าจอ Pull requests ของคุณใน <code>{GITHUB_PULL_REQUEST_IMAGE.src}</code>
            หรือแก้ค่า <code>src</code> ในแท็ก <code>&lt;img /&gt;</code> นี้ได้เลย
          </figcaption>
        </figure>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Command Explanation
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่งที่ใช้บ่อยก่อนเปิด PR และตอนอัปเดต PR หลังรับรีวิว
        </p>

        <div className="mt-4 space-y-4">
          {PULL_REQUEST_FLOW_COMMAND_DOCS.map((doc) => {
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
          Writing Reviewer Comments
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          review message ที่ดีควรสุภาพ ตรงประเด็น และ actionable พอที่เจ้าของ PR อ่านแล้วรู้
          ว่าควรเช็กอะไรต่อ แก้อะไร หรืออธิบาย intent ตรงไหนเพิ่ม
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {PULL_REQUEST_REVIEW_MESSAGE_STEPS.map((step) => (
            <article key={step.id} className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-foreground">{step.label}</h3>
                <span className="rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                  {step.prompt}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-5">
          <h3 className="text-base font-bold text-foreground">Good vs Bad Examples</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            เลี่ยงคำกว้าง ๆ อย่าง <code>fix this</code>, <code>not good</code>, หรือ{" "}
            <code>please change</code> แล้วเปลี่ยนเป็นข้อความที่บอก issue และผลกระทบชัดกว่า
          </p>

          <div className="mt-3 space-y-3">
            {PULL_REQUEST_REVIEW_MESSAGE_EXAMPLES.map((example) => (
              <article
                key={example.id}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <h4 className="text-sm font-semibold text-foreground">{example.title}</h4>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">Situation:</span>{" "}
                  {example.situation}
                </p>

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      Good
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground">{example.good}</p>
                  </div>
                  <div className="rounded-lg border border-rose-500/35 bg-rose-500/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                      Bad
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground">{example.bad}</p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">Why it works:</span>{" "}
                  {example.whyItWorks}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-base font-bold text-foreground">Quick Templates</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {PULL_REQUEST_REVIEW_MESSAGE_TEMPLATES.map((template) => (
              <article
                key={template.id}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <h4 className="text-sm font-semibold text-foreground">{template.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.intent}</p>
                <div className="mt-3 rounded-lg border border-border bg-card px-3 py-3">
                  <p className="font-mono text-xs leading-6 text-foreground">{template.template}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Pull Request Visual Flow
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ดูการทำงานของ Pull requests ตั้งแต่เปิด review ไปจน merge ในสองกรณี: happy path และ
          changes requested
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isAnimating}
            onClick={() => {
              void playScenario("happy-path");
            }}
          >
            Play Happy Path
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isAnimating}
            onClick={() => {
              void playScenario("changes-requested");
            }}
          >
            Play Changes Requested
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
            {laneList.map((lane) => (
              <div
                key={lane.id}
                ref={(el) => {
                  laneRefs.current[lane.id] = el;
                }}
                className={`rounded-lg border p-3 ${LANE_TONE_CLASS[lane.tone]}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {lane.label}
                </p>
                <p className="mt-2 text-base font-black">{lane.status}</p>
                <p className="mt-2 text-xs leading-5">{lane.detail}</p>
              </div>
            ))}
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
          {PULL_REQUEST_FLOW_SAFETY_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          ลองฝึก flow จริงตั้งแต่ push branch ไปจน merge PR ให้ชินขั้นตอนการทำงานร่วมกันบน
          GitHub
        </p>

        <ol className="mt-4 space-y-4">
          {PULL_REQUEST_FLOW_LAB_STEPS.map((step, stepIndex) => (
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
