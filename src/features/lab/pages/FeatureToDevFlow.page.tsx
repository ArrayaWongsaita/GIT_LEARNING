import { useEffect, useRef, useState } from "react";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import { FeatureToDevFlowLabAccordion } from "@/features/lab/components/FeatureToDevFlowLabAccordion";
import {
  FEATURE_TO_DEV_FLOW_COMPLETION_POINTS,
  FEATURE_TO_DEV_FLOW_EXPECTED_LEARNING,
  FEATURE_TO_DEV_FLOW_FEATURE_SEQUENCE,
  FEATURE_TO_DEV_FLOW_LAB_SECTIONS,
  FEATURE_TO_DEV_FLOW_OVERVIEW_CARDS,
  FEATURE_TO_DEV_FLOW_STAGES,
} from "@/features/lab/constants/feature-to-dev-flow-content.constant";

export default function FeatureToDevFlowPage() {
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const copyResetTimerRef = useRef<Record<string, number>>({});

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

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SetupGuideHeader
        badge="Lab"
        title="Feature to dev flow"
        description="ฝึก workflow แยกสำหรับทีมที่ให้ 10 feature branches เปิด PR เข้า dev ตั้งแต่แรก พร้อมดูแล PR ด้วย rebase บน origin/dev และอัปเดต branch ของตัวเองอย่างปลอดภัย"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Overview</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          เริ่มจาก main ที่นิ่ง, publish `dev`, แล้วแตก 10 feature branches จาก dev baseline เดียวกัน
          เพื่อให้ทุก PR ต้องกลับมาซิงก์กับ origin/dev ระหว่าง review เหมือนงานทีมจริง
        </p>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {FEATURE_TO_DEV_FLOW_OVERVIEW_CARDS.map((card) => (
            <article key={card.id} className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-base font-bold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.summary}</p>

              {card.commands?.length ? (
                <div className="mt-4 flex flex-col gap-3">
                  {card.commands.map((commandItem, commandIndex) => {
                    const commandKey = `overview-${card.id}-${commandIndex}`;
                    const status = copyStatusByCommand[commandKey];

                    return (
                      <div key={commandKey} className="flex flex-col gap-2">
                        <CommandBlock
                          command={commandItem.command}
                          status={status}
                          onCopy={() => {
                            void handleCopyCommand(commandKey, commandItem.command);
                          }}
                        />
                        <p className="px-1 text-sm leading-6 text-muted-foreground">
                          {commandItem.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {card.notes?.length ? (
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                  {card.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Workflow Cadence
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          cadence นี้คือจังหวะที่ผู้เรียนต้องทำซ้ำให้คล่อง เพื่อให้เห็นว่า 10 feature branches
          สามารถเปิด PR เข้า dev ได้ตั้งแต่แรกและยังอัปเดตตาม shared branch ระหว่าง review ได้อย่างปลอดภัย
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {FEATURE_TO_DEV_FLOW_STAGES.map((stage, index) => (
            <article key={stage.id} className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground">{stage.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {stage.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Feature Queue to dev
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ใช้ลำดับนี้เป็นคิว PR หลักของ lab เพื่อให้ branch หลัง ๆ ต้อง refresh PR เดิมตาม
          origin/dev จริงระหว่างทาง
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {FEATURE_TO_DEV_FLOW_FEATURE_SEQUENCE.map((feature) => (
            <article key={feature.id} className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {feature.order}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {feature.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold tracking-wide text-foreground">
                      {feature.branchName}
                    </span>
                    <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold tracking-wide text-foreground">
                      Target: {feature.targetBranch}
                    </span>
                    <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
                      Focus: {feature.focus}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Lab Collection
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          แต่ละ feature คือหนึ่ง branch งานที่ต้อง generate resource, push PR เข้า dev, และอัปเดต
          PR เดิมด้วย rebase บน origin/dev จนครบทั้ง 10 งาน
        </p>

        <FeatureToDevFlowLabAccordion
          labSections={FEATURE_TO_DEV_FLOW_LAB_SECTIONS}
          copyStatusByCommand={copyStatusByCommand}
          onCopyCommand={handleCopyCommand}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
          <h2 className="text-xl font-black tracking-tight text-foreground">
            Completion Goal
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {FEATURE_TO_DEV_FLOW_COMPLETION_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
          <h2 className="text-xl font-black tracking-tight text-foreground">
            Expected Learning
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {FEATURE_TO_DEV_FLOW_EXPECTED_LEARNING.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
