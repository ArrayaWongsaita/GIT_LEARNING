import { redirect, type RouteObject } from "react-router";
import { introductionPath } from "../constants/introduction.path";
import WhatIsVersionControlPage from "../pages/WhatIsVersionControl.page";

export const introductionRoutes: RouteObject = {
  path: introductionPath.base.replace("/", ""),
  children: [
    {
      index: true,
      loader: () => redirect(introductionPath.getWhatIsGitPath()),
    },
    {
      path: introductionPath.whatIsGit,
      Component: WhatIsVersionControlPage,
    },
    {
      path: introductionPath.whatIsVersionControl,
      Component: WhatIsVersionControlPage,
    },
    {
      path: introductionPath.localVsRemote,
      Component: WhatIsVersionControlPage,
    },
    {
      path: introductionPath.basicGitTerms,
      Component: WhatIsVersionControlPage,
    },
  ],
};
