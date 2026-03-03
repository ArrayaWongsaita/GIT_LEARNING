import type { PropsWithChildren } from "react";
import { WaveTransition } from "./providers/WaveTransition";

export default function TransitionNavigateProvider({
  children,
}: PropsWithChildren) {
  return <WaveTransition>{children}</WaveTransition>;
}
