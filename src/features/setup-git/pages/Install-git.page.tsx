import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import {
  CommandBlock,
  type CommandCopyStatus,
} from "@/shared/components/command/CommandBlock";
import {
  SETUP_GIT_IMAGES,
  SETUP_GIT_LINKS,
} from "@/features/setup-git/constants/setup-git-resource.constant";

type InstallStep = {
  id: string;
  title: string;
  purpose: string;
  commands: string[];
  notes?: string;
  downloadLink?: {
    href: string;
    label: string;
  };
  previewImage?: {
    src: string;
    alt: string;
  };
};

type PlatformGuide = {
  id: string;
  label: string;
  summary: string;
  steps: InstallStep[];
};

const PLATFORM_GUIDES: PlatformGuide[] = [
  {
    id: "windows",
    label: "Windows",
    summary: "ติดตั้งผ่านหน้าเว็บทางการ พร้อมภาพชี้ตำแหน่งปุ่มดาวน์โหลด",
    steps: [
      {
        id: "open-download-page",
        title: "เปิดหน้าดาวน์โหลด Git for Windows",
        purpose: "เข้าเว็บทางการและไปยังตำแหน่งที่ต้องกดดาวน์โหลดไฟล์ติดตั้ง",
        commands: [],
        downloadLink: {
          href: SETUP_GIT_LINKS.windowsDownloadPage,
          label: "เปิดหน้า Download for Windows",
        },
        previewImage: SETUP_GIT_IMAGES.windowsClickGuide,
      },
      {
        id: "run-installer",
        title: "เปิดไฟล์ .exe แล้วติดตั้งตามขั้นตอน",
        purpose: "ติดตั้ง Git ลงเครื่องด้วยตัวติดตั้งมาตรฐานของ Windows",
        commands: [],
        notes:
          "ค่าแนะนำ: กด Next ตามค่า default ได้เลยจนถึงปุ่ม Install แล้วรอจนเสร็จ",
      },
      {
        id: "verify-git-windows",
        title: "ยืนยันผลการติดตั้ง",
        purpose: "ตรวจสอบว่าเรียกใช้ Git จาก terminal ได้แล้ว",
        commands: ["git --version"],
      },
    ],
  },
  {
    id: "mac",
    label: "Mac",
    summary: "ติดตั้งผ่าน Homebrew ตามลำดับจริง พร้อมภาพไกด์ทีละขั้น",
    steps: [
      {
        id: "open-mac-download-page",
        title: "เปิดหน้าดาวน์โหลด Git for macOS",
        purpose:
          "เข้าไปดูหัวข้อ Homebrew บนหน้า Git สำหรับ Mac เพื่อเริ่มขั้นตอนติดตั้งแบบ command",
        commands: [],
        downloadLink: {
          href: SETUP_GIT_LINKS.macDownloadPage,
          label: "เปิดหน้า Download for macOS",
        },
        previewImage: SETUP_GIT_IMAGES.macGitDownloadTabGuide,
      },
      {
        id: "install-homebrew-if-missing",
        title: "ถ้ายังไม่มี Homebrew ให้ติดตั้งก่อน",
        purpose:
          "เปิดเว็บ Homebrew, copy คำสั่งติดตั้ง แล้วนำไปรันใน Terminal (หรือ Terminal ใน VS Code)",
        commands: [
          '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
        ],
        downloadLink: {
          href: SETUP_GIT_LINKS.homebrewPage,
          label: "เปิดหน้า Homebrew (brew.sh)",
        },
        previewImage: SETUP_GIT_IMAGES.macHomebrewCopyCommandGuide,
      },
      {
        id: "homebrew-password-and-enter",
        title: "ใส่รหัสผ่าน Mac และกด Enter ตามที่ระบบถาม",
        purpose:
          "ยืนยันสิทธิ์ติดตั้งและให้ตัวติดตั้ง Homebrew ดำเนินการต่อจนเสร็จ",
        commands: [],
        notes:
          "ระหว่างพิมพ์รหัสผ่านจะไม่เห็นตัวอักษรบนจอ เป็นพฤติกรรมปกติของ terminal",
        previewImage: SETUP_GIT_IMAGES.macHomebrewPasswordAndEnterGuide,
      },
      {
        id: "finalize-homebrew-and-install-git",
        title: "รันคำสั่ง Next steps แล้วติดตั้ง Git",
        purpose:
          "ตั้งค่า shell ให้รู้จักคำสั่ง brew ก่อน แล้วค่อยติดตั้ง Git และตรวจสอบเวอร์ชัน",
        commands: [
          'echo \'eval "$(/opt/homebrew/bin/brew shellenv)"\' >> ~/.zprofile',
          'eval "$(/opt/homebrew/bin/brew shellenv)"',
          "brew install git",
          "git --version",
        ],
        notes:
          "ถ้าเป็น Mac Intel บางเครื่อง path อาจเป็น /usr/local/bin/brew shellenv ให้ใช้ค่าที่ installer แสดงในเครื่องคุณ",
        previewImage: SETUP_GIT_IMAGES.macHomebrewFinalizeAndInstallGitGuide,
      },
    ],
  },
];

export default function InstallGitPage() {
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
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/25 p-6">
        <p className="inline-flex rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-semibold text-primary">
          Setup Git
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground">
          ติดตั้ง Git บน Windows และ Mac
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          เลือกระบบปฏิบัติการของคุณ แล้วทำตามทีละขั้นตอน แต่ละคำสั่งมีปุ่ม Copy
          ให้กดใช้งานได้ทันที พร้อมคำอธิบายว่าแต่ละขั้นตอนเอาไว้ทำอะไร
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <Accordion
          type="single"
          collapsible
          defaultValue="windows"
          className="rounded-xl border border-border bg-muted/50 px-3 md:px-4"
        >
          {PLATFORM_GUIDES.map((guide) => (
            <AccordionItem key={guide.id} value={guide.id}>
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="flex flex-col gap-1">
                  <span className="text-base font-semibold text-foreground">
                    {guide.label}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {guide.summary}
                  </span>
                </span>
              </AccordionTrigger>

              <AccordionContent>
                <ol className="space-y-4 pb-2">
                  {guide.steps.map((step, stepIndex) => (
                    <li
                      key={step.id}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                          {stepIndex + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-foreground">
                            {step.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              เอาไว้ทำอะไร:
                            </span>{" "}
                            {step.purpose}
                          </p>
                          {step.notes ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {step.notes}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {step.downloadLink ? (
                          <a
                            href={step.downloadLink.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                          >
                            {step.downloadLink.label}
                          </a>
                        ) : null}

                        {step.previewImage ? (
                          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                            <img
                              src={step.previewImage.src}
                              alt={step.previewImage.alt}
                              className="w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : null}

                        {step.commands.map((command, commandIndex) => {
                          const commandKey = `${guide.id}-${step.id}-${commandIndex}`;
                          const status = copyStatusByCommand[commandKey];

                          return (
                            <CommandBlock
                              key={commandKey}
                              command={command}
                              status={status}
                              onCopy={() =>
                                handleCopyCommand(commandKey, command)
                              }
                            />
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}
