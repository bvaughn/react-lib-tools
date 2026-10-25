import type { Intent } from "../types";

/** Tailwind classes for a tinted background, border, and text matching the given intent (as used by `Callout`) */
export function getIntentClassNames(intent: Intent) {
  switch (intent) {
    case "danger": {
      return "bg-red-500/10 border border-red-500/25 text-red-950 [&_svg]:text-red-600 [&_a]:text-red-700! dark:border-red-400/25 dark:text-red-50 dark:[&_svg]:text-red-400 dark:[&_a]:text-red-300!";
    }
    case "none": {
      return "bg-ink/5 border border-ink/15 text-slate-800 [&_svg]:text-slate-500 dark:text-slate-200 dark:[&_svg]:text-slate-400";
    }
    case "primary": {
      return "bg-sky-400/10 border border-sky-500/25 text-sky-950 [&_svg]:text-sky-600 dark:border-sky-400/25 dark:text-sky-50 dark:[&_svg]:text-sky-400";
    }
    case "success": {
      return "bg-emerald-400/10 border border-emerald-500/25 text-emerald-950 [&_svg]:text-emerald-600 [&_a]:text-emerald-700! dark:border-emerald-400/25 dark:text-emerald-50 dark:[&_svg]:text-emerald-400 dark:[&_a]:text-emerald-300!";
    }
    case "warning": {
      return "bg-amber-400/10 border border-amber-500/25 text-amber-950 [&_svg]:text-amber-600 [&_a]:text-amber-700! dark:border-amber-400/25 dark:text-amber-50 dark:[&_svg]:text-amber-400 dark:[&_a]:text-amber-300!";
    }
  }
}
