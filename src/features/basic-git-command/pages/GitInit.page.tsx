import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  GIT_INIT_LAB_STEPS,
  GIT_INIT_SECTIONS,
} from "@/features/basic-git-command/constants/git-init-content.constant";

export default function GitInitPage() {
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
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <SetupGuideHeader
        badge="Commit Workflow"
        title="git init: สร้างและยกเลิก Repository อย่างถูกวิธี"
        description="เรียนรู้การเริ่มต้น repository ด้วย git init, วิธีตรวจสอบสถานะ, วิธีการยกเลิกแบบปลอดภัยด้วยการลบ .git และมี lab ให้ลองทำจริงพร้อม checkpoint"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <Accordion
          type="multiple"
          defaultValue={["basic-usage", "cancel-init"]}
          className="rounded-xl border border-border bg-muted/50 px-3 md:px-4"
        >
          {GIT_INIT_SECTIONS.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="flex flex-col gap-1">
                  <span className="text-base font-semibold text-foreground">
                    {section.title}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {section.summary}
                  </span>
                </span>
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-4 pb-2">
                  {section.items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        <span className="font-semibold text-foreground">สำหรับ:</span>{" "}
                        {item.purpose}
                      </p>

                      {item.notes?.length ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {item.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      ) : null}

                      <div className="mt-4 space-y-3">
                        {item.commands.map((commandItem, commandIndex) => {
                          const commandKey = `${section.id}-${item.id}-${commandIndex}`;
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
                    </article>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Lab: git init Step-by-step</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทำตามทีละขั้นตอนและเช็ก checkpoint ทุกข้อเพื่อยืนยันว่าคุณเข้าใจ flow ของ git init และการยกเลิก repository จริง
        </p>

        <ol className="mt-4 space-y-4">
          {GIT_INIT_LAB_STEPS.map((step, stepIndex) => (
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
