/**
 * Scrolls the element with the given id into view, waiting (briefly) for it to be rendered;
 * route content is lazy loaded, so the target may not exist yet when navigation happens.
 *
 * Returns a cleanup function that cancels the wait.
 */
export function scrollToAnchor(
  id: string,
  {
    smooth = false,
    timeout = 2000
  }: { smooth?: boolean; timeout?: number } = {}
) {
  const tryScroll = () => {
    const element = document.getElementById(id);
    if (element) {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      element.scrollIntoView({
        behavior: smooth && !reduceMotion ? "smooth" : "auto",
        block: "start"
      });
      return true;
    }
    return false;
  };

  if (tryScroll()) {
    return () => {};
  }

  const observer = new MutationObserver(() => {
    if (tryScroll()) {
      cleanup();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const timeoutId = setTimeout(() => cleanup(), timeout);

  const cleanup = () => {
    observer.disconnect();
    clearTimeout(timeoutId);
  };

  return cleanup;
}
