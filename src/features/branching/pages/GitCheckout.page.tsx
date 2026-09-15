import { useEffect, useRef, useState } from "react";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";

type GitCheckoutCommandDoc = {
  id: string;
  title: string;
  purpose: string;
  command: string;
  description: string;
  notes?: string[];
};

type GitCheckoutRule = {
  id: string;
  title: string;
  description: string;
};

type GitCheckoutLabCommand = {
  command: string;
  description: string;
};

type GitCheckoutLabStep = {
  id: string;
  title: string;
  task: string;
  commands: GitCheckoutLabCommand[];
  checkpoint: string;
  notes?: string[];
};

const GIT_CHECKOUT_COMMAND_DOCS: GitCheckoutCommandDoc[] = [
  {
    id: "checkout-branch",
    title: "สลับไปยัง branch ที่มีอยู่",
    purpose: "ย้าย context ไปทำงานอีก branch แบบ legacy command",
    command: "git checkout <branch-name>",
    description:
      "ใช้สลับ branch เช่น git checkout main หรือ git checkout feature/login",
    notes: [
      "สำหรับ workflow ใหม่ แนะนำใช้ `git switch <branch-name>` เพราะชัดเจนกว่า",
    ],
  },
  {
    id: "checkout-create-branch",
    title: "สร้าง branch ใหม่พร้อมสลับทันที",
    purpose: "เริ่มฟีเจอร์ใหม่จากตำแหน่งปัจจุบันด้วยคำสั่งเดียว",
    command: "git checkout -b <new-branch-name>",
    description:
      "สร้าง branch ใหม่และ switch ทันที เช่น git checkout -b feature/checkout-demo",
    notes: [
      "สำหรับ workflow ใหม่ เทียบเท่ากับ `git switch -c <new-branch-name>`",
    ],
  },
  {
    id: "checkout-discard-file",
    title: "คืนไฟล์ใน working tree กลับตาม HEAD",
    purpose: "ทิ้งการแก้ไขของไฟล์ที่ยังไม่ต้องการเก็บ",
    command: "git checkout -- <file>",
    description:
      "คืนไฟล์กลับเป็นเวอร์ชันล่าสุดใน HEAD เช่น git checkout -- README.md",
    notes: [
      "คำสั่งนี้ทิ้งการแก้ที่ยังไม่ commit ของไฟล์นั้นทันที",
      "สำหรับ workflow ใหม่ แนะนำใช้ `git restore <file>`",
    ],
  },
  {
    id: "checkout-file-from-old-commit",
    title: "ดึงไฟล์จาก commit เก่าเข้ามาใน working tree",
    purpose: "กู้เนื้อหาไฟล์จากจุดย้อนหลังแบบเจาะจงไฟล์",
    command: "git checkout HEAD~1 -- <file>",
    description:
      "ดึงไฟล์จาก commit ก่อนหน้า เช่น git checkout HEAD~1 -- README.md",
    notes: [
      "ควรเช็ก diff และสถานะหลังรันด้วย `git status`",
    ],
  },
  {
    id: "status-check",
    title: "ตรวจสถานะก่อนและหลัง checkout",
    purpose: "ลดความเสี่ยงทำงานหายก่อนสั่งคำสั่งที่กระทบไฟล์",
    command: "git status",
    description:
      "ดูว่าไฟล์ไหน modified/staged/untracked เพื่อยืนยันผลหลัง checkout",
  },
  {
    id: "branch-check",
    title: "ตรวจ branch ปัจจุบัน",
    purpose: "ยืนยันตำแหน่งการทำงานก่อน commit หรือ checkout ต่อ",
    command: "git branch",
    description:
      "ดูรายชื่อ branch และเครื่องหมาย * ที่บอก branch ปัจจุบัน",
  },
];

