import { useEffect, useRef, useState } from "react";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import {
  GIT_MERGE_COMMAND_DOCS,
  GIT_MERGE_FAST_FORWARD_FLOW_LABS,
  GIT_MERGE_SAFETY_NOTES,
  GIT_MERGE_SQUASH_FLOW_LABS,
} from "@/features/merge-rebase/constants/git-merge-content.constant";
import { GitMergeLabAccordion } from "@/features/merge-rebase/components/GitMergeLabAccordion";

const FAST_FORWARD_COMMAND_IDS = new Set([
  "merge-default",
  "merge-ff-only",
  "status-check",
  "log-check",
]);

const SQUASH_COMMAND_IDS = new Set([
  "merge-squash",
  "squash-cancel",
  "status-check",
  "log-check",
]);

const FAST_FORWARD_DOCS = GIT_MERGE_COMMAND_DOCS.filter((doc) =>
  FAST_FORWARD_COMMAND_IDS.has(doc.id),
);

const SQUASH_DOCS = GIT_MERGE_COMMAND_DOCS.filter((doc) =>
  SQUASH_COMMAND_IDS.has(doc.id),
);

export default function GitMergePage() {
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
        badge="Merge & Rebase"
        title="git merge: รวม Branch หลายโหมดให้ควบคุมประวัติได้"
        description="เรียนรู้โหมดสำคัญของ merge พร้อม mini labs สำหรับ ff-only และ --squash เพื่อเข้าใจผลต่อ history และ branch pointer ในงานจริง"
      />

      <Accordion
        type="multiple"
        defaultValue={["fast-forward-merge", "squash-merge-lab"]}
        className="space-y-3"
      >
        <AccordionItem value="command-explanation" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Command Explanation
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Command Explanation
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                คำสั่งหลักสำหรับ merge ที่ใช้จริงเวลาจัดการประวัติ branch ในทีม
              </p>

              <div className="mt-4 space-y-4">
                {GIT_MERGE_COMMAND_DOCS.map((doc) => {
                  const commandKey = `doc-${doc.id}`;
                  const status = copyStatusByCommand[commandKey];

                  return (
                    <article
                      key={doc.id}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <h3 className="text-base font-bold text-foreground">{doc.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        <span className="font-semibold text-foreground">สำหรับ:</span>{" "}
                        {doc.purpose}
                      </p>
                      <div className="mt-3">
                        <CommandBlock
                          command={doc.command}
                          status={status}
                          onCopy={() => {
                            void handleCopyCommand(commandKey, doc.command);
                          }}
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fast-forward-merge" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Fast-forward Merge
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Fast-forward Merge
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                โฟกัสเฉพาะ flow ของ ff-only ตั้งแต่การตรวจเงื่อนไขจนถึงยืนยันผลบน graph
              </p>

              <div className="mt-4 space-y-4">
                {FAST_FORWARD_DOCS.map((doc) => {
                  const commandKey = `ff-doc-${doc.id}`;
                  const status = copyStatusByCommand[commandKey];

                  return (
                    <article
                      key={doc.id}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <h3 className="text-base font-bold text-foreground">{doc.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        <span className="font-semibold text-foreground">สำหรับ:</span>{" "}
                        {doc.purpose}
                      </p>
                      <div className="mt-3">
                        <CommandBlock
                          command={doc.command}
                          status={status}
                          onCopy={() => {
                            void handleCopyCommand(commandKey, doc.command);
                          }}
                        />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {doc.description}
                      </p>
                    </article>
                  );
                })}
              </div>

              <div className="mt-6">
                <h3 className="text-base font-bold text-foreground">FF-only Mini Flow</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  ทำตาม 3 ขั้นตอนนี้เพื่อทดสอบ fast-forward merge แบบครบลูป
                </p>

                <ol className="mt-4 space-y-4">
                  {GIT_MERGE_FAST_FORWARD_FLOW_LABS.map((step, stepIndex) => (
                    <li key={step.id} className="rounded-xl border border-border bg-muted/30 p-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                          {stepIndex + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-foreground">{step.title}</h4>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            <span className="font-semibold text-foreground">Task:</span>{" "}
                            {step.task}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {step.commands.map((commandItem, commandIndex) => {
                          const commandKey = `ff-lab-${step.id}-${commandIndex}`;
                          const status = copyStatusByCommand[commandKey];

                          return (
                            <div key={commandKey} className="space-y-2">
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

                      <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          Checkpoint
                        </p>
                        <p className="mt-1 text-sm text-foreground">{step.checkpoint}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="squash-merge-lab" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Squash Merge Lab
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Squash Merge Lab
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                โฟกัสการใช้ <code>git merge --squash</code> ตั้งแต่เตรียม branch ที่มีหลาย
                commits ไปจนถึงสร้าง summary commit เดียวบน main รวมถึงวิธียกเลิกก่อน
                commit ถ้าต้องถอยกลับ
              </p>

              <div className="mt-4 space-y-4">
                {SQUASH_DOCS.map((doc) => {
                  const commandKey = `squash-doc-${doc.id}`;
                  const status = copyStatusByCommand[commandKey];

                  return (
                    <article
                      key={doc.id}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <h3 className="text-base font-bold text-foreground">{doc.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        <span className="font-semibold text-foreground">สำหรับ:</span>{" "}
                        {doc.purpose}
                      </p>
                      <div className="mt-3">
                        <CommandBlock
                          command={doc.command}
                          status={status}
                          onCopy={() => {
                            void handleCopyCommand(commandKey, doc.command);
                          }}
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

              <div className="mt-6">
                <h3 className="text-base font-bold text-foreground">Squash Mini Flow</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  ใช้ 2 ขั้นตอนนี้เพื่อฝึกเตรียม branch ที่มีหลาย commit แล้วสรุปรวมกลับ main
                  แบบเหลือ summary commit เดียว
                </p>

                <ol className="mt-4 space-y-4">
                  {GIT_MERGE_SQUASH_FLOW_LABS.map((step, stepIndex) => (
                    <li key={step.id} className="rounded-xl border border-border bg-muted/30 p-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                          {stepIndex + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-foreground">{step.title}</h4>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            <span className="font-semibold text-foreground">Task:</span>{" "}
                            {step.task}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {step.commands.map((commandItem, commandIndex) => {
                          const commandKey = `squash-lab-${step.id}-${commandIndex}`;
                          const status = copyStatusByCommand[commandKey];

                          return (
                            <div key={commandKey} className="space-y-2">
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

                      {step.notes?.length ? (
                        <div className="mt-4 rounded-xl border border-dashed border-border bg-background/80 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Notes
                          </p>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                            {step.notes.map((note) => (
                              <li key={note}>{note}</li>
                            ))}
                          </ul>
                        </div>
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
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="safety-notes" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Safety Notes
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <h2 className="text-xl font-black tracking-tight text-foreground">Safety Notes</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                ก่อน merge จริงควรล็อก branch เป้าหมายและ policy ให้ชัด เพื่อลดการ rewrite
                ประวัติที่ไม่ตั้งใจ
              </p>
              <ul className="mt-4 list-disc space-y-2 rounded-xl border border-border bg-muted/30 p-4 pl-8 text-sm leading-6 text-foreground">
                {GIT_MERGE_SAFETY_NOTES.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="lab-collection" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Lab Collection
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Lab Collection
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                ชุดฝึกนี้แยกเป็น 3 sandbox repos เพื่อให้ซ้อม merge กับ config files
                หลายแบบจนชิน ตั้งแต่ frontend config, release/deploy config ไปจนถึง
                conflict recovery บนไฟล์อย่าง tsconfig และ workflow
              </p>
              <GitMergeLabAccordion
                copyStatusByCommand={copyStatusByCommand}
                onCopyCommand={handleCopyCommand}
              />
            </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
