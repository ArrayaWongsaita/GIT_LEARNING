export type GitLogCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
};

export type GitLogCommitEntry = {
  id: string;
  shortHash: string;
  message: string;
  author: string;
  dateLabel: string;
  branchLabel?: string;
  tags?: string[];
};

export type GitLogLabCommand = {
  command: string;
  description: string;
};

export type GitLogLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitLogLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export const GIT_LOG_COMMAND_DOCS: GitLogCommandDoc[] = [
  {
    id: "log-default",
    title: "ดูประวัติแบบเต็ม",
    purpose: "เห็นรายละเอียด commit ครบทั้ง hash, author, date และข้อความ",
    command: "git log",
    description:
      "ใช้เมื่ออยากอ่านบริบทของแต่ละ commit แบบละเอียดก่อนตัดสินใจ undo หรือแก้ history",
  },
  {
    id: "log-oneline",
    title: "ดูประวัติแบบย่อ",
    purpose: "สแกนภาพรวมประวัติได้เร็วขึ้น",
    command: "git log --oneline",
    description:
      "แสดง hash แบบสั้น + subject ของ commit เหมาะสำหรับดู flow โดยรวม",
  },
  {
    id: "log-graph",
    title: "ดูกราฟ branch และ tag",
    purpose: "ดูการแตกแขนงและจุดรวมของประวัติให้เข้าใจง่าย",
    command: "git log --oneline --graph --decorate",
    description:
      "ใช้เพื่อตรวจความสัมพันธ์ของ commit ระหว่าง branch, HEAD, และ tag",
  },
  {
    id: "log-limit",
    title: "จำกัดจำนวน commit ที่แสดง",
    purpose: "โฟกัสเฉพาะ commit ล่าสุดที่เกี่ยวข้อง",
    command: "git log -n 3",
    description:
      "ช่วยลด noise ในประวัติยาวๆ และโฟกัสกับงานช่วงล่าสุดได้ไวขึ้น",
  },
  {
    id: "log-grep",
    title: "ค้น commit จากคำใน message",
    purpose: "ค้นหาจุดแก้บั๊กหรือหัวข้อเฉพาะจาก commit message",
    command: 'git log --grep "fix" --oneline',
    description:
      "กรองเฉพาะ commit ที่มีคำว่า fix เหมาะกับการตามแก้ regression หรือ bug history",
  },
  {
    id: "log-author",
    title: "ค้น commit ตามผู้เขียน",
    purpose: "ดูงานของคนในทีมแต่ละคนหรือสืบย้อน commit ตามผู้รับผิดชอบ",
    command: 'git log --author="alice" --oneline',
    description:
      "กรองตามชื่อผู้เขียนเพื่อวิเคราะห์งานเป็นรายคนในช่วงเวลาที่ต้องการ",
  },
];

export const GIT_LOG_SIMULATOR_COMMITS: GitLogCommitEntry[] = [
  {
    id: "commit-7",
    shortHash: "f91a2d4",
    message: "feat(auth): add social login with Google",
    author: "alice",
    dateLabel: "2026-02-28 10:12",
    branchLabel: "main",
    tags: ["v1.4.0"],
  },
  {
    id: "commit-6",
    shortHash: "d3e49b1",
    message: "fix(api): handle null profile response",
    author: "bob",
    dateLabel: "2026-02-27 18:40",
  },
  {
    id: "commit-5",
    shortHash: "b72f88a",
    message: "docs(readme): add setup and troubleshooting section",
    author: "alice",
    dateLabel: "2026-02-27 09:22",
  },
  {
    id: "commit-4",
    shortHash: "a4cf2d0",
    message: "chore(ci): cache pnpm store for faster pipeline",
    author: "team-bot",
    dateLabel: "2026-02-26 21:01",
  },
  {
    id: "commit-3",
    shortHash: "8b9e11f",
    message: "feat(ui): add timeline cards for git lessons",
    author: "carol",
    dateLabel: "2026-02-26 14:32",
  },
  {
    id: "commit-2",
    shortHash: "61de7ac",
    message: "fix(parser): prevent crash on empty scope",
    author: "alice",
    dateLabel: "2026-02-25 16:08",
  },
  {
    id: "commit-1",
    shortHash: "32cc45e",
    message: "refactor(sidebar): split sidebar menu components",
    author: "bob",
    dateLabel: "2026-02-25 09:15",
  },
];

