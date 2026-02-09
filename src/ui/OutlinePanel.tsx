import React, { useMemo, useState } from "react";
import { extractOutline, findActiveOutlineItem } from "../lib/outline";

export const OutlinePanel: React.FC<{
  content: string;
  cursorIndex: number;
  onJump: (index: number) => void;
}> = ({ content, cursorIndex, onJump }) => {
  const [followCursor, setFollowCursor] = useState(true);

  const items = useMemo(() => extractOutline(content), [content]);
  const active = useMemo(
    () => (followCursor ? findActiveOutlineItem(items, cursorIndex) : null),
    [cursorIndex, followCursor, items]
  );

  return (
    <div className="panel outline">
      <div className="panel-header">
        <div>
          <h3>Outline</h3>
          <p className="muted">{items.length} headings</p>
        </div>
        <label className="outline-follow">
          <input
            type="checkbox"
            checked={followCursor}
            onChange={(event) => setFollowCursor(event.target.checked)}
          />
          Follow cursor
        </label>
      </div>
      <div className="outline-list" role="list">
        {items.length === 0 ? (
          <p className="muted empty">No headings found in this draft.</p>
        ) : (
          items.map((item) => (
            <button
              key={`${item.start}-${item.text}`}
              type="button"
              className={`outline-item${active?.start === item.start ? " active" : ""}`}
              style={{ paddingLeft: `${(item.level - 1) * 12 + 10}px` }}
              onClick={() => onJump(item.start)}
              title={`Jump to line ${item.line + 1}`}
            >
              {item.text}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

