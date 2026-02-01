import { printHtml } from "../src/lib/print";

describe("printHtml", () => {
  it("renders into an iframe and cleans up", () => {
    document.body.innerHTML = "";
    vi.useFakeTimers();

    printHtml("<!doctype html><html><body><main>hello</main></body></html>", {
      win: window,
      cleanupMs: 0,
      print: () => {}
    });

    expect(document.querySelector("iframe")).not.toBeNull();

    vi.runAllTimers();

    expect(document.querySelector("iframe")).toBeNull();
    vi.useRealTimers();
  });
});
