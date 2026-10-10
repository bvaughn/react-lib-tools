import {
  parseFromProject,
  type AnalyserOptions,
  type InterfaceNode
} from "@ts-ast-parser/core";
import { relative, resolve } from "node:path";
import { cwd } from "node:process";
import { compileImperativeHandle } from "./compileImperativeHandle.ts";

export async function compileImperativeHandles({
  analyserOptions,
  names,
  outputPath,
  rootDir
}: {
  analyserOptions: Partial<AnalyserOptions>;
  names: string[];
  outputPath: string[];
  rootDir: string;
}) {
  const outputDir = resolve(rootDir, ...outputPath);
  const libDir = resolve(rootDir, "lib");

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
        // Source paths are relative to the current working directory
        const filePath = reflectedModule.getSourcePath();
        if (!relative(libDir, resolve(cwd(), filePath)).startsWith("..")) {
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
