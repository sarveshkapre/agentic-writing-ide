import React from "react";
import { diff_match_patch, Diff } from "diff-match-patch";

const renderInline = (diffs: Diff[]) =>
  diffs.map(([op, text], index) => {
    if (op === 0) return <span key={index}>{text}</span>;
    if (op === 1) return <ins key={index}>{text}</ins>;
    return <del key={index}>{text}</del>;
  });

const renderSide = (diffs: Diff[]) => {
  const left: React.ReactNode[] = [];
  const right: React.ReactNode[] = [];

  diffs.forEach(([op, text], index) => {
    if (op === 0) {
      left.push(<span key={`l-${index}`}>{text}</span>);
      right.push(<span key={`r-${index}`}>{text}</span>);
      return;
    }
    if (op === -1) {
      left.push(<del key={`l-${index}`}>{text}</del>);
      return;
    }
    right.push(<ins key={`r-${index}`}>{text}</ins>);
  });

  return (
    <div className="diff-split">
      <div>
        <h4>Before</h4>
        <div className="diff-block">{left}</div>
      </div>
      <div>
        <h4>After</h4>
        <div className="diff-block">{right}</div>
      </div>
    </div>
  );
};

const countOps = (diffs: Diff[]) => {
  let added = 0;
  let removed = 0;
  diffs.forEach(([op, text]) => {
    if (op === 1) added += text.length;
    if (op === -1) removed += text.length;
  });
  return { added, removed };
};

const computeDiff = (before: string, after: string) => {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(before, after);
  dmp.diff_cleanupSemantic(diffs);
  return {
    diffs,
    stats: countOps(diffs)
  };
};

export const DiffView: React.FC<{
  before: string;
  after: string;
  mode: "inline" | "side";
}> = ({ before, after, mode }) => {
  const { diffs, stats } = React.useMemo(
    () => computeDiff(before, after),
    [before, after]
  );

  return (
    <div>
      <p className="muted diff-stats">
        +{stats.added} / -{stats.removed} characters
      </p>
      {mode === "side" ? renderSide(diffs) : renderInline(diffs)}
    </div>
  );
};
