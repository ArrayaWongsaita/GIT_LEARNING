import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { Button } from "@/shared/components/ui/button";

export type CommandCopyStatus = "copied" | "error";

type CommandBlockProps = {
  command: string;
  status?: CommandCopyStatus;
  onCopy: () => void;
};

export function CommandBlock({ command, status, onCopy }: CommandBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const generateHighlightedHtml = async () => {
      try {
        const html = await codeToHtml(command, {
          lang: "bash",
          themes: {
            light: "one-dark-pro",
            dark: "one-dark-pro",
          },
        });
        const blackBackgroundHtml = html
          .replace(/background-color:[^;"]+/g, "background-color:#000")
          .replace(/--shiki-dark-bg:[^;"]+/g, "--shiki-dark-bg:#000");
        if (isActive) {
          setHighlightedHtml(blackBackgroundHtml);
        }
      } catch {
        if (isActive) {
          setHighlightedHtml(null);
        }
      }
    };

    generateHighlightedHtml();

    return () => {
      isActive = false;
    };
  }, [command]);

  return (
    <div className="rounded-xl border border-border bg-card p-3 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Command
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-8 rounded-lg px-3 text-xs font-semibold"
            onClick={onCopy}
            aria-label={`Copy command: ${command}`}
          >
            Copy
          </Button>
          {status === "copied" ? (
            <span
              className="rounded-md bg-primary/12 px-2 py-1 text-xs font-medium text-primary"
              role="status"
              aria-live="polite"
            >
              Copied
            </span>
          ) : null}
          {status === "error" ? (
            <span
              className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive"
              role="status"
              aria-live="polite"
            >
              Copy ไม่สำเร็จ
            </span>
          ) : null}
        </div>
      </div>
      {highlightedHtml ? (
        <div
          className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-black shadow-inner [&_.shiki]:m-0 [&_.shiki]:min-w-max [&_.shiki]:p-4 [&_.shiki]:text-sm [&_.shiki]:leading-7 [&_.shiki]:!bg-black"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-black p-4 text-sm leading-7 text-slate-100 shadow-inner">
          <code>{command}</code>
        </pre>
      )}
    </div>
  );
}
