import { introductionPath } from "@/features/introduction/constants/introduction.path";
import { setupGitPath } from "@/features/setup-git/constants/setup-git.path.constant";
import { basicGitCommandPath } from "@/features/basic-git-command/constants/basic-git-command.path.constant";
import { branchingPath } from "@/features/branching/constants/branching.path.constant";
import { undoHistoryPath } from "@/features/undo-history/constants/undo-history.path.constant";

export const PUBLIC_ROUTE = {
  HOME: "/",
  LESSON: {
    INTRODUCTION: introductionPath,
    SETUP_GIT: setupGitPath.getInstallGitPath(),
    REPOSITORY_BASICS: basicGitCommandPath.getGitInitPath(),
    COMMIT_WORKFLOW: basicGitCommandPath.getGitAddCommitPath(),
    BRANCHING: branchingPath.getGitBranchPath(),
    MERGE_REBASE: "/merge-rebase",
    UNDO_HISTORY: undoHistoryPath.getGitLogPath(),
    REMOTE_COLLABORATION: "/remote-collaboration",
  },
};
