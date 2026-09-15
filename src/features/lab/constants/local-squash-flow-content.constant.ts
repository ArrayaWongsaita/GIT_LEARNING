export type NestJsLocalSquashFlowCommand = {
  command: string;
  description: string;
};

export type NestJsLocalSquashFlowOverviewCard = {
  id: string;
  title: string;
  summary: string;
  commands?: NestJsLocalSquashFlowCommand[];
  notes?: string[];
};

export type NestJsLocalSquashFlowStage = {
  id: string;
  title: string;
  description: string;
};

export type NestJsLocalSquashFlowFeatureSummary = {
  id: string;
  order: number;
  title: string;
  branchName: string;
  resourceName: string;
  focus: string;
  summary: string;
};

export type NestJsLocalSquashFlowLabDifficulty =
  | "Starter"
  | "Practice"
  | "Challenge";

export type NestJsLocalSquashFlowLabItem = {
  id: string;
  title: string;
  summary: string;
  difficulty: NestJsLocalSquashFlowLabDifficulty;
  focus: string;
  task: string;
  branchName: string;
  resourceName: string;
  featureCommitMessage: string;
  squashCommitMessage: string;
  commands: NestJsLocalSquashFlowCommand[];
  generatorChoices: string[];
  localFlow: string[];
  squashCommands: NestJsLocalSquashFlowCommand[];
  squashSummary: string;
  checkpoint: string;
  notes?: string[];
};

export type NestJsLocalSquashFlowLabSection = {
  id: string;
  title: string;
  summary: string;
  labs: NestJsLocalSquashFlowLabItem[];
};

type NestJsLocalSquashFlowFeatureSeed = {
  id: string;
  resourceName: string;
  title: string;
  summary: string;
  difficulty: NestJsLocalSquashFlowLabDifficulty;
  focus: string;
  task: string;
  notes?: string[];
};

