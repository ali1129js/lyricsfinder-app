# LEARN: Lyrics Finder

Notes on the parts of this rebuild worth understanding, not just copying.

## 1. Abortable fetch

Search runs while you type. Without care, a slow answer for "bohem" could arrive after the answer for "bohemian rhapsody" and overwrite it. That is a race condition.

`useTrackSearch` keeps one `AbortController` in a ref. Every new search calls `abort()` on the previous one before starting:

```ts
controller.current?.abort();
const ctrl = new AbortController();
controller.current = ctrl;
const res = await searchTracks(query, ctrl.signal);
if (ctrl.signal.aborted) return; // a newer search owns the screen now
```

An aborted `fetch` rejects with a `DOMException` named `AbortError`. That is not a real error, so the client re-throws it and the hook ignores it. The test "aborts the old request when the query changes" resolves the old request last and checks that its result never shows.

The lyrics page does the same in a `useEffect` cleanup: leaving the page aborts the load.

## 2. No API key

lrclib.net is free and open, and it sends `Access-Control-Allow-Origin: *`, so the browser can call it straight from GitHub Pages. No backend and no secret. The app sends an `Lrclib-Client` header to say who is calling, which lrclib asks for and allows in CORS.

The 2019 version went through cors-anywhere proxies and a keyed API. Those died, which is why the old app broke.

## 3. Typed error states

Every API call returns a `Result`:

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: LyricsError };
type LyricsError =
  | { kind: "empty-query" }
  | { kind: "not-found" }
  | { kind: "network" }
  | { kind: "http"; status: number }
  | { kind: "bad-response" };
```

Because it is a discriminated union, `errorMessage()` uses a `switch` with no `default`. If someone adds a new kind, TypeScript fails the build until it gets a message. Nothing falls through to `console.log`.

## 4. Validate what you did not write

API data and localStorage are both outside your control. Zod schemas parse them at the edge:

- A search row that does not match `trackSchema` is dropped, not allowed to crash the list.
- A saved mode of `"purple"` falls back to the system preference.

Inside the app, types can then be trusted.

## 5. Hash routes on GitHub Pages

Pages serves static files, so `/lyricsfinder-app/track/42` would 404 on refresh. `#/track/42` never reaches the server, so deep links work without a 404 trick. `vite.config.ts` sets `base: "/lyricsfinder-app/"` so asset paths match the Pages sub-path.

## 6. The chrome style

Colours live twice: as CSS variables in `src/styles/chrome.css` and as data in `src/theme/chrome.ts`. `theme.test.ts` checks that both agree and that every text/background pair the UI uses reaches 4.5:1 (WCAG AA), using the WCAG relative-luminance formula.

The 3D look is layered `box-shadow`: an inset white line on top (light catching the bevel), an inset dark line at the bottom, then two soft drop shadows. The mirror metal is one gradient with a hard stop at 49 to 51 percent, which reads as a horizon reflection.

## 7. Synced lyrics without audio

lrclib's `syncedLyrics` field is LRC text: `[01:02.25] a line`. `parseLrc` turns it into `{ time, text }` rows. A line can have several stamps (a repeated chorus), so it is expanded and then sorted. `[offset:+250]` shifts every line by milliseconds.

Finding the current line is a binary search for "the last line whose time is not after now", which is O(log n) per tick instead of scanning the list.

The clock does not count ticks. It stores when it started and adds `Date.now() - startedAt`, so a slow or skipped `setInterval` tick never makes it drift. Tests use Vitest fake timers to move time forward and check which line has `aria-current`.

## 8. Motion is opt-in

The sheen only runs when `<html data-motion="on">`. The default is off, and `prefers-reduced-motion: reduce` disables the toggle and keeps it off, in JS and again in CSS.
