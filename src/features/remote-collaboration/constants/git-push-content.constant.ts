export type GitPushCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

export type GitPushLabCommand = {
  command: string;
  description: string;
};

export type GitPushLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitPushLabCommand[];
  checkpoint: string;
  notes?: string[];
};

export type GitPushScenarioName = "success" | "rejected";

export const GIT_PUSH_COMMAND_DOCS: GitPushCommandDoc[] = [
  {
    id: "push-default",
    title: "Push แบบมาตรฐาน",
    purpose: "ส่ง commit จาก local branch ไปที่ remote branch",
    command: "git push origin main",
    description: "ใช้เมื่อ local branch ของเราพร้อมเผยแพร่การเปลี่ยนแปลงขึ้น origin/main",
  },
  {
    id: "push-upstream",
    title: "Push พร้อมตั้ง upstream",
    purpose: "เชื่อม local branch ใหม่กับ remote branch ครั้งแรก",
    command: "git push -u origin feature/login-ui",
    description:
      "หลังรันสำเร็จ branch นี้จะ track กับ origin/feature/login-ui ทำให้ครั้งต่อไปใช้ git push ได้สั้นลง",
  },
  {
    id: "push-dry-run",
    title: "ตรวจสอบก่อน push จริง",
    purpose: "ดูผลลัพธ์ที่คาดว่าจะเกิดขึ้นโดยยังไม่ส่งข้อมูลขึ้น remote",
    command: "git push --dry-run origin main",
    description:
      "เหมาะกับจังหวะที่ต้องการเช็กสิทธิ์และสถานะ branch ก่อน push จริง โดยไม่แก้สถานะ remote",
  },
  {
    id: "push-non-fast-forward-fix",
    title: "แก้เคส push ถูกปฏิเสธ (non-fast-forward)",
    purpose: "ซิงก์ remote ล่าสุดก่อนแล้วค่อย push ใหม่",
    command: "git pull --rebase origin main && git push origin main",
    description:
      "ใช้เมื่อ remote มี commit ใหม่ที่ local ยังไม่มี ทำให้ push ตรงๆ ไม่ได้",
    notes: [
      "หากเกิด conflict ระหว่าง rebase ให้แก้ไฟล์แล้วรัน git rebase --continue",
      "หลีกเลี่ยง force push บน shared branch หากทีมไม่ได้ตกลงไว้",
    ],
  },
];

export const GIT_PUSH_SAFETY_NOTES: string[] = [
  "เช็ก branch ปัจจุบันก่อน push ด้วย git branch --show-current",
  "ตรวจสอบว่า remote ถูกต้องผ่าน git remote -v โดยเฉพาะเมื่อมีหลาย remote",
  "ดูสถานะ ahead/behind ด้วย git status หรือ git branch -vv ก่อน push",
  "ถ้าเจอ non-fast-forward ให้ pull/sync ก่อน แล้วค่อย push ซ้ำ",
  "ควรอ่านกติกาทีมเรื่อง protected branch และรีวิวก่อน push เข้า main",
];

export const GIT_PUSH_LAB_STEPS: GitPushLabStep[] = [
  {
    id: "push-lab-1",
    title: "Step 1: ตรวจสถานะก่อน push",
    task: "ยืนยันว่าอยู่ branch ที่ถูกต้องและ local มี commit พร้อมส่ง",
    commands: [
      {
        command: "git branch --show-current",
        description: "เช็ก branch ปัจจุบัน",
      },
      {
        command: "git status",
        description: "ตรวจว่า working tree ไม่มีไฟล์ค้างที่ไม่ต้องการ",
      },
      {
        command: "git branch -vv",
        description: "ดูว่า branch นำหน้าหรือตามหลัง remote เท่าไร",
      },
    ],
    checkpoint: "เห็นว่าอยู่ branch ที่ต้องการและพร้อม push",
  },
  {
    id: "push-lab-2",
    title: "Step 2: Push งานขึ้น remote",
    task: "ส่ง commit ล่าสุดของ local branch ไปยัง origin",
    commands: [
      {
        command: "git push origin main",
        description: "push การเปลี่ยนแปลงขึ้น remote",
      },
      {
        command: "git log --oneline --graph --decorate -n 8",
        description: "เช็กประวัติว่าจุดล่าสุดตรงตามที่คาด",
      },
    ],
    checkpoint: "push สำเร็จและ remote tracking ไม่รายงานว่า local ahead",
  },
  {
    id: "push-lab-3",
    title: "Step 3: รับมือกรณีถูก reject",
    task: "ซ้อม flow เมื่อ push ไม่ผ่านเพราะ non-fast-forward",
    commands: [
      {
        command: "git pull --rebase origin main",
        description: "ดึง remote ล่าสุดและจัด history local ให้ต่อเนื่อง",
      },
      {
        command: "git push origin main",
        description: "ลอง push ใหม่หลัง sync สำเร็จ",
      },
    ],
    checkpoint: "push ผ่านหลัง sync และไม่มีข้อความ rejected",
    notes: ["ถ้าติด conflict ให้แก้ไฟล์แล้วจบ rebase ให้ครบก่อน push รอบถัดไป"],
  },
];

export const GIT_PUSH_FLOW_STEPS: Record<GitPushScenarioName, string[]> = {
  success: [
    "Start: local main นำหน้า origin/main อยู่ 1 commit",
    "Prepare: git push แพ็ก commit และส่งข้อมูลไป remote",
    "Update: origin/main ขยับ pointer ไป commit ล่าสุดของ local",
    "Done: push สำเร็จและ local/remote อยู่สถานะ sync",
  ],
  rejected: [
    "Start: origin/main มี commit ใหม่กว่า local (หรือ diverged)",
    "Attempt: local พยายาม push commit ไปที่ origin/main",
    "Reject: remote ปฏิเสธด้วยข้อความ non-fast-forward",
    "Next: ดึง/ซิงก์ remote ก่อน แล้วค่อย push ใหม่",
  ],
};
