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

export type GitBranchLabDifficulty = "Starter" | "Practice" | "Challenge";

export type GitBranchLab = {
  id: string;
  title: string;
  summary: string;
  difficulty: GitBranchLabDifficulty;
  focus: string;
  task: string;
  commands: GitBranchLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitBranchLabSection = {
  id: string;
  title: string;
  summary: string;
  labs: GitBranchLab[];
};

export type GitBranchSimulatorBranch = {
  name: string;
  shortHash: string;
  lastCommit: string;
  merged: boolean;
  upstream?: string;
  ahead: number;
  behind: number;
};

export type GitBranchSimulatorCommit = {
  id: string;
  shortHash: string;
  message: string;
  lane: 0 | 1;
  parentId?: string;
  author: string;
  dateLabel: string;
};

export const GIT_BRANCH_SIM_INITIAL_CURRENT_BRANCH = "main";

export const GIT_BRANCH_SIM_INITIAL_BRANCHES: GitBranchSimulatorBranch[] = [
  {
    name: "main",
    shortHash: "f13de33",
    lastCommit: "merge: feature/login into main",
    merged: true,
    upstream: "origin/main",
    ahead: 0,
    behind: 0,
  },
  {
    name: "feature/login",
    shortHash: "d42bc11",
    lastCommit: "feat(login): add login screen",
    merged: true,
    upstream: "origin/feature/login",
    ahead: 0,
    behind: 0,
  },
  {
    name: "feature/profile",
    shortHash: "b7e9f1a",
    lastCommit: "feat(profile): add avatar crop",
    merged: false,
    upstream: "origin/feature/profile",
    ahead: 2,
    behind: 0,
  },
];

export const GIT_BRANCH_SIM_REMOTE_BRANCHES = [
  "remotes/origin/main",
  "remotes/origin/feature/login",
  "remotes/origin/feature/profile",
];

export const GIT_BRANCH_SIM_INITIAL_COMMITS: GitBranchSimulatorCommit[] = [
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
];

export const GIT_BRANCH_SAFETY_NOTES: string[] = [
  "`git branch -d` จะลบได้เฉพาะ branch ที่ merge แล้วเท่านั้น",
  "`git branch -D` เป็น force delete และอาจทำให้ commit ที่ยังไม่ merge หายไปจาก flow ปกติ",
  "ตรวจ branch ปัจจุบันก่อนลบทุกครั้งด้วย `git branch`",
  "เช็กสถานะและ upstream ก่อนลบด้วย `git branch -vv`",
  "ถ้าไม่มั่นใจ ให้ตรวจกราฟก่อนด้วย `git log --oneline --graph --decorate -n 10`",
];

export const GIT_BRANCH_LAB_SECTIONS: GitBranchLabSection[] = [
  {
    id: "foundation-listing-and-creation",
    title: "Foundation Listing & Creation",
    summary:
      "เริ่มจากสร้าง sandbox repo, สร้าง branch หลายตัว, แล้วอ่านผลลัพธ์ของ git branch แต่ละแบบให้ขาด",
    labs: [
      {
        id: "foundation-bootstrap",
        title: "Lab 1: Bootstrap sandbox repo และสร้าง first commit",
        summary: "เตรียม repository ฐานสำหรับฝึก create/list/delete branch",
        difficulty: "Starter",
        focus: "Repo setup",
        task:
          "สร้างโฟลเดอร์ทดลอง, init repo, สร้าง README แล้ว commit แรกเพื่อใช้เป็นจุดตั้งต้นของทุก branch",
        commands: [
          {
            command: "mkdir git-branch-lab",
            description: "สร้างโฟลเดอร์แยกสำหรับทำ lab โดยไม่ปนกับโปรเจกต์อื่น",
          },
          {
            command: "cd git-branch-lab",
            description: "เข้าไปทำงานในโฟลเดอร์ทดลอง",
          },
          {
            command: "git init -b main",
            description: "เริ่ม repository และตั้ง branch เริ่มต้นเป็น main",
          },
          {
            command: "echo \"# Git Branch Lab\" > README.md",
            description: "สร้างไฟล์เริ่มต้นเพื่อให้มี content สำหรับ commit แรก",
          },
          {
            command: "git add README.md",
            description: "stage README.md เข้า index",
          },
          {
            command: 'git commit -m "chore: initial branch lab commit"',
            description: "สร้าง commit ฐานที่ branch อื่นจะอ้างจากจุดเดียวกัน",
          },
          {
            command: "git branch",
            description: "ตรวจว่า repository เริ่มต้นอยู่ที่ main",
          },
        ],
        checkpoint: "ต้องเห็น `* main` ในผลลัพธ์ของ git branch",
      },
      {
        id: "foundation-create-login",
        title: "Lab 2: สร้าง feature/login และดู local branches",
        summary: "เริ่มแยกงานออกจาก main ด้วย branch ฟีเจอร์แรก",
        difficulty: "Starter",
        focus: "Create branch",
        task:
          "สร้าง branch สำหรับงาน login แล้วดูให้ชัดว่า branch ใหม่ถูกเพิ่มเข้า local branch list แล้ว",
        commands: [
          {
            command: "git branch feature/login",
            description: "สร้าง branch feature/login จาก commit ปัจจุบันบน main",
          },
          {
            command: "git branch",
            description: "ตรวจว่า feature/login ถูกเพิ่มเข้ามาโดยที่เรายังอยู่บน main",
          },
        ],
        checkpoint: "ต้องเห็นทั้ง main และ feature/login ในรายการ branch",
      },
      {
        id: "foundation-create-profile",
        title: "Lab 3: สร้าง feature/profile และเทียบ git branch กับ git branch -a",
        summary: "แยก branch เพิ่มอีกเส้นและสังเกตความต่างของการ list branches",
        difficulty: "Starter",
        focus: "Branch listing",
        task:
          "สร้าง feature/profile เพิ่ม แล้วเทียบ output ของ git branch กับ git branch -a ใน sandbox ที่ยังไม่มี remote",
        commands: [
          {
            command: "git branch feature/profile",
            description: "สร้าง branch feature/profile เพิ่มอีกเส้นจาก main",
          },
          {
            command: "git branch",
            description: "ดูเฉพาะ local branches ที่มีในเครื่อง",
          },
          {
            command: "git branch -a",
            description: "ดูทุก branch รวมทั้ง remote-tracking branches ถ้ามี",
          },
        ],
        checkpoint:
          "ต้องเห็น feature/login และ feature/profile ใน local list และใน sandbox นี้ `git branch -a` จะยังแสดงเท่ากับ local เพราะยังไม่มี remote",
        notes: [
          "จุดสำคัญของ lab นี้คือเข้าใจว่า `-a` จะเริ่มมีความหมายมากขึ้นเมื่อ repo มี remote configured",
        ],
      },
      {
        id: "foundation-profile-inspection",
        title: "Lab 4: ขยับ feature/profile แล้วอ่าน pointer ด้วย git branch -vv",
        summary: "สร้างความต่างระหว่าง branch pointers ก่อนจะเริ่มลบ branch อย่างปลอดภัย",
        difficulty: "Practice",
        focus: "Pointer inspection",
        task:
          "สลับไป feature/profile, สร้าง draft commit แล้วใช้ git branch -vv เพื่อดูว่า branch ไหนชี้ commit อะไรอยู่",
        commands: [
          {
            command: "git switch feature/profile",
            description: "สลับไป branch feature/profile เพื่อสร้างงานที่ยังไม่ merge",
          },
          {
            command: "echo \"console.log('profile draft');\" > profile.ts",
            description: "สร้างไฟล์ตัวอย่างให้ feature/profile มี commit ของตัวเอง",
          },
          {
            command: "git add profile.ts",
            description: "stage profile.ts ก่อน commit",
          },
          {
            command: 'git commit -m "feat(profile): add draft profile flow"',
            description: "สร้าง commit ใหม่บน feature/profile",
          },
          {
            command: "git branch -vv",
            description: "ตรวจว่า feature/profile ชี้ไป commit ใหม่ ส่วน main และ feature/login ยังอยู่ commit เดิม",
          },
        ],
        checkpoint:
          "ใน `git branch -vv` ต้องเห็น feature/profile ชี้ไป commit ใหม่ของตัวเอง และยังไม่มี upstream ใน sandbox นี้",
      },
    ],
  },
  {
    id: "working-lifecycle",
    title: "Working Lifecycle",
    summary:
      "ฝึก lifecycle ที่เจอบ่อยจริง: สลับไปทำงานบน branch, merge กลับ main, ลบ branch ที่ merge แล้ว และทดสอบ safe delete กับ branch ที่ยังไม่ merge",
    labs: [
      {
        id: "lifecycle-login-work",
        title: "Lab 5: สลับไป feature/login แล้วสร้างงานฟีเจอร์",
        summary: "ให้ feature/login มี commit ของตัวเองเพื่อใช้ใน merge flow จริง",
        difficulty: "Practice",
        focus: "Feature branch work",
        task:
          "สลับไป feature/login, เพิ่มไฟล์ใหม่, commit งาน แล้วตรวจด้วย `git branch -vv` ว่า branch นี้ขยับแล้ว",
        commands: [
          {
            command: "git switch feature/login",
            description: "สลับจาก feature/profile ไปยัง feature/login",
          },
          {
            command: "echo \"console.log('login flow');\" > login.ts",
            description: "สร้างไฟล์ตัวอย่างสำหรับงาน login",
          },
          {
            command: "git add login.ts",
            description: "stage งานของ login feature",
          },
          {
            command: 'git commit -m "feat(login): add login flow"',
            description: "commit งานบน feature/login",
          },
          {
            command: "git branch -vv",
            description: "ตรวจว่า feature/login มี commit ใหม่ของตัวเองแล้ว",
          },
        ],
        checkpoint:
          "ต้องเห็น feature/login ชี้ไป commit `feat(login): add login flow` ใน `git branch -vv`",
      },
      {
        id: "lifecycle-merge-login",
        title: "Lab 6: กลับ main แล้ว merge feature/login",
        summary: "รวมงานที่เสร็จแล้วกลับเข้า branch หลักก่อนลบ branch",
        difficulty: "Practice",
        focus: "Merge verification",
        task:
          "กลับไป main, merge feature/login แล้วตรวจว่า main ขยับตาม commit ของ login เรียบร้อย",
        commands: [
          {
            command: "git switch main",
            description: "กลับมาที่ branch หลักก่อน merge",
          },
          {
            command: "git merge feature/login",
            description: "รวมงานจาก feature/login เข้า main",
          },
          {
            command: "git branch -vv",
            description: "ตรวจว่า main ขยับแล้ว และ feature/login อยู่ในสถานะที่พร้อมลบ",
          },
        ],
        checkpoint:
          "ต้องเห็น main อ้างถึงงาน login แล้ว และ feature/login พร้อมสำหรับ safe delete",
      },
      {
        id: "lifecycle-delete-merged",
        title: "Lab 7: ลบ feature/login แบบปลอดภัยด้วย -d",
        summary: "ลบเฉพาะ branch ที่ merge แล้วเพื่อลดความเสี่ยงทำงานหาย",
        difficulty: "Practice",
        focus: "Safe delete",
        task:
          "ลบ feature/login ด้วย `git branch -d` แล้วตรวจว่ารายการ branch ถูกลดลงตามคาด",
        commands: [
          {
            command: "git branch -d feature/login",
            description: "ลบ branch ที่ merge เข้า main แล้ว",
          },
          {
            command: "git branch",
            description: "ตรวจว่า feature/login หายไปจาก local branch list",
          },
        ],
        checkpoint: "ต้องไม่เห็น feature/login ในผลลัพธ์ของ git branch",
      },
      {
        id: "lifecycle-refuse-unmerged",
        title: "Lab 8: ลองลบ feature/profile แบบปลอดภัยแล้วดูการปฏิเสธ",
        summary: "เรียนรู้ว่าทำไม `git branch -d` ถึงช่วยกันพลาดเวลายังไม่ merge",
        difficulty: "Practice",
        focus: "Deletion guardrail",
        task:
          "ลองลบ feature/profile ด้วย `git branch -d` ทั้งที่ยังมี commit ที่ไม่ merge เพื่อดูข้อความเตือนจริง",
        commands: [
          {
            command: "git branch -d feature/profile",
            description: "ลองลบแบบปลอดภัย ซึ่งควรถูกปฏิเสธเพราะ branch นี้ยังไม่ merge",
          },
          {
            command: "git branch",
            description: "ตรวจว่า feature/profile ยังอยู่หลังคำสั่งถูกปฏิเสธ",
          },
        ],
        checkpoint:
          "ต้องเห็นว่า feature/profile ยังไม่ถูกลบ และคุณควรเข้าใจว่าคำสั่ง `-d` กันงานหายได้อย่างไร",
      },
    ],
  },
  {
    id: "risk-review-and-cleanup",
    title: "Risk Review & Cleanup",
    summary:
      "ก่อน force delete ให้ทบทวนสถานะ branch และกราฟ commit ก่อนเสมอ จากนั้นค่อย cleanup sandbox อย่างมีวินัย",
    labs: [
      {
        id: "review-before-force-delete",
        title: "Lab 9: Review feature/profile ก่อน force delete",
        summary: "ใช้ข้อมูลจาก `git branch -vv` และ `git log --graph` ตัดสินใจก่อนลบแบบบังคับ",
        difficulty: "Challenge",
        focus: "Risk review",
        task:
          "ตรวจให้แน่ใจว่า feature/profile ยังมี commit ที่ไม่ merge อยู่จริง และดูตำแหน่งของ branch บนกราฟประวัติ",
        commands: [
          {
            command: "git branch -vv",
            description: "ดู pointer ของ branch ทั้งหมดอีกครั้งก่อนตัดสินใจลบแบบ force",
          },
          {
            command: "git log --oneline --graph --decorate -n 10",
            description: "ดูกราฟ commit เพื่อยืนยันว่า feature/profile ยังแยกจาก main",
          },
        ],
        checkpoint:
          "คุณต้องยืนยันได้ว่า feature/profile ยังมี commit ของตัวเองที่ไม่ได้อยู่บน main ก่อนใช้ `-D`",
      },
      {
        id: "force-delete-profile",
        title: "Lab 10: Force delete feature/profile หลัง review แล้ว",
        summary: "ลบ branch ที่ยังไม่ merge แบบตั้งใจและมีเหตุผลรองรับ",
        difficulty: "Challenge",
        focus: "Force delete",
        task:
          "เมื่อทบทวนความเสี่ยงแล้ว ให้ลบ feature/profile ด้วย `git branch -D` และเช็กผลลัพธ์ทันที",
        commands: [
          {
            command: "git branch -D feature/profile",
            description: "ลบ feature/profile แบบบังคับหลัง review เสร็จแล้ว",
          },
          {
            command: "git branch",
            description: "ตรวจว่าตอนนี้เหลือเฉพาะ branch ที่ต้องเก็บไว้จริง",
          },
        ],
        checkpoint:
          "ต้องไม่เห็น feature/profile ใน local branch list หลังใช้ `git branch -D`",
        notes: [
          "ถ้ายังไม่มั่นใจว่าจะลบได้จริง ให้ย้อนกลับไปดู Lab 9 อีกครั้งก่อน",
        ],
      },
      {
        id: "cleanup-sandbox",
        title: "Lab 11: Cleanup sandbox และปิด exercise อย่างปลอดภัย",
        summary: "จบการฝึกโดยคืนสภาพเครื่องและไม่เผลอลบ path ผิด",
        difficulty: "Starter",
        focus: "Cleanup",
        task:
          "ออกจากโฟลเดอร์ทดลองแล้วลบ sandbox ทิ้งอย่างระมัดระวังหลังแน่ใจว่าไม่ต้องใช้งานต่อ",
        commands: [
          {
            command: "cd ..",
            description: "ออกจากโฟลเดอร์ git-branch-lab ก่อนลบ",
          },
          {
            command: "rm -rf git-branch-lab",
            description: "ลบ sandbox ทั้งหมดเมื่อมั่นใจว่าอยู่ path ที่ถูกต้อง",
          },
        ],
        checkpoint: "ลบโฟลเดอร์ git-branch-lab เรียบร้อยและจบ lab อย่างปลอดภัย",
        notes: [
          "ตรวจ `pwd` ให้แน่ใจก่อนลบโฟลเดอร์ทุกครั้ง โดยเฉพาะเมื่อใช้ `rm -rf`",
        ],
      },
    ],
  },
];
