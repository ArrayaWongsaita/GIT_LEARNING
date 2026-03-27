import { RouterProvider } from "react-router";
import appRouter from "./App.route";
import TransitionNavigateProvider from "./common/transitionNavigate/components/TransitionNavigate.provider";

export default function App() {
  return (
    <>
      <TransitionNavigateProvider>
        <RouterProvider router={appRouter} />
      </TransitionNavigateProvider>
    </>
  );
}
