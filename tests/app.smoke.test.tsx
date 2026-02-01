import { render, screen } from "@testing-library/react";
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
});
