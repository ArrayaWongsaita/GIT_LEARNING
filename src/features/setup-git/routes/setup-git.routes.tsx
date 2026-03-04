import { Navigate, type RouteObject } from "react-router";
import { setupGitPath } from "../constants/setup-git.path.constant";
import InstallGitPage from "../pages/Install-git.page";
import ConfigGitPage from "../pages/Config-git.page";

export const setupGitRoutes: RouteObject = {
  path: setupGitPath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={setupGitPath.getInstallGitPath()} />,
    },
    {
      path: setupGitPath.getInstallGitPath(),
      Component: InstallGitPage,
    },
    {
      path: setupGitPath.getConfigureGitPath(),
      Component: ConfigGitPage,
    },
  ],
};
