import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import { Button } from "@/shared/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import {
  GIT_MERGE_COMMAND_DOCS,
  GIT_MERGE_LAB_STEPS,
  GIT_MERGE_SAFETY_NOTES,
  GIT_MERGE_SIM_INITIAL_BRANCHES,
  GIT_MERGE_SIM_INITIAL_COMMITS,
  GIT_MERGE_SIM_INITIAL_CURRENT_BRANCH,
  GIT_MERGE_SYNTHETIC_HASHES,
  type GitMergeSimulatorBranch,
  type GitMergeSimulatorCommit,
} from "@/features/merge-rebase/constants/git-merge-content.constant";

type TerminalTone =
  | "label"
  | "command"
  | "normal"
  | "current"
  | "success"
  | "warning"
  | "hint";

type TerminalLine = {
  text: string;
  tone: TerminalTone;
};

type GraphLabel = {
  text: string;
  variant: "head" | "main" | "feature" | "other";
};

const LANE_COLOR: Record<0 | 1, string> = {
  0: "#ff2aa5",
  1: "#36d76f",
};

const TERMINAL_TONE_CLASS: Record<TerminalTone, string> = {
  label: "text-slate-400 uppercase tracking-wide",
  command: "text-cyan-300 font-semibold",
  normal: "text-slate-200",
  current: "text-emerald-300 font-semibold",
  success: "text-emerald-300 font-semibold",
  warning: "text-rose-300 font-semibold",
  hint: "text-slate-400",
};

const FAST_FORWARD_COMMAND_IDS = new Set([
  "merge-default",
  "merge-ff-only",
  "status-check",
  "log-check",
]);

const FAST_FORWARD_LAB_STEP_IDS = new Set([
  "lab-step-1",
  "lab-step-2",
  "lab-step-3",
]);

const cloneInitialBranches = () =>
  GIT_MERGE_SIM_INITIAL_BRANCHES.map((branch) => ({ ...branch }));

const cloneInitialCommits = () =>
  GIT_MERGE_SIM_INITIAL_COMMITS.map((commit) => ({ ...commit }));

const waitNextPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });

const getLaneX = (lane: 0 | 1) => (lane === 0 ? 24 : 58);

const getBranchVariant = (branchName: string): GraphLabel["variant"] => {
  if (branchName === "main") {
    return "main";
  }

  if (branchName.startsWith("feature/")) {
    return "feature";
  }

  return "other";
};

const getCurrentCommitHash = (
  branches: GitMergeSimulatorBranch[],
  currentBranch: string,
) => branches.find((branch) => branch.name === currentBranch)?.shortHash;

const buildLabelsByHash = (
  branches: GitMergeSimulatorBranch[],
  currentBranch: string,
) => {
  const labelsByHash = new Map<string, GraphLabel[]>();

  branches.forEach((branch) => {
    const label: GraphLabel =
      currentBranch === branch.name
        ? { text: `HEAD -> ${branch.name}`, variant: "head" }
        : { text: branch.name, variant: getBranchVariant(branch.name) };

    const current = labelsByHash.get(branch.shortHash) ?? [];
    current.push(label);
    labelsByHash.set(branch.shortHash, current);
  });

  labelsByHash.forEach((labels, hash) => {
    const sorted = [...labels].sort((a, b) => {
      const order: Record<GraphLabel["variant"], number> = {
        head: 0,
        main: 1,
        feature: 2,
        other: 3,
      };

      return order[a.variant] - order[b.variant] || a.text.localeCompare(b.text);
    });

    labelsByHash.set(hash, sorted);
  });

  return labelsByHash;
};