const FEATURE_SEEDS: NestJsLocalSquashFlowFeatureSeed[] = [
  {
    id: "auth-resource",
    resourceName: "auth",
    title: "Auth resource",
    summary:
      "เริ่ม flow แรกด้วย resource ด้าน identity เพื่อวาง pattern ของ feature commit และ squash commit ให้ชัดตั้งแต่ต้น",
    difficulty: "Starter",
    focus: "Authentication",
    task:
      "สลับไป branch auth ที่เตรียมจาก baseline เดียวกัน, ใช้ Nest CLI generate auth resource, ทำ feature commit ของตัวเอง แล้วรวมกลับ main แบบ squashed เพื่อให้ history เปิดบทแรกอ่านง่าย",
    notes: [
      "feature แรกช่วยให้ผู้เรียนเห็นความต่างระหว่าง commit บน branch งานกับ commit สรุปบน main ได้เร็วที่สุด",
    ],
  },
  {
    id: "users-resource",
    resourceName: "users",
    title: "Users resource",
    summary:
      "เพิ่มโดเมนผู้ใช้เพื่อฝึกทำซ้ำ flow เดิมอีกรอบและเริ่มเห็นจังหวะกลับจาก branch งานมาที่ main",
    difficulty: "Starter",
    focus: "User Directory",
    task:
      "สร้าง users resource บน branch ของตัวเองให้ครบ, บันทึก feature commit, แล้วกลับมา main เพื่อรวมงานนี้ด้วย squash merge และตรวจว่า history ยังสั้นอ่านง่าย",
  },
  {
    id: "workspaces-resource",
    resourceName: "workspaces",
    title: "Workspaces resource",
    summary:
      "เพิ่มขอบเขตระดับ workspace เพื่อวางโครงของ task board API ก่อนเข้าสู่โดเมนกระดานงานจริง",
    difficulty: "Starter",
    focus: "Workspace Structure",
    task:
      "ใช้ branch workspaces แยกจาก baseline เดิม, generate resource, ทำ feature commit และรวมกลับ main แบบเหลือ integration commit เดียว",
  },
  {
    id: "boards-resource",
    resourceName: "boards",
    title: "Boards resource",
    summary:
      "เริ่มโดเมนหลักของระบบด้วย resource สำหรับกระดานงานและฝึกควบคุมลำดับ merge บนเครื่องตัวเอง",
    difficulty: "Practice",
    focus: "Board Containers",
    task:
      "สร้าง boards resource บน branch แยก, ตรวจไฟล์ที่ Nest CLI สร้าง, commit งานให้ชัด แล้ว squash merge เข้า main เพื่อให้โครง history ของระบบยังคมและเรียบ",
  },
  {
    id: "columns-resource",
    resourceName: "columns",
    title: "Columns resource",
    summary:
      "เพิ่ม workflow stages ของ task board และฝึกย้ำ pattern เดิมจนกลายเป็น muscle memory",
    difficulty: "Practice",
    focus: "Workflow Stages",
    task:
      "ทำ columns resource บน branch ของตัวเอง, สร้าง feature commit และรวมกลับ main ด้วย squash merge พร้อมเช็กว่าลำดับ commit ยังสื่อสารได้ชัด",
  },
  {
    id: "tasks-resource",
    resourceName: "tasks",
    title: "Tasks resource",
    summary:
      "เข้าสู่ resource แกนกลางของระบบบอร์ดงานและฝึกจัดการ feature ที่มีความหมายกับผู้ใช้ปลายทางมากขึ้น",
    difficulty: "Practice",
    focus: "Task Cards",
    task:
      "สร้าง tasks resource, บันทึก feature commit ให้บอกขอบเขตงานชัดเจน แล้วรวมกลับ main แบบ squashed เพื่อให้ main มีเพียง commit สรุปที่จับใจความได้ทันที",
  },
  {
    id: "comments-resource",
    resourceName: "comments",
    title: "Comments resource",
    summary:
      "เพิ่มการสนทนารอบ task card เพื่อฝึกการแตก feature ย่อยต่อเนื่องโดยไม่ให้ history บน main ยืดยาวเกินจำเป็น",
    difficulty: "Practice",
    focus: "Discussion Threads",
    task:
      "ทำ comments resource แยก branch, ใช้คำสั่งชุดเดิมให้คล่อง แล้ว squash merge กลับ main เพื่อให้ผู้เรียนเห็นผลลัพธ์ซ้ำแบบเป็นระบบ",
  },
  {
    id: "labels-resource",
    resourceName: "labels",
    title: "Labels resource",
    summary:
      "เพิ่มการจัดหมวดหมู่งานและเริ่มเข้าสู่ช่วงที่ผู้เรียนควรจับ pattern ได้เองเกือบทั้งหมด",
    difficulty: "Challenge",
    focus: "Categorization",
    task:
      "generate labels resource, ทำ feature commit ด้วยข้อความที่สื่อชัด แล้วกลับมา main เพื่อ squash merge ให้ได้ integration commit ที่อ่านแล้วรู้ทันทีว่างานอะไรเข้ามา",
  },
  {
    id: "checklists-resource",
    resourceName: "checklists",
    title: "Checklists resource",
    summary:
      "เพิ่ม sub-task tracking เพื่อให้ flow ต่อเนื่องยาวขึ้นและยังคง clean history บน main ได้เหมือนเดิม",
    difficulty: "Challenge",
    focus: "Sub-task Tracking",
    task:
      "ใช้ branch checklists เพื่อสร้าง resource, commit งานบน branch ให้เสร็จ แล้วรวมกลับ main ด้วย squash merge โดยไม่เพิ่ม merge commit เกินจำเป็น",
  },
  {
    id: "attachments-resource",
    resourceName: "attachments",
    title: "Attachments resource",
    summary:
      "ปิดท้ายด้วย resource แนบไฟล์เพื่อให้ผู้เรียนทำ flow เดิมครบทั้ง 10 features และเห็นภาพรวมของประวัติแบบ squash",
    difficulty: "Challenge",
    focus: "File References",
    task:
      "สร้าง attachments resource เป็น feature สุดท้ายของ lab, ทำ feature commit และ squash merge กลับ main จากนั้นตรวจ history ว่าทั้ง task board API ถูกประกอบขึ้นจาก integration commits ที่อ่านง่ายครบชุด",
  },
];

const GENERATOR_CHOICES = [
  "เลือก transport เป็น REST API",
  "ตอบ Yes สำหรับ generate CRUD entry points",
  "ตอบ Yes สำหรับ generate entry file หรือ update module entrypoint",
];

