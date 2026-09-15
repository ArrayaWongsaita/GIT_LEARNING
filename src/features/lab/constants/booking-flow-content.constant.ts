export type NestJsBookingFlowCommand = {
  command: string;
  description: string;
};

export type NestJsBookingFlowOverviewCard = {
  id: string;
  title: string;
  summary: string;
  commands?: NestJsBookingFlowCommand[];
  notes?: string[];
};

export type NestJsBookingFlowStage = {
  id: string;
  title: string;
  description: string;
};

export type NestJsBookingFlowFeatureSummary = {
  id: string;
  order: number;
  title: string;
  branchName: string;
  resourceName: string;
  focus: string;
  summary: string;
};

export type NestJsBookingFlowLabDifficulty =
  | "Starter"
  | "Practice"
  | "Challenge";

export type NestJsBookingFlowLabItem = {
  id: string;
  title: string;
  summary: string;
  difficulty: NestJsBookingFlowLabDifficulty;
  focus: string;
  task: string;
  branchName: string;
  resourceName: string;
  commitMessage: string;
  prTitle: string;
  commands: NestJsBookingFlowCommand[];
  generatorChoices: string[];
  prFlow: string[];
  rebaseCommands: NestJsBookingFlowCommand[];
  rebaseSummary: string;
  checkpoint: string;
  notes?: string[];
};

export type NestJsBookingFlowLabSection = {
  id: string;
  title: string;
  summary: string;
  labs: NestJsBookingFlowLabItem[];
};

type NestJsBookingFlowFeatureSeed = {
  id: string;
  resourceName: string;
  title: string;
  summary: string;
  difficulty: NestJsBookingFlowLabDifficulty;
  focus: string;
  task: string;
  notes?: string[];
};

