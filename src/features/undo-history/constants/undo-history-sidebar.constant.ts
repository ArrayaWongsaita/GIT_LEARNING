import type { SidebarData } from "@/shared/types/sidebar.type";
import { History } from "lucide-react";
import { undoHistoryPath } from "./undo-history.path.constant";

export const UNDO_HISTORY_SIDE_BAR_DATA: SidebarData = {
  title: "Undo & History",
  icon: History,
  children: [
    {
      title: "git log",
      path: undoHistoryPath.getGitLogPath(),
    },
    {
      title: "git restore",
      path: undoHistoryPath.getGitRestorePath(),
    },
    {
      title: "git reset",
      path: undoHistoryPath.getGitResetPath(),
    },
    {
      title: "git reflog",
      path: undoHistoryPath.getGitReflogPath(),
    },
  ],
};
