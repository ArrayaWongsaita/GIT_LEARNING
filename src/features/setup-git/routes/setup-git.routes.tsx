import { Navigate, type RouteObject } from "react-router";
import { setupGitPath } from "../constants/setup-git.path.constant";

export const setupGitRoutes: RouteObject = {
  path: setupGitPath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={setupGitPath.getInstallGitPath()} />,
    },
    {
      path: setupGitPath.getInstallGitPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/Install-git.page");
        return { Component };
      },
    },
    {
      path: setupGitPath.getConfigureGitPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/Config-git.page");
        return { Component };
      },
    },
  ],
};
