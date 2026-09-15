import { useEffect, useRef, useState } from "react";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";

type BranchNamingCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

type BranchNamingRule = {
  id: string;
  title: string;
  description: string;
};

type BranchNamingExample = {
  label: string;
  value: string;
};

type BranchNamingLabCommand = {
  command: string;
  description: string;
};

type BranchNamingLabStep = {
  id: string;
  title: string;
  task: string;
  commands: BranchNamingLabCommand[];
  checkpoint: string;
  notes?: string[];
};

const BRANCH_NAMING_COMMAND_DOCS: BranchNamingCommandDoc[] = [
  {
    id: "create-feature-branch",
    title: "สร้าง feature branch ใหม่",
    purpose: "เริ่มพัฒนางานใหม่แบบแยกจาก main",
    command: "git switch -c feature/<name>",
    description:
      "ใช้สร้าง branch สำหรับฟีเจอร์ เช่น git switch -c feature/auth-login",
  },
  {
    id: "create-fix-branch",
    title: "สร้าง fix branch สำหรับแก้บั๊ก",
    purpose: "แยกงานแก้บั๊กให้ชัดเจนและรีวิวง่าย",
    command: "git switch -c fix/<name>",
    description:
      "ตั้งชื่อสื่อ bug ที่แก้ เช่น git switch -c fix/token-refresh-loop",
  },
  {
    id: "create-chore-branch",
    title: "สร้าง chore branch สำหรับงานบำรุงรักษา",
    purpose: "แยกงานปรับ config/tooling ออกจากฟีเจอร์หลัก",
    command: "git switch -c chore/<name>",
    description:
      "เช่น git switch -c chore/update-eslint-rules",
  },
  {
    id: "list-local-branches",
    title: "ดู branch ในเครื่อง",
    purpose: "เช็กว่าตอนนี้มี branch อะไรและอยู่ branch ไหน",
    command: "git branch",
    description:
      "แสดงรายการ local branches โดย branch ปัจจุบันจะมีเครื่องหมาย *",
  },
  {
    id: "list-all-branches",
    title: "ดูทั้ง local และ remote branches",
    purpose: "เช็กชื่อ branch ทั้งหมดก่อน push/pull",
    command: "git branch -a",
    description:
      "แสดงทั้ง local และ remote-tracking branches เช่น remotes/origin/main",
  },
  {
    id: "push-upstream",
    title: "push branch พร้อมตั้ง upstream",
    purpose: "ตั้งค่าความสัมพันธ์ branch ครั้งแรกเพื่อ push/pull รอบต่อไปสั้นลง",
    command: "git push -u origin <branch-name>",
    description:
      "เช่น git push -u origin feature/auth-login",
  },
];

const BRANCH_NAMING_RULES: BranchNamingRule[] = [
  {
    id: "rule-prefix",
    title: "ใช้ prefix ตามประเภทงาน",
    description:
      "แนะนำใช้ feature/, fix/, chore/, docs/, refactor/ เพื่อให้ทีมอ่าน intent ได้ทันที",
  },
  {
    id: "rule-lowercase-kebab",
    title: "ใช้ lowercase + kebab-case",
    description:
      "ลดปัญหาอ่านยากและความสับสนระหว่างระบบ เช่น feature/auth-login",
  },
  {
    id: "rule-no-space-special",
    title: "หลีกเลี่ยงช่องว่างและอักขระพิเศษ",
    description:
      "ไม่ควรใช้ space หรือสัญลักษณ์แปลกๆ ที่อาจชนกับ shell/CI pipeline",
  },
  {
    id: "rule-meaningful-short",
    title: "ชื่อสั้นแต่สื่อเป้าหมายชัด",
    description:
      "เน้นคำที่สรุปงานได้ทันที เช่น fix/token-refresh-loop",
  },
  {
    id: "rule-issue-suffix",
    title: "ผูก issue ได้ด้วย suffix",
    description:
      "ถ้าทีมใช้ ticketing ให้ต่อท้ายเลข issue เช่น feature/auth-login-123",
  },
];

const BRANCH_NAMING_GOOD_EXAMPLES: BranchNamingExample[] = [
  { label: "Good", value: "feature/auth-login" },
  { label: "Good", value: "fix/token-refresh-loop" },
  { label: "Good", value: "docs/setup-guide" },
];

