import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  GIT_RESTORE_COMMAND_DOCS,
  GIT_RESTORE_INITIAL_FILES,
  GIT_RESTORE_LAB_STEPS,
  type GitRestoreSimulatorFile,
} from "@/features/undo-history/constants/git-restore-content.constant";

type SnapshotKey = "HEAD" | "HEAD~1";

type GitStatusTone =
  | "branch"
  | "section-staged"
  | "section-working"
  | "section-untracked"
  | "hint"
  | "entry-staged"
  | "entry-working"
  | "entry-untracked"
  | "clean"
  | "normal";

type GitStatusLine = {
  text: string;
  tone: GitStatusTone;
};

const GIT_STATUS_TONE_CLASS: Record<GitStatusTone, string> = {
  branch: "text-cyan-300",
  "section-staged": "text-emerald-300 font-semibold",
  "section-working": "text-amber-300 font-semibold",
  "section-untracked": "text-rose-300 font-semibold",
  hint: "text-slate-400",
  "entry-staged": "text-emerald-200",
  "entry-working": "text-amber-200",
  "entry-untracked": "text-rose-200",
  clean: "text-emerald-300",
  normal: "text-slate-200",
};

const cloneInitialFiles = () =>
  GIT_RESTORE_INITIAL_FILES.map((file) => ({ ...file }));

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const waitNextPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });

const getChangeLabel = (file: GitRestoreSimulatorFile) =>
  file.changeType === "new" ? "new file" : "modified";

const getWorkingEntryName = (file: GitRestoreSimulatorFile) =>
  file.sourceRef === "HEAD~1" ? `${file.name} (from HEAD~1)` : file.name;

const renderGitStatusLines = (files: GitRestoreSimulatorFile[]) => {
  const staged = files.filter((file) => file.state === "staged");
  const working = files.filter((file) => file.state === "working");
  const workingModified = working.filter((file) => file.changeType === "modified");
  const workingNew = working.filter((file) => file.changeType === "new");

  const lines: GitStatusLine[] = [
    { text: "On branch main", tone: "branch" },
    { text: "", tone: "normal" },
  ];

  if (staged.length) {
    lines.push(
      { text: "Changes to be committed:", tone: "section-staged" },
      { text: '  (use "git restore --staged <file>..." to unstage)', tone: "hint" },
      { text: "", tone: "normal" },
    );
    staged.forEach((file) => {
      lines.push({
        text: `\t${getChangeLabel(file)}:\t${file.name}`,
        tone: "entry-staged",
      });
    });
    lines.push({ text: "", tone: "normal" });
  }

  if (workingModified.length) {
    lines.push(
      { text: "Changes not staged for commit:", tone: "section-working" },
      { text: '  (use "git add <file>..." to update what will be committed)', tone: "hint" },
      { text: "", tone: "normal" },
    );
    workingModified.forEach((file) => {
      lines.push({
        text: `\tmodified:\t${getWorkingEntryName(file)}`,
        tone: "entry-working",
      });
    });
    lines.push({ text: "", tone: "normal" });
  }

  if (workingNew.length) {
    lines.push(
      { text: "Untracked files:", tone: "section-untracked" },
      { text: '  (use "git add <file>..." to include in what will be committed)', tone: "hint" },
      { text: "", tone: "normal" },
    );
    workingNew.forEach((file) => {
      lines.push({
        text: `\t${getWorkingEntryName(file)}`,
        tone: "entry-untracked",
      });
    });
    lines.push({ text: "", tone: "normal" });
  }

  if (!staged.length && !working.length) {
    lines.push({
      text: "nothing to commit, working tree clean",
      tone: "clean",
    });
  }

  return lines;
};

