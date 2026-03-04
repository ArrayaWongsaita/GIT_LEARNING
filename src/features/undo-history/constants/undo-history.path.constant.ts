class UndoHistoryPath {
  base = "/undo-history";
  gitLog = "git-log";
  gitRestore = "git-restore";
  gitReset = "git-reset";
  gitReflog = "git-reflog";

  getGitLogPath() {
    return `${this.base}/${this.gitLog}`;
  }

  getGitRestorePath() {
    return `${this.base}/${this.gitRestore}`;
  }

  getGitResetPath() {
    return `${this.base}/${this.gitReset}`;
  }

  getGitReflogPath() {
    return `${this.base}/${this.gitReflog}`;
  }
}

export const undoHistoryPath = new UndoHistoryPath();
