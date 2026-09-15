import { createBrowserRouter, redirect } from "react-router";
import LessonPage from "./features/lessons/lesson.page";
import HomePage from "./features/home/home.page";
import NotFound from "./shared/pages/notfound.page";
import MainLayout from "./shared/components/layouts/Main.layout";
import { LESSONS, toLessonPath } from "./shared/constants/lessons.constant";

const firstLesson = LESSONS[0];

const appRouter = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      {
        path: "lessons",
        loader: () => redirect(toLessonPath(firstLesson.topicSlug, firstLesson.slug)),
      },
      { path: "lessons/:topicSlug/:lessonSlug", Component: LessonPage },
      { path: "*", Component: NotFound },
    ],
  },
]);

export default appRouter;
