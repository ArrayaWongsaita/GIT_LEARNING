export type GitSwitchCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitSwitchLabCommand = {
  command: string;
  description: string;
};

export type GitSwitchLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitSwitchLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitSwitchSimulatorBranch = {
  name: string;
  shortHash: string;
  upstream?: string;
  ahead: number;
  behind: number;
};

export type GitSwitchSimulatorCommit = {
  id: string;
  shortHash: string;
  message: string;
  lane: 0 | 1;
  parentId?: string;
  author: string;
  dateLabel: string;
};

export type GitSwitchRefState =
  | { kind: "branch"; branchName: string }
  | { kind: "detached"; commitHash: string };

export const GIT_SWITCH_SIM_INITIAL_BRANCHES: GitSwitchSimulatorBranch[] = [
  {
    name: "main",
    shortHash: "f13de33",
    upstream: "origin/main",
    ahead: 0,
    behind: 0,
  },
  {
    name: "feature/login",
    shortHash: "d42bc11",
    upstream: "origin/feature/login",
    ahead: 0,
    behind: 0,
  },
  {
    name: "feature/profile",
    shortHash: "b7e9f1a",
    upstream: "origin/feature/profile",
    ahead: 2,
    behind: 0,
  },
  {
    name: "fix/token-refresh",
    shortHash: "c91fd20",
    upstream: "origin/fix/token-refresh",
    ahead: 0,
    behind: 1,
  },
];

export const GIT_SWITCH_SIM_INITIAL_COMMITS: GitSwitchSimulatorCommit[] = [
  {
    id: "c12",
    shortHash: "b7e9f1a",
    message: "feat(profile): add avatar crop",
    lane: 1,
    parentId: "c11",
    author: "Maira Wenzel",
    dateLabel: "3 Sep 2019 23:27",
  },
  {
    id: "c11",
    shortHash: "a3d4c9e",
    message: "feat(profile): scaffold profile editor",
    lane: 1,
    parentId: "c10",
    author: "Steve Smith",
    dateLabel: "3 Sep 2019 21:37",
  },
  {
    id: "c10",
    shortHash: "f13de33",
    message: "merge: feature/login into main",
    lane: 0,
    parentId: "c9",
    author: "Tom Pratt",
    dateLabel: "3 Sep 2019 20:47",
  },
  {
    id: "c9",
    shortHash: "e71ac20",
    message: "feat(login): add oauth callback",
    lane: 0,
    parentId: "c8",
    author: "Youssef Victor",
    dateLabel: "3 Sep 2019 20:27",
  },
  {
    id: "c8",
    shortHash: "d42bc11",
    message: "feat(login): add login screen",
    lane: 0,
    parentId: "c7",
    author: "Maira Wenzel",
    dateLabel: "3 Sep 2019 20:04",
  },
  {
    id: "c7",
    shortHash: "c91fd20",
    message: "fix(auth): validate refresh token",
    lane: 0,
    parentId: "c6",
    author: "Ron Petrusha",
    dateLabel: "3 Sep 2019 19:27",
  },
  {
    id: "c6",
    shortHash: "b84ad55",
    message: "chore: setup lint and formatter",
    lane: 0,
    parentId: "c5",
    author: "Youssef Victor",
    dateLabel: "3 Sep 2019 19:24",
  },
  {
    id: "c5",
    shortHash: "a7e61c0",
    message: "docs: add branching workflow",
    lane: 0,
    parentId: "c4",
    author: "Maira Wenzel",
    dateLabel: "3 Sep 2019 19:19",
  },
  {
    id: "c4",
    shortHash: "98bd321",
    message: "refactor: split auth service",
    lane: 0,
    parentId: "c3",
    author: "Steve Smith",
    dateLabel: "3 Sep 2019 19:14",
  },
  {
    id: "c3",
    shortHash: "82ff110",
    message: "build: add CI cache layer",
    lane: 0,
    parentId: "c2",
    author: "Tom Pratt",
    dateLabel: "3 Sep 2019 19:11",
  },
  {
    id: "c2",
    shortHash: "72cd905",
    message: "feat: bootstrap app shell",
    lane: 0,
    parentId: "c1",
    author: "Mauricio de los Santos",
    dateLabel: "3 Sep 2019 19:09",
  },
  {
    id: "c1",
    shortHash: "8c1aa2c",
    message: "chore: project scaffold",
    lane: 0,
    author: "Terry Kim",
    dateLabel: "3 Sep 2019 19:04",
  },
];