const FEATURE_SEEDS: NestJsBookingFlowFeatureSeed[] = [
  {
    id: "auth-resource",
    resourceName: "auth",
    title: "Auth resource",
    summary:
      "เริ่มต้นระบบจองด้วย resource ด้าน authentication เพื่อวาง pattern ของ commits และ PR ชุดแรก",
    difficulty: "Starter",
    focus: "Authentication",
    task:
      "สลับไป branch auth ที่แตกจาก baseline, generate auth resource, commit งาน แล้ว push PR แรกของ booking app เพื่อให้ทีมเห็นรูปแบบ NestJS CLI ที่จะใช้ซ้ำทั้ง lab",
    notes: [
      "feature นี้ควร merge เป็นตัวแรก เพื่อให้ branch อื่นมี upstream ใหม่สำหรับฝึก rebase ตาม main",
    ],
  },
  {
    id: "users-resource",
    resourceName: "users",
    title: "Users resource",
    summary:
      "แยกโดเมนผู้ใช้เป็นอีก branch เพื่อฝึกดูแล PR ที่ยังไม่ merge หลัง auth เข้า main แล้ว",
    difficulty: "Starter",
    focus: "Guest Accounts",
    task:
      "สร้าง users resource บน branch ของตัวเองให้เสร็จ, push PR ค้างไว้ และเมื่อ auth merge แล้วให้ rebase branch นี้ก่อน merge ตามคิว",
  },
  {
    id: "hotels-resource",
    resourceName: "hotels",
    title: "Hotels resource",
    summary:
      "เริ่มเข้าสู่โดเมนหลักของระบบจองด้วย resource สำหรับข้อมูลที่พักและ property management",
    difficulty: "Starter",
    focus: "Property Catalog",
    task:
      "generate hotels resource แยกใน branch ของมันเอง, commit ให้ชัดเจน, push ขึ้น remote แล้วเปิด PR รอคิว merge ตามลำดับ",
  },
  {
    id: "rooms-resource",
    resourceName: "rooms",
    title: "Rooms resource",
    summary:
      "เพิ่ม resource สำหรับห้องพักซึ่งต้องตาม catalog ของโรงแรมให้ทันเมื่อ main ขยับไปแล้วหลายรอบ",
    difficulty: "Practice",
    focus: "Room Inventory",
    task:
      "สร้าง rooms resource บน branch แยก, เปิด PR และใช้ rebase ทำให้ branch นี้ยังวางอยู่บน main ล่าสุดก่อน reviewer ตรวจ",
  },
  {
    id: "amenities-resource",
    resourceName: "amenities",
    title: "Amenities resource",
    summary:
      "จำลอง branch งานรายละเอียดสิ่งอำนวยความสะดวกที่ช่วยเติมข้อมูลประกอบให้หน้าที่พักสมบูรณ์ขึ้น",
    difficulty: "Practice",
    focus: "Property Details",
    task:
      "generate amenities resource, commit ตาม convention เดิม, แล้ว sync branch นี้กับ main ล่าสุดก่อนอัปเดต PR เดิมเข้าไป",
  },
  {
    id: "availability-resource",
    resourceName: "availability",
    title: "Availability resource",
    summary:
      "เข้าสู่ flow จองจริงด้วย availability logic ที่ต้องตามข้อมูลโรงแรมและห้องพักให้ทัน",
    difficulty: "Practice",
    focus: "Room Availability",
    task:
      "ทำ availability resource บน branch แยก, push PR และ rebase branch นี้หลัง features ด้าน catalog ถูก merge เข้า main ไปก่อนหน้าแล้ว",
  },
  {
    id: "bookings-resource",
    resourceName: "bookings",
    title: "Bookings resource",
    summary:
      "feature หลักของระบบ reservation ที่ช่วยให้เห็นภาพ branch isolation และการรักษา PR ให้อัปเดตทัน main",
    difficulty: "Practice",
    focus: "Reservation Flow",
    task:
      "generate bookings resource, push branch ขึ้น remote และดูให้ PR นี้ยังตาม main ล่าสุดทันก่อนเข้า sequence ของ payments และ post-booking features",
  },
  {
    id: "payments-resource",
    resourceName: "payments",
    title: "Payments resource",
    summary:
      "จำลอง branch งานที่มีผลกับ checkout flow และต้องอัปเดตตาม main อย่างระวังก่อน merge",
    difficulty: "Challenge",
    focus: "Checkout Payments",
    task:
      "สร้าง payments resource บน branch ของตัวเอง แล้วใช้ cadence เดิมคือ push PR, fetch, rebase, force-with-lease และ merge เมื่อ checks พร้อม",
  },
  {
    id: "coupons-resource",
    resourceName: "coupons",
    title: "Coupons resource",
    summary:
      "เพิ่มส่วนลดและโปรโมชันเพื่อฝึกงานอีก branch ที่ต้องยกฐานหลัง upstream เปลี่ยนไปแล้วหลายครั้ง",
    difficulty: "Challenge",
    focus: "Promotions",
    task:
      "generate coupons resource และรักษา PR ให้สดอยู่เสมอด้วยการ rebase หลัง bookings และ payments merge เข้า main ไปแล้ว",
  },
  {
    id: "reviews-resource",
    resourceName: "reviews",
    title: "Reviews resource",
    summary:
      "ปิดท้าย flow ของ booking app ด้วย branch รีวิวที่ต้องอิงบน main ล่าสุดก่อน merge ปิดงานทั้งระบบ",
    difficulty: "Challenge",
    focus: "Post-stay Feedback",
    task:
      "สร้าง reviews resource เป็น feature สุดท้ายของ lab แล้ว rebase branch นี้ขึ้นกับ main ล่าสุดก่อน merge ปิด booking workflow ให้ครบทุก feature",
  },
];

const GENERATOR_CHOICES = [
  "เลือก transport เป็น REST API",
  "ตอบ Yes สำหรับ generate CRUD entry points",
  "ตอบ Yes สำหรับ generate entry file หรือ update module entrypoint",
];

function createFeatureSummary(
  feature: NestJsBookingFlowFeatureSeed,
  order: number,
): NestJsBookingFlowFeatureSummary {
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
  feature: NestJsBookingFlowFeatureSeed,
  order: number,
): NestJsBookingFlowLabItem {
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
          "สลับไป feature branch ที่แตกจาก baseline เดียวกับทุก branch อื่นใน lab ของ booking app นี้",
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
          "ขอ review และใช้ branch นี้เป็น PR แรกของ sequence เพื่อให้ทีมเห็น cadence ของ booking app ตรงกัน",
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
            description: "ย้ายฐานของ branch นี้ขึ้นไปอยู่บน main ล่าสุดเพื่อให้ history อ่านตามง่าย",
          },
          {
            command: `git push --force-with-lease origin ${branchName}`,
            description: "อัปเดต PR เดิมอย่างปลอดภัยหลัง rebase โดย force เฉพาะเมื่อ remote ยังอยู่ในสถานะที่เราคาดไว้",
          },
        ],
    rebaseSummary: isFirst
      ? "branch นี้ merge เป็นตัวแรกจาก baseline จึงยังไม่ต้อง rebase ก่อนเปิด PR"
      : "เมื่อ feature ก่อนหน้าถูก merge เข้า main แล้ว ให้ใช้ชุดคำสั่งนี้ยกฐาน branch นี้ขึ้นบน main ล่าสุดก่อน merge",
    checkpoint: `PR "${prTitle}" ถูก merge แล้ว และ main มี ${feature.resourceName} resource รวมอยู่ใน history เรียบร้อย`,
    notes: [
      "เป้าหมายของ lab นี้คือฝึกจังหวะ branch -> PR -> merge -> rebase ให้ซ้ำจนคุ้นมือในอีกโดเมนหนึ่ง",
      ...(feature.notes ?? []),
    ],
  };
}

