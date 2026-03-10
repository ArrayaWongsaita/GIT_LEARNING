export type GitRebaseCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitRebaseLabCommand = {
  command: string;
  description: string;
};

export type GitRebaseLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitRebaseLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitRebaseTodoAction = "pick" | "squash";

export type GitRebaseTodoItem = {
  id: string;
  sourceCommitId: string;
  sourceShortHash: string;
  action: GitRebaseTodoAction;
  message: string;
};

export type GitRebaseConflictRule = {
  sourceCommitId: string;
  filePath: string;
  reason: string;
};

export type GitRebaseSimulatorBranch = {
  name: string;
  shortHash: string;
  upstream?: string;
  ahead: number;
  behind: number;
};

export type GitRebaseSimulatorCommit = {
  id: string;
  shortHash: string;
  message: string;
  lane: 0 | 1;
  parentId?: string;
  author: string;
  dateLabel: string;
};

export type GitRebaseSessionSnapshot = {
  branches: GitRebaseSimulatorBranch[];
  commits: GitRebaseSimulatorCommit[];
  currentBranch: string;
  syntheticIndex: number;
};

export type GitRebaseInteractiveCommandReference = {
  id: string;
  syntax: string;
  summary: string;
  whenToUse: string;
  caution: string;
};

export const GIT_REBASE_TODO_ACTIONS: GitRebaseTodoAction[] = [
  "pick",
  "squash",
];

export const GIT_REBASE_SIM_INITIAL_CURRENT_BRANCH = "feature/login";

export const GIT_REBASE_SIM_INITIAL_BRANCHES: GitRebaseSimulatorBranch[] = [
  {
    name: "main",
    shortHash: "a11bc45",
    upstream: "origin/main",
    ahead: 0,
    behind: 0,
  },
  {
    name: "feature/login",
    shortHash: "5c61de1",
    upstream: "origin/feature/login",
    ahead: 2,
    behind: 1,
  },
  {
    name: "feature/payment",
    shortHash: "f2b8a1e",
    upstream: "origin/feature/payment",
    ahead: 1,
    behind: 1,
  },
  {
    name: "feature/conflict",
    shortHash: "a77f1d",
    upstream: "origin/feature/conflict",
    ahead: 1,
    behind: 1,
  },
];

export const GIT_REBASE_SIM_INITIAL_COMMITS: GitRebaseSimulatorCommit[] = [
  {
    id: "c9",
    shortHash: "a77f1d",
    message: "feat(conflict): modify auth guard widget",
    lane: 1,
    parentId: "c4",
    author: "Alex Monroe",
    dateLabel: "3 Sep 2019 23:06",
  },
  {
    id: "c8",
    shortHash: "f2b8a1e",
    message: "feat(payment): add qr checkout flow",
    lane: 1,
    parentId: "c4",
    author: "Maira Wenzel",
    dateLabel: "3 Sep 2019 22:49",
  },
  {
    id: "c7",
    shortHash: "5c61de1",
    message: "chore:update.text.txt",
    lane: 1,
    parentId: "c6",
    author: "Youssef Victor",
    dateLabel: "3 Sep 2019 22:22",
  },
  {
    id: "c6",
    shortHash: "20ef793",
    message: "chore:update.text.txt",
    lane: 1,
    parentId: "c4",
    author: "Ron Petrusha",
    dateLabel: "3 Sep 2019 21:57",
  },
  {
    id: "c5",
    shortHash: "a11bc45",
    message: "refactor(auth): harden route guard",
    lane: 0,
    parentId: "c4",
    author: "Dmitri Ivanov",
    dateLabel: "3 Sep 2019 21:12",
  },
  {
    id: "c4",
    shortHash: "98bd321",
    message: "feat(core): bootstrap app shell",
    lane: 0,
    parentId: "c3",
    author: "Tom Pratt",
    dateLabel: "3 Sep 2019 20:41",
  },
  {
    id: "c3",
    shortHash: "72cd905",
    message: "chore: setup lint and formatter",
    lane: 0,
    parentId: "c2",
    author: "Mauricio de los Santos",
    dateLabel: "3 Sep 2019 20:03",
  },
  {
    id: "c2",
    shortHash: "8c1aa2c",
    message: "chore: project scaffold",
    lane: 0,
    author: "Terry Kim",
    dateLabel: "3 Sep 2019 19:30",
  },
];

export const GIT_REBASE_CONFLICT_RULES: GitRebaseConflictRule[] = [
  {
    sourceCommitId: "c9",
    filePath: "auth.tsx",
    reason: "commit นี้แก้ auth guard จุดเดียวกับ main จึงต้องแก้ conflict ก่อน continue",
  },
];

