import { Block, Box, Code, Header, SectionHeader } from "react-lib-tools";
import { html as badgeIntentsHTML } from "../../public/generated/examples/BadgeIntents.json";
import { html as badgeThemeHTML } from "../../public/generated/examples/BadgeTheme.json";
import { BadgeIntentsExample } from "./examples/BadgeIntents";

export default function BadgeRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Badge" title="Intents" />
      <div>
        Use the <code>intent</code> prop to change the color of a badge:
      </div>
      <Code html={badgeIntentsHTML} />
      <Block className="flex gap-2 p-4">
        <BadgeIntentsExample />
      </Block>
      <SectionHeader>Theming</SectionHeader>
      <div>
        Badges accept a <code>className</code> for additional styles:
      </div>
      <Code html={badgeThemeHTML} />
    </Box>
  );
}
