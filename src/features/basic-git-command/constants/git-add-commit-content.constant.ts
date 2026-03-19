export type GitAddCommitCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
};

export type GitAddCommitSimulatorFile = {
  id: string;
  name: string;
  changeType: "modified" | "new";
  state: "working" | "staged";
};

export type GitAddCommitEntry = {
  id: string;
  message: string;
  shortHash: string;
  files: string[];
  createdAtLabel: string;
  isUserCommit: boolean;
};

export type GitAddCommitLabCommand = {
  command: string;
  description: string;
};

export type GitAddCommitLabDifficulty = "Starter" | "Practice" | "Challenge";

export type GitAddCommitLab = {
  id: string;
  title: string;
  summary: string;
  difficulty: GitAddCommitLabDifficulty;
  focus: string;
  task: string;
  commands: GitAddCommitLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitAddCommitLabSection = {
  id: string;
  title: string;
  summary: string;
  labs: GitAddCommitLab[];
};

export const GIT_ADD_COMMIT_COMMAND_DOCS: GitAddCommitCommandDoc[] = [
  {
    id: "add-single-file",
    title: "เพิ่มไฟล์เดียวเข้า staging",
    purpose: "เลือกเฉพาะไฟล์ที่พร้อม commit โดยไม่รวมไฟล์อื่นที่ยังไม่พร้อม",
    command: "git add <file>",
    description:
      "ใช้ stage เฉพาะไฟล์ที่กำหนด เช่น git add app.ts เพื่อควบคุมขอบเขต commit ให้ชัดเจน",
  },
  {
    id: "add-all-files",
    title: "เพิ่มทุกไฟล์ที่เปลี่ยนใน scope ปัจจุบัน",
    purpose: "รวบรวมการเปลี่ยนแปลงทั้งหมดก่อน commit อย่างรวดเร็ว",
    command: "git add .",
    description:
      "จะ stage ทั้งไฟล์ใหม่และไฟล์ที่แก้ทั้งหมดในโฟลเดอร์ปัจจุบัน ควรเช็กผลด้วย git status",
  },
  {
    id: "status",
    title: "ตรวจสถานะไฟล์",
    purpose: "ดูว่าไฟล์ไหนอยู่ใน Working Directory และไฟล์ไหนอยู่ใน Staging Area",
    command: "git status",
    description:
      "ใช้ยืนยันสถานะก่อน commit เพื่อป้องกันการส่งไฟล์ผิดเข้าประวัติ",
  },
  {
    id: "commit",
    title: "สร้าง commit จากไฟล์ที่ stage แล้ว",
    purpose: "บันทึก snapshot ของงานที่เลือกไว้ใน staging เข้า repository",
    command: 'git commit -m "message"',
    description:
      "สร้าง commit ใหม่พร้อมข้อความสรุปการเปลี่ยนแปลง ควรเขียน message ให้สื่อความหมาย",
  },
  {
    id: "log",
    title: "ดูประวัติ commit ล่าสุด",
    purpose: "ตรวจว่าการ commit สำเร็จและลำดับประวัติถูกต้อง",
    command: "git log --oneline --decorate -n 5",
    description:
      "แสดง commit ล่าสุดแบบย่อพร้อมตำแหน่ง branch/HEAD เพื่อตรวจ flow add -> commit",
  },
  {
    id: "undo-soft",
    title: "ย้อน commit ล่าสุดแบบเก็บไฟล์ไว้ใน staging",
    purpose: "ยกเลิก commit ล่าสุดโดยไม่ทิ้งงาน เพื่อแก้ไขแล้ว commit ใหม่",
    command: "git reset --soft HEAD~1",
    description:
      "เลื่อน HEAD กลับ 1 commit และดึงไฟล์จาก commit ล่าสุดกลับมา staged อีกครั้ง",
  },
];

export const GIT_ADD_COMMIT_INITIAL_FILES: GitAddCommitSimulatorFile[] = [
  { id: "app-ts", name: "app.ts", changeType: "modified", state: "working" },
  { id: "readme-md", name: "README.md", changeType: "new", state: "working" },
  {
    id: "package-json",
    name: "package.json",
    changeType: "modified",
    state: "working",
  },
];

export const GIT_ADD_COMMIT_INITIAL_HISTORY: GitAddCommitEntry[] = [
  {
    id: "base-commit",
    message: "chore: initial project scaffold",
    shortHash: "a1b2c3d",
    files: ["index.ts"],
    createdAtLabel: "2 days ago",
    isUserCommit: false,
  },
];

export const GIT_ADD_COMMIT_LAB_SECTIONS: GitAddCommitLabSection[] = [
  {
    id: "foundation-flow",
    title: "Foundation Flow",
    summary:
      "เริ่มจากสร้าง repo ทดลอง, ดูสถานะไฟล์, stage อย่างมีลำดับ และยืนยันว่าประวัติ commit ถูกสร้างจริง",
    labs: [
      {
        id: "foundation-bootstrap",
        title: "Lab 1: Bootstrap repo และตรวจ untracked files",
        summary: "สร้าง sandbox repo สำหรับฝึก flow add + commit ตั้งแต่ศูนย์",
        difficulty: "Starter",
        focus: "Repo setup",
        task:
          "สร้างโฟลเดอร์ทดลองใหม่, init repository, สร้างไฟล์ตัวอย่าง และยืนยันว่า Git มองเห็นไฟล์ทั้งหมดเป็น untracked",
        commands: [
          {
            command: "mkdir git-add-commit-lab",
            description: "สร้างโฟลเดอร์สำหรับฝึกโดยไม่ปนกับโปรเจกต์หลัก",
          },
          {
            command: "cd git-add-commit-lab",
            description: "เข้าไปทำงานในโฟลเดอร์ทดลอง",
          },
          {
            command: "git init -b main",
            description: "เริ่ม repository พร้อม branch เริ่มต้นชื่อ main",
          },
          {
            command: "echo \"# Add Commit Lab\" > README.md",
            description: "สร้างไฟล์เอกสารตัวอย่างสำหรับฝึก commit",
          },
          {
            command: "echo \"console.log('v1');\" > app.ts",
            description: "สร้างไฟล์โค้ดตัวอย่าง",
          },
          {
            command: "echo '{\"name\":\"git-add-commit-lab\"}' > package.json",
            description: "สร้างไฟล์ config ตัวอย่างเพื่อให้มีหลายไฟล์ใน working tree",
          },
          {
            command: "git status",
            description: "ตรวจว่าทุกไฟล์อยู่ในกลุ่ม Untracked files",
          },
        ],
        checkpoint:
          "ต้องเห็น README.md, app.ts และ package.json เป็น untracked files ทั้งหมด",
        notes: [
          "ถ้าคุณรัน labs แบบต่อเนื่อง ให้ทำ Lab 1 แค่ครั้งเดียวเพื่อเตรียม repo",
        ],
      },
      {
        id: "foundation-stage-one",
        title: "Lab 2: Stage ไฟล์เดียวแล้วอ่าน status ให้ขาด",
        summary: "ฝึกแยกไฟล์ที่พร้อม commit ออกจากไฟล์ที่ยังไม่พร้อม",
        difficulty: "Starter",
        focus: "Selective staging",
        task:
          "เพิ่มเฉพาะ app.ts เข้า staging แล้วใช้ git status อ่านความแตกต่างระหว่าง staged กับ untracked ให้ชัด",
        commands: [
          {
            command: "git add app.ts",
            description: "เลือกเฉพาะไฟล์โค้ดเข้า staging",
          },
          {
            command: "git status",
            description: "ดูว่า app.ts ย้ายไป Changes to be committed แล้ว",
          },
        ],
        checkpoint:
          "app.ts ต้องอยู่ใน Changes to be committed ส่วน README.md และ package.json ยังเป็น untracked",
      },
      {
        id: "foundation-first-commit",
        title: "Lab 3: Stage ไฟล์ที่เหลือและสร้าง first commit",
        summary: "รวมไฟล์ทั้งหมดที่พร้อมแล้วเข้า snapshot แรกของ repo",
        difficulty: "Starter",
        focus: "First commit",
        task:
          "นำไฟล์ที่เหลือเข้า staging, commit ให้สำเร็จ และตรวจว่า working tree กลับมาสะอาด",
        commands: [
          {
            command: "git add .",
            description: "นำไฟล์ที่เหลือทั้งหมดในโฟลเดอร์ปัจจุบันเข้า staging",
          },
          {
            command: 'git commit -m "feat: add initial lab files"',
            description: "สร้าง commit แรกของ sandbox repo",
          },
          {
            command: "git status",
            description: "ยืนยันว่าไม่มีไฟล์ค้าง staged หรือ modified",
          },
        ],
        checkpoint: "ต้องเห็นข้อความประมาณ nothing to commit, working tree clean",
      },
      {
        id: "foundation-log-review",
        title: "Lab 4: ตรวจ history ด้วย git log",
        summary: "ยืนยันว่าประวัติ commit ถูกสร้างจริงและ branch pointer อยู่ถูกตำแหน่ง",
        difficulty: "Starter",
        focus: "History review",
        task:
          "ดู log ล่าสุดและอ่านให้ได้ว่า commit ใดคือ HEAD ปัจจุบันของ branch main",
        commands: [
          {
            command: "git log --oneline --decorate -n 5",
            description: "ดูประวัติ commit แบบสั้นพร้อมตำแหน่ง HEAD และ branch",
          },
        ],
        checkpoint:
          "ต้องเห็น commit feat: add initial lab files อยู่บนสุด และมีตัวชี้ HEAD -> main",
      },
    ],
  },
  {
    id: "selective-staging-and-iteration",
    title: "Selective Staging & Iteration",
    summary:
      "ฝึกแยกงานเป็นชิ้นเล็ก, commit อย่างตั้งใจ, และจัดการสถานะที่มีทั้ง staged, modified และ untracked ในรอบเดียวกัน",
    labs: [
      {
        id: "iteration-leave-unstaged",
        title: "Lab 5: ตั้งใจปล่อยหนึ่งไฟล์ไว้ใน working tree",
        summary: "ซ้อมสถานการณ์ที่ยังไม่อยากรวมทุกการเปลี่ยนแปลงไว้ใน commit เดียว",
        difficulty: "Practice",
        focus: "Partial staging",
        task:
          "แก้ทั้ง README.md และ app.ts แต่ stage แค่ README.md เพื่อให้เห็นสถานะ mixed ระหว่าง staged และ unstaged",
        commands: [
          {
            command: "echo \"## staged note\" >> README.md",
            description: "เพิ่มข้อมูลเอกสารใหม่เพื่อใช้เป็นงานฝั่ง docs",
          },
          {
            command: "echo \"console.log('v2');\" >> app.ts",
            description: "แก้ไฟล์โค้ดแยกอีกหนึ่งส่วนไว้ใน working tree",
          },
          {
            command: "git add README.md",
            description: "เลือก stage เฉพาะงาน docs",
          },
          {
            command: "git status",
            description: "ตรวจว่ามีทั้ง staged change และ modified file ที่ยังไม่ถูก stage",
          },
        ],
        checkpoint:
          "README.md ต้องอยู่ใน Changes to be committed และ app.ts ต้องยังอยู่ใน Changes not staged for commit",
      },
      {
        id: "iteration-second-commit",
        title: "Lab 6: ปิดรอบการแก้ไขด้วย commit รอบสอง",
        summary: "ต่อยอดจากสถานะ mixed แล้วสร้าง commit ใหม่ให้สำเร็จ",
        difficulty: "Practice",
        focus: "Iteration commit",
        task:
          "นำ app.ts เข้า staging เพิ่ม แล้วสร้าง commit รอบสองจากงานที่คุณตรวจสอบแล้ว",
        commands: [
          {
            command: "git add app.ts",
            description: "เพิ่มไฟล์โค้ดที่ยังค้างอยู่เข้า staging",
          },
          {
            command: 'git commit -m "feat: refine readme and app flow"',
            description: "สร้าง commit รอบสองจากการเปลี่ยนแปลงที่ stage ไว้ทั้งหมด",
          },
          {
            command: "git status",
            description: "ตรวจว่า repo กลับมาสะอาดหลัง commit",
          },
        ],
        checkpoint:
          "commit ใหม่ต้องสำเร็จและ status ต้องไม่รายงาน staged หรือ modified files",
      },
      {
        id: "iteration-split-docs-code",
        title: "Lab 7: แยก docs และ code เป็นคนละ commit",
        summary: "ฝึก commit ตาม intent แทนการรวมทุกอย่างเป็นก้อนเดียว",
        difficulty: "Practice",
        focus: "Commit hygiene",
        task:
          "สร้างงาน docs และ code คนละช่วง แล้ว commit แยกกันเพื่อให้ history อ่านง่าย",
        commands: [
          {
            command: "echo \"## Usage\" >> README.md",
            description: "เพิ่มหัวข้อเอกสารใหม่ใน README.md",
          },
          {
            command: "git add README.md",
            description: "stage เฉพาะงาน docs ก่อน",
          },
          {
            command: 'git commit -m "docs: expand readme usage"',
            description: "สร้าง commit สำหรับเอกสารเท่านั้น",
          },
          {
            command: "echo \"console.log('split commit demo');\" >> app.ts",
            description: "เพิ่มงานฝั่งโค้ดใน app.ts",
          },
          {
            command: "git add app.ts",
            description: "stage เฉพาะงานโค้ด",
          },
          {
            command: 'git commit -m "feat: add split commit demo"',
            description: "สร้าง commit สำหรับงานโค้ดแยกจาก docs",
          },
          {
            command: "git log --oneline --decorate -n 5",
            description: "ทบทวนว่า history แยก intent ของ commit ชัดเจน",
          },
        ],
        checkpoint:
          "ใน log ต้องเห็น commit docs และ feat เป็นคนละรายการเรียงต่อกันอย่างชัดเจน",
      },
      {
        id: "iteration-mixed-tracked-untracked",
        title: "Lab 8: จัดการ tracked + untracked changes ก่อน commit",
        summary: "ซ้อมสถานการณ์ที่มีไฟล์ที่ควร commit และไฟล์ทดลองที่ยังไม่อยากเก็บ",
        difficulty: "Practice",
        focus: "Mixed status",
        task:
          "แก้ app.ts พร้อมสร้างไฟล์ notes.md ใหม่ จากนั้น commit เฉพาะงานโค้ดและปล่อย notes.md ไว้ก่อน",
        commands: [
          {
            command: "echo \"console.log('mixed state');\" >> app.ts",
            description: "สร้างการเปลี่ยนแปลงในไฟล์ที่ถูก track อยู่แล้ว",
          },
          {
            command: "echo \"temporary note\" > notes.md",
            description: "สร้างไฟล์ใหม่เพื่อจำลองงานที่ยังไม่ต้องการ commit",
          },
          {
            command: "git status",
            description: "ดูว่า app.ts เป็น modified และ notes.md เป็น untracked",
          },
          {
            command: "git add app.ts",
            description: "เลือก stage เฉพาะ app.ts",
          },
          {
            command: 'git commit -m "feat: update app without notes"',
            description: "commit เฉพาะการเปลี่ยนแปลงของ app.ts",
          },
          {
            command: "git status",
            description: "ตรวจว่า notes.md ยังไม่ถูก commit ตามที่ตั้งใจ",
          },
        ],
        checkpoint:
          "หลัง commit ต้องยังเห็น notes.md เป็น untracked file และ app.ts ต้องไม่ค้างใน working tree",
      },
    ],
  },
  {
    id: "recovery-and-review",
    title: "Recovery & Review",
    summary:
      "ฝึกยกเลิก commit ล่าสุดแบบไม่ทิ้งงาน, commit ใหม่ด้วย intent ที่ถูกต้อง, และปิดท้ายด้วย challenge ที่ต้องแยก mixed working tree ออกเป็น 2 commits ที่สะอาด",
    labs: [
      {
        id: "recovery-soft-reset",
        title: "Lab 9: Undo commit ที่ข้อความไม่ถูกต้องด้วย soft reset",
        summary: "ใช้ git reset --soft HEAD~1 เพื่อย้อน commit ล่าสุดโดยเก็บไฟล์ไว้ใน staging",
        difficulty: "Practice",
        focus: "Recovery",
        task:
          "สร้าง commit ชั่วคราวจาก README.md แล้ว undo ทันทีด้วย soft reset เพื่อดึงงานกลับมา staged",
        commands: [
          {
            command: "echo \"## Wrong heading\" >> README.md",
            description: "สร้างการเปลี่ยนแปลงใหม่ใน README.md",
          },
          {
            command: "git add README.md",
            description: "stage งาน docs ที่จะลอง commit ผิดข้อความ",
          },
          {
            command: 'git commit -m "fix: wrong commit message"',
            description: "สร้าง commit ชั่วคราวเพื่อใช้ฝึก undo",
          },
          {
            command: "git reset --soft HEAD~1",
            description: "ย้อน HEAD กลับ 1 commit โดยเก็บไฟล์ไว้ใน staging",
          },
          {
            command: "git status",
            description: "ยืนยันว่า README.md กลับมาอยู่ใน Changes to be committed",
          },
        ],
        checkpoint:
          "README.md ต้องกลับมา staged และ commit fix: wrong commit message ต้องหายออกจาก history ล่าสุด",
      },
      {
        id: "recovery-recommit",
        title: "Lab 10: Recommit เฉพาะไฟล์ที่ตั้งใจเก็บจริง",
        summary: "ใช้ staging ที่ได้จาก soft reset เพื่อสร้าง commit ใหม่ด้วยข้อความที่ถูกต้อง",
        difficulty: "Practice",
        focus: "Recommit",
        task:
          "commit ใหม่จากไฟล์ที่ staged อยู่ แล้วตรวจว่ามีแค่ชุดงานที่ตั้งใจเท่านั้นที่ถูกบันทึก",
        commands: [
          {
            command: 'git commit -m "docs: add recovery heading"',
            description: "สร้าง commit ใหม่จาก staging ปัจจุบันด้วย message ที่ชัดเจนกว่าเดิม",
          },
          {
            command: "git log --oneline --decorate -n 5",
            description: "ตรวจว่า history มี commit ใหม่แทนที่อันเดิม",
          },
          {
            command: "git status",
            description: "ดูว่าไฟล์อื่นอย่าง notes.md ยังแยกออกจาก commit นี้",
          },
        ],
        checkpoint:
          "ต้องเห็น commit docs: add recovery heading ใน log และ notes.md ต้องยังไม่ถูกรวมเข้า commit",
      },
      {
        id: "recovery-final-challenge",
        title: "Lab 11: Final challenge แยก mixed working tree เป็น 2 clean commits",
        summary: "บทสรุปของหน้า: จาก working tree ที่มีทั้ง docs และ code ต้อง commit แยกตาม intent ให้ได้",
        difficulty: "Challenge",
        focus: "Commit strategy",
        task:
          "สร้างการเปลี่ยนแปลงทั้ง README.md และ app.ts ในรอบเดียว แล้วแยกออกเป็น 2 commits ที่อ่าน history แล้วย้อนเหตุผลได้ทันที",
        commands: [
          {
            command: "echo \"## Challenge notes\" >> README.md",
            description: "เพิ่มงานฝั่งเอกสารลงใน working tree",
          },
          {
            command: "echo \"console.log('challenge');\" >> app.ts",
            description: "เพิ่มงานฝั่งโค้ดอีกหนึ่งรายการใน working tree เดียวกัน",
          },
          {
            command: "git status",
            description: "ยืนยันว่ามีการเปลี่ยนแปลงทั้ง docs และ code พร้อมกัน",
          },
          {
            command: "git add README.md",
            description: "เลือก stage งาน docs ก่อนเพื่อแยก commit",
          },
          {
            command: 'git commit -m "docs: add challenge notes"',
            description: "สร้าง commit สำหรับ README.md เท่านั้น",
          },
          {
            command: "git add app.ts",
            description: "stage งานโค้ดที่เหลือหลัง docs commit เสร็จ",
          },
          {
            command: 'git commit -m "feat: add challenge log"',
            description: "สร้าง commit สำหรับ app.ts แยกจาก docs",
          },
          {
            command: "git log --oneline --decorate -n 5",
            description: "ทบทวนว่า 2 commits ล่าสุดสื่อ intent ชัดเจน",
          },
        ],
        checkpoint:
          "2 commits ล่าสุดต้องแยกเป็น docs และ feat ชัดเจน โดยไม่รวมงานคนละประเภทไว้ในก้อนเดียว",
        notes: [
          "ถ้าคุณทำ labs แบบต่อเนื่องและยังมี notes.md ค้างอยู่ ให้ตั้งใจปล่อยไว้เหมือนเดิม เพราะโจทย์นี้โฟกัสการแยก README.md กับ app.ts",
        ],
      },
    ],
  },
];
