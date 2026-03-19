export type GitFetchCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitFetchLabCommand = {
  command: string;
  description: string;
};

export type GitFetchLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitFetchLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitFetchScenarioName =
  | "update-tracking-ref"
  | "fetch-feature-branch";

export const GIT_FETCH_COMMAND_DOCS: GitFetchCommandDoc[] = [
  {
    id: "fetch-origin",
    title: "Fetch จาก remote หลัก",
    purpose: "อัปเดตข้อมูลล่าสุดจาก origin โดยยังไม่แตะ branch ปัจจุบัน",
    command: "git fetch origin",
    description:
      "ดึง commit และ refs ล่าสุดจาก remote มาเก็บใน remote-tracking branches เช่น origin/main โดยยังไม่ merge หรือ rebase ให้เอง",
  },
  {
    id: "fetch-main",
    title: "Fetch เฉพาะ main",
    purpose: "อัปเดตข้อมูลของ branch หลักเท่านั้น",
    command: "git fetch origin main",
    description:
      "เหมาะเมื่อคุณต้องการเช็กความต่างของ main ก่อนจะเลือก merge หรือ rebase เองในขั้นถัดไป",
    notes: [
      "หลัง fetch เสร็จให้ดูความเปลี่ยนแปลงที่ origin/main แทน ไม่ใช่คิดว่า local main ถูกอัปเดตแล้ว",
    ],
  },
  {
    id: "fetch-all-prune",
    title: "Fetch ทุก remote พร้อมลบ refs เก่า",
    purpose: "ซิงก์ข้อมูล remote หลายตัวและเก็บ tracking refs ให้สะอาด",
    command: "git fetch --all --prune",
    description:
      "เหมาะกับเครื่องที่มีหลาย remotes หรือมี branches ถูกลบบน server แล้วต้องการเก็บรายการ tracking branches ให้ตรงกับของจริง",
  },
  {
    id: "fetch-feature-branch",
    title: "Fetch remote feature branch",
    purpose: "ดึง branch งานของเพื่อนร่วมทีมเข้ามาดูหรือใช้ต่อ",
    command: "git fetch origin feature/my-branch",
    description:
      "ช่วยให้คุณเห็น commit ล่าสุดของ feature branch บน remote โดยยังไม่ต้อง checkout หรือรวมเข้ากับ branch ปัจจุบันทันที",
  },
  {
    id: "fetch-and-inspect",
    title: "Fetch แล้วตรวจ history ต่อทันที",
    purpose: "ยืนยันผลหลัง fetch ว่า tracking refs ขยับจริง",
    command: "git fetch origin && git log --oneline --graph --decorate --all -n 10",
    description:
      "เหมาะเมื่อคุณต้องการเห็นภาพรวมของ local branches และ origin/* หลังดึงข้อมูลเสร็จ เพื่อค่อยตัดสินใจว่าจะ integrate แบบไหน",
  },
];

export const GIT_FETCH_SAFETY_NOTES: string[] = [
  "git fetch ไม่แก้ working tree และไม่เปลี่ยนไฟล์ใน branch ปัจจุบันให้เอง",
  "git fetch ไม่ merge หรือ rebase ให้โดยอัตโนมัติ คุณต้องเลือกวิธี integrate ต่อเอง",
  "หลัง fetch ให้ดู origin/<branch> หรือใช้ git branch -r เพื่อเช็กว่า remote-tracking refs ขยับแล้วหรือยัง",
  "ถ้าจะตาม remote ต่อ ให้เลือก merge หรือ rebase ตาม policy ของทีมอย่างมีสติ ไม่ใช่รันแบบเดาสุ่ม",
];

