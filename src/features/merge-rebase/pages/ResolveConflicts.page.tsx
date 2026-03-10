import { useMemo, useState } from "react";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import { Button } from "@/shared/components/ui/button";
import {
  RESOLVE_CONFLICT_DEFAULT_COMMAND_INPUT,
  RESOLVE_CONFLICT_MERGE_INITIAL_BRANCHES,
  RESOLVE_CONFLICT_MERGE_INITIAL_COMMITS,
  RESOLVE_CONFLICT_MERGE_INITIAL_CURRENT_BRANCH,
  RESOLVE_CONFLICT_MERGE_QUICK_COMMANDS,
  RESOLVE_CONFLICT_MERGE_RULE,
  RESOLVE_CONFLICT_MERGE_SAFETY_NOTES,
  RESOLVE_CONFLICT_MERGE_SYNTHETIC_HASHES,
  RESOLVE_CONFLICT_MODE_META,
  RESOLVE_CONFLICT_REBASE_INITIAL_BRANCHES,
  RESOLVE_CONFLICT_REBASE_INITIAL_COMMITS,
  RESOLVE_CONFLICT_REBASE_INITIAL_CURRENT_BRANCH,
  RESOLVE_CONFLICT_REBASE_QUICK_COMMANDS,
  RESOLVE_CONFLICT_REBASE_RULES,
  RESOLVE_CONFLICT_REBASE_SAFETY_NOTES,
  RESOLVE_CONFLICT_REBASE_SYNTHETIC_HASHES,
  type ResolveConflictBranch,
  type ResolveConflictCommit,
  type ResolveConflictMode,
} from "@/features/merge-rebase/constants/resolve-conflicts-content.constant";

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

type MergeSnapshot = {
  branches: ResolveConflictBranch[];
  commits: ResolveConflictCommit[];
  currentBranch: string;
  nextSyntheticIndex: number;
};

type MergeSessionState = {
  sourceBranch: string;
  filePath: string;
  reason: string;
  staged: boolean;
  snapshot: MergeSnapshot;
};

type MergeSimulatorState = {
  branches: ResolveConflictBranch[];
  commits: ResolveConflictCommit[];
  currentBranch: string;
  mergeSession: MergeSessionState | null;
  nextSyntheticIndex: number;
  lastCommand: string;
  headline: string;
  tone: TerminalTone;
  message: string;
};

type RebaseQueueItem = {
  id: string;
  sourceCommitId: string;
  sourceShortHash: string;
  message: string;
  author: string;
};

type RebaseConflictState = {
  itemId: string;
  filePath: string;
  reason: string;
  resolved: boolean;
};

type RebaseSnapshot = {
  branches: ResolveConflictBranch[];
  commits: ResolveConflictCommit[];
  currentBranch: string;
  nextSyntheticIndex: number;
};

type RebaseSessionState = {
  sourceBranch: string;
  targetBranch: string;
  queue: RebaseQueueItem[];
  nextParentHash: string;
  conflict: RebaseConflictState | null;
  mapping: { sourceHash: string; rebasedHash: string }[];
  snapshot: RebaseSnapshot;
};

