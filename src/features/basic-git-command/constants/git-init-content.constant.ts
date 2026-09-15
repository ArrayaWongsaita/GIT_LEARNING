export type GitInitCommand = {
  command: string;
  description: string;
};

export type GitInitSectionItem = {
  id: string;
  title: string;
  purpose: string;
  commands: GitInitCommand[];
  notes?: string[];
};

export type GitInitSection = {
  id: string;
  title: string;
  summary: string;
  items: GitInitSectionItem[];
};

export type GitInitLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitInitCommand[];
  checkpoint: string;
  notes?: string[];
};

export const GIT_INIT_SECTIONS: GitInitSection[] = [
  {
    id: "basic-usage",
    title: "พื้นฐานการใช้งาน git init",
    summary: "เริ่มต้น repository ใหม่และดูสถานะเริ่มต้นให้ถูกต้อง",
    items: [
      {
        id: "create-repo",
        title: "สร้างโฟลเดอร์และเริ่ม repository",
        purpose: "git init จะสร้างโฟลเดอร์ .git เพื่อเริ่มติดตามไฟล์ในโปรเจกต์",
        commands: [
          {
            command: "mkdir my-project",
            description: "สร้างโฟลเดอร์โปรเจกต์ใหม่สำหรับทดลอง",
          },
          {
            command: "cd my-project",
            description: "เข้าสู่โฟลเดอร์โปรเจกต์ก่อนสั่ง git",
          },
          {
            command: "git init",
            description: "เริ่มต้น repository และสร้างโฟลเดอร์ .git ในโฟลเดอร์ปัจจุบัน",
          },
          {
            command: "git status",
            description: "ตรวจสอบสถานะเริ่มต้นของ repository หลัง init",
          },
        ],
        notes: [
          "หลัง init ใหม่ จะยังไม่มี commit แรก",
          "โฟลเดอร์ .git เป็นฐานข้อมูลประวัติของโปรเจกต์",
        ],
      },
    ],
  },
  {
    id: "default-branch",
    title: "การตั้งชื่อ branch เริ่มต้น",
    summary: "กำหนด branch แรกตั้งแต่ตอน init ให้เป็นมาตรฐานทีม",
    items: [
      {
        id: "init-main",
        title: "เริ่ม repo พร้อม branch main",
        purpose: "ช่วยให้ชื่อ branch เริ่มต้นตรงกันทั้งทีมตั้งแต่แรก",
        commands: [
          {
            command: "git init -b main",
            description: "สร้าง repository ใหม่และตั้ง initial branch เป็น main ทันที",
          },
          {
            command: "git branch",
            description: "ตรวจสอบชื่อ branch ปัจจุบันหลัง init",
          },
        ],
      },
    ],
  },
  {
    id: "cancel-init",
    title: "การยกเลิก git init (ลบ .git)",
    summary: "ยกเลิกสถานะ repository อย่างปลอดภัยเมื่อ init ผิดที่",
    items: [
      {
        id: "remove-git-folder",
        title: "ลบโฟลเดอร์ .git เพื่อยกเลิก repo",
        purpose: "ใช้เมื่อเผลอ init ผิดโฟลเดอร์หรืออยากเริ่มประวัติใหม่จากศูนย์",
        commands: [
          {
            command: "rm -rf .git",
            description: "ลบโฟลเดอร์ .git ทั้งหมดเพื่อยกเลิกสถานะ repository ของโฟลเดอร์นี้",
          },
        ],
        notes: [
          "การลบ .git จะลบประวัติ commit ทั้งหมดในโฟลเดอร์นี้",
          "ไฟล์โปรเจกต์ยังอยู่ แต่โฟลเดอร์จะไม่ใช่ git repository อีกต่อไป",
          ".git/HEAD: ชี้ว่า branch ปัจจุบันคืออะไร",
          ".git/config: เก็บค่า config ระดับ local ของ repository",
          ".git/index: staging area (รายการไฟล์ที่ถูก git add แล้ว)",
          ".git/objects: เก็บข้อมูลจริงของ blob/tree/commit",
          ".git/refs: เก็บ pointer ของ branch และ tag",
          ".git/logs: เก็บประวัติการขยับ HEAD/refs (เช่น reflog)",
          ".git/hooks: script ที่รันอัตโนมัติก่อน/หลังเหตุการณ์สำคัญ เช่น commit/push",
          ".git/info: ข้อมูลเฉพาะ local เช่น exclude ที่ไม่อยาก commit",
        ],
      },
    ],
  },
  {
    id: "repo-check",
    title: "ตรวจสอบว่าเป็น repo หรือไม่",
    summary: "เช็กสถานะ repository หลัง init หรือหลังยกเลิก",
    items: [
      {
        id: "verify-repo-state",
        title: "ตรวจสถานะ work tree",
        purpose: "ยืนยันว่าโฟลเดอร์นี้อยู่ใน git repository จริงหรือไม่",
        commands: [
          {
            command: "git rev-parse --is-inside-work-tree",
            description: "คืนค่า true/false เพื่อบอกว่าอยู่ใน work tree ของ git หรือไม่",
          },
          {
            command: "git status",
            description: "ดูสถานะ repo ปัจจุบัน หรือข้อความ error ถ้าไม่ใช่ repo",
          },
        ],
      },
    ],
  },
];