export const GIT_FETCH_LAB_STEPS: GitFetchLabStep[] = [
  {
    id: "fetch-lab-1",
    title: "Step 1: ตรวจ context ปัจจุบัน",
    task: "ยืนยันว่าอยู่ repository และ branch ที่ต้องการ พร้อมเช็ก remote ก่อน fetch",
    commands: [
      {
        command: "git branch --show-current",
        description: "ดู branch ที่คุณกำลังยืนอยู่ก่อนเริ่มดึงข้อมูลจาก remote",
      },
      {
        command: "git remote -v",
        description: "ยืนยันว่า origin ชี้ไปยัง remote URL ที่ถูกต้อง",
      },
      {
        command: "git status",
        description: "เช็ก working tree เพื่อให้แน่ใจว่าเข้าใจสถานะปัจจุบันก่อนดูความต่างหลัง fetch",
      },
    ],
    checkpoint: "รู้ว่ากำลังอยู่ branch ไหน และ origin ที่จะ fetch คือ remote ตัวถูกต้อง",
  },
  {
    id: "fetch-lab-2",
    title: "Step 2: ดึงข้อมูลล่าสุดจาก remote",
    task: "fetch ข้อมูลล่าสุดจาก origin โดยยังไม่ integrate เข้ากับ local branch",
    commands: [
      {
        command: "git fetch origin",
        description: "ดึง commit, refs และ remote-tracking branches ล่าสุดจาก origin",
      },
      {
        command: "git branch -r",
        description: "ดูว่ามี origin/main หรือ origin/feature ใดขยับหลัง fetch แล้วบ้าง",
      },
    ],
    checkpoint: "fetch สำเร็จและ remote-tracking refs ในเครื่องถูกอัปเดตแล้ว",
  },
  {
    id: "fetch-lab-3",
    title: "Step 3: ตรวจผลหลัง fetch",
    task: "ดู graph เพื่อยืนยันว่าขยับเฉพาะ origin/* แต่ local branch ยังไม่ถูก integrate",
    commands: [
      {
        command: "git log --oneline --graph --decorate --all -n 10",
        description: "ดูภาพรวมของ local branches และ origin/* หลัง fetch",
      },
      {
        command: "git log --oneline main..origin/main",
        description: "ดู commit ที่ origin/main มีเพิ่ม แต่ local main ยังไม่ได้รวมเข้ามา",
      },
    ],
    checkpoint: "อธิบายได้ว่า origin/main ขยับแล้ว แต่ local main และ working tree ยังอยู่ที่เดิม",
  },
  {
    id: "fetch-lab-4",
    title: "Step 4: เลือกวิธี integrate ต่อ",
    task: "หลัง fetch แล้ว ให้เลือกว่าจะ merge หรือ rebase ตาม policy ของทีม",
    commands: [
      {
        command: "git merge origin/main",
        description: "ใช้เมื่อทีมยอมรับ merge commits และต้องการรวมของใหม่เข้ามาแบบตรงไปตรงมา",
      },
      {
        command: "git rebase origin/main",
        description: "ใช้เมื่อทีมต้องการ linear history และต้องการยกฐาน local commits ขึ้นบน main ล่าสุด",
      },
    ],
    checkpoint: "แยกออกว่า fetch สำเร็จแล้ว แต่การ integrate เข้ากับ branch ปัจจุบันต้องเลือกทำเองในขั้นนี้",
    notes: [
      "เลือกเพียงหนึ่งแนวทางตาม policy ของทีม ไม่ต้องรัน merge และ rebase ทั้งคู่",
    ],
  },
];

export const GIT_FETCH_FLOW_STEPS: Record<GitFetchScenarioName, string[]> = {
  "update-tracking-ref": [
    "Start: server มี commit ใหม่ แต่ local cache ของ origin/main ยังเก่า",
    "Fetch: Git ติดต่อ remote และดึงข้อมูล commit ล่าสุดลงมา",
    "Update: origin/main ในเครื่องขยับตาม remote แล้ว",
    "Done: local main และ working tree ยังไม่เปลี่ยนจนกว่าคุณจะ merge หรือ rebase ต่อเอง",
  ],
  "fetch-feature-branch": [
    "Start: มี feature branch ใหม่บน remote ที่คุณยังไม่ได้เอาเข้ามาดูในเครื่อง",
    "Fetch: Git ดึงข้อมูล branch นั้นจาก origin",
    "Update: origin/feature/... ถูกสร้างหรืออัปเดตใน local repository",
    "Done: คุณยังอยู่ branch เดิม แต่พร้อม inspect, checkout หรือ rebase ต่อได้แล้ว",
  ],
};