const GIT_CHECKOUT_RULES: GitCheckoutRule[] = [
  {
    id: "legacy-role",
    title: "checkout เป็นคำสั่ง legacy ที่รวมหลายความหมาย",
    description:
      "อดีตใช้ checkout ทั้งสลับ branch และคืนไฟล์ ทำให้สับสนง่ายกว่าคำสั่งแยกหน้าที่",
  },
  {
    id: "switch-mapping",
    title: "สลับ branch ใช้ switch จะชัดกว่า",
    description:
      "`git checkout <branch>` เทียบได้กับ `git switch <branch>` และ `git checkout -b ...` เทียบได้กับ `git switch -c ...`",
  },
  {
    id: "restore-mapping",
    title: "คืนไฟล์ใช้ restore จะปลอดภัยกว่า",
    description:
      "`git checkout -- <file>` เทียบกับ `git restore <file>` ซึ่งสื่อ intent ว่ากำลังคืนไฟล์โดยตรง",
  },
  {
    id: "when-to-use-checkout",
    title: "ใช้ checkout เมื่ออ่านเอกสารเก่าหรือเจอ workflow เดิม",
    description:
      "ถ้าโค้ดเบสหรือคู่มือทีมยังใช้ checkout อยู่ ให้เข้าใจ mapping ไป switch/restore เพื่ออ่านและทำงานต่อได้ถูกต้อง",
  },
];

