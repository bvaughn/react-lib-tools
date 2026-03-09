import {
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon
} from "@heroicons/react/20/solid";
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
      <header className="text-xl">
        {section && (
          <>
            <span className="text-xl whitespace-nowrap" data-section>
              {section}
            </span>{" "}
            <ChevronRightIcon className="size-4 text-slate-400 inline" />{" "}
          </>
        )}
        <span className="text-xl" data-title>
          {title}
        </span>
        {sourceCodePath && (
          <ExternalLink
            className="text-sm text-emerald-300 hover:text-white"
            href={`${repositoryUrl}/blob/main/${sourceCodePath}`}
          >
            <ArrowTopRightOnSquareIcon className="inline-block size-4 fill-current ml-2 mb-1" />
          </ExternalLink>
        )}
      </header>

      <title>{section ? `${section}: ${title}` : title}</title>
    </>
  );
}
