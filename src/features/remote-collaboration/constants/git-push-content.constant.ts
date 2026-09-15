export type GitPushCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitPushLabCommand = {
  command: string;
  description: string;
};

export type GitPushLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitPushLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitPushSimulatorFile = {
  id: string;
  name: string;
  state: "working" | "staged";
  changeType: "modified" | "new";
};

export type GitPushSimulatorCommit = {
  id: string;
  shortHash: string;
  message: string;
  files: string[];
  createdAtLabel: string;
  isUserCommit: boolean;
};

export type GitPushSimulatorCommitTemplate = Omit<GitPushSimulatorCommit, "files">;

export type GitPushSimulatorAction = {
  id: "add-app-ts" | "add-all" | "commit" | "push" | "reset";
  label: string;
  command: string;
  variant: "default" | "secondary" | "outline" | "ghost";
};

export const GIT_PUSH_SIMULATOR_COMMIT_MESSAGE = "feat: prepare push demo";

export const GIT_PUSH_SIMULATOR_ACTIONS: GitPushSimulatorAction[] = [
  {
    id: "add-app-ts",
    label: "git add app.ts",
    command: "git add app.ts",
    variant: "secondary",
  },
  {
    id: "add-all",
    label: "git add .",
    command: "git add .",
    variant: "outline",
  },
  {
    id: "commit",
    label: `git commit -m "${GIT_PUSH_SIMULATOR_COMMIT_MESSAGE}"`,
    command: `git commit -m "${GIT_PUSH_SIMULATOR_COMMIT_MESSAGE}"`,
    variant: "secondary",
  },
  {
    id: "push",
    label: "git push origin main",
    command: "git push origin main",
    variant: "default",
  },
  {
    id: "reset",
    label: "Reset Demo",
    command: "Reset Demo",
    variant: "ghost",
  },
];

export const GIT_PUSH_SIMULATOR_FLOW_STEPS: string[] = [
  "Stage ไฟล์จาก Working Directory เข้า Staging Area ด้วย git add",
  "สร้าง snapshot ใหม่ใน Repository ด้วย git commit",
  "ดู local main นำหน้า origin/main อยู่ 1 commit",
  "ส่ง commit ล่าสุดไป Remote Repository ด้วย git push",
];

export const GIT_PUSH_SIMULATOR_INITIAL_FILES: GitPushSimulatorFile[] = [
  { id: "app-ts", name: "app.ts", state: "working", changeType: "modified" },
  { id: "readme-md", name: "README.md", state: "working", changeType: "new" },
  {
    id: "package-json",
    name: "package.json",
    state: "working",
    changeType: "modified",
  },
];

export const GIT_PUSH_SIMULATOR_INITIAL_LOCAL_HISTORY: GitPushSimulatorCommit[] = [
  {
    id: "baseline-2",
    shortHash: "c18ab42",
    message: "docs: update remote workflow notes",
    files: ["docs/remote.md"],
    createdAtLabel: "2 hours ago",
    isUserCommit: false,
  },
  {
    id: "baseline-1",
    shortHash: "91f0d6b",
    message: "chore: bootstrap git learning lesson",
    files: ["src/App.tsx", "src/App.route.tsx"],
    createdAtLabel: "yesterday",
    isUserCommit: false,
  },
];

export const GIT_PUSH_SIMULATOR_INITIAL_REMOTE_HISTORY: GitPushSimulatorCommit[] = [
  {
    id: "baseline-2",
    shortHash: "c18ab42",
    message: "docs: update remote workflow notes",
    files: ["docs/remote.md"],
    createdAtLabel: "2 hours ago",
    isUserCommit: false,
  },
  {
    id: "baseline-1",
    shortHash: "91f0d6b",
    message: "chore: bootstrap git learning lesson",
    files: ["src/App.tsx", "src/App.route.tsx"],
    createdAtLabel: "yesterday",
    isUserCommit: false,
  },
];

