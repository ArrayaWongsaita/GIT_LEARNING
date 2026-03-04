import type { SidebarData } from "@/shared/types/sidebar.type";
import { setupGitPath } from "./setup-git.path.constant";
import { ClipboardPlus } from "lucide-react";

export const SETUP_GIT_SIDE_BAR_DATA: SidebarData = {
  title: "Setup Git",
  icon: ClipboardPlus,
  children: [
    {
      title: "Install Git",
      path: setupGitPath.getInstallGitPath(),
    },
    {
      title: "Configure Git",
      path: setupGitPath.getConfigureGitPath(),
    },
  ],
};
