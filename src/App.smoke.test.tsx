import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import App from "./App";
import { createStyledBreakpointsTheme } from "styled-breakpoints";

const theme = createStyledBreakpointsTheme();

describe("Smoke test for App", () => {
  it("renders without crashing", async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    await screen.findByText(/Login/i);
  });
});
