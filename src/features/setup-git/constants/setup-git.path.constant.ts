class SetupGitPath {
  base = "/setup-git";
  installGit = "install-git";
  configureGit = "configure-git";
  sshVsHttps = "ssh-vs-https";
  firstRepo = "first-repo";

  getInstallGitPath() {
    return `${this.base}/${this.installGit}`;
  }
  getConfigureGitPath() {
    return `${this.base}/${this.configureGit}`;
  }
  getSshVsHttpsPath() {
    return `${this.base}/${this.sshVsHttps}`;
  }
  getFirstRepoPath() {
    return `${this.base}/${this.firstRepo}`;
  }
}

export const setupGitPath = new SetupGitPath();
