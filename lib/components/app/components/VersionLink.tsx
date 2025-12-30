import GlobeIcon from "../../../../public/svgs/globe.svg?react";
import TagsIcon from "../../../../public/svgs/tags.svg?react";
import { useLibraryContext } from "../../../hooks/useLibraryContext";
import { ExternalLink } from "../../ExternalLink";

export function VersionLink({
  url,
  version
}: {
  url: string;
  version: string;
}) {
  const { packageName } = useLibraryContext();

  return (
    <li className="list-disc">
      {version.split(".").slice(0, 2).join(".")}
      <span className="text-slate-400">.x</span>
      {url && (
        <ExternalLink
          aria-label={`Documentation for version ${version}`}
          className="ml-4"
          href={url}
        >
          <GlobeIcon className="inline w-4 h-4 text-teal-200" /> documentation
        </ExternalLink>
      )}
      <ExternalLink
        aria-label={`GitHub tag for version ${version}`}
        className="ml-4"
        href={`https://github.com/bvaughn/${packageName}/releases/tag/${version}`}
      >
        <TagsIcon className="inline w-4 h-4 text-teal-200" /> source code
      </ExternalLink>
    </li>
  );
}
