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
}> = ({
  branch,
  revisions,
  selectedId,
  compareId,
  stages,
  onSelect,
  onCompare
}) => {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageId | "all">("all");
  const [authorFilter, setAuthorFilter] = useState<"all" | "user" | "agent">(
    "all"
  );

  const history = useMemo(
    () => buildHistory(revisions, branch.headRevisionId),
    [revisions, branch.headRevisionId]
  );

  const filtered = history.filter((item) => {
    const matchesQuery =
      query.trim() === "" ||
      item.rationale.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase());
    const matchesStage = stageFilter === "all" || item.stage === stageFilter;
    const matchesAuthor =
      authorFilter === "all" || item.author === authorFilter;
    return matchesQuery && matchesStage && matchesAuthor;
  });

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
      <p className="muted">{filtered.length} revisions</p>
      <div className="history-list">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`history-item${item.id === selectedId ? " active" : ""}`}
          >
            <button
              className="history-select"
              onClick={() => onSelect(item.id)}
              type="button"
            >
              <div>
                <span className="tag">{item.stage}</span>
                <span className="time">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="snippet">{item.rationale}</div>
            </button>
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
