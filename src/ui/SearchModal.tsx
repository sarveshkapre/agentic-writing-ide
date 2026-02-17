import React, { useEffect, useMemo, useRef, useState } from "react";
import { buildHistory } from "../lib/history";
import { buildSnippet, searchText, type Snippet } from "../lib/search";
import { useModalFocusTrap } from "../lib/useModalFocusTrap";
import type { Branch, Revision } from "../state/types";

type Scope = "branch" | "all";

type Result = {
  kind: "working" | "revision";
  key: string;
  title: string;
  meta: string;
  count: number;
  where: "content" | "rationale" | "label";
  index: number;
  snippet: Snippet;
  revisionId?: string;
};

const formatMeta = (revision: Revision): string => {
  const parts: string[] = [];
  parts.push(revision.stage);
  if (revision.label && revision.label.trim()) parts.push(`label: ${revision.label.trim()}`);
  parts.push(new Date(revision.createdAt).toLocaleString());
  return parts.join(" · ");
};

const buildRevisionResult = (revision: Revision, query: string): Result | null => {
  const content = searchText(revision.content, query);
  const rationale = searchText(revision.rationale, query);
  const label = revision.label ? searchText(revision.label, query) : { count: 0, firstIndex: -1 };

  const total = content.count + rationale.count + label.count;
  if (total === 0) return null;

  const primary =
    content.count > 0
      ? { where: "content" as const, index: content.firstIndex, text: revision.content }
      : rationale.count > 0
        ? { where: "rationale" as const, index: rationale.firstIndex, text: revision.rationale }
        : { where: "label" as const, index: label.firstIndex, text: revision.label ?? "" };

  const snippet = buildSnippet(primary.text, primary.index, query.trim().length);

  return {
    kind: "revision",
    key: `rev:${revision.id}`,
    revisionId: revision.id,
    title: revision.rationale,
    meta: formatMeta(revision),
    count: total,
    where: primary.where,
    index: primary.index,
    snippet
  };
};

export const SearchModal: React.FC<{
  branch: Branch;
  revisions: Record<string, Revision>;
  workingContent: string;
  selectedRevisionId: string;
  query: string;
  onChangeQuery: (value: string) => void;
  onClose: () => void;
  onJumpWorking: (index: number) => void;
  onJumpRevision: (revisionId: string, index: number) => void;
}> = ({
  branch,
  revisions,
  workingContent,
  selectedRevisionId,
  query,
  onChangeQuery,
  onClose,
  onJumpWorking,
  onJumpRevision
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [scope, setScope] = useState<Scope>("branch");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useModalFocusTrap({ container: modalRef, onClose });

  const revisionList = useMemo(() => {
    if (scope === "branch") {
      return buildHistory(revisions, branch.headRevisionId);
    }
    return Object.values(revisions).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [branch.headRevisionId, revisions, scope]);

  const workingResult = useMemo((): Result | null => {
    const match = searchText(workingContent, query);
    if (match.count === 0) return null;
    return {
      kind: "working",
      key: "working",
      title: "Working copy",
      meta: selectedRevisionId ? `Selected revision: ${selectedRevisionId}` : "",
      count: match.count,
      where: "content",
      index: match.firstIndex,
      snippet: buildSnippet(workingContent, match.firstIndex, query.trim().length)
    };
  }, [query, selectedRevisionId, workingContent]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [] as Result[];

    const list: Result[] = [];
    if (workingResult) list.push(workingResult);

    for (const revision of revisionList) {
      const result = buildRevisionResult(revision, q);
      if (result) list.push(result);
      if (list.length >= 80) break;
    }
    return list;
  }, [query, revisionList, workingResult]);

  const total = results.length;
  const empty = query.trim().length > 0 && total === 0;

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        ref={modalRef}
        className="modal search-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <h3 id="search-title">Search</h3>
            <p className="muted">Search working copy and revisions. Press Enter to jump.</p>
          </div>
          <div className="search-controls">
            <label className="field">
              <span>Scope</span>
              <select
                aria-label="Search scope"
                value={scope}
                onChange={(event) => setScope(event.target.value as Scope)}
              >
                <option value="branch">Current branch</option>
                <option value="all">All revisions</option>
              </select>
            </label>
          </div>
        </div>

        <label className="field">
          <span className="sr-only">Search query</span>
          <input
            ref={inputRef}
            value={query}
            placeholder="Search for text..."
            onChange={(event) => onChangeQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              const first = results[0];
              if (!first) return;
              event.preventDefault();
              if (first.kind === "working") {
                onJumpWorking(first.index);
              } else if (first.revisionId) {
                onJumpRevision(first.revisionId, first.index);
              }
            }}
          />
        </label>

        <p className="muted search-count">{query.trim() ? `${total} results` : "Type to search."}</p>

        <div className="search-results" role="list">
          {empty ? <p className="muted empty">No matches found.</p> : null}
          {results.map((result) => (
            <button
              key={result.key}
              type="button"
              className="search-result"
              onClick={() => {
                if (result.kind === "working") {
                  onJumpWorking(result.index);
                } else if (result.revisionId) {
                  onJumpRevision(result.revisionId, result.index);
                }
              }}
              role="listitem"
            >
              <div className="search-result-header">
                <div className="search-result-title">{result.title}</div>
                <div className="search-result-badges">
                  <span className="tag">{result.where}</span>
                  <span className="tag pinned">{result.count} hits</span>
                </div>
              </div>
              {result.meta ? <div className="muted">{result.meta}</div> : null}
              <div className="snippet">
                {result.snippet.clippedStart ? <span className="muted">… </span> : null}
                <span>{result.snippet.prefix}</span>
                <mark className="search-hit">{result.snippet.match}</mark>
                <span>{result.snippet.suffix}</span>
                {result.snippet.clippedEnd ? <span className="muted"> …</span> : null}
              </div>
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
