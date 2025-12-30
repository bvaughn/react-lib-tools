import type { FunctionNode, Parameter } from "@ts-ast-parser/core";
import { writeFile } from "node:fs/promises";
import { join } from "path";
import type { FunctionMetadata } from "../../../lib/types.ts";
import { assert } from "../assert.ts";
import { syntaxHighlight } from "../syntax-highlight.ts";
import { parseDescription } from "./parseDescription.ts";

export async function compileFunction({
  filePath,
  functionNode,
  outputDir
}: {
  filePath: string;
  functionNode: FunctionNode;
  outputDir: string;
}) {
  const name = functionNode.getName();
  console.log("compileFunction:", name);

  const signatures = functionNode.getSignatures();
  const signature = signatures[0];
  assert(signature, "Signature not found");

  const jsDoc = signature.getJSDoc();
  const json: FunctionMetadata = {
    description: await parseDescription("" + jsDoc.getTag("description")?.text),
    filePath,
    name,
    parameters: [],
    returnType: undefined
  };

  const parameterNodes = signature.getParameters();
  const paramTags = jsDoc.getAllTags("param");
  for (const parameterNode of parameterNodes) {
    const name = parameterNode.getName();

    let serializedParameter: Parameter | undefined = undefined;
    try {
      serializedParameter = parameterNode.serialize();
    } catch {
      // No-op
    }

    const tag = paramTags.find((current) => current.name === name);
    console.log(serializedParameter);

    // TODO Code share
    let htmlText = name;
    if (serializedParameter) {
      htmlText += `: ${serializedParameter.type.text}`;
    }
    if (serializedParameter?.default) {
      htmlText += ` = ${serializedParameter.default}`;
    }

    json.parameters.push({
      description: await parseDescription("" + tag?.text || ""),
      html: await syntaxHighlight(htmlText, "TS"),
      name,
      optional: tag?.optional === true
    });
  }
  console.log(">>> json:\n", json);

  const outputFile = join(outputDir, `${name}.json`);

  console.debug("Writing to", outputFile);

  await writeFile(outputFile, JSON.stringify(json, null, 2));
}
