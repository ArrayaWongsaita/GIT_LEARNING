import { useLocation, useNavigate } from "react-router";
import { navigationStore } from "../stores/navigation.store";

export function useTransitionNavigate() {
  const navigateTransition = navigationStore(
    (state) => state.TransitionNavigate,
  );
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  function transitionNavigate(href: string) {
    navigateTransition(href, navigate, pathname);
  }

  return { transitionNavigate };
}
