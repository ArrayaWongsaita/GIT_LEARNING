import { Navigate, type RouteObject } from "react-router";
import { basicGitCommandPath } from "../constants/basic-git-command.path.constant";

export const basicGitCommandRoutes: RouteObject = {
  path: basicGitCommandPath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={basicGitCommandPath.getGitInitPath()} />,
    },
    {
      path: basicGitCommandPath.getGitInitPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitInit.page");
        return { Component };
      },
    },
    {
      path: basicGitCommandPath.getGitAddPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitAdd.page");
        return { Component };
      },
    },
    {
      path: basicGitCommandPath.getGitCommitPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitCommit.page");
        return { Component };
      },
    },
    {
      path: basicGitCommandPath.getCommitMessageRulesPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/CommitMessageRules.page");
        return { Component };
      },
    },
    {
      path: basicGitCommandPath.getGitAddCommitPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitAddCommit.page");
        return { Component };
      },
    },
  ],
};
