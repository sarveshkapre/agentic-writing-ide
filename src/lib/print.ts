type PrintHtmlOptions = {
  cleanupMs?: number;
  win?: Window;
  print?: (iframeWindow: Window) => void;
};

export const printHtml = (html: string, options?: PrintHtmlOptions): void => {
  const win = options?.win ?? window;
  const cleanupMs = options?.cleanupMs ?? 1_000;
  const doPrint =
    options?.print ??
    ((iframeWindow: Window) => {
      iframeWindow.focus?.();
      iframeWindow.print?.();
    });

  const doc = win.document;
  const iframe = doc.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";

  let done = false;
  let fallbackTimer: number | null = null;

  const cleanup = () => {
    if (done) return;
    done = true;
    try {
      iframe.remove();
    } catch {
      // ignore
    }
  };

  const attemptPrint = () => {
    if (done) return;
    try {
      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) doPrint(iframeWindow);
    } catch {
      // ignore print failures (blocked, unsupported)
    } finally {
      win.setTimeout(cleanup, cleanupMs);
    }
  };

  const onLoad = () => {
    if (fallbackTimer) win.clearTimeout(fallbackTimer);
    attemptPrint();
  };

  iframe.addEventListener("load", onLoad, { once: true });
  doc.body.appendChild(iframe);

  try {
    // Prefer srcdoc (avoids popup blockers and is widely supported).
    // Some environments (like test DOMs) might not fully implement it.
    (iframe as HTMLIFrameElement & { srcdoc?: string }).srcdoc = html;
  } catch {
    try {
      const iframeDoc = iframe.contentDocument;
      iframeDoc?.open();
      iframeDoc?.write(html);
      iframeDoc?.close();
    } catch {
      // ignore
    }
  }

  fallbackTimer = win.setTimeout(attemptPrint, 50);
};
