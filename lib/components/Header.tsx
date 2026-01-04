import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useLibraryContext } from "../hooks/useLibraryContext";

export function Header({
  section,
  title
}: {
  section?: string;
  title: string;
}) {
  const { packageName } = useLibraryContext();

  return (
    <>
      <div className="text-xl">
        {section && (
          <>
            <span className="text-xl whitespace-nowrap">{section}</span>{" "}
            <ChevronRightIcon className="size-4 text-slate-400 inline" />{" "}
          </>
        )}
        <span className="text-xl">{title}</span>
      </div>

      <title>{`${packageName}: ${section ? `${section}: ${title}` : title}`}</title>
    </>
  );
}
