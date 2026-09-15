import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  History,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";

export type VcsSectionId =
  | "before-vcs"
  | "vcs-definition"
  | "vcs-types"
  | "timeline-git";

export type VcsItemId =
  | "files-chaos"
  | "team-conflict"
  | "definition"
  | "concept-map"
  | "local-vcs"
  | "cvcs"
  | "dvcs"
  | "timeline-evolution";

export type VcsIllustrationKey =
  | "files-chaos"
  | "team-conflict"
  | "commit-checkpoint"
  | "concept-map"
  | "local-vcs"
  | "cvcs"
  | "dvcs"
  | "timeline";

export type VcsTimelineEvent = {
  id: string;
  era: string;
  title: string;
  detail: string;
};

export type VcsAccordionItem = {
  id: VcsItemId;
  title: string;
  icon: LucideIcon;
  keyIdea: string;
  importance: string[];
  example: string;
  imageKey: VcsIllustrationKey;
  imageAlt: string;
  timelineEvents?: VcsTimelineEvent[];
};

export type VcsAccordionSection = {
  id: VcsSectionId;
  domId: string;
  title: string;
  description: string;
  defaultOpenItemId: VcsItemId;
  items: VcsAccordionItem[];
};

const timelineEvents: VcsTimelineEvent[] = [
  {
    id: "pre-1980",
    era: "ก่อน 1980s",
    title: "ยังไม่มี VCS ชัดเจน",
    detail: "นักพัฒนาต้องก็อปปี้ไฟล์เองและตั้งชื่อไฟล์หลายเวอร์ชัน เช่น final_final_realfinal.",
  },
  {
    id: "1980s",
    era: "1980s",
    title: "เริ่มมี Local VCS",
    detail: "ระบบช่วยเก็บประวัติเริ่มต้นในเครื่องเดียว ลดการก็อปปี้มั่ว แต่ยังแชร์ทีมลำบาก.",
  },
  {
    id: "1990s",
    era: "1990s",
    title: "Centralized VCS (CVS/SVN)",
    detail: "มีเซิร์ฟเวอร์กลางสำหรับเก็บโค้ด ทีมเริ่มทำงานร่วมกันได้ดีขึ้น แต่พึ่งพา server สูง.",
  },
  {
    id: "late-1990s",
    era: "ปลาย 1990s–ต้น 2000s",
    title: "ทีมกระจายตัวและโปรเจกต์ใหญ่ขึ้น",
    detail: "ความต้องการ branch/merge ที่เร็วและรองรับ scale สูงขึ้น ทำให้ model เดิมเริ่มตัน.",
  },
  {
    id: "2005",
    era: "2005",
    title: "Git ถูกออกแบบ",
    detail: "เน้นความเร็ว, distributed, และ merge ที่คล่องตัว เพื่อตอบโจทย์งานทีมขนาดใหญ่.",
  },
  {
    id: "after-2005",
    era: "หลัง 2005",
    title: "Git กลายเป็นมาตรฐาน",
    detail: "GitHub/GitLab ทำให้ workflow ร่วมทีม, code review, และ collaboration ใช้งานง่ายขึ้นมาก.",
  },
];

