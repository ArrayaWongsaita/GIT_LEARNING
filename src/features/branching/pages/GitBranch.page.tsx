import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import { Button } from "@/shared/components/ui/button";
import {
  GIT_BRANCH_COMMAND_DOCS,
  GIT_BRANCH_SAFETY_NOTES,
  GIT_BRANCH_SIM_INITIAL_BRANCHES,
  GIT_BRANCH_SIM_INITIAL_COMMITS,
  GIT_BRANCH_SIM_INITIAL_CURRENT_BRANCH,
  GIT_BRANCH_SIM_REMOTE_BRANCHES,
  type GitBranchSimulatorBranch,
  type GitBranchSimulatorCommit,
} from "@/features/branching/constants/git-branch-content.constant";
import { GitBranchLabAccordion } from "@/features/branching/components/GitBranchLabAccordion";

type TerminalTone =
  | "label"
  | "command"
  | "normal"
  | "current"
  | "success"
  | "warning"
  | "hint"
  | "meta";

type TerminalLine = {
  text: string;
  tone: TerminalTone;
};

type BranchTerminalMode = "local" | "all" | "verbose";

type GraphLabel = {
  text: string;
  variant: "head" | "main" | "feature" | "remote" | "other";
};

type BranchFilterOption = {
  value: string;
  label: string;
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
  meta: "text-violet-300",
};

const cloneInitialSimulatorBranches = () =>
  GIT_BRANCH_SIM_INITIAL_BRANCHES.map((branch) => ({ ...branch }));

const cloneInitialSimulatorCommits = () =>
  GIT_BRANCH_SIM_INITIAL_COMMITS.map((commit) => ({ ...commit }));

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

const resolveRemoteBranchHash = (
  remoteRef: string,
  branches: GitBranchSimulatorBranch[],
) => {
  if (!remoteRef.startsWith("remotes/origin/")) {
    return undefined;
  }

  const localName = remoteRef.replace("remotes/origin/", "");
  return branches.find((branch) => branch.name === localName)?.shortHash;
};

const getBranchFilterOptions = (
  branches: GitBranchSimulatorBranch[],
  showRemoteBranches: boolean,
): BranchFilterOption[] => {
  const localOptions = branches.map((branch) => ({
    value: branch.name,
    label: branch.name,
  }));

  const remoteOptions = showRemoteBranches
    ? GIT_BRANCH_SIM_REMOTE_BRANCHES.map((remoteBranch) => ({
        value: remoteBranch,
        label: remoteBranch,
      }))
    : [];

  return [
    {
      value: ALL_BRANCH_FILTER,
      label: "Show All",
    },
    ...localOptions,
    ...remoteOptions,
  ];
};

