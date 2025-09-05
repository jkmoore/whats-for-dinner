import { render, screen } from "./test-utils";
import App from "./App";

describe("Smoke test for App", () => {
  it("renders without crashing", async () => {
    render(<App />);
    await screen.findByText(/Login/i);
  });
});
