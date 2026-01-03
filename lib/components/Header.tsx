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
  const { packageName } = useLibraryContext();

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
    </>
  );
}
