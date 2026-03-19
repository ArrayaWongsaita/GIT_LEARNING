import type { SidebarData } from "@/shared/types/sidebar.type";
import { FolderGit2 } from "lucide-react";
import { basicGitCommandPath } from "./basic-git-command.path.constant";

export const REPOSITORY_BASICS_SIDE_BAR_DATA: SidebarData = {
  title: "Repository Basics",
  icon: FolderGit2,
  children: [
    {
      title: "git init",
      path: basicGitCommandPath.getGitInitPath(),
    },
    {
      title: ".gitignore",
      path: basicGitCommandPath.getGitIgnorePath(),
    },
    {
      title: ".gitkeep",
      path: basicGitCommandPath.getGitKeepPath(),
    },
  ],
};
