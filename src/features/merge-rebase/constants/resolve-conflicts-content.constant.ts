export type ResolveConflictMode = "merge" | "rebase";

export type ResolveConflictQuickCommand = {
  id: string;
  label: string;
  command: string;
};

export type ResolveConflictBranch = {
  name: string;
  shortHash: string;
  upstream?: string;
  ahead: number;
  behind: number;
};

export type ResolveConflictCommit = {
  id: string;
  shortHash: string;
  message: string;
  lane: 0 | 1;
  parentId?: string;
  author: string;
  dateLabel: string;
};

export type ResolveConflictMergeRule = {
  sourceBranch: string;
  filePath: string;
  reason: string;
};

export type ResolveConflictRebaseRule = {
  sourceCommitId: string;
  filePath: string;
  reason: string;
};

export const RESOLVE_CONFLICT_MODE_META: Record<
  ResolveConflictMode,
  {
    title: string;
    description: string;
  }
> = {
  merge: {
    title: "Merge Conflict Simulator",
    description:
      "โฟกัส conflict ระหว่างการ merge: resolve ด้วย git add + git commit หรือยกเลิกด้วย git merge --abort",
  },
  rebase: {
    title: "Rebase Conflict Simulator",
    description:
      "โฟกัส conflict ระหว่างการ rebase: ปลดล็อกด้วย git add แล้วค่อย git rebase --continue",
  },
};

export const RESOLVE_CONFLICT_DEFAULT_COMMAND_INPUT: Record<
  ResolveConflictMode,
  string
> = {
  merge: "git merge feature/conflict-demo",
  rebase: "git rebase main",
};

export const RESOLVE_CONFLICT_MERGE_QUICK_COMMANDS: ResolveConflictQuickCommand[] =
  [
    {
      id: "merge-switch-main",
      label: "Switch main",
      command: "git switch main",
    },
    {
      id: "merge-start",
      label: "Start conflict merge",
      command: "git merge feature/conflict-demo",
    },
    {
      id: "merge-status",
      label: "Status",
      command: "git status",
    },
    {
      id: "merge-add",
      label: "Stage resolved file",
      command: "git add profile.ts",
    },
    {
      id: "merge-commit",
      label: "Commit resolution",
      command: 'git commit -m "merge: resolve profile conflict"',
    },
    {
      id: "merge-abort",
      label: "Abort merge",
      command: "git merge --abort",
    },
    {
      id: "merge-log",
      label: "Graph",
      command: "git log --oneline --graph --decorate --all",
    },
  ];

export const RESOLVE_CONFLICT_REBASE_QUICK_COMMANDS: ResolveConflictQuickCommand[] =
  [
    {
      id: "rebase-switch",
      label: "Switch feature/conflict",
      command: "git switch feature/conflict",
    },
    {
      id: "rebase-start",
      label: "Start rebase",
      command: "git rebase main",
    },
    {
      id: "rebase-continue",
      label: "Continue",
      command: "git rebase --continue",
    },
    {
      id: "rebase-add",
      label: "Stage conflict file",
      command: "git add auth.tsx",
    },
    {
      id: "rebase-skip",
      label: "Skip commit",
      command: "git rebase --skip",
    },
    {
      id: "rebase-abort",
      label: "Abort rebase",
      command: "git rebase --abort",
    },
    {
      id: "rebase-status",
      label: "Status",
      command: "git status",
    },
    {
      id: "rebase-log",
      label: "Graph",
      command: "git log --oneline --graph --decorate --all",
    },
  ];

export const RESOLVE_CONFLICT_MERGE_SAFETY_NOTES: string[] = [
  "ระหว่าง conflict session ห้ามสลับ branch จนกว่าจะ commit หรือ abort",
  "เมื่อแก้ไฟล์ conflict แล้วต้อง git add ก่อน commit เพื่อปิด merge session",
  "ถ้ายังไม่มั่นใจ ให้ git merge --abort เพื่อย้อนกลับสถานะก่อนเริ่ม",
];

export const RESOLVE_CONFLICT_REBASE_SAFETY_NOTES: string[] = [
  "เมื่อ conflict เกิดระหว่าง rebase ต้อง git add <file> ก่อน git rebase --continue",
  "git rebase --skip จะตัด commit ปัจจุบันออกจากประวัติใหม่ทันที",
  "git rebase --abort จะคืน branch/commit pointer กลับ snapshot ก่อนเริ่ม",
];

export const RESOLVE_CONFLICT_MERGE_INITIAL_CURRENT_BRANCH = "main";

export const RESOLVE_CONFLICT_MERGE_INITIAL_BRANCHES: ResolveConflictBranch[] = [
  {
    name: "main",
    shortHash: "98bd321",
    upstream: "origin/main",
    ahead: 0,
    behind: 0,
  },
  {
    name: "feature/conflict-demo",
    shortHash: "f29ce10",
    upstream: "origin/feature/conflict-demo",
    ahead: 1,
    behind: 0,
  },
  {
    name: "feature/login",
    shortHash: "d42bc11",
    upstream: "origin/feature/login",
    ahead: 2,
    behind: 0,
  },
];

