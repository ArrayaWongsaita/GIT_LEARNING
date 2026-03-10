import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import { Button } from "@/shared/components/ui/button";
import {
  GIT_SWITCH_COMMAND_DOCS,
  GIT_SWITCH_LAB_STEPS,
  GIT_SWITCH_SAFETY_NOTES,
  GIT_SWITCH_SIM_INITIAL_BRANCHES,
  GIT_SWITCH_SIM_INITIAL_COMMITS,
  GIT_SWITCH_SIM_INITIAL_CURRENT_REF,
  GIT_SWITCH_SIM_INITIAL_PREVIOUS_BRANCH,
  GIT_SWITCH_SIM_REMOTE_BRANCHES,
  type GitSwitchRefState,
  type GitSwitchSimulatorBranch,
  type GitSwitchSimulatorCommit,
} from "@/features/branching/constants/git-switch-content.constant";

type TerminalTone =
  | "label"
  | "command"
  | "normal"
  | "current"
  | "success"
  | "warning"
  | "hint"
  | "detached";

type TerminalLine = {
  text: string;
  tone: TerminalTone;
};

type GraphLabel = {
  text: string;
  variant: "head" | "main" | "feature" | "remote" | "other" | "detached";
};

type BranchFilterOption = {
  value: string;
  label: string;
  isRemote: boolean;
};

const ALL_BRANCH_FILTER = "__all__";

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
  detached: "text-violet-300 font-semibold",
};

const cloneInitialBranches = () =>
  GIT_SWITCH_SIM_INITIAL_BRANCHES.map((branch) => ({ ...branch }));

const cloneInitialCommits = () =>
  GIT_SWITCH_SIM_INITIAL_COMMITS.map((commit) => ({ ...commit }));

const cloneInitialRef = (): GitSwitchRefState =>
  GIT_SWITCH_SIM_INITIAL_CURRENT_REF.kind === "branch"
    ? {
        kind: "branch",
        branchName: GIT_SWITCH_SIM_INITIAL_CURRENT_REF.branchName,
      }
    : {
        kind: "detached",
        commitHash: GIT_SWITCH_SIM_INITIAL_CURRENT_REF.commitHash,
      };

const waitNextPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });

const getLaneX = (lane: 0 | 1) => (lane === 0 ? 24 : 58);

const getCurrentCommitHash = (
  branches: GitSwitchSimulatorBranch[],
  currentRef: GitSwitchRefState,
) => {
  if (currentRef.kind === "detached") {
    return currentRef.commitHash;
  }

  return branches.find((branch) => branch.name === currentRef.branchName)?.shortHash;
};

const getBranchVariant = (branchName: string): GraphLabel["variant"] => {
  if (branchName === "main") {
    return "main";
  }
  if (branchName.startsWith("feature/")) {
    return "feature";
  }
  return "other";
};

const resolveRemoteBranchHash = (
  remoteRef: string,
  branches: GitSwitchSimulatorBranch[],
) => {
  if (!remoteRef.startsWith("remotes/origin/")) {
    return undefined;
  }

  const localName = remoteRef.replace("remotes/origin/", "");
  return branches.find((branch) => branch.name === localName)?.shortHash;
};

const getBranchFilterOptions = (
  branches: GitSwitchSimulatorBranch[],
  showRemoteBranches: boolean,
): BranchFilterOption[] => {
  const baseOptions: BranchFilterOption[] = [
    {
      value: ALL_BRANCH_FILTER,
      label: "Show All",
      isRemote: false,
    },
  ];

  const localOptions = branches.map((branch) => ({
    value: branch.name,
    label: branch.name,
    isRemote: false,
  }));

  const remoteOptions = showRemoteBranches
    ? GIT_SWITCH_SIM_REMOTE_BRANCHES.map((remoteBranch) => ({
        value: remoteBranch,
        label: remoteBranch,
        isRemote: true,
      }))
    : [];

  return [...baseOptions, ...localOptions, ...remoteOptions];
};

