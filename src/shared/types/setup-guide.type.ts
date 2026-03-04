export type SetupGuideLink = {
  href: string;
  label: string;
};

export type SetupGuideImage = {
  src: string;
  alt: string;
};

export type SetupGuideStep = {
  id: string;
  title: string;
  purpose: string;
  commands: string[];
  notes?: string;
  downloadLink?: SetupGuideLink;
  previewImage?: SetupGuideImage;
};

export type SetupGuidePlatform = {
  id: string;
  label: string;
  summary: string;
  steps: SetupGuideStep[];
};
