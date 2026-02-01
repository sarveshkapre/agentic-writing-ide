import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("lets you pin revisions and filter to pinned only", () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /critique/i }));

    const pinButtons = screen.getAllByRole("button", { name: /pin revision/i });
    expect(pinButtons.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(pinButtons[1]);

    const pinnedFilter = screen.getByLabelText(/pinned filter/i) as HTMLSelectElement;
    fireEvent.change(pinnedFilter, { target: { value: "pinned" } });

    expect(screen.getByText(/1 revisions/i)).toBeInTheDocument();
    expect(screen.getByText(/^pinned$/i, { selector: "p" })).toBeInTheDocument();
  });

  it("supports compare presets for the selected revision", () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /critique/i }));

    const compareToParent = screen.getByRole("button", {
      name: /compare to parent/i
    });
    expect(compareToParent).toBeEnabled();
    fireEvent.click(compareToParent);

    const initialItem = screen
      .getByText(/initial draft/i)
      .closest(".history-item") as HTMLElement | null;
    expect(initialItem).not.toBeNull();
    if (!initialItem) return;

    const checkbox = within(initialItem).getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });
});