function createFeatureSummary(
  feature: NestJsLocalSquashFlowFeatureSeed,
  order: number,
): NestJsLocalSquashFlowFeatureSummary {
  return {
    id: feature.id,
    order,
    title: feature.title,
    branchName: `feature/${feature.resourceName}-resource`,
    resourceName: feature.resourceName,
    focus: feature.focus,
    summary: feature.summary,
  };
}

function createLabItem(
  feature: NestJsLocalSquashFlowFeatureSeed,
): NestJsLocalSquashFlowLabItem {
  const branchName = `feature/${feature.resourceName}-resource`;
  const featureCommitMessage = `feat(${feature.resourceName}): generate ${feature.resourceName} resource`;
  const squashCommitMessage = `feat(${feature.resourceName}): squash merge ${feature.resourceName} resource`;

  return {
    id: feature.id,
    title: feature.title,
    summary: feature.summary,
    difficulty: feature.difficulty,
    focus: feature.focus,
    task: feature.task,
    branchName,
    resourceName: feature.resourceName,
    featureCommitMessage,
    squashCommitMessage,
    commands: [
      {
        command: `git switch ${branchName}`,
        description:
          "สลับไป feature branch ที่เตรียมจาก baseline เดียวกับทุก branch อื่นใน lab นี้",
      },
      {
        command: `nest g res ${feature.resourceName}`,
        description:
          "ให้ Nest CLI สร้าง resource ชุดนี้พร้อม module, controller, service และ CRUD endpoints",
      },
      {
        command: "git add .",
        description: "เก็บไฟล์ที่ Nest CLI สร้างและไฟล์ที่คุณปรับเพิ่มเข้า staging area",
      },
      {
        command: `git commit -m "${featureCommitMessage}"`,
        description:
          "บันทึกงานของ feature นี้บน branch ของมันเองด้วยข้อความที่บอกชัดว่า generate resource ใด",
      },
    ],
    generatorChoices: GENERATOR_CHOICES,
    localFlow: [
      `เริ่มจาก ${branchName} ที่แตกออกจาก baseline เดียวกับทุก feature เพื่อให้แต่ละงานแยกขอบเขตกันชัด`,
      `ใช้ Nest CLI สร้าง ${feature.resourceName} resource แล้วเก็บงานทั้งหมดเป็น feature commit บน branch นี้`,
      `กลับมาที่ main เพื่อรวมงานจาก ${branchName} แบบ squash แทนการพกประวัติย่อยทั้งหมดขึ้นมาบนเส้นหลัก`,
      `สร้าง integration commit เดียวด้วยข้อความ "${squashCommitMessage}" เพื่อให้ main อ่านย้อนหลังได้ง่าย`,
      "ตรวจ history หลังรวมงานเสร็จเพื่อยืนยันว่าภาพรวมของระบบยังเรียบและจับลำดับงานได้ทันที",
    ],
    squashCommands: [
      {
        command: "git switch main",
        description: "กลับมาที่ main ก่อนรวมงานของ feature นี้กลับเข้าสายหลัก",
      },
      {
        command: `git merge --squash ${branchName}`,
        description:
          "รวบการเปลี่ยนแปลงจาก branch นี้เข้า staging area ของ main โดยยังไม่สร้าง merge commit อัตโนมัติ",
      },
      {
        command: `git commit -m "${squashCommitMessage}"`,
        description:
          "สร้าง integration commit เดียวบน main เพื่อสรุปงานของ feature นี้ให้อ่านง่ายในภายหลัง",
      },
      {
        command: "git log --oneline --graph --decorate",
        description:
          "เช็กกราฟของ commit หลัง squash merge ว่า main ได้ commit สรุปที่ชัดและยังติดตามลำดับงานได้ง่าย",
      },
    ],
    squashSummary:
      "หลัง feature commit พร้อมแล้ว ให้ใช้ชุดคำสั่งนี้รวมงานกลับ main แบบเหลือ integration commit เดียวที่อ่านง่าย",
    checkpoint: `main มี ${feature.resourceName} resource แล้ว และ history แสดง commit "${squashCommitMessage}" เป็นตัวแทนของ feature นี้เรียบร้อย`,
    notes: [
      "เป้าหมายของ lab นี้คือฝึกจังหวะ branch -> generate -> feature commit -> squash merge -> ตรวจ history ให้คุ้นมือ",
      `ถ้าตรวจงานเรียบร้อยแล้ว ค่อยลบ branch นี้ด้วย git branch -d ${branchName}`,
      ...(feature.notes ?? []),
    ],
  };
}

