import { CommandBlock, type CommandCopyStatus } from "@/shared/components/command/CommandBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { GIT_ADD_COMMIT_LAB_SECTIONS } from "@/features/basic-git-command/constants/git-add-commit-content.constant";

type GitAddCommitLabAccordionProps = {
  copyStatusByCommand: Record<string, CommandCopyStatus | undefined>;
  onCopyCommand: (commandKey: string, command: string) => Promise<void>;
};

const DIFFICULTY_CLASS_NAME: Record<string, string> = {
  Starter: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  Practice: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  Challenge: "border-amber-500/30 bg-amber-500/10 text-amber-700",
};

export function GitAddCommitLabAccordion({
  copyStatusByCommand,
  onCopyCommand,
}: GitAddCommitLabAccordionProps) {
  return (
    <div className="mt-5 flex flex-col gap-5">
      {GIT_ADD_COMMIT_LAB_SECTIONS.map((section) => (
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
                    <span className="text-base font-semibold text-foreground">{lab.title}</span>
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
