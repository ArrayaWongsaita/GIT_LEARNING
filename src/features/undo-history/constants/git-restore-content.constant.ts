export type GitRestoreCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
};

export type GitRestoreSimulatorFile = {
  id: string;
  name: string;
  changeType: "modified" | "new";
  state: "working" | "staged" | "clean";
  sourceRef: "HEAD" | "HEAD~1";
};

export type GitRestoreLabCommand = {
  command: string;
  description: string;
};

export type GitRestoreLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitRestoreLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export const GIT_RESTORE_COMMAND_DOCS: GitRestoreCommandDoc[] = [
  {
    id: "restore-working-file",
    title: "คืนไฟล์ใน Working Directory",
    purpose: "ยกเลิกการแก้ไฟล์ล่าสุดและคืนไฟล์ให้ตรงกับ HEAD",
    command: "git restore <file>",
    description:
      "ใช้เมื่อต้องการทิ้งการแก้ในไฟล์นั้นจาก working tree เช่น git restore config.ts",
  },
  {
    id: "restore-unstage-file",
    title: "ดึงไฟล์ออกจาก Staging Area",
    purpose: "เอาไฟล์ออกจาก staged โดยยังคงเนื้อหาที่แก้ไว้ใน working tree",
    command: "git restore --staged <file>",
    description:
      "เหมาะกับกรณี add ผิดไฟล์หรือยังไม่อยากให้ไฟล์นั้นเข้า commit รอบนี้",
  },
  {
    id: "restore-from-previous-commit",
    title: "ดึงไฟล์จาก commit ก่อนหน้า",
    purpose: "ทดลองคืนไฟล์จาก snapshot อื่นด้วย --source",
    command: "git restore --source=HEAD~1 <file>",
    description:
      "ดึงเนื้อหาไฟล์จาก commit ก่อนหน้า (HEAD~1) มาใส่ใน working tree เพื่อเทียบหรือย้อนเฉพาะไฟล์",
  },
  {
    id: "restore-status-check",
    title: "ตรวจผลลัพธ์ทุกครั้ง",
    purpose: "ยืนยันผลว่าไฟล์อยู่ staged/working/clean ตามที่ตั้งใจ",
    command: "git status",
    description:
      "ควรรันก่อนและหลัง git restore เสมอ เพื่อไม่พลาดการทิ้งงานที่ยังไม่ต้องการลบ",
  },
];

export const GIT_RESTORE_INITIAL_FILES: GitRestoreSimulatorFile[] = [
  {
    id: "app-ts",
    name: "app.ts",
    changeType: "modified",
    state: "staged",
    sourceRef: "HEAD",
  },
  {
    id: "config-ts",
    name: "config.ts",
    changeType: "modified",
    state: "working",
    sourceRef: "HEAD",
  },
];