const resolveFilterHeadHash = (
  selectedBranchFilter: string,
  branches: GitBranchSimulatorBranch[],
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
  commits: GitBranchSimulatorCommit[],
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
  let cursor: GitBranchSimulatorCommit | undefined = startCommit;

  while (cursor) {
    chainIds.add(cursor.id);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  return commits.filter((commit) => chainIds.has(commit.id));
};

const buildLabelsByHash = (
  branches: GitBranchSimulatorBranch[],
  currentBranch: string,
  showRemoteBranches: boolean,
) => {
  const labelsByHash = new Map<string, GraphLabel[]>();

  branches.forEach((branch) => {
    const label: GraphLabel =
      branch.name === currentBranch
        ? { text: `HEAD -> ${branch.name}`, variant: "head" }
        : { text: branch.name, variant: getBranchVariant(branch.name) };

    const current = labelsByHash.get(branch.shortHash) ?? [];
    current.push(label);
    labelsByHash.set(branch.shortHash, current);
  });

  if (showRemoteBranches) {
    GIT_BRANCH_SIM_REMOTE_BRANCHES.forEach((remoteRef) => {
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

  labelsByHash.forEach((labels, hash) => {
    const sorted = [...labels].sort((a, b) => {
      const order: Record<GraphLabel["variant"], number> = {
        head: 0,
        main: 1,
        feature: 2,
        remote: 3,
        other: 4,
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
  if (variant === "remote") {
    return "border border-lime-500/30 bg-lime-500/15 text-lime-700 dark:text-lime-300";
  }
  return "border border-slate-500/30 bg-slate-500/15 text-slate-700 dark:text-slate-300";
};

const formatUpstreamState = (branch: GitBranchSimulatorBranch) => {
  if (!branch.upstream) {
    return "";
  }

  const state: string[] = [];
  if (branch.ahead > 0) {
    state.push(`ahead ${branch.ahead}`);
  }
  if (branch.behind > 0) {
    state.push(`behind ${branch.behind}`);
  }

  if (!state.length) {
    return `[${branch.upstream}]`;
  }

  return `[${branch.upstream}: ${state.join(", ")}]`;
};

const renderLocalBranchLines = (
  branches: GitBranchSimulatorBranch[],
  currentBranch: string,
): TerminalLine[] =>
  branches.map((branch) => ({
    text: `${branch.name === currentBranch ? "* " : "  "}${branch.name}`,
    tone: branch.name === currentBranch ? "current" : "normal",
  }));

const renderAllBranchLines = (
  branches: GitBranchSimulatorBranch[],
  currentBranch: string,
  showRemoteBranches: boolean,
): TerminalLine[] => {
  const lines: TerminalLine[] = [
    { text: "# local branches", tone: "hint" },
    ...renderLocalBranchLines(branches, currentBranch),
    { text: "", tone: "normal" },
  ];

  if (!showRemoteBranches) {
    lines.push({
      text: "# remote branches (hidden by toggle)",
      tone: "hint",
    });
    return lines;
  }

  lines.push({ text: "# remote branches", tone: "hint" });
  GIT_BRANCH_SIM_REMOTE_BRANCHES.forEach((remoteBranch) => {
    lines.push({ text: `  ${remoteBranch}`, tone: "meta" });
  });

  return lines;
};

const renderVerboseBranchLines = (
  branches: GitBranchSimulatorBranch[],
  currentBranch: string,
): TerminalLine[] =>
  branches.map((branch) => {
    const prefix = branch.name === currentBranch ? "* " : "  ";
    const nameColumn = `${prefix}${branch.name}`.padEnd(24, " ");
    const upstreamState = formatUpstreamState(branch);
    const upstreamColumn = upstreamState ? `${upstreamState} ` : "";

    return {
      text: `${nameColumn}${branch.shortHash} ${upstreamColumn}${branch.lastCommit}`,
      tone: branch.name === currentBranch ? "current" : "normal",
    };
  });

const renderGraphTerminalLines = (
  commits: GitBranchSimulatorCommit[],
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

const renderSimulatorLines = ({
  headline,
  tone,
  mode,
  branches,
  currentBranch,
  showRemoteBranches,
  commits,
  labelsByHash,
}: {
  headline: string;
  tone: TerminalTone;
  mode: BranchTerminalMode;
  branches: GitBranchSimulatorBranch[];
  currentBranch: string;
  showRemoteBranches: boolean;
  commits: GitBranchSimulatorCommit[];
  labelsByHash: Map<string, GraphLabel[]>;
}): TerminalLine[] => {
  const commandLabel =
    mode === "all" ? "git branch -a" : mode === "verbose" ? "git branch -vv" : "git branch";

  const branchLines =
    mode === "all"
      ? renderAllBranchLines(branches, currentBranch, showRemoteBranches)
      : mode === "verbose"
        ? renderVerboseBranchLines(branches, currentBranch)
        : renderLocalBranchLines(branches, currentBranch);

  return [
    { text: headline, tone },
    { text: "", tone: "normal" },
    { text: `# ${commandLabel}`, tone: "hint" },
    ...branchLines,
    { text: "", tone: "normal" },
    { text: "# git log --oneline --graph --decorate --all", tone: "hint" },
    ...renderGraphTerminalLines(commits, labelsByHash),
  ];
};

export default function GitBranchPage() {
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const [simLocalBranches, setSimLocalBranches] = useState<GitBranchSimulatorBranch[]>(
    cloneInitialSimulatorBranches,
  );
  const [simLastCommand, setSimLastCommand] = useState<string>("git branch");
  const [simMessage, setSimMessage] = useState<string>(
    "เริ่มจากดูรายการ branch ด้วย git branch แล้วลองคำสั่งอื่นต่อได้ทันที",
  );
  const [simTerminalHeadline, setSimTerminalHeadline] = useState<string>(
    "พร้อมทดลองคำสั่ง git branch",
  );
  const [simTerminalTone, setSimTerminalTone] = useState<TerminalTone>("hint");
  const [simBranchViewMode, setSimBranchViewMode] = useState<BranchTerminalMode>("local");
  const [highlightedCommitHash, setHighlightedCommitHash] = useState<string | undefined>();
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(
    ALL_BRANCH_FILTER,
  );
  const [showRemoteBranches, setShowRemoteBranches] = useState<boolean>(true);

  const simCurrentBranch = GIT_BRANCH_SIM_INITIAL_CURRENT_BRANCH;
  const simCommits = useMemo(cloneInitialSimulatorCommits, []);

  const copyResetTimerRef = useRef<Record<string, number>>({});
  const branchChipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const commitRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const commitTableBodyRef = useRef<HTMLTableSectionElement | null>(null);

  const branchFilterOptions = useMemo(
    () => getBranchFilterOptions(simLocalBranches, showRemoteBranches),
    [simLocalBranches, showRemoteBranches],
  );

  const filterHeadHash = useMemo(
    () =>
      resolveFilterHeadHash(
        selectedBranchFilter,
        simLocalBranches,
        showRemoteBranches,
      ),
    [selectedBranchFilter, simLocalBranches, showRemoteBranches],
  );

  const visibleCommits = useMemo(
    () => getVisibleCommits(simCommits, filterHeadHash),
    [simCommits, filterHeadHash],
  );

  const labelsByHash = useMemo(
    () => buildLabelsByHash(simLocalBranches, simCurrentBranch, showRemoteBranches),
    [simLocalBranches, simCurrentBranch, showRemoteBranches],
  );

  const currentCommitHash = useMemo(
    () =>
      simLocalBranches.find((branch) => branch.name === simCurrentBranch)?.shortHash,
    [simCurrentBranch, simLocalBranches],
  );

  const simTerminalLines = useMemo(
    () =>
      renderSimulatorLines({
        headline: simTerminalHeadline,
        tone: simTerminalTone,
        mode: simBranchViewMode,
        branches: simLocalBranches,
        currentBranch: simCurrentBranch,
        showRemoteBranches,
        commits: visibleCommits,
        labelsByHash,
      }),
    [
      simTerminalHeadline,
      simTerminalTone,
      simBranchViewMode,
      simLocalBranches,
      simCurrentBranch,
      showRemoteBranches,
      visibleCommits,
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

  const animateBranchRowExit = async (branchName: string) => {
    const rowElement = branchChipRefs.current[branchName];
    if (!rowElement) {
      return;
    }

    await animate(rowElement, {
      opacity: [1, 0],
      translateY: [0, -6],
      duration: 220,
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
  }, [visibleCommitIdsKey, selectedBranchFilter, showRemoteBranches]);

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

  const normalizeFilter = (
    nextBranches: GitBranchSimulatorBranch[],
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

  const runListLocalBranches = async () => {
    setSimLastCommand("git branch");
    setSimBranchViewMode("local");
    setSimTerminalHeadline("show local branches");
    setSimTerminalTone("hint");
    setSimMessage("แสดง local branches และ branch ปัจจุบัน");

    if (!currentCommitHash) {
      setHighlightedCommitHash(undefined);
      return;
    }

    setHighlightedCommitHash(currentCommitHash);
    await waitNextPaint();
    await animateCommitPulse(currentCommitHash);
  };

  const runCreateFeatureCartBranch = async () => {
    const branchName = "feature/cart";
    setSimLastCommand(`git branch ${branchName}`);
    setSimBranchViewMode("local");

    const alreadyExists = simLocalBranches.some((branch) => branch.name === branchName);
    if (alreadyExists) {
      setSimTerminalHeadline(`fatal: a branch named '${branchName}' already exists`);
      setSimTerminalTone("warning");
      setSimMessage(`สร้างไม่สำเร็จ: มี branch ${branchName} อยู่แล้ว`);
      return;
    }

    const baseBranch = simLocalBranches.find((branch) => branch.name === simCurrentBranch);
    if (!baseBranch) {
      setSimTerminalHeadline("error: failed to resolve current branch");
      setSimTerminalTone("warning");
      setSimMessage("สร้างไม่สำเร็จ: ไม่พบ branch ปัจจุบันในสถานะจำลอง");
      return;
    }

    const nextBranches = [
      ...simLocalBranches,
      {
        name: branchName,
        shortHash: baseBranch.shortHash,
        lastCommit: `branch from ${simCurrentBranch}`,
        merged: false,
        ahead: 0,
        behind: 0,
      },
    ];

    setSimLocalBranches(nextBranches);
    setSimTerminalHeadline(`branch '${branchName}' created`);
    setSimTerminalTone("success");
    setSimMessage(`สร้าง ${branchName} สำเร็จ (ยังอยู่ที่ ${simCurrentBranch})`);
    setHighlightedCommitHash(baseBranch.shortHash);

    const nextFilter = normalizeFilter(nextBranches);
    if (nextFilter !== selectedBranchFilter) {
      setSelectedBranchFilter(nextFilter);
    }

    await waitNextPaint();
    await animateBranchRowEnter(branchName);
    await animateCommitPulse(baseBranch.shortHash);
  };

  const runListAllBranches = async () => {
    setSimLastCommand("git branch -a");
    setSimBranchViewMode("all");
    setSimTerminalHeadline("show local and remote branches");
    setSimTerminalTone("hint");
    setSimMessage("แสดงทั้ง local และ remote-tracking branches");

    if (!filterHeadHash) {
      setHighlightedCommitHash(undefined);
      return;
    }

    setHighlightedCommitHash(filterHeadHash);
    await waitNextPaint();
    await animateCommitPulse(filterHeadHash);
  };

  const runListVerboseBranches = async () => {
    setSimLastCommand("git branch -vv");
    setSimBranchViewMode("verbose");
    setSimTerminalHeadline("show branches with upstream status");
    setSimTerminalTone("hint");
    setSimMessage("แสดง branch พร้อม hash ล่าสุดและความสัมพันธ์ upstream");

    if (!filterHeadHash) {
      setHighlightedCommitHash(undefined);
      return;
    }

    setHighlightedCommitHash(filterHeadHash);
    await waitNextPaint();
    await animateCommitPulse(filterHeadHash);
  };

  const runDeleteBranch = async (branchName: string, force: boolean) => {
    setSimLastCommand(`git branch ${force ? "-D" : "-d"} ${branchName}`);
    setSimBranchViewMode("local");

    const targetBranch = simLocalBranches.find((branch) => branch.name === branchName);
    if (!targetBranch) {
      setSimTerminalHeadline(`error: branch '${branchName}' not found`);
      setSimTerminalTone("warning");
      setSimMessage(`ลบไม่สำเร็จ: ไม่พบ branch ${branchName}`);
      return;
    }

    if (targetBranch.name === simCurrentBranch) {
      setSimTerminalHeadline(
        `error: Cannot delete branch '${branchName}' checked out at '${simCurrentBranch}'`,
      );
      setSimTerminalTone("warning");
      setSimMessage("ลบไม่สำเร็จ: ห้ามลบ branch ที่กำลังใช้งาน");
      return;
    }

    if (!force && !targetBranch.merged) {
      setSimTerminalHeadline(`error: The branch '${branchName}' is not fully merged.`);
      setSimTerminalTone("warning");
      setSimMessage(
        `ลบไม่สำเร็จ: ${branchName} ยังไม่ merge (แนะนำ git branch -D ${branchName} ถ้าต้องการบังคับลบ)`,
      );
      return;
    }

    await animateBranchRowExit(branchName);

    const nextBranches = simLocalBranches.filter((branch) => branch.name !== branchName);
    setSimLocalBranches(nextBranches);
    setSimTerminalHeadline(`Deleted branch ${branchName} (${targetBranch.shortHash}).`);
    setSimTerminalTone("success");
    setSimMessage(
      force
        ? `ลบ ${branchName} แบบบังคับแล้ว`
        : `ลบ ${branchName} สำเร็จ (merge แล้ว)`,
    );
    setHighlightedCommitHash(targetBranch.shortHash);

    const nextFilter = normalizeFilter(nextBranches);
    if (nextFilter !== selectedBranchFilter) {
      setSelectedBranchFilter(nextFilter);
    }

    await waitNextPaint();
    await animateCommitPulse(targetBranch.shortHash);
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

    const nextHash = resolveFilterHeadHash(nextFilter, simLocalBranches, showRemoteBranches);
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
    const initialBranches = cloneInitialSimulatorBranches();
    setSimLocalBranches(initialBranches);
    setSimLastCommand("Reset Demo");
    setSimBranchViewMode("local");
    setSimTerminalHeadline("พร้อมทดลองคำสั่ง git branch");
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
        title="git branch: สร้าง ดู และลบ Branch อย่างปลอดภัย"
        description="branch คือเส้นงานแยกที่ช่วยให้คุณพัฒนาฟีเจอร์หรือแก้บั๊กโดยไม่กระทบ main โดยตรง แล้วค่อยรวมกลับเมื่อพร้อม"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่งหลักของ git branch ที่ต้องใช้ในงานจริง ตั้งแต่สร้าง branch ไปจนถึงลบ branch
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          การสลับ branch ดูที่หน้า <span className="font-semibold text-foreground">git switch</span>
        </p>

        <div className="mt-4 space-y-4">
          {GIT_BRANCH_COMMAND_DOCS.map((doc) => {
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
        <h2 className="text-xl font-black tracking-tight text-foreground">Interactive Branch Simulator</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ปรับมุมมองให้ใกล้ Git Graph: มี branch filter, remote toggle, commit table และกราฟเส้น branch แบบอ่านง่าย
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runListLocalBranches();
            }}
          >
            git branch
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runCreateFeatureCartBranch();
            }}
          >
            git branch feature/cart
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runListAllBranches();
            }}
          >
            git branch -a
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runListVerboseBranches();
            }}
          >
            git branch -vv
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runDeleteBranch("feature/profile", false);
            }}
          >
            git branch -d feature/profile
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runDeleteBranch("feature/login", false);
            }}
          >
            git branch -d feature/login
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void runDeleteBranch("feature/profile", true);
            }}
          >
            git branch -D feature/profile
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
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                HEAD
              </span>
              {simLocalBranches.map((branch) => {
                const isCurrent = branch.name === simCurrentBranch;

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
                      void handleBranchFilterChange(branch.name);
                    }}
                  >
                    {branch.name}
                  </button>
                );
              })}
              {showRemoteBranches
                ? GIT_BRANCH_SIM_REMOTE_BRANCHES.map((remoteBranch) => (
                    <button
                      key={remoteBranch}
                      type="button"
                      className="rounded-full border border-lime-500/30 bg-lime-500/10 px-2.5 py-1 text-xs font-semibold text-lime-300"
                      onClick={() => {
                        void handleBranchFilterChange(remoteBranch);
                      }}
                    >
                      {remoteBranch.replace("remotes/", "")}
                    </button>
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
          ก่อนลบ branch ควรตรวจสถานะให้ชัดเจนเพื่อลดความเสี่ยงทำงานหาย
        </p>
        <ul className="mt-4 list-disc space-y-2 rounded-xl border border-border bg-muted/30 p-4 pl-8 text-sm leading-6 text-foreground">
          {GIT_BRANCH_SAFETY_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Lab Collection</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ชุด lab ด้านล่างขยายจาก flow เดิมให้ครอบคลุมทั้งการสร้าง branch, อ่าน pointer,
          merge, safe delete, force delete และ cleanup แบบเป็นขั้นเป็นตอน
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          ถ้าต้องการทำแบบต่อเนื่อง ให้เริ่มจาก Foundation Listing &amp; Creation แล้วไล่ลงมาจนครบทุก section
        </p>
        <GitBranchLabAccordion
          copyStatusByCommand={copyStatusByCommand}
          onCopyCommand={handleCopyCommand}
        />
      </section>
    </main>
  );
}
