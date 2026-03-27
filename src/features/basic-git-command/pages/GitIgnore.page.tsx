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
      description="เรียนรู้ syntax และ pattern ของ .gitignore ว่าจะ ignore file, directory และยกเว้นบางไฟล์ยังไง พร้อมรายการไฟล์/โฟลเดอร์ยอดนิยมของสาย Web/Node, วิธีจัดการไฟล์ที่เคยถูก track ไปแล้ว และการแยกกฎส่วนกลางออกจากกฎเฉพาะเครื่อง"
      sections={GIT_IGNORE_SECTIONS}
      labSections={GIT_IGNORE_LAB_SECTIONS}
    />
  );
}
