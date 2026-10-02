import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import "./code-mirror.css";

export function Code({
  className = "",
  copyable = true,
  html
}: {
  className?: string;
  copyable?: boolean;
  html: string;
}) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const copy = async () => {
    const text = codeRef.current?.innerText;
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      } catch {
        // Clipboard access may be denied (e.g. insecure context)
      }
    }
  };

  return (
    <div className="group relative">
      <code
        className={cn(
          "text-sm md:text-base block text-left whitespace-pre-wrap break-normal text-white! rounded-lg p-3 bg-black border border-white/10",
          "flex flex-col",
          { "pr-10": copyable },
          className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
        ref={codeRef}
      />
      {copyable && (
        <button
          aria-label={copied ? "Copied" : "Copy code"}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-md cursor-pointer",
            "text-slate-400 hover:text-white hover:bg-white/10 focus-visible:text-white focus-visible:bg-white/10",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100",
            { "opacity-100! text-emerald-400!": copied }
          )}
          onClick={copy}
          title={copied ? "Copied" : "Copy code"}
          type="button"
        >
          {copied ? (
            <CheckIcon className="w-4 h-4" />
          ) : (
            <ClipboardDocumentIcon className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
