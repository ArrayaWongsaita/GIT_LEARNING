export type PullRequestFlowCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type PullRequestFlowLabCommand = {
  command: string;
  description: string;
};

export type PullRequestFlowLabStep = {
  id: string;
  title: string;
  task: string;
  commands: PullRequestFlowLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type PullRequestFlowScenarioName = "happy-path" | "changes-requested";

export const PULL_REQUEST_FLOW_COMMAND_DOCS: PullRequestFlowCommandDoc[] = [
  {
    id: "pr-push-branch",
    title: "Push branch ก่อนเปิด PR",
    purpose: "ส่ง feature branch ขึ้น remote และตั้ง upstream",
    command: "git push -u origin feature/login-page",
    description:
      "เมื่อ push ครั้งแรกเสร็จ GitHub จะมองเห็น branch นี้และพร้อมเปิด Pull Request",
  },
  {
    id: "pr-sync-main-before-open",
    title: "Sync branch กับ main ก่อนเปิด PR",
    purpose: "ลดโอกาส conflict ระหว่างรีวิวหรือช่วง merge",
    command: "git fetch origin && git rebase origin/main",
    description:
      "ช่วยให้ branch เราอยู่บนฐานล่าสุดของ main ก่อนส่งให้ reviewer ตรวจ",
    notes: ["ถ้าเกิด conflict ระหว่าง rebase ให้แก้ไฟล์แล้วใช้ git rebase --continue"],
  },
  {
    id: "pr-update-after-review",
    title: "อัปเดต PR หลัง reviewer ขอแก้",
    purpose: "ส่ง commit เพิ่มเติมเข้า PR เดิมโดยไม่ต้องเปิด PR ใหม่",
    command: "git add . && git commit -m \"address review comments\" && git push",
    description:
      "เมื่อ push เพิ่ม GitHub จะอัปเดต Pull Request เดิมอัตโนมัติ และ reviewer ดูรอบใหม่ได้ทันที",
  },
  {
    id: "pr-verify-before-merge",
    title: "เช็กสถานะก่อน merge",
    purpose: "ยืนยันว่า branch พร้อม merge และไม่มีไฟล์ค้างในเครื่อง",
    command: "git status && git branch -vv",
    description:
      "เช็กให้แน่ใจว่า local clean และ branch tracking ปกติก่อนปิดงานในหน้า GitHub",
  },
];

export const PULL_REQUEST_FLOW_SAFETY_NOTES: string[] = [
  "เลือก base branch ให้ถูกต้อง (ส่วนใหญ่คือ main) ก่อนกดสร้าง PR",
  "เขียน title และ description ให้บอกผลลัพธ์ของงานและวิธีทดสอบแบบอ่านแล้วรีวิวได้ทันที",
  "เช็ก required checks ให้ผ่านครบก่อน merge ทุกครั้ง",
  "ตอบ review comments ทีละข้อ และปิด conversation เมื่อแก้ครบแล้ว",
  "หลีกเลี่ยง merge PR ที่ยังมี unresolved conversation หรือยังไม่ผ่าน approval ตาม policy ทีม",
];

export const PULL_REQUEST_FLOW_LAB_STEPS: PullRequestFlowLabStep[] = [
  {
    id: "pr-lab-1",
    title: "Step 1: เตรียม feature branch และ push ขึ้น origin",
    task: "สร้าง branch สำหรับงานใหม่และส่งขึ้น remote",
    commands: [
      {
        command: "git switch -c feature/pr-flow-lab",
        description: "สร้าง branch งานและสลับมาใช้งานทันที",
      },
      {
        command: "git add . && git commit -m \"add PR flow lab changes\"",
        description: "commit งานใน branch feature",
      },
      {
        command: "git push -u origin feature/pr-flow-lab",
        description: "push branch ขึ้น remote พร้อมตั้ง upstream",
      },
    ],
    checkpoint: "เห็น branch feature/pr-flow-lab บน GitHub และพร้อมเปิด PR",
  },
  {
    id: "pr-lab-2",
    title: "Step 2: เปิด PR และเตรียมรีวิว",
    task: "สร้าง Pull Request บน GitHub (base: main, compare: feature branch)",
    commands: [
      {
        command: "git fetch origin",
        description: "ดึง metadata ล่าสุดก่อนเริ่มรีวิว",
      },
      {
        command: "git log --oneline --graph --decorate -n 10",
        description: "ตรวจลำดับ commit ที่จะเข้า PR",
      },
    ],
    checkpoint: "PR ถูกเปิดแล้ว พร้อมข้อมูลสรุปและขอบเขตการทดสอบชัดเจน",
    notes: [
      "ขั้นตอนเปิด PR ทำผ่านหน้า GitHub: Pull requests -> New pull request",
      "เพิ่ม reviewer และ labels ตาม workflow ทีม",
    ],
  },
  {
    id: "pr-lab-3",
    title: "Step 3: ตอบ review และ merge",
    task: "กรณี reviewer ขอแก้ ให้แก้ไฟล์ push เพิ่ม แล้วรอ approve ก่อน merge",
    commands: [
      {
        command: "git add . && git commit -m \"address PR feedback\"",
        description: "commit การแก้ตามคอมเมนต์รอบรีวิว",
      },
      {
        command: "git push",
        description: "push เพิ่มเข้า PR เดิมเพื่อให้ reviewer ตรวจรอบใหม่",
      },
      {
        command: "git pull origin main",
        description: "หลัง merge สำเร็จ ให้ sync main ล่าสุดกลับมาที่เครื่อง",
      },
    ],
    checkpoint: "PR merge แล้ว และ local main อัปเดตตรงกับ remote",
  },
];

export const PULL_REQUEST_FLOW_STEPS: Record<
  PullRequestFlowScenarioName,
  string[]
> = {
  "happy-path": [
    "Start: push feature branch และเปิด Pull Request ใหม่",
    "Review: reviewer ตรวจโค้ดและให้ approval",
    "Checks: required checks ผ่านครบ",
    "Merge: maintainers กด merge PR เข้า main",
    "Done: branch ปิดงานและ main อัปเดตสำเร็จ",
  ],
  "changes-requested": [
    "Start: เปิด Pull Request จาก feature branch",
    "Review: reviewer ขอแก้ไข (changes requested)",
    "Update: ผู้พัฒนาแก้โค้ดและ push เพิ่มเข้า PR เดิม",
    "Re-review: reviewer ตรวจรอบใหม่และ approve",
    "Merge: merge เข้า main หลัง checks ผ่าน",
    "Done: PR ปิดงานพร้อมประวัติการแก้ครบถ้วน",
  ],
};
