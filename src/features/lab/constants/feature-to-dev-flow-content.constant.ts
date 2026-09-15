export type FeatureToDevFlowCommand = {
  command: string;
  description: string;
};

export type FeatureToDevFlowOverviewCard = {
  id: string;
  title: string;
  summary: string;
  commands?: FeatureToDevFlowCommand[];
  notes?: string[];
};

export type FeatureToDevFlowStage = {
  id: string;
  title: string;
  description: string;
};

export type FeatureToDevFlowFeatureSummary = {
  id: string;
  order: number;
  title: string;
  branchName: string;
  targetBranch: string;
  focus: string;
  summary: string;
};

export type FeatureToDevFlowCommandGroup = {
  id: string;
  title: string;
  summary: string;
  commands: FeatureToDevFlowCommand[];
};

export type FeatureToDevFlowLabItem = {
  id: string;
  title: string;
  summary: string;
  focus: string;
  sourceBranch: string;
  targetBranch: string;
  prTitle?: string;
  task: string;
  commandGroups: FeatureToDevFlowCommandGroup[];
  checkpoint: string;
  notes?: string[];
};

export type FeatureToDevFlowLabSection = {
  id: string;
  title: string;
  summary: string;
  labs: FeatureToDevFlowLabItem[];
};

type FeatureToDevFlowFeatureSeed = {
  id: string;
  resourceName: string;
  title: string;
  summary: string;
  focus: string;
  notes?: string[];
};

const FEATURE_SEEDS: FeatureToDevFlowFeatureSeed[] = [
  {
    id: "auth-resource",
    resourceName: "auth",
    title: "Auth resource",
    summary:
      "เปิด PR แรกเข้า dev ด้วย resource ด้าน identity เพื่อวาง cadence ของทั้ง lab ให้ชัดตั้งแต่ต้น",
    focus: "Authentication",
    notes: [
      "feature นี้ควร merge เข้า dev เป็นตัวแรก เพื่อให้ branch ถัดไปมีของใหม่สำหรับฝึก rebase ตาม origin/dev",
    ],
  },
  {
    id: "users-resource",
    resourceName: "users",
    title: "Users resource",
    summary:
      "แยก user domain เป็นอีก branch ที่ต้องรอ auth เข้า dev ก่อน แล้วค่อย refresh PR เดิมตาม shared branch",
    focus: "User Management",
  },
  {
    id: "categories-resource",
    resourceName: "categories",
    title: "Categories resource",
    summary:
      "เพิ่ม resource สำหรับจัดหมวดหมู่สินค้าและฝึกคุม PR ที่ต้องตาม dev ให้ทันระหว่างคิว review",
    focus: "Catalog Taxonomy",
  },
  {
    id: "products-resource",
    resourceName: "products",
    title: "Products resource",
    summary:
      "เข้าสู่ feature หลักของร้านค้าและเริ่มเห็นชัดว่า branch ที่ค้างคิวต้อง rebase บน origin/dev เมื่อ upstream ขยับ",
    focus: "Product Catalog",
  },
  {
    id: "inventory-resource",
    resourceName: "inventory",
    title: "Inventory resource",
    summary:
      "ฝึก branch งานสต็อกที่ต้อง sync กับ dev หลัง catalog features ก่อนหน้าทยอย merge เข้ามาแล้ว",
    focus: "Stock Control",
  },
  {
    id: "carts-resource",
    resourceName: "carts",
    title: "Carts resource",
    summary:
      "เริ่ม flow ฝั่ง shopper และใช้ PR เดิมเป็นพื้นที่ฝึก rebase บน dev หลายรอบโดยไม่เปิด PR ใหม่",
    focus: "Cart Sessions",
  },
  {
    id: "addresses-resource",
    resourceName: "addresses",
    title: "Addresses resource",
    summary:
      "เพิ่มข้อมูลที่อยู่ของลูกค้าและรักษา branch ให้ตาม integration branch ของทีมก่อนเข้าช่วง checkout",
    focus: "Customer Profiles",
  },
  {
    id: "orders-resource",
    resourceName: "orders",
    title: "Orders resource",
    summary:
      "เข้าสู่ feature เชิงธุรกิจมากขึ้นและต้องยกฐาน branch ตาม origin/dev หลังหลาย PR ก่อนหน้า merge ไปแล้ว",
    focus: "Checkout Pipeline",
  },
  {
    id: "payments-resource",
    resourceName: "payments",
    title: "Payments resource",
    summary:
      "จำลอง branch งานสำคัญที่ reviewer อยากเห็นประวัติสะอาดและ base ล่าสุดบน dev ก่อน merge",
    focus: "Payment Workflow",
  },
  {
    id: "reviews-resource",
    resourceName: "reviews",
    title: "Reviews resource",
    summary:
      "ปิดท้าย sequence ด้วย branch สุดท้ายที่ต้อง rebase ตาม origin/dev ซึ่งสะสม feature ก่อนหน้ามาหลายรอบแล้ว",
    focus: "Post-purchase Feedback",
  },
];

