import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";
import { useLibraryContext } from "../hooks/useLibraryContext";
import { Box } from "./Box";

export function Header({
  section,
  title
}: {
  section?: string;
  title: string;
}) {
  const { packageName } = useLibraryContext();

  useEffect(() => {
    const originalTitle = document.title;

    document.title = `${packageName}: ${section ? `${section}: ${title}` : title}`;

    return () => {
      document.title = originalTitle;
    };
  });

  return (
    <Box align="center" direction="row" gap={2} wrap>
      {section && (
        <>
          <div className="text-xl whitespace-nowrap">{section}</div>
          <ChevronRightIcon className="size-4 text-slate-400" />
        </>
      )}
      <div className="text-xl whitespace-nowrap">{title}</div>
    </Box>
  );
}
