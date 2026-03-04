import { Navigate, type RouteObject } from "react-router";
import { undoHistoryPath } from "../constants/undo-history.path.constant";
import GitLogPage from "../pages/GitLog.page";
import GitRestorePage from "../pages/GitRestore.page";
import GitResetPage from "../pages/GitReset.page";
import GitReflogPage from "../pages/GitReflog.page";

export const undoHistoryRoutes: RouteObject = {
  path: undoHistoryPath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={undoHistoryPath.getGitLogPath()} />,
    },
    {
      path: undoHistoryPath.getGitLogPath(),
      Component: GitLogPage,
    },
    {
      path: undoHistoryPath.getGitRestorePath(),
      Component: GitRestorePage,
    },
    {
      path: undoHistoryPath.getGitResetPath(),
      Component: GitResetPage,
    },
    {
      path: undoHistoryPath.getGitReflogPath(),
      Component: GitReflogPage,
    },
  ],
};
