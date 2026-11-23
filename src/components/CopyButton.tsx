import { useEffect, useState } from "react";

type CopyStatus = "idle" | "copied" | "failed";

interface Props {
  text: string;
  label?: string;
}

/** Copies text and announces the outcome to screen readers via a live region. */
export function CopyButton({ text, label = "Copy lyrics" }: Props) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const t = window.setTimeout(() => setStatus("idle"), 2500);
    return () => window.clearTimeout(t);
  }, [status]);

  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API not available");
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <span className="copy">
      <button type="button" className="btn btn-secondary" onClick={() => void copy()}>
        {status === "copied" ? "Copied" : label}
      </button>
      <span role="status" className={status === "failed" ? "copy-msg copy-failed" : "copy-msg"}>
        {status === "copied" && "Lyrics copied to the clipboard."}
        {status === "failed" && "Copy did not work. Select the text and copy it by hand."}
      </span>
    </span>
  );
}