export const RESOLVE_CONFLICT_MERGE_INITIAL_COMMITS: ResolveConflictCommit[] = [
  {
    id: "m7",
    shortHash: "f29ce10",
    message: "feat(conflict): branch edit profile",
    lane: 1,
    parentId: "m4",
    author: "Alex Monroe",
    dateLabel: "4 Sep 2019 09:18",
  },
  {
    id: "m6",
    shortHash: "d42bc11",
    message: "feat(login): add oauth callback",
    lane: 1,
    parentId: "m5",
    author: "Youssef Victor",
    dateLabel: "4 Sep 2019 08:23",
  },
  {
    id: "m5",
    shortHash: "b84ad55",
    message: "feat(login): add login screen",
    lane: 1,
    parentId: "m4",
    author: "Ron Petrusha",
    dateLabel: "4 Sep 2019 08:00",
  },
  {
    id: "m4",
    shortHash: "98bd321",
    message: "feat(core): bootstrap app shell",
    lane: 0,
    parentId: "m3",
    author: "Tom Pratt",
    dateLabel: "4 Sep 2019 07:12",
  },
  {
    id: "m3",
    shortHash: "72cd905",
    message: "chore: setup lint and formatter",
    lane: 0,
    parentId: "m2",
    author: "Mauricio de los Santos",
    dateLabel: "4 Sep 2019 06:55",
  },
  {
    id: "m2",
    shortHash: "8c1aa2c",
    message: "chore: project scaffold",
    lane: 0,
    author: "Terry Kim",
    dateLabel: "4 Sep 2019 06:21",
  },
];

export const RESOLVE_CONFLICT_MERGE_RULE: ResolveConflictMergeRule = {
  sourceBranch: "feature/conflict-demo",
  filePath: "profile.ts",
  reason:
    "ทั้ง main และ feature/conflict-demo แก้ profile.ts จุดเดียวกัน จึงเกิด content conflict",
};

export const RESOLVE_CONFLICT_MERGE_SYNTHETIC_HASHES = [
  "c11ab20",
  "c11ab21",
  "c11ab22",
  "c11ab23",
] as const;

export const RESOLVE_CONFLICT_REBASE_INITIAL_CURRENT_BRANCH =
  "feature/conflict";

export const RESOLVE_CONFLICT_REBASE_INITIAL_BRANCHES: ResolveConflictBranch[] = [
  {
    name: "main",
    shortHash: "a11bc45",
    upstream: "origin/main",
    ahead: 0,
    behind: 0,
  },
  {
    name: "feature/conflict",
    shortHash: "a77f1d",
    upstream: "origin/feature/conflict",
    ahead: 1,
    behind: 1,
  },
  {
    name: "feature/login",
    shortHash: "5c61de1",
    upstream: "origin/feature/login",
    ahead: 2,
    behind: 1,
  },
];

export const RESOLVE_CONFLICT_REBASE_INITIAL_COMMITS: ResolveConflictCommit[] = [
  {
    id: "r6",
    shortHash: "a77f1d",
    message: "feat(conflict): modify auth guard widget",
    lane: 1,
    parentId: "r4",
    author: "Alex Monroe",
    dateLabel: "4 Sep 2019 10:27",
  },
  {
    id: "r5",
    shortHash: "5c61de1",
    message: "feat(login): add oauth callback",
    lane: 1,
    parentId: "r4",
    author: "Youssef Victor",
    dateLabel: "4 Sep 2019 09:52",
  },
  {
    id: "r4",
    shortHash: "a11bc45",
    message: "refactor(auth): harden route guard",
    lane: 0,
    parentId: "r3",
    author: "Dmitri Ivanov",
    dateLabel: "4 Sep 2019 09:14",
  },
  {
    id: "r3",
    shortHash: "98bd321",
    message: "feat(core): bootstrap app shell",
    lane: 0,
    parentId: "r2",
    author: "Tom Pratt",
    dateLabel: "4 Sep 2019 08:39",
  },
  {
    id: "r2",
    shortHash: "72cd905",
    message: "chore: setup lint and formatter",
    lane: 0,
    parentId: "r1",
    author: "Mauricio de los Santos",
    dateLabel: "4 Sep 2019 08:02",
  },
  {
    id: "r1",
    shortHash: "8c1aa2c",
    message: "chore: project scaffold",
    lane: 0,
    author: "Terry Kim",
    dateLabel: "4 Sep 2019 07:29",
  },
];

export const RESOLVE_CONFLICT_REBASE_RULES: ResolveConflictRebaseRule[] = [
  {
    sourceCommitId: "r6",
    filePath: "auth.tsx",
    reason:
      "commit นี้แก้ auth guard จุดเดียวกับ main จึงต้อง resolve conflict และ stage ก่อน continue",
  },
];

export const RESOLVE_CONFLICT_REBASE_SYNTHETIC_HASHES = [
  "f13de33",
  "a3d4c9e",
  "b7e9f1a",
  "c6ab220",
] as const;
