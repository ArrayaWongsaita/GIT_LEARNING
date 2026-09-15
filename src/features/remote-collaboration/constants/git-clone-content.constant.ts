export type GitCloneCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitCloneLabCommand = {
  command: string;
  description: string;
};

export type GitCloneLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitCloneLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export const GIT_CLONE_COMMAND_DOCS: GitCloneCommandDoc[] = [
  {
    id: "clone-basic",
    title: "Clone repository แบบปกติ",
    purpose: "ดาวน์โหลดทั้งโปรเจกต์พร้อม history จาก remote",
    command: "git clone <repository-url>",
    description:
      "เป็นรูปแบบมาตรฐานสำหรับเริ่มทำงานกับ repository ใหม่บนเครื่องเรา",
  },
  {
    id: "clone-custom-folder",
    title: "ตั้งชื่อโฟลเดอร์ปลายทางเอง",
    purpose: "ควบคุมชื่อโฟลเดอร์ที่ได้หลัง clone",
    command: "git clone <repository-url> my-project",
    description:
      "เหมาะเมื่อชื่อ repo ยาวเกินไป หรืออยากใช้ชื่อโฟลเดอร์ที่อ่านง่ายในเครื่อง",
  },
  {
    id: "clone-single-branch",
    title: "Clone เฉพาะ branch เดียว",
    purpose: "ลดข้อมูลที่ดึงลงมาเมื่อต้องการทำงานกับ branch เดียว",
    command: "git clone --branch main --single-branch <repository-url>",
    description:
      "ช่วยลดความซับซ้อนในกรณีที่ต้องการเฉพาะ main และไม่ต้องใช้ branch อื่นทันที",
  },
  {
    id: "clone-shallow",
    title: "Shallow clone",
    purpose: "ดึงประวัติแบบจำกัดความลึกเพื่อให้ clone เร็วขึ้น",
    command: "git clone --depth 1 <repository-url>",
    description:
      "เหมาะกับงานอ่านโค้ดหรือทดลองเร็วๆ ที่ยังไม่ต้องใช้ history เก่าย้อนหลัง",
    notes: [
      "ถ้าต้องการ history เพิ่มเติมภายหลัง ใช้ git fetch --unshallow",
    ],
  },
];

export const GIT_CLONE_SAFETY_NOTES: string[] = [
  "ตรวจสอบ URL ก่อน clone ทุกครั้งเพื่อป้องกัน clone ผิด repository",
  "สำหรับ private repo เตรียมสิทธิ์ให้พร้อม: HTTPS token หรือ SSH key",
  "หลัง clone ให้เช็ก remote ด้วย git remote -v ว่าชี้ไป origin ที่ถูกต้อง",
  "ตรวจสอบ branch เริ่มต้นด้วย git branch -a ก่อนเริ่มแก้โค้ด",
  "ก่อน push งานแรกควรอ่าน CONTRIBUTING/README เพื่อทำงานตาม workflow ทีม",
];

export const GIT_CLONE_LAB_STEPS: GitCloneLabStep[] = [
  {
    id: "clone-lab-1",
    title: "Step 1: เตรียมโฟลเดอร์สำหรับทดลอง",
    task: "สร้าง workspace แยกสำหรับฝึกคำสั่ง clone",
    commands: [
      {
        command: "mkdir git-remote-collab-lab",
        description: "สร้างโฟลเดอร์ทดลอง",
      },
      {
        command: "cd git-remote-collab-lab",
        description: "เข้าโฟลเดอร์ทดลองก่อน clone",
      },
    ],
    checkpoint: "pwd ควรอยู่ในโฟลเดอร์ git-remote-collab-lab",
  },
  {
    id: "clone-lab-2",
    title: "Step 2: Clone repository หลัก",
    task: "ดึง repository จาก remote ลงเครื่อง",
    commands: [
      {
        command: "git clone <repository-url>",
        description: "clone โปรเจกต์แบบมาตรฐาน",
      },
      {
        command: "cd <repository-folder>",
        description: "เข้าโฟลเดอร์ที่ clone มา",
      },
    ],
    checkpoint: "รัน ls แล้วเห็นไฟล์โปรเจกต์และโฟลเดอร์ .git",
  },
  {
    id: "clone-lab-3",
    title: "Step 3: ตรวจสอบ remote และ branch",
    task: "ยืนยันว่าข้อมูล clone ถูกต้องก่อนเริ่มพัฒนา",
    commands: [
      {
        command: "git remote -v",
        description: "เช็ก URL ของ origin",
      },
      {
        command: "git branch -a",
        description: "ดูรายการ branch ทั้ง local/remote",
      },
      {
        command: "git status",
        description: "ยืนยันว่า working tree clean หลัง clone",
      },
    ],
    checkpoint: "สถานะต้อง clean และเห็น remote branches ที่คาดหวัง",
  },
  {
    id: "clone-lab-4",
    title: "Step 4: Clone ลงชื่อโฟลเดอร์ที่กำหนดเอง",
    task: "ฝึก clone แบบตั้งชื่อปลายทางเอง",
    commands: [
      {
        command: "cd ..",
        description: "กลับไป parent folder",
      },
      {
        command: "git clone <repository-url> demo-clone",
        description: "clone ลงโฟลเดอร์ชื่อ demo-clone",
      },
      {
        command: "ls",
        description: "ตรวจสอบว่าโฟลเดอร์ demo-clone ถูกสร้างแล้ว",
      },
    ],
    checkpoint: "มีทั้งโฟลเดอร์เดิมและ demo-clone อยู่ใน workspace",
  },
];
