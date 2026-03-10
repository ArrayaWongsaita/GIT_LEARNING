import { PUBLIC_ROUTE } from "@/shared/constants/routes/public.constant";
import { createBrowserRouter, Navigate } from "react-router";
import NotFound from "./shared/pages/notfound.page";
import MainLayout from "./shared/components/layouts/Main.layout";
import { introductionRoutes } from "./features/introduction/routes/introduction.route";
import { setupGitRoutes } from "./features/setup-git/routes/setup-git.routes";
import { basicGitCommandRoutes } from "./features/basic-git-command/routes/basic-git-command.routes";
import { branchingRoutes } from "./features/branching/routes/branching.routes";
import { mergeRebaseRoutes } from "./features/merge-rebase/routes/merge-rebase.routes";
import { undoHistoryRoutes } from "./features/undo-history/routes/undo-history.routes";
import { remoteCollaborationRoutes } from "./features/remote-collaboration/routes/remote-collaboration.routes";

const appRouter = createBrowserRouter(
  [
    {
      path: "/",
      Component: MainLayout,
      children: [
        {
          index: true,
          element: (
            <Navigate
              replace
              to={PUBLIC_ROUTE.LESSON.INTRODUCTION.getWhatIsGitPath()}
            />
          ),
        },
        introductionRoutes,
        setupGitRoutes,
        basicGitCommandRoutes,
        branchingRoutes,
        mergeRebaseRoutes,
        undoHistoryRoutes,
        remoteCollaborationRoutes,
        { path: "*", Component: NotFound },
      ],
    },
  ],
  { basename: "/GIT_LEARNING/" },
);

export default appRouter;
