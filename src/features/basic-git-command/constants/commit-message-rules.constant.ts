export type GitCommitMessageType =
  | "feat"
  | "fix"
  | "docs"
  | "style"
  | "refactor"
  | "perf"
  | "test"
  | "build"
  | "ci"
  | "chore"
  | "revert";

export type GitCommitMessageTypeGuide = {
  id: string;
  type: GitCommitMessageType;
  title: string;
  whenToUse: string;
  example: string;
  antiPattern?: string;
};

export type GitCommitMessageRule = {
  id: string;
  title: string;
  description: string;
  goodExample: string;
  badExample: string;
  fixHint: string;
};

export type GitCommitMessageAdvancedCommand = {
  id: string;
  command: string;
  description: string;
};

export const GIT_COMMIT_MESSAGE_FORMAT_GUIDE = {
  syntax: "<type>(scope)!: subject",
  headerDescription:
    "Header คือบรรทัดแรกที่สรุปงานหลัก ควรสั้น กระชับ และอ่านแล้วรู้ทันทีว่า commit นี้ทำอะไร",
  bodyDescription:
    "Body (ไม่บังคับ) ใช้อธิบายเหตุผลหรือผลกระทบของการเปลี่ยนแปลง โดยเน้น why มากกว่า how",
  footerDescription:
    "Footer (ไม่บังคับ) ใช้ใส่ข้อมูลอ้างอิง เช่น BREAKING CHANGE, Refs, Closes",
  details: [
    "type ควรเป็นตัวพิมพ์เล็ก เช่น feat, fix, docs",
    "subject ควรเป็นประโยคสั้น ชัดเจน ไม่ใส่จุดท้ายประโยค",
    "แนะนำให้ header ยาวไม่เกินประมาณ 72 ตัวอักษร",
    "ถ้ามี breaking change ให้ใช้ ! หรือ footer BREAKING CHANGE",
  ],
};

export const GIT_COMMIT_MESSAGE_TYPE_GUIDES: GitCommitMessageTypeGuide[] = [
  {
    id: "type-feat",
    type: "feat",
    title: "เพิ่มความสามารถใหม่ให้ผู้ใช้",
    whenToUse: "ใช้เมื่อมีฟีเจอร์ใหม่หรือ flow ใหม่ที่ผู้ใช้ใช้งานได้จริง",
    example: "feat(auth): add social login with Google",
    antiPattern: "feat: update stuff",
  },
  {
    id: "type-fix",
    type: "fix",
    title: "แก้บั๊กที่กระทบพฤติกรรมระบบ",
    whenToUse: "ใช้เมื่อแก้ bug หรือผลลัพธ์ผิดจากที่ควรเป็น",
    example: "fix(api): handle null profile response",
    antiPattern: "fix: bug fixed",
  },
  {
    id: "type-docs",
    type: "docs",
    title: "แก้เอกสารหรือคำอธิบาย",
    whenToUse: "ใช้เมื่อแก้ README, comment, docs ภายในทีม หรือคู่มือใช้งาน",
    example: "docs(readme): add setup steps for local dev",
    antiPattern: "docs: update readme",
  },
  {
    id: "type-style",
    type: "style",
    title: "ปรับรูปแบบโค้ดโดยไม่เปลี่ยน logic",
    whenToUse: "ใช้เมื่อแก้ format, spacing, lint style ที่ไม่กระทบ behavior",
    example: "style(ui): align button spacing in sidebar",
    antiPattern: "style: reformat files",
  },
  {
    id: "type-refactor",
    type: "refactor",
    title: "ปรับโครงสร้างภายในโดยไม่เปลี่ยนผลลัพธ์",
    whenToUse: "ใช้เมื่อเปลี่ยนโครงสร้างโค้ดเพื่ออ่านง่าย/ดูแลง่ายขึ้นโดยไม่แก้ bug",
    example: "refactor(commit): extract validator into helper",
    antiPattern: "refactor: change code",
  },
  {
    id: "type-perf",
    type: "perf",
    title: "ปรับปรุงประสิทธิภาพ",
    whenToUse: "ใช้เมื่อปรับให้เร็วขึ้น ลด memory หรือ render น้อยลง",
    example: "perf(simulator): memoize git status rendering",
    antiPattern: "perf: optimize",
  },
  {
    id: "type-test",
    type: "test",
    title: "เพิ่มหรือแก้ชุดทดสอบ",
    whenToUse: "ใช้เมื่อเพิ่ม test case, แก้ assertion, ปรับ test coverage",
    example: "test(commit): add validator edge-case coverage",
    antiPattern: "test: update tests",
  },
  {
    id: "type-build",
    type: "build",
    title: "เปลี่ยน build system หรือ dependency",
    whenToUse: "ใช้เมื่อแก้ package manager, bundler config, dependency build chain",
    example: "build(vite): pin plugin version for stable build",
    antiPattern: "build: update packages",
  },
  {
    id: "type-ci",
    type: "ci",
    title: "ปรับ pipeline หรือ automation",
    whenToUse: "ใช้เมื่อแก้ workflow ใน GitHub Actions หรือ CI provider",
    example: "ci(actions): add typecheck job on pull_request",
    antiPattern: "ci: update pipeline",
  },
  {
    id: "type-chore",
    type: "chore",
    title: "งานบำรุงรักษาทั่วไป",
    whenToUse: "ใช้กับงานไม่เข้าหมวดอื่น เช่น cleanup config หรือ script ภายใน",
    example: "chore(repo): remove unused local script",
    antiPattern: "chore: misc",
  },
  {
    id: "type-revert",
    type: "revert",
    title: "ย้อน commit ที่เคย merge/commit ไปแล้ว",
    whenToUse: "ใช้เมื่อ rollback งานก่อนหน้าแบบชัดเจนและตรวจย้อนง่าย",
    example: "revert: feat(auth): add social login with Google",
    antiPattern: "revert: undo changes",
  },
];

