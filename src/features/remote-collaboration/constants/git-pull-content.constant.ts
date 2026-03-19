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

export type GitPullSimulatorCommit = {
  id: string;
  shortHash: string;
  message: string;
  files: string[];
  createdAtLabel: string;
  variant: "default" | "local-change" | "merge-result";
};

export type GitPullWorkingTreeSnapshot = {
  id: string;
  shortHash: string;
  title: string;
  summary: string;
  files: string[];
  variant: "default" | "merge-result";
};

export type GitPullSimulatorModeOption = {
  id: GitPullScenarioName;
  label: string;
  summary: string;
};

export type GitPullSimulatorScenario = {
  id: GitPullScenarioName;
  title: string;
  summary: string;
  command: string;
  fetchMessage: string;
  integrateMessage: string;
  doneMessage: string;
  initialRemoteHistory: GitPullSimulatorCommit[];
  initialTrackingHistory: GitPullSimulatorCommit[];
  initialLocalHistory: GitPullSimulatorCommit[];
  initialWorkingTree: GitPullWorkingTreeSnapshot;
  fetchedTrackingHistory: GitPullSimulatorCommit[];
  integratedLocalHistory: GitPullSimulatorCommit[];
  finalWorkingTree: GitPullWorkingTreeSnapshot;
};

const PULL_SHARED_REMOTE_HISTORY: GitPullSimulatorCommit[] = [
  {
    id: "remote-c5",
    shortHash: "c51a8f2",
    message: "docs: publish deployment note update",
    files: ["docs/deployment.md"],
    createdAtLabel: "12 minutes ago",
    variant: "default",
  },
  {
    id: "remote-c4",
    shortHash: "c40de91",
    message: "feat: add release checklist panel",
    files: ["src/features/release-checklist.tsx"],
    createdAtLabel: "38 minutes ago",
    variant: "default",
  },
  {
    id: "shared-c3",
    shortHash: "c312bb7",
    message: "chore: sync lesson shell",
    files: ["src/App.route.tsx"],
    createdAtLabel: "yesterday",
    variant: "default",
  },
  {
    id: "shared-c2",
    shortHash: "c201ad4",
    message: "chore: initial remote collaboration setup",
    files: ["src/features/remote-collaboration"],
    createdAtLabel: "2 days ago",
    variant: "default",
  },
];

const PULL_SHARED_TRACKING_BASELINE: GitPullSimulatorCommit[] = [
  {
    id: "shared-c3",
    shortHash: "c312bb7",
    message: "chore: sync lesson shell",
    files: ["src/App.route.tsx"],
    createdAtLabel: "yesterday",
    variant: "default",
  },
  {
    id: "shared-c2",
    shortHash: "c201ad4",
    message: "chore: initial remote collaboration setup",
    files: ["src/features/remote-collaboration"],
    createdAtLabel: "2 days ago",
    variant: "default",
  },
];

export const GIT_PULL_SIMULATOR_MODE_OPTIONS: GitPullSimulatorModeOption[] = [
  {
    id: "fast-forward",
    label: "Fast-forward",
    summary: "local ตาม remote ได้ตรงๆ โดยไม่เกิด merge commit",
  },
  {
    id: "merge",
    label: "Merge",
    summary: "local กับ remote diverged กัน และต้องรวมเป็น merge commit",
  },
];

export const GIT_PULL_SIMULATOR_SCENARIOS: Record<
  GitPullScenarioName,
  GitPullSimulatorScenario
