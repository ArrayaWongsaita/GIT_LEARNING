export type GitAddCommitCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
};

export type GitAddCommitSimulatorFile = {
  id: string;
  name: string;
  changeType: "modified" | "new";
  state: "working" | "staged";
};

export type GitAddCommitEntry = {
  id: string;
  message: string;
  shortHash: string;
  files: string[];
  createdAtLabel: string;
  isUserCommit: boolean;
};

export type GitAddCommitLabCommand = {
  command: string;
  description: string;
};

export type GitAddCommitLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitAddCommitLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export const GIT_ADD_COMMIT_COMMAND_DOCS: GitAddCommitCommandDoc[] = [
  {
    id: "add-single-file",
    title: "เพิ่มไฟล์เดียวเข้า staging",
    purpose: "เลือกเฉพาะไฟล์ที่พร้อม commit โดยไม่รวมไฟล์อื่นที่ยังไม่พร้อม",
    command: "git add <file>",
    description:
      "ใช้ stage เฉพาะไฟล์ที่กำหนด เช่น git add app.ts เพื่อควบคุมขอบเขต commit ให้ชัดเจน",
  },
  {
    id: "add-all-files",
    title: "เพิ่มทุกไฟล์ที่เปลี่ยนใน scope ปัจจุบัน",
    purpose: "รวบรวมการเปลี่ยนแปลงทั้งหมดก่อน commit อย่างรวดเร็ว",
    command: "git add .",
    description:
      "จะ stage ทั้งไฟล์ใหม่และไฟล์ที่แก้ทั้งหมดในโฟลเดอร์ปัจจุบัน ควรเช็กผลด้วย git status",
  },
  {
    id: "status",
    title: "ตรวจสถานะไฟล์",
    purpose: "ดูว่าไฟล์ไหนอยู่ใน Working Directory และไฟล์ไหนอยู่ใน Staging Area",
    command: "git status",
    description:
      "ใช้ยืนยันสถานะก่อน commit เพื่อป้องกันการส่งไฟล์ผิดเข้าประวัติ",
  },
  {
    id: "commit",
    title: "สร้าง commit จากไฟล์ที่ stage แล้ว",
    purpose: "บันทึก snapshot ของงานที่เลือกไว้ใน staging เข้า repository",
    command: 'git commit -m "message"',
    description:
      "สร้าง commit ใหม่พร้อมข้อความสรุปการเปลี่ยนแปลง ควรเขียน message ให้สื่อความหมาย",
  },
  {
    id: "log",
    title: "ดูประวัติ commit ล่าสุด",
    purpose: "ตรวจว่าการ commit สำเร็จและลำดับประวัติถูกต้อง",
    command: "git log --oneline --decorate -n 5",
    description:
      "แสดง commit ล่าสุดแบบย่อพร้อมตำแหน่ง branch/HEAD เพื่อตรวจ flow add -> commit",
  },
  {
    id: "undo-soft",
    title: "ย้อน commit ล่าสุดแบบเก็บไฟล์ไว้ใน staging",
    purpose: "ยกเลิก commit ล่าสุดโดยไม่ทิ้งงาน เพื่อแก้ไขแล้ว commit ใหม่",
    command: "git reset --soft HEAD~1",
    description:
      "เลื่อน HEAD กลับ 1 commit และดึงไฟล์จาก commit ล่าสุดกลับมา staged อีกครั้ง",
  },
];

export const GIT_ADD_COMMIT_INITIAL_FILES: GitAddCommitSimulatorFile[] = [
  { id: "app-ts", name: "app.ts", changeType: "modified", state: "working" },
  { id: "readme-md", name: "README.md", changeType: "new", state: "working" },
  {
    id: "package-json",
    name: "package.json",
    changeType: "modified",
    state: "working",
  },
];

export const GIT_ADD_COMMIT_INITIAL_HISTORY: GitAddCommitEntry[] = [
  {
    id: "base-commit",
    message: "chore: initial project scaffold",
    shortHash: "a1b2c3d",
    files: ["index.ts"],
    createdAtLabel: "2 days ago",
    isUserCommit: false,
  },
];

