import { Navigate, type RouteObject } from "react-router";
import { mergeRebasePath } from "../constants/merge-rebase.path.constant";

export const mergeRebaseRoutes: RouteObject = {
  path: mergeRebasePath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={mergeRebasePath.getGitMergePath()} />,
    },
    {
      path: mergeRebasePath.getGitMergePath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitMerge.page");
        return { Component };
      },
    },
    {
      path: mergeRebasePath.getGitRebasePath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitRebase.page");
        return { Component };
      },
    },
    {
      path: mergeRebasePath.getResolveConflictsPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/ResolveConflicts.page");
        return { Component };
      },
    },
  ],
};