export default function GitRestorePage() {
  const [files, setFiles] = useState<GitRestoreSimulatorFile[]>(cloneInitialFiles);
  const [lastCommand, setLastCommand] = useState<string>("ยังไม่ได้รันคำสั่ง");
  const [simMessage, setSimMessage] = useState<string>(
    "ลองกดคำสั่ง restore เพื่อดูผลว่าไฟล์ถูกย้ายหรือคืนค่าอย่างไรในแต่ละพื้นที่",
  );
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});

  const filesRef = useRef<GitRestoreSimulatorFile[]>(cloneInitialFiles());
  const copyResetTimerRef = useRef<Record<string, number>>({});
  const workingRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stagedRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const snapshotRefs = useRef<Record<SnapshotKey, HTMLDivElement | null>>({
    HEAD: null,
    "HEAD~1": null,
  });

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

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

  const animateBetweenWorkingAndStaged = async (
    fileId: string,
    toState: "working" | "staged",
    delay = 0,
  ) => {
    if (delay > 0) {
      await wait(delay);
    }

    const currentFile = filesRef.current.find((file) => file.id === fileId);
    if (
      !currentFile ||
      currentFile.state === toState ||
      currentFile.state === "clean"
    ) {
      return false;
    }

    const fromRegistry =
      currentFile.state === "working" ? workingRefs.current : stagedRefs.current;
    const toRegistry = toState === "working" ? workingRefs.current : stagedRefs.current;

    const sourceElement = fromRegistry[fileId];
    const fromRect = sourceElement?.getBoundingClientRect();

    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              state: toState,
              sourceRef: "HEAD",
            }
          : file,
      ),
    );

    await waitNextPaint();

    const targetElement = toRegistry[fileId];
    if (!fromRect || !targetElement) {
      return true;
    }

    const toRect = targetElement.getBoundingClientRect();
    const cloneBase = sourceElement ?? targetElement;
    const cloneElement = cloneBase.cloneNode(true) as HTMLDivElement;

    cloneElement.style.position = "fixed";
    cloneElement.style.left = `${fromRect.left}px`;
    cloneElement.style.top = `${fromRect.top}px`;
    cloneElement.style.width = `${fromRect.width}px`;
    cloneElement.style.height = `${fromRect.height}px`;
    cloneElement.style.margin = "0";
    cloneElement.style.zIndex = "9999";
    cloneElement.style.pointerEvents = "none";

    document.body.appendChild(cloneElement);

    const previousOpacity = targetElement.style.opacity;
    targetElement.style.opacity = "0";

    try {
      await animate(cloneElement, {
        translateX: [0, toRect.left - fromRect.left],
        translateY: [0, toRect.top - fromRect.top],
        scale: [1, 0.97, 1],
        opacity: [1, 0.85, 1],
        duration: 320,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
      targetElement.style.opacity = previousOpacity;
    }

    return true;
  };

  const animateFileToSnapshot = async (
    fileId: string,
    snapshotKey: SnapshotKey,
  ) => {
    const currentFile = filesRef.current.find((file) => file.id === fileId);
    if (!currentFile || currentFile.state === "clean") {
      return false;
    }

    const fromRegistry =
      currentFile.state === "working" ? workingRefs.current : stagedRefs.current;
    const sourceElement = fromRegistry[fileId];
    const fromRect = sourceElement?.getBoundingClientRect();

    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              state: "clean",
              sourceRef: snapshotKey,
            }
          : file,
      ),
    );

    await waitNextPaint();

    const snapshotElement = snapshotRefs.current[snapshotKey];
    if (!sourceElement || !fromRect || !snapshotElement) {
      return true;
    }

    const snapshotRect = snapshotElement.getBoundingClientRect();
    const targetX =
      snapshotRect.left + snapshotRect.width / 2 - fromRect.left - fromRect.width / 2;
    const targetY =
      snapshotRect.top + snapshotRect.height / 2 - fromRect.top - fromRect.height / 2;
    const cloneElement = sourceElement.cloneNode(true) as HTMLDivElement;

    cloneElement.style.position = "fixed";
    cloneElement.style.left = `${fromRect.left}px`;
    cloneElement.style.top = `${fromRect.top}px`;
    cloneElement.style.width = `${fromRect.width}px`;
    cloneElement.style.height = `${fromRect.height}px`;
    cloneElement.style.margin = "0";
    cloneElement.style.zIndex = "9999";
    cloneElement.style.pointerEvents = "none";

    document.body.appendChild(cloneElement);

    try {
      await animate(cloneElement, {
        translateX: [0, targetX],
        translateY: [0, targetY],
        scale: [1, 0.95, 0.9],
        opacity: [1, 0.8, 0.2],
        duration: 340,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
    }

    return true;
  };

  const animateSnapshotToWorking = async (
    fileId: string,
    snapshotKey: SnapshotKey,
  ) => {
    const snapshotElement = snapshotRefs.current[snapshotKey];
    const snapshotRect = snapshotElement?.getBoundingClientRect();

    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              state: "working",
              sourceRef: snapshotKey,
            }
          : file,
      ),
    );

    await waitNextPaint();

    const targetElement = workingRefs.current[fileId];
    if (!snapshotRect || !targetElement) {
      return true;
    }

    const toRect = targetElement.getBoundingClientRect();
    const startLeft = snapshotRect.left + snapshotRect.width / 2 - toRect.width / 2;
    const startTop = snapshotRect.top + snapshotRect.height / 2 - toRect.height / 2;
    const targetX = toRect.left - startLeft;
    const targetY = toRect.top - startTop;
    const cloneElement = targetElement.cloneNode(true) as HTMLDivElement;

    cloneElement.style.position = "fixed";
    cloneElement.style.left = `${startLeft}px`;
    cloneElement.style.top = `${startTop}px`;
    cloneElement.style.width = `${toRect.width}px`;
    cloneElement.style.height = `${toRect.height}px`;
    cloneElement.style.margin = "0";
    cloneElement.style.zIndex = "9999";
    cloneElement.style.pointerEvents = "none";

    document.body.appendChild(cloneElement);

    const previousOpacity = targetElement.style.opacity;
    targetElement.style.opacity = "0";

    try {
      await animate(cloneElement, {
        translateX: [0, targetX],
        translateY: [0, targetY],
        scale: [0.9, 0.98, 1],
        opacity: [0.35, 0.9, 1],
        duration: 340,
        ease: "outQuad",
      });
    } finally {
      cloneElement.remove();
      targetElement.style.opacity = previousOpacity;
    }

    return true;
  };

  const onAddAppTs = async () => {
    setLastCommand("git add app.ts");
    const moved = await animateBetweenWorkingAndStaged("app-ts", "staged");
    setSimMessage(
      moved ? "นำ app.ts เข้า Staging Area แล้ว" : "app.ts อยู่ใน Staging Area อยู่แล้ว",
    );
  };

  const onUnstageAppTs = async () => {
    setLastCommand("git restore --staged app.ts");
    const moved = await animateBetweenWorkingAndStaged("app-ts", "working");
    setSimMessage(
      moved
        ? "ย้าย app.ts ออกจาก Staging Area กลับมา Working Directory แล้ว"
        : "app.ts ยังไม่ได้อยู่ใน Staging Area",
    );
  };

  const onRestoreConfigTs = async () => {
    setLastCommand("git restore config.ts");
    const restored = await animateFileToSnapshot("config-ts", "HEAD");
    setSimMessage(
      restored
        ? "ทิ้งการแก้ config.ts แล้ว และคืนค่าตาม HEAD เรียบร้อย"
        : "config.ts อยู่สถานะ clean อยู่แล้ว",
    );
  };

  const onRestoreFromHeadPrev = async () => {
    setLastCommand("git restore --source=HEAD~1 app.ts");
    const restored = await animateSnapshotToWorking("app-ts", "HEAD~1");
    setSimMessage(
      restored
        ? "แทน app.ts ด้วย snapshot จาก HEAD~1 แล้ว (อยู่ฝั่ง Working Directory)"
        : "ไม่สามารถดึง app.ts จาก HEAD~1 ได้",
    );
  };

  const onResetDemo = () => {
    setLastCommand("Reset Demo");
    setFiles(cloneInitialFiles());
    setSimMessage("รีเซ็ตสถานะจำลองแล้ว พร้อมลองคำสั่งใหม่");
  };

  const workingFiles = useMemo(
    () => files.filter((file) => file.state === "working"),
    [files],
  );
  const stagedFiles = useMemo(
    () => files.filter((file) => file.state === "staged"),
    [files],
  );
  const cleanFiles = useMemo(
    () => files.filter((file) => file.state === "clean"),
    [files],
  );
  const statusLines = useMemo(() => renderGitStatusLines(files), [files]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <SetupGuideHeader
        badge="Undo & History"
        title="git restore: ดึงไฟล์กลับอย่างปลอดภัยจาก Staging/History"
        description="git restore ใช้คืนสถานะไฟล์ทั้งใน Working Directory และ Staging Area ควรเช็ก git status ก่อนทุกครั้งเพื่อไม่เผลอทิ้งงานที่ยังต้องใช้"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          คำสั่งหลักของ git restore ที่ใช้บ่อยในการ unstage, discard และดึงไฟล์จาก commit ก่อนหน้า
        </p>

        <div className="mt-4 space-y-4">
          {GIT_RESTORE_COMMAND_DOCS.map((doc) => {
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
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Interactive Restore Simulator</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          จำลอง flow ของการย้ายไฟล์ระหว่าง Working Directory, Staging Area และการคืนค่าจาก snapshot
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={onAddAppTs}>
            git add app.ts
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onUnstageAppTs}>
            git restore --staged app.ts
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onRestoreConfigTs}>
            git restore config.ts
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onRestoreFromHeadPrev}
          >
            git restore --source=HEAD~1 app.ts
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onResetDemo}>
            Reset Demo
          </Button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Working Directory</h3>
            <div className="mt-3 space-y-2">
              {workingFiles.length ? (
                workingFiles.map((file) => (
                  <div
                    key={file.id}
                    ref={(element) => {
                      workingRefs.current[file.id] = element;
                    }}
                    className="rounded-lg border border-amber-300/35 bg-amber-400/10 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.changeType} · source: {file.sourceRef}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                  ไม่มีไฟล์ค้างใน Working Directory
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Staging Area</h3>
            <div className="mt-3 space-y-2">
              {stagedFiles.length ? (
                stagedFiles.map((file) => (
                  <div
                    key={file.id}
                    ref={(element) => {
                      stagedRefs.current[file.id] = element;
                    }}
                    className="rounded-lg border border-primary/35 bg-primary/10 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.changeType} · source: {file.sourceRef}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                  ยังไม่มีไฟล์ใน Staging Area
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-bold text-foreground">Source Snapshots</h3>
            <div className="mt-3 space-y-2">
              <div
                ref={(element) => {
                  snapshotRefs.current.HEAD = element;
                }}
                className="rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-3 py-3"
              >
                <p className="text-sm font-semibold text-foreground">HEAD</p>
                <p className="text-xs text-muted-foreground">
                  snapshot ล่าสุดของ branch ปัจจุบัน
                </p>
              </div>
              <div
                ref={(element) => {
                  snapshotRefs.current["HEAD~1"] = element;
                }}
                className="rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-3"
              >
                <p className="text-sm font-semibold text-foreground">HEAD~1</p>
                <p className="text-xs text-muted-foreground">
                  snapshot จาก commit ก่อนหน้าหนึ่งขั้น
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Last command
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{lastCommand}</p>
          <p className="mt-1 text-sm text-muted-foreground">{simMessage}</p>

          {cleanFiles.length ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Clean files: {cleanFiles.map((file) => file.name).join(", ")}
            </p>
          ) : null}

          <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-black p-3 font-mono text-xs md:text-sm">
            {statusLines.map((line, index) => (
              <p
                key={`${index}-${line.text}`}
                className={`leading-6 whitespace-pre ${GIT_STATUS_TONE_CLASS[line.tone]}`}
              >
                {line.text || " "}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Mini Lab</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทำตามลำดับนี้บนเครื่องจริงเพื่อเข้าใจการ restore ทั้งแบบ staged, working และ from
          source
        </p>

        <ol className="mt-4 space-y-3">
          {GIT_RESTORE_LAB_STEPS.map((step, index) => (
            <li key={step.id} className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">
                {index + 1}. {step.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Task:</span> {step.task}
              </p>

              <div className="mt-3 space-y-3">
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

              <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
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
