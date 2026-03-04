export type GitReflogCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
};

export type GitReflogEntry = {
  id: string;
  selector: string;
  shortHash: string;
  actionLabel: string;
  message: string;
  timeLabel: string;
};

export type GitReflogCommitEntry = {
  id: string;
  shortHash: string;
  message: string;
  files: string[];
  createdAtLabel: string;
  isCurrentHead: boolean;
};

export type GitReflogLabCommand = {
  command: string;
  description: string;
};

export type GitReflogLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitReflogLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export const GIT_REFLOG_COMMAND_DOCS: GitReflogCommandDoc[] = [
  {
    id: "reflog-default",
    title: "ดูประวัติการขยับ HEAD ล่าสุด",
    purpose: "ตามหาจุดก่อนหน้าเมื่อเผลอ reset/checkout ผิด",
    command: "git reflog",
    description:
      "แสดงประวัติ HEAD movements ในเครื่องนี้ เช่น commit, reset, checkout เพื่อใช้กู้สถานะ",
  },
  {
    id: "reflog-limit",
    title: "ดู reflog แบบจำกัดจำนวนบรรทัด",
    purpose: "โฟกัสเฉพาะประวัติล่าสุดที่เกี่ยวข้อง",
    command: "git reflog -n 5",
    description:
      "ลด noise ด้วยการดูเฉพาะ 5 รายการล่าสุด เหมาะเวลาต้องย้อนเหตุการณ์ที่เพิ่งเกิด",
  },
  {
    id: "recover-head-at",
    title: "กู้สถานะด้วย selector HEAD@{n}",
    purpose: "ย้อนกลับไปตำแหน่งก่อนหน้าโดยอ้างอิง reflog selector",
    command: "git reset --hard HEAD@{1}",
    description:
      "ใช้เมื่อเห็น entry เป้าหมายใน reflog แล้วต้องการย้าย HEAD กลับไปทันที",
  },
  {
    id: "recover-hash",
    title: "กู้สถานะด้วย commit hash",
    purpose: "ย้าย HEAD ไป hash ที่ต้องการโดยตรง",
    command: "git reset --hard <hash>",
    description:
      "ใช้เมื่อรู้ hash จาก reflog/log ชัดเจน และต้องการ recovery แบบระบุตำแหน่งตรงๆ",
  },
  {
    id: "log-check",
    title: "ตรวจยืนยันตำแหน่ง HEAD หลัง recovery",
    purpose: "ยืนยันว่า HEAD กลับมาตรง commit เป้าหมายแล้ว",
    command: "git log --oneline --decorate -n 5",
    description:
      "เช็กว่า pointer ของ HEAD/main อยู่ที่ commit ที่ต้องการหลังรัน reset",
  },
];

export const GIT_REFLOG_INITIAL_ENTRIES: GitReflogEntry[] = [
  {
    id: "entry-0",
    selector: "HEAD@{0}",
    shortHash: "7ab12de",
    actionLabel: "reset",
    message: "moving to HEAD~1",
    timeLabel: "2 minutes ago",
  },
  {
    id: "entry-1",
    selector: "HEAD@{1}",
    shortHash: "c92af38",
    actionLabel: "commit",
    message: "feat: add profile screen",
    timeLabel: "6 minutes ago",
  },
  {
    id: "entry-2",
    selector: "HEAD@{2}",
    shortHash: "7ab12de",
    actionLabel: "commit",
    message: "chore: project scaffold",
    timeLabel: "2 days ago",
  },
  {
    id: "entry-3",
    selector: "HEAD@{3}",
    shortHash: "38af672",
    actionLabel: "commit",
    message: "docs: add setup note",
    timeLabel: "2 days ago",
  },
  {
    id: "entry-4",
    selector: "HEAD@{4}",
    shortHash: "11dd03a",
    actionLabel: "checkout",
    message: "moving from feature/profile to main",
    timeLabel: "3 days ago",
  },
];

export const GIT_REFLOG_INITIAL_COMMITS: GitReflogCommitEntry[] = [
  {
    id: "commit-c92af38",
    shortHash: "c92af38",
    message: "feat: add profile screen",
    files: ["app.ts", "profile.ts"],
    createdAtLabel: "6 minutes ago",
    isCurrentHead: false,
  },
  {
    id: "commit-7ab12de",
    shortHash: "7ab12de",
    message: "chore: project scaffold",
    files: ["index.ts"],
    createdAtLabel: "2 days ago",
    isCurrentHead: true,
  },
  {
    id: "commit-38af672",
    shortHash: "38af672",
    message: "docs: add setup note",
    files: ["README.md"],
    createdAtLabel: "2 days ago",
    isCurrentHead: false,
  },
];

