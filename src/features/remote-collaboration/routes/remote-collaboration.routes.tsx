import { Navigate, type RouteObject } from "react-router";
import { remoteCollaborationPath } from "../constants/remote-collaboration.path.constant";

export const remoteCollaborationRoutes: RouteObject = {
  path: remoteCollaborationPath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={remoteCollaborationPath.getGitClonePath()} />,
    },
    {
      path: remoteCollaborationPath.getGitClonePath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitClone.page");
        return { Component };
      },
    },
    {
      path: remoteCollaborationPath.getGitFetchPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitFetch.page");
        return { Component };
      },
    },
    {
      path: remoteCollaborationPath.getGitPullPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitPull.page");
        return { Component };
      },
    },
    {
      path: remoteCollaborationPath.getGitPushPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitPush.page");
        return { Component };
      },
    },
    {
      path: remoteCollaborationPath.getPullRequestFlowPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/PullRequestFlow.page");
        return { Component };
      },
    },
    {
      path: remoteCollaborationPath.getRulesPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitHubRules.page");
        return { Component };
      },
    },
  ],
};
