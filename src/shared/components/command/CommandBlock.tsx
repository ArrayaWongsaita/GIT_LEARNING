import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";

export type CommandCopyStatus = "copied" | "error";

type CommandBlockProps = {
  command: string;
  status?: CommandCopyStatus;
  onCopy: () => void;
  label?: string;
  language?: string;
};

type ShikiModule = typeof import("shiki");

let shikiModulePromise: Promise<ShikiModule> | null = null;

const loadShikiModule = () => {
  if (!shikiModulePromise) {
    shikiModulePromise = import("shiki");
  }
  return shikiModulePromise;
};

export function CommandBlock({
  command,
  status,
  onCopy,
  label = "Command",
  language = "bash",
}: CommandBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const shouldRenderAsPlainText = language === "text";

  useEffect(() => {
    let isActive = true;

    if (shouldRenderAsPlainText) {
      return () => {
        isActive = false;
      };
    }

    const generateHighlightedHtml = async () => {
      try {
        const shiki = await loadShikiModule();
        const codeToHtml = shiki.codeToHtml;
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
  }, [command, language, shouldRenderAsPlainText]);

  return (
    <div className="rounded-xl border border-border bg-card p-3 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-8 rounded-lg px-3 text-xs font-semibold"
            onClick={onCopy}
            aria-label={`Copy ${label.toLowerCase()}: ${command}`}
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
      {!shouldRenderAsPlainText && highlightedHtml ? (
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
