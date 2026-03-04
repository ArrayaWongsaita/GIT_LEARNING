class BasicGitCommandPath {
  base = "/basic-git-command";
  gitInit = "git-init";
  gitAdd = "git-add";
  gitCommit = "git-commit";
  commitMessageRules = "commit-message-rules";
  gitAddCommit = "git-add-commit";

  getGitInitPath() {
    return `${this.base}/${this.gitInit}`;
  }

  getGitAddPath() {
    return `${this.base}/${this.gitAdd}`;
  }

  getGitCommitPath() {
    return `${this.base}/${this.gitCommit}`;
  }

  getCommitMessageRulesPath() {
    return `${this.base}/${this.commitMessageRules}`;
  }

  getGitAddCommitPath() {
    return `${this.base}/${this.gitAddCommit}`;
  }
}

export const basicGitCommandPath = new BasicGitCommandPath();
