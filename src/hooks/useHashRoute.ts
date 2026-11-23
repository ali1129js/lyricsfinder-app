import { useEffect, useState } from "react";

export type Route = { page: "search" } | { page: "track"; id: number };

/** Hash routes work on GitHub Pages without a 404 fallback: #/ and #/track/123. */
export function parseHash(hash: string): Route {
  const m = /^#\/track\/(\d{1,12})\/?$/.exec(hash);
  return m?.[1] ? { page: "track", id: Number(m[1]) } : { page: "search" };
}

export function trackHref(id: number): string {
  return `#/track/${id}`;
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
