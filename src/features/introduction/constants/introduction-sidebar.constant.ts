import type { SidebarData } from "@/shared/types/sidebar.type";
import { BookOpen } from "lucide-react";
import { introductionPath } from "./introduction.path";

export const INTRODUCTION_SIDE_BAR_DATA: SidebarData = {
  title: "Introduction",
  path: introductionPath.getWhatIsGitPath(),
  icon: BookOpen,
  children: [
    {
      title: "What is Version Control",
      path: introductionPath.getWhatIsVersionControlPath(),
    },
    {
      title: "What is Git",
      path: introductionPath.getWhatIsGitPath(),
    },

    {
      title: "Local vs Remote",
      path: introductionPath.getLocalVsRemotePath(),
    },
    {
      title: "Basic Git Terms",
      path: introductionPath.getBasicGitTermsPath(),
    },
  ],
};
