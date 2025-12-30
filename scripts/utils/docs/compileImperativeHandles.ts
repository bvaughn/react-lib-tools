import {
  parseFromProject,
  type AnalyserOptions,
  type InterfaceNode
} from "@ts-ast-parser/core";
import { join } from "node:path";
import { cwd } from "node:process";
import { compileImperativeHandle } from "./compileImperativeHandle.ts";

export async function compileImperativeHandles({
  analyserOptions,
  names,
  outputDirName
}: {
  analyserOptions: Partial<AnalyserOptions>;
  names: string[];
  outputDirName: string;
}) {
  const outputDir = join(cwd(), "public", "generated", outputDirName);

  const result = await parseFromProject(analyserOptions);
  const reflectedModules = result.project?.getModules() ?? [];

  const nodes: {
    filePath: string;
    node: InterfaceNode;
  }[] = [];

  names.forEach((name) => {
    reflectedModules.forEach((reflectedModule) => {
      const node = reflectedModule.getDeclarationByName(name);
      if (node) {
        const filePath = reflectedModule.getSourcePath();
        if (filePath.startsWith("lib/")) {
          nodes.push({
            filePath,
            node: node as unknown as InterfaceNode
          });
        }
      }
    });
  });

  await Promise.all(
    nodes.map(({ filePath, node }) =>
      compileImperativeHandle({
        filePath,
        interfaceNode: node,
        outputDir
      })
    )
  );
}