export const GIT_PUSH_SIMULATOR_DEMO_COMMIT: GitPushSimulatorCommitTemplate = {
  id: "push-demo-commit",
  shortHash: "f7a9c21",
  message: GIT_PUSH_SIMULATOR_COMMIT_MESSAGE,
  createdAtLabel: "just now",
  isUserCommit: true,
};

export const GIT_PUSH_COMMAND_DOCS: GitPushCommandDoc[] = [
  {
    id: "push-default",
    title: "Push แบบมาตรฐาน",
    purpose: "ส่ง commit จาก local branch ไปที่ remote branch",
    command: "git push origin main",
    description: "ใช้เมื่อ local branch ของเราพร้อมเผยแพร่การเปลี่ยนแปลงขึ้น origin/main",
  },
  {
    id: "push-upstream",
    title: "Push พร้อมตั้ง upstream",
    purpose: "เชื่อม local branch ใหม่กับ remote branch ครั้งแรก",
    command: "git push -u origin feature/login-ui",
    description:
      "หลังรันสำเร็จ branch นี้จะ track กับ origin/feature/login-ui ทำให้ครั้งต่อไปใช้ git push ได้สั้นลง",
  },
  {
    id: "push-force-with-lease",
    title: "Push หลัง rebase อย่างปลอดภัย",
    purpose: "อัปเดต feature branch หลัง rebase โดยลดความเสี่ยงจากการเขียนทับงานคนอื่น",
    command: "git push --force-with-lease origin feature/login-ui",
    description:
      "ใช้เมื่อเรา rebase branch ของตัวเองแล้วต้องอัปเดต PR เดิมบน remote โดยให้ Git เช็กก่อนว่า remote ยังเป็นสถานะที่เราคาดไว้",
    notes: [
      "เหมาะกับ feature branch ของตัวเองหลัง git rebase ไม่ใช่ shared branch อย่าง main",
      "ปลอดภัยกว่า --force เพราะจะไม่เขียนทับถ้า remote branch มี commit ใหม่ที่เราไม่รู้มาก่อน",
    ],
  },
  {
    id: "push-dry-run",
    title: "ตรวจสอบก่อน push จริง",
    purpose: "ดูผลลัพธ์ที่คาดว่าจะเกิดขึ้นโดยยังไม่ส่งข้อมูลขึ้น remote",
    command: "git push --dry-run origin main",
    description:
      "เหมาะกับจังหวะที่ต้องการเช็กสิทธิ์และสถานะ branch ก่อน push จริง โดยไม่แก้สถานะ remote",
  },
  {
    id: "push-non-fast-forward-fix",
    title: "แก้เคส push ถูกปฏิเสธ (non-fast-forward)",
    purpose: "ซิงก์ remote ล่าสุดก่อนแล้วค่อย push ใหม่",
    command: "git pull --rebase origin main && git push origin main",
    description:
      "ใช้เมื่อ remote มี commit ใหม่ที่ local ยังไม่มี ทำให้ push ตรงๆ ไม่ได้",
    notes: [
      "หากเกิด conflict ระหว่าง rebase ให้แก้ไฟล์แล้วรัน git rebase --continue",
      "หลีกเลี่ยง force push บน shared branch หากทีมไม่ได้ตกลงไว้",
    ],
  },
];

export const GIT_PUSH_SAFETY_NOTES: string[] = [
  "เช็ก branch ปัจจุบันก่อน push ด้วย git branch --show-current",
  "ตรวจสอบว่า remote ถูกต้องผ่าน git remote -v โดยเฉพาะเมื่อมีหลาย remote",
  "ดูสถานะ ahead/behind ด้วย git status หรือ git branch -vv ก่อน push",
  "ถ้าเจอ non-fast-forward ให้ pull/sync ก่อน แล้วค่อย push ซ้ำ",
  "ถ้าต้อง push หลัง rebase บน feature branch ของตัวเอง ให้ใช้ --force-with-lease แทน --force",
  "ควรอ่านกติกาทีมเรื่อง protected branch และรีวิวก่อน push เข้า main",
];

