export type Intent = "danger" | "none" | "primary" | "success" | "warning";

export type Section = {
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

export type Parameter = {
  description: Section[];
  html: string;
  name: string;
  optional: boolean;
};

export type ReturnType = {
  description: Section[];
  name: string;
  type: string;
};

export type FunctionMetadata = {
  description: Section[];
  filePath: string;
  name: string;
  parameters: Parameter[];
  returnType?: ReturnType[] | undefined;
};