type RebaseSimulatorState = {
  branches: ResolveConflictBranch[];
  commits: ResolveConflictCommit[];
  currentBranch: string;
  rebaseSession: RebaseSessionState | null;
  nextSyntheticIndex: number;
  lastCommand: string;
  headline: string;
  tone: TerminalTone;
  message: string;
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

const cloneBranches = (branches: ResolveConflictBranch[]) =>
  branches.map((branch) => ({ ...branch }));

const cloneCommits = (commits: ResolveConflictCommit[]) =>
  commits.map((commit) => ({ ...commit }));

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

const buildLabelsByHash = (
  branches: ResolveConflictBranch[],
  currentBranch: string,
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

const renderBranchLines = (
  branches: ResolveConflictBranch[],
  currentBranch: string,
): TerminalLine[] =>
  branches.map((branch) => {
    const isCurrent = branch.name === currentBranch;
    const divergedText =
      branch.name === "main" ? "" : ` (ahead ${branch.ahead}, behind ${branch.behind})`;

    return {
      text: `${isCurrent ? "* " : "  "}${branch.name}${divergedText}`,
      tone: isCurrent ? "current" : "normal",
    };
  });

const renderGraphLines = (
  commits: ResolveConflictCommit[],
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

const getSyntheticHash = (
  pool: readonly string[],
  index: number,
  fallbackPrefix: string,
) => {
  const hash = pool[index];
  if (hash) {
    return hash;
  }
  return `${fallbackPrefix}${(index + 1).toString(16).padStart(6, "0")}`;
};

const updateBranchHash = (
  branches: ResolveConflictBranch[],
  branchName: string,
  nextHash: string,
) =>
  branches.map((branch) =>
    branch.name === branchName ? { ...branch, shortHash: nextHash } : branch,
  );

const buildCommitByIdMap = (commits: ResolveConflictCommit[]) =>
  new Map(commits.map((commit) => [commit.id, commit]));

const buildCommitByHashMap = (commits: ResolveConflictCommit[]) =>
  new Map(commits.map((commit) => [commit.shortHash, commit]));

const setMergeTerminal = (
  state: MergeSimulatorState,
  lastCommand: string,
  tone: TerminalTone,
  headline: string,
  message: string,
): MergeSimulatorState => ({
  ...state,
  lastCommand,
  tone,
  headline,
  message,
});

const setRebaseTerminal = (
  state: RebaseSimulatorState,
  lastCommand: string,
  tone: TerminalTone,
  headline: string,
  message: string,
): RebaseSimulatorState => ({
  ...state,
  lastCommand,
  tone,
  headline,
  message,
});

const createInitialMergeState = (): MergeSimulatorState => ({
  branches: cloneBranches(RESOLVE_CONFLICT_MERGE_INITIAL_BRANCHES),
  commits: cloneCommits(RESOLVE_CONFLICT_MERGE_INITIAL_COMMITS),
  currentBranch: RESOLVE_CONFLICT_MERGE_INITIAL_CURRENT_BRANCH,
  mergeSession: null,
  nextSyntheticIndex: 0,
  lastCommand: "git switch main",
  headline: "พร้อมเริ่ม merge conflict simulator",
  tone: "hint",
  message: "เริ่มด้วย git merge feature/conflict-demo เพื่อ trigger conflict",
});

const createInitialRebaseState = (): RebaseSimulatorState => ({
  branches: cloneBranches(RESOLVE_CONFLICT_REBASE_INITIAL_BRANCHES),
  commits: cloneCommits(RESOLVE_CONFLICT_REBASE_INITIAL_COMMITS),
  currentBranch: RESOLVE_CONFLICT_REBASE_INITIAL_CURRENT_BRANCH,
  rebaseSession: null,
  nextSyntheticIndex: 0,
  lastCommand: "git switch feature/conflict",
  headline: "พร้อมเริ่ม rebase conflict simulator",
  tone: "hint",
  message: "เริ่มด้วย git rebase main แล้วใช้ git add auth.tsx ก่อน continue",
});

const renderMergeTerminalLines = (
  state: MergeSimulatorState,
): TerminalLine[] => {
  const labelsByHash = buildLabelsByHash(state.branches, state.currentBranch);
  const mergeSessionLines: TerminalLine[] = state.mergeSession
    ? [
        {
          text: `CONFLICT (${state.mergeSession.filePath}): ${state.mergeSession.reason}`,
          tone: "warning",
        },
        {
          text: state.mergeSession.staged
            ? "all conflicts fixed: run git commit -m \"...\""
            : `resolve file and run git add ${state.mergeSession.filePath}`,
          tone: "hint",
        },
      ]
    : [];

  return [
    { text: state.headline, tone: state.tone },
    ...mergeSessionLines,
    { text: "", tone: "normal" },
    { text: "# git branch", tone: "hint" },
    ...renderBranchLines(state.branches, state.currentBranch),
    { text: "", tone: "normal" },
    { text: "# git log --oneline --graph --decorate --all", tone: "hint" },
    ...renderGraphLines(state.commits, labelsByHash),
  ];
};

const renderRebaseTerminalLines = (
  state: RebaseSimulatorState,
): TerminalLine[] => {
  const labelsByHash = buildLabelsByHash(state.branches, state.currentBranch);
  const rebaseSessionLines: TerminalLine[] = [];

  if (state.rebaseSession) {
    rebaseSessionLines.push({
      text: `rebase: ${state.rebaseSession.sourceBranch} onto ${state.rebaseSession.targetBranch} (${state.rebaseSession.queue.length} item left)`,
      tone: state.rebaseSession.conflict ? "warning" : "hint",
    });

    if (state.rebaseSession.conflict) {
      rebaseSessionLines.push({
        text: `CONFLICT (${state.rebaseSession.conflict.filePath}): ${state.rebaseSession.conflict.reason}`,
        tone: "warning",
      });
      rebaseSessionLines.push({
        text: state.rebaseSession.conflict.resolved
          ? "conflict staged. run git rebase --continue"
          : `resolve then run git add ${state.rebaseSession.conflict.filePath}`,
        tone: "hint",
      });
    }

    if (state.rebaseSession.mapping.length) {
      state.rebaseSession.mapping.slice(-3).forEach((item) => {
        rebaseSessionLines.push({
          text: `rewrite: ${item.sourceHash} -> ${item.rebasedHash}`,
          tone: "hint",
        });
      });
    }
  }

  return [
    { text: state.headline, tone: state.tone },
    ...rebaseSessionLines,
    { text: "", tone: "normal" },
    { text: "# git branch", tone: "hint" },
    ...renderBranchLines(state.branches, state.currentBranch),
    { text: "", tone: "normal" },
    { text: "# git log --oneline --graph --decorate --all", tone: "hint" },
    ...renderGraphLines(state.commits, labelsByHash),
  ];
};

const collectRebaseQueue = (
  commits: ResolveConflictCommit[],
  branches: ResolveConflictBranch[],
  sourceBranchName: string,
  targetBranchName: string,
): RebaseQueueItem[] => {
  const sourceHeadHash = branches.find(
    (branch) => branch.name === sourceBranchName,
  )?.shortHash;
  const targetHeadHash = branches.find(
    (branch) => branch.name === targetBranchName,
  )?.shortHash;

  if (!sourceHeadHash || !targetHeadHash) {
    return [];
  }

  const byHash = buildCommitByHashMap(commits);
  const byId = buildCommitByIdMap(commits);

  const targetAncestors = new Set<string>();
  let targetCursor = byHash.get(targetHeadHash);
  while (targetCursor) {
    targetAncestors.add(targetCursor.shortHash);
    if (!targetCursor.parentId) {
      break;
    }
    targetCursor = byId.get(targetCursor.parentId);
  }

  const replayCommits: ResolveConflictCommit[] = [];
  let sourceCursor = byHash.get(sourceHeadHash);
  while (sourceCursor && !targetAncestors.has(sourceCursor.shortHash)) {
    replayCommits.push(sourceCursor);
    sourceCursor = sourceCursor.parentId
      ? byId.get(sourceCursor.parentId)
      : undefined;
  }

  return replayCommits.reverse().map((commit, index) => ({
    id: `queue-${index + 1}`,
    sourceCommitId: commit.id,
    sourceShortHash: commit.shortHash,
    message: commit.message,
    author: commit.author,
  }));
};

const runRebaseAbort = (
  previous: RebaseSimulatorState,
  lastCommand: string,
): RebaseSimulatorState => {
  if (!previous.rebaseSession) {
    return setRebaseTerminal(
      previous,
      lastCommand,
      "warning",
      "fatal: No rebase in progress?",
      "ไม่มี rebase session ที่กำลังทำงาน",
    );
  }

  const snapshot = previous.rebaseSession.snapshot;
  return {
    ...previous,
    branches: cloneBranches(snapshot.branches),
    commits: cloneCommits(snapshot.commits),
    currentBranch: snapshot.currentBranch,
    nextSyntheticIndex: snapshot.nextSyntheticIndex,
    rebaseSession: null,
    lastCommand,
    tone: "success",
    headline: "rebase aborted",
    message: "abort สำเร็จ: กลับไป snapshot ก่อนเริ่ม rebase แล้ว",
  };
};

const runRebaseAdd = (
  previous: RebaseSimulatorState,
  filePath: string,
  lastCommand: string,
): RebaseSimulatorState => {
  const session = previous.rebaseSession;
  if (!session || !session.conflict) {
    return setRebaseTerminal(
      previous,
      lastCommand,
      "warning",
      "git add",
      "ไม่มี conflict gate ที่ต้องปลดล็อก",
    );
  }

  if (filePath !== session.conflict.filePath) {
    return setRebaseTerminal(
      previous,
      lastCommand,
      "warning",
      "git add",
      `ไฟล์ไม่ตรงกับ conflict gate (คาดว่า ${session.conflict.filePath})`,
    );
  }

  return {
    ...previous,
    rebaseSession: {
      ...session,
      conflict: {
        ...session.conflict,
        resolved: true,
      },
    },
    lastCommand,
    tone: "success",
    headline: `staged ${filePath}`,
    message: "conflict file staged แล้ว สามารถรัน git rebase --continue ต่อได้",
  };
};

const runRebaseSkip = (
  previous: RebaseSimulatorState,
  lastCommand: string,
): RebaseSimulatorState => {
  const session = previous.rebaseSession;
  if (!session) {
    return setRebaseTerminal(
      previous,
      lastCommand,
      "warning",
      "git rebase --skip",
      "ไม่มี rebase session ให้ skip",
    );
  }

  const currentItem = session.queue[0];
  if (!currentItem) {
    return setRebaseTerminal(
      previous,
      lastCommand,
      "warning",
      "git rebase --skip",
      "queue ว่าง ไม่สามารถ skip ต่อได้",
    );
  }

  const nextQueue = session.queue.slice(1);
  if (!nextQueue.length) {
    return {
      ...previous,
      branches: updateBranchHash(
        previous.branches,
        session.sourceBranch,
        session.nextParentHash,
      ),
      rebaseSession: null,
      lastCommand,
      tone: "success",
      headline: "Successfully rebased and updated branch pointer.",
      message: `skip ${currentItem.sourceShortHash} แล้ว rebase session จบแล้ว`,
    };
  }

  return {
    ...previous,
    rebaseSession: {
      ...session,
      queue: nextQueue,
      conflict: null,
    },
    lastCommand,
    tone: "warning",
    headline: `skipped ${currentItem.sourceShortHash}`,
    message: `ข้าม commit ปัจจุบันแล้ว เหลือ ${nextQueue.length} item`,
  };
};

const runRebaseContinue = (
  previous: RebaseSimulatorState,
  lastCommand: string,
): RebaseSimulatorState => {
  const session = previous.rebaseSession;
  if (!session) {
    return setRebaseTerminal(
      previous,
      lastCommand,
      "warning",
      "git rebase --continue",
      "ไม่พบ rebase session ที่กำลังทำงาน",
    );
  }

  const currentItem = session.queue[0];
  if (!currentItem) {
    return {
      ...previous,
      rebaseSession: null,
      lastCommand,
      tone: "success",
      headline: "Successfully rebased and updated branch pointer.",
      message: "queue ถูก replay ครบแล้ว",
    };
  }

  if (session.conflict && !session.conflict.resolved) {
    return setRebaseTerminal(
      previous,
      lastCommand,
      "warning",
      "git rebase --continue",
      `ต้องรัน git add ${session.conflict.filePath} ก่อน continue`,
    );
  }

  const conflictRule = RESOLVE_CONFLICT_REBASE_RULES.find(
    (rule) => rule.sourceCommitId === currentItem.sourceCommitId,
  );

  const hasConflictForCurrentItem =
    session.conflict && session.conflict.itemId === currentItem.id;

  if (conflictRule && !hasConflictForCurrentItem) {
    return {
      ...previous,
      rebaseSession: {
        ...session,
        conflict: {
          itemId: currentItem.id,
          filePath: conflictRule.filePath,
          reason: conflictRule.reason,
          resolved: false,
        },
      },
      lastCommand,
      tone: "warning",
      headline: `CONFLICT (${conflictRule.filePath})`,
      message: `${conflictRule.reason}. แก้ไฟล์แล้วรัน git add ${conflictRule.filePath}`,
    };
  }

  const byHash = buildCommitByHashMap(previous.commits);
  const parent = byHash.get(session.nextParentHash);
  if (!parent) {
    return setRebaseTerminal(
      previous,
      lastCommand,
      "warning",
      "git rebase --continue",
      "state ผิดพลาด: ไม่พบ parent commit สำหรับ replay",
    );
  }

  const nextHash = getSyntheticHash(
    RESOLVE_CONFLICT_REBASE_SYNTHETIC_HASHES,
    previous.nextSyntheticIndex,
    "rb",
  );

  const nextCommit: ResolveConflictCommit = {
    id: `rb-${previous.nextSyntheticIndex + 1}`,
    shortHash: nextHash,
    message: `${currentItem.message} (rebased)`,
    lane: 1,
    parentId: parent.id,
    author: currentItem.author,
    dateLabel: `5 Sep 2019 00:${(10 + previous.nextSyntheticIndex)
      .toString()
      .padStart(2, "0")}`,
  };

  const nextCommits = [nextCommit, ...previous.commits];
  const nextBranches = updateBranchHash(
    previous.branches,
    session.sourceBranch,
    nextHash,
  );
  const nextQueue = session.queue.slice(1);
  const nextMapping = [
    ...session.mapping,
    { sourceHash: currentItem.sourceShortHash, rebasedHash: nextHash },
  ];

  if (!nextQueue.length) {
    return {
      ...previous,
      branches: nextBranches,
      commits: nextCommits,
      nextSyntheticIndex: previous.nextSyntheticIndex + 1,
      rebaseSession: null,
      lastCommand,
      tone: "success",
      headline: "Successfully rebased and updated branch pointer.",
      message: `rebase เสร็จแล้ว: rewrite ${nextMapping.length} commit hash (${session.sourceBranch})`,
    };
  }

  return {
    ...previous,
    branches: nextBranches,
    commits: nextCommits,
    nextSyntheticIndex: previous.nextSyntheticIndex + 1,
    rebaseSession: {
      ...session,
      queue: nextQueue,
      nextParentHash: nextHash,
      conflict: null,
      mapping: nextMapping,
    },
    lastCommand,
    tone: "success",
    headline: `applied ${currentItem.sourceShortHash} -> ${nextHash}`,
    message: `replay สำเร็จ เหลือ ${nextQueue.length} item. ใช้ git rebase --continue ต่อ`,
  };
};

const executeMergeCommand = (
  previous: MergeSimulatorState,
  rawCommand: string,
): MergeSimulatorState => {
  const command = rawCommand.trim();
  if (!command) {
    return previous;
  }

  const parts = command.split(/\s+/);
  if (parts[0] !== "git") {
    return setMergeTerminal(
      previous,
      command,
      "warning",
      "command not found",
      "เดโมนี้รองรับเฉพาะคำสั่งที่ขึ้นต้นด้วย git",
    );
  }

  const subcommand = parts[1];

  if (subcommand === "switch" || subcommand === "checkout") {
    const targetBranch = parts[2];
    if (!targetBranch) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        `git ${subcommand}`,
        "ระบุ branch ที่ต้องการสลับ เช่น git switch main",
      );
    }

    if (previous.mergeSession) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        `git ${subcommand} ${targetBranch}`,
        "ห้ามสลับ branch ขณะ merge conflict ยังไม่จบ (commit หรือ abort ก่อน)",
      );
    }

    const branch = previous.branches.find((item) => item.name === targetBranch);
    if (!branch) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        `git ${subcommand} ${targetBranch}`,
        `ไม่พบ branch ${targetBranch}`,
      );
    }

    return {
      ...previous,
      currentBranch: targetBranch,
      lastCommand: command,
      tone: "success",
      headline: `Switched to branch '${targetBranch}'`,
      message: `สลับมาที่ ${targetBranch} แล้ว`,
    };
  }

  if (subcommand === "merge") {
    const mergeArg = parts[2];

    if (!mergeArg) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        "git merge",
        "รูปแบบที่รองรับ: git merge feature/conflict-demo หรือ git merge --abort",
      );
    }

    if (mergeArg === "--abort") {
      if (parts.length > 3) {
        return setMergeTerminal(
          previous,
          command,
          "warning",
          "git merge --abort",
          "เดโมรองรับ --abort แบบไม่มีอาร์กิวเมนต์เพิ่ม",
        );
      }

      if (!previous.mergeSession) {
        return setMergeTerminal(
          previous,
          command,
          "warning",
          "fatal: There is no merge to abort (MERGE_HEAD missing).",
          "ยังไม่มี merge ค้างอยู่ จึง abort ไม่ได้",
        );
      }

      const snapshot = previous.mergeSession.snapshot;
      return {
        ...previous,
        branches: cloneBranches(snapshot.branches),
        commits: cloneCommits(snapshot.commits),
        currentBranch: snapshot.currentBranch,
        nextSyntheticIndex: snapshot.nextSyntheticIndex,
        mergeSession: null,
        lastCommand: command,
        tone: "success",
        headline: "Merge aborted.",
        message: "ยกเลิก merge และกลับสถานะก่อนเริ่มแล้ว",
      };
    }

    if (parts.length > 3) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        `git merge ${mergeArg}`,
        "เดโมนี้รองรับรูปแบบพื้นฐาน: git merge <branch>",
      );
    }

    if (previous.mergeSession) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        `git merge ${mergeArg}`,
        "มี merge session ค้างอยู่ ให้ commit หรือ abort ให้จบก่อน",
      );
    }

    if (previous.currentBranch !== "main") {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        `git merge ${mergeArg}`,
        "เดโมนี้ต้อง merge ขณะอยู่บน main เท่านั้น",
      );
    }

    if (mergeArg !== RESOLVE_CONFLICT_MERGE_RULE.sourceBranch) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        `git merge ${mergeArg}`,
        `เดโม conflict นี้รองรับ branch ${RESOLVE_CONFLICT_MERGE_RULE.sourceBranch} เท่านั้น`,
      );
    }

    const sourceBranch = previous.branches.find(
      (branch) => branch.name === mergeArg,
    );
    if (!sourceBranch) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        `git merge ${mergeArg}`,
        `ไม่พบ branch ${mergeArg}`,
      );
    }

    const snapshot: MergeSnapshot = {
      branches: cloneBranches(previous.branches),
      commits: cloneCommits(previous.commits),
      currentBranch: previous.currentBranch,
      nextSyntheticIndex: previous.nextSyntheticIndex,
    };

    return {
      ...previous,
      mergeSession: {
        sourceBranch: mergeArg,
        filePath: RESOLVE_CONFLICT_MERGE_RULE.filePath,
        reason: RESOLVE_CONFLICT_MERGE_RULE.reason,
        staged: false,
        snapshot,
      },
      lastCommand: command,
      tone: "warning",
      headline: `Auto-merging ${RESOLVE_CONFLICT_MERGE_RULE.filePath}\nCONFLICT (content): Merge conflict in ${RESOLVE_CONFLICT_MERGE_RULE.filePath}`,
      message:
        "เกิด conflict แล้ว: แก้ไฟล์ -> git add profile.ts -> git commit -m \"...\" หรือใช้ git merge --abort",
    };
  }

  if (subcommand === "add") {
    const filePath = parts[2];
    if (!filePath) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        "git add",
        "ระบุไฟล์ที่ต้องการ stage เช่น git add profile.ts",
      );
    }

    if (!previous.mergeSession) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        `git add ${filePath}`,
        "ไม่มี merge conflict ที่ต้อง stage",
      );
    }

    if (filePath !== previous.mergeSession.filePath) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        `git add ${filePath}`,
        `ไฟล์ไม่ตรงกับ conflict gate (คาดว่า ${previous.mergeSession.filePath})`,
      );
    }

    return {
      ...previous,
      mergeSession: {
        ...previous.mergeSession,
        staged: true,
      },
      lastCommand: command,
      tone: "success",
      headline: `staged ${filePath}`,
      message: "ไฟล์ conflict ถูก stage แล้ว ต่อด้วย git commit -m \"...\"",
    };
  }

  if (subcommand === "commit") {
    const messageMatch = command.match(/^git commit -m\s+(["'])(.+)\1$/);

    if (!messageMatch) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        "git commit",
        "เดโมนี้รองรับรูปแบบ: git commit -m \"message\"",
      );
    }

    const commitMessage = messageMatch[2].trim();
    if (!commitMessage) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        "git commit",
        "ข้อความ commit ต้องไม่ว่าง",
      );
    }

    if (!previous.mergeSession) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        "git commit",
        "ไม่มี merge session ให้ commit",
      );
    }

    if (!previous.mergeSession.staged) {
      return setMergeTerminal(
        previous,
        command,
        "warning",
        "git commit",
        `ต้องรัน git add ${previous.mergeSession.filePath} ก่อน commit`,
      );
    }

    const currentHeadHash = previous.branches.find(
      (branch) => branch.name === previous.currentBranch,
    )?.shortHash;
    const currentHeadCommit = currentHeadHash
      ? buildCommitByHashMap(previous.commits).get(currentHeadHash)
      : undefined;

    const nextHash = getSyntheticHash(
      RESOLVE_CONFLICT_MERGE_SYNTHETIC_HASHES,
      previous.nextSyntheticIndex,
      "mg",
    );

    const mergeCommit: ResolveConflictCommit = {
      id: `mg-${previous.nextSyntheticIndex + 1}`,
      shortHash: nextHash,
      message: commitMessage,
      lane: 0,
      parentId: currentHeadCommit?.id,
      author: "You",
      dateLabel: `5 Sep 2019 01:${(10 + previous.nextSyntheticIndex)
        .toString()
        .padStart(2, "0")}`,
    };

    return {
      ...previous,
      commits: [mergeCommit, ...previous.commits],
      branches: updateBranchHash(
        previous.branches,
        previous.currentBranch,
        nextHash,
      ),
      mergeSession: null,
      nextSyntheticIndex: previous.nextSyntheticIndex + 1,
      lastCommand: command,
      tone: "success",
      headline: `[${previous.currentBranch} ${nextHash}] ${commitMessage}`,
      message:
        "merge conflict ถูก resolve แล้ว และ branch pointer อัปเดตเป็น merge commit ใหม่",
    };
  }

  if (subcommand === "status") {
    if (previous.mergeSession) {
      return setMergeTerminal(
        previous,
        command,
        previous.mergeSession.staged ? "hint" : "warning",
        `On branch ${previous.currentBranch}`,
        previous.mergeSession.staged
          ? "all conflicts fixed but you are still merging (run \"git commit\")"
          : `you have unmerged paths: both modified: ${previous.mergeSession.filePath}`,
      );
    }

    return setMergeTerminal(
      previous,
      command,
      "hint",
      `On branch ${previous.currentBranch}`,
      "working tree clean ใน merge simulator",
    );
  }

  if (subcommand === "log") {
    return setMergeTerminal(
      previous,
      command,
      "hint",
      "แสดง graph ล่าสุดของ merge simulator",
      "ตรวจ branch pointer และ commit graph ด้านล่างได้ทันที",
    );
  }

  return setMergeTerminal(
    previous,
    command,
    "warning",
    `git ${subcommand ?? ""}`.trim(),
    "คำสั่งนี้ยังไม่รองรับใน merge conflict simulator",
  );
};

