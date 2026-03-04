import { Navigate, type RouteObject } from "react-router";
import { branchingPath } from "../constants/branching.path.constant";
import GitBranchPage from "../pages/GitBranch.page";

export const branchingRoutes: RouteObject = {
  path: branchingPath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={branchingPath.getGitBranchPath()} />,
    },
    {
      path: branchingPath.getGitBranchPath(),
      Component: GitBranchPage,
    },
  ],
};
