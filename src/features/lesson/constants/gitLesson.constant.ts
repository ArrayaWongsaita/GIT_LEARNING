import { PUBLIC_ROUTE } from "@/shared/constants/routes/public.constant";

export type GitLessonSlug =
  | "introduction"
  | "setup-git"
  | "repository-basics"
  | "commit-workflow"
  | "branching"
  | "merge-rebase"
  | "undo-history"
  | "remote-collaboration";

export type GitLessonSubtopic = {
  anchor: string;
  title: string;
  description: string;
  path?: string;
  commands?: string[];
};

export type GitLesson = {
  slug: GitLessonSlug;
  title: string;
  path: string;
  summary: string;
  subtopics: GitLessonSubtopic[];
};

export const GIT_LESSONS: GitLesson[] = [
  {
    slug: "introduction",
    title: "Introduction",
    path: PUBLIC_ROUTE.LESSON.INTRODUCTION.getWhatIsGitPath(),
    summary: "ภาพรวมของ Git และเหตุผลที่ควรใช้ก่อนเริ่มคำสั่งจริง",
    subtopics: [
      {
        anchor: "what-is-git",
        title: "What is Git?",
        description: "เข้าใจว่า Git คือเครื่องมือเก็บประวัติการเปลี่ยนแปลงโค้ดแบบเป็นระบบ",
        path: PUBLIC_ROUTE.LESSON.INTRODUCTION.getWhatIsGitPath(),
      },
      {
        anchor: "what-is-version-control",
        title: "What is Version Control",
        description: "เรียนรู้ว่าทำไมการมีประวัติไฟล์ช่วยลดความเสี่ยงและแก้ปัญหาได้เร็วขึ้น",
        path: PUBLIC_ROUTE.LESSON.INTRODUCTION.getWhatIsVersionControlPath(),
      },
      {
        anchor: "local-vs-remote",
        title: "Local vs Remote",
        description: "แยกให้ออกว่าข้อมูลอยู่ในเครื่องเรา (local) กับบนเซิร์ฟเวอร์ (remote) ต่างกันอย่างไร",
        path: PUBLIC_ROUTE.LESSON.INTRODUCTION.getLocalVsRemotePath(),
      },
      {
        anchor: "basic-git-terms",
        title: "Basic Git Terms",
        description: "ทำความรู้จักคำสำคัญ เช่น repository, commit, branch, merge",
        path: PUBLIC_ROUTE.LESSON.INTRODUCTION.getBasicGitTermsPath(),
      },
    ],
  },
  {
    slug: "setup-git",
    title: "Setup Git",
    path: PUBLIC_ROUTE.LESSON.SETUP_GIT,
    summary: "ติดตั้ง Git และตั้งค่าพื้นฐานให้พร้อมใช้งานจริง",
    subtopics: [
      {
        anchor: "install-git",
        title: "Install Git",
        description: "ติดตั้ง Git และยืนยันผลด้วยคำสั่งตรวจสอบเวอร์ชัน",
        commands: ["git --version"],
      },
      {
        anchor: "git-config-user",
        title: "git config user",
        description: "ตั้งชื่อและอีเมลสำหรับ commit ให้ถูกต้องก่อนเริ่มโปรเจกต์",
        commands: ['git config --global user.name "Your Name"', 'git config --global user.email "you@example.com"'],
      },
      {
        anchor: "ssh-key-setup",
        title: "SSH Key Setup",
        description: "สร้างและเพิ่ม SSH key เพื่อ push/pull กับ remote ได้สะดวก",
        commands: ["ssh-keygen -t ed25519 -C \"you@example.com\"", "ssh -T git@github.com"],
      },
      {
        anchor: "check-version",
        title: "Check Version",
        description: "เช็กเวอร์ชันและรายการ config ปัจจุบันเพื่อยืนยันการตั้งค่าถูกต้อง",
        commands: ["git --version", "git config --list"],
      },
    ],
  },
  {
    slug: "repository-basics",
    title: "Repository Basics",
    path: PUBLIC_ROUTE.LESSON.REPOSITORY_BASICS,
    summary: "เริ่มต้น repository ใหม่หรือ clone จากของเดิมให้ถูกขั้นตอน",
    subtopics: [
      {
        anchor: "git-init",
        title: "git init",
        description: "สร้าง repository ใหม่ในโฟลเดอร์ปัจจุบันเพื่อเริ่มติดตามไฟล์",
        commands: ["git init"],
      },
      {
        anchor: "git-clone",
        title: "git clone",
        description: "คัดลอก repository จาก remote มายังเครื่องของเรา",
        commands: ["git clone <repository-url>"],
      },
      {
        anchor: "gitignore",
        title: ".gitignore",
        description: "กำหนดไฟล์/โฟลเดอร์ที่ไม่ควรถูก track เช่น build output หรือ secret",
      },
      {
        anchor: "repository-structure",
        title: "Repository Structure",
        description: "จัดโครงสร้างไฟล์ให้ชัดเพื่อทำงานทีมและดูแลระยะยาวได้ง่าย",
      },
    ],
  },
  {
    slug: "commit-workflow",
    title: "Commit Workflow",
    path: PUBLIC_ROUTE.LESSON.COMMIT_WORKFLOW,
    summary: "ฝึก flow หลัก status -> add -> commit ให้คล่องมือ",
    subtopics: [
      {
        anchor: "git-status",
        title: "git status",
        description: "ดูสถานะไฟล์ว่ามีอะไรแก้แล้ว ยังไม่ add หรือรอ commit",
        commands: ["git status"],
      },
      {
        anchor: "git-add",
        title: "git add",
        description: "เลือกไฟล์ที่จะเข้า staging area ก่อนสร้าง commit",
        commands: ["git add .", "git add <file-name>"],
      },
      {
        anchor: "git-commit",
        title: "git commit",
        description: "บันทึกการเปลี่ยนแปลงเป็นหนึ่งหน่วยประวัติที่ย้อนกลับได้",
        commands: ['git commit -m "your message"'],
      },
      {
        anchor: "commit-message-rules",
        title: "Commit Message Rules",
        description: "เขียนข้อความ commit ให้สื่อความหมาย ชัด สั้น และค้นย้อนหลังง่าย",
      },
    ],
  },
  {
    slug: "branching",
    title: "Branching",
    path: PUBLIC_ROUTE.LESSON.BRANCHING,
    summary: "แยกงานเป็น branch เพื่อลดความเสี่ยงต่อโค้ดหลัก",
    subtopics: [
      {
        anchor: "git-branch",
        title: "git branch",
        description: "สร้างหรือดูรายชื่อ branch ที่มีอยู่ในโปรเจกต์",
        commands: ["git branch", "git branch feature/login"],
      },
      {
        anchor: "git-switch",
        title: "git switch",
        description: "สลับ branch หรือสร้าง branch ใหม่พร้อมสลับทันที",
        commands: ["git switch feature/login", "git switch -c feature/profile"],
      },
      {
        anchor: "feature-branch",
        title: "Feature Branch",
        description: "ทำฟีเจอร์แยกจาก main แล้วค่อย merge เมื่อพร้อม",
      },
      {
        anchor: "branch-naming",
        title: "Branch Naming",
        description: "ตั้งชื่อ branch ให้อ่านง่าย เช่น feature/, fix/, chore/ ตามรูปแบบทีม",
      },
    ],
  },
  {
    slug: "merge-rebase",
    title: "Merge & Rebase",
    path: PUBLIC_ROUTE.LESSON.MERGE_REBASE,
    summary: "รวมงานจากหลาย branch อย่างปลอดภัยและประวัติอ่านง่าย",
    subtopics: [
      {
        anchor: "git-merge",
        title: "git merge",
        description: "รวมการเปลี่ยนแปลงจาก branch หนึ่งเข้ามายัง branch ปัจจุบัน",
        commands: ["git merge feature/login"],
      },
      {
        anchor: "git-rebase",
        title: "git rebase",
        description: "ย้ายฐาน commit เพื่อทำประวัติให้เป็นเส้นตรงและอ่านง่ายขึ้น",
        commands: ["git rebase main"],
      },
      {
        anchor: "resolve-conflicts",
        title: "Resolve Conflicts",
        description: "แก้ conflict ทีละไฟล์ ตรวจสอบผลแล้ว commit/continue ให้ครบ",
      },
      {
        anchor: "fast-forward-merge",
        title: "Fast-forward Merge",
        description: "รูปแบบ merge ที่ไม่มีจุดแตกแขนงเพิ่มเมื่อประวัติต่อเนื่องกัน",
      },
    ],
  },
  {
    slug: "undo-history",
    title: "Undo & History",
    path: PUBLIC_ROUTE.LESSON.UNDO_HISTORY,
    summary: "ดูประวัติและย้อนการเปลี่ยนแปลงได้อย่างปลอดภัย",
    subtopics: [
      {
        anchor: "git-log",
        title: "git log",
        description: "ตรวจสอบประวัติ commit เพื่อค้นหาจุดเปลี่ยนแปลงย้อนหลัง",
        commands: ["git log --oneline --graph --decorate"],
      },
      {
        anchor: "git-restore",
        title: "git restore",
        description: "ยกเลิกการแก้ไฟล์หรือดึงไฟล์กลับจาก staging/worktree",
        commands: ["git restore <file-name>", "git restore --staged <file-name>"],
      },
      {
        anchor: "git-reset",
        title: "git reset",
        description: "ย้าย HEAD/branch pointer เพื่อย้อน commit ตามระดับ soft/mixed/hard",
        commands: ["git reset --soft HEAD~1", "git reset --mixed HEAD~1"],
      },
      {
        anchor: "git-reflog",
        title: "git reflog",
        description: "ดูประวัติการขยับ HEAD เพื่อกู้สถานะที่เผลอ reset/checkout ทิ้ง",
        commands: ["git reflog"],
      },
    ],
  },
  {
    slug: "remote-collaboration",
    title: "Remote Collaboration",
    path: PUBLIC_ROUTE.LESSON.REMOTE_COLLABORATION,
    summary: "เชื่อม remote และทำงานร่วมทีมด้วย pull/push และ PR flow",
    subtopics: [
      {
        anchor: "git-remote",
        title: "git remote",
        description: "เพิ่มและตรวจสอบ remote repository ที่โปรเจกต์เชื่อมอยู่",
        commands: ["git remote -v", "git remote add origin <repository-url>"],
      },
      {
        anchor: "git-pull",
        title: "git pull",
        description: "ดึงโค้ดล่าสุดจาก remote มารวมกับ branch ปัจจุบัน",
        commands: ["git pull origin main"],
      },
      {
        anchor: "git-push",
        title: "git push",
        description: "ส่ง commit จากเครื่องเราไปยัง remote repository",
        commands: ["git push origin main", "git push -u origin feature/login"],
      },
      {
        anchor: "pull-request-flow",
        title: "Pull Request Flow",
        description: "เปิด PR, รับรีวิว, แก้ไขตามคอมเมนต์ และ merge เข้าสาขาหลัก",
      },
    ],
  },
];

export const GIT_LESSON_BY_SLUG = GIT_LESSONS.reduce<
  Partial<Record<GitLessonSlug, GitLesson>>
>((acc, lesson) => {
  acc[lesson.slug] = lesson;
  return acc;
}, {});

export function getGitLessonBySlug(slug?: string): GitLesson | undefined {
  if (!slug) return undefined;
  return GIT_LESSON_BY_SLUG[slug as GitLessonSlug];
}