export const GIT_REBASE_SYNTHETIC_HASHES = [
  "f13de33",
  "a3d4c9e",
  "b7e9f1a",
  "c6ab220",
  "d7ee441",
  "e8aa552",
  "f9bd663",
  "abce774",
] as const;

export const GIT_REBASE_COMMAND_DOCS: GitRebaseCommandDoc[] = [
  {
    id: "switch-login",
    title: "เลือก branch ต้นทางก่อน rebase",
    purpose: "ให้แน่ใจว่า HEAD อยู่ที่ feature branch ที่ต้องการ rewrite",
    command: "git switch feature/login",
    description:
      "ในเดโมนี้จะเริ่มจาก feature/login แล้ว rebase เข้า main เพื่อดูความต่างของ hash",
  },
  {
    id: "rebase-main",
    title: "ย้ายฐาน branch ไป main",
    purpose: "รีเพลย์ commit ของ branch ปัจจุบันให้ไปต่อบนปลายล่าสุดของ main",
    command: "git rebase main",
    description:
      "จำลองการ rewrite commit ทีละก้อน โดยต้องกด continue เพื่อ replay แต่ละขั้น",
    notes: [
      "main จะไม่ถูก rewrite ใน flow นี้",
      "commit ของ branch ต้นทางจะได้ hash ใหม่",
    ],
  },
  {
    id: "rebase-interactive",
    title: "วางแผน rebase แบบ interactive",
    purpose: "เปิด todo list เพื่อ reorder/squash ก่อนเริ่ม replay",
    command: "git rebase -i main",
    description:
      "เดโมรองรับ pick/squash และเลื่อนลำดับ commit ก่อนกด apply plan",
  },
  {
    id: "rebase-continue",
    title: "ดำเนินการ replay ต่อ",
    purpose: "เดิน rebase ทีละก้อน หลังแก้ conflict หรือหลังเริ่ม session",
    command: "git rebase --continue",
    description:
      "ถ้าเจอ conflict จะบังคับให้ stage ไฟล์ที่ต้องแก้ด้วย git add ก่อน continue",
  },
  {
    id: "rebase-skip",
    title: "ข้าม commit ปัจจุบัน",
    purpose: "ใช้เมื่อ commit ปัจจุบันไม่ต้องการเก็บต่อในสายประวัติใหม่",
    command: "git rebase --skip",
    description: "ข้าม queue item ปัจจุบันแล้วไป commit ถัดไปทันที",
  },
  {
    id: "add-conflict-file",
    title: "ปลดล็อก conflict gate",
    purpose: "จำลองการ stage ไฟล์ที่แก้ conflict แล้ว",
    command: "git add auth.tsx",
    description:
      "เมื่อ conflict เกิดจาก auth.tsx ต้องรันคำสั่งนี้ก่อนจึงจะ continue ได้",
  },
  {
    id: "rebase-abort",
    title: "ยกเลิก rebase ทั้ง session",
    purpose: "ย้อน branches/commits/current branch กลับ snapshot ก่อนเริ่ม",
    command: "git rebase --abort",
    description:
      "abort ใช้ได้ทั้งตอน in-progress และตอน interactive plan ยังไม่ apply",
  },
];

export const GIT_REBASE_INTERACTIVE_TODO_EXAMPLE = `pick 20ef793 # chore:update.text.txt
pick 5c61de1 # chore:update.text.txt

# Rebase 7ed3c12..5c61de1 onto 7ed3c12 (2 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup [-C | -c] <commit> = like "squash" but keep only the previous
#                    commit's log message, unless -C is used, in which case
#                    keep only this commit's message; -c is same as -C but
#                    opens the editor
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
#         create a merge commit using the original merge commit's
#         message (or the oneline, if no original merge commit was
#         specified); use -c <commit> to reword the commit message
# u, update-ref <ref> = track a placeholder for the <ref> to be updated
#                       to this position in the new commits. The <ref> is
#                       updated at the end of the rebase
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#`;

