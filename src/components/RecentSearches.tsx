interface Props {
  items: string[];
  onPick: (q: string) => void;
  onRemove: (q: string) => void;
  onClear: () => void;
}

export function RecentSearches({ items, onPick, onRemove, onClear }: Props) {
  if (items.length === 0) return null;
  return (
    <nav className="recent" aria-labelledby="recent-title">
      <h2 id="recent-title" className="recent-title">
        Recent
      </h2>
      <ul className="recent-list">
        {items.map((q) => (
          <li key={q} className="chip">
            <button type="button" className="chip-main" title={q} onClick={() => onPick(q)}>
              {q}
            </button>
            <button
              type="button"
              className="chip-x"
              aria-label={`Remove “${q}” from recent searches`}
              onClick={() => onRemove(q)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-secondary btn-sm" onClick={onClear}>
        Clear history
      </button>
    </nav>
  );
}