export const GIT_COMMIT_MESSAGE_RULES: GitCommitMessageRule[] = [
  {
    id: "rule-clear-subject",
    title: "Subject ต้องบอกผลลัพธ์ ไม่ใช่คำกว้างๆ",
    description:
      "ข้อความที่ดีควรทำให้ reviewer เข้าใจผลลัพธ์จาก commit โดยไม่ต้องเปิดไฟล์ทุกไฟล์",
    goodExample: "feat(cart): add coupon code validation",
    badExample: "feat: update cart",
    fixHint: "ใส่ทั้งบริบท (scope) และสิ่งที่เปลี่ยนอย่างเฉพาะเจาะจง",
  },
  {
    id: "rule-lowercase-type",
    title: "ใช้ type ตัวเล็กและรูปแบบคงที่",
    description:
      "รูปแบบที่คงที่ช่วยให้ระบบ parse changelog อัตโนมัติและค้นย้อนหลังได้ง่าย",
    goodExample: "fix(auth): prevent token refresh loop",
    badExample: "Fix(Auth): Prevent Token Refresh Loop",
    fixHint: "ใช้ type และ scope เป็น lowercase ตามมาตรฐาน",
  },
  {
    id: "rule-no-period",
    title: "หลีกเลี่ยงจุดท้าย subject",
    description:
      "หัวข้อ commit เป็น summary line ไม่ใช่ประโยคยาวเต็มรูปแบบ จึงไม่ควรจบด้วยจุด",
    goodExample: "docs(api): add error response table",
    badExample: "docs(api): add error response table.",
    fixHint: "ตัดเครื่องหมายจุดท้ายออกและเก็บ subject ให้สั้น",
  },
  {
    id: "rule-breaking-change",
    title: "ถ้า breaking change ต้องประกาศให้ชัด",
    description:
      "การประกาศ breaking change ช่วยให้ทีมอื่นวางแผนอัปเดตได้และลด production risk",
    goodExample:
      "feat(api)!: remove v1 user endpoint",
    badExample: "feat(api): remove old endpoint",
    fixHint: "เพิ่ม ! ที่ header หรือใช้ footer BREAKING CHANGE อธิบายผลกระทบ",
  },
];

export const GIT_COMMIT_MESSAGE_ADVANCED_COMMANDS: GitCommitMessageAdvancedCommand[] =
  [
    {
      id: "advanced-feat",
      command: 'git commit -m "feat(auth): add refresh token rotation"',
      description: "ตัวอย่าง header ที่ดีสำหรับฟีเจอร์ใหม่พร้อม scope",
    },
    {
      id: "advanced-fix-body",
      command:
        'git commit -m "fix(api): handle null profile response" -m "Guard null response before mapping user payload."',
      description:
        "ตัวอย่างมี body บรรทัดที่สองเพื่อบอกเหตุผล/วิธีแก้เพิ่มเติม",
    },
    {
      id: "advanced-breaking",
      command:
        'git commit -m "feat(api)!: remove v1 user endpoint" -m "BREAKING CHANGE: /v1/users is removed; use /v2/users."',
      description:
        "ตัวอย่าง breaking change โดยใช้ ! และ footer เพื่อเตือนผลกระทบ",
    },
    {
      id: "advanced-docs-footer",
      command:
        'git commit -m "docs(readme): add setup steps" -m "Refs: #42"',
      description: "ตัวอย่าง docs commit พร้อม footer อ้างอิงงาน/issue",
    },
  ];