export const GIT_REBASE_INTERACTIVE_COMMAND_REFERENCES: GitRebaseInteractiveCommandReference[] =
  [
    {
      id: "pick",
      syntax: "p, pick <commit>",
      summary: "ใช้ commit ตามเดิม",
      whenToUse: "ใช้เป็นค่าเริ่มต้นเมื่ออยาก replay commit ทั้งก้อน",
      caution: "ลำดับบรรทัดมีผลโดยตรงต่อลำดับ commit ใหม่",
    },
    {
      id: "reword",
      syntax: "r, reword <commit>",
      summary: "ใช้ commit เดิมแต่แก้ข้อความ commit message",
      whenToUse: "เมื่อเนื้อหา commit ถูกต้องแต่ข้อความยังไม่ชัด",
      caution: "แก้เฉพาะ message; hash จะเปลี่ยนเพราะมีการ rewrite",
    },
    {
      id: "edit",
      syntax: "e, edit <commit>",
      summary: "หยุดกลางทางเพื่อแก้ commit",
      whenToUse: "ใช้เมื่อต้อง split/amend เนื้อหาใน commit นั้น",
      caution: "ต้องจัดการ `git commit --amend` และ `git rebase --continue` ให้ครบ",
    },
    {
      id: "squash",
      syntax: "s, squash <commit>",
      summary: "รวม commit นี้กับ commit ก่อนหน้า",
      whenToUse: "ลด commit ย่อยให้เป็นก้อนที่อ่านง่ายขึ้น",
      caution: "ต้องมี commit ก่อนหน้าเสมอ และต้องเลือกข้อความ commit รวมใหม่",
    },
    {
      id: "fixup",
      syntax: "f, fixup [-C | -c] <commit>",
      summary: "รวมเหมือน squash แต่เน้นทิ้งข้อความ commit ที่ตามมา",
      whenToUse: "ใช้กับ commit แก้ไขเล็ก ๆ ที่ไม่อยากเพิ่ม noise ในประวัติ",
      caution: "ระวังข้อความ commit สุดท้ายไม่สะท้อน intent ถ้า fixup หลายชั้น",
    },
    {
      id: "exec",
      syntax: "x, exec <command>",
      summary: "รัน shell command ระหว่าง rebase",
      whenToUse: "ใช้รันทดสอบหรือตรวจ format ทุกจุดที่ replay",
      caution: "คำสั่งที่ fail จะหยุด rebase และต้องแก้สถานะก่อน continue",
    },
    {
      id: "break",
      syntax: "b, break",
      summary: "หยุดชั่วคราวในจุดนั้น",
      whenToUse: "ใช้แบ่ง checkpoint กลาง rebase",
      caution: "ต้องจำกลับมารัน `git rebase --continue` เอง",
    },
    {
      id: "drop",
      syntax: "d, drop <commit>",
      summary: "ลบ commit นั้นออกจากประวัติใหม่",
      whenToUse: "ใช้ตัด commit ที่ไม่ต้องการแล้วจริง ๆ",
      caution: "ข้อมูล commit หายจากสายประวัติใหม่ทันที",
    },
    {
      id: "label",
      syntax: "l, label <label>",
      summary: "ตั้งชื่อจุด HEAD ปัจจุบัน",
      whenToUse: "ใช้กับ rebase ขั้นสูงที่มีหลายช่วงและต้องอ้างตำแหน่ง",
      caution: "ชื่อ label ต้องชัด ไม่ซ้ำ และสัมพันธ์กับ flow ที่จะ reset/merge ต่อ",
    },
    {
      id: "reset",
      syntax: "t, reset <label>",
      summary: "ย้าย HEAD กลับไปตำแหน่ง label",
      whenToUse: "ใช้สร้างประวัติซับซ้อนหรือย้อนตำแหน่งในการประกอบ commit",
      caution: "ถ้า label ผิดหรือหาย จะทำให้ flow สับสนและ replay พลาดได้",
    },
    {
      id: "merge",
      syntax: "m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]",
      summary: "สร้าง merge commit ระหว่าง interactive rebase",
      whenToUse: "ใช้กรณี preserve merge topology บางส่วน",
      caution: "ซับซ้อนสูง ควรใช้เมื่อทีมมี policy ชัดเจนเรื่อง merge history",
    },
    {
      id: "update-ref",
      syntax: "u, update-ref <ref>",
      summary: "อัปเดต ref placeholder ตอนจบ rebase",
      whenToUse: "ใช้ใน workflow ขั้นสูงที่ต้อง track ref หลายจุด",
      caution: "ตั้ง ref ผิดอาจทำให้ pointer ไปผิด commit chain",
    },
  ];

export const GIT_REBASE_INTERACTIVE_NOTES: string[] = [
  "บรรทัดใน todo file สามารถสลับลำดับได้ และจะถูกรันจากบนลงล่างเสมอ",
  "การลบบรรทัดเท่ากับลบ commit นั้นออกจากประวัติใหม่",
  "ถ้าลบทุกบรรทัด Git จะมองว่า rebase ถูกยกเลิก (aborted)",
  "interactive rebase เป็นการ rewrite history จึงทำให้ commit hash เปลี่ยน",
];