export const GIT_REFLOG_LAB_STEPS: GitReflogLabStep[] = [
  {
    id: "lab-1",
    title: "Step 1: สร้างโฟลเดอร์ทดลอง",
    task: "เตรียม repository แยกสำหรับลอง reflog/recovery",
    commands: [
      {
        command: "mkdir git-reflog-lab",
        description: "สร้างโฟลเดอร์ทดลอง",
      },
      {
        command: "cd git-reflog-lab",
        description: "เข้าโฟลเดอร์ทดลอง",
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
    task: "สร้าง baseline สำหรับประวัติ",
    commands: [
      {
        command: "echo \"console.log('v1');\" > app.ts",
        description: "สร้างไฟล์ app.ts",
      },
      {
        command: "git add app.ts",
        description: "stage app.ts",
      },
      {
        command: "git commit -m \"feat: add app v1\"",
        description: "commit แรก",
      },
    ],
    checkpoint: "git log --oneline -n 1 ต้องเห็น commit v1",
  },
  {
    id: "lab-3",
    title: "Step 3: สร้าง commit รอบสอง",
    task: "ทำให้มีประวัติอย่างน้อยสอง commit",
    commands: [
      {
        command: "echo \"console.log('v2');\" > app.ts",
        description: "แก้ไฟล์เป็น v2",
      },
      {
        command: "git add app.ts",
        description: "stage การแก้ v2",
      },
      {
        command: "git commit -m \"feat: update app v2\"",
        description: "commit รอบสอง",
      },
      {
        command: "git log --oneline --decorate -n 5",
        description: "เช็ก commit v2 อยู่บนสุด",
      },
    ],
    checkpoint: "ต้องเห็น v2 บนสุด และมี v1 อยู่ถัดไป",
  },
  {
    id: "lab-4",
    title: "Step 4: จำลองทำหายด้วย reset",
    task: "ย้อน commit ล่าสุดเพื่อให้ต้องใช้ reflog กู้คืน",
    commands: [
      {
        command: "git reset --hard HEAD~1",
        description: "ย้อนกลับหนึ่ง commit",
      },
      {
        command: "git log --oneline --decorate -n 5",
        description: "จะเห็น commit v2 หายจาก log ปัจจุบัน",
      },
    ],
    checkpoint: "commit v2 หายจาก log แต่ยังค้นได้จาก reflog",
  },
  {
    id: "lab-5",
    title: "Step 5: ค้น commit ที่หายด้วย reflog",
    task: "หา selector/hash ของ commit ที่อยากกู้",
    commands: [
      {
        command: "git reflog",
        description: "ดูรายการ HEAD movements",
      },
      {
        command: "git reflog -n 5",
        description: "โฟกัสรายการล่าสุด",
      },
    ],
    checkpoint: "ต้องเห็น entry ของ commit v2 หรือ selector ที่อ้างถึงจุดก่อน reset",
  },
  {
    id: "lab-6",
    title: "Step 6: กู้กลับด้วย HEAD@{1} หรือ hash",
    task: "ย้าย HEAD กลับไป commit ที่หาย",
    commands: [
      {
        command: "git reset --hard HEAD@{1}",
        description: "กู้กลับด้วย selector จาก reflog",
      },
      {
        command: "git log --oneline --decorate -n 5",
        description: "ยืนยันว่า commit ที่หายกลับมาแล้ว",
      },
    ],
    notes: [
      "ถ้า HEAD@{1} ไม่ตรงเคสของคุณ ให้ใช้ git reset --hard <hash> แทน",
      "ก่อน reset เสี่ยงสูง ให้สำรองงานด้วย git stash push -m \"backup before reflog recovery\"",
    ],
    checkpoint: "commit v2 กลับมาเป็น HEAD ปัจจุบัน",
  },
  {
    id: "lab-7",
    title: "Step 7: cleanup โฟลเดอร์ทดลอง",
    task: "ลบโฟลเดอร์ lab หลังเรียนจบ",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ git-reflog-lab",
      },
      {
        command: "rm -rf git-reflog-lab",
        description: "ลบโฟลเดอร์ทดลอง",
      },
    ],
    notes: ["ตรวจ path ก่อนสั่ง rm -rf ทุกครั้ง"],
    checkpoint: "โฟลเดอร์ git-reflog-lab ถูกลบเรียบร้อย",
  },
];