const BRANCH_NAMING_BAD_EXAMPLES: BranchNamingExample[] = [
  { label: "Bad", value: "Feature/Login" },
  { label: "Bad", value: "my branch" },
  { label: "Bad", value: "fixBugNow" },
  { label: "Bad", value: "branch1" },
];

const BRANCH_NAMING_LAB_STEPS: BranchNamingLabStep[] = [
  {
    id: "lab-step-1",
    title: "Step 1: เตรียม lab repo และ commit แรก",
    task: "สร้างโฟลเดอร์ทดลองสำหรับฝึกตั้งชื่อ branch",
    commands: [
      {
        command: "mkdir branch-naming-lab",
        description: "สร้างโฟลเดอร์ทดลอง",
      },
      {
        command: "cd branch-naming-lab",
        description: "เข้าโฟลเดอร์ทดลอง",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository พร้อม branch เริ่มต้นเป็น main",
      },
      {
        command: "echo \"# Branch Naming Lab\" > README.md",
        description: "สร้าง README เริ่มต้น",
      },
      {
        command: "git add .",
        description: "stage ไฟล์ทั้งหมด",
      },
      {
        command: "git commit -m \"chore: initial commit\"",
        description: "สร้าง commit แรก",
      },
    ],
    checkpoint: "รัน git branch แล้วต้องเห็น * main",
  },
  {
    id: "lab-step-2",
    title: "Step 2: สร้าง branch ชื่อดีแบบ feature",
    task: "ฝึกตั้งชื่อ branch ฟีเจอร์ตาม convention",
    commands: [
      {
        command: "git switch -c feature/auth-login",
        description: "สร้างและสลับไป feature/auth-login",
      },
      {
        command: "git branch",
        description: "ตรวจว่าอยู่บน * feature/auth-login",
      },
    ],
    checkpoint: "ชื่อ branch ต้องเป็น lowercase และมี prefix feature/",
  },
  {
    id: "lab-step-3",
    title: "Step 3: สร้าง branch แก้บั๊ก",
    task: "ฝึก naming pattern สำหรับ bug fix",
    commands: [
      {
        command: "git switch main",
        description: "กลับ main ก่อนสร้าง branch ใหม่",
      },
      {
        command: "git switch -c fix/token-refresh-loop",
        description: "สร้าง branch แก้บั๊กที่สื่อปัญหาชัดเจน",
      },
      {
        command: "git branch",
        description: "ตรวจรายการ branch ที่มี",
      },
    ],
    checkpoint: "ต้องเห็นทั้ง feature/auth-login และ fix/token-refresh-loop",
  },
  {
    id: "lab-step-4",
    title: "Step 4: ทดลองชื่อไม่ดีแล้วปรับใหม่",
    task: "ให้เห็นความต่างระหว่างชื่อไม่ดีและชื่อที่แนะนำ",
    commands: [
      {
        command: "git switch -c my branch",
        description: "ตัวอย่างชื่อไม่ดี (มีช่องว่าง) ที่ควรหลีกเลี่ยง",
      },
      {
        command: "git switch -c chore/update-eslint-rules",
        description: "ปรับเป็นชื่อที่ถูกต้องตาม convention",
      },
    ],
    notes: [
      "คำสั่งแรกมีแนวโน้ม fail เพราะชื่อ branch มีช่องว่าง",
      "ถ้าทีมมี naming policy ให้ยึด policy ทีมเป็นหลัก",
    ],
    checkpoint: "ต้องสามารถสร้าง branch ชื่อ chore/update-eslint-rules ได้",
  },
  {
    id: "lab-step-5",
    title: "Step 5: push branch พร้อม upstream",
    task: "ฝึกส่ง branch ชื่อดีขึ้น remote",
    commands: [
      {
        command: "git push -u origin fix/token-refresh-loop",
        description: "push และตั้ง upstream ของ branch ปัจจุบัน",
      },
      {
        command: "git branch -a",
        description: "ตรวจว่า remote-tracking branch ปรากฏแล้ว",
      },
    ],
    checkpoint: "ต้องเห็น remotes/origin/fix/token-refresh-loop",
  },
  {
    id: "lab-step-6",
    title: "Step 6: cleanup โฟลเดอร์ทดลอง",
    task: "ลบ lab หลังทดลองเสร็จ",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ branch-naming-lab",
      },
      {
        command: "rm -rf branch-naming-lab",
        description: "ลบโฟลเดอร์ทดลองทั้งหมด",
      },
    ],
    notes: [
      "ตรวจ path ให้ถูกต้องก่อนรัน rm -rf",
    ],
    checkpoint: "โฟลเดอร์ branch-naming-lab ถูกลบเรียบร้อย",
  },
];

