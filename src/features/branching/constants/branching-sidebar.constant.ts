import type { SidebarData } from "@/shared/types/sidebar.type";
import { GitBranch } from "lucide-react";
import { branchingPath } from "./branching.path.constant";

export const BRANCHING_SIDE_BAR_DATA: SidebarData = {
  title: "Branching",
  icon: GitBranch,
  children: [
    {
      title: "git branch",
      path: branchingPath.getGitBranchPath(),
    },
    {
      title: "git switch",
      path: branchingPath.getGitSwitchPath(),
    },
    {
      title: "git checkout",
      path: branchingPath.getGitCheckoutPath(),
    },
    {
      title: "Branch Naming",
      path: branchingPath.getBranchNamingPath(),
    },
  ],
};
