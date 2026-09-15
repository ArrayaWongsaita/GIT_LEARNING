class IntroductionPath {
  base = "/introduction";
  whatIsGit = "what-is-git";
  whatIsVersionControl = "what-is-version-control";
  localVsRemote = "local-vs-remote";
  basicGitTerms = "basic-git-terms";

  getWhatIsGitPath() {
    return `${this.base}/${this.whatIsGit}`;
  }
  getWhatIsVersionControlPath() {
    return `${this.base}/${this.whatIsVersionControl}`;
  }
  getLocalVsRemotePath() {
    return `${this.base}/${this.localVsRemote}`;
  }
  getBasicGitTermsPath() {
    return `${this.base}/${this.basicGitTerms}`;
  }
}
export const introductionPath = new IntroductionPath();
