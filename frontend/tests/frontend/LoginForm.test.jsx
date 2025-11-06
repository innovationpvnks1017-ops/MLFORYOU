import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "../../src/components/Auth/LoginForm";
import axios from "../../src/api/api";

jest.mock("../../src/api/api");

describe("LoginForm", () => {
  test("renders and submits form", async () => {
    const mockLoginSuccess = jest.fn();
    axios.post.mockResolvedValueOnce({
      data: { access_token: "token123" },
    });

    render(<LoginForm onLoginSuccess={mockLoginSuccess} />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLoginSuccess).toHaveBeenCalledWith("token123");
    });

    expect(axios.post).toHaveBeenCalledWith("/auth/login", {
      username: "testuser",
      password: "password123",
    });
  });

  test("shows error on empty fields", async () => {
    render(<LoginForm onLoginSuccess={() => {}} />);
    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/username and password are required/i)).toBeInTheDocument();
  });

  test("shows error on invalid credentials", async () => {
    const mockLoginSuccess = jest.fn();
    axios.post.mockRejectedValueOnce({ response: { status: 401 } });

    render(<LoginForm onLoginSuccess={mockLoginSuccess} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "user" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrongpass" } });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument();
    expect(mockLoginSuccess).not.toHaveBeenCalled();
  });
});