export const GIT_INIT_LAB_STEPS: GitInitLabStep[] = [
  {
    id: "lab-step-1",
    title: "Step 1: สร้างโฟลเดอร์ lab และ init repo",
    task: "สร้างโฟลเดอร์ใหม่แล้วเริ่ม repository ให้สำเร็จ",
    commands: [
      {
        command: "mkdir git-init-lab",
        description: "สร้างโฟลเดอร์สำหรับทำ lab",
      },
      {
        command: "cd git-init-lab",
        description: "เข้าโฟลเดอร์ lab",
      },
      {
        command: "git init",
        description: "เริ่ม repository ในโฟลเดอร์นี้",
      },
    ],
    checkpoint: "รัน git status แล้วต้องเห็นข้อความประมาณ No commits yet",
  },
  {
    id: "lab-step-2",
    title: "Step 2: สร้างไฟล์เริ่มต้น",
    task: "เพิ่ม README เพื่อให้เห็นไฟล์ untracked",
    commands: [
      {
        command: "echo \"# Git Init Lab\" > README.md",
        description: "สร้างไฟล์ README.md พร้อมข้อความเริ่มต้น",
      },
    ],
    notes: [
      "Windows PowerShell ทางเลือก: Set-Content README.md '# Git Init Lab'",
    ],
    checkpoint: "รัน git status แล้วต้องเห็น README.md เป็น untracked file",
  },
  {
    id: "lab-step-3",
    title: "Step 3: ยกเลิก repo",
    task: "ลบโฟลเดอร์ .git แล้วตรวจว่าคำสั่ง git ใช้ไม่ได้",
    commands: [
      {
        command: "rm -rf .git",
        description: "macOS/Linux: ลบ metadata ของ repository",
      },
    ],
    checkpoint:
      "รัน git status แล้วควรเจอข้อความ fatal: not a git repository",
  },
  {
    id: "lab-step-4",
    title: "Step 4: init ใหม่พร้อม branch main",
    task: "เริ่ม repo ใหม่และตรวจชื่อ branch",
    commands: [
      {
        command: "git init -b main",
        description: "สร้าง repo ใหม่พร้อมกำหนด branch เริ่มต้นเป็น main",
      },
      {
        command: "git branch",
        description: "ตรวจว่ามี branch main เป็น branch ปัจจุบัน",
      },
    ],
    checkpoint: "ต้องเห็น branch ชื่อ main ในผลลัพธ์ของ git branch",
  },
];
