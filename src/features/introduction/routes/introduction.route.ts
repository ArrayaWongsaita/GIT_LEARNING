import { redirect, type RouteObject } from "react-router";
import { introductionPath } from "../constants/introduction.path";

const loadWhatIsVersionControlPage = async () => {
  const { default: Component } = await import("../pages/WhatIsVersionControl.page");
  return { Component };
};

export const introductionRoutes: RouteObject = {
  path: introductionPath.base.replace("/", ""),
  children: [
    {
      index: true,
      loader: () => redirect(introductionPath.getWhatIsGitPath()),
    },
    {
      path: introductionPath.whatIsGit,
      lazy: loadWhatIsVersionControlPage,
    },
    {
      path: introductionPath.whatIsVersionControl,
      lazy: loadWhatIsVersionControlPage,
    },
    {
      path: introductionPath.localVsRemote,
      lazy: loadWhatIsVersionControlPage,
    },
    {
      path: introductionPath.basicGitTerms,
      lazy: loadWhatIsVersionControlPage,
    },
  ],
};