export const GIT_REBASE_INTERACTIVE_SIMULATOR_COVERAGE: string[] = [
  "Simulator หน้านี้รองรับ flow ใช้งานจริงแบบย่อ: `git rebase -i main`, reorder, squash, continue, skip, abort และ git add สำหรับ conflict gate",
  "คำสั่งอย่าง `reword`, `edit`, `fixup`, `exec`, `break`, `drop`, `label`, `reset`, `merge`, `update-ref` แสดงเป็น reference เชิงแนวคิดเท่านั้น",
  "เนื้อหา reference ครอบคลุม Git จริงได้กว้างกว่าพฤติกรรมจำลองในหน้า demo",
];

export const GIT_REBASE_SAFETY_NOTES: string[] = [
  "ก่อน rebase ให้ยืนยันว่ากำลังอยู่บน feature branch ที่ต้องการ rewrite",
  "`git rebase` เปลี่ยน commit hash จึงไม่ควร force-push ไปทับงานคนอื่นโดยไม่ตกลงทีม",
  "ถ้าเจอ conflict ให้แก้ไฟล์และ `git add <file>` ก่อนค่อย `git rebase --continue`",
  "`git rebase --skip` ใช้ตัด commit ปัจจุบันออกจากประวัติใหม่ ควรใช้แบบตั้งใจ",
  "เมื่อไม่มั่นใจ ให้ `git rebase --abort` เพื่อกลับ snapshot ก่อนเริ่ม",
];

export const GIT_REBASE_LAB_STEPS: GitRebaseLabStep[] = [
  {
    id: "lab-step-1",
    title: "Step 1: Standard Rebase",
    task: "ย้าย feature/login ไปบน main และ replay ให้ครบ",
    commands: [
      {
        command: "git switch feature/login",
        description: "สลับไป branch ที่ต้องการ rebase",
      },
      {
        command: "git rebase main",
        description: "เริ่ม session rebase ไปยัง main",
      },
      {
        command: "git rebase --continue",
        description: "replay commit ก้อนแรก",
      },
      {
        command: "git rebase --continue",
        description: "replay ก้อนสุดท้ายจนจบ session",
      },
    ],
    checkpoint:
      "feature/login ต้องชี้ hash ใหม่ และ main ยังชี้ที่ hash เดิม",
  },
  {
    id: "lab-step-2",
    title: "Step 2: Conflict And Gate",
    task: "ทดสอบ conflict flow แบบ deterministic",
    commands: [
      {
        command: "git switch feature/conflict",
        description: "เข้า branch ที่ถูกตั้งกฎ conflict ไว้",
      },
      {
        command: "git rebase main",
        description: "เริ่ม rebase ไปยัง main",
      },
      {
        command: "git rebase --continue",
        description: "ต้องเจอ conflict message ก่อน",
      },
      {
        command: "git add auth.tsx",
        description: "ปลดล็อก conflict gate หลังแก้ไฟล์",
      },
      {
        command: "git rebase --continue",
        description: "ผ่าน conflict และจบ replay",
      },
    ],
    checkpoint:
      "ถ้าไม่ git add auth.tsx ก่อน continue ต้องไม่ผ่าน",
  },
  {
    id: "lab-step-3",
    title: "Step 3: Interactive Rebase (`-i`)",
    task: "เปิด todo, reorder/squash แล้ว apply",
    commands: [
      {
        command: "git switch feature/login",
        description: "กลับมาที่ login branch",
      },
      {
        command: "git rebase -i main",
        description: "เปิด interactive plan",
      },
      {
        command: "git rebase --continue",
        description: "หลัง apply plan ให้ continue ทีละก้อนจนจบ",
      },
    ],
    notes: [
      "ใน UI ใช้ปุ่ม Up/Down และ toggle action เพื่อจัด todo list ก่อน apply",
    ],
    checkpoint:
      "ประวัติใหม่ต้องสะท้อนลำดับ/การ squash ตาม plan",
  },
  {
    id: "lab-step-4",
    title: "Step 4: Skip/Abort",
    task: "ซ้อมทางออกเมื่อไม่ต้องการ commit ปัจจุบันหรืออยากย้อนทั้ง session",
    commands: [
      {
        command: "git rebase --skip",
        description: "ข้าม queue item ปัจจุบันทันที",
      },
      {
        command: "git rebase --abort",
        description: "ย้อนกลับ snapshot ก่อนเริ่ม rebase",
      },
    ],
    checkpoint:
      "skip ต้องลดจำนวน queue และ abort ต้องคืน state เดิมทั้งหมด",
  },
];