> = {
  "fast-forward": {
    id: "fast-forward",
    title: "Fast-forward Pull",
    summary: "เริ่มจาก local main ที่ยังไม่ตาม server และจบด้วย local + working tree ที่ตรงกับ remote",
    command: "git pull --ff-only origin main",
    fetchMessage: "fetch สำเร็จ: origin/main ในเครื่องอัปเดตตาม Remote Repository แล้ว",
    integrateMessage: "integrate สำเร็จ: local main fast-forward ไปยัง commit ล่าสุดโดยไม่สร้าง merge commit",
    doneMessage: "working tree อัปเดตตาม local main แล้ว ตอนนี้ทุก stage ตรงกัน",
    initialRemoteHistory: PULL_SHARED_REMOTE_HISTORY,
    initialTrackingHistory: PULL_SHARED_TRACKING_BASELINE,
    initialLocalHistory: PULL_SHARED_TRACKING_BASELINE,
    initialWorkingTree: {
      id: "fast-forward-working-c3",
      shortHash: "c312bb7",
      title: "Checked-out snapshot",
      summary: "ไฟล์ในเครื่องยังอยู่ที่ commit c3 เพราะยังไม่ได้ pull ของใหม่จาก server",
      files: ["app.ts -> v1", "docs/deployment.md -> old note", "routes.ts -> legacy menu"],
      variant: "default",
    },
    fetchedTrackingHistory: PULL_SHARED_REMOTE_HISTORY,
    integratedLocalHistory: PULL_SHARED_REMOTE_HISTORY,
    finalWorkingTree: {
      id: "fast-forward-working-c5",
      shortHash: "c51a8f2",
      title: "Checked-out snapshot",
      summary: "working tree ถูก fast-forward ตาม remote แล้ว จึงไม่มี merge commit เกิดขึ้น",
      files: ["app.ts -> v1", "docs/deployment.md -> latest note", "release-checklist.tsx -> added"],
      variant: "default",
    },
  },
  merge: {
    id: "merge",
    title: "Pull with Merge",
    summary: "เริ่มจาก local main ที่มี local commit ของเราอยู่แล้ว และจบด้วย merge commit ใหม่บนเครื่อง",
    command: "git pull origin main",
    fetchMessage: "fetch สำเร็จ: origin/main เห็น commit ล่าสุดจาก server แล้ว แต่ local main ยัง diverged อยู่",
    integrateMessage: "Git รวม local commit กับ remote commit และสร้าง merge commit ใหม่บน local main",
    doneMessage: "working tree เช็กเอาต์ผลลัพธ์หลัง merge แล้ว และ local main นำ origin/main อยู่จนกว่าจะ push ต่อ",
    initialRemoteHistory: PULL_SHARED_REMOTE_HISTORY,
    initialTrackingHistory: PULL_SHARED_TRACKING_BASELINE,
    initialLocalHistory: [
      {
        id: "local-l4",
        shortHash: "l4bc902",
        message: "feat: local checkout tweak before sync",
        files: ["src/features/cart/checkout.tsx"],
        createdAtLabel: "8 minutes ago",
        variant: "local-change",
      },
      {
        id: "shared-c3",
        shortHash: "c312bb7",
        message: "chore: sync lesson shell",
        files: ["src/App.route.tsx"],
        createdAtLabel: "yesterday",
        variant: "default",
      },
      {
        id: "shared-c2",
        shortHash: "c201ad4",
        message: "chore: initial remote collaboration setup",
        files: ["src/features/remote-collaboration"],
        createdAtLabel: "2 days ago",
        variant: "default",
      },
    ],
    initialWorkingTree: {
      id: "merge-working-l4",
      shortHash: "l4bc902",
      title: "Checked-out snapshot",
      summary: "เครื่องเรามี local commit อยู่แล้ว ตัวอย่างนี้จึงไม่สามารถ fast-forward ได้ตรงๆ",
      files: [
        "checkout.tsx -> local tweak",
        "docs/deployment.md -> old note",
        "routes.ts -> legacy menu",
      ],
      variant: "default",
    },
    fetchedTrackingHistory: PULL_SHARED_REMOTE_HISTORY,
    integratedLocalHistory: [
      {
        id: "merge-m1",
        shortHash: "m19c0de",
        message: "merge: combine origin/main into main",
        files: ["src/features/cart/checkout.tsx", "docs/deployment.md"],
        createdAtLabel: "just now",
        variant: "merge-result",
      },
      {
        id: "local-l4",
        shortHash: "l4bc902",
        message: "feat: local checkout tweak before sync",
        files: ["src/features/cart/checkout.tsx"],
        createdAtLabel: "8 minutes ago",
        variant: "local-change",
      },
      {
        id: "remote-c5",
        shortHash: "c51a8f2",
        message: "docs: publish deployment note update",
        files: ["docs/deployment.md"],
        createdAtLabel: "12 minutes ago",
        variant: "default",
      },
      {
        id: "remote-c4",
        shortHash: "c40de91",
        message: "feat: add release checklist panel",
        files: ["src/features/release-checklist.tsx"],
        createdAtLabel: "38 minutes ago",
        variant: "default",
      },
      {
        id: "shared-c3",
        shortHash: "c312bb7",
        message: "chore: sync lesson shell",
        files: ["src/App.route.tsx"],
        createdAtLabel: "yesterday",
        variant: "default",
      },
      {
        id: "shared-c2",
        shortHash: "c201ad4",
        message: "chore: initial remote collaboration setup",
        files: ["src/features/remote-collaboration"],
        createdAtLabel: "2 days ago",
        variant: "default",
      },
    ],
    finalWorkingTree: {
      id: "merge-working-m1",
      shortHash: "m19c0de",
      title: "Checked-out snapshot",
      summary: "working tree อัปเดตเป็นผลลัพธ์หลัง merge แล้ว จึงมีทั้งของ remote และ local อยู่รวมกัน",
      files: [
        "checkout.tsx -> merged local tweak",
        "docs/deployment.md -> latest note",
        "release-checklist.tsx -> added",
      ],
      variant: "merge-result",
    },
  },
};

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
