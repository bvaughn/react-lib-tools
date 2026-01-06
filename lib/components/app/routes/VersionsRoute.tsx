import { Fragment } from "react/jsx-runtime";
import { assert } from "../../../../scripts/utils/assert";
import { useLibraryContext } from "../../../hooks/useLibraryContext";
import { Box } from "../../Box";
import { Header } from "../../Header";
import { VersionLink } from "../components/VersionLink";

// Major versions only

export default function VersionsRoute() {
  const { versions } = useLibraryContext();
  assert(versions !== undefined);

  return (
    <Box direction="column" gap={2}>
      <Header title="Previous releases" />
      <div>Click below to view documentation for past releases.</div>
      <ul className="pl-8">
        {Object.entries(versions)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([version, url]) => (
            <Fragment key={version}>
              <VersionLink key={version} url={url} version={version} />
            </Fragment>
          ))}
      </ul>
    </Box>
  );
}
