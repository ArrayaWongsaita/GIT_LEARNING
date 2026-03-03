import { PUBLIC_ROUTE } from "@/shared/constants/routes/public.constant";
import { createBrowserRouter, Navigate } from "react-router";
import LessonPage from "./features/lesson/lesson.page";
import NotFound from "./shared/pages/notfound.page";
import MainLayout from "./shared/components/layouts/Main.layout";
import { introductionRoutes } from "./features/introduction/routes/introduction.route";

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
        { path: "lesson/:lessonSlug", Component: LessonPage },
        { path: "*", Component: NotFound },
      ],
    },
  ],
  { basename: "/GIT_LEARNING/" },
);

export default appRouter;
