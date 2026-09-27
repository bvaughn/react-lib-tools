import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { useLibraryContext } from "../hooks/useLibraryContext";
import { ExternalLink } from "./ExternalLink";

export function Header({
  section,
  sourceCodePath,
  title
}: {
  section?: string;
  sourceCodePath?: string;
  title: string;
}) {
  const { repositoryUrl } = useLibraryContext();

  return (
    <>
      <header className="flex flex-col items-start gap-1.5 mb-1">
        {section && (
          <span
            className="text-xs font-semibold tracking-wide text-header-section"
            data-section
          >
            {section}
          </span>
        )}
        <h1 className="text-2xl font-semibold tracking-tight leading-tight text-balance">
          <span data-title>{title}</span>
          {sourceCodePath && (
            <ExternalLink
              className="text-sm text-emerald-300 hover:text-white"
              href={`${repositoryUrl}/blob/main/${sourceCodePath}`}
            >
              <ArrowTopRightOnSquareIcon className="inline-block size-4 fill-current ml-2 mb-1" />
            </ExternalLink>
          )}
        </h1>
      </header>

      <title>{section ? `${section}: ${title}` : title}</title>
    </>
  );
}