const resolveFilterHeadHash = (
  selectedBranchFilter: string,
  branches: GitSwitchSimulatorBranch[],
  showRemoteBranches: boolean,
) => {
  if (selectedBranchFilter === ALL_BRANCH_FILTER) {
    return undefined;
  }

  if (selectedBranchFilter.startsWith("remotes/")) {
    if (!showRemoteBranches) {
      return undefined;
    }
    return resolveRemoteBranchHash(selectedBranchFilter, branches);
  }

  return branches.find((branch) => branch.name === selectedBranchFilter)?.shortHash;
};

const getVisibleCommits = (
  commits: GitSwitchSimulatorCommit[],
  filterHeadHash: string | undefined,
) => {
  if (!filterHeadHash) {
    return commits;
  }

  const byId = new Map(commits.map((commit) => [commit.id, commit]));
  const startCommit = commits.find((commit) => commit.shortHash === filterHeadHash);
  if (!startCommit) {
    return commits;
  }

  const chainIds = new Set<string>();
  let cursor: GitSwitchSimulatorCommit | undefined = startCommit;

  while (cursor) {
    chainIds.add(cursor.id);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  return commits.filter((commit) => chainIds.has(commit.id));
};

const buildLabelsByHash = (
  branches: GitSwitchSimulatorBranch[],
  currentRef: GitSwitchRefState,
  showRemoteBranches: boolean,
) => {
  const labelsByHash = new Map<string, GraphLabel[]>();

  branches.forEach((branch) => {
    const label: GraphLabel =
      currentRef.kind === "branch" && currentRef.branchName === branch.name
        ? { text: `HEAD -> ${branch.name}`, variant: "head" }
        : { text: branch.name, variant: getBranchVariant(branch.name) };

    const current = labelsByHash.get(branch.shortHash) ?? [];
    current.push(label);
    labelsByHash.set(branch.shortHash, current);
  });

  if (showRemoteBranches) {
    GIT_SWITCH_SIM_REMOTE_BRANCHES.forEach((remoteRef) => {
      const remoteHash = resolveRemoteBranchHash(remoteRef, branches);
      if (!remoteHash) {
        return;
      }

      const current = labelsByHash.get(remoteHash) ?? [];
      current.push({
        text: remoteRef.replace("remotes/", ""),
        variant: "remote",
      });
      labelsByHash.set(remoteHash, current);
    });
  }

  if (currentRef.kind === "detached") {
    const detachedLabels = labelsByHash.get(currentRef.commitHash) ?? [];
    detachedLabels.unshift({ text: "HEAD (detached)", variant: "detached" });
    labelsByHash.set(currentRef.commitHash, detachedLabels);
  }

  labelsByHash.forEach((labels, hash) => {
    const sorted = [...labels].sort((a, b) => {
      const order: Record<GraphLabel["variant"], number> = {
        head: 0,
        detached: 1,
        main: 2,
        feature: 3,
        remote: 4,
        other: 5,
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
  if (variant === "detached") {
    return "border border-violet-500/30 bg-violet-500/15 text-violet-700 dark:text-violet-300";
  }
  if (variant === "main") {
    return "border border-indigo-500/30 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300";
  }
  if (variant === "feature") {
    return "border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }
  if (variant === "remote") {
    return "border border-lime-500/30 bg-lime-500/15 text-lime-700 dark:text-lime-300";
  }
  return "border border-slate-500/30 bg-slate-500/15 text-slate-700 dark:text-slate-300";
};

const renderBranchListLines = (
  branches: GitSwitchSimulatorBranch[],
  currentRef: GitSwitchRefState,
  showRemoteBranches: boolean,
): TerminalLine[] => {
  const lines: TerminalLine[] = [];

  if (currentRef.kind === "detached") {
    lines.push({
      text: `* (HEAD detached at ${currentRef.commitHash})`,
      tone: "detached",
    });
  }

  branches.forEach((branch) => {
    const isCurrent =
      currentRef.kind === "branch" && currentRef.branchName === branch.name;
    lines.push({
      text: `${isCurrent ? "* " : "  "}${branch.name}`,
      tone: isCurrent ? "current" : "normal",
    });
  });

  if (showRemoteBranches) {
    lines.push({ text: "", tone: "normal" });
    lines.push({ text: "# remote branches", tone: "hint" });
    GIT_SWITCH_SIM_REMOTE_BRANCHES.forEach((remoteRef) => {
      lines.push({
        text: `  ${remoteRef}`,
        tone: "hint",
      });
    });
  }

  return lines;
};

const renderGraphTerminalLines = (
  commits: GitSwitchSimulatorCommit[],
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

const renderSwitchResultLines = ({
  headline,
  tone,
  branches,
  currentRef,
  commits,
  showRemoteBranches,
  labelsByHash,
}: {
  headline: string;
  tone: TerminalTone;
  branches: GitSwitchSimulatorBranch[];
  currentRef: GitSwitchRefState;
  commits: GitSwitchSimulatorCommit[];
  showRemoteBranches: boolean;
  labelsByHash: Map<string, GraphLabel[]>;
}): TerminalLine[] => [
  { text: headline, tone },
  { text: "", tone: "normal" },
  { text: "# git branch", tone: "hint" },
  ...renderBranchListLines(branches, currentRef, showRemoteBranches),
  { text: "", tone: "normal" },
  { text: "# git log --oneline --graph --decorate --all", tone: "hint" },
  ...renderGraphTerminalLines(commits, labelsByHash),
];

const resolveHeadTildeOneHash = (
  commits: GitSwitchSimulatorCommit[],
  currentHash: string | undefined,
) => {
  if (!currentHash) {
    return undefined;
  }

  const currentCommit = commits.find((commit) => commit.shortHash === currentHash);
  if (!currentCommit?.parentId) {
    return undefined;
  }

  return commits.find((commit) => commit.id === currentCommit.parentId)?.shortHash;
};

export default function GitSwitchPage() {
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const [simBranches, setSimBranches] = useState<GitSwitchSimulatorBranch[]>(
    cloneInitialBranches,
  );
  const [simCurrentRef, setSimCurrentRef] = useState<GitSwitchRefState>(cloneInitialRef);
  const [simPreviousBranch, setSimPreviousBranch] = useState<string | null>(
    GIT_SWITCH_SIM_INITIAL_PREVIOUS_BRANCH,
  );
  const [simLastCommand, setSimLastCommand] = useState<string>(
    "git switch feature/login",
  );
  const [simMessage, setSimMessage] = useState<string>(
    "ลองสลับ branch จากปุ่มด้านล่างเพื่อเห็นการย้าย HEAD และ graph pointer",
  );
  const [simTerminalHeadline, setSimTerminalHeadline] = useState<string>(
    "พร้อมทดลองคำสั่ง git switch",
  );
  const [simTerminalTone, setSimTerminalTone] = useState<TerminalTone>("hint");
  const [highlightedCommitHash, setHighlightedCommitHash] = useState<
    string | undefined
  >();
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(
    ALL_BRANCH_FILTER,
  );
  const [showRemoteBranches, setShowRemoteBranches] = useState<boolean>(true);

  const simCommits = useMemo(cloneInitialCommits, []);
  const copyResetTimerRef = useRef<Record<string, number>>({});
  const branchChipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const commitRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const headBadgeRef = useRef<HTMLSpanElement | null>(null);
  const commitTableBodyRef = useRef<HTMLTableSectionElement | null>(null);

  const branchFilterOptions = useMemo(
    () => getBranchFilterOptions(simBranches, showRemoteBranches),
    [simBranches, showRemoteBranches],
  );

  const filterHeadHash = useMemo(
    () =>
      resolveFilterHeadHash(
        selectedBranchFilter,
        simBranches,
        showRemoteBranches,
      ),
    [selectedBranchFilter, simBranches, showRemoteBranches],
  );

  const visibleCommits = useMemo(
    () => getVisibleCommits(simCommits, filterHeadHash),
    [simCommits, filterHeadHash],
  );

  const labelsByHash = useMemo(
    () => buildLabelsByHash(simBranches, simCurrentRef, showRemoteBranches),
    [simBranches, simCurrentRef, showRemoteBranches],
  );

  const currentCommitHash = useMemo(
    () => getCurrentCommitHash(simBranches, simCurrentRef),
    [simBranches, simCurrentRef],
  );

  const simTerminalLines = useMemo(
    () =>
      renderSwitchResultLines({
        headline: simTerminalHeadline,
        tone: simTerminalTone,
        branches: simBranches,
        currentRef: simCurrentRef,
        commits: visibleCommits,
        showRemoteBranches,
        labelsByHash,
      }),
    [
      simTerminalHeadline,
      simTerminalTone,
      simBranches,
      simCurrentRef,
      visibleCommits,
      showRemoteBranches,
      labelsByHash,
    ],
  );

  const visibleCommitIdsKey = useMemo(
    () => visibleCommits.map((commit) => commit.id).join("|"),
    [visibleCommits],
  );

  useEffect(() => {
    const timerRegistry = copyResetTimerRef.current;
    return () => {
      Object.values(timerRegistry).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    const validValues = new Set(branchFilterOptions.map((option) => option.value));
    if (!validValues.has(selectedBranchFilter)) {
      setSelectedBranchFilter(ALL_BRANCH_FILTER);
    }
  }, [branchFilterOptions, selectedBranchFilter]);

  useEffect(() => {
    if (!showRemoteBranches && selectedBranchFilter.startsWith("remotes/")) {
      setSelectedBranchFilter(ALL_BRANCH_FILTER);
    }
  }, [showRemoteBranches, selectedBranchFilter]);

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

  const animateBranchRowEnter = async (branchName: string) => {
    const rowElement = branchChipRefs.current[branchName];
    if (!rowElement) {
      return;
    }

    rowElement.style.opacity = "0";
    rowElement.style.transform = "translateY(-8px)";

    try {
      await animate(rowElement, {
        opacity: [0, 1],
        translateY: [-8, 0],
        duration: 300,
        ease: "outQuad",
      });
    } finally {
      rowElement.style.opacity = "";
      rowElement.style.transform = "";
    }
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
  }, [visibleCommitIdsKey, selectedBranchFilter, showRemoteBranches]);

  const normalizeFilter = (
    nextBranches: GitSwitchSimulatorBranch[],
    nextShowRemoteBranches = showRemoteBranches,
  ) => {
    if (selectedBranchFilter === ALL_BRANCH_FILTER) {
      return ALL_BRANCH_FILTER;
    }

    if (selectedBranchFilter.startsWith("remotes/")) {
      if (!nextShowRemoteBranches) {
        return ALL_BRANCH_FILTER;
      }

      const hasRemote = Boolean(
        resolveRemoteBranchHash(selectedBranchFilter, nextBranches),
      );
      return hasRemote ? selectedBranchFilter : ALL_BRANCH_FILTER;
    }

    const hasLocal = nextBranches.some(
      (branch) => branch.name === selectedBranchFilter,
    );

    return hasLocal ? selectedBranchFilter : ALL_BRANCH_FILTER;
  };

  const runSwitchToBranch = async (targetBranch: string) => {
    setSimLastCommand(`git switch ${targetBranch}`);

    const target = simBranches.find((branch) => branch.name === targetBranch);
    if (!target) {
      setSimTerminalHeadline(`error: branch '${targetBranch}' not found`);
      setSimTerminalTone("warning");
      setSimMessage(`สลับไม่สำเร็จ: ไม่พบ branch ${targetBranch}`);
      return;
    }

    if (simCurrentRef.kind === "branch" && simCurrentRef.branchName === targetBranch) {
      setSimTerminalHeadline(`Already on '${targetBranch}'`);
      setSimTerminalTone("hint");
      setSimMessage(`ตอนนี้อยู่ ${targetBranch} อยู่แล้ว`);
      return;
    }

    const nextPreviousBranch =
      simCurrentRef.kind === "branch" ? simCurrentRef.branchName : simPreviousBranch;
    const nextRef: GitSwitchRefState = { kind: "branch", branchName: targetBranch };

    setSimCurrentRef(nextRef);
    setSimPreviousBranch(nextPreviousBranch ?? null);
    setHighlightedCommitHash(target.shortHash);
    setSimTerminalHeadline(`Switched to branch '${targetBranch}'`);
    setSimTerminalTone("success");
    setSimMessage(`สลับไป ${targetBranch} แล้ว`);

    const nextFilter = normalizeFilter(simBranches);
    if (nextFilter !== selectedBranchFilter) {
      setSelectedBranchFilter(nextFilter);
    }

    await waitNextPaint();
    await animateHeadMove(
      branchChipRefs.current[targetBranch] ?? commitRowRefs.current[target.shortHash] ?? null,
    );
    await animateCommitPulse(target.shortHash);
  };

  const runSwitchPrevious = async () => {
    setSimLastCommand("git switch -");

    if (!simPreviousBranch) {
      setSimTerminalHeadline("error: no previous branch found for git switch -");
      setSimTerminalTone("warning");
      setSimMessage("สลับไม่สำเร็จ: ยังไม่มี previous branch ให้กลับ");
      return;
    }

    const target = simBranches.find((branch) => branch.name === simPreviousBranch);
    if (!target) {
      setSimTerminalHeadline(`error: previous branch '${simPreviousBranch}' not found`);
      setSimTerminalTone("warning");
      setSimMessage(`สลับไม่สำเร็จ: ไม่พบ previous branch (${simPreviousBranch})`);
      return;
    }

    const previousBeforeSwitch =
      simCurrentRef.kind === "branch" ? simCurrentRef.branchName : null;
    const nextRef: GitSwitchRefState = {
      kind: "branch",
      branchName: simPreviousBranch,
    };

    setSimCurrentRef(nextRef);
    setSimPreviousBranch(previousBeforeSwitch);
    setHighlightedCommitHash(target.shortHash);
    setSimTerminalHeadline(`Switched to branch '${simPreviousBranch}'`);
    setSimTerminalTone("success");
    setSimMessage(`สลับกลับ ${simPreviousBranch} ด้วย git switch - แล้ว`);

    const nextFilter = normalizeFilter(simBranches);
    if (nextFilter !== selectedBranchFilter) {
      setSelectedBranchFilter(nextFilter);
    }

    await waitNextPaint();
    await animateHeadMove(
      branchChipRefs.current[simPreviousBranch] ??
        commitRowRefs.current[target.shortHash] ??
        null,
    );
    await animateCommitPulse(target.shortHash);
  };

  const runCreateAndSwitchBranch = async (branchName: string) => {
    setSimLastCommand(`git switch -c ${branchName}`);

    const existed = simBranches.some((branch) => branch.name === branchName);
    if (existed) {
      setSimTerminalHeadline(`fatal: a branch named '${branchName}' already exists`);
      setSimTerminalTone("warning");
      setSimMessage(`สร้างไม่สำเร็จ: มี branch ${branchName} อยู่แล้ว`);
      return;
    }

    const currentHash = getCurrentCommitHash(simBranches, simCurrentRef);
    if (!currentHash) {
      setSimTerminalHeadline("error: unable to resolve current HEAD");
      setSimTerminalTone("warning");
      setSimMessage("สร้างไม่สำเร็จ: ไม่พบตำแหน่ง HEAD ปัจจุบัน");
      return;
    }

    const nextBranch: GitSwitchSimulatorBranch = {
      name: branchName,
      shortHash: currentHash,
      ahead: 0,
      behind: 0,
    };
    const nextBranches = [...simBranches, nextBranch];
    const nextPreviousBranch =
      simCurrentRef.kind === "branch" ? simCurrentRef.branchName : simPreviousBranch;
    const nextRef: GitSwitchRefState = { kind: "branch", branchName };

    setSimBranches(nextBranches);
    setSimCurrentRef(nextRef);
    setSimPreviousBranch(nextPreviousBranch ?? null);
    setHighlightedCommitHash(currentHash);
    setSimTerminalHeadline(`Switched to a new branch '${branchName}'`);
    setSimTerminalTone("success");
    setSimMessage(`สร้างและสลับไป ${branchName} เรียบร้อย`);

    const nextFilter = normalizeFilter(nextBranches);
    if (nextFilter !== selectedBranchFilter) {
      setSelectedBranchFilter(nextFilter);
    }

    await waitNextPaint();
    await animateBranchRowEnter(branchName);
    await animateHeadMove(
      branchChipRefs.current[branchName] ?? commitRowRefs.current[currentHash] ?? null,
    );
    await animateCommitPulse(currentHash);
  };

  const runDetachHeadPrev = async () => {
    setSimLastCommand("git switch --detach HEAD~1");

    const targetHash = resolveHeadTildeOneHash(simCommits, currentCommitHash);
    if (!targetHash) {
      setSimTerminalHeadline("error: unable to resolve HEAD~1");
      setSimTerminalTone("warning");
      setSimMessage("detach ไม่สำเร็จ: ไม่สามารถหา HEAD~1 ได้จาก graph ปัจจุบัน");
      return;
    }

    const nextPreviousBranch =
      simCurrentRef.kind === "branch" ? simCurrentRef.branchName : simPreviousBranch;
    const nextRef: GitSwitchRefState = {
      kind: "detached",
      commitHash: targetHash,
    };

    setSimCurrentRef(nextRef);
    setSimPreviousBranch(nextPreviousBranch ?? null);
    setHighlightedCommitHash(targetHash);
    setSimTerminalHeadline(`HEAD is now at ${targetHash}`);
    setSimTerminalTone("detached");
    setSimMessage(`ย้าย HEAD แบบ detached ไปที่ ${targetHash}`);

    const nextFilter = normalizeFilter(simBranches);
    if (nextFilter !== selectedBranchFilter) {
      setSelectedBranchFilter(nextFilter);
    }

    await waitNextPaint();
    await animateHeadMove(commitRowRefs.current[targetHash] ?? null);
    await animateCommitPulse(targetHash);
  };

  const handleBranchFilterChange = async (nextFilter: string) => {
    setSelectedBranchFilter(nextFilter);
    setSimLastCommand(
      nextFilter === ALL_BRANCH_FILTER
        ? "Branches: Show All"
        : `Branches: ${nextFilter}`,
    );
    setSimTerminalHeadline(
      nextFilter === ALL_BRANCH_FILTER
        ? "Apply branch filter: Show All"
        : `Apply branch filter: ${nextFilter}`,
    );
    setSimTerminalTone("hint");

    const nextHash = resolveFilterHeadHash(nextFilter, simBranches, showRemoteBranches);
    if (nextHash) {
      setHighlightedCommitHash(nextHash);
      setSimMessage(`กรองประวัติด้วย ${nextFilter}`);
      await waitNextPaint();
      await animateCommitPulse(nextHash);
      return;
    }

    setHighlightedCommitHash(undefined);
    setSimMessage("แสดง commit ทุกเส้นงานแล้ว");
  };

  const handleToggleRemoteBranches = (checked: boolean) => {
    setShowRemoteBranches(checked);
    setSimLastCommand(
      checked ? "Show remote branches: on" : "Show remote branches: off",
    );
    setSimTerminalHeadline(
      checked
        ? "Remote labels are now visible"
        : "Remote labels are now hidden",
    );
    setSimTerminalTone("hint");

    if (!checked && selectedBranchFilter.startsWith("remotes/")) {
      setSelectedBranchFilter(ALL_BRANCH_FILTER);
      setHighlightedCommitHash(undefined);
      setSimMessage("ปิด remote labels แล้ว และรีเซ็ต filter กลับ Show All");
      return;
    }

    setSimMessage(
      checked
        ? "เปิดการแสดง remote branch labels แล้ว"
        : "ปิดการแสดง remote branch labels แล้ว",
    );
  };

  const resetSimulator = () => {
    setSimBranches(cloneInitialBranches());
    setSimCurrentRef(cloneInitialRef());
    setSimPreviousBranch(GIT_SWITCH_SIM_INITIAL_PREVIOUS_BRANCH);
    setSimLastCommand("Reset Demo");
    setSimTerminalHeadline("พร้อมทดลองคำสั่ง git switch");
    setSimTerminalTone("hint");
    setSimMessage("รีเซ็ต simulator กลับค่าเริ่มต้นแล้ว");
    setHighlightedCommitHash(undefined);
    setSelectedBranchFilter(ALL_BRANCH_FILTER);
    setShowRemoteBranches(true);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SetupGuideHeader
        badge="Branching"
        title="git switch: สลับและสร้าง Branch ให้ปลอดภัย"
        description="เรียนรู้การสลับ context งานระหว่าง branch, การสร้าง branch ใหม่พร้อมสลับ, และข้อควรระวังก่อน switch เพื่อป้องกันงานหาย"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่งหลักของ git switch สำหรับการทำงาน branch แบบรายวัน
        </p>

        <div className="mt-4 space-y-4">
          {GIT_SWITCH_COMMAND_DOCS.map((doc) => {
            const commandKey = `doc-${doc.id}`;
            const status = copyStatusByCommand[commandKey];

            return (
              <article key={doc.id} className="rounded-xl border border-border bg-muted/30 p-4">
                <h3 className="text-base font-bold text-foreground">{doc.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">สำหรับ:</span> {doc.purpose}
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

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Interactive Switch Simulator</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ปรับมุมมองให้ใกล้ Git Graph: มี branch filter, remote toggle, commit table และกราฟเส้น branch แบบอ่านง่าย
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runSwitchToBranch("feature/login");
            }}
          >
            git switch feature/login
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runSwitchToBranch("main");
            }}
          >
            git switch main
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runSwitchPrevious();
            }}
          >
            git switch -
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runCreateAndSwitchBranch("feature/cart");
            }}
          >
            git switch -c feature/cart
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runDetachHeadPrev();
            }}
          >
            git switch --detach HEAD~1
          </Button>
          <Button type="button" variant="outline" onClick={resetSimulator}>
            Reset Demo
          </Button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#3b3b3b] bg-[#1f1f1f] text-slate-100">
          <div className="border-b border-[#3b3b3b] p-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-200">Branches:</span>
              <select
                value={selectedBranchFilter}
                onChange={(event) => {
                  void handleBranchFilterChange(event.target.value);
                }}
                className="min-w-56 rounded-md border border-[#4a4a4a] bg-[#2b2b2b] px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label="Filter branch graph"
              >
                {branchFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={showRemoteBranches}
                  onChange={(event) => {
                    handleToggleRemoteBranches(event.target.checked);
                  }}
                  className="size-4 rounded border-[#575757] bg-[#2b2b2b] text-cyan-500"
                  aria-label="Show remote branches"
                />
                Show Remote Branches
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                ref={headBadgeRef}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300"
              >
                HEAD
              </span>
              {simBranches.map((branch) => {
                const isCurrent =
                  simCurrentRef.kind === "branch" && simCurrentRef.branchName === branch.name;

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
              {showRemoteBranches
                ? GIT_SWITCH_SIM_REMOTE_BRANCHES.map((remoteBranch) => (
                    <span
                      key={remoteBranch}
                      className="rounded-full border border-lime-500/30 bg-lime-500/10 px-2.5 py-1 text-xs font-semibold text-lime-300"
                    >
                      {remoteBranch.replace("remotes/", "")}
                    </span>
                  ))
                : null}
            </div>
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
                {visibleCommits.map((commit, index) => {
                  const labels = labelsByHash.get(commit.shortHash) ?? [];
                  const isCurrent = commit.shortHash === currentCommitHash;
                  const isHighlighted = commit.shortHash === highlightedCommitHash;

                  const child = index > 0 ? visibleCommits[index - 1] : undefined;
                  const childX = child ? getLaneX(child.lane) : undefined;
                  const parent = commit.parentId
                    ? visibleCommits.find((item) => item.id === commit.parentId)
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
                        <p className="mt-1 truncate text-sm text-slate-100">{commit.message}</p>
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

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Safety Notes</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ก่อนสลับ branch ควรตรวจสถานะไฟล์ค้างให้ชัดเจนเพื่อเลี่ยง conflict ที่ไม่ตั้งใจ
        </p>
        <ul className="mt-4 list-disc space-y-2 rounded-xl border border-border bg-muted/30 p-4 pl-8 text-sm leading-6 text-foreground">
          {GIT_SWITCH_SAFETY_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทำตามลำดับนี้เพื่อฝึกการ switch branch จริงตั้งแต่สร้าง branch ถึง detached HEAD
        </p>

        <ol className="mt-4 space-y-4">
          {GIT_SWITCH_LAB_STEPS.map((step, stepIndex) => (
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
    </main>
  );
}
