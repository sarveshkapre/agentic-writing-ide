export type ExportTheme = {
  id: string;
  name: string;
  colorScheme: "light" | "dark";
  vars: Record<string, string>;
};

export const exportThemes: ExportTheme[] = [
  {
    id: "paper",
    name: "Paper",
    colorScheme: "light",
    vars: {
      ink: "#0b1a1f",
      "ink-soft": "#22343b",
      paper: "#ffffff",
      border: "rgba(11, 26, 31, 0.12)",
      teal: "#0c6b68"
    }
  },
  {
    id: "classic",
    name: "Classic",
    colorScheme: "light",
    vars: {
      ink: "#1f1a12",
      "ink-soft": "#3a2f22",
      paper: "#f7f1e8",
      border: "rgba(31, 26, 18, 0.16)",
      teal: "#0c6b68"
    }
  },
  {
    id: "night",
    name: "Night",
    colorScheme: "dark",
    vars: {
      ink: "#f8f3ea",
      "ink-soft": "#d4cbbf",
      paper: "#141719",
      border: "rgba(248, 243, 234, 0.14)",
      teal: "#2cb8b4"
    }
  }
];

const getExportTheme = (id: string | undefined): ExportTheme =>
  exportThemes.find((theme) => theme.id === id) ?? exportThemes[0];

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildThemeCss = (theme: ExportTheme): string => {
  const vars = Object.entries(theme.vars)
    .map(([key, val]) => `      --${key}: ${val};`)
    .join("\n");
  return `
    :root {
      color-scheme: ${theme.colorScheme};
${vars}
    }`;
};

export const wrapHtml = (title: string, body: string, themeId?: string) => {
  const theme = getExportTheme(themeId);
  const safeTitle = escapeHtml(title);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
    :root {
      color-scheme: light dark;
      --ink: #0b1a1f;
      --ink-soft: #22343b;
      --paper: #f7f1e8;
      --border: rgba(11, 26, 31, 0.12);
      --teal: #0c6b68;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 2.5rem clamp(1.25rem, 4vw, 3.5rem);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background: var(--paper);
      line-height: 1.65;
    }

    main {
      max-width: 72ch;
      margin: 0 auto;
    }

    h1, h2, h3 {
      font-family: ui-serif, "Times New Roman", Times, serif;
      line-height: 1.2;
      margin: 1.6rem 0 0.8rem;
    }

    h1 { font-size: 2.2rem; margin-top: 0; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.2rem; }

    p { margin: 0.8rem 0; }

    a { color: var(--teal); text-decoration: underline; text-underline-offset: 0.18em; }

    blockquote {
      margin: 1rem 0;
      padding: 0.8rem 1rem;
      border-left: 4px solid var(--teal);
      background: rgba(12, 107, 104, 0.06);
      border-radius: 12px;
    }

    pre, code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 0.92em;
    }

    pre {
      padding: 0.9rem 1rem;
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: rgba(11, 26, 31, 0.03);
    }

    code {
      padding: 0.15rem 0.35rem;
      border-radius: 8px;
      background: rgba(11, 26, 31, 0.06);
    }

    pre code { padding: 0; background: transparent; }

    hr { border: 0; border-top: 1px solid var(--border); margin: 1.6rem 0; }

    @media (prefers-color-scheme: dark) {
      :root {
        --ink: #f8f3ea;
        --ink-soft: #d4cbbf;
        --paper: #141719;
        --border: rgba(248, 243, 234, 0.14);
      }

      body {
        background: var(--paper);
      }

      pre { background: rgba(248, 243, 234, 0.06); }
      code { background: rgba(248, 243, 234, 0.12); }
      blockquote { background: rgba(12, 107, 104, 0.14); }
    }

    @media print {
      :root { color-scheme: light; }
      body { background: #fff; padding: 0; }
      a { color: #000; text-decoration: none; }
      blockquote { background: transparent; border-color: #000; }
    }

    @page {
      margin: 18mm;
    }

${buildThemeCss(theme)}
  </style>
</head>
<body>
  <main>
    ${body}
  </main>
</body>
</html>`;
};
