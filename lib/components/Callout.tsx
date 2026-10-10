import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from "@heroicons/react/20/solid";
import type { HTMLAttributes, PropsWithChildren } from "react";
import type { Intent } from "../types";
import { cn } from "../utils/cn";
import { getIntentClassNames } from "../utils/getIntentClassNames";

export function Callout({
  children,
  className,
  html = false,
  intent = "none",
  ...rest
}: PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    className?: string | undefined;
    html?: boolean;
    intent?: Intent;
  }
>) {
  let Icon = ExclamationTriangleIcon;
  switch (intent) {
    case "none":
    case "primary": {
      Icon = InformationCircleIcon;
      break;
    }
    case "success": {
      Icon = CheckCircleIcon;
      break;
    }
  }

  return (
    <div
      className={cn(
        "w-full rounded-lg px-3 py-2.5",
        getIntentClassNames(intent),
        className
      )}
      role="alert"
      {...rest}
    >
      <div className="flex flex-row gap-2.5">
        {/* One line tall, so the icon centers on the first line of text */}
        <span className="h-[1lh] shrink-0 flex items-center">
          <Icon className="w-5 h-5" />
        </span>
        {html ? (
          <div
            className="min-w-0"
            dangerouslySetInnerHTML={{ __html: children as string }}
          />
        ) : (
          <div className="min-w-0">{children}</div>
        )}
      </div>
    </div>
  );
}