export const GIT_SWITCH_SIM_REMOTE_BRANCHES = [
  "remotes/origin/main",
  "remotes/origin/feature/login",
  "remotes/origin/feature/profile",
  "remotes/origin/fix/token-refresh",
];

export const GIT_SWITCH_SIM_INITIAL_CURRENT_REF: GitSwitchRefState = {
  kind: "branch",
  branchName: "main",
};

export const GIT_SWITCH_SIM_INITIAL_PREVIOUS_BRANCH = "feature/login";

export const GIT_SWITCH_COMMAND_DOCS: GitSwitchCommandDoc[] = [
  {
    id: "switch-existing-branch",
    title: "สลับไปยัง branch ที่มีอยู่แล้ว",
    purpose: "เปลี่ยน context การทำงานไป branch ที่ต้องการทันที",
    command: "git switch <branch-name>",
    description:
      "ใช้สลับ branch เช่น git switch feature/login เพื่อไปทำงานต่อใน branch นั้น",
  },
  {
    id: "create-and-switch-branch",
    title: "สร้าง branch ใหม่พร้อมสลับทันที",
    purpose: "เริ่มงานใหม่ได้รวดเร็วโดยไม่ต้องสร้าง branch แยกอีกคำสั่ง",
    command: "git switch -c <new-branch-name>",
    description:
      "สร้าง branch ใหม่จากจุดปัจจุบันและสลับไป branch นั้นทันที เช่น git switch -c feature/payment",
  },
  {
    id: "switch-previous-branch",
    title: "สลับกลับ branch ก่อนหน้า",
    purpose: "เด้งกลับระหว่าง 2 branches ได้เร็วมากเวลาเทียบงาน",
    command: "git switch -",
    description:
      "สลับกลับไป branch ล่าสุดที่ใช้งานก่อนหน้า เหมาะกับการสลับ main <-> feature บ่อยๆ",
  },
  {
    id: "detach-head",
    title: "เข้าโหมด detached HEAD",
    purpose: "ตรวจสอบ commit เก่าแบบชั่วคราวโดยไม่ผูกกับ branch ปกติ",
    command: "git switch --detach <commit-hash>",
    description:
      "ย้าย HEAD ไปที่ commit ที่ระบุโดยไม่ย้าย pointer ของ branch",
    notes: [
      "ถ้าจะทำงานต่อในจุดนี้ ควรสร้าง branch ใหม่ทันทีด้วย git switch -c <branch-name>",
    ],
  },
  {
    id: "switch-main",
    title: "กลับไป branch หลัก",
    purpose: "กลับมาที่ main เพื่อ merge, pull หรือเริ่มงานใหม่",
    command: "git switch main",
    description:
      "ใช้เมื่อจบงานใน feature branch แล้วต้องกลับมาจัดการ flow บน main",
  },
  {
    id: "status-before-switch",
    title: "เช็กสถานะก่อนและหลังสลับ",
    purpose: "ลดความเสี่ยงชนไฟล์หรือมีงานค้างที่ทำให้ switch ไม่ผ่าน",
    command: "git status",
    description:
      "เช็กว่า working tree clean หรือยัง ถ้าไม่ clean ควร commit/stash ก่อน switch",
  },
  {
    id: "verify-current-branch",
    title: "ยืนยัน branch ที่กำลังใช้งาน",
    purpose: "ป้องกัน commit ผิด branch",
    command: "git branch",
    description:
      "ดูรายชื่อ branch และเครื่องหมาย * เพื่อยืนยันว่าอยู่ branch ถูกต้องก่อน commit",
  },
];

export const GIT_SWITCH_SAFETY_NOTES: string[] = [
  "หลีกเลี่ยงการสลับ branch ตอนมี unstaged changes ที่อาจชนกับ branch ปลายทาง",
  "เช็กสถานะก่อนเสมอด้วย `git status`",
  "ถ้าต้องข้ามไปทำงาน branch อื่นชั่วคราว ให้ commit หรือ stash งานค้างก่อน",
  "`git switch --detach` จะไม่อยู่บน branch ปกติ ถ้าจะทำงานต่อให้สร้าง branch ใหม่ทันที",
];

