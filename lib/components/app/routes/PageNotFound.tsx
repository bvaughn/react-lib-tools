import { useLibraryContext } from "../../../hooks/useLibraryContext";
import { Box } from "../../Box";
import { Callout } from "../../Callout";
import { ExternalLink } from "../../ExternalLink";
import { Header } from "../../Header";

export default function PageNotFoundRoute() {
  const { packageName } = useLibraryContext();

  return (
    <Box direction="column" gap={4}>
      <Header title="Page not found" />
      <Callout intent="danger">
        The URL you requested can't be found. If you think this is an error,{" "}
        <ExternalLink
          href={`https://github.com/bvaughn/${packageName}/issues/new`}
        >
          please file a GitHub issue
        </ExternalLink>
        .
      </Callout>
    </Box>
  );
}
