export type GitBranchCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitBranchLabCommand = {
  command: string;
  description: string;
};

export type GitBranchLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitBranchLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export const GIT_BRANCH_COMMAND_DOCS: GitBranchCommandDoc[] = [
  {
    id: "list-local-branches",
    title: "ดู branch ในเครื่อง",
    purpose: "เช็กว่าตอนนี้มี branch อะไรบ้างและเราอยู่ branch ไหน",
    command: "git branch",
    description:
      "แสดงรายชื่อ local branches ทั้งหมด โดย branch ปัจจุบันจะมีเครื่องหมาย * นำหน้า",
  },
  {
    id: "create-branch",
    title: "สร้าง branch ใหม่",
    purpose: "แยกงานฟีเจอร์ออกจาก main เพื่อลดความเสี่ยงกับโค้ดหลัก",
    command: "git branch <branch-name>",
    description:
      "สร้าง branch ใหม่จากตำแหน่ง commit ปัจจุบัน เช่น git branch feature/login",
  },
  {
    id: "list-all-branches",
    title: "ดูทั้ง local และ remote branches",
    purpose: "ตรวจรายการ branch ที่มีอยู่ทั้งหมดรวมถึงฝั่ง remote",
    command: "git branch -a",
    description:
      "แสดง branch ในเครื่องและ remote-tracking branches เช่น remotes/origin/main",
  },
  {
    id: "branch-upstream-status",
    title: "ดูความสัมพันธ์ branch กับ upstream",
    purpose: "เช็กว่า branch ของเรา ahead/behind เท่าไรเมื่อเทียบกับ remote",
    command: "git branch -vv",
    description:
      "แสดง commit ล่าสุดของแต่ละ branch พร้อมข้อมูล upstream และสถานะ sync",
  },
  {
    id: "delete-merged-branch",
    title: "ลบ branch ที่ merge แล้ว",
    purpose: "ทำความสะอาด branch ที่ใช้งานเสร็จเพื่อให้รายการอ่านง่าย",
    command: "git branch -d <branch-name>",
    description:
      "ลบ branch อย่างปลอดภัย เฉพาะกรณีที่ merge แล้วเท่านั้น",
    notes: [
      "ถ้ายังไม่ merge คำสั่งจะเตือนและไม่ลบ",
    ],
  },
  {
    id: "force-delete-branch",
    title: "ลบ branch แบบบังคับ",
    purpose: "ใช้เมื่อจำเป็นต้องลบ branch ที่ยังไม่ merge (ควรใช้ด้วยความระวังสูง)",
    command: "git branch -D <branch-name>",
    description:
      "force delete branch ทันที แม้ commit ใน branch นั้นยังไม่ถูก merge",
    notes: [
      "ก่อนใช้ -D ควรเช็กประวัติด้วย git log หรือสำรองงานก่อนเสมอ",
    ],
  },
  {
    id: "switch-branch",
    title: "สลับไปทำงานบน branch อื่น",
    purpose: "ย้าย context การทำงานไป branch ที่ต้องการ",
    command: "git switch <branch-name>",
    description:
      "สลับ branch เช่น git switch feature/login เพื่อเข้าไปทำงานใน branch นั้น",
  },
];

export const GIT_BRANCH_SAFETY_NOTES: string[] = [
  "`git branch -d` จะลบได้เฉพาะ branch ที่ merge แล้วเท่านั้น",
  "`git branch -D` เป็น force delete และอาจทำให้ commit ที่ยังไม่ merge หายไปจาก flow ปกติ",
  "ตรวจ branch ปัจจุบันก่อนลบทุกครั้งด้วย `git branch`",
  "เช็กสถานะและ upstream ก่อนลบด้วย `git branch -vv`",
  "ถ้าไม่มั่นใจ ให้ตรวจกราฟก่อนด้วย `git log --oneline --graph --decorate -n 10`",
];

