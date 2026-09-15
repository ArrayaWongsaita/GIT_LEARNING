class MergeRebasePath {
  base = "/merge-rebase";
  gitMerge = "git-merge";
  gitRebase = "git-rebase";
  resolveConflicts = "resolve-conflicts";

  getGitMergePath() {
    return `${this.base}/${this.gitMerge}`;
  }

  getGitRebasePath() {
    return `${this.base}/${this.gitRebase}`;
  }

  getResolveConflictsPath() {
    return `${this.base}/${this.resolveConflicts}`;
  }
}

export const mergeRebasePath = new MergeRebasePath();
