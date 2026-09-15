export type GitHubRuleDetailItem = {
  title: string;
  description: string;
};

export type GitHubRuleItem = {
  id: string;
  title: string;
  summary: string;
  whyItMatters: string;
  whenToUse: string;
  watchOut: string;
  settings?: GitHubRuleDetailItem[];
  relatedRules?: GitHubRuleDetailItem[];
};

export type GitHubRulesSetupArea = {
  id: string;
  title: string;
  description: string;
};

export const GITHUB_RULES_ITEMS: GitHubRuleItem[] = [
  {
    id: "restrict-creations",
    title: "Restrict creations",
    summary:
      "จำกัดว่าใครบ้างที่สร้าง branch หรือ ref ที่อยู่ในกลุ่มสำคัญนี้ได้",
    whyItMatters:
      "ช่วยกันไม่ให้มีคนสร้าง branch อย่าง main, release/* หรือ hotfix/* ขึ้นมาแบบผิด flow จนทำให้ทีมสับสนว่า branch ไหนคือของจริง",
    whenToUse:
      "เหมาะกับ repository ที่มี branch สำคัญไม่กี่เส้นและต้องการให้เฉพาะ maintainers หรือ automation บางตัวเท่านั้นที่สร้างได้",
    watchOut:
      "ถ้าตั้งแคบเกินไป ทีมอาจสร้าง branch งานหรือ branch release ใหม่ไม่ได้ในช่วงฉุกเฉิน จึงควรเช็ก bypass list และ naming convention ให้สอดคล้องกันก่อน",
  },
  {
    id: "restrict-updates",
    title: "Restrict updates",
    summary:
      "จำกัดสิทธิ์การ push หรืออัปเดต branch เป้าหมายให้เหลือเฉพาะคนที่ได้รับอนุญาต",
    whyItMatters:
      "เป็นด่านแรกที่กันการเปลี่ยนแปลงตรงเข้า branch สำคัญ ทำให้ทีมบังคับใช้ PR flow หรือแยกสิทธิ์การปล่อยงานได้ชัดขึ้น",
    whenToUse:
      "ใช้กับ main, release/* หรือ production branch ที่ไม่ต้องการ direct push จากทุกคนในทีม แม้คนนั้นจะมีสิทธิ์เขียน repo ก็ตาม",
    watchOut:
      "ถ้า workflow ของทีมยังพึ่ง direct push สำหรับ bot หรือ release automation อยู่ ต้องเตรียม bypass list หรือ service account ให้พร้อม ไม่อย่างนั้น pipeline จะติด",
  },
  {
    id: "restrict-deletions",
    title: "Restrict deletions",
    summary:
      "ป้องกันไม่ให้ branch สำคัญถูกลบออกโดยไม่ตั้งใจหรือโดยผู้ใช้ทั่วไป",
    whyItMatters:
      "ช่วยรักษา branch ที่เป็นหลักฐานของ release, hotfix หรือ milestone สำคัญเอาไว้ ไม่ให้ประวัติหายเพราะกดลบผิดหรือ cleanup เกินจำเป็น",
    whenToUse:
      "เหมาะกับ branch ที่ทีมใช้ยาว เช่น main, develop, release/* หรือ branch ที่ผูกกับ deployment และ auditing",
    watchOut:
      "ถ้าทีมมี flow ที่สร้าง branch ชั่วคราวจำนวนมาก อย่าเผลอใช้ pattern กว้างเกินไป เพราะจะทำให้การ cleanup branch หลังจบงานทำได้ยาก",
  },
  {
    id: "require-linear-history",
    title: "Require linear history",
    summary:
      "บังคับให้ประวัติ commit เป็นเส้นตรงและไม่รับ merge commit แบบแตกแขนง",
    whyItMatters:
      "ช่วยให้ `git log`, `git bisect` และการไล่ย้อนหาปัญหาอ่านง่ายขึ้น เพราะแต่ละงานถูกเรียงต่อกันเป็นลำดับชัดเจน",
    whenToUse:
      "เหมาะกับทีมที่ใช้ squash merge หรือ rebase merge เป็นมาตรฐาน และต้องการให้ประวัติบน branch หลักสะอาดอ่านง่าย",
    watchOut:
      "ถ้าทีมยังต้องพึ่ง merge commit เพื่อเก็บ context ของ branch รวม หรือยังไม่ชินกับ rebase/squash policy การเปิดตัวเลือกนี้อาจชนกับ workflow เดิมทันที",
  },
  {
    id: "require-deployments-to-succeed",
    title: "Require deployments to succeed",
    summary:
      "รอให้ deployment environment ที่กำหนดผ่านก่อน จึงจะปล่อยให้ merge เข้า branch เป้าหมายได้",
    whyItMatters:
      "เชื่อมกติกาใน GitHub เข้ากับความพร้อมของระบบจริง ทำให้ branch สำคัญไม่รับโค้ดที่ยัง deploy ไปสภาพแวดล้อมตรวจสอบไม่ผ่าน",
    whenToUse:
      "เหมาะกับทีมที่มี staging, preview หรือ smoke-test deployment และอยากใช้ผลลัพธ์นั้นเป็นเงื่อนไขก่อนเข้า main หรือ release",
    watchOut:
      "ถ้า deployment job ช้า ไม่นิ่ง หรือมี false negative บ่อย ทีมจะรู้สึกว่า merge ติดคอขวดง่าย จึงควรแก้เสถียรภาพของ pipeline ก่อนบังคับใช้เต็มรูปแบบ",
  },
  {
    id: "require-signed-commits",
    title: "Require signed commits",
    summary:
      "บังคับให้ commit ทุกตัวมีลายเซ็นยืนยันตัวตนของผู้เขียน",
    whyItMatters:
      "เพิ่มความน่าเชื่อถือให้ประวัติการเปลี่ยนแปลง เพราะทีมตรวจสอบได้ว่า commit มาจาก key หรือ identity ที่เชื่อถือได้จริง",
    whenToUse:
      "เหมาะกับโปรเจกต์ที่มีข้อกำหนดด้าน compliance, security หรือมี contributor หลายกลุ่มและต้องการ audit trail ที่ชัดเจน",
    watchOut:
      "ถ้าสมาชิกทีมยังไม่ได้ตั้งค่า GPG/SSH signing ให้ครบ การเปิดใช้ทันทีจะทำให้ทุกคน push งานไม่ได้ ควรเตรียม onboarding และคู่มือ setup ก่อน",
  },
  {
    id: "require-a-pull-request-before-merging",
    title: "Require a pull request before merging",
    summary:
      "บังคับให้งานทุกชิ้นเข้าผ่าน Pull Request ก่อน merge เข้า branch สำคัญ",
    whyItMatters:
      "เปิดพื้นที่ให้ review, discussion, CI และการตรวจสอบผลกระทบเกิดขึ้นก่อนโค้ดเข้า branch หลัก ทำให้ทีมควบคุมคุณภาพและย้อนดูเหตุผลของการเปลี่ยนแปลงได้ง่าย",
    whenToUse:
      "ควรใช้กับ main, release/* และ branch ที่กระทบ deployment จริง โดยเฉพาะเมื่อมีหลายคนทำงานร่วมกันหรือมี policy เรื่อง approval ชัดเจน",
    watchOut:
      "ถ้าเปิด rule นี้แต่ไม่กำหนด reviewer, checks หรือ merge policy เพิ่มเติม PR อาจยังกลายเป็นเพียงพิธีกรรมที่ merge ได้เร็วเกินไปโดยไม่เพิ่มคุณภาพจริง",
    settings: [
      {
        title: "Required approvals",
        description:
          "กำหนดจำนวน reviewer ที่ต้อง approve ก่อน merge เช่น 1 หรือ 2 คน เพื่อให้ PR ไม่ผ่านด้วยสายตาคนเดียวตลอดเวลา",
      },
      {
        title: "Dismiss stale pull request approvals when new commits are pushed",
        description:
          "เมื่อมี commit ใหม่เข้ามา Approval เดิมจะถูกยกเลิก เพื่อบังคับให้ reviewer กลับมาตรวจ diff ล่าสุดอีกครั้งและลดความเสี่ยงจากการ approve คนละเวอร์ชัน",
      },
      {
        title: "Require review from specific teams",
        description:
          "ใช้เมื่อบางโฟลเดอร์หรือบางงานต้องผ่านทีมเฉพาะ เช่น platform, security หรือ frontend chapter ก่อน merge",
      },
      {
        title: "Require review from Code Owners",
        description:
          "ถ้า repository ใช้ `CODEOWNERS` ตัวเลือกนี้จะบังคับให้เจ้าของไฟล์หรือโมดูลนั้น approve เอง เหมาะมากกับโค้ดส่วนที่มีผู้ดูแลชัดเจน",
      },
      {
        title: "Require approval of the most recent reviewable push",
        description:
          "ช่วยให้ commit ล่าสุดใน PR ต้องได้รับการ approve จากคนอื่นอีกครั้ง ลดโอกาสที่คน push งานจะเติมโค้ดท้ายสุดแล้ว merge เลย",
      },
      {
        title: "Require conversation resolution before merging",
        description:
          "บังคับให้ทุก discussion ใน PR ถูก resolve ก่อน merge เพื่อไม่ให้ feedback สำคัญค้างอยู่ในสถานะยังไม่ได้ตอบหรือยังไม่ได้แก้",
      },
      {
        title: "Allowed merge methods",
        description:
          "กำหนดว่าจะอนุญาต `Merge`, `Squash` หรือ `Rebase` แบบใดบ้าง โดยควรเลือกให้สอดคล้องกับ policy เรื่อง linear history และรูปแบบประวัติที่ทีมต้องการ",
      },
    ],
    relatedRules: [
      {
        title: "Require status checks to pass",
        description:
          "มักเปิดคู่กันเพื่อให้ PR ไม่ใช่แค่ผ่านคน review แต่ต้องผ่าน CI, test และ checks ที่ทีมกำหนดก่อน merge ด้วย",
      },
      {
        title: "Require deployments to succeed",
        description:
          "เหมาะกับ branch ที่ต้องการความมั่นใจสูง เพราะนอกจาก review แล้ว ยังต้องยืนยันว่าการ deploy ไป environment ตรวจสอบผ่านจริงก่อนเข้า branch หลัก",
      },
    ],
  },
  {
    id: "require-status-checks-to-pass",
    title: "Require status checks to pass",
    summary:
      "บังคับให้ CI หรือ checks ที่เลือกไว้ต้องผ่านก่อน merge",
    whyItMatters:
      "กันโค้ดที่ build พัง, test ไม่ผ่าน หรือไม่ผ่าน quality gate ไม่ให้หลุดเข้ากิ่งหลัก แม้ reviewer จะเผลอไม่เห็นปัญหาก็ตาม",
    whenToUse:
      "ควรใช้เมื่อ repository มี workflow อัตโนมัติที่เสถียรแล้ว เช่น test, lint, typecheck, build หรือ custom validation ที่ทีมเชื่อถือ",
    watchOut:
      "อย่าเลือก checks ที่ไม่นิ่งหรือไม่จำเป็นมากเกินไป เพราะจะเพิ่มเวลาในการ merge และทำให้คนมองกฎนี้เป็นภาระแทนที่จะเป็น safety net",
  },
  {
    id: "block-force-pushes",
    title: "Block force pushes",
    summary:
      "ป้องกันการ force push ทับประวัติบน branch สำคัญ",
    whyItMatters:
      "ช่วยรักษาประวัติ commit และบริบทของการ review ไว้ครบ ลดความเสี่ยงที่ commit จะหายหรือ hash เปลี่ยนจนทีมตามสถานะงานไม่ทัน",
    whenToUse:
      "แทบควรใช้เสมอบน main, release/* และ branch ที่มีหลายคนอ้างอิงร่วมกัน เพราะ branch เหล่านี้ไม่ควรถูก rewrite ประวัติ",
    watchOut:
      "ถ้าทีมยังใช้ force push เพื่อเก็บประวัติบน shared branch อยู่ ควรปรับ workflow ให้ rebase เกิดบน branch ส่วนตัวก่อน ไม่ใช่แก้บน branch กลาง",
  },
  {
    id: "require-code-scanning-results",
    title: "Require code scanning results",
    summary:
      "บังคับให้ผลตรวจด้าน security จาก code scanning พร้อมก่อน merge",
    whyItMatters:
      "เพิ่มด่านเชิง security เข้าไปใน flow ปกติของทีม ทำให้ช่องโหว่ที่เครื่องมือตรวจพบถูกมองเห็นและจัดการก่อนโค้ดเข้ากิ่งสำคัญ",
    whenToUse:
      "เหมาะกับโปรเจกต์ที่เปิด GitHub Advanced Security หรือผูกเครื่องมือสแกนที่ส่งผลกลับมาใน PR ได้อย่างสม่ำเสมอ",
    watchOut:
      "ควรกำหนดระดับ severity และกระบวนการ triage ให้ชัด ไม่อย่างนั้น alert ปริมาณมากหรือ false positive จะทำให้ทีมเริ่ม ignore สัญญาณสำคัญ",
  },
  {
    id: "require-code-quality-results",
    title: "Require code quality results",
    summary:
      "บังคับให้ผลวิเคราะห์คุณภาพโค้ดพร้อมและผ่านเกณฑ์ก่อน merge",
    whyItMatters:
      "ช่วยคุมเรื่อง maintainability, complexity และมาตรฐานของโค้ดให้ถูกจับตั้งแต่ใน PR แทนที่จะรอสะสมเป็นหนี้เทคนิคภายหลัง",
    whenToUse:
      "เหมาะเมื่อทีมมี quality gate ชัดเจนจากเครื่องมืออย่าง static analysis, coverage policy หรือ platform คุณภาพโค้ดที่เชื่อมกับ GitHub",
    watchOut:
      "ถ้าเกณฑ์ยังไม่นิ่งหรือเคร่งเกินบริบทของโปรเจกต์ นักพัฒนาจะเสียเวลากับการไล่ผ่าน metric มากกว่าการแก้ปัญหาของผู้ใช้จริง",
  },
  {
    id: "automatically-request-copilot-code-review",
    title: "Automatically request Copilot code review",
    summary:
      "ให้ GitHub เรียก Copilot code review อัตโนมัติเมื่อมี Pull Request ใหม่",
    whyItMatters:
      "ช่วยเพิ่ม feedback รอบแรกอย่างรวดเร็ว โดยเฉพาะ PR ที่ reviewer คนจริงยังไม่ว่าง ทำให้ผู้เขียนได้เห็นประเด็นเบื้องต้นเร็วขึ้น",
    whenToUse:
      "เหมาะเป็นชั้นเสริมในทีมที่เปิดใช้ GitHub Copilot และต้องการลดเวลารอ feedback เบื้องต้นก่อนมนุษย์เข้ามารีวิว",
    watchOut:
      "ไม่ควรมองว่าแทน review ของคนได้ทั้งหมด เพราะ Copilot อาจพลาดบริบททางธุรกิจ, architecture หรือข้อกำหนดภายในทีมที่ไม่ได้อยู่ใน diff",
  },
];

export const GITHUB_RULES_SETUP_AREAS: GitHubRulesSetupArea[] = [
  {
    id: "bypass-list",
    title: "Bypass list",
    description:
      "ใช้กำหนดว่า role, team, app หรือ agent ใดบ้างที่ข้าม ruleset นี้ได้ เพื่อเปิดทางให้ผู้ดูแลระบบหรือ automation ที่จำเป็นทำงานต่อได้โดยไม่ติดกติกาทุกข้อ",
  },
  {
    id: "target-branches",
    title: "Target branches",
    description:
      "ใช้เลือกว่ากติกาชุดนี้จะมีผลกับ branch กลุ่มไหน เช่น main, release/* หรือ hotfix/* เพื่อให้แต่ละกิ่งได้รับระดับการปกป้องที่เหมาะกับหน้าที่ของมัน",
  },
];
