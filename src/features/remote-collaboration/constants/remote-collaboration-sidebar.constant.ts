import type { SidebarData } from "@/shared/types/sidebar.type";
import { Cloud } from "lucide-react";
import { remoteCollaborationPath } from "./remote-collaboration.path.constant";

export const REMOTE_COLLABORATION_SIDE_BAR_DATA: SidebarData = {
  title: "Remote Collaboration",
  icon: Cloud,
  children: [
    {
      title: "git clone",
      path: remoteCollaborationPath.getGitClonePath(),
    },
    {
      title: "git fetch",
      path: remoteCollaborationPath.getGitFetchPath(),
    },
    {
      title: "git pull",
      path: remoteCollaborationPath.getGitPullPath(),
    },
    {
      title: "git push",
      path: remoteCollaborationPath.getGitPushPath(),
    },
    {
      title: "Pull requests",
      path: remoteCollaborationPath.getPullRequestFlowPath(),
    },
    {
      title: "Rules",
      path: remoteCollaborationPath.getRulesPath(),
    },
  ],
};
