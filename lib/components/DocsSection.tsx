import type { Section } from "../types";
import { Box } from "./Box";
import { Callout } from "./Callout";
import { Code } from "./code/Code";

export function DocsSection({
  className,
  sections
}: {
  className?: string;
  sections: Section[];
}) {
  return (
    <Box className={className} direction="column" gap={2}>
      {sections.map(({ code, content, intent }, index) => {
        if (code) {
          return <Code key={index} html={content} />;
        }

        if (intent) {
          return (
            <Callout key={index} html intent={intent}>
              {content}
            </Callout>
          );
        }

        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{
              __html: content.replaceAll("<ul>", '<ul class="list-disc pl-4">')
            }}
          ></div>
        );
      })}
    </Box>
  );
}
