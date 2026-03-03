import type { LucideIcon } from "lucide-react";

export type SidebarData = {
  title: string;
  path: string;
  icon?: LucideIcon;
  children?: SidebarData[];
};
