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
import { CONFIG_GIT_SECTIONS } from "@/features/setup-git/constants/config-git-content.constant";

export default function ConfigGitPage() {
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
        badge="Setup Git"
        title="ตั้งค่า Git (git config) ให้พร้อมใช้งานจริง"
        description="หน้านี้รวบรวมการตั้งค่า git config ที่ใช้จริงในงานทีม ตั้งแต่ identity, behavior, line ending, aliases, credential helper ไปจนถึงการตรวจสอบและแก้ค่าที่ตั้งไว้"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <Accordion
          type="multiple"
          defaultValue={["identity-scope", "default-behavior"]}
          className="rounded-xl border border-border bg-muted/50 px-3 md:px-4"
        >
          {CONFIG_GIT_SECTIONS.map((section) => (
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
    </main>
  );
}