export const VCS_ACCORDION_SECTIONS: VcsAccordionSection[] = [
  {
    id: "before-vcs",
    domId: "section-before-vcs",
    title: "ปัญหาก่อนมี Version Control",
    description: "ก่อนมี VCS ทีมส่วนใหญ่มักสะดุดกับปัญหาไฟล์ชนกันและหาประวัติย้อนหลังไม่เจอ.",
    defaultOpenItemId: "files-chaos",
    items: [
      {
        id: "files-chaos",
        title: "ไฟล์ทับกัน / final_final.docx",
        icon: TerminalSquare,
        keyIdea: "ไม่มีประวัติและ traceability ชัดเจน",
        importance: [
          "ย้อนกลับไม่ได้ เมื่อเผลอบันทึกทับ",
          "ไม่รู้ว่าใครแก้บรรทัดไหน เมื่อไหร่",
          "รวมงานหลายคนยาก เพราะไฟล์ชื่อคล้ายกันเต็มโฟลเดอร์",
        ],
        example:
          "ทีมส่งไฟล์กันผ่านไลน์/อีเมล แล้วสุดท้ายมีไฟล์ชื่อ final_final_v3_realfinal เต็มไปหมด.",
        imageKey: "files-chaos",
        imageAlt: "ภาพโฟลเดอร์ที่มีไฟล์ชื่อ final_final หลายเวอร์ชัน",
      },
      {
        id: "team-conflict",
        title: "ทำงานเป็นทีมแล้ว conflict",
        icon: ShieldCheck,
        keyIdea: "หลายคนแก้ไฟล์เดียวกันพร้อมกัน ทำให้รวมงานแบบ manual ปวดหัว",
        importance: [
          "ต้อง copy/paste รวมงานเอง เสี่ยงตกหล่น",
          "งานคนอื่นหายง่ายถ้าเซฟทับไฟล์ล่าสุด",
          "เสียเวลาไล่หาว่าโค้ดไหนถูกต้อง",
        ],
        example:
          "นักเรียน 2 คนแก้ไฟล์เดียวกัน คนหนึ่งเพิ่มฟีเจอร์ อีกคนแก้บั๊ก สุดท้ายรวมแล้วบั๊กกลับมาอีกครั้ง.",
        imageKey: "team-conflict",
        imageAlt: "ภาพทีมที่แก้ไฟล์เดียวกันจนเกิดความขัดแย้งของเวอร์ชัน",
      },
    ],
  },
  {
    id: "vcs-definition",
    domId: "section-vcs-definition",
    title: "Version Control คืออะไร",
    description: "VCS คือระบบที่ช่วยเก็บประวัติ แยกงาน และรวมงานของทีมได้อย่างมีโครงสร้าง.",
    defaultOpenItemId: "definition",
    items: [
      {
        id: "definition",
        title: "นิยาม",
        icon: BookOpen,
        keyIdea:
          "Version Control คือระบบเก็บประวัติการเปลี่ยนแปลงของโปรเจกต์ เพื่อย้อนดู เปรียบเทียบ และทำงานร่วมกันได้",
        importance: [
          "history: ดูลำดับการเปลี่ยนแปลงย้อนหลัง",
          "diff: เทียบว่าแก้อะไรไปบ้าง",
          "rollback: ย้อนกลับไปจุดที่ยังใช้งานได้",
          "collaboration: ทำงานหลายคนโดยไม่ชนกันง่าย",
        ],
        example:
          "ถ้า release แล้วพัง เราสามารถ rollback กลับไป commit ก่อนหน้าได้ทันทีแทนการแก้สดบนโปรดักชัน.",
        imageKey: "commit-checkpoint",
        imageAlt: "เส้นเวลาและจุดเซฟเปรียบกับ commit",
      },
      {
        id: "concept-map",
        title: "แนวคิดสำคัญ: Commit / Branch / Merge / Remote",
        icon: GitBranch,
        keyIdea: "4 คำนี้คือแกนหลักที่ต้องเข้าใจก่อนใช้ Git แบบทีม",
        importance: [
          "Commit = จุดเซฟเกม (snapshot ของงาน ณ ตอนนั้น)",
          "Branch = เส้นเรื่องแยกไว้ทดลองหรือทำฟีเจอร์ใหม่",
          "Merge = รวมเส้นเรื่องกลับมาที่เส้นหลัก",
          "Remote = ที่เก็บกลางสำหรับแชร์กับทีม",
        ],
        example:
          "ทำฟีเจอร์ใน branch แยก → commit ทีละช่วง → merge เมื่อรีวิวผ่าน → push ไป remote ให้ทีมดึงไปใช้.",
        imageKey: "concept-map",
        imageAlt: "ภาพแผนผังแนวคิด Commit Branch Merge และ Remote",
      },
    ],
  },
  {
    id: "vcs-types",
    domId: "section-vcs-types",
    title: "ประเภทของ Version Control",
    description: "แต่ละยุคของ VCS ออกแบบต่างกันตามโจทย์เรื่องทีม ขนาดโปรเจกต์ และการทำงานแบบ offline.",
    defaultOpenItemId: "local-vcs",
    items: [
      {
        id: "local-vcs",
        title: "Local VCS",
        icon: FolderGit2,
        keyIdea: "เก็บประวัติไว้ในเครื่องเดียว เหมาะงานคนเดียวขนาดเล็ก",
        importance: [
          "Pros: ตั้งค่าง่าย เรียนรู้ไว",
          "Cons: แชร์ทีมยาก และเสี่ยงหายถ้าเครื่องพัง",
        ],
        example:
          "นักเรียนทำงานเดี่ยวบนโน้ตบุ๊กตัวเดียว ใช้งานได้ แต่พอจะส่งต่อเพื่อนเริ่มลำบาก.",
        imageKey: "local-vcs",
        imageAlt: "ภาพไอคอนคอมพิวเตอร์เครื่องเดียวแทน Local VCS",
      },
      {
        id: "cvcs",
        title: "Centralized VCS (CVCS) เช่น SVN/CVS",
        icon: History,
        keyIdea: "มี server กลางเป็นศูนย์กลางของความจริง (single source of truth)",
        importance: [
          "Pros: ควบคุมส่วนกลางง่าย นโยบายทีมชัด",
          "Cons: พึ่ง server สูง หากล่มงานสะดุด",
          "Cons: การทำงาน offline ไม่คล่อง และ branch/merge อาจไม่ลื่น",
        ],
        example:
          "ทีมต้องเข้าถึง server กลางตลอดเวลา ถ้าเน็ตมีปัญหา workflow จะช้าลงทันที.",
        imageKey: "cvcs",
        imageAlt: "ภาพเซิร์ฟเวอร์กลางเชื่อมกับผู้ใช้หลายคนแทน Centralized VCS",
      },
      {
        id: "dvcs",
        title: "Distributed VCS (DVCS) เช่น Git",
        icon: GitMerge,
        keyIdea: "ทุกคนมี repository และ history ครบในเครื่องตัวเอง",
        importance: [
          "Pros: เร็ว ทำงาน offline ได้",
          "Pros: branch/merge คล่อง เหมาะกับทีมใหญ่",
          "Cons: ช่วงแรกเรียนรู้ยาก เพราะ concept มากกว่าแบบเดิม",
        ],
        example:
          "นักพัฒนาสามารถ commit บนเครื่องตัวเองตอนออฟไลน์ แล้วค่อย push ขึ้น remote เมื่อพร้อม.",
        imageKey: "dvcs",
        imageAlt: "ภาพหลายเครื่องที่มี repository ของตัวเองแทน Distributed VCS",
      },
    ],
  },
  {
    id: "timeline-git",
    domId: "section-timeline-git",
    title: "Timeline: ก่อน Git → Git",
    description: "เข้าใจบริบททางประวัติศาสตร์เพื่อเห็นว่าทำไม Git จึงถูกสร้างขึ้นในปี 2005.",
    defaultOpenItemId: "timeline-evolution",
    items: [
      {
        id: "timeline-evolution",
        title: "จากยุคคัดลอกไฟล์สู่มาตรฐานโลก",
        icon: GitCommitHorizontal,
        keyIdea: "เส้นทางของ VCS คือการแก้ปัญหาเรื่อง scale, collaboration และความเร็วในการรวมงาน",
        importance: [
          "จาก copy file แบบ manual → local tools",
          "จาก local tools → centralized server",
          "จาก centralized limits → distributed model แบบ Git",
        ],
        example:
          "เมื่อทีมใหญ่และกระจายตัวทั่วโลก การทำงานแบบ distributed ช่วยให้พัฒนาคู่ขนานได้จริง.",
        imageKey: "timeline",
        imageAlt: "ภาพ timeline milestone ตั้งแต่ก่อนมี VCS จนถึงการเกิด Git",
        timelineEvents,
      },
    ],
  },
];