export default function BranchNamingPage() {
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});
  const copyResetTimerRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const timerRegistry = copyResetTimerRef.current;
    return () => {
      Object.values(timerRegistry).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  const scheduleStatusReset = (commandKey: string) => {
    const previousTimerId = copyResetTimerRef.current[commandKey];
    if (previousTimerId) {
      window.clearTimeout(previousTimerId);
    }

    copyResetTimerRef.current[commandKey] = window.setTimeout(() => {
      setCopyStatusByCommand((prev) => ({
        ...prev,
        [commandKey]: undefined,
      }));
    }, 1500);
  };

  const handleCopyCommand = async (commandKey: string, command: string) => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable");
      }
      await navigator.clipboard.writeText(command);
      setCopyStatusByCommand((prev) => ({
        ...prev,
        [commandKey]: "copied",
      }));
    } catch {
      setCopyStatusByCommand((prev) => ({
        ...prev,
        [commandKey]: "error",
      }));
    } finally {
      scheduleStatusReset(commandKey);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SetupGuideHeader
        badge="Branching"
        title="Feature Branch Naming: ตั้งชื่อสาขาให้ทีมอ่านแล้วเข้าใจทันที"
        description="ตั้งชื่อ branch ให้สื่อ intent ตั้งแต่ชื่อแรก ช่วยให้ review ง่าย ค้นย้อนหลังเร็ว และลดความสับสนในงานทีม"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่งหลักที่ใช้สร้าง branch ตาม naming convention และส่งขึ้น remote
        </p>

        <div className="mt-4 space-y-4">
          {BRANCH_NAMING_COMMAND_DOCS.map((doc) => {
            const commandKey = `doc-${doc.id}`;
            const status = copyStatusByCommand[commandKey];

            return (
              <article key={doc.id} className="rounded-xl border border-border bg-muted/30 p-4">
                <h3 className="text-base font-bold text-foreground">{doc.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">สำหรับ:</span> {doc.purpose}
                </p>
                <div className="mt-3">
                  <CommandBlock
                    command={doc.command}
                    status={status}
                    onCopy={() => handleCopyCommand(commandKey, doc.command)}
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {doc.description}
                </p>
                {doc.notes?.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {doc.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Branch Naming Rules</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ใช้กติกาตั้งชื่อที่สม่ำเสมอเพื่อลดความสับสนของทีมในระยะยาว
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-foreground">
              {BRANCH_NAMING_RULES.map((rule) => (
                <li key={rule.id}>
                  <span className="font-semibold">{rule.title}:</span>{" "}
                  <span className="text-muted-foreground">{rule.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Good Examples
              </h3>
              <ul className="mt-2 space-y-1 font-mono text-sm text-foreground">
                {BRANCH_NAMING_GOOD_EXAMPLES.map((item) => (
                  <li key={item.value}>{item.value}</li>
                ))}
              </ul>
            </article>

            <article className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                Bad Examples
              </h3>
              <ul className="mt-2 space-y-1 font-mono text-sm text-foreground">
                {BRANCH_NAMING_BAD_EXAMPLES.map((item) => (
                  <li key={item.value}>{item.value}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ฝึกตั้งชื่อ branch ตาม convention จริงบนเครื่อง เพื่อให้ flow ในทีมใช้งานร่วมกันได้ทันที
        </p>

        <ol className="mt-4 space-y-4">
          {BRANCH_NAMING_LAB_STEPS.map((step, stepIndex) => (
            <li key={step.id} className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {stepIndex + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    <span className="font-semibold text-foreground">Task:</span> {step.task}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {step.commands.map((commandItem, commandIndex) => {
                  const commandKey = `lab-${step.id}-${commandIndex}`;
                  const status = copyStatusByCommand[commandKey];

                  return (
                    <div key={commandKey} className="space-y-2">
                      <CommandBlock
                        command={commandItem.command}
                        status={status}
                        onCopy={() =>
                          handleCopyCommand(commandKey, commandItem.command)
                        }
                      />
                      <p className="px-1 text-sm leading-6 text-muted-foreground">
                        {commandItem.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {step.notes?.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {step.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Checkpoint
                </p>
                <p className="mt-1 text-sm text-foreground">{step.checkpoint}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
