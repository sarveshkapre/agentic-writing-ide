import React, { useMemo, useState } from "react";
import type { Branch, Revision, StageId } from "../state/types";

const buildHistory = (
  revisions: Record<string, Revision>,
  headId: string
): Revision[] => {
  const ordered: Revision[] = [];
  let current: Revision | undefined = revisions[headId];
  while (current) {
    ordered.push(current);
    current = current.parentId ? revisions[current.parentId] : undefined;
  }
  return ordered;
};

export const HistoryPanel: React.FC<{
  branch: Branch;
  revisions: Record<string, Revision>;
  selectedId: string;
  compareId: string | null;
  stages: StageId[];
  onSelect: (id: string) => void;
  onCompare: (id: string | null) => void;
  onTogglePin: (id: string) => void;
}> = ({
  branch,
  revisions,
  selectedId,
  compareId,
  stages,
  onSelect,
  onCompare,
  onTogglePin
}) => {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageId | "all">("all");
  const [authorFilter, setAuthorFilter] = useState<"all" | "user" | "agent">(
    "all"
  );
  const [pinnedFilter, setPinnedFilter] = useState<"all" | "pinned">("all");
  const [labelFilter, setLabelFilter] = useState<"all" | "labeled">("all");

  const history = useMemo(
    () => buildHistory(revisions, branch.headRevisionId),
    [revisions, branch.headRevisionId]
  );

  const selectedRevision = revisions[selectedId];
  const parentId = selectedRevision?.parentId ?? null;
  const headId = branch.headRevisionId;

  const matchesFilters = (item: Revision) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === "" ||
      item.rationale.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      (item.label ?? "").toLowerCase().includes(q);
    const matchesStage = stageFilter === "all" || item.stage === stageFilter;
    const matchesAuthor =
      authorFilter === "all" || item.author === authorFilter;
    const matchesLabel =
      labelFilter === "all" || Boolean(item.label && item.label.trim());
    return matchesQuery && matchesStage && matchesAuthor && matchesLabel;
  };

  const pinned = history.filter(
    (item) =>
      Boolean(item.pinned) === true &&
      matchesFilters(item) &&
      (pinnedFilter === "all" || pinnedFilter === "pinned")
  );

  const unpinned = history.filter(
    (item) =>
      !item.pinned && matchesFilters(item) && pinnedFilter === "all"
  );

  const visibleItems =
    pinnedFilter === "pinned" ? pinned : [...pinned, ...unpinned];
  const totalCount = visibleItems.length;
  const isEmpty = visibleItems.length === 0;

  return (
    <div className="panel history">
      <h3>History</h3>
      <p className="muted">Branch: {branch.name}</p>
      <div className="history-filters">
        <input
          placeholder="Search rationale or text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={pinnedFilter}
          onChange={(event) =>
            setPinnedFilter(event.target.value as "all" | "pinned")
          }
          aria-label="Pinned filter"
        >
          <option value="all">All revisions</option>
          <option value="pinned">Pinned only</option>
        </select>
        <select
          value={labelFilter}
          onChange={(event) =>
            setLabelFilter(event.target.value as "all" | "labeled")
          }
          aria-label="Label filter"
        >
          <option value="all">All labels</option>
          <option value="labeled">Labeled only</option>
        </select>
        <select
          value={stageFilter}
          onChange={(event) =>
            setStageFilter(event.target.value as StageId | "all")
          }
        >
          <option value="all">All stages</option>
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        <select
          value={authorFilter}
          onChange={(event) =>
            setAuthorFilter(event.target.value as "all" | "user" | "agent")
          }
        >
          <option value="all">All authors</option>
          <option value="user">User</option>
          <option value="agent">Agent</option>
        </select>
      </div>
      <div className="history-actions">
        <button
          type="button"
          className="ghost"
          onClick={() => onCompare(headId)}
          disabled={headId === selectedId}
        >
          Compare to head
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => parentId && onCompare(parentId)}
          disabled={!parentId}
        >
          Compare to parent
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => onCompare(null)}
          disabled={!compareId}
        >
          Clear compare
        </button>
      </div>
      <p className="muted">{totalCount} revisions</p>
      <div className="history-list">
        {isEmpty ? (
          <p className="muted empty">No revisions match the current filters.</p>
        ) : null}
        {pinned.length > 0 ? (
          <div className="history-section">
            <p className="muted">Pinned</p>
            {pinned.map((item) => (
              <div
                key={item.id}
                className={`history-item${item.id === selectedId ? " active" : ""}`}
              >
                <div className="history-row">
                  <button
                    className="history-select"
                    onClick={() => onSelect(item.id)}
                    type="button"
                  >
                    <div className="history-meta">
                      <div>
                        <span className="tag">{item.stage}</span>
                        {item.label ? (
                          <span className="tag label">{item.label}</span>
                        ) : null}
                        <span className="tag pinned">Pinned</span>
                        <span className="time">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="snippet">{item.rationale}</div>
                  </button>
                  <button
                    type="button"
                    className="pin-button active"
                    aria-label="Unpin revision"
                    aria-pressed="true"
                    onClick={() => onTogglePin(item.id)}
                  >
                    ★
                  </button>
                </div>
                <label className="compare">
                  <input
                    type="checkbox"
                    checked={compareId === item.id}
                    onChange={() => onCompare(compareId === item.id ? null : item.id)}
                  />
                  Compare
                </label>
              </div>
            ))}
          </div>
        ) : null}

        {pinned.length > 0 && unpinned.length > 0 ? (
          <div className="history-divider" aria-hidden="true" />
        ) : null}

        {unpinned.map((item) => (
          <div
            key={item.id}
            className={`history-item${item.id === selectedId ? " active" : ""}`}
          >
            <div className="history-row">
              <button
                className="history-select"
                onClick={() => onSelect(item.id)}
                type="button"
              >
                <div className="history-meta">
                  <div>
                    <span className="tag">{item.stage}</span>
                    {item.label ? (
                      <span className="tag label">{item.label}</span>
                    ) : null}
                    <span className="time">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="snippet">{item.rationale}</div>
              </button>
              <button
                type="button"
                className="pin-button"
                aria-label="Pin revision"
                aria-pressed="false"
                onClick={() => onTogglePin(item.id)}
              >
                ☆
              </button>
            </div>
            <label className="compare">
              <input
                type="checkbox"
                checked={compareId === item.id}
                onChange={() => onCompare(compareId === item.id ? null : item.id)}
              />
              Compare
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
