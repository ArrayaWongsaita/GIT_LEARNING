export type NestJsBasicFlowCommand = {
  command: string;
  description: string;
};

export type NestJsBasicFlowOverviewCard = {
  id: string;
  title: string;
  summary: string;
  commands?: NestJsBasicFlowCommand[];
  notes?: string[];
};

export type NestJsBasicFlowStage = {
  id: string;
  title: string;
  description: string;
};

export type NestJsBasicFlowFeatureSummary = {
  id: string;
  order: number;
  title: string;
  branchName: string;
  resourceName: string;
  focus: string;
  summary: string;
};

export type NestJsBasicFlowLabDifficulty =
  | "Starter"
  | "Practice"
  | "Challenge";

export type NestJsBasicFlowLabItem = {
  id: string;
  title: string;
  summary: string;
  difficulty: NestJsBasicFlowLabDifficulty;
  focus: string;
  task: string;
  branchName: string;
  resourceName: string;
  commitMessage: string;
  prTitle: string;
  commands: NestJsBasicFlowCommand[];
  generatorChoices: string[];
  prFlow: string[];
  rebaseCommands: NestJsBasicFlowCommand[];
  rebaseSummary: string;
  checkpoint: string;
  notes?: string[];
};

export type NestJsBasicFlowLabSection = {
  id: string;
  title: string;
  summary: string;
  labs: NestJsBasicFlowLabItem[];
};

type NestJsBasicFlowFeatureSeed = {
  id: string;
  resourceName: string;
  title: string;
  summary: string;
  difficulty: NestJsBasicFlowLabDifficulty;
  focus: string;
  task: string;
  notes?: string[];
};

const FEATURE_SEEDS: NestJsBasicFlowFeatureSeed[] = [
  {
    id: "auth-resource",
    resourceName: "auth",
    title: "Auth resource",
    summary:
      "เปิดรอบ merge แรกด้วย resource ด้าน identity เพื่อวาง pattern ของทั้ง lab",
    difficulty: "Starter",
    focus: "Authentication",
    task:
      "สลับไป branch auth ที่แตกจาก baseline, generate auth resource, commit งาน และ push PR แรกขึ้น GitHub ให้ทีมเห็นโครง NestJS ที่ CLI สร้างให้ครบชุด",
    notes: [
      "feature นี้ควร merge เป็นตัวแรกเพื่อให้ branch อื่นมีของใหม่สำหรับฝึก rebase ตาม main",
    ],
  },
  {
    id: "users-resource",
    resourceName: "users",
    title: "Users resource",
    summary:
      "แยก user domain ออกมาอีก branch เพื่อฝึก update PR หลัง auth เข้า main แล้ว",
    difficulty: "Starter",
    focus: "User Management",
    task:
      "ทำ users resource บน branch ของตัวเองให้เสร็จ, push PR ค้างไว้ และเมื่อ auth merge แล้วให้ rebase branch นี้ก่อนค่อย merge ตาม",
  },
  {
    id: "categories-resource",
    resourceName: "categories",
    title: "Categories resource",
    summary:
      "เพิ่ม resource สำหรับจัดหมวดหมู่สินค้าและฝึกคุมประวัติ branch ที่รอคิว merge",
    difficulty: "Starter",
    focus: "Catalog Taxonomy",
    task:
      "generate categories resource แยกใน branch ของมันเอง แล้วใช้ flow เดิมคือ commit, push, เปิด PR และอัปเดต branch ด้วย rebase ก่อน merge",
  },
  {
    id: "products-resource",
    resourceName: "products",
    title: "Products resource",
    summary:
      "เริ่มเข้าสู่ feature หลักของร้านค้าและต้อง sync กับ main ที่มี upstream เปลี่ยนไปแล้วหลายรอบ",
    difficulty: "Practice",
    focus: "Product Catalog",
    task:
      "สร้าง products resource บน branch แยก, ตรวจว่า commit สื่อความหมาย, แล้วใช้ rebase ทำให้ PR ยังอยู่บน main ล่าสุดก่อน reviewer ตรวจ",
  },
  {
    id: "inventory-resource",
    resourceName: "inventory",
    title: "Inventory resource",
    summary:
      "ฝึก branch งานสต็อกที่ต้องตาม catalog features ให้ทันก่อน merge",
    difficulty: "Practice",
    focus: "Stock Control",
    task:
      "generate inventory resource เพื่อจำลองงานสต็อกสินค้า จากนั้น sync branch นี้กับ main ล่าสุดแล้วค่อย push update เข้า PR เดิม",
  },
  {
    id: "carts-resource",
    resourceName: "carts",
    title: "Carts resource",
    summary:
      "เริ่ม flow ฝั่ง shopper และเห็นผลของการ rebase เมื่อ upstream ขยับหลาย feature แล้ว",
    difficulty: "Practice",
    focus: "Cart Sessions",
    task:
      "ทำ carts resource บน branch แยก, commit ตาม convention, เปิด PR และอัปเดต branch ด้วย rebase เมื่อ features ด้าน catalog merge เข้า main ไปก่อนหน้าแล้ว",
  },
  {
    id: "addresses-resource",
    resourceName: "addresses",
    title: "Addresses resource",
    summary:
      "เพิ่มข้อมูลที่อยู่ของลูกค้าและฝึกคุม branch ที่เริ่มใกล้ flow checkout",
    difficulty: "Practice",
    focus: "Customer Profiles",
    task:
      "generate addresses resource, push branch ขึ้น remote, แล้วดูให้ PR นี้ยังตาม main ล่าสุดทันก่อนจะเข้า sequence ของ checkout features",
  },
  {
    id: "orders-resource",
    resourceName: "orders",
    title: "Orders resource",
    summary:
      "เข้าสู่ feature เชิงธุรกิจมากขึ้นและต้อง rebase หลังหลาย branch ก่อนหน้า merge ไปแล้ว",
    difficulty: "Challenge",
    focus: "Checkout Pipeline",
    task:
      "สร้าง orders resource บน branch ของตัวเอง แล้วใช้ cadence เดิมคือ push PR, fetch, rebase, force-with-lease และ merge เมื่อ checks พร้อม",
  },
  {
    id: "payments-resource",
    resourceName: "payments",
    title: "Payments resource",
    summary:
      "จำลอง branch งานสำคัญที่ต้องอัปเดตตาม main อย่างระวังก่อน merge",
    difficulty: "Challenge",
    focus: "Payment Workflow",
    task:
      "generate payments resource และรักษา PR ให้สดอยู่เสมอด้วยการ rebase หลัง orders และ features ก่อนหน้ารวมเข้ามาแล้ว",
  },
  {
    id: "reviews-resource",
    resourceName: "reviews",
    title: "Reviews resource",
    summary:
      "ปิดท้าย sequence ด้วย branch สุดท้ายที่ต้องยกฐานตาม main ที่ถูกอัปเดตมาหลายรอบ",
    difficulty: "Challenge",
    focus: "Post-purchase Feedback",
    task:
      "สร้าง reviews resource เป็น feature สุดท้ายของ lab แล้ว rebase branch นี้ขึ้นกับ main ล่าสุดก่อน merge ปิดงานทั้ง ecommerce flow",
  },
];

