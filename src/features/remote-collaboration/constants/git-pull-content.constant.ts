export type GitPullCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitPullLabCommand = {
  command: string;
  description: string;
};

export type GitPullLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitPullLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitPullScenarioName = "fast-forward" | "merge";

export const GIT_PULL_COMMAND_DOCS: GitPullCommandDoc[] = [
  {
    id: "pull-default",
    title: "Pull แบบมาตรฐาน",
    purpose: "ดึง commit ล่าสุดจาก remote และรวมเข้ากับ branch ปัจจุบัน",
    command: "git pull origin main",
    description:
      "โดยทั่วไปเทียบเท่า fetch + merge ช่วยอัปเดต local ให้ตาม remote ได้เร็ว",
  },
  {
    id: "pull-ff-only",
    title: "Pull แบบบังคับ fast-forward",
    purpose: "ป้องกัน merge commit ที่ไม่ตั้งใจ",
    command: "git pull --ff-only origin main",
    description:
      "สำเร็จเฉพาะกรณีที่ local branch ยังไม่ diverge จาก remote branch",
  },
  {
    id: "pull-rebase",
    title: "Pull แล้ว rebase",
    purpose: "คงประวัติให้เป็นเส้นตรงเมื่อมี local commits",
    command: "git pull --rebase origin main",
    description:
      "เหมาะเมื่อทีมใช้ linear history และต้องการลด merge commits บน feature branch",
    notes: [
      "ถ้ามี conflict ระหว่าง rebase ให้แก้ไฟล์แล้วใช้ git rebase --continue",
    ],
  },
  {
    id: "fetch-merge-equivalent",
    title: "เทียบกับ fetch + merge",
    purpose: "เข้าใจขั้นตอนภายในของ git pull",
    command: "git fetch origin && git merge origin/main",
    description:
      "ช่วยแยกการดึงข้อมูล (fetch) และการรวม commit (merge) ออกมาดูทีละสเต็ป",
  },
];

export const GIT_PULL_SAFETY_NOTES: string[] = [
  "ตรวจสอบ branch ปัจจุบันก่อน pull เสมอด้วย git status",
  "ถ้ามีไฟล์แก้ค้าง ให้ commit หรือ stash ก่อน pull เพื่อลดโอกาส conflict",
  "เข้าใจ policy ของทีมก่อนใช้ pull --rebase หรือ pull ปกติ",
  "หลัง pull ให้ตรวจผลด้วย git log --oneline --graph --decorate -n 8",
  "หาก pull แล้วเกิด merge commit โดยไม่ตั้งใจ ให้คุยแนวทางกับทีมก่อนแก้ history",
];

export const GIT_PULL_LAB_STEPS: GitPullLabStep[] = [
  {
    id: "pull-lab-1",
    title: "Step 1: เตรียม repository ที่มี remote",
    task: "เข้าโปรเจกต์ที่ clone มาแล้วและยืนยัน remote",
    commands: [
      {
        command: "cd <repository-folder>",
        description: "เข้าโปรเจกต์ที่เคย clone ไว้",
      },
      {
        command: "git remote -v",
        description: "ยืนยันว่า origin ชี้ URL ถูกต้อง",
      },
      {
        command: "git branch --show-current",
        description: "ตรวจ branch ปัจจุบันก่อน pull",
      },
    ],
    checkpoint: "เห็น origin และอยู่ branch ที่ต้องการอัปเดต (เช่น main)",
  },
  {
    id: "pull-lab-2",
    title: "Step 2: Pull ล่าสุดจาก remote",
    task: "ดึงงานล่าสุดจาก origin/main",
    commands: [
      {
        command: "git pull origin main",
        description: "ดึงและรวม commit ล่าสุดจาก remote",
      },
      {
        command: "git status",
        description: "เช็กว่าหลัง pull แล้วยัง clean",
      },
    ],
    checkpoint: "status ต้อง clean และไม่มี operation ค้าง",
  },
  {
    id: "pull-lab-3",
    title: "Step 3: ตรวจผลหลัง pull",
    task: "ยืนยันว่าประวัติ local ถูกอัปเดตตามที่คาด",
    commands: [
      {
        command: "git log --oneline --graph --decorate -n 8",
        description: "ดู commit ล่าสุดพร้อม graph",
      },
      {
        command: "git branch -vv",
        description: "ดูว่า local branch ตาม remote ทันแล้วหรือยัง",
      },
    ],
    checkpoint: "เห็น commit ล่าสุดจาก remote และ branch tracking ถูกต้อง",
  },
];

export const GIT_PULL_FLOW_STEPS: Record<GitPullScenarioName, string[]> = {
  "fast-forward": [
    "Start: local main อยู่หลัง origin/main",
    "Fetch: ดึง commit ใหม่จาก origin/main",
    "Integrate: local main fast-forward ไป commit ล่าสุด",
    "Done: working tree อัปเดตตาม local main",
  ],
  merge: [
    "Start: local main และ origin/main diverged กัน",
    "Fetch: ดึง commit ใหม่จาก origin/main",
    "Integrate: merge remote commit กับ local commit",
    "Done: ได้ merge commit ใหม่บน local main",
  ],
};
