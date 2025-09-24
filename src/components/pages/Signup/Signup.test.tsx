import { render, screen, waitFor } from "utils/test-utils";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Signup from "./Signup";
import { registerUser, sendVerificationEmail, signOutUser } from "services/auth";

jest.mock("services/auth", () => ({
  registerUser: jest.fn(),
  sendVerificationEmail: jest.fn(),
  signOutUser: jest.fn(),
}));

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "Password@123";

const renderSignup = () => {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  )
}

const fillForm = async () => {
  const emailInput = screen.getByPlaceholderText(/Email address/i);
  const passwordInput = screen.getByPlaceholderText(/Password/i);
  
  await waitFor(async () => {
    await userEvent.type(emailInput, TEST_EMAIL);
  });
  await waitFor(async () => {
    await userEvent.type(passwordInput, TEST_PASSWORD);
  });
};

describe("Signup component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all expected elements", async () => {
    renderSignup();

    const logo = screen.getByAltText(/What's for Dinner\?/i);
    const emailInput = await screen.findByPlaceholderText(/Email address/i);
    const passwordInput = await screen.findByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Sign up/i });

    expect(logo).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("updates inputs when typing", async () => {
    renderSignup();

    const emailInput = screen.getByPlaceholderText(/Email address/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    await waitFor(async () => {
      await userEvent.type(emailInput, TEST_EMAIL);
    });
    await waitFor(async () => {
      await userEvent.type(passwordInput, TEST_PASSWORD);
    });

    expect(emailInput).toHaveValue(TEST_EMAIL);
    expect(passwordInput).toHaveValue(TEST_PASSWORD);
  });

  it("signs up upon filling credentials and clicking sign up and shows success message", async () => {
    (registerUser as jest.Mock).mockResolvedValue({
      success: true,
      user: { uid: "mock-uid", email: TEST_EMAIL },
    });
    (sendVerificationEmail as jest.Mock).mockResolvedValue(true);
    (signOutUser as jest.Mock).mockResolvedValue(undefined);

    renderSignup();
    await fillForm();

    const submitButton = screen.getByRole('button', { name: /Sign up/i });
    await waitFor(async () => {
      await userEvent.click(submitButton)
    });

    expect(screen.getByRole('button', { name: /Signing up.../i })).toBeInTheDocument();
    expect(registerUser).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    const expectedUserArgument = { uid: "mock-uid", email: TEST_EMAIL };
    expect(sendVerificationEmail).toHaveBeenCalledWith(expectedUserArgument);
    expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(signOutUser).toHaveBeenCalledTimes(1);
    const successMessage = await screen.findByText(
      /A verification email has been sent to your email address. Please verify your email to complete the sign-up process./i
    );
    expect(successMessage).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Signing up.../i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign up/i })).toBeInTheDocument();
  });

  it("shows error message on failed signup", async () => {
    (registerUser as jest.Mock).mockResolvedValue({
      success: false,
      error: "An account with that email address already exists. Please log in or choose a different email to sign up.",
    });

    renderSignup();
    await fillForm();

    const submitButton = screen.getByRole('button', { name: /Sign up/i });
    await waitFor(async () => {
      await userEvent.click(submitButton)
    });

    expect(registerUser).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect(signOutUser).not.toHaveBeenCalled();
    const errorMessage = await screen.findByText(/An account with that email address already exists. Please log in or choose a different email to sign up./i);
    expect(errorMessage).toBeInTheDocument();
    expect(screen.queryByText(/A verification email has been sent/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Signing up.../i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign up/i })).toBeInTheDocument();
  });
});
