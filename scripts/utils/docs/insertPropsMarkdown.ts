export function insertPropsMarkdown({
  componentMarkdown,
  componentName,
  markdown,
  section
}: {
  componentMarkdown: string;
  componentName: string;
  markdown: string;
  section: string;
}) {
  const flag = `${componentName}:${section}`;
  const startToken = `<!-- ${flag}:begin -->`;
  const stopToken = `<!-- ${flag}:end -->`;

  const startTokenIndex = markdown.indexOf(startToken);
  const stopIndex = markdown.indexOf(stopToken);
  if (startTokenIndex < 0 || stopIndex < startTokenIndex) {
    console.warn(`README tokens not found for component ${componentName}`);

    return markdown;
  }

  const startIndex = startTokenIndex + startToken.length;

  return (
    markdown.substring(0, startIndex) +
    "\n" +
    (componentMarkdown || "None") +
    "\n" +
    markdown.substring(stopIndex)
  );
}
