class BranchingPath {
  base = "/branching";
  gitBranch = "git-branch";
  gitSwitch = "git-switch";
  gitCheckout = "git-checkout";
  branchNaming = "branch-naming";

  getGitBranchPath() {
    return `${this.base}/${this.gitBranch}`;
  }

  getGitSwitchPath() {
    return `${this.base}/${this.gitSwitch}`;
  }

  getGitCheckoutPath() {
    return `${this.base}/${this.gitCheckout}`;
  }

  getBranchNamingPath() {
    return `${this.base}/${this.branchNaming}`;
  }
}

export const branchingPath = new BranchingPath();
