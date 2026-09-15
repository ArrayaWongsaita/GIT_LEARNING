export type GitAddCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
};

export type GitAddSimulatorFile = {
  id: string;
  name: string;
  state: "working" | "staged";
  changeType: "modified" | "new";
};

export type GitAddTutorialStep = {
  id: string;
  title: string;
  task: string;
  commands: {
    command: string;
    description: string;
  }[];
  expected: string;
  notes?: string[];
};

export const GIT_ADD_COMMAND_DOCS: GitAddCommandDoc[] = [
  {
    id: "add-single-file",
    title: "เพิ่มไฟล์เดียวเข้า staging",
    purpose: "เลือกเฉพาะไฟล์ที่พร้อม commit โดยไม่แตะไฟล์อื่น",
    command: "git add <file>",
    description:
      "ใช้ stage เฉพาะไฟล์ที่ระบุ เช่น git add app.ts เพื่อเตรียมไฟล์เดียวก่อน commit",
  },
  {
    id: "add-all-in-scope",
    title: "เพิ่มทุกไฟล์ที่เปลี่ยนใน scope ปัจจุบัน",
    purpose: "รวบรวมการเปลี่ยนแปลงทั้งหมดในโฟลเดอร์ปัจจุบันอย่างรวดเร็ว",
    command: "git add .",
    description:
      "จะ stage ทั้งไฟล์ใหม่และไฟล์ที่แก้ทั้งหมดใน scope ปัจจุบัน ควรเช็ก git status ก่อนเสมอ",
  },
  {
    id: "status-check",
    title: "ตรวจสอบสถานะก่อน commit",
    purpose: "ดูว่าไฟล์ไหนอยู่ใน Working Directory และไฟล์ไหนอยู่ใน Staging Area แล้ว",
    command: "git status",
    description:
      "ใช้ดูผลลัพธ์หลัง git add ว่ามีไฟล์ไหนอยู่ใน Changes to be committed หรือยังไม่ถูก stage",
  },
  {
    id: "unstage-one",
    title: "ยกเลิก staging เฉพาะไฟล์",
    purpose: "ดึงไฟล์ออกจาก staging area โดยไม่ทิ้งการแก้ไขในไฟล์",
    command: "git restore --staged <file>",
    description:
      "ใช้เมื่อเผลอ add ไฟล์ผิด เช่น git restore --staged app.ts แล้วไฟล์จะกลับไปอยู่ working directory",
  },
];

export const GIT_ADD_INITIAL_FILES: GitAddSimulatorFile[] = [
  { id: "app-ts", name: "app.ts", state: "working", changeType: "modified" },
  { id: "readme-md", name: "README.md", state: "working", changeType: "new" },
  {
    id: "package-json",
    name: "package.json",
    state: "working",
    changeType: "modified",
  },
  { id: "license", name: "LICENSE", state: "working", changeType: "new" },
];

export const GIT_ADD_TUTORIAL_STEPS: GitAddTutorialStep[] = [
  {
    id: "step-1",
    title: "Step 1: เตรียมโฟลเดอร์ทดลองบนเครื่องจริง",
    task: "สร้าง repo ใหม่สำหรับฝึก git add และสร้างไฟล์ตัวอย่าง",
    commands: [
      {
        command: "mkdir git-add-lab",
        description: "สร้างโฟลเดอร์สำหรับทดลองโดยแยกจากโปรเจกต์จริง",
      },
      {
        command: "cd git-add-lab",
        description: "เข้าโฟลเดอร์ทดลอง",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository ใหม่โดยกำหนด branch แรกเป็น main",
      },
      {
        command: "echo \"# Git Add Lab\" > README.md",
        description: "สร้างไฟล์ README ตัวอย่าง",
      },
      {
        command: "echo \"console.log('hello');\" > app.ts",
        description: "สร้างไฟล์ app.ts ตัวอย่าง",
      },
      {
        command: "echo '{\"name\":\"git-add-lab\"}' > package.json",
        description: "สร้างไฟล์ package.json ตัวอย่าง",
      },
      {
        command: "git status",
        description: "ตรวจสถานะเริ่มต้น (ควรเห็นไฟล์เป็น untracked)",
      },
    ],
    notes: [
      "Windows PowerShell สามารถใช้ New-Item หรือ Set-Content แทน echo ได้",
    ],
    expected: "ควรเห็น README.md, app.ts, package.json อยู่ใน Untracked files",
  },
  {
    id: "step-2",
    title: "Step 2: stage เฉพาะไฟล์ app.ts",
    task: "ลอง stage ทีละไฟล์เพื่อเข้าใจการเลือกไฟล์ก่อน commit",
    commands: [
      {
        command: "git add app.ts",
        description: "เพิ่มเฉพาะ app.ts เข้า Staging Area",
      },
      {
        command: "git status",
        description: "ตรวจสถานะหลัง stage ไฟล์เดียว",
      },
    ],
    expected: "ควรเห็น app.ts อยู่ใน Changes to be committed และไฟล์อื่นยัง untracked",
  },
  {
    id: "step-3",
    title: "Step 3: stage ทุกไฟล์ด้วย git add .",
    task: "รวบรวมไฟล์ทั้งหมดเข้า staging ในครั้งเดียว",
    commands: [
      {
        command: "git add .",
        description: "เพิ่มทุกไฟล์ที่เปลี่ยนในโฟลเดอร์ปัจจุบันเข้า Staging Area",
      },
      {
        command: "git status",
        description: "ตรวจว่าทุกไฟล์พร้อม commit แล้ว",
      },
    ],
    expected: "ควรเห็นไฟล์ทั้งหมดอยู่ใน Changes to be committed",
  },
  {
    id: "step-4",
    title: "Step 4: unstage เฉพาะ app.ts",
    task: "ยกเลิก staging เฉพาะไฟล์ที่เลือกโดยไม่ทิ้งไฟล์",
    commands: [
      {
        command: "git restore --staged app.ts",
        description: "ดึง app.ts ออกจาก Staging Area กลับไปฝั่ง Working Directory",
      },
      {
        command: "git status",
        description: "ตรวจผลว่า app.ts ไม่ได้ staged แล้ว",
      },
    ],
    expected: "ควรเห็น app.ts กลับไปอยู่รายการที่ยังไม่ staged/หรือ untracked ตามสถานะไฟล์",
  },
  {
    id: "step-5",
    title: "Step 5: จบการทดลองและลบโฟลเดอร์ lab",
    task: "ลบโฟลเดอร์ทดลองเพื่อไม่ให้ค้างในเครื่อง",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ git-add-lab",
      },
      {
        command: "rm -rf git-add-lab",
        description: "ลบโฟลเดอร์ทดลองทั้งหมด",
      },
    ],
    notes: ["ตรวจ path ให้ถูกต้องก่อนรันคำสั่งลบโฟลเดอร์ทุกครั้ง"],
    expected: "โฟลเดอร์ git-add-lab ถูกลบ และเครื่องกลับสู่สภาพเดิม",
  },
];