const getGraphBadgeClassName = (variant: GraphLabel["variant"]) => {
  if (variant === "head") {
    return "border border-cyan-500/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300";
  }
  if (variant === "main") {
    return "border border-indigo-500/30 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300";
  }
  if (variant === "feature") {
    return "border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }
  return "border border-slate-500/30 bg-slate-500/15 text-slate-700 dark:text-slate-300";
};

const renderBranchListLines = (
  branches: GitMergeSimulatorBranch[],
  currentBranch: string,
): TerminalLine[] =>
  branches.map((branch) => {
    const isCurrent = branch.name === currentBranch;

    return {
      text: `${isCurrent ? "* " : "  "}${branch.name}`,
      tone: isCurrent ? "current" : "normal",
    };
  });

const renderGraphTerminalLines = (
  commits: GitMergeSimulatorCommit[],
  labelsByHash: Map<string, GraphLabel[]>,
): TerminalLine[] =>
  commits.map((commit, index) => {
    const labels = labelsByHash.get(commit.shortHash) ?? [];
    const labelText = labels.length
      ? ` (${labels.map((label) => label.text).join(", ")})`
      : "";

    let prefix = "*";
    if (commit.lane === 1) {
      prefix = "| *";
    } else if (index > 0 && commits[index - 1]?.lane === 1) {
      prefix = "|/";
    }

    return {
      text: `${prefix} ${commit.shortHash} ${commit.message}${labelText}`,
      tone: labels.some((label) => label.variant === "head") ? "current" : "normal",
    };
  });

const renderMergeResultLines = ({
  headline,
  tone,
  branches,
  currentBranch,
  commits,
  labelsByHash,
  mergeInProgress,
  mergeConflictBranch,
}: {
  headline: string;
  tone: TerminalTone;
  branches: GitMergeSimulatorBranch[];
  currentBranch: string;
  commits: GitMergeSimulatorCommit[];
  labelsByHash: Map<string, GraphLabel[]>;
  mergeInProgress: boolean;
  mergeConflictBranch: string | null;
}): TerminalLine[] => {
  const conflictLines: TerminalLine[] = mergeInProgress
    ? [
        {
          text: `CONFLICT: merging from ${mergeConflictBranch ?? "unknown-branch"}`,
          tone: "warning",
        },
        {
          text: "hint: resolve conflicts and commit, or run git merge --abort",
          tone: "hint",
        },
      ]
    : [];

  return [
    { text: headline, tone },
    ...conflictLines,
    { text: "", tone: "normal" },
    { text: "# git branch", tone: "hint" },
    ...renderBranchListLines(branches, currentBranch),
    { text: "", tone: "normal" },
    { text: "# git log --oneline --graph --decorate --all", tone: "hint" },
    ...renderGraphTerminalLines(commits, labelsByHash),
  ];
};

const isAncestorHash = (
  commits: GitMergeSimulatorCommit[],
  ancestorHash: string,
  targetHash: string,
) => {
  if (ancestorHash === targetHash) {
    return true;
  }

  const byId = new Map(commits.map((commit) => [commit.id, commit]));
  let cursor = commits.find((commit) => commit.shortHash === targetHash);

  while (cursor?.parentId) {
    const parent = byId.get(cursor.parentId);
    if (!parent) {
      break;
    }

    if (parent.shortHash === ancestorHash) {
      return true;
    }

    cursor = parent;
  }

  return false;
};

const updateBranchHash = (
  branches: GitMergeSimulatorBranch[],
  branchName: string,
  nextHash: string,
) =>
  branches.map((branch) =>
    branch.name === branchName ? { ...branch, shortHash: nextHash } : branch,
  );

const buildSyntheticHash = (index: number) => {
  const fromPool = GIT_MERGE_SYNTHETIC_HASHES[index];
  if (fromPool) {
    return fromPool;
  }

  return `s${(index + 1).toString(16).padStart(6, "0")}`;
};

export default function GitMergePage() {
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const [simBranches, setSimBranches] = useState<GitMergeSimulatorBranch[]>(
    cloneInitialBranches,
  );
  const [simCommits, setSimCommits] = useState<GitMergeSimulatorCommit[]>(
    cloneInitialCommits,
  );
  const [simCurrentBranch, setSimCurrentBranch] = useState<string>(
    GIT_MERGE_SIM_INITIAL_CURRENT_BRANCH,
  );
  const [simLastCommand, setSimLastCommand] = useState<string>("git switch main");
  const [simMessage, setSimMessage] = useState<string>(
    "เริ่มจาก main แล้วลองเทียบผลของ default merge, ff-only, no-ff, squash และ --abort",
  );
  const [simTerminalHeadline, setSimTerminalHeadline] = useState<string>(
    "พร้อมทดลองคำสั่ง git merge",
  );
  const [simTerminalTone, setSimTerminalTone] = useState<TerminalTone>("hint");
  const [highlightedCommitHash, setHighlightedCommitHash] = useState<
    string | undefined
  >();
  const [simMergeInProgress, setSimMergeInProgress] = useState<boolean>(false);
  const [simMergeConflictBranch, setSimMergeConflictBranch] = useState<string | null>(
    null,
  );

  const copyResetTimerRef = useRef<Record<string, number>>({});
  const syntheticCommitIndexRef = useRef<number>(0);
  const branchChipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const commitRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const headBadgeRef = useRef<HTMLSpanElement | null>(null);
  const commitTableBodyRef = useRef<HTMLTableSectionElement | null>(null);

  const labelsByHash = useMemo(
    () => buildLabelsByHash(simBranches, simCurrentBranch),
    [simBranches, simCurrentBranch],
  );

  const currentCommitHash = useMemo(
    () => getCurrentCommitHash(simBranches, simCurrentBranch),
    [simBranches, simCurrentBranch],
  );

  const simTerminalLines = useMemo(
    () =>
      renderMergeResultLines({
        headline: simTerminalHeadline,
        tone: simTerminalTone,
        branches: simBranches,
        currentBranch: simCurrentBranch,
        commits: simCommits,
        labelsByHash,
        mergeInProgress: simMergeInProgress,
        mergeConflictBranch: simMergeConflictBranch,
      }),
    [
      simTerminalHeadline,
      simTerminalTone,
      simBranches,
      simCurrentBranch,
      simCommits,
      labelsByHash,
      simMergeInProgress,
      simMergeConflictBranch,
    ],
  );

  const visibleCommitIdsKey = useMemo(
    () => simCommits.map((commit) => commit.id).join("|"),
    [simCommits],
  );

  const fastForwardDocs = useMemo(
    () =>
      GIT_MERGE_COMMAND_DOCS.filter((doc) => FAST_FORWARD_COMMAND_IDS.has(doc.id)),
    [],
  );

  const fastForwardLabSteps = useMemo(
    () =>
      GIT_MERGE_LAB_STEPS.filter((step) => FAST_FORWARD_LAB_STEP_IDS.has(step.id)),
    [],
  );

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

  const animateHeadMove = async (targetElement: HTMLElement | null) => {
    const sourceElement = headBadgeRef.current;
    if (!sourceElement || !targetElement) {
      return;
    }

    const fromRect = sourceElement.getBoundingClientRect();
    const toRect = targetElement.getBoundingClientRect();
    const cloneElement = sourceElement.cloneNode(true) as HTMLSpanElement;
    const targetX = toRect.left + toRect.width / 2 - fromRect.left - fromRect.width / 2;
    const targetY = toRect.top + toRect.height / 2 - fromRect.top - fromRect.height / 2;

    cloneElement.style.position = "fixed";
    cloneElement.style.left = `${fromRect.left}px`;
    cloneElement.style.top = `${fromRect.top}px`;
    cloneElement.style.zIndex = "9999";
    cloneElement.style.pointerEvents = "none";

    document.body.appendChild(cloneElement);

    try {
      await animate(cloneElement, {
        translateX: [0, targetX],
        translateY: [0, targetY],
        scale: [1, 1.08, 1],
        opacity: [0.45, 1, 0.25],
        duration: 320,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
    }
  };

  const animateCommitPulse = async (commitHash: string) => {
    const targetRow = commitRowRefs.current[commitHash];
    if (!targetRow) {
      return;
    }

    await animate(targetRow, {
      scale: [1, 1.01, 1],
      duration: 280,
      ease: "outQuad",
    });
  };

  const animateTableRefresh = async () => {
    const tableBody = commitTableBodyRef.current;
    if (!tableBody) {
      return;
    }

    const rows = Array.from(
      tableBody.querySelectorAll<HTMLTableRowElement>("[data-commit-row]"),
    );

    if (!rows.length) {
      return;
    }

    rows.forEach((row) => {
      row.style.opacity = "0";
      row.style.transform = "translateY(6px)";
    });

    try {
      await animate(rows, {
        opacity: [0, 1],
        translateY: [6, 0],
        delay: (_, index) => Math.min(index * 24, 180),
        duration: 240,
        ease: "outQuad",
      });
    } finally {
      rows.forEach((row) => {
        row.style.opacity = "";
        row.style.transform = "";
      });
    }
  };

  useEffect(() => {
    void animateTableRefresh();
  }, [visibleCommitIdsKey]);

  const createSyntheticCommit = (
    message: string,
    parentHash: string,
  ): GitMergeSimulatorCommit | undefined => {
    const parentCommit = simCommits.find((commit) => commit.shortHash === parentHash);
    if (!parentCommit) {
      return undefined;
    }

    const index = syntheticCommitIndexRef.current;
    syntheticCommitIndexRef.current += 1;

    return {
      id: `sim-${index + 1}`,
      shortHash: buildSyntheticHash(index),
      message,
      lane: 0,
      parentId: parentCommit.id,
      author: "Merge Bot",
      dateLabel: `4 Sep 2019 00:${(5 + index).toString().padStart(2, "0")}`,
    };
  };

  const ensureMergeOnMain = () => {
    if (simCurrentBranch === "main") {
      return true;
    }

    setSimTerminalHeadline("error: merge is allowed only on current branch 'main' in this demo");
    setSimTerminalTone("warning");
    setSimMessage("สลับกลับ main ก่อนด้วย git switch main แล้วค่อย merge");
    return false;
  };

  const ensureNoMergeInProgress = () => {
    if (!simMergeInProgress) {
      return true;
    }

    setSimTerminalHeadline("error: you have not concluded your merge (MERGE_HEAD exists)");
    setSimTerminalTone("warning");
    setSimMessage("มี merge ค้างอยู่ ให้กด git merge --abort หรือแก้ conflict ให้เสร็จก่อน");
    return false;
  };

  const runSwitchToBranch = async (targetBranch: string) => {
    setSimLastCommand(`git switch ${targetBranch}`);

    if (!ensureNoMergeInProgress()) {
      return;
    }

    const target = simBranches.find((branch) => branch.name === targetBranch);
    if (!target) {
      setSimTerminalHeadline(`error: branch '${targetBranch}' not found`);
      setSimTerminalTone("warning");
      setSimMessage(`สลับไม่สำเร็จ: ไม่พบ branch ${targetBranch}`);
      return;
    }

    if (simCurrentBranch === targetBranch) {
      setSimTerminalHeadline(`Already on '${targetBranch}'`);
      setSimTerminalTone("hint");
      setSimMessage(`ตอนนี้อยู่ ${targetBranch} อยู่แล้ว`);
      return;
    }

    setSimCurrentBranch(targetBranch);
    setHighlightedCommitHash(target.shortHash);
    setSimTerminalHeadline(`Switched to branch '${targetBranch}'`);
    setSimTerminalTone("success");
    setSimMessage(`สลับไป ${targetBranch} แล้ว`);

    await waitNextPaint();
    await animateHeadMove(
      branchChipRefs.current[targetBranch] ?? commitRowRefs.current[target.shortHash] ?? null,
    );
    await animateCommitPulse(target.shortHash);
  };

  const runSwitchMain = async () => {
    await runSwitchToBranch("main");
  };

  const runMergeDefault = async (sourceBranch: string) => {
    setSimLastCommand(`git merge ${sourceBranch}`);

    if (!ensureNoMergeInProgress()) {
      return;
    }

    if (!ensureMergeOnMain()) {
      return;
    }

    const main = simBranches.find((branch) => branch.name === "main");
    const source = simBranches.find((branch) => branch.name === sourceBranch);

    if (!main || !source) {
      setSimTerminalHeadline(`error: cannot resolve branch '${sourceBranch}'`);
      setSimTerminalTone("warning");
      setSimMessage("merge ไม่สำเร็จ: ไม่พบ branch ที่ต้องการ");
      return;
    }

    if (main.shortHash === source.shortHash) {
      setSimTerminalHeadline("Already up to date.");
      setSimTerminalTone("hint");
      setSimMessage("main และ source branch อยู่จุดเดียวกันแล้ว");
      return;
    }

    if (isAncestorHash(simCommits, main.shortHash, source.shortHash)) {
      const nextBranches = updateBranchHash(simBranches, "main", source.shortHash);
      setSimBranches(nextBranches);
      setSimMergeInProgress(false);
      setSimMergeConflictBranch(null);
      setHighlightedCommitHash(source.shortHash);
      setSimTerminalHeadline(`Updating ${main.shortHash}..${source.shortHash}`);
      setSimTerminalTone("success");
      setSimMessage(`Fast-forward สำเร็จ: main -> ${sourceBranch}`);

      await waitNextPaint();
      await animateHeadMove(commitRowRefs.current[source.shortHash] ?? null);
      await animateCommitPulse(source.shortHash);
      return;
    }

    const mergeCommit = createSyntheticCommit(
      `merge: ${sourceBranch} into main`,
      main.shortHash,
    );

    if (!mergeCommit) {
      setSimTerminalHeadline("error: unable to synthesize merge commit");
      setSimTerminalTone("warning");
      setSimMessage("merge ไม่สำเร็จ: ไม่พบ parent commit ของ main");
      return;
    }

    const nextCommits = [mergeCommit, ...simCommits];
    const nextBranches = updateBranchHash(simBranches, "main", mergeCommit.shortHash);

    setSimCommits(nextCommits);
    setSimBranches(nextBranches);
    setSimMergeInProgress(false);
    setSimMergeConflictBranch(null);
    setHighlightedCommitHash(mergeCommit.shortHash);
    setSimTerminalHeadline("Merge made by the 'ort' strategy.");
    setSimTerminalTone("success");
    setSimMessage(`รวม ${sourceBranch} เข้า main ด้วย merge commit แล้ว`);

    await waitNextPaint();
    await animateHeadMove(commitRowRefs.current[mergeCommit.shortHash] ?? null);
    await animateCommitPulse(mergeCommit.shortHash);
  };

  const runMergeFfOnly = async (sourceBranch: string) => {
    setSimLastCommand(`git merge --ff-only ${sourceBranch}`);

    if (!ensureNoMergeInProgress()) {
      return;
    }

    if (!ensureMergeOnMain()) {
      return;
    }

    const main = simBranches.find((branch) => branch.name === "main");
    const source = simBranches.find((branch) => branch.name === sourceBranch);

    if (!main || !source) {
      setSimTerminalHeadline(`error: cannot resolve branch '${sourceBranch}'`);
      setSimTerminalTone("warning");
      setSimMessage("ff-only ไม่สำเร็จ: ไม่พบ branch ที่ต้องการ");
      return;
    }

    if (main.shortHash === source.shortHash) {
      setSimTerminalHeadline("Already up to date.");
      setSimTerminalTone("hint");
      setSimMessage("ff-only ไม่เปลี่ยนแปลงเพราะทั้งสอง branch อยู่จุดเดียวกันแล้ว");
      return;
    }

    const canFastForward = isAncestorHash(simCommits, main.shortHash, source.shortHash);
    if (!canFastForward) {
      setSimTerminalHeadline("fatal: Not possible to fast-forward, aborting.");
      setSimTerminalTone("warning");
      setSimMessage("ff-only ถูกบล็อก: main ไม่ได้เป็น ancestor ของ branch ต้นทาง");
      return;
    }

    const nextBranches = updateBranchHash(simBranches, "main", source.shortHash);
    setSimBranches(nextBranches);
    setSimMergeInProgress(false);
    setSimMergeConflictBranch(null);
    setHighlightedCommitHash(source.shortHash);
    setSimTerminalHeadline(`Fast-forward ${main.shortHash} -> ${source.shortHash}`);
    setSimTerminalTone("success");
    setSimMessage(`ff-only สำเร็จ: main ขยับไป ${sourceBranch}`);

    await waitNextPaint();
    await animateHeadMove(commitRowRefs.current[source.shortHash] ?? null);
    await animateCommitPulse(source.shortHash);
  };

  const runMergeNoFf = async (sourceBranch: string) => {
    setSimLastCommand(`git merge --no-ff ${sourceBranch}`);

    if (!ensureNoMergeInProgress()) {
      return;
    }

    if (!ensureMergeOnMain()) {
      return;
    }

    const main = simBranches.find((branch) => branch.name === "main");
    const source = simBranches.find((branch) => branch.name === sourceBranch);

    if (!main || !source) {
      setSimTerminalHeadline(`error: cannot resolve branch '${sourceBranch}'`);
      setSimTerminalTone("warning");
      setSimMessage("no-ff ไม่สำเร็จ: ไม่พบ branch ที่ต้องการ");
      return;
    }

    if (main.shortHash === source.shortHash) {
      setSimTerminalHeadline("Already up to date.");
      setSimTerminalTone("hint");
      setSimMessage("no-ff ไม่เปลี่ยนแปลงเพราะไม่มี commit ใหม่ให้รวม");
      return;
    }

    const mergeCommit = createSyntheticCommit(
      `merge: ${sourceBranch} into main (--no-ff)`,
      main.shortHash,
    );

    if (!mergeCommit) {
      setSimTerminalHeadline("error: unable to synthesize --no-ff commit");
      setSimTerminalTone("warning");
      setSimMessage("no-ff ไม่สำเร็จ: ไม่พบ parent commit ของ main");
      return;
    }

    const nextCommits = [mergeCommit, ...simCommits];
    const nextBranches = updateBranchHash(simBranches, "main", mergeCommit.shortHash);

    setSimCommits(nextCommits);
    setSimBranches(nextBranches);
    setSimMergeInProgress(false);
    setSimMergeConflictBranch(null);
    setHighlightedCommitHash(mergeCommit.shortHash);
    setSimTerminalHeadline("Merge made by the 'ort' strategy (forced no-ff).");
    setSimTerminalTone("success");
    setSimMessage("no-ff สำเร็จ: main ได้ merge commit ใหม่แม้ fast-forward ได้");

    await waitNextPaint();
    await animateHeadMove(commitRowRefs.current[mergeCommit.shortHash] ?? null);
    await animateCommitPulse(mergeCommit.shortHash);
  };

  const runMergeSquash = async (sourceBranch: string) => {
    setSimLastCommand(`git merge --squash ${sourceBranch}`);

    if (!ensureNoMergeInProgress()) {
      return;
    }

    if (!ensureMergeOnMain()) {
      return;
    }

    const main = simBranches.find((branch) => branch.name === "main");
    const source = simBranches.find((branch) => branch.name === sourceBranch);

    if (!main || !source) {
      setSimTerminalHeadline(`error: cannot resolve branch '${sourceBranch}'`);
      setSimTerminalTone("warning");
      setSimMessage("squash ไม่สำเร็จ: ไม่พบ branch ที่ต้องการ");
      return;
    }

    if (main.shortHash === source.shortHash) {
      setSimTerminalHeadline("Already up to date.");
      setSimTerminalTone("hint");
      setSimMessage("squash ไม่เปลี่ยนแปลงเพราะไม่มี diff ใหม่จาก source branch");
      return;
    }

    const squashCommit = createSyntheticCommit(
      `feat(payment): squash merge ${sourceBranch}`,
      main.shortHash,
    );

    if (!squashCommit) {
      setSimTerminalHeadline("error: unable to synthesize squash commit");
      setSimTerminalTone("warning");
      setSimMessage("squash ไม่สำเร็จ: ไม่พบ parent commit ของ main");
      return;
    }

    const nextCommits = [squashCommit, ...simCommits];
    const nextBranches = updateBranchHash(simBranches, "main", squashCommit.shortHash);

    setSimCommits(nextCommits);
    setSimBranches(nextBranches);
    setSimMergeInProgress(false);
    setSimMergeConflictBranch(null);
    setHighlightedCommitHash(squashCommit.shortHash);
    setSimTerminalHeadline("Squash merge applied. Commit synthesized on main.");
    setSimTerminalTone("success");
    setSimMessage("squash สำเร็จ: main ได้ commit เดียว และ feature/payment ยังชี้ hash เดิม");

    await waitNextPaint();
    await animateHeadMove(commitRowRefs.current[squashCommit.shortHash] ?? null);
    await animateCommitPulse(squashCommit.shortHash);
  };

  const runMergeConflictDemo = async (sourceBranch: string) => {
    setSimLastCommand(`git merge ${sourceBranch}`);

    if (!ensureNoMergeInProgress()) {
      return;
    }

    if (!ensureMergeOnMain()) {
      return;
    }

    const source = simBranches.find((branch) => branch.name === sourceBranch);
    if (!source) {
      setSimTerminalHeadline(`error: cannot resolve branch '${sourceBranch}'`);
      setSimTerminalTone("warning");
      setSimMessage("เริ่ม merge conflict demo ไม่สำเร็จ: ไม่พบ branch ที่ต้องการ");
      return;
    }

    setSimMergeInProgress(true);
    setSimMergeConflictBranch(sourceBranch);
    setHighlightedCommitHash(source.shortHash);
    setSimTerminalHeadline("Auto-merging payment.ts\nCONFLICT (content): Merge conflict in payment.ts");
    setSimTerminalTone("warning");
    setSimMessage(`เกิด conflict จาก ${sourceBranch} แล้ว: กด git merge --abort เพื่อยกเลิกได้ทันที`);

    await waitNextPaint();
    await animateCommitPulse(source.shortHash);
  };

  const runMergeAbort = async () => {
    setSimLastCommand("git merge --abort");

    if (!simMergeInProgress) {
      setSimTerminalHeadline("fatal: There is no merge to abort (MERGE_HEAD missing).");
      setSimTerminalTone("warning");
      setSimMessage("ยังไม่มี merge ค้างอยู่ จึง abort ไม่ได้");
      return;
    }

    setSimMergeInProgress(false);
    setSimMergeConflictBranch(null);
    setSimTerminalHeadline("Merge aborted.");
    setSimTerminalTone("success");
    setSimMessage("ยกเลิก merge ที่ค้างอยู่และกลับสถานะก่อนเริ่ม merge แล้ว");

    const activeHash = getCurrentCommitHash(simBranches, simCurrentBranch);
    setHighlightedCommitHash(activeHash);

    if (!activeHash) {
      return;
    }

    await waitNextPaint();
    await animateCommitPulse(activeHash);
  };

  const resetSimulator = () => {
    setSimBranches(cloneInitialBranches());
    setSimCommits(cloneInitialCommits());
    setSimCurrentBranch(GIT_MERGE_SIM_INITIAL_CURRENT_BRANCH);
    setSimLastCommand("Reset Demo");
    setSimTerminalHeadline("พร้อมทดลองคำสั่ง git merge");
    setSimTerminalTone("hint");
    setSimMessage("รีเซ็ต simulator กลับค่าเริ่มต้นแล้ว");
    setHighlightedCommitHash(undefined);
    setSimMergeInProgress(false);
    setSimMergeConflictBranch(null);
    syntheticCommitIndexRef.current = 0;
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SetupGuideHeader
        badge="Merge & Rebase"
        title="git merge: รวม Branch หลายโหมดให้ควบคุมประวัติได้"
        description="ทดลองโหมดสำคัญของ merge ได้แก่ default, --ff-only, --no-ff, --squash และการยกเลิกด้วย --abort เพื่อเข้าใจผลต่อ branch pointer และ graph"
      />

      <Accordion
        type="multiple"
        defaultValue={["fast-forward-merge", "interactive-merge-simulator"]}
        className="space-y-3"
      >
        <AccordionItem value="command-explanation" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Command Explanation
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Command Explanation
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                คำสั่งหลักสำหรับ merge ที่ใช้จริงเวลาจัดการประวัติ branch ในทีม
              </p>

              <div className="mt-4 space-y-4">
                {GIT_MERGE_COMMAND_DOCS.map((doc) => {
                  const commandKey = `doc-${doc.id}`;
                  const status = copyStatusByCommand[commandKey];

                  return (
                    <article
                      key={doc.id}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <h3 className="text-base font-bold text-foreground">{doc.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        <span className="font-semibold text-foreground">สำหรับ:</span>{" "}
                        {doc.purpose}
                      </p>
                      <div className="mt-3">
                        <CommandBlock
                          command={doc.command}
                          status={status}
                          onCopy={() => handleCopyCommand(commandKey, doc.command)}
                        />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {doc.description}
                      </p>
                      {doc.notes?.length ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {doc.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fast-forward-merge" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Fast-forward Merge
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Fast-forward Merge
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                โฟกัสเฉพาะ flow ของ ff-only ตั้งแต่การตรวจเงื่อนไขจนถึงยืนยันผลบน graph
              </p>

              <div className="mt-4 space-y-4">
                {fastForwardDocs.map((doc) => {
                  const commandKey = `ff-doc-${doc.id}`;
                  const status = copyStatusByCommand[commandKey];

                  return (
                    <article
                      key={doc.id}
                      className="rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <h3 className="text-base font-bold text-foreground">{doc.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        <span className="font-semibold text-foreground">สำหรับ:</span>{" "}
                        {doc.purpose}
                      </p>
                      <div className="mt-3">
                        <CommandBlock
                          command={doc.command}
                          status={status}
                          onCopy={() => handleCopyCommand(commandKey, doc.command)}
                        />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {doc.description}
                      </p>
                    </article>
                  );
                })}
              </div>

              <div className="mt-6">
                <h3 className="text-base font-bold text-foreground">FF-only Mini Flow</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  ทำตาม 3 ขั้นตอนนี้เพื่อทดสอบ fast-forward merge แบบครบลูป
                </p>

                <ol className="mt-4 space-y-4">
                  {fastForwardLabSteps.map((step, stepIndex) => (
                    <li key={step.id} className="rounded-xl border border-border bg-muted/30 p-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                          {stepIndex + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-foreground">{step.title}</h4>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            <span className="font-semibold text-foreground">Task:</span>{" "}
                            {step.task}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {step.commands.map((commandItem, commandIndex) => {
                          const commandKey = `ff-lab-${step.id}-${commandIndex}`;
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

                      <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          Checkpoint
                        </p>
                        <p className="mt-1 text-sm text-foreground">{step.checkpoint}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="interactive-merge-simulator" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Interactive Merge Simulator
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Interactive Merge Simulator
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                ลองกดคำสั่งชุดเดียวกันบน graph เดิม แล้วสังเกตความต่างของ pointer เมื่อใช้
                ff-only, no-ff, squash และ abort
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void runSwitchMain();
                  }}
                >
                  git switch main
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void runMergeDefault("feature/login");
                  }}
                >
                  git merge feature/login
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void runMergeConflictDemo("feature/payment");
                  }}
                >
                  git merge feature/payment (conflict)
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void runMergeFfOnly("feature/login");
                  }}
                >
                  git merge --ff-only feature/login
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void runMergeNoFf("feature/login");
                  }}
                >
                  git merge --no-ff feature/login
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void runMergeSquash("feature/payment");
                  }}
                >
                  git merge --squash feature/payment
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void runMergeAbort();
                  }}
                >
                  git merge --abort
                </Button>
                <Button type="button" variant="outline" onClick={resetSimulator}>
                  Reset Demo
                </Button>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-[#3b3b3b] bg-[#1f1f1f] text-slate-100">
                <div className="border-b border-[#3b3b3b] p-3">
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      ref={headBadgeRef}
                      className="rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300"
                    >
                      HEAD
                    </span>
                    {simBranches.map((branch) => {
                      const isCurrent = simCurrentBranch === branch.name;

                      return (
                        <button
                          key={branch.name}
                          type="button"
                          ref={(el) => {
                            branchChipRefs.current[branch.name] = el;
                          }}
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isCurrent
                              ? "border border-cyan-500/30 bg-cyan-500/15 text-cyan-300"
                              : "border border-[#555] bg-[#2b2b2b] text-slate-200"
                          }`}
                          onClick={() => {
                            void runSwitchToBranch(branch.name);
                          }}
                        >
                          {branch.name}
                        </button>
                      );
                    })}
                  </div>
                  {simMergeInProgress ? (
                    <div className="mt-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                      Merge in progress จาก {simMergeConflictBranch}. ตอนนี้สามารถกด{" "}
                      <span className="font-semibold text-rose-100">
                        git merge --abort
                      </span>{" "}
                      เพื่อยกเลิกได้
                    </div>
                  ) : null}
                </div>

                <div className="max-h-[520px] overflow-auto">
                  <table className="w-full min-w-[980px] table-fixed text-sm">
                    <thead className="sticky top-0 z-10 bg-[#262626] text-slate-200">
                      <tr>
                        <th className="w-[130px] border-b border-r border-[#3b3b3b] px-3 py-2 text-left font-semibold">
                          Graph
                        </th>
                        <th className="border-b border-r border-[#3b3b3b] px-3 py-2 text-left font-semibold">
                          Description
                        </th>
                        <th className="w-[150px] border-b border-r border-[#3b3b3b] px-3 py-2 text-left font-semibold">
                          Date
                        </th>
                        <th className="w-[150px] border-b border-r border-[#3b3b3b] px-3 py-2 text-left font-semibold">
                          Author
                        </th>
                        <th className="w-[110px] border-b border-[#3b3b3b] px-3 py-2 text-left font-semibold">
                          Commit
                        </th>
                      </tr>
                    </thead>

                    <tbody ref={commitTableBodyRef}>
                      {simCommits.map((commit, index) => {
                        const labels = labelsByHash.get(commit.shortHash) ?? [];
                        const isCurrent = commit.shortHash === currentCommitHash;
                        const isHighlighted = commit.shortHash === highlightedCommitHash;

                        const child = index > 0 ? simCommits[index - 1] : undefined;
                        const childX = child ? getLaneX(child.lane) : undefined;
                        const parent = commit.parentId
                          ? simCommits.find((item) => item.id === commit.parentId)
                          : undefined;
                        const parentX = parent ? getLaneX(parent.lane) : undefined;
                        const currentX = getLaneX(commit.lane);

                        return (
                          <tr
                            key={commit.id}
                            data-commit-row
                            ref={(el) => {
                              commitRowRefs.current[commit.shortHash] = el;
                            }}
                            className={`border-b border-[#2f2f2f] transition-colors hover:bg-[#2b2b2b] ${
                              isCurrent ? "bg-[#27323a]" : ""
                            } ${isHighlighted ? "ring-1 ring-inset ring-amber-400/40" : ""}`}
                          >
                            <td className="border-r border-[#3b3b3b] px-2 py-1 align-middle">
                              <svg
                                width="90"
                                height="44"
                                viewBox="0 0 90 44"
                                className="block"
                                aria-hidden="true"
                              >
                                {childX !== undefined ? (
                                  <line
                                    x1={childX}
                                    y1="0"
                                    x2={currentX}
                                    y2="22"
                                    stroke={child ? LANE_COLOR[child.lane] : LANE_COLOR[commit.lane]}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                ) : null}
                                {parentX !== undefined ? (
                                  <line
                                    x1={currentX}
                                    y1="22"
                                    x2={parentX}
                                    y2="44"
                                    stroke={LANE_COLOR[commit.lane]}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                ) : null}
                                <circle
                                  cx={currentX}
                                  cy="22"
                                  r={isCurrent ? "6.5" : "5.5"}
                                  fill={LANE_COLOR[commit.lane]}
                                  stroke={isHighlighted ? "#fde047" : "#0f172a"}
                                  strokeWidth={isHighlighted ? "2.5" : "1.5"}
                                />
                              </svg>
                            </td>

                            <td className="border-r border-[#3b3b3b] px-3 py-2 align-middle">
                              <div className="flex flex-wrap gap-1">
                                {labels.map((label) => (
                                  <span
                                    key={`${commit.id}-${label.text}`}
                                    className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${getGraphBadgeClassName(
                                      label.variant,
                                    )}`}
                                  >
                                    {label.text}
                                  </span>
                                ))}
                              </div>
                              <p className="mt-1 truncate text-sm text-slate-100">
                                {commit.message}
                              </p>
                            </td>

                            <td className="border-r border-[#3b3b3b] px-3 py-2 align-middle text-slate-300">
                              {commit.dateLabel}
                            </td>
                            <td className="border-r border-[#3b3b3b] px-3 py-2 align-middle text-slate-300">
                              {commit.author}
                            </td>
                            <td className="px-3 py-2 align-middle font-mono text-slate-200">
                              {commit.shortHash}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-black p-4 font-mono text-sm shadow-inner">
                <p className={`text-xs ${TERMINAL_TONE_CLASS.label}`}>Last command</p>
                <p className={`mt-1 ${TERMINAL_TONE_CLASS.command}`}>{simLastCommand}</p>

                <p className={`mt-4 text-xs ${TERMINAL_TONE_CLASS.label}`}>Simulator message</p>
                <p className={`mt-1 ${TERMINAL_TONE_CLASS.normal}`}>{simMessage}</p>

                <div className="mt-4 border-t border-slate-700 pt-4">
                  <p className={`text-xs ${TERMINAL_TONE_CLASS.label}`}>Terminal output</p>
                  <div className="mt-2 space-y-1">
                    {simTerminalLines.map((line, index) => (
                      <p
                        key={`${line.text}-${index}`}
                        className={`whitespace-pre leading-6 ${TERMINAL_TONE_CLASS[line.tone]}`}
                      >
                        {line.text || " "}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="safety-notes" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Safety Notes
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <h2 className="text-xl font-black tracking-tight text-foreground">Safety Notes</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                ก่อน merge จริงควรล็อก branch เป้าหมายและ policy ให้ชัด เพื่อลดการ rewrite
                ประวัติที่ไม่ตั้งใจ
              </p>
              <ul className="mt-4 list-disc space-y-2 rounded-xl border border-border bg-muted/30 p-4 pl-8 text-sm leading-6 text-foreground">
                {GIT_MERGE_SAFETY_NOTES.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mini-lab" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Mini Lab
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
              <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                ทำตามลำดับนี้เพื่อเห็นผลต่างของ ff-only, no-ff และ squash แบบจับต้องได้ใน
                repo ทดลอง
              </p>

              <ol className="mt-4 space-y-4">
                {GIT_MERGE_LAB_STEPS.map((step, stepIndex) => (
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
