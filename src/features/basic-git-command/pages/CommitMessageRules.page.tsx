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
  GIT_COMMIT_MESSAGE_ADVANCED_COMMANDS,
  GIT_COMMIT_MESSAGE_FORMAT_GUIDE,
  GIT_COMMIT_MESSAGE_RULES,
  GIT_COMMIT_MESSAGE_TYPE_GUIDES,
} from "@/features/basic-git-command/constants/commit-message-rules.constant";

export default function CommitMessageRulesPage() {
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
        badge="Commit Workflow"
        title="Commit Message Rules"
        description="เขียน commit message ให้สม่ำเสมอด้วย Conventional Commits เพื่อให้อ่านประวัติย้อนหลัง, ทำ changelog อัตโนมัติ, และรีวิวงานเร็วขึ้น"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Format Guide</h2>

        <article className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <h3 className="text-base font-bold text-foreground">โครงสร้างมาตรฐาน</h3>
          <div className="mt-2 rounded-lg border border-border bg-black px-3 py-2 font-mono text-sm text-emerald-200">
            {GIT_COMMIT_MESSAGE_FORMAT_GUIDE.syntax}
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">Header:</span>{" "}
            {GIT_COMMIT_MESSAGE_FORMAT_GUIDE.headerDescription}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">Body:</span>{" "}
            {GIT_COMMIT_MESSAGE_FORMAT_GUIDE.bodyDescription}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">Footer:</span>{" "}
            {GIT_COMMIT_MESSAGE_FORMAT_GUIDE.footerDescription}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {GIT_COMMIT_MESSAGE_FORMAT_GUIDE.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Type Catalog</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          เลือก type ให้ตรงงานจริง และเขียน example ให้เฉพาะเจาะจง
        </p>

        <Accordion
          type="single"
          collapsible
          className="mt-3 rounded-xl border border-border bg-muted/20 px-3 md:px-4"
        >
          {GIT_COMMIT_MESSAGE_TYPE_GUIDES.map((guide) => (
            <AccordionItem key={guide.id} value={guide.id}>
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/15 px-2 py-1 font-mono text-xs font-semibold text-primary">
                    {guide.type}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{guide.title}</span>
                </span>
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-3 pb-2">
                  <p className="text-sm leading-6 text-muted-foreground">
                    <span className="font-semibold text-foreground">ใช้เมื่อ:</span>{" "}
                    {guide.whenToUse}
                  </p>

                  <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                      Example
                    </p>
                    <p className="mt-1 break-words font-mono text-sm text-foreground">
                      {guide.example}
                    </p>
                  </div>

                  {guide.antiPattern ? (
                    <div className="rounded-lg border border-rose-500/35 bg-rose-500/10 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                        Avoid
                      </p>
                      <p className="mt-1 break-words font-mono text-sm text-foreground">
                        {guide.antiPattern}
                      </p>
                    </div>
                  ) : null}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Good vs Bad Rules</h2>
        <div className="mt-3 space-y-3">
          {GIT_COMMIT_MESSAGE_RULES.map((rule) => (
            <article key={rule.id} className="rounded-xl border border-border bg-muted/30 p-4">
              <h4 className="text-sm font-semibold text-foreground">{rule.title}</h4>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{rule.description}</p>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Good
                  </p>
                  <p className="mt-1 break-words font-mono text-xs text-foreground">
                    {rule.goodExample}
                  </p>
                </div>
                <div className="rounded-lg border border-rose-500/35 bg-rose-500/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                    Bad
                  </p>
                  <p className="mt-1 break-words font-mono text-xs text-foreground">
                    {rule.badExample}
                  </p>
                </div>
              </div>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                <span className="font-semibold text-foreground">ปรับอย่างไร:</span>{" "}
                {rule.fixHint}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Advanced Commands (Body/Footer)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ตัวอย่างคำสั่งจริงสำหรับ commit ที่มี body/footer และ breaking change
        </p>
        <div className="mt-3 space-y-3">
          {GIT_COMMIT_MESSAGE_ADVANCED_COMMANDS.map((item) => {
            const commandKey = `advanced-${item.id}`;
            const status = copyStatusByCommand[commandKey];

            return (
              <div key={item.id} className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
                <CommandBlock
                  command={item.command}
                  status={status}
                  onCopy={() => handleCopyCommand(commandKey, item.command)}
                />
                <p className="px-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
