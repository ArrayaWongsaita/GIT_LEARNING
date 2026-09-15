import type { SidebarData } from "@/shared/types/sidebar.type";
import { FlaskConical } from "lucide-react";
import { labPath } from "./lab.path.constant";

export const LAB_SIDE_BAR_DATA: SidebarData = {
  title: "Lab",
  icon: FlaskConical,
  children: [
    {
      title: "Local squash flow",
      path: labPath.getLocalSquashFlowPath(),
    },
    {
      title: "Ecommerce flow",
      path: labPath.getBasicFlowPath(),
    },
    {
      title: "Feature to dev flow",
      path: labPath.getFeatureToDevFlowPath(),
    },
    {
      title: "Booking flow",
      path: labPath.getBookingFlowPath(),
    },
  ],
};
