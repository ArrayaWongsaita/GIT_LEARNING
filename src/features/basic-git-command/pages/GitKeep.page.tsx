import { CommandLessonPageTemplate } from "@/features/basic-git-command/components/CommandLessonPageTemplate";
import {
  GIT_KEEP_LAB_SECTIONS,
  GIT_KEEP_SECTIONS,
} from "@/features/basic-git-command/constants/git-keep-content.constant";

export default function GitKeepPage() {
  return (
    <CommandLessonPageTemplate
      badge="Repository Basics"
      title=".gitkeep: เก็บโฟลเดอร์ว่างให้อยู่ใน repo อย่างตั้งใจ"
      description="ทำความเข้าใจว่า Git ไม่ track โฟลเดอร์ว่างโดยตรง, วิธีใช้ .gitkeep เพื่อคงโครงสร้างโปรเจกต์ และแยกให้ออกว่าเมื่อไรควรใช้ .gitkeep หรือ .gitignore"
      sections={GIT_KEEP_SECTIONS}
      labSections={GIT_KEEP_LAB_SECTIONS}
    />
  );
}
