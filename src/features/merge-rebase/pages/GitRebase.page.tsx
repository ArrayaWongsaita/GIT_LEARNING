import { useEffect, useMemo, useRef, useState } from "react";
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
  GIT_REBASE_COMMAND_DOCS,
  GIT_REBASE_CONFLICT_RULES,
  GIT_REBASE_INTERACTIVE_COMMAND_REFERENCES,
  GIT_REBASE_INTERACTIVE_NOTES,
  GIT_REBASE_INTERACTIVE_SIMULATOR_COVERAGE,
  GIT_REBASE_INTERACTIVE_TODO_EXAMPLE,
  GIT_REBASE_SAFETY_NOTES,
  GIT_REBASE_SIM_INITIAL_BRANCHES,
  GIT_REBASE_SIM_INITIAL_COMMITS,
  GIT_REBASE_SIM_INITIAL_CURRENT_BRANCH,
  GIT_REBASE_SYNTHETIC_HASHES,
  type GitRebaseConflictRule,
  type GitRebaseSessionSnapshot,
  type GitRebaseSimulatorBranch,
  type GitRebaseSimulatorCommit,
  type GitRebaseTodoAction,
  type GitRebaseTodoItem,
} from "@/features/merge-rebase/constants/git-rebase-content.constant";
import { GitRebaseLabAccordion } from "@/features/merge-rebase/components/GitRebaseLabAccordion";

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

type RebaseQueueItem = {
  id: string;
  sourceCommitIds: string[];
  sourceShortHashes: string[];
  message: string;
  author: string;
};

type RebaseConflictState = {
  itemId: string;
  sourceCommitId: string;
  filePath: string;
  reason: string;
  resolved: boolean;
};

type RebaseSessionState = {
  mode: "inProgress" | "conflict";
  sourceBranch: string;
  targetBranch: string;
  queue: RebaseQueueItem[];
  nextParentHash: string;
  nextSyntheticIndex: number;
  conflict: RebaseConflictState | null;
  mapping: { sourceHash: string; rebasedHash: string }[];
  interactive: boolean;
};

