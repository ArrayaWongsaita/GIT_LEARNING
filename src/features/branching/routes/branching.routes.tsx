import { Navigate, type RouteObject } from "react-router";
import { branchingPath } from "../constants/branching.path.constant";

export const branchingRoutes: RouteObject = {
  path: branchingPath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={branchingPath.getGitBranchPath()} />,
    },
    {
      path: branchingPath.getGitBranchPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitBranch.page");
        return { Component };
      },
    },
    {
      path: branchingPath.getGitSwitchPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitSwitch.page");
        return { Component };
      },
    },
    {
      path: branchingPath.getGitCheckoutPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/GitCheckout.page");
        return { Component };
      },
    },
    {
      path: branchingPath.getBranchNamingPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/BranchNaming.page");
        return { Component };
      },
    },
  ],
};