const executeRebaseCommand = (
  previous: RebaseSimulatorState,
  rawCommand: string,
): RebaseSimulatorState => {
  const command = rawCommand.trim();
  if (!command) {
    return previous;
  }

  const parts = command.split(/\s+/);
  if (parts[0] !== "git") {
    return setRebaseTerminal(
      previous,
      command,
      "warning",
      "command not found",
      "เดโมนี้รองรับเฉพาะคำสั่งที่ขึ้นต้นด้วย git",
    );
  }

  const subcommand = parts[1];

  if (subcommand === "switch" || subcommand === "checkout") {
    const targetBranch = parts[2];
    if (!targetBranch) {
      return setRebaseTerminal(
        previous,
        command,
        "warning",
        `git ${subcommand}`,
        "ระบุ branch ที่ต้องการสลับ เช่น git switch feature/conflict",
      );
    }

    if (previous.rebaseSession) {
      return setRebaseTerminal(
        previous,
        command,
        "warning",
        `git ${subcommand} ${targetBranch}`,
        "ห้ามสลับ branch ขณะมี rebase session ค้างอยู่",
      );
    }

    const branch = previous.branches.find((item) => item.name === targetBranch);
    if (!branch) {
      return setRebaseTerminal(
        previous,
        command,
        "warning",
        `git ${subcommand} ${targetBranch}`,
        `ไม่พบ branch ${targetBranch}`,
      );
    }

    return {
      ...previous,
      currentBranch: targetBranch,
      lastCommand: command,
      tone: "success",
      headline: `Switched to branch '${targetBranch}'`,
      message: `สลับมาที่ ${targetBranch} แล้ว`,
    };
  }

  if (subcommand === "rebase") {
    const rebaseArg = parts[2];

    if (!rebaseArg) {
      return setRebaseTerminal(
        previous,
        command,
        "warning",
        "git rebase",
        "รูปแบบที่รองรับ: git rebase <branch>, --continue, --skip, --abort",
      );
    }

    if (rebaseArg === "--continue") {
      if (parts.length > 3) {
        return setRebaseTerminal(
          previous,
          command,
          "warning",
          "git rebase --continue",
          "เดโมนี้รองรับ --continue แบบไม่มีอาร์กิวเมนต์เพิ่ม",
        );
      }
      return runRebaseContinue(previous, command);
    }

    if (rebaseArg === "--skip") {
      if (parts.length > 3) {
        return setRebaseTerminal(
          previous,
          command,
          "warning",
          "git rebase --skip",
          "เดโมนี้รองรับ --skip แบบไม่มีอาร์กิวเมนต์เพิ่ม",
        );
      }
      return runRebaseSkip(previous, command);
    }

    if (rebaseArg === "--abort") {
      if (parts.length > 3) {
        return setRebaseTerminal(
          previous,
          command,
          "warning",
          "git rebase --abort",
          "เดโมนี้รองรับ --abort แบบไม่มีอาร์กิวเมนต์เพิ่ม",
        );
      }
      return runRebaseAbort(previous, command);
    }

    if (parts.length > 3) {
      return setRebaseTerminal(
        previous,
        command,
        "warning",
        `git rebase ${rebaseArg}`,
        "เดโมนี้รองรับรูปแบบพื้นฐาน: git rebase <branch>",
      );
    }

    if (previous.rebaseSession) {
      return setRebaseTerminal(
        previous,
        command,
        "warning",
        `git rebase ${rebaseArg}`,
        "มี rebase session ค้างอยู่ก่อนหน้า ให้ continue/skip/abort ให้จบก่อน",
      );
    }

    if (previous.currentBranch === rebaseArg) {
      return setRebaseTerminal(
        previous,
        command,
        "warning",
        `git rebase ${rebaseArg}`,
        "source และ target branch ต้องต่างกัน",
      );
    }

    const targetBranch = previous.branches.find(
      (branch) => branch.name === rebaseArg,
    );
    if (!targetBranch) {
      return setRebaseTerminal(
        previous,
        command,
        "warning",
        `git rebase ${rebaseArg}`,
        `ไม่พบ branch เป้าหมาย ${rebaseArg}`,
      );
    }

    const queue = collectRebaseQueue(
      previous.commits,
      previous.branches,
      previous.currentBranch,
      rebaseArg,
    );

    if (!queue.length) {
      return setRebaseTerminal(
        previous,
        command,
        "hint",
        `git rebase ${rebaseArg}`,
        "ไม่มี commit ที่ต้อง replay (branch นี้ up to date กับ target แล้ว)",
      );
    }

    const snapshot: RebaseSnapshot = {
      branches: cloneBranches(previous.branches),
      commits: cloneCommits(previous.commits),
      currentBranch: previous.currentBranch,
      nextSyntheticIndex: previous.nextSyntheticIndex,
    };

    return {
      ...previous,
      rebaseSession: {
        sourceBranch: previous.currentBranch,
        targetBranch: rebaseArg,
        queue,
        nextParentHash: targetBranch.shortHash,
        conflict: null,
        mapping: [],
        snapshot,
      },
      lastCommand: command,
      tone: "hint",
      headline: `rebase: ${previous.currentBranch} onto ${rebaseArg}`,
      message: `เริ่ม rebase แล้ว เหลือ ${queue.length} queue item. ใช้ git rebase --continue เพื่อ replay`,
    };
  }

  if (subcommand === "add") {
    const filePath = parts[2];
    if (!filePath) {
      return setRebaseTerminal(
        previous,
        command,
        "warning",
        "git add",
        "ระบุไฟล์ที่ต้องการ stage เช่น git add auth.tsx",
      );
    }

    return runRebaseAdd(previous, filePath, command);
  }

  if (subcommand === "status") {
    if (!previous.rebaseSession) {
      return setRebaseTerminal(
        previous,
        command,
        "hint",
        `On branch ${previous.currentBranch}`,
        "no rebase in progress",
      );
    }

    if (previous.rebaseSession.conflict && !previous.rebaseSession.conflict.resolved) {
      return setRebaseTerminal(
        previous,
        command,
        "warning",
        `rebase paused: resolve ${previous.rebaseSession.conflict.filePath}`,
        `ต้อง git add ${previous.rebaseSession.conflict.filePath} ก่อน continue`,
      );
    }

    return setRebaseTerminal(
      previous,
      command,
      "hint",
      `rebase in progress on ${previous.rebaseSession.sourceBranch}`,
      `${previous.rebaseSession.queue.length} item ยังรอ replay`,
    );
  }

  if (subcommand === "log") {
    return setRebaseTerminal(
      previous,
      command,
      "hint",
      "แสดง graph ล่าสุดของ rebase simulator",
      "ตรวจ branch pointer และ rewrite mapping ใน terminal output",
    );
  }

  return setRebaseTerminal(
    previous,
    command,
    "warning",
    `git ${subcommand ?? ""}`.trim(),
    "คำสั่งนี้ยังไม่รองรับใน rebase conflict simulator",
  );
};

