import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Button } from "@/shared/components/ui/button";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import {
  GIT_ADD_COMMAND_DOCS,
  GIT_ADD_INITIAL_FILES,
  GIT_ADD_TUTORIAL_STEPS,
  type GitAddSimulatorFile,
} from "@/features/basic-git-command/constants/git-add-content.constant";

const cloneInitialFiles = () => GIT_ADD_INITIAL_FILES.map((file) => ({ ...file }));

const getFileLabelByType = (file: GitAddSimulatorFile) =>
  file.changeType === "new" ? "new" : "modified";

type GitStatusTone =
  | "branch"
  | "section-staged"
  | "section-working"
  | "section-untracked"
  | "hint"
  | "entry-staged"
  | "entry-working"
  | "entry-untracked"
  | "success"
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
  success: "text-emerald-300",
  normal: "text-slate-200",
};

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

const renderGitStatusLines = (files: GitAddSimulatorFile[]) => {
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
        text: `\t${getFileLabelByType(file)}:\t${file.name}`,
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
        text: `\t${getFileLabelByType(file)}:\t${file.name}`,
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
      lines.push({ text: `\t${file.name}`, tone: "entry-untracked" });
    });
    lines.push({ text: "", tone: "normal" });
  }

  if (!working.length && staged.length) {
    lines.push({
      text: "all tracked changes are staged and ready to commit",
      tone: "success",
    });
  }

  if (!working.length && !staged.length) {
    lines.push({
      text: "nothing to commit, working tree clean",
      tone: "success",
    });
  }

  return lines;
};

export default function GitAddPage() {
  const [files, setFiles] = useState<GitAddSimulatorFile[]>(cloneInitialFiles);
  const [lastCommand, setLastCommand] = useState<string>("ยังไม่ได้รันคำสั่ง");
  const [simMessage, setSimMessage] = useState<string>(
    "เริ่มจากกดปุ่มคำสั่งด้านล่างเพื่อดูไฟล์ย้ายจาก Working Directory ไป Staging Area",
  );
  const [copyStatusByCommand, setCopyStatusByCommand] = useState<
    Record<string, CommandCopyStatus | undefined>
  >({});

  const filesRef = useRef<GitAddSimulatorFile[]>(cloneInitialFiles());
  const copyResetTimerRef = useRef<Record<string, number>>({});
  const workingRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stagedRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const moveFileWithAnimation = async (
    fileId: string,
    toState: GitAddSimulatorFile["state"],
    delay = 0,
  ) => {
    if (delay > 0) {
      await wait(delay);
    }

    const currentFile = filesRef.current.find((file) => file.id === fileId);
    if (!currentFile || currentFile.state === toState) {
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

  const onAddSingleFile = async (fileId: string, command: string) => {
    setLastCommand(command);
    const moved = await moveFileWithAnimation(fileId, "staged");
    setSimMessage(
      moved
        ? `ย้าย ${command.replace("git add ", "")} ไป Staging Area แล้ว`
        : "ไฟล์นี้อยู่ใน Staging Area อยู่แล้ว",
    );
  };

  const onAddAll = async () => {
    setLastCommand("git add .");
    const workingFileIds = filesRef.current
      .filter((file) => file.state === "working")
      .map((file) => file.id);

    if (!workingFileIds.length) {
      setSimMessage("ไม่มีไฟล์ใน Working Directory ให้เพิ่มแล้ว");
      return;
    }

    const results = await Promise.all(
      workingFileIds.map((fileId, index) =>
        moveFileWithAnimation(fileId, "staged", index * 90),
      ),
    );

    const movedCount = results.filter(Boolean).length;
    setSimMessage(`ย้ายไฟล์ ${movedCount} รายการเข้า Staging Area แล้ว`);
  };

  const onUnstageAppTs = async () => {
    const command = "git restore --staged app.ts";
    setLastCommand(command);
    const moved = await moveFileWithAnimation("app-ts", "working");
    setSimMessage(
      moved
        ? "นำ app.ts ออกจาก Staging Area กลับไป Working Directory แล้ว"
        : "app.ts ยังไม่ได้อยู่ใน Staging Area",
    );
  };

  const onResetDemo = () => {
    setLastCommand("Reset Demo");
    setFiles(cloneInitialFiles());
    setSimMessage("รีเซ็ตสถานะจำลองเรียบร้อย พร้อมเริ่มใหม่");
  };

  const workingFiles = useMemo(
    () => files.filter((file) => file.state === "working"),
    [files],
  );
  const stagedFiles = useMemo(
    () => files.filter((file) => file.state === "staged"),
    [files],
  );
  const gitStatusLines = useMemo(() => renderGitStatusLines(files), [files]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <SetupGuideHeader
        badge="Commit Workflow"
        title="git add: ย้ายไฟล์จาก Working Directory ไป Staging Area"
        description="หน้านี้เป็น simulator ให้ทดลองกดคำสั่ง git add แล้วเห็นการย้ายไฟล์เข้า Staging Area แบบภาพเคลื่อนไหว เพื่อเข้าใจก่อน commit จริง"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">Command Explanation</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ทำความเข้าใจคำสั่งพื้นฐานของการ stage ไฟล์ก่อน commit และ copy ไปทดลองได้ทันที
        </p>

        <div className="mt-4 space-y-4">
          {GIT_ADD_COMMAND_DOCS.map((doc) => {
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
        <h2 className="text-xl font-black tracking-tight text-foreground">Interactive Simulator</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Working Directory คือไฟล์ที่แก้ในเครื่อง และ Staging Area คือไฟล์ที่เตรียมเข้า commit
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => onAddSingleFile("app-ts", "git add app.ts")}>
            git add app.ts
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onAddSingleFile("readme-md", "git add README.md")}
          >
            git add README.md
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onAddAll}>
            git add .
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onUnstageAppTs}>
            git restore --staged app.ts
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onResetDemo}>
            Reset Demo
          </Button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.changeType}</p>
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
                    className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.changeType}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                  ยังไม่มีไฟล์ใน Staging Area
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Last command
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{lastCommand}</p>
          <p className="mt-1 text-sm text-muted-foreground">{simMessage}</p>

          <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-black p-3 font-mono text-xs md:text-sm">
            {gitStatusLines.map((line, index) => (
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
          ทำบนเครื่องของตัวเองได้เลย โดยใช้โฟลเดอร์ทดลองแยกจากงานจริง
          และทำตามลำดับเพื่อเห็น flow ของการ stage/unstage ครบวงจร
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          คำแนะนำ: รันทีละคำสั่งและเช็กผลด้วย <code>git status</code> ทุกขั้น
        </p>

        <ol className="mt-4 space-y-3">
          {GIT_ADD_TUTORIAL_STEPS.map((step, index) => (
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

              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Expected:</span> {step.expected}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