const GENERATOR_CHOICES = [
  "เลือก transport เป็น REST API",
  "ตอบ Yes สำหรับ generate CRUD entry points",
  "ตอบ Yes สำหรับ generate entry file หรือ update module entrypoint",
];

function createFeatureSummary(
  feature: NestJsBasicFlowFeatureSeed,
  order: number,
): NestJsBasicFlowFeatureSummary {
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
  feature: NestJsBasicFlowFeatureSeed,
  order: number,
): NestJsBasicFlowLabItem {
  const branchName = `feature/${feature.resourceName}-resource`;
  const commitMessage = `feat(${feature.resourceName}): generate ${feature.resourceName} resource`;
  const prTitle = `feat: add ${feature.resourceName} resource`;
  const isFirst = order === 1;

  return {
    id: feature.id,
    title: feature.title,
    summary: feature.summary,
    difficulty: feature.difficulty,
    focus: feature.focus,
    task: feature.task,
    branchName,
    resourceName: feature.resourceName,
    commitMessage,
    prTitle,
    commands: [
      {
        command: `git switch ${branchName}`,
        description:
          "สลับไป feature branch ที่แตกจาก baseline เดียวกับทุก branch อื่นใน lab นี้",
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
        command: `git commit -m "${commitMessage}"`,
        description: "บันทึกงานของ feature นี้ด้วย commit message ที่สื่อชัดว่า generate resource ใด",
      },
      {
        command: `git push -u origin ${branchName}`,
        description: "push branch ขึ้น remote เพื่อเปิดหรืออัปเดต Pull Request ของ feature นี้",
      },
    ],
    generatorChoices: GENERATOR_CHOICES,
    prFlow: isFirst
      ? [
          `เปิด PR จาก ${branchName} -> main ด้วย title "${prTitle}"`,
          "ขอ review และใช้ branch นี้เป็น PR แรกของ sequence เพื่อวาง cadence ให้ทั้งทีมเห็นตรงกัน",
          "เมื่อ checks ผ่านและ reviewer พร้อมแล้ว ให้ merge PR นี้เข้า main",
        ]
      : [
          `เปิด PR จาก ${branchName} -> main ด้วย title "${prTitle}"`,
          "ปล่อย PR นี้รอคิว merge ระหว่างที่ feature ก่อนหน้าเข้า main ไปก่อน",
          "เมื่อ main ขยับ ให้กลับมารัน rebase step ด้านล่างแล้ว push update เข้า PR เดิม",
          "เมื่อ checks ผ่านและ reviewer พร้อมแล้ว ให้ merge PR นี้เข้า main",
        ],
    rebaseCommands: isFirst
      ? []
      : [
          {
            command: `git switch ${branchName}`,
            description: "กลับมาที่ branch เดิมก่อนเริ่ม sync กับ main ล่าสุด",
          },
          {
            command: "git fetch origin",
            description: "ดึง metadata และ commit ล่าสุดจาก remote เข้ามาก่อนเริ่ม rebase",
          },
          {
            command: "git rebase origin/main",
            description: "ย้ายฐานของ branch นี้ขึ้นไปอยู่บน main ล่าสุดเพื่อให้ประวัติอ่านง่าย",
          },
          {
            command: `git push --force-with-lease origin ${branchName}`,
            description: "อัปเดต PR เดิมอย่างปลอดภัยหลัง rebase โดยไม่ force ทับงานคนอื่นแบบสุ่มสี่สุ่มห้า",
          },
        ],
    rebaseSummary: isFirst
      ? "branch นี้ merge เป็นตัวแรกจาก baseline จึงยังไม่ต้อง rebase ก่อนเปิด PR"
      : "เมื่อ feature ก่อนหน้าถูก merge เข้า main แล้ว ให้ใช้ชุดคำสั่งนี้ยกฐาน branch นี้ขึ้นบน main ล่าสุดก่อน merge",
    checkpoint: `PR "${prTitle}" ถูก merge แล้ว และ main มี ${feature.resourceName} resource รวมอยู่ใน history เรียบร้อย`,
    notes: [
      "เป้าหมายของ lab นี้คือฝึกจังหวะ branch -> PR -> merge -> rebase ให้ซ้ำจนคุ้นมือ",
      ...(feature.notes ?? []),
    ],
  };
}