export default function ResolveConflictsPage() {
  const [activeMode, setActiveMode] = useState<ResolveConflictMode>("merge");
  const [mergeState, setMergeState] = useState<MergeSimulatorState>(
    createInitialMergeState,
  );
  const [rebaseState, setRebaseState] = useState<RebaseSimulatorState>(
    createInitialRebaseState,
  );
  const [mergeCommandInput, setMergeCommandInput] = useState<string>(
    RESOLVE_CONFLICT_DEFAULT_COMMAND_INPUT.merge,
  );
  const [rebaseCommandInput, setRebaseCommandInput] = useState<string>(
    RESOLVE_CONFLICT_DEFAULT_COMMAND_INPUT.rebase,
  );

  const activeQuickCommands =
    activeMode === "merge"
      ? RESOLVE_CONFLICT_MERGE_QUICK_COMMANDS
      : RESOLVE_CONFLICT_REBASE_QUICK_COMMANDS;

  const activeSafetyNotes =
    activeMode === "merge"
      ? RESOLVE_CONFLICT_MERGE_SAFETY_NOTES
      : RESOLVE_CONFLICT_REBASE_SAFETY_NOTES;

  const activeCommandInput =
    activeMode === "merge" ? mergeCommandInput : rebaseCommandInput;

  const activeState = activeMode === "merge" ? mergeState : rebaseState;

  const activeLabelsByHash = useMemo(
    () => buildLabelsByHash(activeState.branches, activeState.currentBranch),
    [activeState.branches, activeState.currentBranch],
  );

  const activeTerminalLines = useMemo(
    () =>
      activeMode === "merge"
        ? renderMergeTerminalLines(mergeState)
        : renderRebaseTerminalLines(rebaseState),
    [activeMode, mergeState, rebaseState],
  );

  const runCommand = (rawCommand: string) => {
    if (activeMode === "merge") {
      setMergeState((previous) => executeMergeCommand(previous, rawCommand));
      return;
    }

    setRebaseState((previous) => executeRebaseCommand(previous, rawCommand));
  };

  const runQuickCommand = (command: string) => {
    if (activeMode === "merge") {
      setMergeCommandInput(command);
    } else {
      setRebaseCommandInput(command);
    }
    runCommand(command);
  };

  const resetCurrentMode = () => {
    if (activeMode === "merge") {
      setMergeState(createInitialMergeState());
      setMergeCommandInput(RESOLVE_CONFLICT_DEFAULT_COMMAND_INPUT.merge);
      return;
    }

    setRebaseState(createInitialRebaseState());
    setRebaseCommandInput(RESOLVE_CONFLICT_DEFAULT_COMMAND_INPUT.rebase);
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SetupGuideHeader
        badge="Merge & Rebase"
        title="Resolve Conflicts: Full Simulator"
        description="จำลอง conflict ของทั้ง merge และ rebase ในหน้าเดียว พร้อม quick commands, terminal และ state machine ที่บังคับลำดับคำสั่งจริง"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mode</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          เลือกโหมดที่ต้องการฝึก แล้วลองคำสั่งตาม flow จริงแบบทีละขั้น
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={activeMode === "merge" ? "default" : "outline"}
            onClick={() => setActiveMode("merge")}
          >
            Merge Conflict
          </Button>
          <Button
            type="button"
            variant={activeMode === "rebase" ? "default" : "outline"}
            onClick={() => setActiveMode("rebase")}
          >
            Rebase Conflict
          </Button>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <h3 className="text-base font-bold text-foreground">
            {RESOLVE_CONFLICT_MODE_META[activeMode].title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {RESOLVE_CONFLICT_MODE_META[activeMode].description}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Quick Commands</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          กดปุ่มเพื่อ replay flow เร็ว ๆ หรือพิมพ์ command เองใน terminal input
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {activeQuickCommands.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant="secondary"
              onClick={() => runQuickCommand(item.command)}
            >
              {item.command}
            </Button>
          ))}
          <Button type="button" variant="outline" onClick={resetCurrentMode}>
            Reset {activeMode === "merge" ? "Merge" : "Rebase"} Mode
          </Button>
        </div>

        <form
          className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            runCommand(activeCommandInput);
          }}
        >
          <input
            value={activeCommandInput}
            onChange={(event) => {
              if (activeMode === "merge") {
                setMergeCommandInput(event.target.value);
                return;
              }
              setRebaseCommandInput(event.target.value);
            }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
            placeholder={
              activeMode === "merge"
                ? "พิมพ์คำสั่ง เช่น git merge feature/conflict-demo"
                : "พิมพ์คำสั่ง เช่น git rebase main"
            }
          />
          <Button type="submit" className="shrink-0">
            Run Command
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Simulator State</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ดู branch pointer, commit graph และสถานะ session เพื่อเช็กผลแต่ละคำสั่ง
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {activeState.branches.map((branch) => {
            const isCurrent = branch.name === activeState.currentBranch;
            return (
              <span
                key={branch.name}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isCurrent
                    ? "border border-cyan-500/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"
                    : "border border-border bg-muted/30 text-muted-foreground"
                }`}
              >
                {isCurrent ? "HEAD -> " : ""}
                {branch.name}: {branch.shortHash}
              </span>
            );
          })}
        </div>

        {activeMode === "merge" && mergeState.mergeSession ? (
          <div className="mt-4 rounded-xl border border-rose-400/35 bg-rose-400/10 p-4">
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Merge Conflict In Progress
            </h3>
            <p className="mt-1 text-xs text-rose-800 dark:text-rose-300">
              source: {mergeState.mergeSession.sourceBranch} | file: {mergeState.mergeSession.filePath}
            </p>
            <p className="mt-2 text-sm text-rose-900 dark:text-rose-200">
              {mergeState.mergeSession.staged
                ? "conflict file ถูก stage แล้ว รอ git commit -m \"...\""
                : "ยังไม่ stage conflict file (ต้อง git add profile.ts ก่อน commit)"}
            </p>
          </div>
        ) : null}

        {activeMode === "rebase" && rebaseState.rebaseSession ? (
          <div className="mt-4 rounded-xl border border-amber-400/35 bg-amber-400/10 p-4">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Rebase Session In Progress
            </h3>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
              {rebaseState.rebaseSession.sourceBranch} onto {rebaseState.rebaseSession.targetBranch} | queue {rebaseState.rebaseSession.queue.length}
            </p>
            {rebaseState.rebaseSession.conflict ? (
              <p className="mt-2 text-sm text-amber-900 dark:text-amber-200">
                {rebaseState.rebaseSession.conflict.resolved
                  ? `conflict resolved แล้ว (staged ${rebaseState.rebaseSession.conflict.filePath})`
                  : `conflict pending: ${rebaseState.rebaseSession.conflict.filePath}`}
              </p>
            ) : (
              <p className="mt-2 text-sm text-amber-900 dark:text-amber-200">
                ไม่มี conflict ค้างอยู่ สามารถ continue/skip ได้
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[880px] table-fixed text-sm">
              <thead className="bg-muted text-foreground">
                <tr>
                  <th className="w-[140px] border-b border-r border-border px-3 py-2 text-left font-semibold">
                    Commit
                  </th>
                  <th className="border-b border-r border-border px-3 py-2 text-left font-semibold">
                    Message
                  </th>
                  <th className="w-[170px] border-b border-r border-border px-3 py-2 text-left font-semibold">
                    Date
                  </th>
                  <th className="w-[160px] border-b border-border px-3 py-2 text-left font-semibold">
                    Labels
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeState.commits.map((commit) => {
                  const labels = activeLabelsByHash.get(commit.shortHash) ?? [];
                  return (
                    <tr key={commit.id} className="border-b border-border align-top">
                      <td className="border-r border-border px-3 py-2 font-mono text-xs text-foreground">
                        {commit.shortHash}
                      </td>
                      <td className="border-r border-border px-3 py-2 text-xs text-foreground">
                        <p>{commit.message}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {commit.author}
                        </p>
                      </td>
                      <td className="border-r border-border px-3 py-2 text-xs text-muted-foreground">
                        {commit.dateLabel}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div className="flex flex-wrap gap-1">
                          {labels.length ? (
                            labels.map((label) => (
                              <span
                                key={`${commit.id}-${label.text}`}
                                className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${getGraphBadgeClassName(
                                  label.variant,
                                )}`}
                              >
                                {label.text}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#3b3b3b] bg-[#1f1f1f] p-4 font-mono text-sm text-slate-100 shadow-inner md:p-6">
        <p className={`text-xs ${TERMINAL_TONE_CLASS.label}`}>Last command</p>
        <p className={`mt-1 ${TERMINAL_TONE_CLASS.command}`}>{activeState.lastCommand}</p>

        <p className={`mt-4 text-xs ${TERMINAL_TONE_CLASS.label}`}>Simulator message</p>
        <p className={`mt-1 ${TERMINAL_TONE_CLASS[activeState.tone]}`}>{activeState.message}</p>

        <div className="mt-4 border-t border-slate-700 pt-4">
          <p className={`text-xs ${TERMINAL_TONE_CLASS.label}`}>Terminal output</p>
          <div className="mt-2 space-y-1">
            {activeTerminalLines.map((line, index) => (
              <p
                key={`${line.text}-${index}`}
                className={`whitespace-pre leading-6 ${TERMINAL_TONE_CLASS[line.tone]}`}
              >
                {line.text || " "}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Safety Notes</h2>
        <ul className="mt-4 list-disc space-y-2 rounded-xl border border-border bg-muted/30 p-4 pl-8 text-sm leading-6 text-foreground">
          {activeSafetyNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