const GIT_CHECKOUT_LAB_STEPS: GitCheckoutLabStep[] = [
  {
    id: "lab-step-1",
    title: "Step 1: เตรียม lab repo และ commit แรก",
    task: "สร้างพื้นที่ทดลองแยกออกจากโปรเจกต์จริง",
    commands: [
      {
        command: "mkdir git-checkout-lab",
        description: "สร้างโฟลเดอร์ทดลอง",
      },
      {
        command: "cd git-checkout-lab",
        description: "เข้าโฟลเดอร์ทดลอง",
      },
      {
        command: "git init -b main",
        description: "เริ่ม repository พร้อม branch แรกเป็น main",
      },
      {
        command: "echo \"# Git Checkout Lab\" > README.md",
        description: "สร้างไฟล์เริ่มต้น",
      },
      {
        command: "git add README.md",
        description: "stage ไฟล์ README",
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
    title: "Step 2: สร้าง branch ใหม่ด้วย checkout",
    task: "ทดลอง legacy flow แบบสร้างและสลับ branch พร้อมกัน",
    commands: [
      {
        command: "git checkout -b feature/checkout-demo",
        description: "สร้าง branch ใหม่และย้ายไป branch นั้นทันที",
      },
      {
        command: "git branch",
        description: "ยืนยันว่าอยู่ * feature/checkout-demo",
      },
    ],
    checkpoint: "ต้องเห็น * feature/checkout-demo เป็น branch ปัจจุบัน",
  },
  {
    id: "lab-step-3",
    title: "Step 3: แก้ไฟล์และ commit บน feature branch",
    task: "สร้างงานใน branch ทดลองเพื่อให้เห็นผลตอนสลับกลับ main",
    commands: [
      {
        command: "echo \"checkout demo\" >> README.md",
        description: "เพิ่มเนื้อหาใน README",
      },
      {
        command: "git add README.md",
        description: "stage ไฟล์ที่แก้",
      },
      {
        command: "git commit -m \"feat(checkout): update readme\"",
        description: "commit งานใน feature branch",
      },
    ],
    checkpoint: "รัน git log --oneline -n 2 แล้วเห็น commit feat(checkout)",
  },
  {
    id: "lab-step-4",
    title: "Step 4: checkout กลับ main",
    task: "สลับ context กลับ branch หลัก",
    commands: [
      {
        command: "git checkout main",
        description: "สลับกลับ branch main",
      },
      {
        command: "git branch",
        description: "ตรวจว่าอยู่ที่ * main",
      },
    ],
    checkpoint: "ต้องเห็น * main",
  },
  {
    id: "lab-step-5",
    title: "Step 5: ทดลองคืนไฟล์ด้วย checkout --",
    task: "ดูผลการทิ้งการแก้ของไฟล์ใน working tree",
    commands: [
      {
        command: "echo \"temp line\" >> README.md",
        description: "สร้างการแก้ชั่วคราวใน README",
      },
      {
        command: "git status",
        description: "ตรวจว่า README.md เป็น modified",
      },
      {
        command: "git checkout -- README.md",
        description: "คืนไฟล์กลับตาม HEAD (ทิ้งการแก้ที่ยังไม่ commit)",
      },
      {
        command: "git status",
        description: "ยืนยันว่า working tree กลับมา clean",
      },
    ],
    checkpoint: "หลัง checkout -- README.md ต้องไม่เห็น README.md เป็น modified",
    notes: [
      "ถ้าไฟล์มีการแก้สำคัญ ควร stash หรือ commit ก่อน ไม่ควรทิ้งทันที",
    ],
  },
  {
    id: "lab-step-6",
    title: "Step 6: cleanup โฟลเดอร์ทดลอง",
    task: "ลบ lab หลังทดลองเสร็จ",
    commands: [
      {
        command: "cd ..",
        description: "ออกจากโฟลเดอร์ทดลอง",
      },
      {
        command: "rm -rf git-checkout-lab",
        description: "ลบโฟลเดอร์ทดลองทั้งหมด",
      },
    ],
    checkpoint: "ลบโฟลเดอร์ git-checkout-lab เรียบร้อย",
    notes: [
      "ตรวจ path ให้ถูกต้องก่อนใช้ rm -rf ทุกครั้ง",
    ],
  },
];

export default function GitCheckoutPage() {
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
        title="git checkout: เข้าใจคำสั่ง legacy และ mapping ไป switch/restore"
        description="git checkout เป็นคำสั่ง legacy ที่ครอบคลุมทั้งการสลับ branch และคืนไฟล์ ปัจจุบันแนะนำใช้ git switch และ git restore ในงานใหม่เพื่อให้ intent ชัดเจนกว่า"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่งหลักของ git checkout ที่มักพบในเอกสารและโค้ดเบสรุ่นเก่า
        </p>

        <div className="mt-4 space-y-4">
          {GIT_CHECKOUT_COMMAND_DOCS.map((doc) => {
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
        <h2 className="text-xl font-black tracking-tight text-foreground">Legacy Mapping</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ถ้าเจอ `git checkout` ในคู่มือเก่า ให้ map ความหมายไปคำสั่งแยกหน้าที่รุ่นใหม่
          เพื่อลดความสับสนในการใช้งานจริง
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
              Branch Mapping
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              `git checkout &lt;branch&gt;` เทียบได้กับ `git switch &lt;branch&gt;` และ
              `git checkout -b &lt;name&gt;` เทียบได้กับ `git switch -c &lt;name&gt;`
            </p>
          </article>

          <article className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
              File Mapping
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              `git checkout -- &lt;file&gt;` เทียบได้กับ `git restore &lt;file&gt;` สำหรับคืนไฟล์ใน
              working tree
            </p>
          </article>
        </div>

        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            คำแนะนำ
          </p>
          <p className="mt-1 text-sm leading-6 text-foreground">
            ผู้เริ่มต้นควรใช้ `git switch` และ `git restore` ในงานใหม่ และใช้ `git checkout`
            เมื่อจำเป็นต้องอ่าน/ทำตาม workflow เดิมเท่านั้น
          </p>
        </div>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {GIT_CHECKOUT_RULES.map((rule) => (
            <li key={rule.id}>
              <span className="font-semibold text-foreground">{rule.title}:</span>{" "}
              {rule.description}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Safety Notes</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ก่อนใช้ checkout กับไฟล์หรือ commit ให้ยืนยันผลกระทบก่อนเสมอ
        </p>
        <ul className="mt-4 list-disc space-y-2 rounded-xl border border-border bg-muted/30 p-4 pl-8 text-sm leading-6 text-foreground">
          <li>
            `git checkout -- &lt;file&gt;` จะทิ้งการแก้ใน working tree ของไฟล์นั้นทันที
          </li>
          <li>เช็ก `git status` ก่อนและหลัง checkout ทุกครั้ง</li>
          <li>การ checkout commit hash อาจทำให้เข้า detached HEAD</li>
          <li>ถ้าจะทำงานต่อจาก detached HEAD ให้สร้าง branch ใหม่ทันที</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทำตามลำดับนี้บนเครื่องจริงเพื่อฝึก checkout แบบ legacy และเห็นจุดที่ควรระวัง
        </p>

        <ol className="mt-4 space-y-4">
          {GIT_CHECKOUT_LAB_STEPS.map((step, stepIndex) => (
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