export const NESTJS_BASIC_FLOW_OVERVIEW_CARDS: NestJsBasicFlowOverviewCard[] = [
  {
    id: "project-setup",
    title: "Project Setup",
    summary: "เริ่มจากสร้าง NestJS ecommerce app ให้พร้อมใช้เป็น baseline ของทั้ง lab",
    commands: [
      {
        command: "nest new ecommerce-api --package-manager pnpm",
        description: "scaffold โปรเจกต์ NestJS ใหม่สำหรับใช้เป็น repo หลักของ lab นี้",
      },
      {
        command: "cd ecommerce-api",
        description: "เข้าสู่โฟลเดอร์โปรเจกต์ก่อนเริ่มเตรียม baseline และ feature branches",
      },
    ],
    notes: [
      "ถ้า Nest CLI ถามเรื่อง initialize git repository ให้เลือก No เพื่อให้เราคุม baseline commit เอง",
      "ใช้ชื่อโปรเจกต์เดิมตลอดบทเพื่อให้ branch, PR และ commit messages อ่านตามง่าย",
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
          'git commit -m "chore(app): scaffold NestJS ecommerce baseline"',
        description: "ทำ baseline commit ที่ทุก feature branch จะใช้เป็นจุดเริ่มต้นร่วมกัน",
      },
      {
        command: "git push -u origin main",
        description: "push baseline ขึ้น remote เพื่อใช้เป็น base branch สำหรับ Pull Requests",
      },
    ],
    notes: [
      "baseline ที่นิ่งช่วยให้ทุก branch เริ่มจากจุดเดียวกันและเห็นประโยชน์ของ rebase ชัดขึ้น",
    ],
  },
  {
    id: "branch-preparation",
    title: "Branch Preparation",
    summary:
      "แตกหลาย feature branches จาก baseline เดียวกันก่อนเริ่ม integration เพื่อให้ทุก branch ต้องตาม main ภายหลัง",
    commands: [
      {
        command: `git switch main
git switch -c feature/auth-resource
git switch main
git switch -c feature/users-resource
git switch main
git switch -c feature/categories-resource
git switch main
git switch -c feature/products-resource
git switch main
git switch -c feature/inventory-resource
git switch main
git switch -c feature/carts-resource
git switch main
git switch -c feature/addresses-resource
git switch main
git switch -c feature/orders-resource
git switch main
git switch -c feature/payments-resource
git switch main
git switch -c feature/reviews-resource
git switch main`,
        description:
          "ใช้ pattern เดิมซ้ำไปจนครบทั้ง 10 feature เพื่อให้ทุก branch แยกจาก baseline เดียวกันก่อนมีใครถูก merge",
      },
    ],
    notes: [
      "สร้าง branch ถัดไปจาก main เสมอในช่วงเตรียมงาน เพื่อไม่ให้ branch ใหม่เผลอเอางานของ branch ก่อนหน้าติดมาด้วย",
      "หลังจาก branch ถูกเตรียมแล้ว แต่ละ feature จะทำงานของตัวเอง, commit, push และรอคิว merge ตาม sequence",
    ],
  },
  {
    id: "how-this-lab-works",
    title: "How this lab works",
    summary:
      "flow นี้ตั้งใจทำให้ branch ที่ยังไม่ merge ต้อง fetch + rebase + force-with-lease เพื่อเรียนรู้การดูแล PR ที่ตาม main ไม่ทัน",
    commands: [
      {
        command:
          "git fetch origin && git rebase origin/main && git push --force-with-lease origin <feature-branch>",
        description:
          "นี่คือคำสั่งหลักที่ branch ถัดไปจะต้องใช้ทุกครั้งหลัง feature ก่อนหน้าถูก merge เข้า main",
      },
    ],
    notes: [
      "ให้มองแต่ละ accordion เป็นภารกิจของ branch เดียว: generate resource, commit, push, เปิด PR, sync branch, แล้ว merge",
      "เป้าหมายสุดท้ายคือ main รวมครบทั้ง 10 resources โดยไม่มี branch ไหนหายจาก sequence",
    ],
  },
];

