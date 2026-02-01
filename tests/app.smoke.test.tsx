import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { App } from "../src/App";
import { StoreProvider } from "../src/state/store";

describe("App", () => {
  it("renders the workspace", () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );

    expect(
      screen.getByRole("heading", {
        name: /draft, critique, revise, and polish/i
      })
    ).toBeInTheDocument();
  });

  it("keeps revisions immutable via a working copy", () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );

    const editor = screen.getByRole("textbox", {
      name: /markdown editor/i
    }) as HTMLTextAreaElement;
    const initialValue = editor.value;

    const discard = screen.getByRole("button", { name: /discard/i });
    const commit = screen.getByRole("button", { name: /commit changes/i });

    expect(discard).toBeDisabled();
    expect(commit).toBeDisabled();

    fireEvent.change(editor, { target: { value: `${initialValue}\n\nMore text.` } });

    expect(discard).toBeEnabled();
    expect(commit).toBeEnabled();

    fireEvent.click(commit);

    expect(discard).toBeDisabled();
    expect(commit).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /initial draft/i }));
    expect(editor.value).toBe(initialValue);
  });
});
