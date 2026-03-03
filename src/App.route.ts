import { createBrowserRouter } from "react-router";
import HomePage from "./features/home/home.page";
import NotFound from "./shared/pages/notfound.page";
import MainLayout from "./shared/components/layouts/Main.layout";

const appRouter = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "*", Component: NotFound },
    ],
  },
]);

export default appRouter;