export const GIT_SWITCH_LAB_STEPS: GitSwitchLabStep[] = [
  {
    id: "lab-step-1",
    title: "Step 1: สร้าง lab และ commit แรกบน main",
    task: "เตรียม repository สำหรับทดลองสลับ branch",
    commands: [
      {
        command: "mkdir git-switch-lab",
        description: "สร้างโฟลเดอร์แยกสำหรับทดลอง",
      },
      {
        command: "cd git-switch-lab",
        description: "เข้าโฟลเดอร์ทดลอง",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository พร้อมกำหนด branch แรกเป็น main",
      },
      {
        command: "echo \"# Git Switch Lab\" > README.md",
        description: "สร้างไฟล์เริ่มต้น",
      },
      {
        command: "git add README.md",
        description: "stage ไฟล์ README",
      },
      {
        command: "git commit -m \"chore: initial commit\"",
        description: "สร้าง commit แรกบน main",
      },
    ],
    checkpoint: "รัน git branch แล้วต้องเห็น * main",
  },
  {
    id: "lab-step-2",
    title: "Step 2: สร้างและสลับ branch ใหม่ทันที",
    task: "เริ่มทำงานฟีเจอร์ login ด้วยคำสั่งเดียว",
    commands: [
      {
        command: "git switch -c feature/login",
        description: "สร้าง branch feature/login และสลับเข้า branch ทันที",
      },
      {
        command: "git branch",
        description: "ยืนยันว่าอยู่ที่ * feature/login",
      },
    ],
    checkpoint: "ต้องเห็น * feature/login",
  },
  {
    id: "lab-step-3",
    title: "Step 3: แก้ไฟล์และ commit ใน branch ฟีเจอร์",
    task: "สร้างงานใน feature/login เพื่อให้เห็นความต่างจาก main",
    commands: [
      {
        command: "echo \"console.log('login');\" > login.ts",
        description: "สร้างไฟล์ login.ts",
      },
      {
        command: "git add login.ts",
        description: "stage ไฟล์ login.ts",
      },
      {
        command: "git commit -m \"feat(login): add login flow\"",
        description: "commit งานใน branch ฟีเจอร์",
      },
    ],
    checkpoint: "รัน git log --oneline -n 2 แล้วเห็น commit feat(login)",
  },
  {
    id: "lab-step-4",
    title: "Step 4: สลับกลับ main",
    task: "กลับไป branch หลักเพื่อตรวจสถานะงาน",
    commands: [
      {
        command: "git switch main",
        description: "สลับกลับ branch main",
      },
      {
        command: "git branch",
        description: "ยืนยันว่าอยู่ * main",
      },
    ],
    checkpoint: "ต้องเห็น * main และไฟล์ login.ts ยังไม่อยู่ใน main (ถ้ายังไม่ merge)",
  },
  {
    id: "lab-step-5",
    title: "Step 5: สลับกลับ branch ก่อนหน้าด้วย -",
    task: "ฝึกสลับไปมาระหว่าง branch อย่างรวดเร็ว",
    commands: [
      {
        command: "git switch -",
        description: "สลับกลับไป branch ก่อนหน้า",
      },
      {
        command: "git branch",
        description: "ตรวจว่ากลับมา feature/login จริง",
      },
    ],
    checkpoint: "ต้องกลับมา * feature/login",
  },
  {
    id: "lab-step-6",
    title: "Step 6: ทดลอง detached HEAD แล้วกลับ main",
    task: "ดูพฤติกรรมเมื่อ switch ไป commit ตรงๆ",
    commands: [
      {
        command: "git switch --detach HEAD~1",
        description: "ย้าย HEAD ไป commit ก่อนหน้าแบบ detached",
      },
      {
        command: "git status",
        description: "สังเกตข้อความ detached HEAD ในผลลัพธ์",
      },
      {
        command: "git switch main",
        description: "กลับมา branch main",
      },
    ],
    checkpoint: "ต้องกลับมาอยู่ branch main ตามปกติ",
  },
  {
    id: "lab-step-7",
    title: "Step 7: cleanup โฟลเดอร์ทดลอง",
    task: "ลบโฟลเดอร์ lab หลังทดลองเสร็จ",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ git-switch-lab",
      },
      {
        command: "rm -rf git-switch-lab",
        description: "ลบโฟลเดอร์ทดลองทั้งหมด",
      },
    ],
    notes: [
      "ตรวจ path ให้ถูกต้องก่อนใช้คำสั่งลบโฟลเดอร์ทุกครั้ง",
    ],
    checkpoint: "โฟลเดอร์ git-switch-lab ถูกลบเรียบร้อย",
  },
];