export const VCS_SUMMARY_BULLETS = [
  "VCS ช่วยเก็บ history + ทำงานทีม + rollback ได้อย่างมั่นใจ",
  "Git คือ DVCS: เร็ว, ทำงาน offline ได้, branch/merge คล่อง",
  "Git เกิดขึ้นเพราะโปรเจกต์ใหญ่ต้องการระบบที่ scale และรวมงานได้ดีกว่าเดิม",
] as const;

export const VCS_MINI_QUIZ = [
  {
    id: "quiz-1",
    question: "Commit เปรียบเหมือนอะไร?",
    answer: "Commit เปรียบเหมือน “จุดเซฟเกม” ที่บันทึกสถานะงาน ณ เวลานั้น.",
  },
  {
    id: "quiz-2",
    question: "CVCS ต่างจาก DVCS ยังไง?",
    answer:
      "CVCS พึ่ง server กลางเป็นหลัก ส่วน DVCS ทุกคนมี repository/history ครบในเครื่องตัวเอง.",
  },
  {
    id: "quiz-3",
    question: "ทำไม Git เกิดขึ้น?",
    answer:
      "เพราะทีมและโปรเจกต์ขนาดใหญ่ต้องการความเร็ว, การทำงานแบบ distributed, และการ merge ที่มีประสิทธิภาพ.",
  },
] as const;
