import { useLibraryContext } from "../../../hooks/useLibraryContext";
import { Box } from "../../Box";
import { Callout } from "../../Callout";
import { ExternalLink } from "../../ExternalLink";
import { Header } from "../../Header";

export default function GettingStartedRoute() {
  const { overview, packageName, showOpenCollectLink } = useLibraryContext();

  return (
    <Box direction="column" gap={4}>
      <Header title={`Getting started with ${packageName}`} />
      {overview}
      {overview && <div className="text-xl mt-4">Installation</div>}
      <div>Begin by installing the library from NPM:</div>
      <code className="grow text-xs md:text-sm block text-left whitespace-pre-wrap rounded-md p-3 bg-black text-white!">
        npm install <span className="tok-keyword">{packageName}</span>
      </code>
      <Callout intent="primary">
        TypeScript definitions are included within the published{" "}
        <code>dist</code> folder.
      </Callout>
      <div className="text-xl mt-4">Support</div>
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
