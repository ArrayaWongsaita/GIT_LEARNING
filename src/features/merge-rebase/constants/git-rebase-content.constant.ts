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

export type GitRebaseLabDifficulty = "Starter" | "Practice" | "Challenge";

export type GitRebaseLab = {
  id: string;
  title: string;
  summary: string;
  difficulty: GitRebaseLabDifficulty;
  focus: string;
  task: string;
  commands: GitRebaseLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitRebaseLabSection = {
  id: string;
  title: string;
  summary: string;
  workspace: string;
  focusFiles: string[];
  labs: GitRebaseLab[];
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
    id: "rebase-onto",
    title: "ย้ายชุด commit ไปฐานใหม่ด้วย --onto",
    purpose: "ย้าย child branch หรือชุด commit บางช่วงให้ไปอยู่บนฐานใหม่แบบเจาะจง",
    command: "git rebase --onto <new-base> <upstream> <branch>",
    description:
      "เลือกเฉพาะ commit หลัง <upstream> บน <branch> แล้ว replay ไปต่อบน <new-base>",
    notes: [
      "เหมาะกับ stacked branch หรือการย้ายงานเฉพาะช่วงออกจากฐานเดิม",
    ],
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
  "`git rebase --onto` เป็นเครื่องมือ rewrite history ฝั่ง local ขั้นสูง เหมาะกับ stacked branch และยังไม่ได้ถูกจำลองใน simulator หน้านี้",
  "เมื่อไม่มั่นใจ ให้ `git rebase --abort` เพื่อกลับ snapshot ก่อนเริ่ม",
];

export const GIT_REBASE_LAB_SECTIONS: GitRebaseLabSection[] = [
  {
    id: "repo-1-linear-rebase-foundations",
    title: "Repo 1: Linear Rebase Foundations",
    summary:
      "ฝึก flow rebase พื้นฐานให้คล่องบน sandbox เดียว ตั้งแต่สร้าง feature history, ปล่อย main เดินต่อ, แล้วค่อย replay commit กลับมาเป็นเส้นตรง",
    workspace: "rebase-linear-foundation-lab",
    focusFiles: ["README.md", "release-notes.md", "routes.txt"],
    labs: [
      {
        id: "repo-1-linear-rebase-foundations-1",
        title: "Lab 1: Bootstrap linear history sandbox",
        summary: "สร้าง repo ตั้งต้นสำหรับซ้อม rebase แบบไม่มี conflict ก่อน",
        difficulty: "Starter",
        focus: "Repo Setup",
        task:
          "เตรียม sandbox สำหรับฝึก rebase โดยมีไฟล์ docs และ route map ที่แก้ไขง่ายและอ่านผลหลัง rebase ได้ชัด",
        commands: [
          {
            command: "mkdir rebase-linear-foundation-lab",
            description: "สร้างโฟลเดอร์ sandbox ใหม่สำหรับฝึก linear rebase",
          },
          {
            command: "cd rebase-linear-foundation-lab",
            description: "ย้ายเข้าไปทำงานใน sandbox repo แรก",
          },
          {
            command: "git init -b main",
            description: "เริ่ม repository พร้อมกำหนด branch หลักเป็น main",
          },
          {
            command: "echo '# Release Notes Lab' > README.md",
            description: "สร้าง README ไว้ใช้เพิ่ม checklist ระหว่างฝึก",
          },
          {
            command: "echo 'v1.0.0' > release-notes.md",
            description: "สร้าง release notes เบื้องต้นไว้เป็นไฟล์เอกสารหลัก",
          },
          {
            command: "echo '/ -> home' > routes.txt",
            description: "สร้าง route map แบบง่ายเพื่อใช้เพิ่ม history ฝั่ง feature",
          },
          {
            command: "git add README.md release-notes.md routes.txt",
            description: "stage ไฟล์ตั้งต้นทั้งหมดก่อน commit ฐาน",
          },
          {
            command: "git commit -m \"chore: bootstrap release docs repo\"",
            description: "สร้าง base commit ของ sandbox linear rebase",
          },
        ],
        checkpoint:
          "main ควรมี commit ตั้งต้น 1 ก้อน และทั้ง 3 ไฟล์พร้อมใช้สำหรับแตก branch งาน",
        notes: [
          "ถ้าคุณทำ labs แบบต่อเนื่อง ให้รัน Lab 1 เพียงครั้งเดียวเพื่อเตรียม repo",
        ],
      },
      {
        id: "repo-1-linear-rebase-foundations-2",
        title: "Lab 2: Create the first feature commit",
        summary: "เริ่มแตก branch งานและเพิ่ม commit เอกสารก้อนแรกบน feature",
        difficulty: "Starter",
        focus: "Feature Commit",
        task:
          "สร้าง branch งานใหม่แล้วเพิ่ม checklist ฝั่ง release เพื่อให้เห็น feature branch นำหน้า main อย่างชัดเจน",
        commands: [
          {
            command: "git switch -c feature/release-copy",
            description: "สร้าง feature branch สำหรับเก็บงานฝั่ง release copy",
          },
          {
            command: "echo '## Release Checklist' >> README.md",
            description: "เพิ่ม checklist ลง README เพื่อสร้างความเปลี่ยนแปลงก้อนแรกบน feature",
          },
          {
            command: "git add README.md",
            description: "stage เฉพาะไฟล์ README ที่เพิ่งแก้",
          },
          {
            command: "git commit -m \"docs: add release checklist\"",
            description: "บันทึก commit แรกบน feature/release-copy",
          },
        ],
        checkpoint:
          "feature/release-copy ควรนำหน้า main 1 commit และ README มี checklist ใหม่",
      },
      {
        id: "repo-1-linear-rebase-foundations-3",
        title: "Lab 3: Add a second feature commit",
        summary: "เพิ่มอีก commit บน branch เดิมเพื่อให้มี history ที่จะถูก replay มากกว่า 1 ก้อน",
        difficulty: "Practice",
        focus: "Replay Queue",
        task:
          "ต่อยอด feature branch เดิมด้วย commit ที่แก้ routes.txt เพื่อให้ภายหลัง rebase ต้องพา 2 commit ไปวางบนฐานใหม่",
        commands: [
          {
            command: "echo '/releases -> release-dashboard' >> routes.txt",
            description: "เพิ่ม route ใหม่เพื่อสร้าง commit ก้อนที่สองบน feature",
          },
          {
            command: "git add routes.txt",
            description: "stage ไฟล์ routes.txt ที่เพิ่งแก้",
          },
          {
            command: "git commit -m \"feat: add release dashboard route\"",
            description: "สร้าง commit ที่สองบน feature/release-copy",
          },
          {
            command: "git log --oneline --decorate -n 4",
            description: "ดูให้เห็นว่า feature branch มี 2 commit ต่อจากฐานเดิมแล้ว",
          },
        ],
        checkpoint:
          "feature/release-copy ควรมี commit docs และ feat เรียงต่อกันเหนือ base commit เดิม",
      },
      {
        id: "repo-1-linear-rebase-foundations-4",
        title: "Lab 4: Advance main independently",
        summary: "ปล่อยให้ main เดินต่ออีก 1 commit เพื่อสร้างสถานการณ์ที่ต้อง rebase จริง",
        difficulty: "Practice",
        focus: "Divergence",
        task:
          "กลับไป main แล้วแก้ release notes เพื่อให้ main และ feature แยกจากกันก่อนเริ่ม rebase",
        commands: [
          {
            command: "git switch main",
            description: "กลับมาที่ branch หลักก่อนเพิ่ม commit ใหม่บน main",
          },
          {
            command: "echo 'v1.1.0-beta' >> release-notes.md",
            description: "อัปเดต release notes เพื่อให้ main เดินหน้าออกจากฐานเดิม",
          },
          {
            command: "git add release-notes.md",
            description: "stage release-notes.md ที่เพิ่งแก้",
          },
          {
            command: "git commit -m \"docs: prepare beta release notes\"",
            description: "สร้าง commit ใหม่บน main เพื่อบังคับให้ feature ต้อง rebase",
          },
        ],
        checkpoint:
          "ตอนนี้ main และ feature/release-copy ควร diverge คนละด้านจาก base เดียวกัน",
      },
      {
        id: "repo-1-linear-rebase-foundations-5",
        title: "Lab 5: Rebase the feature onto updated main",
        summary: "ย้าย feature history ไปต่อบนปลายใหม่ของ main แบบ linear",
        difficulty: "Practice",
        focus: "Standard Rebase",
        task:
          "กลับไป feature branch แล้ว replay 2 commits ของตัวเองบน commit ล่าสุดของ main เพื่อให้ history กลับมาเป็นเส้นตรง",
        commands: [
          {
            command: "git switch feature/release-copy",
            description: "กลับมายัง branch ที่ต้องการ rewrite history",
          },
          {
            command: "git rebase main",
            description: "ให้ Git replay commit ของ feature/release-copy ไปต่อบนปลายล่าสุดของ main",
          },
          {
            command: "git status",
            description: "ตรวจว่า rebase ปิด session แล้วและ working tree กลับมาสะอาด",
          },
        ],
        checkpoint:
          "feature/release-copy ควรชี้ hash ใหม่ 2 ก้อนบนปลาย main โดยไม่มี merge commit เพิ่ม",
      },
      {
        id: "repo-1-linear-rebase-foundations-6",
        title: "Lab 6: Verify rewritten hashes with git log",
        summary: "อ่าน graph ให้ขาดว่าข้อความ commit เดิมอยู่ครบ แต่ hash ถูก rewrite แล้ว",
        difficulty: "Challenge",
        focus: "History Review",
        task:
          "ใช้ git log เพื่อตรวจว่าทั้งสอง commit บน feature ยังอยู่ครบตามลำดับเดิม แต่ตอนนี้ไปอยู่บน main ด้วย hash ใหม่หลัง rebase",
        commands: [
          {
            command: "git log --oneline --graph --decorate --all",
            description: "ดู graph รวมทุก branch เพื่อยืนยันว่า history กลับมาเป็นเส้นตรง",
          },
          {
            command: "git log --oneline main..feature/release-copy",
            description: "ดูเฉพาะ commit ที่ feature ยังมีมากกว่า main หลัง rebase",
          },
        ],
        checkpoint:
          "ควรเห็น feature/release-copy อยู่บน main แบบ linear และ commit ids ต่างจากก่อน rebase แม้ข้อความยังคงเดิม",
      },
    ],
  },
  {
    id: "repo-2-interactive-cleanup-and-onto",
    title: "Repo 2: Interactive Cleanup & --onto",
    summary:
      "ซ้อม cleanup history ที่ยุ่งด้วย interactive rebase และต่อยอดไปถึงการย้าย stacked branch ด้วย `--onto` เพื่อให้เข้าใจการ re-parent branch แบบเจาะจง",
    workspace: "rebase-interactive-history-lab",
    focusFiles: ["search.ts", "search.helpers.ts", "search.todo.txt"],
    labs: [
      {
        id: "repo-2-interactive-cleanup-and-onto-1",
        title: "Lab 1: Bootstrap search history sandbox",
        summary: "สร้าง repo สำหรับฝึก interactive rebase และ stacked branches",
        difficulty: "Starter",
        focus: "Repo Setup",
        task:
          "เตรียม sandbox ที่มีไฟล์ search หลัก, helper และ todo list เพื่อใช้สร้าง history ที่ตั้งใจให้ยุ่งแล้วค่อย cleanup",
        commands: [
          {
            command: "mkdir rebase-interactive-history-lab",
            description: "สร้างโฟลเดอร์ sandbox สำหรับ interactive rebase",
          },
          {
            command: "cd rebase-interactive-history-lab",
            description: "เข้าไปทำงานใน sandbox ชุดที่สอง",
          },
          {
            command: "git init -b main",
            description: "เริ่ม repository และใช้ main เป็นฐานเริ่มต้น",
          },
          {
            command: "echo \"export const search = () => 'ready';\" > search.ts",
            description: "สร้างไฟล์ search หลักไว้เป็นฐานของ feature",
          },
          {
            command: "echo \"export const normalize = (value) => value.trim();\" > search.helpers.ts",
            description: "สร้าง helper file ตั้งต้นสำหรับงาน refactor ภายหลัง",
          },
          {
            command: "echo '- search api' > search.todo.txt",
            description: "สร้าง todo list แบบง่ายสำหรับเก็บงานค้างใน branch ลูก",
          },
          {
            command: "git add search.ts search.helpers.ts search.todo.txt",
            description: "stage ไฟล์ตั้งต้นทั้งหมด",
          },
          {
            command: "git commit -m \"chore: bootstrap search workspace\"",
            description: "สร้าง base commit ของ sandbox interactive",
          },
        ],
        checkpoint:
          "main ควรมี search.ts, search.helpers.ts และ search.todo.txt พร้อมสำหรับแตก stacked branches",
      },
      {
        id: "repo-2-interactive-cleanup-and-onto-2",
        title: "Lab 2: Create a messy base branch",
        summary: "ตั้งใจสร้าง commit ลำดับไม่สวยบน feature/search-base เพื่อใช้ reordering ภายหลัง",
        difficulty: "Practice",
        focus: "Messy Base History",
        task:
          "สร้าง branch ฐานของ search แล้ว commit งานในลำดับที่ยังไม่สวย เพื่อให้ interactive rebase มีโจทย์ให้ reorder จริง",
        commands: [
          {
            command: "git switch -c feature/search-base",
            description: "สร้าง branch ฐานสำหรับงาน search",
          },
          {
            command: "echo \"export const searchProducts = (term) => buildQuery(term);\" >> search.ts",
            description: "เพิ่มโค้ดที่พึ่ง helper ก่อน เพื่อจงใจทำให้ลำดับ commit ยังไม่เหมาะ",
          },
          {
            command: "git add search.ts",
            description: "stage การเปลี่ยนแปลงแรกบน branch ฐาน",
          },
          {
            command: "git commit -m \"wip: wire searchProducts\"",
            description: "สร้าง commit WIP ที่ควรถูกจัดลำดับใหม่ทีหลัง",
          },
          {
            command: "echo \"export const buildQuery = (value) => value.trim().toLowerCase();\" >> search.helpers.ts",
            description: "เพิ่ม helper ที่ควรอยู่ก่อน commit WIP เมื่อ cleanup history",
          },
          {
            command: "git add search.helpers.ts",
            description: "stage helper function ที่เพิ่งเพิ่ม",
          },
          {
            command: "git commit -m \"feat: add query builder\"",
            description: "สร้าง commit ที่ภายหลังควรถูก reorder มาอยู่ก่อน WIP",
          },
        ],
        checkpoint:
          "feature/search-base ควรมี 2 commits โดยลำดับปัจจุบันยังไม่สวยและพร้อมถูก reorder",
      },
      {
        id: "repo-2-interactive-cleanup-and-onto-3",
        title: "Lab 3: Add a stacked child branch",
        summary: "แตก branch ลูกจาก feature/search-base พร้อมสร้าง noise ที่จะ squash ทีหลัง",
        difficulty: "Practice",
        focus: "Stacked Branch",
        task:
          "สร้าง feature/search-ui จาก branch ฐาน แล้วเพิ่ม commits ย่อย 2 ก้อนเพื่อใช้ซ้อม squash ใน interactive rebase รอบถัดไป",
        commands: [
          {
            command: "git switch -c feature/search-ui",
            description: "สร้าง child branch ที่พึ่งพา feature/search-base อยู่",
          },
          {
            command: "echo '- add search input' >> search.todo.txt",
            description: "เพิ่มงานฝั่ง UI ลง todo list เพื่อสร้าง commit เล็กก้อนแรก",
          },
          {
            command: "git add search.todo.txt",
            description: "stage ไฟล์ todo ที่เพิ่งแก้",
          },
          {
            command: "git commit -m \"wip: add search input todo\"",
            description: "สร้าง commit noise แรกบน branch ลูก",
          },
          {
            command: "echo \"export const renderSearchBox = () => '<input type=\\\"search\\\" />';\" >> search.ts",
            description: "เพิ่มฟังก์ชัน renderSearchBox เพื่อสร้าง commit ย่อยอีกก้อนบน branch ลูก",
          },
          {
            command: "git add search.ts",
            description: "stage search.ts ที่เพิ่งเพิ่ม UI helper",
          },
          {
            command: "git commit -m \"fix: render search box\"",
            description: "สร้าง commit ที่เหมาะจะถูกรวมกับ WIP ก่อนหน้า",
          },
        ],
        checkpoint:
          "feature/search-ui ควรพึ่ง feature/search-base และมี 2 commits ของตัวเองเพิ่มขึ้นมา",
      },
      {
        id: "repo-2-interactive-cleanup-and-onto-4",
        title: "Lab 4: Reorder the base branch with `git rebase -i main`",
        summary: "ใช้ interactive rebase จัดลำดับ commit บน branch ฐานให้เล่าเรื่องดีขึ้น",
        difficulty: "Challenge",
        focus: "Interactive Reorder",
        task:
          "กลับไป feature/search-base แล้วเปิด todo file เพื่อย้าย commit helper ให้อยู่ก่อน commit WIP ที่เรียกใช้งานมัน",
        commands: [
          {
            command: "git switch feature/search-base",
            description: "กลับมาที่ branch ฐานซึ่งมี commit ลำดับไม่สวยอยู่",
          },
          {
            command: "git log --oneline --decorate -n 4",
            description: "ตรวจลำดับ commit ปัจจุบันก่อนเริ่ม interactive rebase",
          },
          {
            command: "git rebase -i main",
            description: "เปิด todo file เพื่อ reorder commits ของ feature/search-base ใหม่",
          },
        ],
        checkpoint:
          "หลังบันทึก todo แล้ว commit `feat: add query builder` ควรถูก replay ให้อยู่ก่อน `wip: wire searchProducts`",
        notes: [
          "ใน editor ให้สลับบรรทัดของ `feat: add query builder` ขึ้นไปไว้ก่อน `wip: wire searchProducts`",
        ],
      },
      {
        id: "repo-2-interactive-cleanup-and-onto-5",
        title: "Lab 5: Squash noisy UI commits and validate the cleanup",
        summary: "ล้าง history ของ branch ลูกให้เหลือ commit ที่สื่อ intent ชัดขึ้น",
        difficulty: "Challenge",
        focus: "Squash Cleanup",
        task:
          "กลับไป feature/search-ui แล้วใช้ interactive rebase เพื่อลด commit ย่อย 2 ก้อนให้เหลือก้อนเดียวที่อธิบายงาน UI ได้ชัดกว่าเดิม",
        commands: [
          {
            command: "git switch feature/search-ui",
            description: "กลับมาที่ child branch ที่ยังมี commits ย่อยค่อนข้าง noisy",
          },
          {
            command: "git rebase -i feature/search-base",
            description: "เปิด todo file เพื่อ squash commits ของ feature/search-ui เข้าด้วยกัน",
          },
          {
            command: "git log --oneline --graph --decorate --all",
            description: "ตรวจ graph หลัง cleanup ว่า branch ลูกเหลือ history ที่อ่านง่ายขึ้นแล้ว",
          },
        ],
        checkpoint:
          "feature/search-ui ควรเหลือ commit UI ที่สะอาดขึ้นและ graph ต้องสะท้อนฐาน branch ใหม่ของมัน",
        notes: [
          "เปลี่ยน commit `fix: render search box` เป็น `squash` แล้วเขียน message ใหม่ให้สรุปงานเป็นก้อนเดียว เช่น `feat: add search ui draft`",
        ],
      },
      {
        id: "repo-2-interactive-cleanup-and-onto-6",
        title: "Lab 6: Move the stacked branch with `--onto`",
        summary: "ย้าย child branch ออกจากฐานเดิมไปวางบน main โดยไม่พก commits ของ base branch มาด้วย",
        difficulty: "Challenge",
        focus: "Branch Re-parenting",
        task:
          "ใช้ `git rebase --onto` เพื่อบอก Git ว่าให้เอาเฉพาะ commits ของ feature/search-ui ที่อยู่หลัง feature/search-base ไปวางต่อบน main",
        commands: [
          {
            command: "git switch feature/search-ui",
            description: "ยืนยันว่า HEAD อยู่ที่ child branch ที่ต้องการย้ายฐาน",
          },
          {
            command: "git rebase --onto main feature/search-base feature/search-ui",
            description: "ย้ายเฉพาะ commits ของ branch ลูกให้ไปต่อบน main โดยตัด dependency ต่อ base branch เดิมออก",
          },
          {
            command: "git log --oneline --graph --decorate --all",
            description: "ตรวจว่าตอนนี้ feature/search-ui ไปต่อบน main แล้วโดยไม่พ่วง history ของ feature/search-base",
          },
        ],
        checkpoint:
          "feature/search-ui ควรกลายเป็น branch อิสระบน main และ feature/search-base ยังคงอยู่แยกต่างหาก",
      },
    ],
  },
  {
    id: "repo-3-conflict-recovery-paths",
    title: "Repo 3: Conflict Recovery Paths",
    summary:
      "ฝึกเส้นทางรับมือ conflict ระหว่าง rebase แบบครบชุด ตั้งแต่ trigger, resolve + continue, abort, ไปจนถึง skip แล้วเปรียบเทียบผลลัพธ์ปลายทาง",
    workspace: "rebase-conflict-recovery-lab",
    focusFiles: ["auth.tsx", "feature-flags.json", "README.md"],
    labs: [
      {
        id: "repo-3-conflict-recovery-paths-1",
        title: "Lab 1: Bootstrap conflict recovery sandbox",
        summary: "เตรียม repo ตั้งต้นที่มีไฟล์ auth, flags และ docs พร้อมสำหรับทำ same-file divergence",
        difficulty: "Starter",
        focus: "Repo Setup",
        task:
          "สร้าง sandbox ใหม่พร้อม auth.tsx, feature-flags.json และ README.md เพื่อใช้ซ้อม conflict recovery หลายแบบใน repo เดียว",
        commands: [
          {
            command: "mkdir rebase-conflict-recovery-lab",
            description: "สร้างโฟลเดอร์ sandbox สำหรับฝึก conflict recovery",
          },
          {
            command: "cd rebase-conflict-recovery-lab",
            description: "เข้าไปทำงานใน sandbox ชุดที่สาม",
          },
          {
            command: "git init -b main",
            description: "เริ่ม repository พร้อม main branch",
          },
          {
            command: "echo \"export const guardMode = 'strict';\" > auth.tsx",
            description: "สร้างไฟล์ auth.tsx ตั้งต้นเพื่อใช้ทำ same-file conflict",
          },
          {
            command: "echo '{\"betaBanner\": false}' > feature-flags.json",
            description: "สร้างไฟล์ flags สำหรับใช้เปรียบเทียบ side changes บน main",
          },
          {
            command: "echo '# Conflict Recovery Lab' > README.md",
            description: "สร้าง README สำหรับบันทึกผลการทดลอง rebase แต่ละแบบ",
          },
          {
            command: "git add auth.tsx feature-flags.json README.md",
            description: "stage ไฟล์ตั้งต้นทั้งหมดก่อน commit ฐาน",
          },
          {
            command: "git commit -m \"chore: bootstrap auth sandbox\"",
            description: "สร้าง base commit ของ sandbox conflict",
          },
        ],
        checkpoint:
          "main ควรมีไฟล์ตั้งต้นครบ 3 ไฟล์และพร้อมใช้ทำ scenario conflict ซ้ำหลายรอบ",
      },
      {
        id: "repo-3-conflict-recovery-paths-2",
        title: "Lab 2: Create a feature branch plus a reusable backup",
        summary: "ทำ branch งานที่มี commit ชนกับ main และเก็บ backup ไว้สำหรับ rerun scenario",
        difficulty: "Practice",
        focus: "Conflict Setup",
        task:
          "สร้าง branch งานที่แก้ auth.tsx และเพิ่ม docs commit ต่อท้าย จากนั้นแตก backup branch ไว้เพื่อกลับมาซ้อม abort/skip ได้โดยไม่ต้อง setup ใหม่",
        commands: [
          {
            command: "git switch -c feature/auth-copy",
            description: "สร้าง feature branch สำหรับงาน auth copy",
          },
          {
            command: "echo \"export const guardMode = 'lenient';\" > auth.tsx",
            description: "แก้ auth.tsx ในทางที่ตั้งใจให้ชนกับ main ภายหลัง",
          },
          {
            command: "git add auth.tsx",
            description: "stage auth.tsx ที่เพิ่งแก้",
          },
          {
            command: "git commit -m \"feat: relax auth guard copy\"",
            description: "สร้าง commit ที่จะกลายเป็นตัวชนหลักระหว่าง rebase",
          },
          {
            command: "echo 'Document the auth copy review flow.' >> README.md",
            description: "เพิ่ม docs commit ต่อท้ายเพื่อใช้สังเกตผลของ skip เทียบกับ continue",
          },
          {
            command: "git add README.md",
            description: "stage README.md ที่เพิ่งแก้",
          },
          {
            command: "git commit -m \"docs: add auth copy note\"",
            description: "สร้าง commit ที่สองบน feature branch",
          },
          {
            command: "git branch feature/auth-copy-raw",
            description: "เก็บจุดตั้งต้นของ branch ไว้สำหรับ rerun scenario แบบ abort และ skip",
          },
        ],
        checkpoint:
          "feature/auth-copy ควรมี 2 commits และ feature/auth-copy-raw ต้องชี้มาที่จุดเดียวกันก่อนเริ่ม rebase",
      },
      {
        id: "repo-3-conflict-recovery-paths-3",
        title: "Lab 3: Diverge main and trigger the conflict",
        summary: "ทำให้ main แก้ไฟล์เดียวกันแล้วเริ่ม rebase เพื่อชน conflict แบบตั้งใจ",
        difficulty: "Practice",
        focus: "Conflict Trigger",
        task:
          "เพิ่ม commit ใหม่บน main ที่แก้ auth.tsx และ flags จากนั้นกลับมาเริ่ม rebase บน feature/auth-copy เพื่อให้ Git หยุดที่ conflict แรก",
        commands: [
          {
            command: "git switch main",
            description: "กลับมาที่ main เพื่อสร้าง commit ใหม่อีกด้านหนึ่ง",
          },
          {
            command: "echo \"export const guardMode = 'strict-with-audit';\" > auth.tsx",
            description: "แก้ auth.tsx บน main ให้ชนกับ commit แรกของ feature/auth-copy",
          },
          {
            command: "echo '{\"betaBanner\": true}' > feature-flags.json",
            description: "อัปเดต flags บน main เพิ่มอีกบริบทหนึ่งของ release",
          },
          {
            command: "git add auth.tsx feature-flags.json",
            description: "stage ไฟล์ที่เปลี่ยนบน main",
          },
          {
            command: "git commit -m \"refactor: harden auth guard on main\"",
            description: "สร้าง commit ใหม่บน main ให้ branch ทั้งสอง diverge กันชัด",
          },
          {
            command: "git switch feature/auth-copy",
            description: "กลับมายัง branch งานที่ต้องการ rebase",
          },
          {
            command: "git rebase main",
            description: "เริ่ม rebase เพื่อให้ Git หยุดที่ auth.tsx conflict",
          },
        ],
        checkpoint:
          "rebase ต้องหยุดที่ commit `feat: relax auth guard copy` และแจ้ง conflict ใน auth.tsx ก่อน docs commit จะถูก replay",
      },
      {
        id: "repo-3-conflict-recovery-paths-4",
        title: "Lab 4: Resolve, stage, and continue",
        summary: "ซ้อมเส้นทางปกติของการแก้ conflict ให้จบ session อย่างปลอดภัย",
        difficulty: "Challenge",
        focus: "Resolve + Continue",
        task:
          "แก้ auth.tsx ให้ได้เวอร์ชันที่ต้องการ, stage ไฟล์นั้น, แล้วสั่ง continue เพื่อ replay commit ที่เหลือต่อจนจบ session",
        commands: [
          {
            command: "echo \"export const guardMode = 'strict-with-audit-copy-reviewed';\" > auth.tsx",
            description: "แทนที่ auth.tsx ด้วยเวอร์ชันที่ต้องการเก็บไว้หลัง resolve conflict",
          },
          {
            command: "git add auth.tsx",
            description: "stage ไฟล์ conflict ที่แก้แล้วเพื่อปลดล็อก rebase",
          },
          {
            command: "git rebase --continue",
            description: "ให้ Git replay commit ปัจจุบันและ commit ถัดไปต่อจนจบ session",
          },
          {
            command: "git log --oneline --graph --decorate --all",
            description: "ตรวจ graph หลัง continue ว่า docs commit ยังถูกพามาด้วยและ branch ชี้ hash ใหม่แล้ว",
          },
        ],
        checkpoint:
          "feature/auth-copy ควรได้ history ใหม่บน main โดยเก็บทั้งผล resolve และ docs commit เอาไว้ครบ",
        notes: [
          "ถ้าใช้ editor จริง ให้แก้ conflict markers ใน auth.tsx แทนการใช้ echo ทับทั้งไฟล์",
        ],
      },
      {
        id: "repo-3-conflict-recovery-paths-5",
        title: "Lab 5: Re-run the same scenario and abort it",
        summary: "ใช้ backup branch เดิมเพื่อซ้อมย้อนกลับเมื่อรู้สึกว่า rebase session ยังไม่พร้อมทำต่อ",
        difficulty: "Challenge",
        focus: "Abort Recovery",
        task:
          "สร้าง branch ทดลองใหม่จาก backup เดิม, ชน conflict แบบเดิมอีกครั้ง, แล้วใช้ `git rebase --abort` เพื่อกลับไปสภาพก่อนเริ่ม session",
        commands: [
          {
            command: "git switch feature/auth-copy-raw",
            description: "กลับไปที่ backup branch ซึ่งยังอยู่ก่อนรอบ rebase ทั้งหมด",
          },
          {
            command: "git switch -c feature/auth-copy-abort",
            description: "แตก branch ใหม่สำหรับซ้อมเส้นทาง abort แยกจาก branch อื่น",
          },
          {
            command: "git rebase main",
            description: "เริ่ม rebase เพื่อให้เกิด conflict เดิมอีกครั้ง",
          },
          {
            command: "git rebase --abort",
            description: "ยกเลิก rebase session และย้อน branch กลับไปจุดก่อนเริ่ม",
          },
          {
            command: "git status",
            description: "เช็กว่า working tree กลับมาสะอาดและไม่มี rebase session ค้างอยู่",
          },
        ],
        checkpoint:
          "feature/auth-copy-abort ต้องกลับไปชี้ history เดิมก่อน rebase และ working tree ควร clean",
      },
      {
        id: "repo-3-conflict-recovery-paths-6",
        title: "Lab 6: Re-run again with `--skip` and compare the outcome",
        summary: "ดูผลของการทิ้ง conflicting commit แล้วปล่อยให้ commit ถัดไปยังถูก replay ต่อ",
        difficulty: "Challenge",
        focus: "Skip Strategy",
        task:
          "สร้าง branch ทดลองใหม่อีกรอบจาก backup เดิม, ชน conflict ซ้ำ, แล้วใช้ `git rebase --skip` เพื่อข้าม commit ที่ชน ก่อนปิดท้ายด้วยการอ่าน graph เปรียบเทียบผลลัพธ์",
        commands: [
          {
            command: "git switch feature/auth-copy-raw",
            description: "กลับสู่ backup branch เดิมอีกครั้งเพื่อเริ่ม scenario ใหม่จากจุดสะอาด",
          },
          {
            command: "git switch -c feature/auth-copy-skip",
            description: "แตก branch ใหม่สำหรับซ้อมเส้นทาง skip",
          },
          {
            command: "git rebase main",
            description: "เริ่ม rebase เพื่อให้ Git หยุดที่ auth.tsx conflict เหมือนเดิม",
          },
          {
            command: "git rebase --skip",
            description: "ข้าม commit ที่ชนกับ main แล้วปล่อยให้ Git replay commit ถัดไปแทน",
          },
          {
            command: "git log --oneline --graph --decorate --all",
            description: "อ่าน graph เพื่อเปรียบเทียบว่า conflicting commit หายไป แต่ docs commit ยังถูกพามาต่อได้",
          },
        ],
        checkpoint:
          "feature/auth-copy-skip ควรไม่มี commit `feat: relax auth guard copy` อยู่ในสายประวัติใหม่ แต่ docs commit ควรยังตามมาบน main ได้",
        notes: [
          "หลังจบ Lab นี้ ลองเทียบ graph ของ `feature/auth-copy`, `feature/auth-copy-abort` และ `feature/auth-copy-skip` เพื่อเห็นผลต่างของ continue, abort และ skip ชัด ๆ",
        ],
      },
    ],
  },
];
