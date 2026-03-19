import { CommandBlock, type CommandCopyStatus } from "@/shared/components/command/CommandBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { FeatureToDevFlowLabSection } from "@/features/lab/constants/feature-to-dev-flow-content.constant";

type FeatureToDevFlowLabAccordionProps = {
  labSections: FeatureToDevFlowLabSection[];
  copyStatusByCommand: Record<string, CommandCopyStatus | undefined>;
  onCopyCommand: (commandKey: string, command: string) => Promise<void>;
};

export function FeatureToDevFlowLabAccordion({
  labSections,
  copyStatusByCommand,
  onCopyCommand,
}: FeatureToDevFlowLabAccordionProps) {
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
                    <span className="text-base font-semibold text-foreground">{lab.title}</span>
                    <span className="text-sm font-normal leading-6 text-muted-foreground">
                      {lab.summary}
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
                        Focus: {lab.focus}
                      </span>
                      <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold tracking-wide text-foreground">
                        {lab.sourceBranch} -&gt; {lab.targetBranch}
                      </span>
                    </span>
                  </span>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="flex flex-col gap-4 pb-2">
                    <div
                      className={`grid gap-3 ${
                        lab.prTitle ? "md:grid-cols-3" : "md:grid-cols-2"
                      }`}
                    >
                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          Source Branch
                        </p>
                        <p className="mt-1 break-words font-mono text-sm text-foreground">
                          {lab.sourceBranch}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          Target Branch
                        </p>
                        <p className="mt-1 break-words font-mono text-sm text-foreground">
                          {lab.targetBranch}
                        </p>
                      </div>
                      {lab.prTitle ? (
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                            PR Title
                          </p>
                          <p className="mt-1 text-sm text-foreground">{lab.prTitle}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Task
                      </p>
                      <p className="mt-1 text-sm leading-6 text-foreground">{lab.task}</p>
                    </div>

                    {lab.commandGroups.map((group) => (
                      <div
                        key={group.id}
                        className="rounded-xl border border-border bg-background/80 p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {group.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-foreground">
                          {group.summary}
                        </p>

                        <div className="mt-3 flex flex-col gap-3">
                          {group.commands.map((commandItem, commandIndex) => {
                            const commandKey = `feature-to-dev-${lab.id}-${group.id}-${commandIndex}`;
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
                      </div>
                    ))}

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
