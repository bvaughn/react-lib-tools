import type { Intent } from "../types";

/** Tinted surface + subtle border for the given intent. */
export function getIntentClassNames(intent: Intent) {
  switch (intent) {
    case "danger": {
      return "bg-red-500/10 border border-red-400/25 text-red-50 [&_svg]:text-red-400 [&_a]:text-red-300!";
    }
    case "none": {
      return "bg-white/5 border border-white/15 text-slate-200 [&_svg]:text-slate-400";
    }
    case "primary": {
      return "bg-sky-400/10 border border-sky-400/25 text-sky-50 [&_svg]:text-sky-400";
    }
    case "success": {
      return "bg-emerald-400/10 border border-emerald-400/25 text-emerald-50 [&_svg]:text-emerald-400 [&_a]:text-emerald-300!";
    }
    case "warning": {
      return "bg-amber-400/10 border border-amber-400/25 text-amber-50 [&_svg]:text-amber-400 [&_a]:text-amber-300!";
    }
  }
}
