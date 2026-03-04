import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarRail,
} from "../ui/sidebar";
import { useLocation } from "react-router";

import type { SidebarData } from "@/shared/types/sidebar.type";
import { INTRODUCTION_SIDE_BAR_DATA } from "@/features/introduction/constants/introduction-sidebar.constant";
import { SETUP_GIT_SIDE_BAR_DATA } from "@/features/setup-git/constants/setup-git-sidebar.constant";
import { SidebarMenuItem as MainSidebarMenuItem } from "./SidebarMenuItem";

const MAIN_SIDE_BAR_DATA: SidebarData[] = [
  INTRODUCTION_SIDE_BAR_DATA,
  SETUP_GIT_SIDE_BAR_DATA,
];

const normalizePath = (path: string) =>
  path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;

const isItemActive = (item: SidebarData, normalizedPathname: string) => {
  return (
    item.children?.some(
      (child) => normalizePath(child.path) === normalizedPathname,
    ) ?? false
  );
};

export default function MainSidebar() {
  const pathname = useLocation().pathname;
  const normalizedPathname = useMemo(() => normalizePath(pathname), [pathname]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="text-xs text-sidebar-foreground/70">
            Git Learning Track
          </p>
          <h2 className="text-sm font-semibold">Study Commands</h2>
        </div>
        <SidebarInput placeholder="Search lesson..." />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lessons</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_SIDE_BAR_DATA.map((item) => {
                const isActive = isItemActive(item, normalizedPathname);

                return (
                  <MainSidebarMenuItem
                    key={item.title}
                    item={item}
                    isActive={isActive}
                    normalizedPathname={normalizedPathname}
                    defaultOpen={item.title === "Introduction"}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="rounded-md bg-sidebar-accent px-2 py-2 text-xs text-sidebar-accent-foreground">
          Start here: Introduction topics.
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
