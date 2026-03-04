import type { LucideIcon } from "lucide-react";

export type SidebarDataItem = {
  title: string;
  path: string;
  icon?: LucideIcon;
};

export type SidebarData = {
  title: string;
  icon: LucideIcon;
  children?: SidebarDataItem[];
};
