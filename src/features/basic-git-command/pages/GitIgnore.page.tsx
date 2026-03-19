import { CommandLessonPageTemplate } from "@/features/basic-git-command/components/CommandLessonPageTemplate";
import {
  GIT_IGNORE_LAB_SECTIONS,
  GIT_IGNORE_SECTIONS,
} from "@/features/basic-git-command/constants/git-ignore-content.constant";

export default function GitIgnorePage() {
  return (
    <CommandLessonPageTemplate
      badge="Repository Basics"
      title=".gitignore: กันไฟล์ที่ไม่ควรเข้า repository ให้ถูกตั้งแต่ต้น"
      description="เรียนรู้การเขียน .gitignore อย่างถูกหลัก, วิธีจัดการไฟล์ที่เคยถูก track ไปแล้ว และฝึกแยกกฎส่วนกลางของทีมออกจากกฎเฉพาะเครื่องตัวเอง"
      sections={GIT_IGNORE_SECTIONS}
      labSections={GIT_IGNORE_LAB_SECTIONS}
    />
  );
}
