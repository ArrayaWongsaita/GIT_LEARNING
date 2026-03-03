import {
  ArrowRight,
  BookOpen,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";

const coreFlow = [
  {
    title: "Working Directory",
    detail: "พื้นที่ที่เราแก้ไฟล์จริงบนเครื่องของเรา",
    icon: FolderGit2,
  },
  {
    title: "Staging Area",
    detail: "คัดไฟล์ที่พร้อมจะบันทึกด้วย git add",
    icon: TerminalSquare,
  },
  {
    title: "Local Repository",
    detail: "บันทึกประวัติด้วย git commit เพื่อเก็บเป็น snapshot",
    icon: GitCommitHorizontal,
  },
] as const;

const starterCommands = [
  { cmd: "git init", meaning: "เริ่มต้น Git Repository ในโฟลเดอร์ปัจจุบัน" },
  { cmd: "git status", meaning: "ดูสถานะไฟล์ที่ถูกแก้ไขและไฟล์ที่เตรียม commit" },
  { cmd: "git add .", meaning: "เพิ่มไฟล์ที่เปลี่ยนแปลงทั้งหมดเข้า staging area" },
  { cmd: 'git commit -m "เริ่มต้นบทเรียน"', meaning: "สร้าง commit พร้อมข้อความอธิบาย" },
  { cmd: "git log --oneline", meaning: "ดูประวัติ commit แบบสั้น อ่านง่าย" },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-cyan-50 p-6 shadow-sm md:p-8">
        <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-medium text-orange-700">
              <BookOpen className="size-4" />
              บทที่ 1: Introduction
            </div>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
              เริ่มต้นเรียนคำสั่ง Git
              <br />
              แบบเข้าใจภาพรวมในหน้าเดียว
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-700 md:text-base">
              Git คือระบบจัดการเวอร์ชันที่ช่วยให้เราเก็บประวัติโค้ดได้อย่างปลอดภัย ทำงานเป็นทีมได้ง่าย
              และย้อนกลับไปดูหรือแก้ไขงานเวอร์ชันก่อนหน้าได้ทุกเวลา
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-900 px-3 py-1 font-medium text-white">
                Version Control
              </span>
              <span className="rounded-full bg-cyan-600 px-3 py-1 font-medium text-white">
                Team Collaboration
              </span>
              <span className="rounded-full bg-emerald-600 px-3 py-1 font-medium text-white">
                Safe History
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm">
            <img
              src="/images/git/intro-workflow.svg"
              alt="ภาพอธิบาย Git Workflow ตั้งแต่แก้ไฟล์จนถึงส่งขึ้น remote"
              className="h-auto w-full rounded-xl"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">โฟลว์พื้นฐานที่ต้องเข้าใจ</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            ถ้าเข้าใจ 3 ส่วนนี้ คุณจะอ่านและใช้คำสั่ง Git ได้เร็วขึ้นมาก เพราะทุกคำสั่งจะทำงานอยู่ในโฟลว์นี้
          </p>

          <div className="mt-6 grid gap-3">
            {coreFlow.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === coreFlow.length - 1;
              return (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-orange-600" />
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    {!isLast ? <ArrowRight className="ml-auto size-4 text-slate-400" /> : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </article>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <img
            src="/images/git/intro-branches.svg"
            alt="ภาพตัวอย่าง branch หลักและ feature branch"
            className="h-auto w-full rounded-xl border border-slate-100"
          />
          <div className="mt-4 rounded-xl bg-slate-900 p-4 text-slate-100">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <GitBranch className="size-4 text-cyan-300" />
              ทำไมต้องแยก Branch?
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              การแยก branch ช่วยให้เราพัฒนาฟีเจอร์ใหม่แบบไม่เสี่ยงทำให้โค้ดหลักพัง และตรวจงานก่อนรวมกลับได้ง่าย
            </p>
          </div>
        </aside>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-400" />
          <h3 className="text-lg font-bold">ชุดคำสั่งเริ่มต้นที่ควรลองพิมพ์จริง</h3>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          เริ่มจากคำสั่งชุดนี้ในโปรเจกต์ทดลอง 1 โฟลเดอร์ เพื่อให้เห็นภาพการทำงานของ Git ตั้งแต่ต้นจนจบ
        </p>

        <pre className="mt-4 overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 p-4 text-xs text-cyan-200 md:text-sm">
          <code>{`git init
git status
git add .
git commit -m "เริ่มต้นบทเรียน"
git log --oneline`}</code>
        </pre>

        <div className="mt-5 grid gap-2">
          {starterCommands.map((item) => (
            <div
              key={item.cmd}
              className="grid gap-1 rounded-lg border border-slate-700 bg-slate-900/70 p-3 md:grid-cols-[220px_1fr]"
            >
              <code className="font-semibold text-cyan-300">{item.cmd}</code>
              <p className="text-sm text-slate-300">{item.meaning}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