type InteractivePlanState = {
  sourceBranch: string;
  targetBranch: string;
  replayCommits: GitRebaseSimulatorCommit[];
  todo: GitRebaseTodoItem[];
  baseHeadHash: string;
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

const cloneInitialBranches = () =>
  GIT_REBASE_SIM_INITIAL_BRANCHES.map((branch) => ({ ...branch }));

const cloneInitialCommits = () =>
  GIT_REBASE_SIM_INITIAL_COMMITS.map((commit) => ({ ...commit }));

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

const getCurrentCommitHash = (
  branches: GitRebaseSimulatorBranch[],
  currentBranch: string,
) => branches.find((branch) => branch.name === currentBranch)?.shortHash;

const buildLabelsByHash = (
  branches: GitRebaseSimulatorBranch[],
  currentBranch: string,
) => {
  const labelsByHash = new Map<string, GraphLabel[]>();

  branches.forEach((branch) => {
    const label: GraphLabel =
      branch.name === currentBranch
        ? { text: `HEAD -> ${branch.name}`, variant: "head" }
        : { text: branch.name, variant: getBranchVariant(branch.name) };

    const labels = labelsByHash.get(branch.shortHash) ?? [];
    labels.push(label);
    labelsByHash.set(branch.shortHash, labels);
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

const renderBranchListLines = (
  branches: GitRebaseSimulatorBranch[],
  currentBranch: string,
): TerminalLine[] =>
  branches.map((branch) => {
    const isCurrent = branch.name === currentBranch;
    const divergedText =
      branch.name === "main"
        ? ""
        : ` (ahead ${branch.ahead}, behind ${branch.behind})`;

    return {
      text: `${isCurrent ? "* " : "  "}${branch.name}${divergedText}`,
      tone: isCurrent ? "current" : "normal",
    };
  });

const renderGraphTerminalLines = (
  commits: GitRebaseSimulatorCommit[],
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

const renderRebaseResultLines = ({
  headline,
  tone,
  branches,
  currentBranch,
  commits,
  labelsByHash,
  rebaseSession,
  interactivePlan,
}: {
  headline: string;
  tone: TerminalTone;
  branches: GitRebaseSimulatorBranch[];
  currentBranch: string;
  commits: GitRebaseSimulatorCommit[];
  labelsByHash: Map<string, GraphLabel[]>;
  rebaseSession: RebaseSessionState | null;
  interactivePlan: InteractivePlanState | null;
}): TerminalLine[] => {
  const sessionLines: TerminalLine[] = [];
  if (rebaseSession) {
    sessionLines.push({
      text: `rebase: ${rebaseSession.sourceBranch} onto ${rebaseSession.targetBranch} (${rebaseSession.queue.length} item left)`,
      tone: rebaseSession.mode === "conflict" ? "warning" : "hint",
    });

    if (rebaseSession.conflict) {
      sessionLines.push({
        text: `CONFLICT (${rebaseSession.conflict.filePath}): ${rebaseSession.conflict.reason}`,
        tone: "warning",
      });
      sessionLines.push({
        text: rebaseSession.conflict.resolved
          ? "conflict staged. run git rebase --continue"
          : `resolve then run git add ${rebaseSession.conflict.filePath}`,
        tone: "hint",
      });
    }

    if (rebaseSession.mapping.length) {
      const latestMapping = rebaseSession.mapping.slice(-4);
      latestMapping.forEach((item) => {
        sessionLines.push({
          text: `rewrite: ${item.sourceHash} -> ${item.rebasedHash}`,
          tone: "hint",
        });
      });
    }
  }

  if (interactivePlan) {
    sessionLines.push({
      text: `interactive todo ready: ${interactivePlan.todo.length} item(s), run Apply Plan`,
      tone: "hint",
    });
  }

  return [
    { text: headline, tone },
    ...sessionLines,
    { text: "", tone: "normal" },
    { text: "# git branch", tone: "hint" },
    ...renderBranchListLines(branches, currentBranch),
    { text: "", tone: "normal" },
    { text: "# git log --oneline --graph --decorate --all", tone: "hint" },
    ...renderGraphTerminalLines(commits, labelsByHash),
  ];
};

const buildBranchLookup = (branches: GitRebaseSimulatorBranch[]) => {
  const map = new Map<string, GitRebaseSimulatorBranch>();
  branches.forEach((branch) => map.set(branch.name, branch));
  return map;
};

const buildCommitLookupById = (commits: GitRebaseSimulatorCommit[]) =>
  new Map(commits.map((commit) => [commit.id, commit]));

const buildCommitLookupByHash = (commits: GitRebaseSimulatorCommit[]) =>
  new Map(commits.map((commit) => [commit.shortHash, commit]));

const getParentHash = (
  commit: GitRebaseSimulatorCommit,
  commitById: Map<string, GitRebaseSimulatorCommit>,
) => {
  if (!commit.parentId) {
    return undefined;
  }
  return commitById.get(commit.parentId)?.shortHash;
};

const getHistoryHashes = (
  commitByHash: Map<string, GitRebaseSimulatorCommit>,
  commitById: Map<string, GitRebaseSimulatorCommit>,
  headHash?: string,
) => {
  const history: string[] = [];
  let cursor = headHash;

  while (cursor) {
    const commit = commitByHash.get(cursor);
    if (!commit) {
      break;
    }
    history.push(cursor);
    cursor = getParentHash(commit, commitById);
  }

  return history;
};

const recalculateBranchDivergence = (
  branches: GitRebaseSimulatorBranch[],
  commits: GitRebaseSimulatorCommit[],
) => {
  const commitByHash = buildCommitLookupByHash(commits);
  const commitById = buildCommitLookupById(commits);
  const mainHeadHash = branches.find((branch) => branch.name === "main")?.shortHash;
  const mainHistorySet = new Set(
    getHistoryHashes(commitByHash, commitById, mainHeadHash),
  );

  return branches.map((branch) => {
    if (branch.name === "main") {
      return {
        ...branch,
        ahead: 0,
        behind: 0,
      };
    }

    const branchHistorySet = new Set(
      getHistoryHashes(commitByHash, commitById, branch.shortHash),
    );

    let ahead = 0;
    branchHistorySet.forEach((hash) => {
      if (!mainHistorySet.has(hash)) {
        ahead += 1;
      }
    });

    let behind = 0;
    mainHistorySet.forEach((hash) => {
      if (!branchHistorySet.has(hash)) {
        behind += 1;
      }
    });

    return {
      ...branch,
      ahead,
      behind,
    };
  });
};

const resolveReplayCommits = (
  commits: GitRebaseSimulatorCommit[],
  sourceHead: string,
  targetHead: string,
) => {
  const commitByHash = buildCommitLookupByHash(commits);
  const commitById = buildCommitLookupById(commits);
  const sourceHistory = getHistoryHashes(commitByHash, commitById, sourceHead);
  const targetHistorySet = new Set(
    getHistoryHashes(commitByHash, commitById, targetHead),
  );
  const replayDesc: GitRebaseSimulatorCommit[] = [];

  sourceHistory.forEach((hash) => {
    if (targetHistorySet.has(hash)) {
      return;
    }

    const commit = commitByHash.get(hash);
    if (commit) {
      replayDesc.push(commit);
    }
  });

  const stopAtAncestorIndex = sourceHistory.findIndex((hash) =>
    targetHistorySet.has(hash),
  );

  if (stopAtAncestorIndex >= 0) {
    replayDesc.length = stopAtAncestorIndex;
  }

  return replayDesc.reverse();
};

const buildSyntheticHash = (index: number) => {
  const fromPool = GIT_REBASE_SYNTHETIC_HASHES[index];
  if (fromPool) {
    return fromPool;
  }
  return `r${(index + 1).toString(16).padStart(6, "0")}`;
};

const buildQueueFromCommits = (commits: GitRebaseSimulatorCommit[]): RebaseQueueItem[] =>
  commits.map((commit, index) => ({
    id: `q-${index + 1}-${commit.id}`,
    sourceCommitIds: [commit.id],
    sourceShortHashes: [commit.shortHash],
    message: commit.message,
    author: commit.author,
  }));

const buildTodoFromReplayCommits = (commits: GitRebaseSimulatorCommit[]) =>
  commits.map((commit, index) => ({
    id: `todo-${index + 1}-${commit.id}`,
    sourceCommitId: commit.id,
    sourceShortHash: commit.shortHash,
    action: "pick" as GitRebaseTodoAction,
    message: commit.message,
  }));

const buildQueueFromTodo = (
  todo: GitRebaseTodoItem[],
  replayCommits: GitRebaseSimulatorCommit[],
) => {
  const replayById = new Map(replayCommits.map((commit) => [commit.id, commit]));
  const queue: RebaseQueueItem[] = [];

  todo.forEach((todoItem, index) => {
    const commit = replayById.get(todoItem.sourceCommitId);
    if (!commit) {
      return;
    }

    const action = index === 0 ? "pick" : todoItem.action;
    if (action === "squash" && queue.length > 0) {
      const lastQueueItem = queue[queue.length - 1];
      lastQueueItem.sourceCommitIds.push(commit.id);
      lastQueueItem.sourceShortHashes.push(commit.shortHash);
      lastQueueItem.message = `${lastQueueItem.message} + ${commit.message}`;
      lastQueueItem.author = commit.author;
      return;
    }

    queue.push({
      id: `qi-${queue.length + 1}-${commit.id}`,
      sourceCommitIds: [commit.id],
      sourceShortHashes: [commit.shortHash],
      message: commit.message,
      author: commit.author,
    });
  });

  return queue;
};

const findConflictRuleForQueueItem = (
  queueItem: RebaseQueueItem,
): GitRebaseConflictRule | undefined =>
  GIT_REBASE_CONFLICT_RULES.find((rule) =>
    queueItem.sourceCommitIds.includes(rule.sourceCommitId),
  );

export default function GitRebasePage() {
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const [simCommits, setSimCommits] = useState<GitRebaseSimulatorCommit[]>(
    cloneInitialCommits,
  );
  const [simBranches, setSimBranches] = useState<GitRebaseSimulatorBranch[]>(
    () => recalculateBranchDivergence(cloneInitialBranches(), cloneInitialCommits()),
  );
  const [simCurrentBranch, setSimCurrentBranch] = useState<string>(
    GIT_REBASE_SIM_INITIAL_CURRENT_BRANCH,
  );
  const [simLastCommand, setSimLastCommand] = useState<string>(
    "git switch feature/login",
  );
  const [simMessage, setSimMessage] = useState<string>(
    "เริ่มจาก feature/login แล้วลอง git rebase main หรือ git rebase -i main",
  );
  const [simTerminalHeadline, setSimTerminalHeadline] = useState<string>(
    "พร้อมทดลองคำสั่ง git rebase",
  );
  const [simTerminalTone, setSimTerminalTone] = useState<TerminalTone>("hint");
  const [commandInput, setCommandInput] = useState<string>("git rebase main");
  const [highlightedCommitHash, setHighlightedCommitHash] = useState<
    string | undefined
  >(undefined);
  const [rebaseSession, setRebaseSession] = useState<RebaseSessionState | null>(
    null,
  );
  const [interactivePlan, setInteractivePlan] = useState<InteractivePlanState | null>(
    null,
  );
  const [rebaseSnapshot, setRebaseSnapshot] =
    useState<GitRebaseSessionSnapshot | null>(null);
  const [syntheticIndex, setSyntheticIndex] = useState<number>(0);

  const copyResetTimerRef = useRef<Record<string, number>>({});
  const commitTableBodyRef = useRef<HTMLTableSectionElement | null>(null);
  const branchChipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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
      renderRebaseResultLines({
        headline: simTerminalHeadline,
        tone: simTerminalTone,
        branches: simBranches,
        currentBranch: simCurrentBranch,
        commits: simCommits,
        labelsByHash,
        rebaseSession,
        interactivePlan,
      }),
    [
      simTerminalHeadline,
      simTerminalTone,
      simBranches,
      simCurrentBranch,
      simCommits,
      labelsByHash,
      rebaseSession,
      interactivePlan,
    ],
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

  const setTerminalState = (
    headline: string,
    tone: TerminalTone,
    message: string,
  ) => {
    setSimTerminalHeadline(headline);
    setSimTerminalTone(tone);
    setSimMessage(message);
  };

  const buildSnapshot = (): GitRebaseSessionSnapshot => ({
    branches: simBranches.map((branch) => ({ ...branch })),
    commits: simCommits.map((commit) => ({ ...commit })),
    currentBranch: simCurrentBranch,
    syntheticIndex,
  });

  const applyCommitAndBranchState = ({
    commits,
    branches,
  }: {
    commits: GitRebaseSimulatorCommit[];
    branches: GitRebaseSimulatorBranch[];
  }) => {
    setSimCommits(commits);
    setSimBranches(recalculateBranchDivergence(branches, commits));
  };

  const restoreSnapshot = (snapshot: GitRebaseSessionSnapshot) => {
    setSimCommits(snapshot.commits.map((commit) => ({ ...commit })));
    setSimBranches(
      recalculateBranchDivergence(
        snapshot.branches.map((branch) => ({ ...branch })),
        snapshot.commits,
      ),
    );
    setSimCurrentBranch(snapshot.currentBranch);
    setSyntheticIndex(snapshot.syntheticIndex);
    setHighlightedCommitHash(
      getCurrentCommitHash(snapshot.branches, snapshot.currentBranch),
    );
  };

  const resetSimulator = () => {
    const nextCommits = cloneInitialCommits();
    const nextBranches = recalculateBranchDivergence(
      cloneInitialBranches(),
      nextCommits,
    );
    setSimCommits(nextCommits);
    setSimBranches(nextBranches);
    setSimCurrentBranch(GIT_REBASE_SIM_INITIAL_CURRENT_BRANCH);
    setSimLastCommand("Reset Demo");
    setSimTerminalHeadline("พร้อมทดลองคำสั่ง git rebase");
    setSimTerminalTone("hint");
    setSimMessage(
      "รีเซ็ต simulator กลับค่าเริ่มต้นแล้ว ลองเริ่มใหม่ด้วย git rebase main หรือ -i",
    );
    setCommandInput("git rebase main");
    setHighlightedCommitHash(undefined);
    setRebaseSession(null);
    setInteractivePlan(null);
    setRebaseSnapshot(null);
    setSyntheticIndex(0);
  };

  const runSwitchToBranch = (targetBranch: string) => {
    if (rebaseSession || interactivePlan) {
      setTerminalState(
        `git switch ${targetBranch}`,
        "warning",
        "ห้ามสลับ branch ขณะมี rebase session/interactive plan ค้างอยู่",
      );
      return;
    }

    const target = simBranches.find((branch) => branch.name === targetBranch);
    if (!target) {
      setTerminalState(
        `error: branch '${targetBranch}' not found`,
        "warning",
        `สลับไม่สำเร็จ: ไม่พบ branch ${targetBranch}`,
      );
      return;
    }

    if (targetBranch === simCurrentBranch) {
      setTerminalState(
        `Already on '${targetBranch}'`,
        "hint",
        `ตอนนี้อยู่ ${targetBranch} อยู่แล้ว`,
      );
      setHighlightedCommitHash(target.shortHash);
      return;
    }

    setSimCurrentBranch(targetBranch);
    setHighlightedCommitHash(target.shortHash);
    setTerminalState(
      `Switched to branch '${targetBranch}'`,
      "success",
      `สลับไป ${targetBranch} แล้ว`,
    );
  };

  const runRebaseStart = (targetBranchName: string, interactive: boolean) => {
    if (rebaseSession || interactivePlan) {
      setTerminalState(
        `git rebase ${interactive ? "-i " : ""}${targetBranchName}`,
        "warning",
        "มี rebase session/plan ค้างอยู่ก่อนหน้า ให้ continue, skip, abort หรือ apply ให้จบก่อน",
      );
      return;
    }

    const branchLookup = buildBranchLookup(simBranches);
    const sourceBranch = branchLookup.get(simCurrentBranch);
    const targetBranch = branchLookup.get(targetBranchName);
    if (!sourceBranch || !targetBranch) {
      setTerminalState(
        `error: cannot resolve branch '${targetBranchName}'`,
        "warning",
        `เริ่ม rebase ไม่สำเร็จ: ไม่พบ branch เป้าหมาย ${targetBranchName}`,
      );
      return;
    }

    if (sourceBranch.name === targetBranch.name) {
      setTerminalState(
        `error: invalid upstream '${targetBranchName}'`,
        "warning",
        "target branch ต้องไม่ใช่ branch เดียวกับ current branch",
      );
      return;
    }

    const replayCommits = resolveReplayCommits(
      simCommits,
      sourceBranch.shortHash,
      targetBranch.shortHash,
    );

    if (!replayCommits.length) {
      setTerminalState(
        "Already up to date.",
        "hint",
        `ไม่มี commit ใหม่ให้ replay จาก ${sourceBranch.name} ไป ${targetBranch.name}`,
      );
      return;
    }

    setRebaseSnapshot(buildSnapshot());

    if (interactive) {
      const todo = buildTodoFromReplayCommits(replayCommits);
      setInteractivePlan({
        sourceBranch: sourceBranch.name,
        targetBranch: targetBranch.name,
        replayCommits,
        todo,
        baseHeadHash: targetBranch.shortHash,
      });
      setTerminalState(
        `interactive rebase plan: ${sourceBranch.name} onto ${targetBranch.name}`,
        "hint",
        `สร้าง todo list แล้ว (${todo.length} รายการ). ปรับลำดับ/squash แล้วกด Apply Plan`,
      );
      return;
    }

    const queue = buildQueueFromCommits(replayCommits);
    setRebaseSession({
      mode: "inProgress",
      sourceBranch: sourceBranch.name,
      targetBranch: targetBranch.name,
      queue,
      nextParentHash: targetBranch.shortHash,
      nextSyntheticIndex: syntheticIndex,
      conflict: null,
      mapping: [],
      interactive: false,
    });
    setTerminalState(
      `rebase: ${sourceBranch.name} onto ${targetBranch.name}`,
      "warning",
      `เริ่ม rebase แล้ว เหลือ ${queue.length} queue item. ใช้ git rebase --continue เพื่อ replay`,
    );
  };

  const applyInteractivePlan = () => {
    if (!interactivePlan) {
      setTerminalState(
        "git rebase --continue",
        "warning",
        "ยังไม่มี interactive plan ให้ apply",
      );
      return;
    }

    if (rebaseSession) {
      setTerminalState(
        "git rebase --continue",
        "warning",
        "มี rebase session ทำงานอยู่แล้ว",
      );
      return;
    }

    const queue = buildQueueFromTodo(
      interactivePlan.todo,
      interactivePlan.replayCommits,
    );
    if (!queue.length) {
      setTerminalState(
        "error: empty todo list",
        "warning",
        "todo list ว่างเกินไป ไม่สามารถเริ่ม rebase ได้",
      );
      return;
    }

    setRebaseSession({
      mode: "inProgress",
      sourceBranch: interactivePlan.sourceBranch,
      targetBranch: interactivePlan.targetBranch,
      queue,
      nextParentHash: interactivePlan.baseHeadHash,
      nextSyntheticIndex: syntheticIndex,
      conflict: null,
      mapping: [],
      interactive: true,
    });
    setInteractivePlan(null);
    setTerminalState(
      `interactive plan applied (${queue.length} queue item)`,
      "warning",
      "เริ่ม replay จาก interactive plan แล้ว ใช้ git rebase --continue ทีละขั้น",
    );
  };

  const cancelInteractivePlan = () => {
    if (!interactivePlan) {
      return;
    }
    setInteractivePlan(null);
    setRebaseSnapshot(null);
    setTerminalState(
      "interactive plan canceled",
      "hint",
      "ยกเลิก todo plan แล้ว ยังไม่มี commit ไหนถูก rewrite",
    );
  };

  const runRebaseAbort = () => {
    if (!rebaseSession && !interactivePlan) {
      setTerminalState(
        "fatal: No rebase in progress?",
        "warning",
        "ไม่มี rebase session หรือ interactive plan ค้างอยู่",
      );
      return;
    }

    if (!rebaseSnapshot) {
      setRebaseSession(null);
      setInteractivePlan(null);
      setTerminalState(
        "git rebase --abort",
        "warning",
        "ไม่พบ snapshot สำหรับ rollback จึงเคลียร์ session ให้ก่อน",
      );
      return;
    }

    restoreSnapshot(rebaseSnapshot);
    setRebaseSession(null);
    setInteractivePlan(null);
    setRebaseSnapshot(null);
    setTerminalState(
      "Rebase aborted.",
      "success",
      "abort สำเร็จ: กลับไปสถานะก่อนเริ่ม rebase แล้ว",
    );
  };

  const runGitAdd = (filePath: string) => {
    if (!rebaseSession || !rebaseSession.conflict) {
      setTerminalState(
        `git add ${filePath}`,
        "warning",
        "ตอนนี้ไม่มี conflict ที่ต้อง stage เพิ่ม",
      );
      return;
    }

    if (filePath !== rebaseSession.conflict.filePath) {
      setTerminalState(
        `git add ${filePath}`,
        "warning",
        `ไฟล์ไม่ตรงกับ conflict gate (คาดว่า ${rebaseSession.conflict.filePath})`,
      );
      return;
    }

    setRebaseSession((prev) => {
      if (!prev || !prev.conflict) {
        return prev;
      }
      return {
        ...prev,
        mode: "inProgress",
        conflict: {
          ...prev.conflict,
          resolved: true,
        },
      };
    });

    setTerminalState(
      `git add ${filePath}`,
      "success",
      "staged conflict file แล้ว สามารถรัน git rebase --continue ต่อได้",
    );
  };

  const runRebaseSkip = () => {
    if (interactivePlan) {
      setTerminalState(
        "git rebase --skip",
        "warning",
        "ยังอยู่ใน interactive plan ให้ apply plan ก่อน",
      );
      return;
    }

    if (!rebaseSession) {
      setTerminalState(
        "git rebase --skip",
        "warning",
        "ไม่มี rebase session ให้ skip",
      );
      return;
    }

    const currentItem = rebaseSession.queue[0];
    if (!currentItem) {
      setRebaseSession(null);
      setRebaseSnapshot(null);
      setTerminalState(
        "git rebase --skip",
        "hint",
        "queue ว่างแล้ว ไม่มี item ให้ skip",
      );
      return;
    }

    const nextQueue = rebaseSession.queue.slice(1);
    if (!nextQueue.length) {
      setRebaseSession(null);
      setRebaseSnapshot(null);
      setTerminalState(
        "git rebase --skip",
        "success",
        `ข้าม ${currentItem.message} แล้ว queue หมด session`,
      );
      return;
    }

    setRebaseSession({
      ...rebaseSession,
      mode: "inProgress",
      conflict: null,
      queue: nextQueue,
    });
    setTerminalState(
      "git rebase --skip",
      "warning",
      `ข้าม ${currentItem.message} แล้ว เหลือ ${nextQueue.length} item`,
    );
  };

  const runRebaseContinue = () => {
    if (interactivePlan) {
      setTerminalState(
        "git rebase --continue",
        "warning",
        "กำลังอยู่ใน interactive plan ให้กด Apply Plan ก่อน",
      );
      return;
    }

    if (!rebaseSession) {
      setTerminalState(
        "git rebase --continue",
        "warning",
        "ไม่พบ rebase session ที่กำลังทำงาน",
      );
      return;
    }

    const currentItem = rebaseSession.queue[0];
    if (!currentItem) {
      setRebaseSession(null);
      setRebaseSnapshot(null);
      setTerminalState(
        "git rebase --continue",
        "success",
        "ไม่มี queue item คงเหลือแล้ว",
      );
      return;
    }

    const conflictRule = findConflictRuleForQueueItem(currentItem);
    if (conflictRule) {
      const hasActiveConflict =
        rebaseSession.conflict && rebaseSession.conflict.itemId === currentItem.id;

      if (!hasActiveConflict) {
        setRebaseSession({
          ...rebaseSession,
          mode: "conflict",
          conflict: {
            itemId: currentItem.id,
            sourceCommitId: conflictRule.sourceCommitId,
            filePath: conflictRule.filePath,
            reason: conflictRule.reason,
            resolved: false,
          },
        });
        setTerminalState(
          `CONFLICT (${conflictRule.filePath})`,
          "warning",
          `${conflictRule.reason}. แก้ไฟล์แล้วรัน git add ${conflictRule.filePath}`,
        );
        return;
      }

      if (rebaseSession.conflict && !rebaseSession.conflict.resolved) {
        setTerminalState(
          "error: conflict not resolved",
          "warning",
          `ต้องรัน git add ${rebaseSession.conflict.filePath} ก่อน continue`,
        );
        return;
      }
    }

    const parentCommit = simCommits.find(
      (commit) => commit.shortHash === rebaseSession.nextParentHash,
    );

    if (!parentCommit) {
      setTerminalState(
        "error: missing parent commit for replay",
        "warning",
        "ไม่พบ parent ของ queue item นี้ จึง replay ต่อไม่ได้",
      );
      return;
    }

    const nextHash = buildSyntheticHash(rebaseSession.nextSyntheticIndex);
    const isSquashed = currentItem.sourceCommitIds.length > 1;
    const replayedCommit: GitRebaseSimulatorCommit = {
      id: `r-${rebaseSession.nextSyntheticIndex + 1}`,
      shortHash: nextHash,
      message: isSquashed
        ? `squash: ${currentItem.message}`
        : `${currentItem.message} (rebased)`,
      lane: 1,
      parentId: parentCommit.id,
      author: currentItem.author,
      dateLabel: `4 Sep 2019 00:${(8 + rebaseSession.nextSyntheticIndex)
        .toString()
        .padStart(2, "0")}`,
    };

    const nextCommits = [replayedCommit, ...simCommits];
    const nextBranches = simBranches.map((branch) =>
      branch.name === rebaseSession.sourceBranch
        ? { ...branch, shortHash: nextHash }
        : branch,
    );
    applyCommitAndBranchState({
      commits: nextCommits,
      branches: nextBranches,
    });
    setHighlightedCommitHash(nextHash);

    const nextMapping = [
      ...rebaseSession.mapping,
      ...currentItem.sourceShortHashes.map((sourceHash) => ({
        sourceHash,
        rebasedHash: nextHash,
      })),
    ];
    const nextQueue = rebaseSession.queue.slice(1);
    const nextSyntheticIndex = rebaseSession.nextSyntheticIndex + 1;
    setSyntheticIndex(nextSyntheticIndex);

    if (!nextQueue.length) {
      setRebaseSession(null);
      setRebaseSnapshot(null);
      setTerminalState(
        "Successfully rebased and updated branch pointer.",
        "success",
        `rebase เสร็จแล้ว: rewrite ${nextMapping.length} commit hash (${rebaseSession.sourceBranch})`,
      );
      return;
    }

    setRebaseSession({
      ...rebaseSession,
      mode: "inProgress",
      queue: nextQueue,
      nextParentHash: nextHash,
      nextSyntheticIndex,
      conflict: null,
      mapping: nextMapping,
    });
    setTerminalState(
      "git rebase --continue",
      "success",
      `replay สำเร็จ: ${currentItem.message}. เหลือ ${nextQueue.length} item`,
    );
  };

  const handleStatus = () => {
    if (interactivePlan) {
      setTerminalState(
        "git status",
        "hint",
        `interactive plan พร้อมแล้ว (${interactivePlan.todo.length} item) รอ apply`,
      );
      return;
    }

    if (!rebaseSession) {
      setTerminalState(
        "git status",
        "hint",
        `on branch ${simCurrentBranch}. working tree clean (simulation)`,
      );
      return;
    }

    if (rebaseSession.conflict && !rebaseSession.conflict.resolved) {
      setTerminalState(
        "git status",
        "warning",
        `rebase paused: resolve ${rebaseSession.conflict.filePath} แล้ว git add ก่อน continue`,
      );
      return;
    }

    setTerminalState(
      "git status",
      "hint",
      `rebase in progress on ${rebaseSession.sourceBranch} (${rebaseSession.queue.length} item left)`,
    );
  };

  const handleLog = () => {
    setTerminalState(
      "git log --oneline --graph --decorate --all",
      "hint",
      "แสดง graph ล่าสุดของ simulator",
    );
  };

  const moveTodoItem = (todoItemId: string, direction: "up" | "down") => {
    setInteractivePlan((prev) => {
      if (!prev) {
        return prev;
      }

      const currentIndex = prev.todo.findIndex((item) => item.id === todoItemId);
      if (currentIndex < 0) {
        return prev;
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.todo.length) {
        return prev;
      }

      const todo = [...prev.todo];
      const [movedItem] = todo.splice(currentIndex, 1);
      todo.splice(targetIndex, 0, movedItem);

      if (todo[0] && todo[0].action === "squash") {
        todo[0] = {
          ...todo[0],
          action: "pick",
        };
      }

      return {
        ...prev,
        todo,
      };
    });
  };

  const toggleTodoAction = (todoItemId: string) => {
    setInteractivePlan((prev) => {
      if (!prev) {
        return prev;
      }

      const targetIndex = prev.todo.findIndex((item) => item.id === todoItemId);
      if (targetIndex < 0 || targetIndex === 0) {
        return prev;
      }

      const todo = prev.todo.map<GitRebaseTodoItem>((item, index) => {
        if (index !== targetIndex) {
          return item;
        }

        return {
          ...item,
          action: item.action === "pick" ? "squash" : "pick",
        };
      });

      return {
        ...prev,
        todo,
      };
    });
  };

  const runCommand = (rawCommand: string) => {
    const command = rawCommand.trim();
    if (!command) {
      setTerminalState("error", "warning", "กรุณาใส่คำสั่งก่อน");
      return;
    }

    setSimLastCommand(command);
    const tokens = command.split(/\s+/);
    const [program, subcommand, ...args] = tokens;

    if (program !== "git") {
      setTerminalState(
        "error: unknown command",
        "warning",
        "เดโมนี้รองรับเฉพาะคำสั่งที่ขึ้นต้นด้วย git",
      );
      return;
    }

    if (subcommand === "rebase") {
      const target = args[0];
      if (!target) {
        setTerminalState(
          "git rebase",
          "warning",
          "รูปแบบที่รองรับ: git rebase <branch>, -i <branch>, --continue, --skip, --abort",
        );
        return;
      }

      if (target === "--continue") {
        if (args.length > 1) {
          setTerminalState(
            "git rebase --continue",
            "warning",
            "เดโมนี้รองรับ --continue แบบไม่มีอาร์กิวเมนต์เพิ่ม",
          );
          return;
        }
        runRebaseContinue();
        return;
      }

      if (target === "--skip") {
        if (args.length > 1) {
          setTerminalState(
            "git rebase --skip",
            "warning",
            "เดโมนี้รองรับ --skip แบบไม่มีอาร์กิวเมนต์เพิ่ม",
          );
          return;
        }
        runRebaseSkip();
        return;
      }

      if (target === "--abort") {
        if (args.length > 1) {
          setTerminalState(
            "git rebase --abort",
            "warning",
            "เดโมนี้รองรับ --abort แบบไม่มีอาร์กิวเมนต์เพิ่ม",
          );
          return;
        }
        runRebaseAbort();
        return;
      }

      if (target === "-i" || target === "--interactive") {
        const targetBranchName = args[1];
        if (!targetBranchName || args.length > 2) {
          setTerminalState(
            "git rebase -i",
            "warning",
            "รูปแบบที่รองรับ: git rebase -i <branch>",
          );
          return;
        }
        runRebaseStart(targetBranchName, true);
        return;
      }

      if (target.startsWith("--")) {
        setTerminalState(
          `git rebase ${target}`,
          "warning",
          "ยังไม่รองรับ option นี้ในเดโม",
        );
        return;
      }

      if (args.length > 1) {
        setTerminalState(
          `git rebase ${target}`,
          "warning",
          "เดโมนี้รองรับรูปแบบพื้นฐาน: git rebase <branch>",
        );
        return;
      }

      runRebaseStart(target, false);
      return;
    }

    if (subcommand === "add") {
      const filePath = args[0];
      if (!filePath) {
        setTerminalState(
          "git add",
          "warning",
          "ระบุไฟล์ที่ต้องการ stage เช่น git add auth.tsx",
        );
        return;
      }
      runGitAdd(filePath);
      return;
    }

    if (subcommand === "switch" || subcommand === "checkout") {
      const targetBranchName = args[0];
      if (!targetBranchName) {
        setTerminalState(
          `git ${subcommand}`,
          "warning",
          "ระบุ branch ที่ต้องการสลับ เช่น git switch feature/login",
        );
        return;
      }
      runSwitchToBranch(targetBranchName);
      return;
    }

    if (subcommand === "status") {
      handleStatus();
      return;
    }

    if (subcommand === "log") {
      handleLog();
      return;
    }

    setTerminalState(
      `git ${subcommand ?? ""}`.trim(),
      "warning",
      "คำสั่งนี้ยังไม่รองรับในหน้า rebase simulator",
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SetupGuideHeader
        badge="Merge & Rebase"
        title="git rebase: Deep Simulation + Interactive Plan"
        description="ยกระดับการสอน rebase ด้วย flow ที่ใกล้ของจริง: conflict gate, --skip, --abort และ interactive todo (reorder/squash)"
      />

      <Accordion
        type="multiple"
        defaultValue={["interactive-rebase-simulator"]}
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
          คำสั่งหลักสำหรับ rebase ที่ต้องใช้จริงใน flow ปกติและ interactive
        </p>

        <div className="mt-4 space-y-4">
          {GIT_REBASE_COMMAND_DOCS.map((doc) => {
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

        <AccordionItem value="interactive-reference" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Interactive Rebase Reference (Detailed)
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Interactive Rebase Reference (Detailed)
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          อ้างอิงรูปแบบ todo file และความหมายคำสั่ง `git rebase -i` แบบละเอียดเพื่อใช้งานกับ Git จริง
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-base font-bold text-foreground">
              Todo File Example
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              ตัวอย่างไฟล์ที่ editor เปิดขึ้นมาเมื่อรัน `git rebase -i`
            </p>
            <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-slate-700 bg-black p-4 text-xs leading-6 text-slate-200">
              <code>{GIT_REBASE_INTERACTIVE_TODO_EXAMPLE}</code>
            </pre>
          </article>

          <article className="rounded-xl border border-amber-400/35 bg-amber-400/10 p-4">
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
              Simulator Coverage
            </h3>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              ขอบเขตของหน้า demo เทียบกับ Git จริง
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-900 dark:text-amber-200">
              {GIT_REBASE_INTERACTIVE_SIMULATOR_COVERAGE.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>

            <h4 className="mt-5 text-sm font-semibold text-amber-900 dark:text-amber-200">
              Important Rules
            </h4>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-amber-900 dark:text-amber-200">
              {GIT_REBASE_INTERACTIVE_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[980px] table-fixed text-sm">
              <thead className="bg-muted text-foreground">
                <tr>
                  <th className="w-[150px] border-b border-r border-border px-3 py-2 text-left font-semibold">
                    Command
                  </th>
                  <th className="w-[250px] border-b border-r border-border px-3 py-2 text-left font-semibold">
                    Syntax
                  </th>
                  <th className="w-[220px] border-b border-r border-border px-3 py-2 text-left font-semibold">
                    ใช้เมื่อไหร่
                  </th>
                  <th className="border-b border-r border-border px-3 py-2 text-left font-semibold">
                    ความหมาย
                  </th>
                  <th className="border-b border-border px-3 py-2 text-left font-semibold">
                    ข้อควรระวัง
                  </th>
                </tr>
              </thead>

              <tbody>
                {GIT_REBASE_INTERACTIVE_COMMAND_REFERENCES.map((item) => (
                  <tr key={item.id} className="border-b border-border align-top">
                    <td className="border-r border-border px-3 py-2 font-mono text-xs text-foreground">
                      {item.id}
                    </td>
                    <td className="border-r border-border px-3 py-2 font-mono text-xs text-cyan-700 dark:text-cyan-300">
                      {item.syntax}
                    </td>
                    <td className="border-r border-border px-3 py-2 text-xs text-muted-foreground">
                      {item.whenToUse}
                    </td>
                    <td className="border-r border-border px-3 py-2 text-xs text-foreground">
                      {item.summary}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {item.caution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="interactive-rebase-simulator" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Interactive Rebase Simulator
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Interactive Rebase Simulator
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทดสอบ state machine ของ rebase แบบ step-by-step: start, conflict gate, continue,
          skip, abort และ interactive plan
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCommandInput("git switch feature/login");
              runCommand("git switch feature/login");
            }}
          >
            git switch feature/login
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCommandInput("git switch feature/conflict");
              runCommand("git switch feature/conflict");
            }}
          >
            git switch feature/conflict
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCommandInput("git rebase main");
              runCommand("git rebase main");
            }}
          >
            git rebase main
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCommandInput("git rebase -i main");
              runCommand("git rebase -i main");
            }}
          >
            git rebase -i main
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCommandInput("git rebase --continue");
              runCommand("git rebase --continue");
            }}
          >
            git rebase --continue
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCommandInput("git add auth.tsx");
              runCommand("git add auth.tsx");
            }}
          >
            git add auth.tsx
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCommandInput("git rebase --skip");
              runCommand("git rebase --skip");
            }}
          >
            git rebase --skip
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCommandInput("git rebase --abort");
              runCommand("git rebase --abort");
            }}
          >
            git rebase --abort
          </Button>
          <Button type="button" variant="outline" onClick={resetSimulator}>
            Reset Demo
          </Button>
        </div>

        <form
          className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            runCommand(commandInput);
          }}
        >
          <input
            value={commandInput}
            onChange={(event) => setCommandInput(event.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
            placeholder="พิมพ์คำสั่ง เช่น git rebase -i main"
          />
          <Button type="submit" className="shrink-0">
            Run Command
          </Button>
        </form>

        {interactivePlan ? (
          <div className="mt-4 rounded-xl border border-amber-400/35 bg-amber-400/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Interactive Todo Plan
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  source: {interactivePlan.sourceBranch} onto {interactivePlan.targetBranch}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={applyInteractivePlan}>
                  Apply Plan
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={cancelInteractivePlan}
                >
                  Cancel Plan
                </Button>
              </div>
            </div>

            <div className="mt-3 overflow-hidden rounded-lg border border-amber-300/40 bg-white/70">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-amber-100/60 text-amber-900">
                  <tr>
                    <th className="w-[120px] px-3 py-2 text-left font-semibold">Action</th>
                    <th className="w-[120px] px-3 py-2 text-left font-semibold">Commit</th>
                    <th className="px-3 py-2 text-left font-semibold">Message</th>
                    <th className="w-[180px] px-3 py-2 text-left font-semibold">Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {interactivePlan.todo.map((todoItem, index) => {
                    const isFirst = index === 0;
                    return (
                      <tr key={todoItem.id} className="border-t border-amber-200/70">
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className={`rounded px-2 py-1 text-xs font-semibold ${
                              todoItem.action === "pick"
                                ? "bg-emerald-500/20 text-emerald-800"
                                : "bg-violet-500/20 text-violet-800"
                            }`}
                            onClick={() => toggleTodoAction(todoItem.id)}
                            disabled={isFirst}
                          >
                            {todoItem.action}
                          </button>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {todoItem.sourceShortHash}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          {todoItem.message}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => moveTodoItem(todoItem.id, "up")}
                              disabled={index === 0}
                            >
                              Up
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => moveTodoItem(todoItem.id, "down")}
                              disabled={index === interactivePlan.todo.length - 1}
                            >
                              Down
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-xl border border-[#3b3b3b] bg-[#1f1f1f] text-slate-100">
          <div className="border-b border-[#3b3b3b] p-3">
            <div className="mt-1 flex flex-wrap items-center gap-2">
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
                      setCommandInput(`git switch ${branch.name}`);
                      runCommand(`git switch ${branch.name}`);
                    }}
                  >
                    {branch.name}
                    {branch.name === "main"
                      ? ""
                      : ` (+${branch.ahead}/-${branch.behind})`}
                  </button>
                );
              })}
            </div>

            {rebaseSession ? (
              <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                Rebase in progress จาก {rebaseSession.sourceBranch} ไป{" "}
                {rebaseSession.targetBranch}. คงเหลือ {rebaseSession.queue.length} queue item
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

          <p className={`mt-4 text-xs ${TERMINAL_TONE_CLASS.label}`}>
            Simulator message
          </p>
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
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Safety Notes
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ใช้กติกาเหล่านี้เพื่อให้ rebase ปลอดภัยและอ่านประวัติย้อนหลังได้ชัด
        </p>
        <ul className="mt-4 list-disc space-y-2 rounded-xl border border-border bg-muted/30 p-4 pl-8 text-sm leading-6 text-foreground">
          {GIT_REBASE_SAFETY_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="lab-collection" className="border-0">
          <AccordionTrigger className="rounded-xl border border-border bg-card px-4 py-3 text-base font-black tracking-tight text-foreground hover:no-underline md:px-6">
            Lab Collection
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Lab Collection</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ชุดฝึกนี้แยกเป็น 3 sandbox repos เพื่อให้ซ้อม rebase หลายรูปแบบจนชิน
          ตั้งแต่ linear replay, interactive cleanup, `--onto` ไปจนถึง conflict
          recovery ด้วย continue, abort และ skip
        </p>
        <GitRebaseLabAccordion
          copyStatusByCommand={copyStatusByCommand}
          onCopyCommand={handleCopyCommand}
        />
      </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
