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

export type PullRequestReviewMessageStep = {
  id: string;
  label: string;
  prompt: string;
  description: string;
};

export type PullRequestReviewMessageExample = {
  id: string;
  title: string;
  situation: string;
  good: string;
  bad: string;
  whyItWorks: string;
};

export type PullRequestReviewMessageTemplate = {
  id: string;
  title: string;
  intent: string;
  template: string;
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

export const PULL_REQUEST_REVIEW_MESSAGE_STEPS: PullRequestReviewMessageStep[] = [
  {
    id: "review-context",
    label: "Context",
    prompt: "ระบุจุดที่กำลังพูดถึง",
    description:
      "บอกไฟล์, ฟังก์ชัน, หรือ behavior ให้ชัดก่อน เพื่อให้เจ้าของ PR เข้าใจว่าคอมเมนต์นี้อ้างถึงส่วนไหน",
  },
  {
    id: "review-issue",
    label: "Issue",
    prompt: "อธิบายความเสี่ยงหรือข้อสังเกต",
    description:
      "เขียนให้เห็นปัญหาจริง เช่น null case, duplicated logic, naming ที่ทำให้สับสน หรือ test coverage ที่ยังขาด",
  },
  {
    id: "review-impact",
    label: "Impact",
    prompt: "บอกผลกระทบเมื่อจำเป็น",
    description:
      "ถ้า issue นี้มีผลต่อผู้ใช้, maintainability, หรือ production risk ควรบอกเหตุผลสั้น ๆ ว่าทำไมถึงควรแก้",
  },
  {
    id: "review-suggestion",
    label: "Suggestion",
    prompt: "ปิดท้ายด้วยแนวทางที่ actionable",
    description:
      "เสนอทางเลือกหรือคำถามนำ เช่น ลอง guard case นี้, เพิ่ม test ตรงนี้, หรือ clarify intent ของ logic ให้ reviewer ติดตามต่อได้ง่าย",
  },
];

export const PULL_REQUEST_REVIEW_MESSAGE_EXAMPLES: PullRequestReviewMessageExample[] =
  [
    {
      id: "review-example-null",
      title: "ถามให้เห็น risk ชัด",
      situation: "เจอ code path ที่ response อาจเป็น null แต่ถูกใช้ต่อทันที",
      good: "ตรงนี้มีโอกาส null ได้ไหม ถ้า API ตอบกลับไม่ครบอาจทำให้ map ต่อแล้วพัง ลอง guard ก่อนใช้ค่าได้ไหม",
      bad: "fix this null case",
      whyItWorks:
        "เวอร์ชันที่ดีสุภาพ ชี้จุดเสี่ยง และบอกผลกระทบพร้อมแนวทางแก้ ทำให้เจ้าของ PR ลงมือแก้ต่อได้ทันที",
    },
    {
      id: "review-example-actionable",
      title: "ชี้ประเด็นพร้อมข้อเสนอแนะ",
      situation: "logic นี้ถ้า fail ผู้ใช้อาจกดซ้ำและสร้าง request ซ้อน",
      good: "ถ้าเคสนี้ fail ผู้ใช้อาจกดซ้ำได้ ลอง guard เพิ่มตรงนี้หรือ disable ปุ่มระหว่างรอ response ดีไหม",
      bad: "not good",
      whyItWorks:
        "ข้อความที่ดีไม่ได้หยุดแค่บอกว่ามีปัญหา แต่ช่วยชี้ direction ให้เห็นว่าควรทดลองแก้ตรงไหน",
    },
    {
      id: "review-example-question",
      title: "ถามเพื่อให้ clarify intent",
      situation: "ชื่อฟังก์ชันหรือ behavior ไม่ตรงกับสิ่งที่ code ทำจริง",
      good: "ชื่อฟังก์ชันนี้ดูเหมือนแค่ validate แต่ด้านในมี side effect ด้วย ตรงนี้อยากคง behavior แบบนี้ไว้หรือแยก responsibility ดีไหม",
      bad: "please change the naming",
      whyItWorks:
        "เวอร์ชันที่ดีเปิดพื้นที่ให้คุยเรื่อง intent โดยไม่สั่งกว้าง ๆ และช่วยให้การตัดสินใจใน PR โปร่งใสขึ้น",
    },
  ];

export const PULL_REQUEST_REVIEW_MESSAGE_TEMPLATES: PullRequestReviewMessageTemplate[] =
  [
    {
      id: "review-template-question",
      title: "ขอข้อมูลเพิ่ม",
      intent: "ใช้เมื่อยังไม่แน่ใจว่าพฤติกรรมนี้ตั้งใจหรือหลุดมา",
      template:
        "ตรงนี้ตั้งใจให้ {behavior} เกิดขึ้นในกรณี {case} ใช่ไหม ถ้าไม่ อาจต้อง {suggestion}",
    },
    {
      id: "review-template-risk",
      title: "ชี้ bug หรือ risk",
      intent: "ใช้เมื่อเห็นผลกระทบค่อนข้างชัดและควรแก้ก่อน merge",
      template:
        "จุดนี้มีความเสี่ยงเรื่อง {risk} เพราะ {reason} ลอง {suggestion} ก่อน merge จะปลอดภัยขึ้น",
    },
    {
      id: "review-template-suggestion",
      title: "เสนอแนวแก้แบบ actionable",
      intent: "ใช้เมื่ออยากช่วยเสนอทางออกมากกว่าชี้ปัญหาอย่างเดียว",
      template:
        "เพื่อให้ {goal} ชัดขึ้น ลอง {suggestion} ตรง {location} ได้ไหม น่าจะช่วยลด {impact}",
    },
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
