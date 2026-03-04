export type GitResetCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
};

export type GitResetGuardrail = {
  id: string;
  title: string;
  command?: string;
  description: string;
};

export type GitResetSimulatorFile = {
  id: string;
  name: string;
  changeType: "modified" | "new";
  state: "working" | "staged" | "clean";
};

export type GitResetCommitEntry = {
  id: string;
  message: string;
  shortHash: string;
  files: string[];
  createdAtLabel: string;
  isUserCommit: boolean;
};

export type GitResetLabCommand = {
  command: string;
  description: string;
};

export type GitResetLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitResetLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export const GIT_RESET_COMMAND_DOCS: GitResetCommandDoc[] = [
  {
    id: "reset-soft",
    title: "ย้อน commit แบบเก็บ staged",
    purpose: "ย้อน HEAD กลับ 1 commit แต่เก็บการเปลี่ยนแปลงไว้ใน Staging Area",
    command: "git reset --soft HEAD~1",
    description:
      "ใช้เมื่อ commit ไปแล้วแต่ยังอยากแก้ข้อความ commit หรือจัดไฟล์ใหม่โดยไม่เสีย staged state",
  },
  {
    id: "reset-mixed",
    title: "ย้อน commit แบบ unstage กลับ working",
    purpose: "ย้อน HEAD กลับ 1 commit และดึงไฟล์ออกจาก staging กลับไป working",
    command: "git reset --mixed HEAD~1",
    description:
      "เหมาะเมื่ออยากแก้ไฟล์เพิ่มก่อนเลือก add ใหม่อีกครั้ง (--mixed คือค่า default ของ git reset)",
  },
  {
    id: "reset-hard",
    title: "ย้อน commit และล้าง staged/working",
    purpose: "ย้อน HEAD กลับ 1 commit พร้อมทิ้งการเปลี่ยนแปลงที่ยังไม่ commit",
    command: "git reset --hard HEAD~1",
    description:
      "ใช้เมื่อมั่นใจว่าต้องการทิ้งงานล่าสุดจริงๆ เพราะไฟล์ที่ยังไม่ commit จะหายทันที",
  },
  {
    id: "reset-log-check",
    title: "ตรวจประวัติก่อนและหลัง reset",
    purpose: "ดูว่า HEAD อยู่ที่ commit ไหน และประวัติเปลี่ยนยังไงหลัง reset",
    command: "git log --oneline --decorate -n 5",
    description:
      "เช็กตำแหน่ง HEAD และลำดับ commit ก่อน/หลังรัน reset เพื่อยืนยันว่าถอยถูกจุด",
  },
  {
    id: "reset-status-check",
    title: "ตรวจสถานะไฟล์ก่อนและหลัง reset",
    purpose: "ยืนยันผลว่าการเปลี่ยนแปลงไปอยู่ staged, working หรือหายไปตามโหมดที่ใช้",
    command: "git status",
    description:
      "เป็นคำสั่งที่ต้องรันทุกครั้งก่อนและหลัง reset เพื่อป้องกันการทิ้งไฟล์ผิดโดยไม่ตั้งใจ",
  },
];

export const GIT_RESET_GUARDRAILS: GitResetGuardrail[] = [
  {
    id: "guardrail-log",
    title: "เช็กประวัติที่จะย้อน",
    command: "git log --oneline --decorate -n 5",
    description: "ยืนยัน hash และลำดับ commit ว่าจะ reset กลับไปจุดไหน",
  },
  {
    id: "guardrail-status",
    title: "เช็กไฟล์ค้างใน staged/working",
    command: "git status",
    description: "ดูว่ามีไฟล์ที่ยังไม่ commit ค้างอยู่หรือไม่ ก่อนใช้ --hard",
  },
  {
    id: "guardrail-backup",
    title: "สำรองงานก่อน reset เสี่ยงสูง",
    command: "git stash push -m \"backup before reset\"",
    description: "เก็บงานไว้ก่อนเผื่อเปลี่ยนใจหรือ reset ผิดจุด จะได้ดึงกลับได้",
  },
  {
    id: "guardrail-hard-warning",
    title: "คำเตือนสำคัญ",
    description:
      "git reset --hard จะทิ้ง staged/working changes ที่ยังไม่ commit ทันที ควรใช้หลังสำรองงานแล้วเท่านั้น",
  },
];

export const GIT_RESET_INITIAL_HISTORY: GitResetCommitEntry[] = [
  {
    id: "user-commit-1",
    message: "feat: add profile screen",
    shortHash: "c92af38",
    files: ["app.ts", "profile.ts"],
    createdAtLabel: "just now",
    isUserCommit: true,
  },
  {
    id: "base-commit",
    message: "chore: project scaffold",
    shortHash: "7ab12de",
    files: ["index.ts"],
    createdAtLabel: "2 days ago",
    isUserCommit: false,
  },
];

