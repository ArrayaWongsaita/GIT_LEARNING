import windowsClickGuide from "/images/git/setup-git/windows-click-guide.png";
import mac_01_git_download_tab from "/images/git/setup-git/mac-01-git-download-tab.png";
import homebrew_copy_command from "/images/git/setup-git/mac-02-homebrew-copy-command.png";
import homebrew_password_enter from "/images/git/setup-git/mac-03-homebrew-password-enter.png";
import homebrew_finalize_and_install_git from "/images/git/setup-git/mac-04-homebrew-finalize-and-install-git.png";
export const SETUP_GIT_LINKS = {
  windowsDownloadPage: "https://git-scm.com/download/win",
  macDownloadPage: "https://git-scm.com/download/mac",
  homebrewPage: "https://brew.sh/",
} as const;

export const SETUP_GIT_IMAGES = {
  windowsClickGuide: {
    src: windowsClickGuide,
    alt: "ภาพตัวอย่างตำแหน่งปุ่ม Click here to download บนหน้า Git for Windows",
  },
  // TODO: วางรูปจริงของ Mac ตาม path ที่กำหนดด้านล่าง (แก้ที่ไฟล์นี้จุดเดียว)
  macGitDownloadTabGuide: {
    src: mac_01_git_download_tab,
    alt: "ภาพตัวอย่างหน้า Download for macOS บนเว็บ Git และตำแหน่งส่วน Homebrew",
  },
  macHomebrewCopyCommandGuide: {
    src: homebrew_copy_command,
    alt: "ภาพตัวอย่างหน้า brew.sh และตำแหน่งคำสั่งติดตั้ง Homebrew ที่ต้อง copy",
  },
  macHomebrewPasswordAndEnterGuide: {
    src: homebrew_password_enter,
    alt: "ภาพตัวอย่างหน้าจอ terminal ตอนใส่รหัสผ่าน macOS และกด Enter เพื่อดำเนินการต่อ",
  },
  macHomebrewFinalizeAndInstallGitGuide: {
    src: homebrew_finalize_and_install_git,
    alt: "ภาพตัวอย่างคำสั่ง Next steps หลังติดตั้ง Homebrew และคำสั่ง brew install git",
  },
} as const;
