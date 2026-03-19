class RemoteCollaborationPath {
  base = "/remote-collaboration";
  gitClone = "git-clone";
  gitFetch = "git-fetch";
  gitPull = "git-pull";
  gitPush = "git-push";
  pullRequestFlow = "pull-request-flow";
  rules = "rules";

  getGitClonePath() {
    return `${this.base}/${this.gitClone}`;
  }

  getGitFetchPath() {
    return `${this.base}/${this.gitFetch}`;
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

  getRulesPath() {
    return `${this.base}/${this.rules}`;
  }
}

export const remoteCollaborationPath = new RemoteCollaborationPath();