export const NESTJS_BASIC_FLOW_STAGES: NestJsBasicFlowStage[] = [
  {
    id: "stage-scaffold",
    title: "Scaffold on main",
    description: "สร้าง NestJS app และทำ baseline commit บน main ให้พร้อมแตก branch งาน",
  },
  {
    id: "stage-branch",
    title: "Branch from the same baseline",
    description: "แตกทุก feature branch จาก baseline เดียวกันเพื่อให้ภายหลังต้อง rebase ตาม main",
  },
  {
    id: "stage-generate",
    title: "Generate resource + commit",
    description: "แต่ละ branch ใช้ nest g res ของตัวเอง, add ไฟล์, และ commit ด้วย convention เดียวกัน",
  },
  {
    id: "stage-push-pr",
    title: "Push + open PR",
    description: "push branch ขึ้น origin แล้วเปิด PR เข้า main เพื่อให้ review และ checks เริ่มทำงาน",
  },
  {
    id: "stage-rebase",
    title: "Rebase queued branches",
    description: "เมื่อ feature ก่อนหน้าถูก merge ให้ branch ที่ยังรออยู่ fetch, rebase, และ push --force-with-lease",
  },
  {
    id: "stage-merge",
    title: "Merge in order",
    description: "merge ตามลำดับที่กำหนดไปเรื่อย ๆ จน main รวมครบทั้ง 10 resources",
  },
];

export const NESTJS_BASIC_FLOW_FEATURE_SEQUENCE: NestJsBasicFlowFeatureSummary[] =
  FEATURE_SEEDS.map((feature, index) => createFeatureSummary(feature, index + 1));

const LAB_ITEMS = FEATURE_SEEDS.map((feature, index) =>
  createLabItem(feature, index + 1),
);

export const NESTJS_BASIC_FLOW_LAB_SECTIONS: NestJsBasicFlowLabSection[] = [
  {
    id: "foundation-features",
    title: "Foundation Features",
    summary:
      "ห้า branch แรกใช้วางโครงหลักของ ecommerce API และสร้าง PR cadence ชุดแรกให้ทีมจับ pattern ได้",
    labs: LAB_ITEMS.slice(0, 5),
  },
  {
    id: "commerce-features",
    title: "Commerce Features",
    summary:
      "ห้า branch หลังใช้ฝึกการรักษา PR ให้ตาม main ทันเมื่อ upstream เปลี่ยนไปแล้วหลายรอบ",
    labs: LAB_ITEMS.slice(5),
  },
];

export const NESTJS_BASIC_FLOW_COMPLETION_POINTS = [
  "เมื่อจบ lab นี้ main ควรมีครบทั้ง auth, users, categories, products, inventory, carts, addresses, orders, payments และ reviews resources",
  "ทุก branch ควรผ่าน sequence เดียวกันคือ generate, commit, push, PR, rebase/update, แล้ว merge ตามคิว",
];

export const NESTJS_BASIC_FLOW_EXPECTED_LEARNING = [
  "เห็นภาพว่าทำไมการแตก branch จาก baseline เดียวกันช่วยให้สอนเรื่อง rebase ได้ชัด",
  "เข้าใจจังหวะ add, commit, push, PR, merge และ rebase ในงานจริงที่มีหลาย feature รอรวมเข้า main",
  "ฝึกใช้ force-with-lease อย่างมีบริบท หลัง branch ถูก rebase เพื่ออัปเดต PR เดิมอย่างปลอดภัย",
];