export const NESTJS_LOCAL_SQUASH_FLOW_OVERVIEW_CARDS: NestJsLocalSquashFlowOverviewCard[] =
  [
    {
      id: "project-setup",
      title: "Project Setup",
      summary:
        "เริ่มจากสร้าง NestJS task board app ให้พร้อมใช้เป็น baseline ของทั้ง lab",
      commands: [
        {
          command: "nest new task-board-api --package-manager pnpm",
          description: "scaffold โปรเจกต์ NestJS ใหม่สำหรับใช้เป็น repo หลักของ lab นี้",
        },
        {
          command: "cd task-board-api",
          description:
            "เข้าสู่โฟลเดอร์โปรเจกต์ก่อนเริ่มเตรียม baseline และ feature branches",
        },
      ],
      notes: [
        "ถ้า Nest CLI ถามเรื่อง initialize git repository ให้เลือก No เพื่อให้เราคุม baseline commit เอง",
        "ใช้ชื่อโปรเจกต์เดิมตลอดบทเพื่อให้ branch และ commit messages อ่านตามง่าย",
      ],
    },
    {
      id: "baseline-git-setup",
      title: "Baseline Git Setup",
      summary: "ทำ initial commit บน main ให้เรียบร้อยก่อนแตก branch งานทุกกิ่ง",
      commands: [
        {
          command: "git init -b main",
          description: "สร้าง git repository โดยตั้งชื่อ branch หลักเป็น main ตั้งแต่ต้น",
        },
        {
          command: "git add .",
          description: "เก็บไฟล์ scaffold ของ NestJS ทั้งหมดเข้า staging area",
        },
        {
          command:
            'git commit -m "chore(app): scaffold NestJS task board baseline"',
          description:
            "ทำ baseline commit ที่ทุก feature branch จะใช้เป็นจุดเริ่มต้นร่วมกัน",
        },
      ],
      notes: [
        "baseline ที่นิ่งช่วยให้ทุก branch เริ่มจากจุดเดียวกันและทำให้สังเกตผลของ squash merge ชัดขึ้น",
      ],
    },
    {
      id: "branch-preparation",
      title: "Branch Preparation",
      summary:
        "แตกหลาย feature branches จาก baseline เดียวกันก่อนเริ่ม integration เพื่อให้ทุกงานถูกรวมกลับ main ตามลำดับที่ตั้งใจ",
      commands: [
        {
          command: `git switch main
git switch -c feature/auth-resource
git switch main
git switch -c feature/users-resource
git switch main
git switch -c feature/workspaces-resource
git switch main
git switch -c feature/boards-resource
git switch main
git switch -c feature/columns-resource
git switch main
git switch -c feature/tasks-resource
git switch main
git switch -c feature/comments-resource
git switch main
git switch -c feature/labels-resource
git switch main
git switch -c feature/checklists-resource
git switch main
git switch -c feature/attachments-resource
git switch main`,
          description:
            "ใช้ pattern เดิมซ้ำไปจนครบทั้ง 10 feature เพื่อให้ทุก branch แยกจาก baseline เดียวกันก่อนเริ่มรวมงานกลับ main",
        },
      ],
      notes: [
        "สร้าง branch ถัดไปจาก main เสมอในช่วงเตรียมงาน เพื่อให้แต่ละ feature แยกขอบเขตกันตั้งแต่ต้น",
      ],
    },
    {
      id: "local-squash-cadence",
      title: "Local Squash Cadence",
      summary:
        "จังหวะหลักของ lab นี้คือทำงานบน branch ของ feature แล้วรวมกลับ main แบบเหลือ commit สรุปเพียงตัวเดียว",
      commands: [
        {
          command: `git switch main
git merge --squash <feature-branch>
git commit -m "feat(<resource>): squash merge <resource> resource"`,
          description:
            "นี่คือชุดคำสั่งหลักที่คุณจะทำซ้ำเมื่อ feature แต่ละตัวพร้อมถูกรวมกลับเข้าสายหลัก",
        },
      ],
      notes: [
        "squash merge เหมาะกับบทฝึกนี้เพราะช่วยให้ main อ่านง่าย ขณะที่ branch งานยังเก็บจังหวะทำงานของ feature ไว้ได้ครบ",
      ],
    },
    {
      id: "history-check",
      title: "History Check",
      summary:
        "หลังรวมงานแต่ละรอบ ให้ย้อนดูประวัติเพื่อยืนยันว่า main มี integration commits ที่สั้น ชัด และเรียงตามลำดับ feature",
      commands: [
        {
          command: "git log --oneline --graph --decorate",
          description:
            "ใช้ตรวจภาพรวมของ commit ว่า main ได้ commit สรุปทีละ feature และยังย้อนอ่านเรื่องราวของโปรเจกต์ได้ง่าย",
        },
      ],
      notes: [
        "เมื่อ main ดูสะอาดและอ่านง่าย ผู้เรียนจะมองเห็นประโยชน์ของการ squash merge ชัดขึ้นมาก",
      ],
    },
  ];

