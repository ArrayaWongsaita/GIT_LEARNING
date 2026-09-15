import { TransitionLink } from "@/common/transitionNavigate/components/TransitionLink";
import type { SidebarDataItem } from "@/shared/types/sidebar.type";
import {
  SidebarMenuSub as SidebarMenuSubPrimitive,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar";

type SidebarMenuSubProps = {
  items: SidebarDataItem[];
  normalizedPathname: string;
};

const normalizePath = (path: string) =>
  path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;

export function SidebarMenuSub({
  items,
  normalizedPathname,
}: SidebarMenuSubProps) {
  return (
    <SidebarMenuSubPrimitive>
      {items.map((child) => (
        <SidebarMenuSubItem key={child.path}>
          <SidebarMenuSubButton
            asChild
            isActive={normalizePath(child.path) === normalizedPathname}
          >
            <TransitionLink to={child.path} className="w-full">
              <span>{child.title}</span>
            </TransitionLink>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSubPrimitive>
  );
}