function createFeatureSummary(
  feature: FeatureToDevFlowFeatureSeed,
  order: number,
): FeatureToDevFlowFeatureSummary {
  return {
    id: feature.id,
    order,
    title: feature.title,
    branchName: `feature/${feature.resourceName}-resource`,
    targetBranch: "dev",
    focus: feature.focus,
    summary: feature.summary,
  };
}

function createLabItem(
  feature: FeatureToDevFlowFeatureSeed,
  order: number,
): FeatureToDevFlowLabItem {
  const branchName = `feature/${feature.resourceName}-resource`;
  const commitMessage = `feat(${feature.resourceName}): generate ${feature.resourceName} resource for dev`;
  const prTitle = `feat: deliver ${feature.resourceName} resource to dev`;
  const isFirst = order === 1;

  return {
    id: feature.id,
    title: feature.title,
    summary: feature.summary,
    focus: feature.focus,
    sourceBranch: branchName,
    targetBranch: "dev",
    prTitle,
    task: isFirst
      ? `ใช้ ${branchName} เป็น feature แรกของ sequence นี้ สร้าง ${feature.resourceName} resource, push branch ขึ้น remote, แล้วเปิด PR แรกเข้า dev เพื่อวาง pattern การ review และ merge ให้ทีมใช้ตามทั้ง 10 งาน`
      : `ใช้ ${branchName} ที่แตกจาก dev baseline เดียวกัน สร้าง ${feature.resourceName} resource, push PR เข้า dev, แล้วเมื่อ PR ก่อนหน้าถูก merge ให้ยกฐาน branch นี้ขึ้นบน origin/dev ก่อนอัปเดต PR เดิม`,
    commandGroups: [
      {
        id: "build-feature-work",
        title: "Build feature work",
        summary:
          "สลับมาที่ feature branch ของตัวเองแล้วสร้าง resource พร้อม commit งานให้ชัดก่อน publish ขึ้น remote",
        commands: [
          {
            command: `git switch ${branchName}`,
            description:
              "กลับมายัง branch ที่ถูกเตรียมจาก dev baseline เดียวกับทุก feature อื่นใน lab นี้",
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
            description:
              "บันทึกงานของ feature นี้ด้วยข้อความ commit ที่สื่อชัดว่ากำลังเตรียม PR เข้า dev",
          },
        ],
      },
      {
        id: "publish-pr-to-dev",
        title: "Push branch and prepare PR",
        summary:
          "publish feature branch ขึ้น remote แล้วตรวจให้ชัดว่า PR นี้จะกลับเข้า dev ตั้งแต่ครั้งแรก",
        commands: [
          {
            command: `git push -u origin ${branchName}`,
            description:
              "push branch ขึ้น origin เพื่อให้พร้อมเปิดหรืออัปเดต Pull Request ของ feature นี้",
          },
          {
            command: "git branch -vv",
            description:
              "ตรวจว่า feature branch track กับ remote branch ของตัวเองเรียบร้อยแล้ว",
          },
          {
            command: "git log --oneline --graph --decorate -n 8",
            description:
              "ดู history ล่าสุดก่อนเปิด PR เพื่อยืนยันว่าขอบเขตงานยังอยู่เฉพาะ feature นี้",
          },
        ],
      },
      isFirst
        ? {
            id: "merge-first-pr-and-sync-dev",
            title: "Merge first PR and sync dev",
            summary:
              "branch แรกยังไม่ต้อง rebase แต่หลัง merge เข้า dev แล้วต้องดึงสถานะล่าสุดกลับมาที่ local dev",
            commands: [
              {
                command: "git fetch origin",
                description:
                  "ดึง metadata ล่าสุดจาก remote ก่อนตรวจว่าการ merge เข้า dev เรียบร้อยแล้ว",
              },
              {
                command: "git switch dev",
                description:
                  "กลับมายัง shared integration branch หลัง PR แรกถูก merge เข้า dev",
              },
              {
                command: "git pull --ff-only origin dev",
                description:
                  "sync local dev ให้ตรงกับ origin/dev โดยไม่สร้าง merge commit แทรก",
              },
            ],
          }
        : {
            id: "refresh-queued-pr-on-dev",
            title: "Refresh queued PR on dev",
            summary:
              "เมื่อ feature ก่อนหน้าถูก merge เข้า dev แล้ว ให้ fetch, rebase บน origin/dev, และอัปเดต PR เดิมด้วย --force-with-lease",
            commands: [
              {
                command: "git fetch origin",
                description:
                  "ดึง metadata และ commit ล่าสุดจาก remote ก่อนเริ่ม rebase branch นี้",
              },
              {
                command: "git rebase origin/dev",
                description:
                  "ย้ายฐานของ branch นี้ขึ้นบน origin/dev ล่าสุดเพื่อให้ PR เดิมยัง merge เข้า dev ได้สะอาด",
              },
              {
                command: `git push --force-with-lease origin ${branchName}`,
                description:
                  "อัปเดต PR เดิมอย่างปลอดภัยหลัง rebase โดยใช้ได้เฉพาะ feature branch ของตัวเอง",
              },
              {
                command: "git switch dev",
                description:
                  "หลัง PR นี้ถูก merge เข้า dev แล้ว ให้กลับมาที่ integration branch เพื่อเตรียมเริ่มงานถัดไป",
              },
              {
                command: "git pull --ff-only origin dev",
                description:
                  "ดึงสถานะล่าสุดของ dev กลับมาที่เครื่องโดยไม่สร้าง merge commit เพิ่ม",
              },
            ],
          },
    ],
    checkpoint: `PR "${prTitle}" ถูก merge เข้า dev แล้ว และ origin/dev มี ${feature.resourceName} resource รวมอยู่ใน history เรียบร้อย`,
    notes: [
      `ตอนเปิด PR บน GitHub ให้ตั้ง base = dev และ compare = ${branchName}`,
      'ใช้ title เป็นรูปแบบ "feat: deliver <resource> resource to dev" เพื่อให้ reviewer เห็นเป้าหมายของ PR ทันที',
      "เลือก transport เป็น REST API และตอบ Yes สำหรับ generate CRUD entry points เพื่อให้ทุก feature มี baseline เดียวกัน",
      ...(isFirst
        ? [
            "PR แรกควรใช้วางกติกาให้ทีมเห็นตรงกันว่า flow นี้ merge เข้า dev ไม่ใช่ main",
          ]
        : [
            "--force-with-lease ใช้หลัง rebase บน feature branch ของตัวเองเท่านั้น ไม่ใช้กับ dev หรือ main",
            "ถ้าระหว่าง rebase มี conflict ให้แก้ไฟล์, git add ., แล้วต่อด้วย git rebase --continue ก่อนกลับไป push",
          ]),
      ...(feature.notes ?? []),
    ],
  };
}

