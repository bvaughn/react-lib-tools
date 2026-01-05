import { ChevronRightIcon } from "@heroicons/react/20/solid";

export function Header({
  section,
  title
}: {
  section?: string;
  title: string;
}) {
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

      <title>{section ? `${section}: ${title}` : title}</title>
    </>
  );
}
