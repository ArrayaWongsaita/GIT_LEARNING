class BranchingPath {
  base = "/branching";
  gitBranch = "git-branch";

  getGitBranchPath() {
    return `${this.base}/${this.gitBranch}`;
  }
}

export const branchingPath = new BranchingPath();
