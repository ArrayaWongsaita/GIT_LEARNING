import { PUBLIC_ROUTE } from "@/shared/constants/routes/public.constant";
import { createBrowserRouter, Navigate } from "react-router";
import NotFound from "./shared/pages/notfound.page";
import MainLayout from "./shared/components/layouts/Main.layout";
import { introductionRoutes } from "./features/introduction/routes/introduction.route";
import { setupGitRoutes } from "./features/setup-git/routes/setup-git.routes";

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
        { path: "*", Component: NotFound },
      ],
    },
  ],
  { basename: "/GIT_LEARNING/" },
);

export default appRouter;