export const GIT_BRANCH_LAB_STEPS: GitBranchLabStep[] = [
  {
    id: "lab-step-1",
    title: "Step 1: สร้างโฟลเดอร์ทดลองและ commit แรก",
    task: "เตรียม repository สำหรับทดลอง branching",
    commands: [
      {
        command: "mkdir git-branch-lab",
        description: "สร้างโฟลเดอร์ใหม่สำหรับทดลอง",
      },
      {
        command: "cd git-branch-lab",
        description: "เข้าโฟลเดอร์ทดลอง",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository ใหม่และตั้ง initial branch เป็น main",
      },
      {
        command: "echo \"# Git Branch Lab\" > README.md",
        description: "สร้างไฟล์เริ่มต้น",
      },
      {
        command: "git add README.md",
        description: "stage ไฟล์ README",
      },
      {
        command: "git commit -m \"chore: initial commit\"",
        description: "สร้าง commit แรกเพื่อใช้เป็นฐานของ branch ต่างๆ",
      },
    ],
    checkpoint: "รัน git branch แล้วต้องเห็น * main",
  },
  {
    id: "lab-step-2",
    title: "Step 2: สร้าง branch ฟีเจอร์แรก",
    task: "แยกงาน login ออกไปอีก branch",
    commands: [
      {
        command: "git branch feature/login",
        description: "สร้าง branch feature/login จาก main ปัจจุบัน",
      },
      {
        command: "git branch",
        description: "ตรวจว่ามี branch ใหม่เพิ่มเข้ามา",
      },
    ],
    checkpoint: "ต้องเห็น main และ feature/login ในรายการ branch",
  },
  {
    id: "lab-step-3",
    title: "Step 3: สร้าง branch เพิ่มและดูทั้งหมด",
    task: "เพิ่มอีก branch เพื่อฝึกจัดการหลาย branch",
    commands: [
      {
        command: "git branch feature/profile",
        description: "สร้าง branch feature/profile เพิ่ม",
      },
      {
        command: "git branch -a",
        description: "ดูรายการ branch ทั้งหมด",
      },
    ],
    checkpoint: "ต้องเห็น feature/login และ feature/profile อยู่ในรายการ",
  },
  {
    id: "lab-step-4",
    title: "Step 4: สลับ branch และสร้าง commit",
    task: "เข้าไปทำงานใน feature/login แล้ว commit งาน",
    commands: [
      {
        command: "git switch feature/login",
        description: "สลับไป branch feature/login",
      },
      {
        command: "echo \"console.log('login flow');\" > login.ts",
        description: "สร้างไฟล์ตัวอย่างสำหรับฟีเจอร์ login",
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
    checkpoint: "รัน git branch -vv แล้วต้องเห็น commit ใหม่บน feature/login",
  },
  {
    id: "lab-step-5",
    title: "Step 5: กลับ main และ merge feature/login",
    task: "รวมงานจาก branch ฟีเจอร์กลับเข้า main",
    commands: [
      {
        command: "git switch main",
        description: "กลับมาที่ branch main",
      },
      {
        command: "git merge feature/login",
        description: "merge งานจาก feature/login เข้า main",
      },
      {
        command: "git branch -vv",
        description: "ตรวจสถานะ branch หลัง merge",
      },
    ],
    checkpoint: "main ต้องมี commit ของ login แล้ว",
  },
  {
    id: "lab-step-6",
    title: "Step 6: ลบ branch ที่ merge แล้ว",
    task: "ลบ feature/login ด้วยโหมดปลอดภัย",
    commands: [
      {
        command: "git branch -d feature/login",
        description: "ลบ branch ที่ merge แล้ว",
      },
      {
        command: "git branch",
        description: "ตรวจว่ามีการลบ feature/login สำเร็จ",
      },
    ],
    checkpoint: "ต้องไม่เห็น feature/login ในรายการ branch",
  },
  {
    id: "lab-step-7",
    title: "Step 7: ทดลองลบ branch ที่ยังไม่ merge และ cleanup",
    task: "ดูความต่างระหว่าง -d และ -D แล้วลบโฟลเดอร์ทดลอง",
    commands: [
      {
        command: "git branch -d feature/profile",
        description: "ลองลบแบบปลอดภัย (ควรเจอเตือนเพราะยังไม่ merge)",
      },
      {
        command: "git branch -D feature/profile",
        description: "ลบแบบบังคับ",
      },
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ทดลอง",
      },
      {
        command: "rm -rf git-branch-lab",
        description: "ลบโฟลเดอร์ทดลองทั้งหมด",
      },
    ],
    notes: [
      "ตรวจ path ให้ถูกต้องก่อนใช้คำสั่งลบโฟลเดอร์",
    ],
    checkpoint: "ลบ branch และ cleanup โฟลเดอร์ทดลองเรียบร้อย",
  },
];
