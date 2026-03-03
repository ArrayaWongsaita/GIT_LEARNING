import { createBrowserRouter } from "react-router";
import HomePage from "./features/home/home.page";
import NotFound from "./shared/pages/notfound.page";

const appRouter = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: HomePage },
      { path: "*", Component: NotFound },
    ],
  },
]);

export default appRouter;
