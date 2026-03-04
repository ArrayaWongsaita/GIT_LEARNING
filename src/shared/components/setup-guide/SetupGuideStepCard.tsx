import type { ReactNode } from "react";
import type { SetupGuideImage, SetupGuideLink } from "@/shared/types/setup-guide.type";

type SetupGuideStepCardProps = {
  stepNumber: number;
  title: string;
  purpose: string;
  notes?: string;
  downloadLink?: SetupGuideLink;
  previewImage?: SetupGuideImage;
  children?: ReactNode;
};

export function SetupGuideStepCard({
  stepNumber,
  title,
  purpose,
  notes,
  downloadLink,
  previewImage,
  children,
}: SetupGuideStepCardProps) {
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
          {stepNumber}
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">สำหรับ:</span> {purpose}
          </p>
          {notes ? <p className="mt-1 text-sm text-muted-foreground">{notes}</p> : null}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {downloadLink ? (
          <a
            href={downloadLink.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {downloadLink.label}
          </a>
        ) : null}

        {previewImage ? (
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}

        {children}
      </div>
    </li>
  );
}
