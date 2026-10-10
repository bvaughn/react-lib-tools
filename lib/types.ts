import type { ReactNode } from "react";

export type SiteSearchRecord = {
  path: string;
  section?: string | undefined;
  title: string;
};

export type Intent = "danger" | "none" | "primary" | "success" | "warning";

export type Section = {
  code?: boolean | undefined;
  content: string;
  intent?: Intent | undefined;
};

export type ComponentPropMetadata = {
  description: Section[];
  html: string;
  name: string;
  required: boolean;
};

export type ComponentMetadata = {
  description: Section[];
  filePath: string;
  name: string;
  props: {
    [name: string]: ComponentPropMetadata;
  };
};

export type ImperativeHandleMethodMetadata = {
  description: Section[];
  html: string;
  name: string;
};

export type ImperativeHandleMetadata = {
  description: Section[];
  filePath: string;
  name: string;
  methods: ImperativeHandleMethodMetadata[];
};

export type CommonQuestion = {
  answer: ReactNode;
  id: string;
  question: ReactNode;
};

export type NavLinkConfig<Path extends string = string> = {
  /** Nested pages, rendered indented beneath this link */
  children?: NavLinkConfig<Path>[] | undefined;
  path: Path;
  title: string;
};

export type NavSectionConfig<Path extends string = string> = {
  links: NavLinkConfig<Path>[];
  title: string;
};

/**
 * Site navigation, in reading order.
 * Drives both the sidebar and the previous/next links at the bottom of each page.
 */
export type NavConfig<Path extends string = string> = Array<
  NavLinkConfig<Path> | NavSectionConfig<Path>
>;
