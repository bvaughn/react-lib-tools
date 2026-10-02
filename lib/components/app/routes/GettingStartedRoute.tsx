import { useLibraryContext } from "../../../hooks/useLibraryContext";
import { Box } from "../../Box";
import { Callout } from "../../Callout";
import { Code } from "../../code/Code";
import { ExternalLink } from "../../ExternalLink";
import { Header } from "../../Header";
import { SectionHeader } from "../../SectionHeader";

export default function GettingStartedRoute() {
  const { overview, packageName, showOpenCollectLink } = useLibraryContext();

  return (
    <Box direction="column" gap={4}>
      <Header title={`Getting started with ${packageName}`} />
      {overview}
      {/* Getting started is short enough not to need an "On this page" list */}
      {overview && (
        <SectionHeader showInContents={false}>Installation</SectionHeader>
      )}
      <div>Begin by installing the library from NPM:</div>
      <Code
        // Code renders one <div> per line
        html={`<div>npm install <span class="tok-keyword">${escapeHTML(packageName)}</span></div>`}
      />
      <Callout intent="primary">
        TypeScript definitions are included within the published{" "}
        <code>dist</code> folder.
      </Callout>
      <SectionHeader showInContents={false}>Support</SectionHeader>
      <div>Here are some ways to support this project:</div>
      <ul className="pl-8">
        <li className="list-disc">
          <ExternalLink href="https://github.com/sponsors/bvaughn/">
            Become a GitHub sponsor
          </ExternalLink>
        </li>
        {showOpenCollectLink && (
          <li className="list-disc">
            <ExternalLink
              href={`https://opencollective.com/${packageName}#sponsor`}
            >
              Become an Open Collective sponsor
            </ExternalLink>
          </li>
        )}
        <li className="list-disc">
          <ExternalLink href="http://givebrian.coffee/">
            Buy me a coffee
          </ExternalLink>
        </li>
      </ul>
    </Box>
  );
}

function escapeHTML(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
