import type { InterfaceNode } from "@ts-ast-parser/core";
import assert from "node:assert";
import { writeFile } from "node:fs/promises";
import { join } from "path";
import type { ImperativeHandleMetadata } from "../../../lib/types.ts";
import { syntaxHighlight } from "../syntax-highlight.ts";
import { parseDescription } from "./parseDescription.ts";

export async function compileImperativeHandle({
  filePath,
  interfaceNode,
  outputDir
}: {
  filePath: string;
  interfaceNode: InterfaceNode;
  outputDir: string;
}) {
  const name = interfaceNode.getName();

  const json: ImperativeHandleMetadata = {
    description: await parseDescription(
      "" + interfaceNode.getJSDoc().getTag("description")?.text
    ),
    filePath,
    methods: [],
    name
  };

  const methods = interfaceNode.getMethods();
  for (const method of methods) {
    // Comments on method signatures (e.g. "reset(): void") are attached to the signature;
    // comments on function-typed properties (e.g. "reset: () => void") are attached to the method
    const jsDoc = method.getJSDoc() ?? method.getSignatures()[0]?.getJSDoc();
    assert(jsDoc, `Missing JSDoc comment for ${name}.${method.getName()}`);

    json.methods.push({
      description: await parseDescription(
        "" + jsDoc.getTag("description")?.text
      ),
      html: await syntaxHighlight(method.getTSNode().getText(), "TS"),
      name: method.getName()
    });
  }

  const outputFile = join(outputDir, `${name}.json`);

  console.debug("Writing to", outputFile);

  await writeFile(outputFile, JSON.stringify(json, null, 2));
}