export const NESTJS_BOOKING_FLOW_OVERVIEW_CARDS: NestJsBookingFlowOverviewCard[] =
  [
    {
      id: "project-setup",
      title: "Project Setup",
      summary: "เริ่มจากสร้าง NestJS booking app ให้พร้อมใช้เป็น baseline ของทั้ง lab",
      commands: [
        {
          command: "nest new booking-api --package-manager pnpm",
          description: "scaffold โปรเจกต์ NestJS ใหม่สำหรับใช้เป็น repo หลักของ booking lab นี้",
        },
        {
          command: "cd booking-api",
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
          command: 'git commit -m "chore(app): scaffold NestJS booking baseline"',
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
git switch -c feature/hotels-resource
git switch main
git switch -c feature/rooms-resource
git switch main
git switch -c feature/amenities-resource
git switch main
git switch -c feature/availability-resource
git switch main
git switch -c feature/bookings-resource
git switch main
git switch -c feature/payments-resource
git switch main
git switch -c feature/coupons-resource
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
        "เป้าหมายสุดท้ายคือ main รวมครบทั้ง 10 resources ของ booking app โดยไม่มี branch ไหนหายจาก sequence",
      ],
    },
  ];

export const NESTJS_BOOKING_FLOW_STAGES: NestJsBookingFlowStage[] = [
  {
    id: "stage-scaffold",
    title: "Scaffold on main",
    description: "สร้าง NestJS booking app และทำ baseline commit บน main ให้พร้อมแตก branch งาน",
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

export const NESTJS_BOOKING_FLOW_FEATURE_SEQUENCE: NestJsBookingFlowFeatureSummary[] =
  FEATURE_SEEDS.map((feature, index) => createFeatureSummary(feature, index + 1));

const LAB_ITEMS = FEATURE_SEEDS.map((feature, index) =>
  createLabItem(feature, index + 1),
);

export const NESTJS_BOOKING_FLOW_LAB_SECTIONS: NestJsBookingFlowLabSection[] = [
  {
    id: "platform-foundation",
    title: "Platform Foundation",
    summary:
      "ห้า branch แรกใช้วางโครงหลักของ booking API และสร้าง PR cadence ชุดแรกให้ทีมเห็น pattern ชัดเจน",
    labs: LAB_ITEMS.slice(0, 5),
  },
  {
    id: "reservation-journey",
    title: "Reservation Journey",
    summary:
      "ห้า branch หลังใช้ฝึกการรักษา PR ให้ตาม main ทันเมื่อ upstream เปลี่ยนไปแล้วหลายรอบใน flow การจองจริง",
    labs: LAB_ITEMS.slice(5),
  },
];

export const NESTJS_BOOKING_FLOW_COMPLETION_POINTS = [
  "เมื่อจบ lab นี้ main ควรมีครบทั้ง auth, users, hotels, rooms, amenities, availability, bookings, payments, coupons และ reviews resources",
  "ทุก branch ควรผ่าน sequence เดียวกันคือ generate, commit, push, PR, rebase/update, แล้ว merge ตามคิว",
];

export const NESTJS_BOOKING_FLOW_EXPECTED_LEARNING = [
  "เห็นภาพว่าการแตก branch จาก baseline เดียวกันทำให้สอนเรื่อง rebase ได้ชัด แม้เปลี่ยน business domain แล้ว",
  "เข้าใจจังหวะ add, commit, push, PR, merge และ rebase ในงานจริงที่มีหลาย feature รอรวมเข้า main",
  "ฝึกใช้ force-with-lease อย่างมีบริบท หลัง branch ถูก rebase เพื่ออัปเดต PR เดิมอย่างปลอดภัย",
];
