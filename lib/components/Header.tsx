import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useLibraryContext } from "../hooks/useLibraryContext";
import { Box } from "./Box";

export function Header({
  section,
  title: titleProp
}: {
  section?: string;
  title: string;
}) {
  const { packageDescription, packageName, url } = useLibraryContext();

  const title = `${packageName}: ${section ? `${section}: ${titleProp}` : titleProp}`;

  return (
    <>
      <Box align="center" direction="row" gap={2} wrap>
        {section && (
          <>
            <div className="text-xl whitespace-nowrap">{section}</div>
            <ChevronRightIcon className="size-4 text-slate-400" />
          </>
        )}
        <div className="text-xl whitespace-nowrap">{title}</div>
      </Box>

      <title>{title}</title>

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={packageName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={packageDescription} />
      <meta property="og:image" content={`${url}og.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    </>
  );
}
