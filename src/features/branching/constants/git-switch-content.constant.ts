export type GitSwitchCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitSwitchLabCommand = {
  command: string;
  description: string;
};

export type GitSwitchLabDifficulty = "Starter" | "Practice" | "Challenge";

export type GitSwitchLab = {
  id: string;
  title: string;
  summary: string;
  difficulty: GitSwitchLabDifficulty;
  focus: string;
  task: string;
  commands: GitSwitchLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitSwitchLabSection = {
  id: string;
  title: string;
  summary: string;
  labs: GitSwitchLab[];
};

export type GitSwitchSimulatorBranch = {
  name: string;
  shortHash: string;
  upstream?: string;
  ahead: number;
  behind: number;
};

export type GitSwitchSimulatorCommit = {
  id: string;
  shortHash: string;
  message: string;
  lane: 0 | 1;
  parentId?: string;
  author: string;
  dateLabel: string;
};

export type GitSwitchRefState =
  | { kind: "branch"; branchName: string }
  | { kind: "detached"; commitHash: string };

export const GIT_SWITCH_SIM_INITIAL_BRANCHES: GitSwitchSimulatorBranch[] = [
  {
    name: "main",
    shortHash: "f13de33",
    upstream: "origin/main",
    ahead: 0,
    behind: 0,
  },
  {
    name: "feature/login",
    shortHash: "d42bc11",
    upstream: "origin/feature/login",
    ahead: 0,
    behind: 0,
  },
  {
    name: "feature/profile",
    shortHash: "b7e9f1a",
    upstream: "origin/feature/profile",
    ahead: 2,
    behind: 0,
  },
  {
    name: "fix/token-refresh",
    shortHash: "c91fd20",
    upstream: "origin/fix/token-refresh",
    ahead: 0,
    behind: 1,
  },
];

export const GIT_SWITCH_SIM_INITIAL_COMMITS: GitSwitchSimulatorCommit[] = [
  {
    id: "c12",
    shortHash: "b7e9f1a",
    message: "feat(profile): add avatar crop",
    lane: 1,
    parentId: "c11",
    author: "Maira Wenzel",
    dateLabel: "3 Sep 2019 23:27",
  },
  {
    id: "c11",
    shortHash: "a3d4c9e",
    message: "feat(profile): scaffold profile editor",
    lane: 1,
    parentId: "c10",
    author: "Steve Smith",
    dateLabel: "3 Sep 2019 21:37",
  },
  {
    id: "c10",
    shortHash: "f13de33",
    message: "merge: feature/login into main",
    lane: 0,
    parentId: "c9",
    author: "Tom Pratt",
    dateLabel: "3 Sep 2019 20:47",
  },
  {
    id: "c9",
    shortHash: "e71ac20",
    message: "feat(login): add oauth callback",
    lane: 0,
    parentId: "c8",
    author: "Youssef Victor",
    dateLabel: "3 Sep 2019 20:27",
  },
  {
    id: "c8",
    shortHash: "d42bc11",
    message: "feat(login): add login screen",
    lane: 0,
    parentId: "c7",
    author: "Maira Wenzel",
    dateLabel: "3 Sep 2019 20:04",
  },
  {
    id: "c7",
    shortHash: "c91fd20",
    message: "fix(auth): validate refresh token",
    lane: 0,
    parentId: "c6",
    author: "Ron Petrusha",
    dateLabel: "3 Sep 2019 19:27",
  },
  {
    id: "c6",
    shortHash: "b84ad55",
    message: "chore: setup lint and formatter",
    lane: 0,
    parentId: "c5",
    author: "Youssef Victor",
    dateLabel: "3 Sep 2019 19:24",
  },
  {
    id: "c5",
    shortHash: "a7e61c0",
    message: "docs: add branching workflow",
    lane: 0,
    parentId: "c4",
    author: "Maira Wenzel",
    dateLabel: "3 Sep 2019 19:19",
  },
  {
    id: "c4",
    shortHash: "98bd321",
    message: "refactor: split auth service",
    lane: 0,
    parentId: "c3",
    author: "Steve Smith",
    dateLabel: "3 Sep 2019 19:14",
  },
  {
    id: "c3",
    shortHash: "82ff110",
    message: "build: add CI cache layer",
    lane: 0,
    parentId: "c2",
    author: "Tom Pratt",
    dateLabel: "3 Sep 2019 19:11",
  },
  {
    id: "c2",
    shortHash: "72cd905",
    message: "feat: bootstrap app shell",
    lane: 0,
    parentId: "c1",
    author: "Mauricio de los Santos",
    dateLabel: "3 Sep 2019 19:09",
  },
  {
    id: "c1",
    shortHash: "8c1aa2c",
    message: "chore: project scaffold",
    lane: 0,
    author: "Terry Kim",
    dateLabel: "3 Sep 2019 19:04",
  },
];

export const GIT_SWITCH_SIM_REMOTE_BRANCHES = [
  "remotes/origin/main",
  "remotes/origin/feature/login",
  "remotes/origin/feature/profile",
  "remotes/origin/fix/token-refresh",
];

export const GIT_SWITCH_SIM_INITIAL_CURRENT_REF: GitSwitchRefState = {
  kind: "branch",
  branchName: "main",
};

export const GIT_SWITCH_SIM_INITIAL_PREVIOUS_BRANCH = "feature/login";

export const GIT_SWITCH_COMMAND_DOCS: GitSwitchCommandDoc[] = [
  {
    id: "switch-existing-branch",
    title: "สลับไปยัง branch ที่มีอยู่แล้ว",
    purpose: "เปลี่ยน context การทำงานไป branch ที่ต้องการทันที",
    command: "git switch <branch-name>",
    description:
      "ใช้สลับ branch เช่น git switch feature/login เพื่อไปทำงานต่อใน branch นั้น",
  },
  {
    id: "create-and-switch-branch",
    title: "สร้าง branch ใหม่พร้อมสลับทันที",
    purpose: "เริ่มงานใหม่ได้รวดเร็วโดยไม่ต้องสร้าง branch แยกอีกคำสั่ง",
    command: "git switch -c <new-branch-name>",
    description:
      "สร้าง branch ใหม่จากจุดปัจจุบันและสลับไป branch นั้นทันที เช่น git switch -c feature/payment",
  },
  {
    id: "switch-previous-branch",
    title: "สลับกลับ branch ก่อนหน้า",
    purpose: "เด้งกลับระหว่าง 2 branches ได้เร็วมากเวลาเทียบงาน",
    command: "git switch -",
    description:
      "สลับกลับไป branch ล่าสุดที่ใช้งานก่อนหน้า เหมาะกับการสลับ main <-> feature บ่อยๆ",
  },
  {
    id: "detach-head",
    title: "เข้าโหมด detached HEAD",
    purpose: "ตรวจสอบ commit เก่าแบบชั่วคราวโดยไม่ผูกกับ branch ปกติ",
    command: "git switch --detach <commit-hash>",
    description:
      "ย้าย HEAD ไปที่ commit ที่ระบุโดยไม่ย้าย pointer ของ branch",
    notes: [
      "ถ้าจะทำงานต่อในจุดนี้ ควรสร้าง branch ใหม่ทันทีด้วย git switch -c <branch-name>",
    ],
  },
  {
    id: "switch-main",
    title: "กลับไป branch หลัก",
    purpose: "กลับมาที่ main เพื่อ merge, pull หรือเริ่มงานใหม่",
    command: "git switch main",
    description:
      "ใช้เมื่อจบงานใน feature branch แล้วต้องกลับมาจัดการ flow บน main",
  },
  {
    id: "status-before-switch",
    title: "เช็กสถานะก่อนและหลังสลับ",
    purpose: "ลดความเสี่ยงชนไฟล์หรือมีงานค้างที่ทำให้ switch ไม่ผ่าน",
    command: "git status",
    description:
      "เช็กว่า working tree clean หรือยัง ถ้าไม่ clean ควร commit/stash ก่อน switch",
  },
  {
    id: "verify-current-branch",
    title: "ยืนยัน branch ที่กำลังใช้งาน",
    purpose: "ป้องกัน commit ผิด branch",
    command: "git branch",
    description:
      "ดูรายชื่อ branch และเครื่องหมาย * เพื่อยืนยันว่าอยู่ branch ถูกต้องก่อน commit",
  },
];

export const GIT_SWITCH_SAFETY_NOTES: string[] = [
  "หลีกเลี่ยงการสลับ branch ตอนมี unstaged changes ที่อาจชนกับ branch ปลายทาง",
  "เช็กสถานะก่อนเสมอด้วย `git status`",
  "ถ้าต้องข้ามไปทำงาน branch อื่นชั่วคราว ให้ commit หรือ stash งานค้างก่อน",
  "`git switch --detach` จะไม่อยู่บน branch ปกติ ถ้าจะทำงานต่อให้สร้าง branch ใหม่ทันที",
];

export const GIT_SWITCH_LAB_SECTIONS: GitSwitchLabSection[] = [
  {
    id: "foundation-setup-and-first-switch",
    title: "Foundation Setup & First Switch",
    summary:
      "เริ่มจากสร้าง sandbox repo, สร้าง branch แรกด้วย `git switch -c`, ทำงานบน feature branch และยืนยันว่ากลับมาที่ main ได้อย่างถูก context",
    labs: [
      {
        id: "foundation-bootstrap",
        title: "Lab 1: Bootstrap sandbox repo และสร้าง first commit",
        summary: "เตรียม repository ฐานสำหรับทดลอง git switch โดยเริ่มจาก main",
        difficulty: "Starter",
        focus: "Repo setup",
        task:
          "สร้างโฟลเดอร์ทดลอง, init repo, สร้าง README และทำ commit แรกบน main เพื่อใช้เป็นฐานของการสลับ branch รอบถัดไป",
        commands: [
          {
            command: "mkdir git-switch-lab",
            description: "สร้างโฟลเดอร์แยกสำหรับทำ lab",
          },
          {
            command: "cd git-switch-lab",
            description: "เข้าไปทำงานใน sandbox",
          },
          {
            command: "git init -b main",
            description: "เริ่ม repository พร้อมกำหนด branch เริ่มต้นเป็น main",
          },
          {
            command: "echo \"# Git Switch Lab\" > README.md",
            description: "สร้างไฟล์ตั้งต้นเพื่อให้มีงานสำหรับ commit แรก",
          },
          {
            command: "git add README.md",
            description: "stage README.md เข้า index",
          },
          {
            command: 'git commit -m "chore: initial switch lab commit"',
            description: "สร้าง commit ฐานสำหรับทุก lab ถัดไป",
          },
          {
            command: "git branch",
            description: "ตรวจว่า repository เริ่มต้นอยู่บน main",
          },
        ],
        checkpoint: "ต้องเห็น `* main` ในผลลัพธ์ของ git branch",
      },
      {
        id: "foundation-create-login",
        title: "Lab 2: สร้างและสลับไป feature/login ด้วยคำสั่งเดียว",
        summary: "ใช้ `git switch -c` เพื่อสร้าง branch ใหม่พร้อมเข้าไปทำงานทันที",
        difficulty: "Starter",
        focus: "Create and switch",
        task:
          "สร้าง feature/login และยืนยันว่า HEAD ย้ายจาก main ไป branch ใหม่ในคำสั่งเดียว",
        commands: [
          {
            command: "git switch -c feature/login",
            description: "สร้าง branch feature/login และสลับเข้า branch ทันที",
          },
          {
            command: "git branch",
            description: "ยืนยันว่า branch ปัจจุบันเปลี่ยนเป็น feature/login แล้ว",
          },
        ],
        checkpoint: "ต้องเห็น `* feature/login` ในรายการ branch",
      },
      {
        id: "foundation-login-work",
        title: "Lab 3: เพิ่ม login.ts, commit งาน และยืนยัน current branch",
        summary: "สร้างงานบน feature branch เพื่อให้เห็นว่าประวัติและ context เปลี่ยนตาม branch ที่สลับมา",
        difficulty: "Starter",
        focus: "Feature work",
        task:
          "เพิ่มไฟล์ login.ts, commit งานใน feature/login และตรวจว่าคุณยังอยู่บน branch เดิมหลัง commit",
        commands: [
          {
            command: "echo \"console.log('login');\" > login.ts",
            description: "สร้างไฟล์ตัวอย่างสำหรับงาน login",
          },
          {
            command: "git add login.ts",
            description: "stage login.ts ก่อน commit",
          },
          {
            command: 'git commit -m "feat(login): add login flow"',
            description: "commit งานบน feature/login",
          },
          {
            command: "git branch",
            description: "ยืนยันว่า HEAD ยังอยู่ที่ feature/login หลัง commit",
          },
        ],
        checkpoint: "ต้องเห็น `* feature/login` และมี commit ใหม่ของ login บน branch นี้",
      },
      {
        id: "foundation-switch-main",
        title: "Lab 4: สลับกลับ main และตรวจว่า context กลับมาถูกต้อง",
        summary: "ฝึกกลับ branch หลักอย่างตั้งใจและเช็กสภาพแวดล้อมหลัง switch",
        difficulty: "Starter",
        focus: "Return to main",
        task:
          "สลับกลับ main แล้วตรวจว่าทั้ง branch position และ working tree อยู่ในสภาพพร้อมทำงานต่อ",
        commands: [
          {
            command: "git switch main",
            description: "สลับกลับ branch หลัก",
          },
          {
            command: "git branch",
            description: "ยืนยันว่า HEAD กลับมาอยู่บน main",
          },
          {
            command: "git status",
            description: "เช็กว่า working tree อยู่ในสภาพปกติก่อนสลับต่อรอบถัดไป",
          },
        ],
        checkpoint: "ต้องเห็น `* main` และ working tree พร้อมใช้งานต่อ",
      },
    ],
  },
  {
    id: "context-hopping-and-branch-discipline",
    title: "Context Hopping & Branch Discipline",
    summary:
      "ฝึกสลับไปมาระหว่าง branches อย่างมีวินัย, ใช้ `git switch -` ให้คล่อง, และเช็กสถานะก่อนย้าย context ทุกครั้ง",
    labs: [
      {
        id: "context-jump-previous",
        title: "Lab 5: กระโดดกลับ branch ก่อนหน้าด้วย `git switch -`",
        summary: "ใช้ทางลัดสำหรับการสลับไปมาระหว่างสอง branches ที่ใช้งานล่าสุด",
        difficulty: "Practice",
        focus: "Previous branch",
        task:
          "จาก main ให้ใช้ `git switch -` เพื่อเด้งกลับไป feature/login อย่างรวดเร็วและยืนยันผลลัพธ์",
        commands: [
          {
            command: "git switch -",
            description: "สลับกลับไป branch ก่อนหน้าที่เพิ่งใช้งาน",
          },
          {
            command: "git branch",
            description: "ตรวจว่า HEAD ย้ายกลับมาอยู่ที่ feature/login แล้ว",
          },
        ],
        checkpoint: "ต้องกลับมาเห็น `* feature/login`",
      },
      {
        id: "context-create-profile",
        title: "Lab 6: กลับ main แล้วสร้าง feature/profile",
        summary: "เริ่มงาน feature ใหม่จาก main ด้วย `git switch -c` อีกครั้ง",
        difficulty: "Practice",
        focus: "Branch discipline",
        task:
          "กลับไป main ก่อน แล้วค่อยสร้าง feature/profile เพื่อให้ branch ใหม่แตกออกจากฐานที่ถูกต้อง",
        commands: [
          {
            command: "git switch main",
            description: "กลับไป main ก่อนเริ่ม branch ใหม่",
          },
          {
            command: "git switch -c feature/profile",
            description: "สร้าง branch feature/profile และสลับเข้าไปทันที",
          },
          {
            command: "git branch",
            description: "ยืนยันว่าตอนนี้อยู่บน feature/profile",
          },
        ],
        checkpoint: "ต้องเห็น `* feature/profile` และเข้าใจว่ามันถูกสร้างจาก main",
      },
      {
        id: "context-profile-work",
        title: "Lab 7: เพิ่ม profile.ts, เช็ก status, commit และยืนยันว่า clean",
        summary: "ย้ำวินัยการตรวจ working tree ก่อนจะ switch ออกจาก branch ปัจจุบัน",
        difficulty: "Practice",
        focus: "Status before switch",
        task:
          "สร้างงานใน feature/profile, ตรวจสถานะก่อน commit, commit ให้เสร็จ แล้วตรวจอีกครั้งว่า working tree clean ก่อน switch รอบต่อไป",
        commands: [
          {
            command: "echo \"console.log('profile');\" > profile.ts",
            description: "สร้างไฟล์ตัวอย่างของงาน profile",
          },
          {
            command: "git status",
            description: "ดูสถานะก่อน add/commit เพื่อไม่สลับ branch ทั้งที่ยังมีงานค้าง",
          },
          {
            command: "git add profile.ts",
            description: "stage profile.ts",
          },
          {
            command: 'git commit -m "feat(profile): add profile flow"',
            description: "commit งานของ profile branch",
          },
          {
            command: "git status",
            description: "ยืนยันว่า working tree clean แล้วก่อน switch ออกจาก branch นี้",
          },
        ],
        checkpoint: "หลัง commit ต้องเห็น working tree clean และพร้อม switch ต่ออย่างปลอดภัย",
      },
      {
        id: "context-return-main",
        title: "Lab 8: สลับกลับ main อย่างปลอดภัยหลังเช็กสถานะแล้ว",
        summary: "ปิดรอบงานของ feature/profile ด้วยการกลับมาที่ main อย่างมีวินัย",
        difficulty: "Practice",
        focus: "Safe switching",
        task:
          "สลับกลับ main หลังแน่ใจว่า feature/profile ไม่มีงานค้าง แล้วตรวจ branch position อีกครั้ง",
        commands: [
          {
            command: "git switch main",
            description: "สลับกลับ branch หลักหลังตรวจสถานะเรียบร้อย",
          },
          {
            command: "git branch",
            description: "ยืนยันว่า HEAD กลับมาอยู่บน main",
          },
          {
            command: "git status",
            description: "ตรวจว่าคุณกลับมาบน main ในสภาพพร้อมทำงานต่อ",
          },
        ],
        checkpoint: "ต้องเห็น `* main` และไม่เหลืองานค้างจาก feature/profile",
      },
    ],
  },
  {
    id: "detached-head-and-recovery",
    title: "Detached HEAD & Recovery",
    summary:
      "ทำความเข้าใจ detached HEAD แบบลงมือจริง แล้วออกจากสถานะนั้นอย่างปลอดภัยด้วย `git switch -c ...` ก่อนปิด lab",
    labs: [
      {
        id: "detach-head-inspection",
        title: "Lab 9: เข้า detached HEAD แล้ว inspect สถานะ",
        summary: "ดูให้เห็นชัดว่า `git switch --detach` ย้าย HEAD โดยไม่ผูกกับ branch ปกติ",
        difficulty: "Challenge",
        focus: "Detached HEAD",
        task:
          "สลับไปที่ `HEAD~1` แบบ detached แล้วใช้คำสั่งตรวจสอบเพื่อดูว่าตอนนี้คุณไม่ได้อยู่บน branch ปกติ",
        commands: [
          {
            command: "git switch --detach HEAD~1",
            description: "ย้าย HEAD ไป commit ก่อนหน้าหนึ่งจุดโดยไม่ย้าย pointer ของ branch",
          },
          {
            command: "git status",
            description: "สังเกตข้อความที่บอกว่าอยู่ใน detached HEAD state",
          },
          {
            command: "git branch",
            description: "ดูว่าตอนนี้ไม่มี branch ปกติที่ถูกเลือกเป็น `* <branch-name>` แบบเดิม",
          },
        ],
        checkpoint: "ต้องยืนยันได้ว่าคุณอยู่ใน detached HEAD state จริง ไม่ได้อยู่บน main หรือ feature branch",
      },
      {
        id: "detach-recovery",
        title: "Lab 10: ออกจาก detached HEAD อย่างปลอดภัยด้วย `git switch -c`",
        summary: "กู้ context การทำงานกลับมาเป็น branch ปกติทันทีเมื่ออยากเก็บจุดนั้นไว้",
        difficulty: "Challenge",
        focus: "Recovery",
        task:
          "จาก detached HEAD ให้สร้าง branch ใหม่ชื่อ hotfix/legacy-review แล้วตรวจว่าคุณกลับมาอยู่บน branch ปกติแล้ว",
        commands: [
          {
            command: "git switch -c hotfix/legacy-review",
            description: "สร้าง branch ใหม่จาก detached commit ปัจจุบันและสลับเข้า branch ทันที",
          },
          {
            command: "git branch",
            description: "ยืนยันว่า HEAD กลับมาอยู่บน branch ปกติชื่อ hotfix/legacy-review",
          },
          {
            command: "git status",
            description: "เช็กว่าตอนนี้ detached HEAD หายไปแล้วและ working tree อยู่ในสภาพปกติ",
          },
        ],
        checkpoint: "ต้องเห็น `* hotfix/legacy-review` และไม่มีข้อความ detached HEAD แล้ว",
        notes: [
          "นี่คือ flow ที่ปลอดภัยที่สุดเมื่อคุณเผลอไปอยู่ detached HEAD แล้วต้องการเก็บจุดนั้นไว้ทำงานต่อ",
        ],
      },
      {
        id: "detach-cleanup",
        title: "Lab 11: กลับ main แล้ว cleanup sandbox",
        summary: "ปิดการทดลองโดยกลับสู่ branch หลักและคืนสภาพเครื่อง",
        difficulty: "Starter",
        focus: "Cleanup",
        task:
          "กลับไป main ก่อน แล้วออกจากโฟลเดอร์ทดลองเพื่อลบ sandbox อย่างปลอดภัย",
        commands: [
          {
            command: "git switch main",
            description: "กลับไป branch หลักก่อนจบการทดลอง",
          },
          {
            command: "cd ..",
            description: "ออกจากโฟลเดอร์ git-switch-lab",
          },
          {
            command: "rm -rf git-switch-lab",
            description: "ลบโฟลเดอร์ sandbox เมื่อแน่ใจว่าอยู่ path ถูกต้อง",
          },
        ],
        checkpoint: "โฟลเดอร์ git-switch-lab ถูกลบเรียบร้อยและจบ lab อย่างปลอดภัย",
        notes: [
          "ตรวจ `pwd` ให้แน่ใจก่อนใช้ `rm -rf` ทุกครั้ง",
        ],
      },
    ],
  },
];
