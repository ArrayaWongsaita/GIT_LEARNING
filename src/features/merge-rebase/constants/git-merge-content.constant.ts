export type GitMergeCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitMergeLabCommand = {
  command: string;
  description: string;
};

export type GitMergeLabDifficulty = "Starter" | "Practice" | "Challenge";

export type GitMergeLab = {
  id: string;
  title: string;
  summary: string;
  difficulty: GitMergeLabDifficulty;
  focus: string;
  task: string;
  commands: GitMergeLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitMergeLabSection = {
  id: string;
  title: string;
  summary: string;
  workspace: string;
  focusFiles: string[];
  labs: GitMergeLab[];
};

export const GIT_MERGE_COMMAND_DOCS: GitMergeCommandDoc[] = [
  {
    id: "merge-default",
    title: "merge แบบปกติ",
    purpose: "รวมงานจาก branch ต้นทางเข้ามายัง branch ปัจจุบัน",
    command: "git merge <branch-name>",
    description:
      "ใช้รวม branch เช่น git merge feature/login โดย Git จะ fast-forward ให้เองถ้าทำได้",
  },
  {
    id: "merge-ff-only",
    title: "บังคับให้เป็น fast-forward เท่านั้น",
    purpose: "ป้องกันการสร้าง merge commit โดยไม่ตั้งใจ",
    command: "git merge --ff-only <branch-name>",
    description:
      "สำเร็จเฉพาะกรณีที่ main เป็น ancestor ของ branch ต้นทาง ถ้าไม่ใช่จะ abort ทันที",
  },
  {
    id: "merge-no-ff",
    title: "บังคับสร้าง merge commit",
    purpose: "เก็บจุดรวมงานให้เห็นชัดในประวัติแม้ fast-forward ได้",
    command: "git merge --no-ff <branch-name>",
    description:
      "เหมาะเมื่อทีมต้องการเห็น boundary ของการรวม feature แต่ละครั้งใน graph",
  },
  {
    id: "merge-squash",
    title: "รวมหลาย commit ให้เหลือ commit เดียว",
    purpose: "ทำประวัติ main ให้อ่านง่ายด้วย commit สรุปเดียว",
    command: "git merge --squash <branch-name>",
    description:
      "รวม diff จาก branch ต้นทางเป็นก้อนเดียวก่อน commit บน branch ปัจจุบัน",
    notes: [
      "ใน Git จริง --squash จะไม่สร้าง merge commit อัตโนมัติ ต้อง commit เองต่อ",
      "ถ้าต้องถอยกลับก่อน commit ให้ใช้ reset หรือ restore แทน เพราะ --squash ไม่ได้ตั้ง MERGE_HEAD เหมือน merge ปกติ",
    ],
  },
  {
    id: "squash-cancel",
    title: "ยกเลิกผลของ --squash ก่อน commit",
    purpose: "ย้อน index และ working tree กลับก่อนเริ่ม squash merge",
    command: "git reset --hard HEAD",
    description:
      "ใช้ล้างการเปลี่ยนแปลงที่ถูก stage จาก git merge --squash แล้วกลับไปยังสถานะของ HEAD ปัจจุบัน",
    notes: [
      "ใช้เมื่อเริ่มจาก working tree ที่ clean และยังไม่ได้ commit summary commit",
      "`git merge --abort` ไม่ใช่คำตอบหลักหลัง squash สำเร็จแล้ว เพราะ Git ไม่ได้เก็บ MERGE_HEAD ไว้ใน flow นี้",
    ],
  },
  {
    id: "merge-abort",
    title: "ยกเลิก merge ที่ค้างอยู่",
    purpose: "ย้อนสถานะก่อนเริ่ม merge เมื่อเจอ conflict แล้วต้องหยุด",
    command: "git merge --abort",
    description:
      "ใช้ยกเลิก merge ที่กำลังค้าง (เช่นมี conflict) แล้วกลับไปยังสถานะก่อนเริ่ม merge",
    notes: [
      "`git merge --abort` ใช้ได้เมื่อมีสถานะ MERGE_HEAD เท่านั้น",
    ],
  },
  {
    id: "status-check",
    title: "เช็กสถานะก่อน merge",
    purpose: "ลดโอกาสชนกับไฟล์ค้างระหว่าง merge",
    command: "git status",
    description:
      "ควรให้ working tree clean ก่อน merge ทุกครั้ง โดยเฉพาะก่อนใช้ --squash",
  },
  {
    id: "log-check",
    title: "ตรวจ graph หลัง merge",
    purpose: "ยืนยันว่า pointer ของ branch ขยับตามที่ตั้งใจ",
    command: "git log --oneline --graph --decorate --all",
    description:
      "ใช้ตรวจรูปแบบประวัติว่าเป็น ff-only, no-ff หรือ squash ตาม workflow ทีม",
  },
];

export const GIT_MERGE_SAFETY_NOTES: string[] = [
  "merge บน branch เป้าหมายให้ถูกก่อนเสมอ (เช่น main หรือ release)",
  "ใช้ `git status` ให้แน่ใจว่าไม่มีไฟล์ค้างก่อน merge",
  "ถ้า merge ค้างเพราะ conflict และยังไม่อยากแก้ต่อ ให้ใช้ `git merge --abort` เพื่อย้อนสถานะ",
  "ถ้า `git merge --squash` apply แล้วแต่ยังไม่ commit และต้องการยกเลิก ให้ใช้ `git reset --hard HEAD` แทน `git merge --abort`",
  "`--ff-only` เหมาะกับทีมที่ต้องการบังคับ linear history",
  "`--no-ff` ช่วยเก็บจุดรวมงานให้ trace ย้อนหลังง่าย",
  "`--squash` ทำให้ประวัติสะอาดขึ้น แต่จะไม่พก metadata ของ merge commit",
];

export const GIT_MERGE_LAB_SECTIONS: GitMergeLabSection[] = [
  {
    id: "repo-1-frontend-config-linear-merges",
    title: "Repo 1: Frontend Config Linear Merges",
    summary:
      "ฝึก merge แบบเส้นตรงใน sandbox แยกต่างหาก โดยโฟกัสไฟล์ config ฝั่ง frontend ที่เจอบ่อยในงานจริง",
    workspace: "merge-frontend-config-lab",
    focusFiles: ["package.json", "vite.config.ts", ".env.example"],
    labs: [
      {
        id: "repo-1-frontend-config-linear-merges-1",
        title: "Lab 1: Bootstrap frontend config sandbox",
        summary: "สร้าง repo ใหม่พร้อม package.json และ vite.config.ts เป็นฐานของการฝึก",
        difficulty: "Starter",
        focus: "Repo Setup",
        task: "เตรียม sandbox แรกสำหรับลอง merge แบบ linear โดยใช้ config file ฝั่ง frontend แทน source code ทั่วไป",
        commands: [
          {
            command: "mkdir merge-frontend-config-lab",
            description: "สร้าง sandbox repo สำหรับฝึก merge config ฝั่ง frontend",
          },
          {
            command: "cd merge-frontend-config-lab",
            description: "ย้ายเข้า sandbox repo แรก",
          },
          {
            command: "git init -b main",
            description: "เริ่ม repository และกำหนด branch หลักเป็น main",
          },
          {
            command: "echo '{\"name\":\"merge-frontend-config-lab\",\"private\":true}' > package.json",
            description: "สร้าง package.json แบบง่ายเพื่อใช้เป็น config หลักของ repo นี้",
          },
          {
            command: "echo 'export default { server: { port: 5173 } }' > vite.config.ts",
            description: "สร้าง vite.config.ts ตั้งต้นสำหรับทดลองแก้ค่า config",
          },
          {
            command: "git add package.json vite.config.ts",
            description: "stage config files ทั้งสองไฟล์",
          },
          {
            command: "git commit -m \"chore: bootstrap frontend config\"",
            description: "สร้าง base commit ของ sandbox frontend",
          },
        ],
        checkpoint: "repo แรกควรอยู่บน main และมี config files ตั้งต้นพร้อม merge flow",
      },
      {
        id: "repo-1-frontend-config-linear-merges-2",
        title: "Lab 2: Add Vite alias on a feature branch",
        summary: "สร้าง feature/vite-alias แล้วแก้ vite.config.ts เพื่อจำลอง config change จริง",
        difficulty: "Starter",
        focus: "Feature Config",
        task: "สร้าง branch ใหม่สำหรับเปลี่ยนค่า Vite alias แล้วเตรียมปลายทางให้ ff-only merge ได้",
        commands: [
          {
            command: "git switch -c feature/vite-alias",
            description: "สร้าง branch งานสำหรับแก้ Vite alias",
          },
          {
            command: "echo 'export default { resolve: { alias: { app: \"./src\" } } }' > vite.config.ts",
            description: "แก้ vite.config.ts ให้มี alias เพื่อสร้าง config diff บน branch",
          },
          {
            command: "git add vite.config.ts",
            description: "stage ไฟล์ vite.config.ts ที่แก้แล้ว",
          },
          {
            command: "git commit -m \"build(vite): add app alias\"",
            description: "commit การเปลี่ยนแปลง config บน feature/vite-alias",
          },
        ],
        checkpoint: "feature/vite-alias ควรนำหน้า main อยู่ 1 commit และพร้อมถูก fast-forward",
      },
      {
        id: "repo-1-frontend-config-linear-merges-3",
        title: "Lab 3: Merge Vite config with ff-only",
        summary: "รวม feature/vite-alias กลับเข้า main โดยห้ามสร้าง merge commit",
        difficulty: "Practice",
        focus: "FF-only Merge",
        task: "ย้ายกลับ main แล้วใช้ ff-only เพื่อบังคับให้ Git ยอม merge เฉพาะกรณีที่ประวัติยังเป็นเส้นตรง",
        commands: [
          {
            command: "git switch main",
            description: "กลับมาที่ branch เป้าหมายก่อน merge",
          },
          {
            command: "git merge --ff-only feature/vite-alias",
            description: "ขยับ main ไปที่ปลายของ feature/vite-alias แบบไม่สร้าง merge commit",
          },
        ],
        checkpoint: "main ควรตามทัน feature/vite-alias โดยไม่มี merge commit ใหม่บน history",
      },
      {
        id: "repo-1-frontend-config-linear-merges-4",
        title: "Lab 4: Build the env template branch",
        summary: "สร้าง feature/env-template เพื่อเพิ่มไฟล์ .env.example เป็น config อีกประเภท",
        difficulty: "Practice",
        focus: "Env Config",
        task: "แยกอีก branch สำหรับเพิ่ม template environment file เพื่อฝึก default merge บน repo เดิม",
        commands: [
          {
            command: "git switch -c feature/env-template",
            description: "สร้าง branch ใหม่จาก main หลัง ff-only merge รอบแรก",
          },
          {
            command: "echo 'VITE_API_URL=https://api.example.com' > .env.example",
            description: "สร้างไฟล์ .env.example เพื่อจำลอง config ฝั่ง environment",
          },
          {
            command: "git add .env.example",
            description: "stage ไฟล์ env template",
          },
          {
            command: "git commit -m \"chore(env): add example env file\"",
            description: "commit งานบน feature/env-template",
          },
        ],
        checkpoint: "feature/env-template ควรมี commit ใหม่และพร้อม merge กลับเข้า main",
      },
      {
        id: "repo-1-frontend-config-linear-merges-5",
        title: "Lab 5: Merge env config with plain merge",
        summary: "รวม feature/env-template ด้วย git merge แบบปกติเพื่อดูว่า Git fast-forward ให้เองได้",
        difficulty: "Practice",
        focus: "Default Merge",
        task: "ทดสอบ plain merge บน history ที่ยังไม่ diverge เพื่อให้เห็นว่า default merge ก็ยัง linear ได้",
        commands: [
          {
            command: "git switch main",
            description: "กลับมาที่ main ก่อน merge env template",
          },
          {
            command: "git merge feature/env-template",
            description: "รัน merge แบบปกติและปล่อยให้ Git fast-forward ให้เอง",
          },
        ],
        checkpoint: "main ควรตามทัน feature/env-template โดยยังไม่มี merge commit เกิดขึ้น",
      },
      {
        id: "repo-1-frontend-config-linear-merges-6",
        title: "Lab 6: Verify the frontend config graph",
        summary: "ตรวจ graph เพื่อยืนยันว่าการ merge ทั้งสองรอบใน repo แรกยังเป็นเส้นตรง",
        difficulty: "Practice",
        focus: "History Check",
        task: "ดู history รวมของ repo แรกแล้วเช็กว่า ff-only และ plain merge รอบนี้ยังไม่สร้าง boundary ใหม่",
        commands: [
          {
            command: "git log --oneline --graph --decorate --all",
            description: "ตรวจ commit graph หลัง merge config ทั้งสอง branch",
          },
        ],
        checkpoint: "history ของ repo แรกควรยัง linear และไม่มี merge commit ทั้งสำหรับ alias และ env template",
      },
    ],
  },
  {
    id: "repo-2-release-deploy-history-control",
    title: "Repo 2: Release and Deploy Config History Control",
    summary:
      "ฝึกควบคุมประวัติใน repo ที่มี deploy และ release configs เพื่อแยกความต่างระหว่าง no-ff กับ squash merge ให้ชัด",
    workspace: "merge-release-config-lab",
    focusFiles: ["Dockerfile", "docker-compose.yml", ".github/workflows/deploy.yml", "nginx.conf"],
    labs: [
      {
        id: "repo-2-release-deploy-history-control-7",
        title: "Lab 7: Bootstrap release config sandbox",
        summary: "สร้าง repo ใหม่สำหรับฝึก merge บน Docker และ deploy-related configs",
        difficulty: "Starter",
        focus: "Repo Setup",
        task: "เริ่ม sandbox repo ที่สองเพื่อฝึก merge แบบเก็บ boundary และสรุป commit ในบริบท release/deploy",
        commands: [
          {
            command: "cd ..",
            description: "ออกจาก repo แรกก่อนเริ่ม sandbox ใหม่",
          },
          {
            command: "mkdir merge-release-config-lab",
            description: "สร้าง sandbox repo สำหรับ release และ deploy configs",
          },
          {
            command: "cd merge-release-config-lab",
            description: "ย้ายเข้า sandbox repo ที่สอง",
          },
          {
            command: "git init -b main",
            description: "เริ่ม repository ใหม่โดยใช้ main เป็น branch หลัก",
          },
          {
            command: "echo 'FROM node:20-alpine' > Dockerfile",
            description: "สร้าง Dockerfile ตั้งต้นของแอป",
          },
          {
            command: "echo 'services: app' > docker-compose.yml",
            description: "สร้าง docker-compose.yml แบบย่อสำหรับจำลอง config deploy",
          },
          {
            command: "echo 'server_name release.local;' > nginx.conf",
            description: "สร้าง nginx.conf ตั้งต้นไว้สำหรับอัปเดตรอบหลัง",
          },
          {
            command: "git add Dockerfile docker-compose.yml nginx.conf",
            description: "stage release config files ตั้งต้นทั้งหมด",
          },
          {
            command: "git commit -m \"chore: bootstrap release config repo\"",
            description: "สร้าง base commit ของ repo ที่สอง",
          },
        ],
        checkpoint: "repo ที่สองควรพร้อมใช้งานบน main และมี Dockerfile, docker-compose.yml, nginx.conf แล้ว",
      },
      {
        id: "repo-2-release-deploy-history-control-8",
        title: "Lab 8: Prepare release-profile branch",
        summary: "สร้าง feature/release-profile แล้วแก้ docker-compose.yml เพื่อสร้าง config diff",
        difficulty: "Practice",
        focus: "Release Config",
        task: "แยก branch สำหรับเปลี่ยนค่า release profile ใน compose file เพื่อเตรียมทดสอบ --no-ff",
        commands: [
          {
            command: "git switch -c feature/release-profile",
            description: "สร้าง branch สำหรับแก้ docker-compose.yml",
          },
          {
            command: "echo 'services: app-release-profile' > docker-compose.yml",
            description: "ปรับ compose config เพื่อจำลอง release profile ที่ต่างจาก main",
          },
          {
            command: "git add docker-compose.yml",
            description: "stage docker-compose.yml ที่แก้แล้ว",
          },
          {
            command: "git commit -m \"build(compose): add release profile\"",
            description: "commit การเปลี่ยน release profile บน branch",
          },
        ],
        checkpoint: "feature/release-profile ควรพร้อม merge กลับเข้า main พร้อม config diff ที่ชัดเจน",
      },
      {
        id: "repo-2-release-deploy-history-control-9",
        title: "Lab 9: Merge release-profile with --no-ff",
        summary: "บังคับให้ main เก็บ merge commit ของ release-profile แม้ fast-forward จะทำได้",
        difficulty: "Practice",
        focus: "No-FF Merge",
        task: "ทดลอง merge ใน workflow ที่อยากเก็บ boundary ของ release change ไว้ชัดเจนใน graph",
        commands: [
          {
            command: "git switch main",
            description: "กลับมาที่ main ก่อน merge release-profile",
          },
          {
            command: "git merge --no-ff feature/release-profile",
            description: "บังคับสร้าง merge commit สำหรับ branch นี้",
          },
        ],
        checkpoint: "main ควรได้ merge commit ใหม่ที่แสดง boundary ของ feature/release-profile",
      },
      {
        id: "repo-2-release-deploy-history-control-10",
        title: "Lab 10: Inspect the release merge boundary",
        summary: "ดู graph หลัง --no-ff เพื่อยืนยันว่า merge boundary ของ release config ถูกเก็บไว้",
        difficulty: "Practice",
        focus: "Graph Review",
        task: "ตรวจประวัติหลัง no-ff merge แล้วสังเกตว่าทีมจะ trace การรวม release config ย้อนหลังได้ง่ายขึ้นอย่างไร",
        commands: [
          {
            command: "git log --oneline --graph --decorate --all",
            description: "ตรวจ graph หลัง no-ff merge ของ release-profile",
          },
        ],
        checkpoint: "ควรเห็น merge commit ใหม่บน main ที่เป็นจุดรวม release-profile อย่างชัดเจน",
      },
      {
        id: "repo-2-release-deploy-history-control-11",
        title: "Lab 11: Prepare deploy workflow for squash",
        summary: "สร้าง feature/deploy-workflow พร้อมสอง commits เพื่อเตรียมรวมแบบ squash",
        difficulty: "Challenge",
        focus: "Squash Setup",
        task: "จำลอง branch deploy ที่มีหลาย commit ย่อย ทั้ง workflow file และ nginx config เพื่อสรุปรวมทีเดียวบน main",
        commands: [
          {
            command: "git switch -c feature/deploy-workflow",
            description: "สร้าง branch ใหม่สำหรับ deploy workflow changes",
          },
          {
            command: "mkdir .github",
            description: "สร้างโฟลเดอร์ .github สำหรับ workflow",
          },
          {
            command: "mkdir .github/workflows",
            description: "สร้างโฟลเดอร์ workflows ภายใต้ .github",
          },
          {
            command: "echo 'name: deploy' > .github/workflows/deploy.yml",
            description: "เพิ่ม deploy workflow file เป็น commit แรก",
          },
          {
            command: "git add .github/workflows/deploy.yml",
            description: "stage deploy workflow",
          },
          {
            command: "git commit -m \"ci: add deploy workflow\"",
            description: "commit แรกของ feature/deploy-workflow",
          },
          {
            command: "echo 'server_name deploy.example.com;' > nginx.conf",
            description: "อัปเดต nginx.conf เป็น commit ที่สองบน branch เดียวกัน",
          },
          {
            command: "git add nginx.conf",
            description: "stage nginx.conf ที่อัปเดตแล้ว",
          },
          {
            command: "git commit -m \"ops(nginx): update deploy server name\"",
            description: "commit ที่สองเพื่อให้ branch นี้มีหลายจุดก่อน squash",
          },
        ],
        checkpoint: "feature/deploy-workflow ควรมี 2 commits พร้อมถูกสรุปรวมด้วย squash merge",
      },
      {
        id: "repo-2-release-deploy-history-control-12",
        title: "Lab 12: Squash deploy workflow into one commit",
        summary: "รวม feature/deploy-workflow แบบ squash แล้วตรวจว่าบน main เหลือ commit summary เดียว",
        difficulty: "Challenge",
        focus: "Squash Merge",
        task: "สรุปงาน deploy หลาย commit ให้เหลือ commit เดียวบน main เพื่อทำ history ให้อ่านง่ายขึ้น",
        commands: [
          {
            command: "git switch main",
            description: "กลับมาที่ main ก่อนสรุปงาน deploy",
          },
          {
            command: "git merge --squash feature/deploy-workflow",
            description: "รวม diff ทั้งก้อนของ deploy branch เข้ามาใน staging area",
          },
          {
            command: "git commit -m \"ops: squash merge deploy workflow config\"",
            description: "สร้าง summary commit เดียวบน main",
          },
          {
            command: "git log --oneline --graph --decorate --all",
            description: "ตรวจว่า main มี summary commit เดียวแทนสอง commit เดิมของ deploy-workflow",
          },
        ],
        checkpoint: "main ควรมี commit summary เดียวสำหรับ deploy-workflow และ branch เดิมยังเก็บ commits ย่อยไว้",
        notes: [
          "`git merge --squash` จะไม่สร้าง merge commit อัตโนมัติ ต้อง commit ต่อเองบน branch ปัจจุบัน",
          "ถ้ายังไม่อยากเก็บ summary commit นี้ ให้ย้อนกลับได้ด้วย `git reset --hard HEAD` ขณะยังไม่ได้ commit",
        ],
      },
    ],
  },
  {
    id: "repo-3-conflict-abort-config-files",
    title: "Repo 3: Conflict and Abort on Config Files",
    summary:
      "ฝึก merge conflict บนไฟล์ config จริง เช่น tsconfig และ workflow file แล้วออกจากสถานะค้างอย่างปลอดภัยด้วย --abort",
    workspace: "merge-conflict-config-lab",
    focusFiles: ["tsconfig.json", ".github/workflows/ci.yml", "app.config.json"],
    labs: [
      {
        id: "repo-3-conflict-abort-config-files-13",
        title: "Lab 13: Bootstrap conflict config sandbox",
        summary: "สร้าง repo ใหม่พร้อม tsconfig, CI workflow, และ app config เพื่อใช้จำลอง conflict",
        difficulty: "Starter",
        focus: "Repo Setup",
        task: "เริ่ม sandbox repo ที่สามสำหรับฝึก conflict โดยใช้ไฟล์ config ที่ merge แล้วมีโอกาสชนกันจริง",
        commands: [
          {
            command: "cd ..",
            description: "ออกจาก repo ที่สองก่อนเริ่ม sandbox ใหม่",
          },
          {
            command: "mkdir merge-conflict-config-lab",
            description: "สร้าง sandbox repo สำหรับฝึก conflict และ abort",
          },
          {
            command: "cd merge-conflict-config-lab",
            description: "ย้ายเข้า sandbox repo ที่สาม",
          },
          {
            command: "git init -b main",
            description: "เริ่ม repository ใหม่บน main",
          },
          {
            command: "mkdir .github",
            description: "สร้างโฟลเดอร์ .github สำหรับ CI config",
          },
          {
            command: "mkdir .github/workflows",
            description: "สร้างโฟลเดอร์ workflows ภายใต้ .github",
          },
          {
            command: "echo '{\"compilerOptions\":{\"strict\":false,\"module\":\"ESNext\"}}' > tsconfig.json",
            description: "สร้าง tsconfig ตั้งต้นที่ทั้งสองฝั่งจะมาแก้ชนกันในภายหลัง",
          },
          {
            command: "echo 'name: ci' > .github/workflows/ci.yml",
            description: "เพิ่ม workflow file ตั้งต้นสำหรับ sandbox นี้",
          },
          {
            command: "echo '{\"mode\":\"safe\"}' > app.config.json",
            description: "เพิ่ม app config อีกไฟล์เพื่อให้ repo นี้เหมือนระบบจริงมากขึ้น",
          },
          {
            command: "git add tsconfig.json .github/workflows/ci.yml app.config.json",
            description: "stage config files เริ่มต้นทั้งหมด",
          },
          {
            command: "git commit -m \"chore: bootstrap conflict config repo\"",
            description: "สร้าง base commit ของ repo conflict",
          },
        ],
        checkpoint: "repo ที่สามควรพร้อมใช้งานบน main พร้อม tsconfig, ci workflow, และ app config",
      },
      {
        id: "repo-3-conflict-abort-config-files-14",
        title: "Lab 14: Create the strict-mode branch",
        summary: "สร้าง feature/strict-mode แล้วแก้ tsconfig.json ฝั่ง branch",
        difficulty: "Practice",
        focus: "Branch-side Change",
        task: "สร้าง branch ที่เพิ่ม strict mode เพื่อเป็นฝั่งแรกของ conflict scenario",
        commands: [
          {
            command: "git switch -c feature/strict-mode",
            description: "สร้าง branch feature/strict-mode จาก main",
          },
          {
            command: "echo '{\"compilerOptions\":{\"strict\":true,\"module\":\"ESNext\"}}' > tsconfig.json",
            description: "แก้ tsconfig.json ฝั่ง branch ให้เปิด strict mode",
          },
          {
            command: "git add tsconfig.json",
            description: "stage tsconfig.json ฝั่ง branch",
          },
          {
            command: "git commit -m \"build(tsconfig): enable strict mode\"",
            description: "commit การเปลี่ยนแปลงฝั่ง strict-mode",
          },
        ],
        checkpoint: "feature/strict-mode ควรมี commit ใหม่ที่แก้ tsconfig.json เรียบร้อย",
      },
      {
        id: "repo-3-conflict-abort-config-files-15",
        title: "Lab 15: Make a conflicting main-side edit",
        summary: "กลับไป main แล้วแก้ tsconfig.json บรรทัดเดียวกันคนละแบบเพื่อเตรียม conflict",
        difficulty: "Challenge",
        focus: "Main-side Divergence",
        task: "สร้าง divergence บน main โดยแก้ tsconfig.json คนละค่ากับ branch เพื่อให้ merge รอบถัดไปชนกันแน่",
        commands: [
          {
            command: "git switch main",
            description: "กลับมาที่ main เพื่อสร้างคู่ขัดแย้งอีกฝั่ง",
          },
          {
            command: "echo '{\"compilerOptions\":{\"strict\":false,\"module\":\"CommonJS\"}}' > tsconfig.json",
            description: "แก้ tsconfig.json ฝั่ง main คนละแบบกับ strict-mode branch",
          },
          {
            command: "git add tsconfig.json",
            description: "stage tsconfig.json ฝั่ง main",
          },
          {
            command: "git commit -m \"build(tsconfig): switch module target on main\"",
            description: "commit ฝั่ง main เพื่อสร้าง conflict กับ branch strict-mode",
          },
        ],
        checkpoint: "ตอนนี้ main และ feature/strict-mode ควรแก้ tsconfig.json จาก base เดียวกันคนละแบบ",
      },
      {
        id: "repo-3-conflict-abort-config-files-16",
        title: "Lab 16: Start the conflicted merge",
        summary: "เริ่ม merge feature/strict-mode แล้วตรวจสถานะ conflict ด้วย git status",
        difficulty: "Challenge",
        focus: "Conflict Detection",
        task: "รัน merge ที่คาดว่าจะชนกัน แล้วอ่านสถานะของ working tree ให้เป็นก่อนตัดสินใจแก้หรือ abort",
        commands: [
          {
            command: "git merge feature/strict-mode",
            description: "เริ่ม merge ฝั่ง branch strict-mode เข้าสู่ main ซึ่งควรชนกับ tsconfig.json",
          },
          {
            command: "git status",
            description: "ตรวจสถานะ conflict และยืนยันว่า repo อยู่ใน merge in progress",
          },
        ],
        checkpoint: "working tree ควรอยู่ในสถานะ conflicted merge และพร้อมให้ตัดสินใจ abort",
      },
      {
        id: "repo-3-conflict-abort-config-files-17",
        title: "Lab 17: Abort and verify recovery",
        summary: "ย้อนกลับจาก merge ที่ค้างด้วย --abort แล้วเช็กว่า working tree กลับมาสะอาด",
        difficulty: "Challenge",
        focus: "Abort Recovery",
        task: "กู้คืน repo จาก conflict ที่ยังไม่พร้อมแก้ และยืนยันว่ากลับไปสถานะก่อนเริ่ม merge ได้จริง",
        commands: [
          {
            command: "git merge --abort",
            description: "ยกเลิก merge ที่ค้างและย้อนสถานะกลับก่อนเริ่ม merge",
          },
          {
            command: "git status",
            description: "เช็กว่า working tree กลับมาสะอาดและไม่มี merge ค้างแล้ว",
          },
        ],
        checkpoint: "หลัง abort แล้ว repo ควรกลับสู่สถานะปกติบน main โดยไม่มีไฟล์ conflicted ค้างอยู่",
        notes: [
          "`git merge --abort` ใช้ได้เมื่อ merge ยังอยู่ในสถานะค้างเท่านั้น",
        ],
      },
      {
        id: "repo-3-conflict-abort-config-files-18",
        title: "Lab 18: Clean up all merge sandboxes",
        summary: "ออกจาก repo สุดท้ายแล้วลบ sandbox ทั้ง 3 ชุดอย่างปลอดภัย",
        difficulty: "Challenge",
        focus: "Cleanup",
        task: "จบชุดฝึกทั้งหมดด้วยการลบ sandbox repos ออกจากเครื่องให้เรียบร้อยหลังแน่ใจว่า path ถูกต้อง",
        commands: [
          {
            command: "cd ..",
            description: "ออกจาก merge-conflict-config-lab กลับไปยังโฟลเดอร์แม่",
          },
          {
            command: "rm -rf merge-conflict-config-lab",
            description: "ลบ sandbox conflict repo",
          },
          {
            command: "rm -rf merge-release-config-lab",
            description: "ลบ sandbox release/deploy repo",
          },
          {
            command: "rm -rf merge-frontend-config-lab",
            description: "ลบ sandbox frontend config repo",
          },
        ],
        checkpoint: "ทั้ง 3 sandbox folders ควรถูกลบเรียบร้อย และไม่เหลือ repo ทดลองค้างในโฟลเดอร์แม่",
        notes: [
          "ตรวจ path ให้ถูกต้องก่อนรัน rm -rf ทุกครั้ง",
        ],
      },
    ],
  },
];

export const GIT_MERGE_FAST_FORWARD_FLOW_LABS: GitMergeLab[] =
  GIT_MERGE_LAB_SECTIONS[0]?.labs.slice(0, 3) ?? [];

export const GIT_MERGE_SQUASH_FLOW_LABS: GitMergeLab[] =
  GIT_MERGE_LAB_SECTIONS[1]?.labs.slice(4, 6) ?? [];
