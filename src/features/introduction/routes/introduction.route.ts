import type { RouteObject } from "react-router";
import WhatIsGitPage from "../pages/WhatIsGit.page";
import WhatIsVersionControlPage from "../pages/WhatIsVersionControl.page";
const introductionRoutesData = {
  base: "introduction",
  whatIsGit: "what-is-git",
  whatIsVersionControl: "what-is-version-control",
  localVsRemote: "local-vs-remote",
  basicGitTerms: "basic-git-terms",
};
export const introductionRoutes: RouteObject = {
  path: introductionRoutesData.base,
  children: [
    {
      path: introductionRoutesData.whatIsVersionControl,
      Component: WhatIsVersionControlPage,
    },
    {
      path: introductionRoutesData.whatIsGit,
      Component: WhatIsGitPage,
    },
  ],
};
