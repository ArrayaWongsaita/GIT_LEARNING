export type GitCommitCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
};

export type GitCommitLabCommand = {
  command: string;
  description: string;
};

export type GitCommitLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitCommitLabCommand[];
  expected: string;
  notes?: string[];
};

export type GitCommitSimulatorFile = {
  id: string;
  name: string;
  changeType: "modified" | "new";
};

export type GitCommitEntry = {
  id: string;
  message: string;
  shortHash: string;
  files: string[];
  createdAtLabel: string;
  isUserCommit: boolean;
};

export const GIT_COMMIT_COMMAND_DOCS: GitCommitCommandDoc[] = [
  {
    id: "commit-message",
    title: "สร้าง commit ใหม่จากไฟล์ที่ stage แล้ว",
    purpose: "บันทึก snapshot ของงานที่เตรียมไว้ใน Staging Area เข้าไปในประวัติ repository",
    command: 'git commit -m "feat: your message"',
    description:
      "สร้าง commit ใหม่พร้อมข้อความสรุปงานในบรรทัดเดียว ควรเขียนให้ชัดเจนว่า commit นี้เปลี่ยนอะไร",
  },
  {
    id: "status-check",
    title: "ตรวจสถานะก่อน/หลัง commit",
    purpose: "เช็กว่าไฟล์ไหน staged แล้ว และหลัง commit เหลือไฟล์ค้างหรือไม่",
    command: "git status",
    description:
      "ดูสถานะปัจจุบันของ working tree และ staging area เพื่อป้องกันการ commit ไฟล์ผิด",
  },
  {
    id: "log-check",
    title: "ดูประวัติ commit ล่าสุด",
    purpose: "ยืนยันว่า commit เข้าไปในประวัติแล้ว และอ่านข้อความย้อนหลังได้",
    command: "git log --oneline --decorate -n 5",
    description:
      "แสดง commit ล่าสุดแบบย่อ พร้อมตำแหน่ง branch/HEAD ช่วยตรวจลำดับประวัติอย่างรวดเร็ว",
  },
  {
    id: "undo-soft",
    title: "ย้อน commit ล่าสุดแบบเก็บไฟล์ไว้ใน staging",
    purpose: "ยกเลิก commit ล่าสุดโดยไม่ทิ้งงาน เพื่อแก้ไขหรือรวมใหม่ก่อน commit อีกรอบ",
    command: "git reset --soft HEAD~1",
    description:
      "เลื่อน HEAD กลับ 1 commit แต่คงการเปลี่ยนแปลงไว้ใน staged state เหมาะกับแก้ commit message หรือจัดไฟล์ใหม่",
  },
];

export const GIT_COMMIT_INITIAL_STAGED_FILES: GitCommitSimulatorFile[] = [
  { id: "app-ts", name: "app.ts", changeType: "modified" },
  { id: "readme-md", name: "README.md", changeType: "new" },
  { id: "package-json", name: "package.json", changeType: "modified" },
];

export const GIT_COMMIT_INITIAL_HISTORY: GitCommitEntry[] = [
  {
    id: "base-commit",
    message: "chore: initial project scaffold",
    shortHash: "a1b2c3d",
    files: ["index.ts"],
    createdAtLabel: "2 days ago",
    isUserCommit: false,
  },
];

