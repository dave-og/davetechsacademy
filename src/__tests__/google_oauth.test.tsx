import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider, AuthContext } from "../context/AuthContext";
import { GoogleAuthButton } from "../components/common/GoogleAuthButton";
import { Login } from "../pages/Auth/Login";
import { Signup } from "../pages/Auth/Signup";
import { AuthCallback } from "../pages/Auth/AuthCallback";
import { supabase } from "../lib/supabase";

describe("Google OAuth & Multi-Provider Authentication Flows", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("renders GoogleAuthButton with proper accessibility attributes and text", () => {
    render(
      <AuthProvider>
        <GoogleAuthButton label="Continue with Google" />
      </AuthProvider>
    );

    const btn = screen.getByRole("button", { name: /continue with google/i });
    expect(btn).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("renders Continue with Google button on the Login page alongside email form", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByText(/or sign in with email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it("renders Sign up with Google button on the Signup page alongside registration form", () => {
    render(
      <MemoryRouter initialEntries={["/signup"]}>
        <AuthProvider>
          <Signup />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /sign up with google/i })).toBeInTheDocument();
    expect(screen.getByText(/or register with email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it("invokes supabase.auth.signInWithOAuth with google provider and select_account prompt on button click", async () => {
    const signInWithOAuthSpy = vi.spyOn(supabase.auth, "signInWithOAuth").mockResolvedValue({
      data: { provider: "google", url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=590989430418..." },
      error: null,
    });

    render(
      <AuthProvider>
        <GoogleAuthButton label="Continue with Google" />
      </AuthProvider>
    );

    const btn = screen.getByRole("button", { name: /continue with google/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(signInWithOAuthSpy).toHaveBeenCalledTimes(1);
      expect(signInWithOAuthSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: "google",
          options: expect.objectContaining({
            redirectTo: expect.stringContaining("/auth/callback"),
            queryParams: expect.objectContaining({
              prompt: "select_account",
            }),
          }),
        })
      );
    });
  });

  it("handles OAuth callback cancellation error gracefully", async () => {
    render(
      <MemoryRouter initialEntries={["/auth/callback?error=access_denied&error_description=User+cancelled"]}>
        <AuthProvider>
          <AuthCallback />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/google sign-in was cancelled/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /return to login/i })).toBeInTheDocument();
    });
  });

  it("handles PKCE code exchange in callback route", async () => {
    const exchangeSpy = vi.spyOn(supabase.auth, "exchangeCodeForSession").mockResolvedValue({
      data: {
        session: {
          access_token: "mock_jwt_token",
          user: {
            id: "user_google_123",
            email: "student@google.com",
            user_metadata: { full_name: "Google Student", avatar_url: "https://lh3.googleusercontent.com/a/mock" },
          },
        } as any,
      },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/auth/callback?code=mock_oauth_code_123"]}>
        <AuthProvider>
          <AuthCallback />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(exchangeSpy).toHaveBeenCalledWith("mock_oauth_code_123");
    });
  });
});