export const FEATURE_TO_DEV_FLOW_OVERVIEW_CARDS: FeatureToDevFlowOverviewCard[] = [
  {
    id: "starting-point",
    title: "Starting Point",
    summary:
      "เริ่มจาก repository ที่มี main เป็นสาย stable และมี remote origin พร้อมก่อนเริ่มบทนี้ เพื่อให้ dev และ feature branches ทุกกิ่งเริ่มจากฐานที่เชื่อถือได้",
    commands: [
      {
        command: "git switch main",
        description: "กลับมายัง main เพื่อยืนยันว่าคุณกำลังเริ่มจากสายหลักที่ถูกต้อง",
      },
      {
        command: "git pull --ff-only origin main",
        description:
          "ดึง main ล่าสุดแบบ fast-forward only ก่อนแตก shared branch และ feature queue ของรอบนี้",
      },
    ],
    notes: [
      "ถ้า main ยังไม่ clean หรือยังตาม origin/main ไม่ทัน ให้จัดให้เรียบร้อยก่อนเริ่ม flow นี้",
      "บทนี้ใช้ 10 feature branches เพื่อฝึก PR เข้า dev ตั้งแต่ต้น ไม่ได้สอนขั้น promote dev เข้า main",
    ],
  },
  {
    id: "publish-dev",
    title: "Publish dev as integration branch",
    summary:
      "สร้าง dev จาก main ล่าสุดแล้ว push ขึ้น origin ให้ทั้งทีมยึด dev เป็น shared integration branch สำหรับรอบงานนี้",
    commands: [
      {
        command: `git switch main
git pull --ff-only origin main
git switch -c dev
git push -u origin dev`,
        description:
          "เมื่อจบชุดคำสั่งนี้ local dev และ origin/dev จะพร้อมเป็นฐานกลางที่ทุก feature branch ของบทนี้ต้องอ้างอิงร่วมกัน",
      },
    ],
    notes: [
      "dev เป็น shared branch จึงไม่ควร force push หรือ rewrite history แบบสุ่มสี่สุ่มห้า",
    ],
  },
  {
    id: "branch-preparation",
    title: "Prepare 10 feature branches",
    summary:
      "แตกทั้ง 10 feature branches จาก dev baseline เดียวกันตั้งแต่แรก เพื่อให้ branch ที่ค้างคิวต้องกลับมา rebase ตาม origin/dev ระหว่างทาง",
    commands: [
      {
        command: `git switch dev
git switch -c feature/auth-resource
git switch dev
git switch -c feature/users-resource
git switch dev
git switch -c feature/categories-resource
git switch dev
git switch -c feature/products-resource
git switch dev
git switch -c feature/inventory-resource
git switch dev
git switch -c feature/carts-resource
git switch dev
git switch -c feature/addresses-resource
git switch dev
git switch -c feature/orders-resource
git switch dev
git switch -c feature/payments-resource
git switch dev
git switch -c feature/reviews-resource
git switch dev`,
        description:
          "เตรียม branch ให้ครบตั้งแต่ต้นเพื่อจำลองสถานการณ์จริงที่หลายงานเริ่มจาก integration branch เวอร์ชันเดียวกันก่อนมี PR ไหน merge เข้า dev",
      },
    ],
    notes: [
      "ถ้าสร้าง branch ไปแล้วก่อนหน้านี้ ให้ข้าม step นี้และแค่เช็กว่าแต่ละ branch แตกจาก dev baseline เดียวกันจริง",
    ],
  },
  {
    id: "safe-pr-update",
    title: "Safe PR Update After Rebase",
    summary:
      "เมื่อ dev ขยับระหว่าง review ให้ยกฐาน feature branch บน origin/dev แล้วอัปเดต PR เดิมด้วย --force-with-lease เฉพาะ branch ของตัวเอง",
    commands: [
      {
        command:
          "git fetch origin && git rebase origin/dev && git push --force-with-lease origin <feature-branch>",
        description:
          "นี่คือ cadence หลักที่ branch ลำดับถัดไปต้องใช้ซ้ำเรื่อย ๆ หลัง feature ก่อนหน้าถูก merge เข้า dev",
      },
    ],
    notes: [
      "การตั้ง base branch ให้ถูกตั้งแต่ PR แรกช่วยลดความสับสนของ reviewer และทำให้ automation ของทีมทำงานได้ตรง policy",
    ],
  },
];

