import type { SidebarData } from "@/shared/types/sidebar.type";
import { GitMerge } from "lucide-react";
import { mergeRebasePath } from "./merge-rebase.path.constant";

export const MERGE_REBASE_SIDE_BAR_DATA: SidebarData = {
  title: "Merge & Rebase",
  icon: GitMerge,
  children: [
    {
      title: "git merge",
      path: mergeRebasePath.getGitMergePath(),
    },
    {
      title: "git rebase",
      path: mergeRebasePath.getGitRebasePath(),
    },
    {
      title: "Resolve Conflicts",
      path: mergeRebasePath.getResolveConflictsPath(),
    },
  ],
};
