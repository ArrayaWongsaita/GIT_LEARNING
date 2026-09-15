import type { SidebarData } from "@/shared/types/sidebar.type";
import { GitCommitHorizontal } from "lucide-react";
import { basicGitCommandPath } from "./basic-git-command.path.constant";

export const BASIC_GIT_COMMAND_SIDE_BAR_DATA: SidebarData = {
  title: "Commit Workflow",
  icon: GitCommitHorizontal,
  children: [
    {
      title: "git add",
      path: basicGitCommandPath.getGitAddPath(),
    },
    {
      title: "git commit",
      path: basicGitCommandPath.getGitCommitPath(),
    },
    {
      title: "Commit Message Rules",
      path: basicGitCommandPath.getCommitMessageRulesPath(),
    },
    {
      title: "git add + commit",
      path: basicGitCommandPath.getGitAddCommitPath(),
    },
  ],
};