export const GIT_RESET_INITIAL_FILES: GitResetSimulatorFile[] = [
  {
    id: "app-ts",
    name: "app.ts",
    changeType: "modified",
    state: "clean",
  },
  {
    id: "profile-ts",
    name: "profile.ts",
    changeType: "modified",
    state: "clean",
  },
];

export const GIT_RESET_LAB_STEPS: GitResetLabStep[] = [
  {
    id: "lab-1",
    title: "Step 1: เตรียมโฟลเดอร์ทดลอง",
    task: "สร้าง repository แยกสำหรับฝึก reset",
    commands: [
      {
        command: "mkdir git-reset-lab",
        description: "สร้างโฟลเดอร์ทดลอง",
      },
      {
        command: "cd git-reset-lab",
        description: "เข้าโฟลเดอร์ lab",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository พร้อม branch main",
      },
    ],
    checkpoint: "รัน git status แล้วเห็น No commits yet",
  },
  {
    id: "lab-2",
    title: "Step 2: สร้าง commit แรก (v1)",
    task: "สร้างไฟล์และ commit เริ่มต้น",
    commands: [
      {
        command: "echo \"console.log('v1');\" > app.ts",
        description: "สร้าง app.ts เวอร์ชันแรก",
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
    title: "Step 3: สร้าง commit รอบสอง (v2)",
    task: "สร้าง commit ใหม่เพื่อใช้ทดสอบการ reset",
    commands: [
      {
        command: "echo \"console.log('v2');\" > app.ts",
        description: "แก้ app.ts เป็นเวอร์ชันสอง",
      },
      {
        command: "git add app.ts",
        description: "stage การแก้ v2",
      },
      {
        command: "git commit -m \"feat: update app to v2\"",
        description: "commit รอบสอง",
      },
      {
        command: "git log --oneline --decorate -n 3",
        description: "ดูว่ามี v2 อยู่บนสุด",
      },
    ],
    checkpoint: "commit v2 อยู่บนสุดและ v1 อยู่ถัดลงมา",
  },
  {
    id: "lab-4",
    title: "Step 4: ทดลอง reset --soft",
    task: "ย้อน HEAD แต่เก็บไฟล์ไว้ staged",
    commands: [
      {
        command: "git reset --soft HEAD~1",
        description: "ย้อน commit ล่าสุดแบบ soft",
      },
      {
        command: "git status",
        description: "เช็กว่าไฟล์กลับมาอยู่ staged",
      },
    ],
    checkpoint: "เห็น app.ts อยู่ใน Changes to be committed",
  },
  {
    id: "lab-5",
    title: "Step 5: สร้าง commit ใหม่แล้ว reset --mixed",
    task: "ทดสอบโหมด mixed ให้ไฟล์กลับไป working",
    commands: [
      {
        command: "git commit -m \"feat: re-commit after soft reset\"",
        description: "commit ใหม่จาก staged ที่มีอยู่",
      },
      {
        command: "git reset --mixed HEAD~1",
        description: "ย้อน commit แล้ว unstage ไฟล์",
      },
      {
        command: "git status",
        description: "เช็กว่าไฟล์อยู่ใน Changes not staged for commit",
      },
    ],
    checkpoint: "ไฟล์กลับมา working และไม่อยู่ staged",
  },
  {
    id: "lab-6",
    title: "Step 6: สร้าง commit ใหม่แล้ว reset --hard",
    task: "ทดลอง hard reset พร้อม guardrails",
    commands: [
      {
        command: "git add app.ts",
        description: "นำไฟล์เข้า staging อีกครั้ง",
      },
      {
        command: "git commit -m \"feat: re-commit before hard reset\"",
        description: "สร้าง commit ใหม่สำหรับทดลอง hard reset",
      },
      {
        command: "git log --oneline --decorate -n 5",
        description: "เช็กประวัติก่อน hard reset",
      },
      {
        command: "git status",
        description: "เช็กสถานะไฟล์ก่อน hard reset",
      },
      {
        command: "git reset --hard HEAD~1",
        description: "ย้อน commit พร้อมล้าง staged/working changes",
      },
      {
        command: "git status",
        description: "ยืนยันว่า working tree clean",
      },
    ],
    notes: [
      "ถ้ามีงานสำคัญให้ stash ก่อนเสมอ: git stash push -m \"backup before reset\"",
    ],
    checkpoint: "ต้องเห็น nothing to commit, working tree clean",
  },
  {
    id: "lab-7",
    title: "Step 7: cleanup โฟลเดอร์ทดลอง",
    task: "ลบโฟลเดอร์ lab หลังจบการทดลอง",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ git-reset-lab",
      },
      {
        command: "rm -rf git-reset-lab",
        description: "ลบโฟลเดอร์ทดลองทั้งหมด",
      },
    ],
    notes: ["ตรวจ path ก่อนสั่ง rm -rf ทุกครั้ง"],
    checkpoint: "โฟลเดอร์ git-reset-lab ถูกลบเรียบร้อย",
  },
];
