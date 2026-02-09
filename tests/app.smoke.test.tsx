import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

  it("stashes uncommitted edits when navigating revisions", () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /critique/i }));

    fireEvent.click(screen.getByRole("button", { name: /initial draft/i }));

    const editor = screen.getByRole("textbox", {
      name: /markdown editor/i
    }) as HTMLTextAreaElement;
    const stashedLine = "Stashed note for later.";
    fireEvent.change(editor, { target: { value: `${editor.value}\n\n${stashedLine}` } });

    fireEvent.click(screen.getByRole("button", { name: /flag clarity gaps/i }));
    fireEvent.click(screen.getByRole("button", { name: /stash & continue/i }));

    expect(editor.value).not.toContain(stashedLine);

    fireEvent.click(screen.getByRole("button", { name: /initial draft/i }));
    expect(editor.value).toContain(stashedLine);
  });

  it("shows an error status for invalid JSON imports", async () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );

    const input = screen.getByLabelText(/import json/i) as HTMLInputElement;
    const invalidFile = new File(["{not-valid-json"], "invalid.json", {
      type: "application/json"
    });

    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/import failed:/i)).toBeInTheDocument();
    });
  });

  it("prevents creating duplicate branch names", () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );

    const input = screen.getByPlaceholderText(/new branch name/i);
    fireEvent.change(input, { target: { value: "main" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(screen.getByText(/branch name already exists/i)).toBeInTheDocument();
  });

  it("supports clean merge preview and apply", () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );

    const editor = screen.getByRole("textbox", {
      name: /markdown editor/i
    }) as HTMLTextAreaElement;
    const branchInput = screen.getByPlaceholderText(/new branch name/i);
    fireEvent.change(branchInput, { target: { value: "feature" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    const branchSelect = screen.getByLabelText(/current branch/i) as HTMLSelectElement;
    const featureValue = Array.from(branchSelect.options).find(
      (option) => option.text === "feature"
    )?.value;
    expect(featureValue).toBeTruthy();
    if (!featureValue) return;

    fireEvent.change(branchSelect, { target: { value: featureValue } });
    fireEvent.change(editor, { target: { value: `${editor.value}\n\nFeature-only note.` } });
    fireEvent.click(screen.getByRole("button", { name: /commit changes/i }));

    const mainValue = Array.from(branchSelect.options).find(
      (option) => option.text === "main"
    )?.value;
    expect(mainValue).toBeTruthy();
    if (!mainValue) return;

    fireEvent.change(branchSelect, { target: { value: mainValue } });

    const mergeSelect = screen.getByLabelText(/merge source branch/i);
    fireEvent.change(mergeSelect, { target: { value: featureValue } });
    fireEvent.click(screen.getByRole("button", { name: /preview merge/i }));

    expect(screen.getByText(/no conflicts detected/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /apply merge/i }));

    expect(editor.value).toContain("Feature-only note.");
  });

  it("resolves merge conflicts using prefer-source strategy", () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );

    const editor = screen.getByRole("textbox", {
      name: /markdown editor/i
    }) as HTMLTextAreaElement;
    const branchInput = screen.getByPlaceholderText(/new branch name/i);
    fireEvent.change(branchInput, { target: { value: "feature" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    const branchSelect = screen.getByLabelText(/current branch/i) as HTMLSelectElement;
    const featureValue = Array.from(branchSelect.options).find(
      (option) => option.text === "feature"
    )?.value;
    expect(featureValue).toBeTruthy();
    if (!featureValue) return;

    fireEvent.change(branchSelect, { target: { value: featureValue } });
    fireEvent.change(editor, {
      target: { value: editor.value.replace("Start writing here...", "Feature branch line") }
    });
    fireEvent.click(screen.getByRole("button", { name: /commit changes/i }));

    const mainValue = Array.from(branchSelect.options).find(
      (option) => option.text === "main"
    )?.value;
    expect(mainValue).toBeTruthy();
    if (!mainValue) return;

    fireEvent.change(branchSelect, { target: { value: mainValue } });
    fireEvent.change(editor, {
      target: { value: editor.value.replace("Start writing here...", "Main branch line") }
    });
    fireEvent.click(screen.getByRole("button", { name: /commit changes/i }));

    const mergeSelect = screen.getByLabelText(/merge source branch/i);
    fireEvent.change(mergeSelect, { target: { value: featureValue } });
    fireEvent.click(screen.getByRole("button", { name: /preview merge/i }));

    expect(screen.getByText(/potential conflicts:/i)).toBeInTheDocument();

    const resolution = screen.getByLabelText(/conflict resolution/i);
    fireEvent.change(resolution, { target: { value: "prefer-source" } });
    fireEvent.click(screen.getByRole("button", { name: /apply merge/i }));

    expect(editor.value).toContain("Feature branch line");
    expect(editor.value).not.toContain("<<<<<<<");
  });
});
