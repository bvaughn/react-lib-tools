import { FunctionNode, type ModuleNode } from "@ts-ast-parser/core";
import { join } from "node:path";
import { cwd } from "node:process";
import { compileFunction } from "./compileFunction";

export async function compileFunctions({
  moduleNodes,
  names,
  outputDirName
}: {
  moduleNodes: ModuleNode[];
  names: string[];
  outputDirName: string;
}) {
  const outputDir = join(cwd(), "public", "generated", outputDirName);

  const nodes: {
    filePath: string;
    node: FunctionNode;
  }[] = [];

  names.forEach((name) => {
    moduleNodes.forEach((moduleNode) => {
      const declarations = moduleNode.getDeclarations();
      const node = declarations.find((current) => current.getName() === name);
      if (node instanceof FunctionNode) {
        const filePath = moduleNode.getSourcePath();
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
      compileFunction({
        filePath,
        functionNode: node,
        outputDir
      })
    )
  );
}
