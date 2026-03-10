export type GitMergeCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitMergeLabCommand = {
  command: string;
  description: string;
};

export type GitMergeLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitMergeLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitMergeSimulatorBranch = {
  name: string;
  shortHash: string;
  upstream?: string;
  ahead: number;
  behind: number;
};

export type GitMergeSimulatorCommit = {
  id: string;
  shortHash: string;
  message: string;
  lane: 0 | 1;
  parentId?: string;
  author: string;
  dateLabel: string;
};

export const GIT_MERGE_SIM_INITIAL_CURRENT_BRANCH = "main";

export const GIT_MERGE_SIM_INITIAL_BRANCHES: GitMergeSimulatorBranch[] = [
  {
    name: "main",
    shortHash: "98bd321",
    upstream: "origin/main",
    ahead: 0,
    behind: 0,
  },
  {
    name: "feature/login",
    shortHash: "d42bc11",
    upstream: "origin/feature/login",
    ahead: 2,
    behind: 0,
  },
  {
    name: "feature/payment",
    shortHash: "e44ab90",
    upstream: "origin/feature/payment",
    ahead: 2,
    behind: 0,
  },
];

export const GIT_MERGE_SIM_INITIAL_COMMITS: GitMergeSimulatorCommit[] = [
  {
    id: "c7",
    shortHash: "e44ab90",
    message: "feat(payment): support qr checkout",
    lane: 1,
    parentId: "c6",
    author: "Maira Wenzel",
    dateLabel: "3 Sep 2019 23:27",
  },
  {
    id: "c6",
    shortHash: "c91fd20",
    message: "feat(payment): scaffold payment flow",
    lane: 1,
    parentId: "c3",
    author: "Steve Smith",
    dateLabel: "3 Sep 2019 22:37",
  },
  {
    id: "c5",
    shortHash: "d42bc11",
    message: "feat(login): add oauth callback",
    lane: 1,
    parentId: "c4",
    author: "Youssef Victor",
    dateLabel: "3 Sep 2019 21:27",
  },
  {
    id: "c4",
    shortHash: "b84ad55",
    message: "feat(login): add login screen",
    lane: 1,
    parentId: "c3",
    author: "Ron Petrusha",
    dateLabel: "3 Sep 2019 20:47",
  },
  {
    id: "c3",
    shortHash: "98bd321",
    message: "feat(core): bootstrap app shell",
    lane: 0,
    parentId: "c2",
    author: "Tom Pratt",
    dateLabel: "3 Sep 2019 20:11",
  },
  {
    id: "c2",
    shortHash: "72cd905",
    message: "chore: setup lint and formatter",
    lane: 0,
    parentId: "c1",
    author: "Mauricio de los Santos",
    dateLabel: "3 Sep 2019 19:39",
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

export const GIT_MERGE_SYNTHETIC_HASHES = [
  "f13de33",
  "a3d4c9e",
  "b7e9f1a",
  "c6ab220",
  "d7ee441",
  "e8aa552",
] as const;

export const GIT_MERGE_COMMAND_DOCS: GitMergeCommandDoc[] = [
  {
    id: "merge-default",
    title: "merge แบบปกติ",
    purpose: "รวมงานจาก branch ต้นทางเข้ามายัง branch ปัจจุบัน",
    command: "git merge <branch-name>",
    description:
      "ใช้รวม branch เช่น git merge feature/login โดย Git จะ fast-forward ให้เองถ้าทำได้",
  },
  {
    id: "merge-ff-only",
    title: "บังคับให้เป็น fast-forward เท่านั้น",
    purpose: "ป้องกันการสร้าง merge commit โดยไม่ตั้งใจ",
    command: "git merge --ff-only <branch-name>",
    description:
      "สำเร็จเฉพาะกรณีที่ main เป็น ancestor ของ branch ต้นทาง ถ้าไม่ใช่จะ abort ทันที",
  },
  {
    id: "merge-no-ff",
    title: "บังคับสร้าง merge commit",
    purpose: "เก็บจุดรวมงานให้เห็นชัดในประวัติแม้ fast-forward ได้",
    command: "git merge --no-ff <branch-name>",
    description:
      "เหมาะเมื่อทีมต้องการเห็น boundary ของการรวม feature แต่ละครั้งใน graph",
  },
  {
    id: "merge-squash",
    title: "รวมหลาย commit ให้เหลือ commit เดียว",
    purpose: "ทำประวัติ main ให้อ่านง่ายด้วย commit สรุปเดียว",
    command: "git merge --squash <branch-name>",
    description:
      "รวม diff จาก branch ต้นทางเป็นก้อนเดียวก่อน commit บน branch ปัจจุบัน",
    notes: [
      "ใน Git จริง --squash จะไม่สร้าง merge commit อัตโนมัติ ต้อง commit เองต่อ",
    ],
  },
  {
    id: "merge-abort",
    title: "ยกเลิก merge ที่ค้างอยู่",
    purpose: "ย้อนสถานะก่อนเริ่ม merge เมื่อเจอ conflict แล้วต้องหยุด",
    command: "git merge --abort",
    description:
      "ใช้ยกเลิก merge ที่กำลังค้าง (เช่นมี conflict) แล้วกลับไปยังสถานะก่อนเริ่ม merge",
    notes: [
      "`git merge --abort` ใช้ได้เมื่อมีสถานะ MERGE_HEAD เท่านั้น",
    ],
  },
  {
    id: "status-check",
    title: "เช็กสถานะก่อน merge",
    purpose: "ลดโอกาสชนกับไฟล์ค้างระหว่าง merge",
    command: "git status",
    description:
      "ควรให้ working tree clean ก่อน merge ทุกครั้ง โดยเฉพาะก่อนใช้ --squash",
  },
  {
    id: "log-check",
    title: "ตรวจ graph หลัง merge",
    purpose: "ยืนยันว่า pointer ของ branch ขยับตามที่ตั้งใจ",
    command: "git log --oneline --graph --decorate --all",
    description:
      "ใช้ตรวจรูปแบบประวัติว่าเป็น ff-only, no-ff หรือ squash ตาม workflow ทีม",
  },
];

export const GIT_MERGE_SAFETY_NOTES: string[] = [
  "merge บน branch เป้าหมายให้ถูกก่อนเสมอ (เช่น main หรือ release)",
  "ใช้ `git status` ให้แน่ใจว่าไม่มีไฟล์ค้างก่อน merge",
  "ถ้า merge ค้างเพราะ conflict และยังไม่อยากแก้ต่อ ให้ใช้ `git merge --abort` เพื่อย้อนสถานะ",
  "`--ff-only` เหมาะกับทีมที่ต้องการบังคับ linear history",
  "`--no-ff` ช่วยเก็บจุดรวมงานให้ trace ย้อนหลังง่าย",
  "`--squash` ทำให้ประวัติสะอาดขึ้น แต่จะไม่พก metadata ของ merge commit",
];

export const GIT_MERGE_LAB_STEPS: GitMergeLabStep[] = [
  {
    id: "lab-step-1",
    title: "Step 1: เตรียม merge lab",
    task: "สร้าง repository ทดลองแยกจากโปรเจกต์จริง",
    commands: [
      {
        command: "mkdir git-merge-lab",
        description: "สร้างโฟลเดอร์ทดลอง",
      },
      {
        command: "cd git-merge-lab",
        description: "เข้าโฟลเดอร์ทดลอง",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository พร้อม branch แรกเป็น main",
      },
      {
        command: "echo \"# Git Merge Lab\" > README.md",
        description: "สร้างไฟล์เริ่มต้น",
      },
      {
        command: "git add README.md",
        description: "stage ไฟล์ README",
      },
      {
        command: "git commit -m \"chore: initial commit\"",
        description: "สร้าง commit ฐาน",
      },
    ],
    checkpoint: "รัน git branch แล้วต้องเห็น * main",
  },
  {
    id: "lab-step-2",
    title: "Step 2: สร้าง login branch",
    task: "เตรียม branch สำหรับทดสอบ fast-forward",
    commands: [
      {
        command: "git switch -c feature/login",
        description: "สร้างและสลับไป feature/login",
      },
      {
        command: "echo \"login\" > login.ts",
        description: "สร้างไฟล์งาน login",
      },
      {
        command: "git add login.ts && git commit -m \"feat(login): add login screen\"",
        description: "commit งาน login",
      },
    ],
    checkpoint: "feature/login ต้องมี commit ใหม่ 1 จุด",
  },
  {
    id: "lab-step-3",
    title: "Step 3: merge ด้วย ff-only",
    task: "รวม feature/login เข้าหลักแบบไม่สร้าง merge commit",
    commands: [
      {
        command: "git switch main",
        description: "กลับมาที่ main",
      },
      {
        command: "git merge --ff-only feature/login",
        description: "fast-forward main ไปที่ปลายของ feature/login",
      },
      {
        command: "git log --oneline --graph --decorate --all",
        description: "เช็กว่าไม่มี merge commit ใหม่",
      },
    ],
    checkpoint: "main และ feature/login ชี้ hash เดียวกัน",
  },
  {
    id: "lab-step-4",
    title: "Step 4: ทดลอง no-ff",
    task: "บังคับสร้าง merge commit เพื่อคง boundary ของงาน",
    commands: [
      {
        command: "git switch -c feature/profile",
        description: "สร้าง branch ใหม่สำหรับทดสอบ no-ff",
      },
      {
        command: "echo \"profile\" > profile.ts",
        description: "เพิ่มไฟล์ profile",
      },
      {
        command: "git add profile.ts && git commit -m \"feat(profile): add profile page\"",
        description: "commit งาน profile",
      },
      {
        command: "git switch main && git merge --no-ff feature/profile",
        description: "รวมงานด้วย merge commit",
      },
    ],
    checkpoint: "git log ต้องเห็น merge commit ใหม่บน main",
  },
  {
    id: "lab-step-5",
    title: "Step 5: ทดลอง conflict และยกเลิก merge",
    task: "ฝึกออกจาก merge ที่ค้างด้วย --abort",
    commands: [
      {
        command: "git switch -c feature/conflict-demo",
        description: "สร้าง branch conflict-demo",
      },
      {
        command: "echo \"branch-value\" > profile.ts && git add profile.ts && git commit -m \"feat(conflict): branch edit\"",
        description: "commit ฝั่ง branch",
      },
      {
        command: "git switch main",
        description: "กลับมาที่ main",
      },
      {
        command: "echo \"main-value\" > profile.ts && git add profile.ts && git commit -m \"feat(conflict): main edit\"",
        description: "commit ฝั่ง main ในไฟล์เดียวกัน",
      },
      {
        command: "git merge feature/conflict-demo",
        description: "เริ่ม merge (คาดว่าจะเจอ conflict)",
      },
      {
        command: "git merge --abort",
        description: "ยกเลิก merge และกลับสถานะก่อนเริ่ม merge",
      },
    ],
    checkpoint: "หลัง abort ต้องไม่อยู่สถานะ unmerged",
  },
  {
    id: "lab-step-6",
    title: "Step 6: ทดลอง squash merge",
    task: "รวม branch ให้เหลือ commit เดียวบน main",
    commands: [
      {
        command: "git switch -c feature/payment",
        description: "สร้าง branch payment",
      },
      {
        command: "echo \"pay-1\" > payment.ts && git add payment.ts && git commit -m \"feat(payment): step 1\"",
        description: "commit payment รอบที่ 1",
      },
      {
        command: "echo \"pay-2\" >> payment.ts && git add payment.ts && git commit -m \"feat(payment): step 2\"",
        description: "commit payment รอบที่ 2",
      },
      {
        command: "git switch main && git merge --squash feature/payment",
        description: "รวมงานเป็น staging ก้อนเดียว",
      },
      {
        command: "git commit -m \"feat(payment): squash merge feature/payment\"",
        description: "สร้าง commit สรุปบน main",
      },
    ],
    checkpoint: "main ต้องได้ commit เดียวแทน payment ทั้งก้อน",
  },
  {
    id: "lab-step-7",
    title: "Step 7: cleanup",
    task: "ลบโฟลเดอร์ทดลองเมื่อเสร็จ",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ git-merge-lab",
      },
      {
        command: "rm -rf git-merge-lab",
        description: "ลบโฟลเดอร์ทดลอง",
      },
    ],
    notes: [
      "ตรวจ path ให้ถูกต้องก่อนรัน rm -rf ทุกครั้ง",
    ],
    checkpoint: "โฟลเดอร์ git-merge-lab ถูกลบเรียบร้อย",
  },
];
