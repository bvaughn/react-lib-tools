import { InterfaceNode, parseFromProject } from "@ts-ast-parser/core";
import { join } from "node:path";
import { cwd } from "node:process";
import type { CompilerOptions } from "typescript";
import { compileImperativeHandle } from "./compileImperativeHandle.ts";

export async function compileImperativeHandles({
  compilerOptions,
  names,
  outputDirName
}: {
  compilerOptions: Partial<CompilerOptions>;
  names: string[];
  outputDirName: string;
}) {
  const outputDir = join(cwd(), "public", "generated", outputDirName);

  const result = await parseFromProject({ compilerOptions });
  const reflectedModules = result.project?.getModules() ?? [];

  const nodes: {
    filePath: string;
    node: InterfaceNode;
  }[] = [];

  names.forEach((name) => {
    reflectedModules.forEach((reflectedModule) => {
      const node = reflectedModule.getDeclarationByName(name);
      if (node instanceof InterfaceNode) {
        const filePath = reflectedModule.getSourcePath();
        if (filePath.startsWith("lib/")) {
          nodes.push({
            filePath,
            node
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