export const FEATURE_TO_DEV_FLOW_STAGES: FeatureToDevFlowStage[] = [
  {
    id: "stage-publish-dev",
    title: "Publish dev from main",
    description:
      "สร้าง dev จาก main ล่าสุดแล้ว publish ขึ้น origin ให้ทุกคนเริ่มจาก shared integration branch เดียวกัน",
  },
  {
    id: "stage-branch-queue",
    title: "Branch 10 features from dev",
    description:
      "แตกทั้ง 10 feature branches จาก dev baseline เดียวกัน เพื่อให้ branch ที่ค้างคิวต้อง rebase ตาม origin/dev ภายหลัง",
  },
  {
    id: "stage-generate",
    title: "Generate resource + commit",
    description:
      "แต่ละ branch ใช้ nest g res ของตัวเอง, add ไฟล์, และ commit ด้วย convention เดียวกันก่อน push ขึ้น remote",
  },
  {
    id: "stage-push-pr",
    title: "Push + open PR to dev",
    description:
      "push branch ขึ้น origin แล้วเปิด PR ด้วย base = dev เพื่อให้ review และ checks วิ่งบน integration branch ที่ทีมใช้จริง",
  },
  {
    id: "stage-rebase",
    title: "Rebase queued branches on dev",
    description:
      "เมื่อ feature ก่อนหน้าถูก merge ให้ branch ที่ยังรออยู่ fetch, rebase origin/dev, แล้ว push --force-with-lease อัปเดต PR เดิม",
  },
  {
    id: "stage-sync-dev",
    title: "Sync dev after each merge",
    description:
      "หลัง PR merge เข้า dev แล้ว ให้ดึงสถานะล่าสุดกลับมาที่ local dev แบบ --ff-only ก่อนเริ่ม branch ถัดไป",
  },
];