export const GIT_ADD_COMMIT_LAB_STEPS: GitAddCommitLabStep[] = [
  {
    id: "lab-1",
    title: "Step 1: เตรียมโฟลเดอร์ทดลอง",
    task: "สร้าง repo ใหม่สำหรับฝึก flow add + commit",
    commands: [
      {
        command: "mkdir git-add-commit-lab",
        description: "สร้างโฟลเดอร์แยกสำหรับทดลอง",
      },
      {
        command: "cd git-add-commit-lab",
        description: "เข้าโฟลเดอร์ทดลอง",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository พร้อม branch เริ่มต้นชื่อ main",
      },
    ],
    checkpoint: "รัน git status แล้วต้องเห็น No commits yet",
  },
  {
    id: "lab-2",
    title: "Step 2: สร้างไฟล์ตัวอย่าง",
    task: "เตรียมไฟล์ให้เห็นทั้งไฟล์ใหม่และไฟล์ที่จะแก้",
    commands: [
      {
        command: "echo \"# Add Commit Lab\" > README.md",
        description: "สร้างไฟล์ README.md",
      },
      {
        command: "echo \"console.log('v1');\" > app.ts",
        description: "สร้างไฟล์ app.ts",
      },
      {
        command: "echo '{\"name\":\"git-add-commit-lab\"}' > package.json",
        description: "สร้างไฟล์ package.json",
      },
      {
        command: "git status",
        description: "เช็กว่าไฟล์ทั้งหมดอยู่ใน Untracked files",
      },
    ],
    checkpoint: "เห็น README.md, app.ts, package.json เป็น untracked",
  },
  {
    id: "lab-3",
    title: "Step 3: add เฉพาะไฟล์ app.ts",
    task: "ฝึกเลือกไฟล์เข้าสตেজทีละไฟล์",
    commands: [
      {
        command: "git add app.ts",
        description: "นำ app.ts เข้า staging",
      },
      {
        command: "git status",
        description: "ดูว่า app.ts อยู่ใน Changes to be committed แล้ว",
      },
    ],
    checkpoint: "app.ts อยู่ staged และไฟล์อื่นยังไม่ถูก stage",
  },
  {
    id: "lab-4",
    title: "Step 4: add ไฟล์ที่เหลือและ commit ครั้งแรก",
    task: "รวบรวมไฟล์ทั้งหมดแล้วสร้าง commit แรก",
    commands: [
      {
        command: "git add .",
        description: "นำไฟล์ที่เหลือทั้งหมดเข้า staging",
      },
      {
        command: "git commit -m \"feat: add initial lab files\"",
        description: "สร้าง commit แรก",
      },
      {
        command: "git log --oneline --decorate -n 3",
        description: "ตรวจว่ามี commit ใหม่บนสุด",
      },
    ],
    checkpoint: "ต้องเห็น commit feat: add initial lab files ใน log",
  },
  {
    id: "lab-5",
    title: "Step 5: แก้ไฟล์แล้ว commit รอบสอง",
    task: "สร้างการเปลี่ยนแปลงรอบใหม่และ commit อีกครั้ง",
    commands: [
      {
        command: "echo \"console.log('v2');\" >> app.ts",
        description: "แก้ app.ts เพิ่มบรรทัดใหม่",
      },
      {
        command: "git add app.ts",
        description: "stage app.ts ที่แก้ล่าสุด",
      },
      {
        command: "git commit -m \"feat: update app log message\"",
        description: "สร้าง commit รอบสอง",
      },
      {
        command: "git log --oneline --decorate -n 5",
        description: "เช็กลำดับประวัติหลัง commit รอบสอง",
      },
    ],
    checkpoint: "commit รอบสองต้องอยู่บรรทัดแรกของ log",
  },
  {
    id: "lab-6",
    title: "Step 6: ย้อน commit ล่าสุดแบบ soft reset",
    task: "ทดลอง undo commit ล่าสุดและตรวจว่าไฟล์กลับมา staged",
    commands: [
      {
        command: "git reset --soft HEAD~1",
        description: "ย้อน commit ล่าสุดโดยคงไฟล์ไว้ใน staging",
      },
      {
        command: "git status",
        description: "ตรวจว่าไฟล์จาก commit ล่าสุดกลับมาอยู่ staged",
      },
    ],
    checkpoint:
      "ต้องเห็นไฟล์กลับมาใน Changes to be committed หลังรัน soft reset",
  },
  {
    id: "lab-7",
    title: "Step 7: ล้างโฟลเดอร์ทดลอง",
    task: "จบการทดลองและคืนสภาพเครื่อง",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ lab",
      },
      {
        command: "rm -rf git-add-commit-lab",
        description: "ลบโฟลเดอร์ทดลองทั้งหมด",
      },
    ],
    notes: ["ตรวจ path ให้ถูกก่อนสั่งลบทุกครั้ง"],
    checkpoint: "โฟลเดอร์ทดลองถูกลบเรียบร้อย",
  },
];
