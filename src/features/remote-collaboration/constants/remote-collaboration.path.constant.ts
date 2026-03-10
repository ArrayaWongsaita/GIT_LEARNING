class RemoteCollaborationPath {
  base = "/remote-collaboration";
  gitClone = "git-clone";
  gitPull = "git-pull";
  gitPush = "git-push";
  pullRequestFlow = "pull-request-flow";

  getGitClonePath() {
    return `${this.base}/${this.gitClone}`;
  }

  getGitPullPath() {
    return `${this.base}/${this.gitPull}`;
  }

  getGitPushPath() {
    return `${this.base}/${this.gitPush}`;
  }

  getPullRequestFlowPath() {
    return `${this.base}/${this.pullRequestFlow}`;
  }
}

export const remoteCollaborationPath = new RemoteCollaborationPath();
