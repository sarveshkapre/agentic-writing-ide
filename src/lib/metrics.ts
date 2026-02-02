const WORDS_PER_MINUTE = 200;

export const countWords = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

export const estimateReadingMinutes = (wordCount: number): number =>
  Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));

export const formatReadingTime = (wordCount: number): string => {
  if (wordCount === 0) return "—";
  const minutes = estimateReadingMinutes(wordCount);
  return `${minutes} min read`;
};

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat().format(value);