export const GIT_RESTORE_LAB_STEPS: GitRestoreLabStep[] = [
  {
    id: "lab-1",
    title: "Step 1: สร้างโฟลเดอร์ทดลองและเริ่ม repo",
    task: "เตรียมพื้นที่ฝึกที่แยกจากโปรเจกต์จริง",
    commands: [
      {
        command: "mkdir git-restore-lab",
        description: "สร้างโฟลเดอร์สำหรับ lab",
      },
      {
        command: "cd git-restore-lab",
        description: "เข้าโฟลเดอร์ทดลอง",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository พร้อม branch main",
      },
    ],
    checkpoint: "รัน git status แล้วเห็นข้อความ No commits yet",
  },
  {
    id: "lab-2",
    title: "Step 2: สร้าง app.ts และ commit แรก",
    task: "สร้างฐานเริ่มต้นให้มีประวัติ commit แรก",
    commands: [
      {
        command: "echo \"console.log('v1');\" > app.ts",
        description: "สร้างไฟล์ app.ts เวอร์ชันแรก",
      },
      {
        command: "git add app.ts",
        description: "นำไฟล์เข้า staging",
      },
      {
        command: "git commit -m \"feat: add app v1\"",
        description: "สร้าง commit แรก",
      },
      {
        command: "git log --oneline -n 1",
        description: "เช็กว่า commit แรกถูกสร้างแล้ว",
      },
    ],
    checkpoint: "ต้องเห็น commit feat: add app v1 บนสุด",
  },
  {
    id: "lab-3",
    title: "Step 3: แก้ app.ts และสร้าง commit รอบสอง",
    task: "ทำให้มี HEAD~1 สำหรับทดลอง --source",
    commands: [
      {
        command: "echo \"console.log('v2');\" > app.ts",
        description: "อัปเดตเนื้อหา app.ts เป็นเวอร์ชัน 2",
      },
      {
        command: "git add app.ts",
        description: "stage การเปลี่ยนแปลงรอบสอง",
      },
      {
        command: "git commit -m \"feat: update app to v2\"",
        description: "สร้าง commit รอบสอง",
      },
      {
        command: "git log --oneline -n 2",
        description: "ยืนยันว่ามี 2 commits ล่าสุด",
      },
    ],
    checkpoint: "ต้องเห็นทั้ง commit v2 และ v1 ในผลลัพธ์",
  },
  {
    id: "lab-4",
    title: "Step 4: แก้ไฟล์อีกครั้งและ stage",
    task: "จำลองสถานะไฟล์ที่ staged ก่อนทดสอบ restore --staged",
    commands: [
      {
        command: "echo \"console.log('working change');\" > app.ts",
        description: "แก้ไฟล์อีกครั้งใน working tree",
      },
      {
        command: "git add app.ts",
        description: "stage app.ts เข้า staging area",
      },
      {
        command: "git status",
        description: "ตรวจว่า app.ts อยู่ใน Changes to be committed",
      },
    ],
    checkpoint: "app.ts ต้องแสดงใน Changes to be committed",
  },
  {
    id: "lab-5",
    title: "Step 5: ยกเลิก staging ด้วย git restore --staged",
    task: "ดึง app.ts ออกจาก staging โดยยังคงการแก้ใน working tree",
    commands: [
      {
        command: "git restore --staged app.ts",
        description: "ย้าย app.ts ออกจาก staging area",
      },
      {
        command: "git status",
        description: "ดูว่า app.ts กลับไปฝั่ง working changes แล้ว",
      },
    ],
    checkpoint: "app.ts ต้องไม่อยู่ใน Changes to be committed แล้ว",
  },
  {
    id: "lab-6",
    title: "Step 6: ทดลอง restore จาก HEAD และ HEAD~1",
    task: "ลองทั้งคืนไฟล์จาก HEAD และดึงเวอร์ชันจาก commit ก่อนหน้า",
    commands: [
      {
        command: "git restore app.ts",
        description: "ทิ้ง working change แล้วคืนไฟล์ให้ตรงกับ HEAD",
      },
      {
        command: "git restore --source=HEAD~1 app.ts",
        description: "ดึงไฟล์ app.ts จาก commit ก่อนหน้าเข้ามาใน working tree",
      },
      {
        command: "cat app.ts",
        description: "ตรวจว่าเนื้อหาไฟล์กลับไปเป็นเวอร์ชันก่อนหน้า",
      },
      {
        command: "git status",
        description: "เช็กสถานะหลัง restore จาก HEAD~1",
      },
    ],
    notes: [
      "หลัง restore จาก HEAD~1 ไฟล์อาจแสดงเป็น modified เพราะต่างจาก HEAD ปัจจุบัน",
    ],
    checkpoint: "ยืนยันได้ว่าไฟล์ถูกแทนด้วยเนื้อหาจาก HEAD~1",
  },
  {
    id: "lab-7",
    title: "Step 7: จบ lab และ cleanup",
    task: "ลบโฟลเดอร์ทดลองหลังเรียนจบ",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ git-restore-lab",
      },
      {
        command: "rm -rf git-restore-lab",
        description: "ลบโฟลเดอร์ทดลองทั้งหมด",
      },
    ],
    notes: ["ตรวจ path ก่อนสั่ง rm -rf ทุกครั้ง"],
    checkpoint: "โฟลเดอร์ git-restore-lab ถูกลบเรียบร้อย",
  },
];