export const FEATURE_TO_DEV_FLOW_FEATURE_SEQUENCE: FeatureToDevFlowFeatureSummary[] =
  FEATURE_SEEDS.map((feature, index) => createFeatureSummary(feature, index + 1));

const LAB_ITEMS = FEATURE_SEEDS.map((feature, index) =>
  createLabItem(feature, index + 1),
);

export const FEATURE_TO_DEV_FLOW_LAB_SECTIONS: FeatureToDevFlowLabSection[] = [
  {
    id: "foundation-features-to-dev",
    title: "Foundation Features to dev",
    summary:
      "ห้า PR แรกใช้วางโครงหลักของ ecommerce API และสร้าง cadence การ merge เข้า dev ให้ทีมจับ pattern ได้",
    labs: LAB_ITEMS.slice(0, 5),
  },
  {
    id: "commerce-features-to-dev",
    title: "Commerce Features to dev",
    summary:
      "ห้า PR หลังใช้ฝึกการรักษา branch ให้ตาม origin/dev ทันเมื่อ integration branch เปลี่ยนไปแล้วหลายรอบ",
    labs: LAB_ITEMS.slice(5),
  },
];

export const FEATURE_TO_DEV_FLOW_COMPLETION_POINTS = [
  "origin/dev ควรมีครบทั้ง auth, users, categories, products, inventory, carts, addresses, orders, payments และ reviews resources เมื่อจบ lab นี้",
  "ทั้ง 10 feature branches ควรผ่าน sequence เดียวกันคือ generate, commit, push, PR เข้า dev, rebase/update PR เดิม, แล้ว merge เข้า dev ตามคิว",
  "local dev ควรตาม origin/dev ทันตลอดด้วย git pull --ff-only หลังแต่ละ PR ถูก merge",
];

export const FEATURE_TO_DEV_FLOW_EXPECTED_LEARNING = [
  "เห็นภาพว่าทีมที่ใช้ dev เป็น shared integration branch จะวางคิว PR ของ 10 features ให้คุมง่ายได้อย่างไร",
  "ฝึกตั้ง PR base ให้ถูกตั้งแต่แรก และดูแล PR เดิมด้วย fetch, rebase origin/dev, และ force-with-lease บน feature branch ของตัวเอง",
  "เข้าใจว่าทำไมการแตกหลาย branch จาก dev baseline เดียวกันช่วยสอนเรื่อง queued PR และ branch maintenance ได้ชัด",
  "แยกให้ออกว่าคำสั่งไหนปลอดภัยบน feature branch ส่วนตัว และคำสั่งไหนไม่ควรใช้กับ shared branch อย่าง dev",
];
