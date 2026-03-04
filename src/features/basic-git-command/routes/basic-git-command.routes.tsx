import { Navigate, type RouteObject } from "react-router";
import { basicGitCommandPath } from "../constants/basic-git-command.path.constant";
import GitInitPage from "../pages/GitInit.page";
import GitAddPage from "../pages/GitAdd.page";
import GitCommitPage from "../pages/GitCommit.page";
import CommitMessageRulesPage from "../pages/CommitMessageRules.page";
import GitAddCommitPage from "../pages/GitAddCommit.page";

export const basicGitCommandRoutes: RouteObject = {
  path: basicGitCommandPath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={basicGitCommandPath.getGitInitPath()} />,
    },
    {
      path: basicGitCommandPath.getGitInitPath(),
      Component: GitInitPage,
    },
    {
      path: basicGitCommandPath.getGitAddPath(),
      Component: GitAddPage,
    },
    {
      path: basicGitCommandPath.getGitCommitPath(),
      Component: GitCommitPage,
    },
    {
      path: basicGitCommandPath.getCommitMessageRulesPath(),
      Component: CommitMessageRulesPage,
    },
    {
      path: basicGitCommandPath.getGitAddCommitPath(),
      Component: GitAddCommitPage,
    },
  ],
};
