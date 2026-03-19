import { useEffect, useRef, useState } from "react";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import { NestJsLocalSquashFlowLabAccordion } from "@/features/lab/components/NestJsLocalSquashFlowLabAccordion";
import {
  NESTJS_LOCAL_SQUASH_FLOW_COMPLETION_POINTS,
  NESTJS_LOCAL_SQUASH_FLOW_EXPECTED_LEARNING,
  NESTJS_LOCAL_SQUASH_FLOW_FEATURE_SEQUENCE,
  NESTJS_LOCAL_SQUASH_FLOW_LAB_SECTIONS,
  NESTJS_LOCAL_SQUASH_FLOW_OVERVIEW_CARDS,
  NESTJS_LOCAL_SQUASH_FLOW_STAGES,
} from "@/features/lab/constants/local-squash-flow-content.constant";

export default function LocalSquashFlowPage() {
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
        title="Local squash flow"
        description="ฝึก Git workflow แบบ local-only บนโปรเจกต์ NestJS task board ตั้งแต่สร้าง app, แตกหลาย branch, generate resources และรวมกลับ main ด้วย git merge --squash"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Overview</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          เริ่มจาก baseline ที่นิ่งบน main ก่อน แล้วค่อยแตก 10 feature branches เพื่อฝึกการรวมงานกลับ
          main แบบ squashed บนเครื่องตัวเองจนคุ้นมือ
        </p>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {NESTJS_LOCAL_SQUASH_FLOW_OVERVIEW_CARDS.map((card) => (
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
          Squash Merge Cadence
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          sequence นี้คือจังหวะที่คุณจะทำซ้ำตลอด lab เพื่อให้เห็นว่า feature branches จำนวนมากยังรวมเข้า
          main ได้แบบ clean และย้อนดู history ได้ง่าย
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {NESTJS_LOCAL_SQUASH_FLOW_STAGES.map((stage, index) => (
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
          Feature Merge Order
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ใช้ลำดับนี้เป็นคิว merge หลักของ lab เพื่อให้ผู้เรียนเห็นการประกอบ task board API ทีละ
          feature ด้วย squash commits ที่อ่านง่าย
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {NESTJS_LOCAL_SQUASH_FLOW_FEATURE_SEQUENCE.map((feature) => (
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
          แต่ละ feature คือหนึ่ง branch งาน กดดูตัวอย่างเพื่อดู task, commands, local integration
          flow และ squash merge step ของ branch นั้นแบบแยกกัน
        </p>

        <NestJsLocalSquashFlowLabAccordion
          labSections={NESTJS_LOCAL_SQUASH_FLOW_LAB_SECTIONS}
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
            {NESTJS_LOCAL_SQUASH_FLOW_COMPLETION_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
          <h2 className="text-xl font-black tracking-tight text-foreground">
            Expected Learning
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {NESTJS_LOCAL_SQUASH_FLOW_EXPECTED_LEARNING.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
