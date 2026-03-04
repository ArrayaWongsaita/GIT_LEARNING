import { cn } from "@/shared/lib/utils";
import type { VcsIllustrationKey } from "@/features/introduction/constants/version-control-content.constant";
import type { ReactNode } from "react";

type IllustrationProps = {
  alt: string;
  className?: string;
  children: ReactNode;
};

function IllustrationFrame({ alt, className, children }: IllustrationProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FilesChaosSvg() {
  return (
    <svg viewBox="0 0 360 220" className="h-auto w-full" aria-hidden="true">
      <rect x="8" y="8" width="344" height="204" rx="16" fill="#FFF7ED" />
      <rect x="32" y="38" width="160" height="28" rx="8" fill="#FB923C" />
      <rect x="32" y="78" width="198" height="28" rx="8" fill="#FDBA74" />
      <rect x="32" y="118" width="220" height="28" rx="8" fill="#FED7AA" />
      <rect x="32" y="158" width="176" height="28" rx="8" fill="#FFEDD5" />
      <rect x="232" y="42" width="104" height="140" rx="12" fill="#1E293B" />
      <text x="244" y="72" fontSize="12" fill="#E2E8F0">
        final.docx
      </text>
      <text x="244" y="98" fontSize="12" fill="#E2E8F0">
        final_v2.docx
      </text>
      <text x="244" y="124" fontSize="12" fill="#E2E8F0">
        final_final.docx
      </text>
      <text x="244" y="150" fontSize="12" fill="#E2E8F0">
        final_REAL.docx
      </text>
    </svg>
  );
}

function TeamConflictSvg() {
  return (
    <svg viewBox="0 0 360 220" className="h-auto w-full" aria-hidden="true">
      <rect x="8" y="8" width="344" height="204" rx="16" fill="#F8FAFC" />
      <rect x="36" y="44" width="112" height="132" rx="10" fill="#0EA5E9" />
      <rect x="212" y="44" width="112" height="132" rx="10" fill="#F97316" />
      <rect x="146" y="86" width="68" height="48" rx="10" fill="#111827" />
      <text x="161" y="115" fontSize="20" fill="#F8FAFC">
        !
      </text>
      <path d="M148 108 H112" stroke="#334155" strokeWidth="4" />
      <path d="M212 108 H248" stroke="#334155" strokeWidth="4" />
      <circle cx="92" cy="188" r="10" fill="#0284C7" />
      <circle cx="268" cy="188" r="10" fill="#EA580C" />
    </svg>
  );
}

function CommitCheckpointSvg() {
  return (
    <svg viewBox="0 0 360 220" className="h-auto w-full" aria-hidden="true">
      <rect x="8" y="8" width="344" height="204" rx="16" fill="#ECFEFF" />
      <path d="M40 110 H320" stroke="#0E7490" strokeWidth="6" strokeLinecap="round" />
      <circle cx="88" cy="110" r="16" fill="#0891B2" />
      <circle cx="170" cy="110" r="16" fill="#06B6D4" />
      <circle cx="252" cy="110" r="16" fill="#22D3EE" />
      <text x="74" y="84" fontSize="12" fill="#155E75">
        commit A
      </text>
      <text x="156" y="84" fontSize="12" fill="#155E75">
        commit B
      </text>
      <text x="238" y="84" fontSize="12" fill="#155E75">
        commit C
      </text>
      <rect x="54" y="142" width="252" height="42" rx="10" fill="#0F172A" />
      <text x="68" y="168" fontSize="12" fill="#E2E8F0">
        save point = rollback ได้
      </text>
    </svg>
  );
}

function ConceptMapSvg() {
  return (
    <svg viewBox="0 0 360 220" className="h-auto w-full" aria-hidden="true">
      <rect x="8" y="8" width="344" height="204" rx="16" fill="#F1F5F9" />
      <rect x="135" y="28" width="90" height="32" rx="8" fill="#0F172A" />
      <text x="154" y="48" fontSize="12" fill="#F8FAFC">
        GIT FLOW
      </text>
      <rect x="36" y="90" width="90" height="30" rx="8" fill="#0369A1" />
      <rect x="138" y="90" width="90" height="30" rx="8" fill="#0D9488" />
      <rect x="240" y="90" width="90" height="30" rx="8" fill="#EA580C" />
      <rect x="138" y="152" width="90" height="30" rx="8" fill="#7C3AED" />
      <text x="54" y="110" fontSize="11" fill="#E0F2FE">
        Commit
      </text>
      <text x="161" y="110" fontSize="11" fill="#CCFBF1">
        Branch
      </text>
      <text x="264" y="110" fontSize="11" fill="#FFEDD5">
        Merge
      </text>
      <text x="162" y="172" fontSize="11" fill="#F3E8FF">
        Remote
      </text>
      <path d="M180 60 V90" stroke="#334155" strokeWidth="3" />
      <path d="M126 104 H138" stroke="#334155" strokeWidth="3" />
      <path d="M228 104 H240" stroke="#334155" strokeWidth="3" />
      <path d="M183 120 V152" stroke="#334155" strokeWidth="3" />
    </svg>
  );
}

function LocalVcsSvg() {
  return (
    <svg viewBox="0 0 360 220" className="h-auto w-full" aria-hidden="true">
      <rect x="8" y="8" width="344" height="204" rx="16" fill="#EFF6FF" />
      <rect x="84" y="42" width="192" height="118" rx="14" fill="#1D4ED8" />
      <rect x="104" y="62" width="152" height="78" rx="8" fill="#DBEAFE" />
      <rect x="120" y="172" width="120" height="16" rx="8" fill="#1E3A8A" />
      <text x="137" y="108" fontSize="13" fill="#1E3A8A">
        Local Repo
      </text>
    </svg>
  );
}

function CvcsSvg() {
  return (
    <svg viewBox="0 0 360 220" className="h-auto w-full" aria-hidden="true">
      <rect x="8" y="8" width="344" height="204" rx="16" fill="#F8FAFC" />
      <rect x="144" y="36" width="72" height="92" rx="10" fill="#0F172A" />
      <rect x="42" y="148" width="72" height="42" rx="8" fill="#334155" />
      <rect x="144" y="148" width="72" height="42" rx="8" fill="#334155" />
      <rect x="246" y="148" width="72" height="42" rx="8" fill="#334155" />
      <path d="M78 148 L168 128" stroke="#0EA5E9" strokeWidth="3" />
      <path d="M180 148 V128" stroke="#0EA5E9" strokeWidth="3" />
      <path d="M282 148 L192 128" stroke="#0EA5E9" strokeWidth="3" />
      <text x="152" y="88" fontSize="12" fill="#E2E8F0">
        Server
      </text>
    </svg>
  );
}

function DvcsSvg() {
  return (
    <svg viewBox="0 0 360 220" className="h-auto w-full" aria-hidden="true">
      <rect x="8" y="8" width="344" height="204" rx="16" fill="#ECFDF5" />
      <rect x="34" y="62" width="90" height="98" rx="12" fill="#059669" />
      <rect x="136" y="32" width="90" height="98" rx="12" fill="#10B981" />
      <rect x="238" y="62" width="90" height="98" rx="12" fill="#34D399" />
      <text x="47" y="116" fontSize="11" fill="#D1FAE5">
        repo A
      </text>
      <text x="149" y="86" fontSize="11" fill="#D1FAE5">
        repo B
      </text>
      <text x="251" y="116" fontSize="11" fill="#064E3B">
        repo C
      </text>
      <path d="M124 111 H136" stroke="#065F46" strokeWidth="3" />
      <path d="M226 111 H238" stroke="#065F46" strokeWidth="3" />
      <path d="M181 130 V156" stroke="#065F46" strokeWidth="3" />
      <rect x="146" y="156" width="70" height="30" rx="8" fill="#111827" />
      <text x="161" y="175" fontSize="11" fill="#E5E7EB">
        sync
      </text>
    </svg>
  );
}

function TimelineSvg() {
  return (
    <svg viewBox="0 0 360 220" className="h-auto w-full" aria-hidden="true">
      <rect x="8" y="8" width="344" height="204" rx="16" fill="#FEFCE8" />
      <path d="M34 118 H326" stroke="#A16207" strokeWidth="5" strokeLinecap="round" />
      <circle cx="62" cy="118" r="10" fill="#D97706" />
      <circle cx="118" cy="118" r="10" fill="#D97706" />
      <circle cx="174" cy="118" r="10" fill="#D97706" />
      <circle cx="230" cy="118" r="10" fill="#D97706" />
      <circle cx="286" cy="118" r="10" fill="#D97706" />
      <text x="42" y="98" fontSize="10" fill="#78350F">
        pre-1980
      </text>
      <text x="104" y="98" fontSize="10" fill="#78350F">
        1980s
      </text>
      <text x="160" y="98" fontSize="10" fill="#78350F">
        1990s
      </text>
      <text x="218" y="98" fontSize="10" fill="#78350F">
        2005
      </text>
      <text x="271" y="98" fontSize="10" fill="#78350F">
        Today
      </text>
      <rect x="102" y="148" width="158" height="36" rx="8" fill="#1F2937" />
      <text x="116" y="171" fontSize="11" fill="#F9FAFB">
        Git became global standard
      </text>
    </svg>
  );
}

const ILLUSTRATION_MAP: Record<VcsIllustrationKey, () => ReactNode> = {
  "files-chaos": FilesChaosSvg,
  "team-conflict": TeamConflictSvg,
  "commit-checkpoint": CommitCheckpointSvg,
  "concept-map": ConceptMapSvg,
  "local-vcs": LocalVcsSvg,
  cvcs: CvcsSvg,
  dvcs: DvcsSvg,
  timeline: TimelineSvg,
};

type VcsIllustrationProps = {
  illustration: VcsIllustrationKey;
  alt: string;
  className?: string;
};

export function VcsIllustration({
  illustration,
  alt,
  className,
}: VcsIllustrationProps) {
  const SvgComponent = ILLUSTRATION_MAP[illustration];

  return (
    <IllustrationFrame alt={alt} className={className}>
      <SvgComponent />
    </IllustrationFrame>
  );
}