export const GIT_LOG_LAB_STEPS: GitLogLabStep[] = [
  {
    id: "lab-1",
    title: "Step 1: สร้าง lab และเริ่ม repository",
    task: "เตรียมโฟลเดอร์ทดลองสำหรับฝึก git log โดยเฉพาะ",
    commands: [
      {
        command: "mkdir git-log-lab",
        description: "สร้างโฟลเดอร์ทดลอง",
      },
      {
        command: "cd git-log-lab",
        description: "เข้าโฟลเดอร์ lab",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository ใหม่พร้อม main",
      },
    ],
    checkpoint: "รัน git status แล้วเห็น No commits yet",
  },
  {
    id: "lab-2",
    title: "Step 2: สร้าง commit แรก",
    task: "สร้างไฟล์และ commit เริ่มต้น",
    commands: [
      {
        command: "echo \"# Git Log Lab\" > README.md",
        description: "สร้าง README สำหรับ repo ทดลอง",
      },
      {
        command: "git add README.md",
        description: "stage ไฟล์ README",
      },
      {
        command: "git commit -m \"feat: add initial readme\"",
        description: "สร้าง commit แรก",
      },
    ],
    checkpoint: "รัน git log --oneline แล้วเห็น commit feat ตัวแรก",
  },
  {
    id: "lab-3",
    title: "Step 3: สร้าง commit ที่มีคำว่า fix",
    task: "เตรียมข้อมูลสำหรับลองกรองด้วย --grep",
    commands: [
      {
        command: "echo \"console.log('safe parser');\" > parser.ts",
        description: "สร้างไฟล์ตัวอย่าง parser.ts",
      },
      {
        command: "git add parser.ts",
        description: "stage parser.ts",
      },
      {
        command: "git commit -m \"fix(parser): handle empty input\"",
        description: "สร้าง commit fix เพื่อใช้ทดสอบ grep",
      },
    ],
    checkpoint: "รัน git log --grep \"fix\" --oneline แล้วต้องเห็น commit นี้",
  },
  {
    id: "lab-4",
    title: "Step 4: เพิ่ม docs/chore commits",
    task: "เพิ่ม commits หลายประเภทเพื่อดูความต่างในประวัติ",
    commands: [
      {
        command: "echo \"## Commands\" >> README.md",
        description: "แก้ README เพิ่มหัวข้อ",
      },
      {
        command: "git add README.md",
        description: "stage การแก้ README",
      },
      {
        command: "git commit -m \"docs(readme): add commands section\"",
        description: "สร้าง docs commit",
      },
      {
        command: "echo \"node_modules\" > .gitignore",
        description: "เพิ่ม .gitignore แบบง่าย",
      },
      {
        command: "git add .gitignore",
        description: "stage .gitignore",
      },
      {
        command: "git commit -m \"chore: add basic gitignore\"",
        description: "สร้าง chore commit",
      },
    ],
    checkpoint: "รัน git log --oneline แล้วเห็นลำดับ feat/fix/docs/chore",
  },
  {
    id: "lab-5",
    title: "Step 5: ลอง git log หลายรูปแบบ",
    task: "อ่านประวัติด้วยคำสั่งแบบต่างๆ แล้วเทียบผลลัพธ์",
    commands: [
      {
        command: "git log --oneline",
        description: "ดูประวัติแบบย่อ",
      },
      {
        command: "git log -n 3",
        description: "ดูแค่ 3 commit ล่าสุด",
      },
      {
        command: "git log --grep \"fix\" --oneline",
        description: "กรองเฉพาะ commit ที่มีคำว่า fix",
      },
      {
        command: "git log --oneline --graph --decorate",
        description: "ดูประวัติพร้อมกราฟและ pointer",
      },
    ],
    checkpoint: "เข้าใจความต่างของ output แต่ละคำสั่งได้ชัดเจน",
  },
  {
    id: "lab-6",
    title: "Step 6: จบ lab และลบโฟลเดอร์ทดลอง",
    task: "เคลียร์ไฟล์ทดลองหลังเรียนจบ",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ git-log-lab",
      },
      {
        command: "rm -rf git-log-lab",
        description: "ลบโฟลเดอร์ทดลองทั้งหมด",
      },
    ],
    notes: ["ตรวจ path ก่อนสั่ง rm -rf ทุกครั้ง"],
    checkpoint: "โฟลเดอร์ git-log-lab ถูกลบเรียบร้อย",
  },
];
