import { useEffect, useRef, useState } from "react";
import { CommandBlock, type CommandCopyStatus } from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

type CommandLessonCommand = {
  command: string;
  description: string;
  label?: string;
  language?: string;
};

type CommandLessonSectionItem = {
  id: string;
  title: string;
  purpose: string;
  commands: CommandLessonCommand[];
  notes?: string[];
};

type CommandLessonSection = {
  id: string;
  title: string;
  summary: string;
  items: CommandLessonSectionItem[];
};

type CommandLessonLab = {
  id: string;
  title: string;
  summary: string;
  difficulty: "Starter" | "Practice" | "Challenge";
  focus: string;
  task: string;
  commands: CommandLessonCommand[];
  checkpoint: string;
  notes?: string[];
};

type CommandLessonLabSection = {
  id: string;
  title: string;
  summary: string;
  labs: CommandLessonLab[];
};

type CommandLessonPageTemplateProps = {
  badge: string;
  title: string;
  description: string;
  sections: CommandLessonSection[];
  labSections: CommandLessonLabSection[];
};

type CommandLessonLabAccordionProps = {
  labSections: CommandLessonLabSection[];
  copyStatusByCommand: Record<string, CommandCopyStatus | undefined>;
  onCopyCommand: (commandKey: string, command: string) => Promise<void>;
};

const DIFFICULTY_CLASS_NAME: Record<CommandLessonLab["difficulty"], string> = {
  Starter: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  Practice: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  Challenge: "border-amber-500/30 bg-amber-500/10 text-amber-700",
};

function CommandLessonLabAccordion({
  labSections,
  copyStatusByCommand,
  onCopyCommand,
}: CommandLessonLabAccordionProps) {
  return (
    <div className="mt-5 flex flex-col gap-5">
      {labSections.map((section) => (
        <section
          key={section.id}
          className="rounded-2xl border border-border bg-muted/20 p-4 md:p-5"
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-black tracking-tight text-foreground">
              {section.title}
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">{section.summary}</p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="mt-4 rounded-xl border border-border bg-background px-3 md:px-4"
          >
            {section.labs.map((lab) => (
              <AccordionItem key={lab.id} value={lab.id}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="text-base font-semibold text-foreground">
                      {lab.title}
                    </span>
                    <span className="text-sm font-normal leading-6 text-muted-foreground">
                      {lab.summary}
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
                          DIFFICULTY_CLASS_NAME[lab.difficulty]
                        }`}
                      >
                        {lab.difficulty}
                      </span>
                      <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
                        Focus: {lab.focus}
                      </span>
                    </span>
                  </span>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="flex flex-col gap-4 pb-2">
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Task
                      </p>
                      <p className="mt-1 text-sm leading-6 text-foreground">{lab.task}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      {lab.commands.map((commandItem, commandIndex) => {
                        const commandKey = `lab-${lab.id}-${commandIndex}`;
                        const status = copyStatusByCommand[commandKey];

                        return (
                          <div key={commandKey} className="flex flex-col gap-2">
                            <CommandBlock
                              command={commandItem.command}
                              status={status}
                              label={commandItem.label}
                              language={commandItem.language}
                              onCopy={() => {
                                void onCopyCommand(commandKey, commandItem.command);
                              }}
                            />
                            <p className="px-1 text-sm leading-6 text-muted-foreground">
                              {commandItem.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {lab.notes?.length ? (
                      <div className="rounded-xl border border-dashed border-border bg-background/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Notes
                        </p>
                        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm leading-6 text-muted-foreground">
                          {lab.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Checkpoint
                      </p>
                      <p className="mt-1 text-sm leading-6 text-foreground">
                        {lab.checkpoint}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  );
}

export function CommandLessonPageTemplate({
  badge,
  title,
  description,
  sections,
  labSections,
}: CommandLessonPageTemplateProps) {
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
      <SetupGuideHeader badge={badge} title={title} description={description} />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <Accordion
          type="multiple"
          defaultValue={sections.slice(0, 1).map((section) => section.id)}
          className="rounded-xl border border-border bg-muted/50 px-3 md:px-4"
        >
          {sections.map((section) => (
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
                          const commandKey = `section-${section.id}-${item.id}-${commandIndex}`;
                          const status = copyStatusByCommand[commandKey];

                          return (
                            <div key={commandKey} className="space-y-2">
                              <CommandBlock
                                command={commandItem.command}
                                status={status}
                                label={commandItem.label}
                                language={commandItem.language}
                                onCopy={() => {
                                  void handleCopyCommand(
                                    commandKey,
                                    commandItem.command,
                                  );
                                }}
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

      {labSections.length ? (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
          <h2 className="text-xl font-black tracking-tight text-foreground">
            Lab Collection
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            ลองทำหลายสถานการณ์เพื่อแยกให้ออกว่าเมื่อไรควรใช้คำสั่งหรือแนวทางไหนในโปรเจกต์จริง
          </p>

          <CommandLessonLabAccordion
            labSections={labSections}
            copyStatusByCommand={copyStatusByCommand}
            onCopyCommand={handleCopyCommand}
          />
        </section>
      ) : null}
    </main>
  );
}
