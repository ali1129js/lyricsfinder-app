import { errorMessage } from "../api/lrclib";
import type { LyricsError } from "../api/lrclib";

export function ErrorMessage({ error }: { error: LyricsError }) {
  return (
    <p
      role="alert"
      className={`card notice notice-${error.kind === "not-found" ? "info" : "error"}`}
    >
      {errorMessage(error)}
    </p>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <p role="status" className="card notice notice-loading">
      <span className="spinner" aria-hidden="true" />
      {label}
    </p>
  );
}
