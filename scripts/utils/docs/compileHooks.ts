import { resolve } from "node:path";
import ts, { type CompilerOptions } from "typescript";
import { getFilesWithExtensions } from "../getFilesWithExtensions.ts";
import type { ReadmeHook } from "./updateReadmeMarkdown.ts";

/**
 * Collects README docs for the named hooks, each matched against declarations exported from the `lib` directory.
 */
export async function compileHooks({
  compilerOptions,
  names,
  rootDir
}: {
  compilerOptions: Partial<CompilerOptions>;
  names: string[];
  rootDir: string;
}): Promise<ReadmeHook[]> {
  if (names.length === 0) {
    return [];
  }

  const libDir = resolve(rootDir, "lib");
  const files = await getFilesWithExtensions(libDir, [".ts", ".tsx"]);

  const program = ts.createProgram(files, {
    ...compilerOptions,
    noEmit: true
  } as CompilerOptions);
  const checker = program.getTypeChecker();

  const hooks: ReadmeHook[] = [];
  const found = new Set<string>();

  const addHook = (name: string, symbol: ts.Symbol) => {
    const declaration = symbol.getDeclarations()?.[0];
    if (!declaration) {
      return;
    }

    found.add(name);
    hooks.push({
      description: getDescription(symbol, checker),
      name,
      parameters: getParameters(symbol, declaration, checker)
    });
  };

  // Prefer hooks exported by the package entry point, since internal modules may declare hooks with the same name
  const indexFile = program
    .getSourceFiles()
    .find((sourceFile) =>
      [resolve(libDir, "index.ts"), resolve(libDir, "index.tsx")].includes(
        resolve(sourceFile.fileName)
      )
    );
  const indexSymbol = indexFile && checker.getSymbolAtLocation(indexFile);
  if (indexSymbol) {
    for (const exported of checker.getExportsOfModule(indexSymbol)) {
      const name = exported.getName();
      if (names.includes(name) && !found.has(name)) {
        addHook(
          name,
          exported.flags & ts.SymbolFlags.Alias
            ? checker.getAliasedSymbol(exported)
            : exported
        );
      }
    }
  }

  for (const sourceFile of program.getSourceFiles()) {
    if (!isInDirectory(sourceFile.fileName, libDir)) {
      continue;
    }

    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
      continue;
    }

    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const name = exported.getName();
      if (!names.includes(name) || found.has(name)) {
        continue;
      }

      // Re-exports (e.g. "export { impl as useX }" or barrel files) are documented where they are declared
      const symbol =
        exported.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(exported)
          : exported;
      const declaration = symbol.getDeclarations()?.[0];
      if (
        !declaration ||
        !isInDirectory(declaration.getSourceFile().fileName, libDir)
      ) {
        continue;
      }

      addHook(name, symbol);
    }
  }

  for (const name of names) {
    if (!found.has(name)) {
      console.warn(`Hook ${name} not found in ${libDir}`);
    }
  }

  return hooks;
}

const DESCRIPTION_TAGS = ["deprecated", "return", "returns"];

function getDescription(symbol: ts.Symbol, checker: ts.TypeChecker) {
  let text = ts.displayPartsToString(symbol.getDocumentationComment(checker));

  // Parameters are documented in their own table, and other tags (e.g. @example, @see) are not rendered
  for (const tag of symbol.getJsDocTags(checker)) {
    if (DESCRIPTION_TAGS.includes(tag.name)) {
      text += `\n@${tag.name} ${ts.displayPartsToString(tag.text)}`.trimEnd();
    }
  }

  return text;
}

function getParameters(
  symbol: ts.Symbol,
  declaration: ts.Declaration,
  checker: ts.TypeChecker
): ReadmeHook["parameters"] {
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);

  // Only the first overload is documented
  const signature = type.getCallSignatures()[0];
  if (!signature) {
    return [];
  }

  const parameters: ReadmeHook["parameters"] = [];

  for (const parameter of signature.getParameters()) {
    const parameterDeclaration = parameter.valueDeclaration;

    // Skip parameters inherited from library types (e.g. "useRef as typeof useRef<T>")
    if (
      !parameterDeclaration ||
      parameterDeclaration.getSourceFile().fileName.includes("node_modules") ||
      !ts.isParameter(parameterDeclaration)
    ) {
      continue;
    }

    const optional =
      !!parameterDeclaration.questionToken ||
      !!parameterDeclaration.initializer;

    // Options objects (e.g. "{ delay }: { delay?: number }" or "{ delay }: Options") are documented one property at a time
    if (
      (parameterDeclaration.type &&
        ts.isTypeLiteralNode(parameterDeclaration.type)) ||
      ts.isObjectBindingPattern(parameterDeclaration.name)
    ) {
      const parameterType = checker.getTypeAtLocation(parameterDeclaration);
      for (const property of parameterType.getProperties()) {
        parameters.push({
          description: ts.displayPartsToString(
            property.getDocumentationComment(checker)
          ),
          name: property.getName(),
          optional: optional || (property.flags & ts.SymbolFlags.Optional) !== 0
        });
      }
    } else {
      parameters.push({
        description: ts.displayPartsToString(
          parameter.getDocumentationComment(checker)
        ),
        name: parameter.getName(),
        optional
      });
    }
  }

  return parameters;
}

function isInDirectory(fileName: string, dir: string) {
  const path = resolve(fileName);
  return path.startsWith(dir + "/") || path.startsWith(dir + "\\");
}
