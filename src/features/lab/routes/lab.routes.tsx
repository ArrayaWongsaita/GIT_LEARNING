import { Navigate, type RouteObject } from "react-router";
import { labPath } from "../constants/lab.path.constant";

export const labRoutes: RouteObject = {
  path: labPath.base.replace("/", ""),
  children: [
    {
      index: true,
      element: <Navigate to={labPath.getBasicFlowPath()} />,
    },
    {
      path: labPath.getBasicFlowPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/BasicFlow.page");
        return { Component };
      },
    },
    {
      path: labPath.getFeatureToDevFlowPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/FeatureToDevFlow.page");
        return { Component };
      },
    },
    {
      path: labPath.getLocalSquashFlowPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/LocalSquashFlow.page");
        return { Component };
      },
    },
    {
      path: labPath.getBookingFlowPath(),
      lazy: async () => {
        const { default: Component } = await import("../pages/BookingFlow.page");
        return { Component };
      },
    },
  ],
};