export const NESTJS_LOCAL_SQUASH_FLOW_STAGES: NestJsLocalSquashFlowStage[] = [
  {
    id: "stage-scaffold",
    title: "Scaffold on main",
    description: "สร้าง NestJS app และทำ baseline commit บน main ให้พร้อมแตก branch งาน",
  },
  {
    id: "stage-branch",
    title: "Branch from the same baseline",
    description: "แตกทุก feature branch จาก baseline เดียวกันเพื่อให้การรวมงานกลับ main เปรียบเทียบได้ชัด",
  },
  {
    id: "stage-generate",
    title: "Generate resource + feature commit",
    description: "แต่ละ branch ใช้ nest g res ของตัวเอง, add ไฟล์ และทำ feature commit แยกขอบเขตงานให้ชัด",
  },
  {
    id: "stage-squash",
    title: "Squash merge into main",
    description: "กลับมาที่ main แล้วใช้ git merge --squash เพื่อรวมงานของแต่ละ feature ให้เหลือ integration commit เดียว",
  },
  {
    id: "stage-history",
    title: "Inspect history",
    description: "ดู git log หลังรวมงานแต่ละรอบเพื่อยืนยันว่า main ยังสะอาดและอ่านลำดับงานได้ง่าย",
  },
];

export const NESTJS_LOCAL_SQUASH_FLOW_FEATURE_SEQUENCE: NestJsLocalSquashFlowFeatureSummary[] =
  FEATURE_SEEDS.map((feature, index) => createFeatureSummary(feature, index + 1));

const LAB_ITEMS = FEATURE_SEEDS.map((feature) => createLabItem(feature));

export const NESTJS_LOCAL_SQUASH_FLOW_LAB_SECTIONS: NestJsLocalSquashFlowLabSection[] =
  [
    {
      id: "structure-features",
      title: "Structure Features",
      summary:
        "ห้า feature แรกวางโครงหลักของ task board API และทำให้ผู้เรียนจับ pattern ของ local squash flow ได้ตั้งแต่ต้น",
      labs: LAB_ITEMS.slice(0, 5),
    },
    {
      id: "execution-features",
      title: "Execution Features",
      summary:
        "ห้า feature หลังใช้ตอกย้ำ pattern เดิมกับโดเมนที่ใกล้การใช้งานจริงมากขึ้น เพื่อให้การสลับ branch และ squash merge คล่องมือ",
      labs: LAB_ITEMS.slice(5),
    },
  ];

export const NESTJS_LOCAL_SQUASH_FLOW_COMPLETION_POINTS = [
  "เมื่อจบ lab นี้ main ควรมีครบทั้ง auth, users, workspaces, boards, columns, tasks, comments, labels, checklists และ attachments resources",
  "แต่ละ feature ควรถูกรวมกลับ main ด้วย commit สรุปเพียงตัวเดียวที่สื่อความหมายชัดเจน",
];

export const NESTJS_LOCAL_SQUASH_FLOW_EXPECTED_LEARNING = [
  "เห็นภาพว่าการแตก branch จาก baseline เดียวกันช่วยให้ฝึก local integration ได้เป็นระบบ",
  "เข้าใจจังหวะ generate, add, feature commit, squash merge และตรวจ history โดยไม่ต้องพึ่ง workflow ภายนอกเครื่อง",
  "ฝึกทำให้ history บน main สั้น ชัด และเล่าเรื่องการเติบโตของโปรเจกต์ได้ง่ายขึ้น",
];
