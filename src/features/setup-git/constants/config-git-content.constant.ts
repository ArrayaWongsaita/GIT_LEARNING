export type ConfigItem = {
  id: string;
  title: string;
  purpose: string;
  commands: {
    command: string;
    description: string;
  }[];
  notes?: string[];
};

export type ConfigSection = {
  id: string;
  title: string;
  summary: string;
  items: ConfigItem[];
};

export const CONFIG_GIT_SECTIONS: ConfigSection[] = [
  {
    id: "identity-scope",
    title: "Identity + Scope",
    summary: "ตั้งค่าชื่อ/อีเมล และเข้าใจลำดับความสำคัญของ config",
    items: [
      {
        id: "set-user",
        title: "ตั้งชื่อและอีเมลสำหรับ commit",
        purpose: "กำหนดตัวตนที่จะถูกบันทึกลงในทุก commit",
        commands: [
          {
            command: 'git config --global user.name "Your Name"',
            description: "ตั้งชื่อผู้ใช้งานระดับ global ใช้กับทุก repository ในเครื่อง",
          },
          {
            command: 'git config --global user.email "you@example.com"',
            description: "ตั้งอีเมลระดับ global เพื่อผูกกับ author ของ commit",
          },
          {
            command: 'git config --local user.name "Project Name Override"',
            description: "ตั้งชื่อเฉพาะ repository ปัจจุบันเพื่อ override ค่า global",
          },
        ],
        notes: [
          "ลำดับการ override คือ local > global > system",
          "ใช้ --local เมื่อต้องการชื่อ/อีเมลเฉพาะโปรเจกต์",
        ],
      },
    ],
  },
  {
    id: "default-behavior",
    title: "Default Behavior",
    summary: "กำหนดพฤติกรรมเริ่มต้นของ Git ให้ตรงกับ workflow ทีม",
    items: [
      {
        id: "default-settings",
        title: "ตั้งค่า default branch, editor, pull, fetch",
        purpose: "ลดงานตั้งค่าซ้ำและทำให้พฤติกรรมเครื่องคุณคงที่",
        commands: [
          {
            command: "git config --global init.defaultBranch main",
            description: "กำหนดชื่อ branch เริ่มต้นเวลาใช้ git init ให้เป็น main อัตโนมัติ",
          },
          {
            command: 'git config --global core.editor "code --wait"',
            description: "กำหนด editor หลักเป็น VS Code และให้ Git รอจนปิดไฟล์ก่อนทำงานต่อ",
          },
          {
            command: "git config --global pull.rebase false",
            description: "ตั้งให้ git pull ใช้ merge เป็นค่าปกติ ลดการ rewrite history โดยไม่ตั้งใจ",
          },
          {
            command: "git config --global fetch.prune true",
            description: "ลบ remote-tracking branches ที่ถูกลบจาก remote อัตโนมัติเมื่อ fetch",
          },
        ],
        notes: [
          "ถ้าทีมใช้ rebase เป็นหลัก สามารถเปลี่ยน pull.rebase เป็น true",
        ],
      },
    ],
  },
  {
    id: "line-ending",
    title: "Cross-Platform Line Ending",
    summary: "ป้องกันปัญหาไฟล์แก้ทั้งไฟล์เพราะ CRLF/LF ไม่ตรงกัน",
    items: [
      {
        id: "line-ending-by-os",
        title: "ตั้งค่า line ending ตามระบบปฏิบัติการ",
        purpose: "ทำให้ไฟล์ข้อความทำงานร่วมกันได้ระหว่าง Windows/macOS/Linux",
        commands: [
          {
            command: "git config --global core.autocrlf input",
            description: "แนะนำสำหรับ macOS/Linux: commit เป็น LF และไม่แปลงตอน checkout",
          },
          {
            command: "git config --global core.autocrlf true",
            description: "แนะนำสำหรับ Windows: checkout เป็น CRLF และ commit กลับเป็น LF",
          },
          {
            command: "git config --global core.eol lf",
            description: "บังคับมาตรฐาน line ending เป็น LF ให้สอดคล้องกับทีม",
          },
        ],
        notes: [
          "macOS/Linux แนะนำใช้ core.autocrlf input",
          "Windows แนะนำใช้ core.autocrlf true",
          "ตั้ง core.eol lf เมื่อทีมมาตรฐานเป็น LF",
        ],
      },
    ],
  },
  {
    id: "aliases",
    title: "Useful Aliases",
    summary: "สร้างคำสั่งลัดเพื่อทำงานเร็วขึ้นทุกวัน",
    items: [
      {
        id: "common-aliases",
        title: "ตั้ง alias ที่ใช้บ่อย",
        purpose: "ลดจำนวนตัวอักษรและทำงาน command line ได้เร็วขึ้น",
        commands: [
          {
            command: "git config --global alias.st status",
            description: "เพิ่มคำสั่งย่อ git st สำหรับดูสถานะไฟล์",
          },
          {
            command: "git config --global alias.co checkout",
            description: "เพิ่มคำสั่งย่อ git co สำหรับ checkout branch/ไฟล์",
          },
          {
            command: "git config --global alias.br branch",
            description: "เพิ่มคำสั่งย่อ git br สำหรับจัดการ branch",
          },
          {
            command: 'git config --global alias.cm "commit -m"',
            description: "เพิ่มคำสั่งย่อ git cm สำหรับ commit พร้อม message",
          },
          {
            command: 'git config --global alias.lg "log --oneline --graph --decorate --all"',
            description: "เพิ่มคำสั่งย่อ git lg สำหรับดูประวัติแบบย่อพร้อมกราฟ",
          },
        ],
      },
    ],
  },
  {
    id: "credential",
    title: "Credential Helper",
    summary: "ตั้งค่าการจัดการรหัสผ่าน/token ให้เหมาะกับแต่ละ OS",
    items: [
      {
        id: "credential-by-os",
        title: "เลือก credential helper ตามระบบปฏิบัติการ",
        purpose: "ลดการกรอกรหัสผ่านซ้ำและจัดเก็บข้อมูลรับรองอย่างเหมาะสม",
        commands: [
          {
            command: "git config --global credential.helper manager-core",
            description: "ตั้ง credential helper สำหรับ Windows (Git Credential Manager)",
          },
          {
            command: "git config --global credential.helper osxkeychain",
            description: "ตั้ง credential helper สำหรับ macOS ให้ใช้ Keychain",
          },
          {
            command: "git config --global credential.helper cache",
            description: "ตั้ง credential helper แบบ cache ชั่วคราว (มักใช้บน Linux ทั่วไป)",
          },
        ],
        notes: [
          "Windows ใช้ manager-core",
          "macOS ใช้ osxkeychain",
          "Linux แบบทั่วไปใช้ cache (หรือตัวช่วยที่ distro รองรับ)",
        ],
      },
    ],
  },
  {
    id: "inspect-edit",
    title: "Inspect / Edit / Remove",
    summary: "ตรวจสอบ config ปัจจุบัน แก้ไข และลบค่าได้อย่างปลอดภัย",
    items: [
      {
        id: "inspect-and-edit",
        title: "ดูแหล่งที่มา แก้ และลบค่าที่ไม่ต้องการ",
        purpose: "เข้าใจว่าค่าไหนมาจากไฟล์ใด และแก้ให้ถูก scope",
        commands: [
          {
            command: "git config --list",
            description: "แสดง config ทั้งหมดที่ effective อยู่ตอนนี้",
          },
          {
            command: "git config --list --show-origin",
            description: "แสดงพร้อมแหล่งที่มาของแต่ละค่า (ไฟล์ไหนกำหนด)",
          },
          {
            command: "git config --global --edit",
            description: "เปิดไฟล์ global config เพื่อแก้ไขค่าระดับผู้ใช้",
          },
          {
            command: "git config --local --edit",
            description: "เปิดไฟล์ local config ของ repository ปัจจุบัน",
          },
          {
            command: "git config --get user.name",
            description: "อ่านค่า user.name ที่ effective อยู่ตอนนี้",
          },
          {
            command: "git config --unset --global alias.cm",
            description: "ลบค่า alias.cm ออกจาก global config",
          },
        ],
      },
    ],
  },
  {
    id: "recommended-checklist",
    title: "Recommended Checklist",
    summary: "เช็กค่าหลักที่ควรพร้อมก่อนเริ่มทำงานจริง",
    items: [
      {
        id: "verify-core-config",
        title: "ตรวจสอบค่าที่สำคัญก่อนเริ่มโปรเจกต์",
        purpose: "ยืนยันว่า config พื้นฐานพร้อมและลดปัญหาระหว่างทำงานทีม",
        commands: [
          {
            command: "git config --global --get user.name",
            description: "ตรวจว่าตั้งชื่อผู้ใช้งาน global แล้ว",
          },
          {
            command: "git config --global --get user.email",
            description: "ตรวจว่าตั้งอีเมล global แล้ว",
          },
          {
            command: "git config --global --get init.defaultBranch",
            description: "ตรวจค่า default branch ที่จะใช้ตอน init",
          },
          {
            command: "git config --global --get core.editor",
            description: "ตรวจว่า editor หลักถูกตั้งค่าแล้ว",
          },
          {
            command: "git config --global --get-regexp '^alias\\.'",
            description: "แสดง alias ทั้งหมดที่ตั้งไว้ใน global config",
          },
        ],
      },
    ],
  },
];
