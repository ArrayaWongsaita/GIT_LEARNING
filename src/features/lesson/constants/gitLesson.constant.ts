import { PUBLIC_ROUTE } from "@/shared/constants/routes/public.constant";
import { basicGitCommandPath } from "@/features/basic-git-command/constants/basic-git-command.path.constant";
import { mergeRebasePath } from "@/features/merge-rebase/constants/merge-rebase.path.constant";
import { remoteCollaborationPath } from "@/features/remote-collaboration/constants/remote-collaboration.path.constant";
import { labPath } from "@/features/lab/constants/lab.path.constant";

export type GitLessonSlug =
  | "introduction"
  | "setup-git"
  | "repository-basics"
  | "commit-workflow"
  | "branching"
  | "merge-rebase"
  | "undo-history"
  | "remote-collaboration"
  | "lab";

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
    summary:
      "เริ่มต้น repository ใหม่ วางกฎ ignore ให้ถูก และคงโครงสร้างโฟลเดอร์สำคัญไว้ตั้งแต่ต้น",
    subtopics: [
      {
        anchor: "git-init",
        title: "git init",
        description: "สร้าง repository ใหม่ในโฟลเดอร์ปัจจุบันเพื่อเริ่มติดตามไฟล์",
        commands: ["git init"],
        path: basicGitCommandPath.getGitInitPath(),
      },
      {
        anchor: "gitignore",
        title: ".gitignore",
        description:
          "กำหนดไฟล์/โฟลเดอร์ที่ไม่ควรถูก track เช่น build output, dependencies หรือ secrets",
        commands: ["touch .gitignore", "printf \"node_modules/\\ndist/\\n.env\\n\" > .gitignore"],
        path: basicGitCommandPath.getGitIgnorePath(),
      },
      {
        anchor: "gitkeep",
        title: ".gitkeep",
        description:
          "ใช้ placeholder file เพื่อให้ Git เก็บโฟลเดอร์ว่างที่โปรเจกต์จำเป็นต้องมีไว้ได้",
        commands: ["mkdir -p public/uploads", "touch public/uploads/.gitkeep"],
        path: basicGitCommandPath.getGitKeepPath(),
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
        path: mergeRebasePath.getResolveConflictsPath(),
      },
      {
        anchor: "fast-forward-merge",
        title: "Fast-forward Merge",
        description: "รูปแบบ merge ที่ไม่มีจุดแตกแขนงเพิ่มเมื่อประวัติต่อเนื่องกัน",
        path: mergeRebasePath.getGitMergePath(),
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
    path: remoteCollaborationPath.getGitClonePath(),
    summary:
      "ทำงานกับ remote repository ตั้งแต่ clone โปรเจกต์, fetch ข้อมูลล่าสุด, pull อัปเดต, push งาน, เปิด Pull Request และป้องกัน branch สำคัญด้วย rulesets",
    subtopics: [
      {
        anchor: "git-clone",
        title: "git clone",
        description: "คัดลอก repository จาก remote ลงเครื่องเพื่อเริ่มทำงานในโปรเจกต์",
        commands: ["git clone <repository-url>"],
        path: remoteCollaborationPath.getGitClonePath(),
      },
      {
        anchor: "git-fetch",
        title: "git fetch",
        description:
          "ดึงข้อมูลล่าสุดจาก remote มาอัปเดต remote-tracking refs โดยยังไม่ merge เข้า branch ปัจจุบัน",
        commands: ["git fetch origin"],
        path: remoteCollaborationPath.getGitFetchPath(),
      },
      {
        anchor: "git-pull",
        title: "git pull",
        description: "ดึง commit ล่าสุดจาก remote แล้วรวมเข้ากับ branch ปัจจุบันบนเครื่องเรา",
        commands: ["git pull origin main"],
        path: remoteCollaborationPath.getGitPullPath(),
      },
      {
        anchor: "git-push",
        title: "git push",
        description:
          "ส่ง commit จาก local branch ขึ้น remote branch พร้อมเช็กสถานะก่อนและหลัง push รวมถึงอัปเดต branch หลัง rebase อย่างปลอดภัย",
        commands: [
          "git push origin main",
          "git push --force-with-lease origin feature/my-branch",
        ],
        path: remoteCollaborationPath.getGitPushPath(),
      },
      {
        anchor: "pull-request-flow",
        title: "Pull requests",
        description:
          "ฝึก workflow บน GitHub ตั้งแต่เปิด Pull requests รับรีวิว แก้ไข และ merge ให้ปลอดภัย",
        commands: ["git push -u origin feature/my-change"],
        path: remoteCollaborationPath.getPullRequestFlowPath(),
      },
      {
        anchor: "github-rules",
        title: "Rules",
        description:
          "ใช้ GitHub rulesets เพื่อกำหนดกติกาการ push และ merge สำหรับ branch สำคัญของทีม",
        path: remoteCollaborationPath.getRulesPath(),
      },
    ],
  },
  {
    slug: "lab",
    title: "Lab",
    path: PUBLIC_ROUTE.LESSON.LAB,
    summary:
      "ฝึก Git workflow แบบครบลูปบนโปรเจกต์ NestJS หลายโดเมนที่แตกหลาย feature branches แล้วรวมกลับอย่างเป็นระบบ",
    subtopics: [
      {
        anchor: "basic-flow",
        title: "Ecommerce flow",
        description:
          "สร้าง NestJS app, แตก 10 feature branches ด้วย nest g res, แล้วฝึก add, commit, push, PR, merge และ rebase จนครบทุก feature",
        path: labPath.getBasicFlowPath(),
      },
      {
        anchor: "feature-to-dev-flow",
        title: "Feature to dev flow",
        description:
          "ฝึก workflow แยกที่ให้ 10 feature branches เปิด PR เข้า dev ตั้งแต่แรก พร้อม fetch, rebase origin/dev และอัปเดต PR เดิมอย่างปลอดภัยบน branch ของตัวเอง",
        path: labPath.getFeatureToDevFlowPath(),
      },
      {
        anchor: "local-squash-flow",
        title: "Local squash flow",
        description:
          "สร้าง NestJS task board app, แตก 10 feature branches, ใช้ nest g res และฝึกรวมงานกลับ main ด้วย git merge --squash บนเครื่องตัวเอง",
        path: labPath.getLocalSquashFlowPath(),
      },
      {
        anchor: "booking-flow",
        title: "Booking flow",
        description:
          "ใช้ NestJS booking app เป็นตัวอย่างอีกชุด แล้วฝึก workflow เดิมตั้งแต่แตก branch, generate resources, เปิด PR, merge และ rebase จนครบทั้งระบบจองห้องพัก",
        path: labPath.getBookingFlowPath(),
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