export const GIT_COMMIT_LAB_STEPS: GitCommitLabStep[] = [
  {
    id: "step-1",
    title: "Step 1: เตรียม repo สำหรับทดลอง commit",
    task: "สร้างโฟลเดอร์ใหม่ เริ่ม git และเตรียมไฟล์ตัวอย่าง",
    commands: [
      {
        command: "mkdir git-commit-lab",
        description: "สร้างโฟลเดอร์สำหรับฝึกแยกจากโปรเจกต์จริง",
      },
      {
        command: "cd git-commit-lab",
        description: "เข้าโฟลเดอร์ทดลอง",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository ใหม่และกำหนด branch เริ่มต้นเป็น main",
      },
      {
        command: "echo \"# Git Commit Lab\" > README.md",
        description: "สร้างไฟล์ README ตัวอย่าง",
      },
      {
        command: "echo \"console.log('v1');\" > app.ts",
        description: "สร้างไฟล์ app.ts ตัวอย่าง",
      },
      {
        command: "git add .",
        description: "นำไฟล์ทั้งหมดเข้า Staging Area",
      },
    ],
    expected: "รัน git status แล้วควรเห็นไฟล์อยู่ใน Changes to be committed",
  },
  {
    id: "step-2",
    title: "Step 2: สร้าง commit แรก",
    task: "บันทึก snapshot แรกเข้า repository",
    commands: [
      {
        command: "git commit -m \"feat: add initial lab files\"",
        description: "สร้าง commit แรกจากไฟล์ที่ staged ไว้",
      },
      {
        command: "git log --oneline --decorate -n 3",
        description: "เช็กว่ามี commit ใหม่อยู่บน branch main",
      },
    ],
    expected: "ต้องเห็น commit message ที่เพิ่งสร้างอยู่บนสุดของ log",
  },
  {
    id: "step-3",
    title: "Step 3: แก้ไฟล์และ stage ใหม่",
    task: "จำลองงานรอบสองก่อน commit ถัดไป",
    commands: [
      {
        command: "echo \"console.log('v2');\" >> app.ts",
        description: "แก้ไฟล์ app.ts เพิ่มเนื้อหาใหม่",
      },
      {
        command: "git add app.ts",
        description: "stage เฉพาะไฟล์ app.ts",
      },
      {
        command: "git status",
        description: "ตรวจว่า app.ts อยู่ใน Changes to be committed",
      },
    ],
    expected: "ควรเห็น app.ts เป็น staged change พร้อม commit รอบต่อไป",
  },
  {
    id: "step-4",
    title: "Step 4: สร้าง commit รอบสอง",
    task: "commit งานที่แก้เพิ่ม แล้วตรวจประวัติ",
    commands: [
      {
        command: "git commit -m \"feat: update app.ts\"",
        description: "สร้าง commit รอบสอง",
      },
      {
        command: "git log --oneline --decorate -n 5",
        description: "ตรวจว่า commit รอบสองขึ้นบนสุด",
      },
    ],
    expected: "log ต้องแสดง commit ใหม่ล่าสุดอยู่บรรทัดแรก",
  },
  {
    id: "step-5",
    title: "Step 5: Undo commit ล่าสุดแบบ soft reset",
    task: "ย้อน commit ล่าสุดแต่เก็บไฟล์ไว้ใน staging",
    commands: [
      {
        command: "git reset --soft HEAD~1",
        description: "ยกเลิก commit ล่าสุดโดยคงการเปลี่ยนแปลงไว้ใน staging area",
      },
      {
        command: "git status",
        description: "ตรวจว่าการเปลี่ยนแปลงกลับมาอยู่ใน staged state",
      },
    ],
    expected:
      "ต้องเห็นไฟล์ที่เคยอยู่ใน commit ล่าสุดกลับมาใน Changes to be committed",
    notes: [
      "คำสั่งนี้ไม่ลบเนื้อหาไฟล์ แต่เลื่อน pointer ของ commit กลับไปหนึ่งตำแหน่ง",
    ],
  },
  {
    id: "step-6",
    title: "Step 6: ทำความสะอาดโฟลเดอร์ทดลอง",
    task: "ลบ lab เมื่อทดลองเสร็จ",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ git-commit-lab",
      },
      {
        command: "rm -rf git-commit-lab",
        description: "ลบโฟลเดอร์ทดลองทั้งหมด",
      },
    ],
    expected: "โฟลเดอร์ทดลองถูกลบ และเครื่องกลับสู่สภาพเดิม",
    notes: ["ตรวจ path ให้ถูกต้องก่อนรันคำสั่งลบโฟลเดอร์เสมอ"],
  },
];
