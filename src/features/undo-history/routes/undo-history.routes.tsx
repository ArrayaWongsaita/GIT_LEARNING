import { Navigate, type RouteObject } from "react-router";
import { undoHistoryPath } from "../constants/undo-history.path.constant";

export const undoHistoryRoutes: RouteObject = {
  path: undoHistoryPath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={undoHistoryPath.getGitLogPath()} />,
    },
    {
      path: undoHistoryPath.getGitLogPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitLog.page");
        return { Component };
      },
    },
    {
      path: undoHistoryPath.getGitRestorePath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitRestore.page");
        return { Component };
      },
    },
    {
      path: undoHistoryPath.getGitResetPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitReset.page");
        return { Component };
      },
    },
    {
      path: undoHistoryPath.getGitReflogPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitReflog.page");
        return { Component };
      },
    },
  ],
};