export const GIT_PUSH_LAB_STEPS: GitPushLabStep[] = [
  {
    id: "push-lab-1",
    title: "Step 1: ตรวจสถานะก่อน push",
    task: "ยืนยันว่าอยู่ branch ที่ถูกต้องและ local มี commit พร้อมส่ง",
    commands: [
      {
        command: "git branch --show-current",
        description: "เช็ก branch ปัจจุบัน",
      },
      {
        command: "git status",
        description: "ตรวจว่า working tree ไม่มีไฟล์ค้างที่ไม่ต้องการ",
      },
      {
        command: "git branch -vv",
        description: "ดูว่า branch นำหน้าหรือตามหลัง remote เท่าไร",
      },
    ],
    checkpoint: "เห็นว่าอยู่ branch ที่ต้องการและพร้อม push",
  },
  {
    id: "push-lab-2",
    title: "Step 2: Push งานขึ้น remote",
    task: "ส่ง commit ล่าสุดของ local branch ไปยัง origin",
    commands: [
      {
        command: "git push origin main",
        description: "push การเปลี่ยนแปลงขึ้น remote",
      },
      {
        command: "git log --oneline --graph --decorate -n 8",
        description: "เช็กประวัติว่าจุดล่าสุดตรงตามที่คาด",
      },
    ],
    checkpoint: "push สำเร็จและ remote tracking ไม่รายงานว่า local ahead",
  },
  {
    id: "push-lab-3",
    title: "Step 3: รับมือกรณีถูก reject",
    task: "ซ้อม flow เมื่อ push ไม่ผ่านเพราะ non-fast-forward",
    commands: [
      {
        command: "git pull --rebase origin main",
        description: "ดึง remote ล่าสุดและจัด history local ให้ต่อเนื่อง",
      },
      {
        command: "git push origin main",
        description: "ลอง push ใหม่หลัง sync สำเร็จ",
      },
    ],
    checkpoint: "push ผ่านหลัง sync และไม่มีข้อความ rejected",
    notes: ["ถ้าติด conflict ให้แก้ไฟล์แล้วจบ rebase ให้ครบก่อน push รอบถัดไป"],
  },
  {
    id: "push-lab-4",
    title: "Step 4: อัปเดต PR หลัง rebase",
    task: "ซ้อมการ rebase feature branch ของตัวเองแล้ว push กลับขึ้น remote แบบปลอดภัย",
    commands: [
      {
        command: "git switch feature/login-ui",
        description: "สลับไป branch งานที่เปิด PR ไว้อยู่แล้ว",
      },
      {
        command: "git fetch origin",
        description: "ดึงสถานะล่าสุดของ main และ remote branch ก่อนเริ่ม rebase",
      },
      {
        command: "git rebase origin/main",
        description: "ย้ายฐาน branch นี้ขึ้นไปอยู่บน main ล่าสุดก่อนอัปเดต PR",
      },
      {
        command: "git push --force-with-lease origin feature/login-ui",
        description: "push หลัง rebase โดยให้ Git ตรวจว่า remote ยังไม่ถูกคนอื่นอัปเดตแทรกระหว่างทาง",
      },
    ],
    checkpoint: "PR เดิมถูกอัปเดตด้วยประวัติใหม่หลัง rebase โดยไม่ใช้ force แบบเสี่ยงเกินจำเป็น",
    notes: [
      "ใช้ขั้นตอนนี้กับ feature branch ของตัวเอง ไม่ควรใช้กับ shared branch อย่าง main",
      "ถ้า remote branch เปลี่ยนไปก่อนหน้า คำสั่งนี้จะหยุดแทนที่จะเขียนทับทันที",
    ],
  },
];
