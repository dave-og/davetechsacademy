import React, { createContext, useState, useEffect, useCallback } from "react";
import type { AuthUser, SignupData, LoginCredentials } from "../types";
import {
  hashPassword,
  verifyPassword,
  generateMockJwt,
  isTokenExpired,
  sanitizeUserForStorage,
  sanitizeString,
  sanitizePhone,
} from "../utils/security";
import {
  checkRateLimit,
  recordRateLimitAttempt,
  resetRateLimit,
} from "../utils/rateLimiter";
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePhone,
} from "../utils/validation";
import { triggerSignupWelcome } from "../services/crm";
import { trackSignupComplete } from "../services/analytics";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface StoredUser extends AuthUser {
  passwordHash: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; resetToken?: string }>;
  resetPassword: (token: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = "devtechs_registered_users";
const SESSION_STORAGE_KEY = "devtechs_auth_session";
const REMEMBER_KEY = "devtechs_remember_pref";
const RESET_TOKENS_KEY = "devtechs_reset_tokens";

// Known SHA-256 pre-seeded salted hashes
const STUDENT_DEMO_HASH = "sha256_dtastudent_25c27b211a2739fe31e965bd7a90c0d97345fbd328d9adbdefb4aef97fbe0089";
const ADMIN_DEMO_HASH = "sha256_dtaadmin_301d42646ca63fb94efd0a06be0b1f3b16248983d24e96c50ff6950bfe1b0246";

const DEFAULT_USERS: StoredUser[] = [
  {
    id: "stu-demo-01",
    fullName: "Adebayo David",
    email: "student@davetechs.ng",
    phone: "+234 801 234 5678",
    country: "Nigeria",
    state: "Ogun State",
    role: "student",
    createdAt: "2026-01-15T09:00:00.000Z",
    passwordHash: STUDENT_DEMO_HASH,
  },
  {
    id: "stu-demo-02",
    fullName: "Adebayo David",
    email: "student@devtechs.ng",
    phone: "+234 801 234 5678",
    country: "Nigeria",
    state: "Ogun State",
    role: "student",
    createdAt: "2026-01-15T09:00:00.000Z",
    passwordHash: STUDENT_DEMO_HASH,
  },
  {
    id: "admin-master-01",
    fullName: "Dave Techs Academy Admin",
    email: "admin@davetechs.ng",
    phone: "+234 802 345 6789",
    country: "Nigeria",
    state: "Lagos State",
    role: "admin",
    createdAt: "2026-01-01T08:00:00.000Z",
    passwordHash: ADMIN_DEMO_HASH,
  },
  {
    id: "admin-master-02",
    fullName: "Dave Techs Academy Admin",
    email: "admin@devtechs.ng",
    phone: "+234 802 345 6789",
    country: "Nigeria",
    state: "Lagos State",
    role: "admin",
    createdAt: "2026-01-01T08:00:00.000Z",
    passwordHash: ADMIN_DEMO_HASH,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and load saved session
  useEffect(() => {
    try {
      // Ensure seed users exist in database and are up to date
      const existingUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!existingUsersRaw) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      } else {
        try {
          const parsedUsers: StoredUser[] = JSON.parse(existingUsersRaw);
          DEFAULT_USERS.forEach((defUser) => {
            const idx = parsedUsers.findIndex(
              (u) => u.email.toLowerCase() === defUser.email.toLowerCase()
            );
            if (idx === -1) {
              parsedUsers.push(defUser);
            } else {
              parsedUsers[idx].passwordHash = defUser.passwordHash;
              parsedUsers[idx].role = defUser.role;
            }
          });
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsedUsers));
        } catch {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        }
      }

      // Check for saved session
      const savedLocal = localStorage.getItem(SESSION_STORAGE_KEY);
      const savedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const activeSession = savedLocal || savedSession;

      if (activeSession) {
        const parsed = JSON.parse(activeSession) as AuthUser;
        // Check if token has expired
        if (parsed.token && isTokenExpired(parsed.token)) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          setUser(null);
        } else {
          setUser(sanitizeUserForStorage(parsed));
        }
      }

      // Listen to Supabase auth state if configured
      if (isSupabaseConfigured()) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            const role = (profile?.role as any) || "student";
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || "",
              fullName: profile?.full_name || session.user.user_metadata?.full_name || "Dave Techs Student",
              role: role,
              phone: profile?.phone || session.user.user_metadata?.phone,
              country: "Nigeria",
              token: session.access_token,
              createdAt: session.user.created_at,
            };
            setUser(authUser);
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            localStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    } catch (err) {
      console.error("Failed to load auth session", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit("auth:signup");
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.message };
    }

    // 2. Server-side validation
    const nameVal = validateFullName(data.fullName);
    if (!nameVal.isValid) return { success: false, error: nameVal.error };

    const emailVal = validateEmail(data.email);
    if (!emailVal.isValid) return { success: false, error: emailVal.error };

    const phoneVal = validatePhone(data.phone);
    if (!phoneVal.isValid) return { success: false, error: phoneVal.error };

    const passVal = validatePassword(data.password);
    if (!passVal.isValid) return { success: false, error: passVal.error };

    setIsLoading(true);

    // Call Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailVal.normalized,
          password: data.password,
          options: {
            data: {
              full_name: nameVal.sanitized,
              phone: phoneVal.sanitized,
            },
          },
        });

        if (authError) {
          setIsLoading(false);
          return { success: false, error: authError.message };
        }

        if (authData.user) {
          const authUser: AuthUser = {
            id: authData.user.id,
            fullName: nameVal.sanitized,
            email: emailVal.normalized,
            phone: phoneVal.sanitized,
            country: "Nigeria",
            role: "student",
            createdAt: authData.user.created_at,
            token: authData.session?.access_token || generateMockJwt({ id: authData.user.id, email: emailVal.normalized, role: "student" }, 24),
          };

          setUser(authUser);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
          triggerSignupWelcome(authUser);
          trackSignupComplete(authUser.id, authUser.email, authUser.role);
          setIsLoading(false);
          return { success: true, user: authUser };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || "Failed to create account with Supabase." };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const storedUsers: StoredUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [...DEFAULT_USERS];

      const emailNormalized = emailVal.normalized;
      const existing = storedUsers.find((u) => u.email.toLowerCase() === emailNormalized);

      if (existing) {
        recordRateLimitAttempt("auth:signup");
        setIsLoading(false);
        return { success: false, error: "An account with this email address already exists. Please sign in instead." };
      }

      // Cryptographic SHA-256 hash
      const passwordHash = await hashPassword(data.password);
      const userId = `stu-${Date.now()}`;
      const token = generateMockJwt({ id: userId, email: emailNormalized, role: "student" }, 24);

      const newUser: StoredUser = {
        id: userId,
        fullName: nameVal.sanitized,
        email: emailNormalized,
        phone: phoneVal.sanitized,
        country: "Nigeria",
        role: "student",
        createdAt: new Date().toISOString(),
        passwordHash,
      };

      storedUsers.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));

      const authUser: AuthUser = {
        ...sanitizeUserForStorage(newUser),
        token,
      };

      setUser(authUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
      resetRateLimit("auth:signup");

      triggerSignupWelcome(authUser);
      trackSignupComplete(authUser.id, authUser.email, authUser.role);

      setIsLoading(false);
      return { success: true, user: authUser };
    } catch (error) {
      console.error("Signup error:", error);
      setIsLoading(false);
      return { success: false, error: "An unexpected error occurred during signup. Please try again." };
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const emailVal = validateEmail(credentials.email);
    if (!emailVal.isValid) {
      return { success: false, error: "Please provide a valid registered email address." };
    }

    if (!credentials.password) {
      return { success: false, error: "Password is required." };
    }

    const emailNormalized = emailVal.normalized.toLowerCase();
    const isDemoAdmin =
      (emailNormalized === "admin@davetechs.ng" || emailNormalized === "admin@devtechs.ng") &&
      credentials.password === "AdminDevTechs2026!";
    const isDemoStudent =
      (emailNormalized === "student@davetechs.ng" || emailNormalized === "student@devtechs.ng") &&
      credentials.password === "Password123!";

    // 1. Rate Limiting Check (bypass and reset for authorized demo credentials)
    if (!isDemoAdmin && !isDemoStudent) {
      const rateCheck = checkRateLimit("auth:login");
      if (!rateCheck.allowed) {
        return { success: false, error: rateCheck.message };
      }
    } else {
      resetRateLimit("auth:login");
    }

    setIsLoading(true);

    // Call Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: emailVal.normalized,
          password: credentials.password,
        });

        if (authError) {
          setIsLoading(false);
          return { success: false, error: authError.message };
        } else if (authData.user && authData.session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single();

          const role = (profile?.role as any) || "student";
          const authUser: AuthUser = {
            id: authData.user.id,
            email: authData.user.email || emailVal.normalized,
            fullName: profile?.full_name || authData.user.user_metadata?.full_name || "Dave Techs Student",
            role: role,
            phone: profile?.phone,
            country: "Nigeria",
            token: authData.session.access_token,
            createdAt: authData.user.created_at,
          };

          setUser(authUser);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
          resetRateLimit("auth:login");
          setIsLoading(false);
          return { success: true, user: authUser };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || "Failed to authenticate with Supabase." };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const storedUsers: StoredUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [...DEFAULT_USERS];

      let matchedUser = storedUsers.find((u) => u.email.toLowerCase() === emailNormalized);
      if (!matchedUser && (isDemoAdmin || isDemoStudent)) {
        matchedUser = DEFAULT_USERS.find((u) => u.email.toLowerCase() === emailNormalized);
      }

      if (!matchedUser) {
        recordRateLimitAttempt("auth:login");
        setIsLoading(false);
        return { success: false, error: "Invalid email address or password. Please check your credentials." };
      }

      let isMatch = false;
      if (isDemoAdmin || isDemoStudent) {
        isMatch = true;
      } else {
        isMatch = await verifyPassword(credentials.password, matchedUser.passwordHash);
      }

      if (!isMatch) {
        recordRateLimitAttempt("auth:login");
        setIsLoading(false);
        return { success: false, error: "Invalid email address or password. Please check your credentials." };
      }

      resetRateLimit("auth:login");

      const token = generateMockJwt({ id: matchedUser.id, email: matchedUser.email, role: matchedUser.role }, 24);

      const authUser: AuthUser = {
        ...sanitizeUserForStorage(matchedUser),
        token,
      };

      setUser(authUser);

      if (credentials.rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
        localStorage.setItem(REMEMBER_KEY, "true");
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(REMEMBER_KEY);
      }

      resetRateLimit("auth:login");
      setIsLoading(false);
      return { success: true, user: authUser };
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return { success: false, error: "An unexpected error occurred during login. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase signOut fallback:", err);
      }
    }
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      return { success: false, message: "Please provide a valid registered email address." };
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.resetPasswordForEmail(emailVal.normalized, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      } catch (err) {
        console.warn("Supabase resetPasswordForEmail fallback:", err);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const token = `rst_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const tokens: Record<string, { email: string; expires: number }> = JSON.parse(
      localStorage.getItem(RESET_TOKENS_KEY) || "{}"
    );

    tokens[token] = {
      email: emailVal.normalized,
      expires: Date.now() + 3600000,
    };

    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));

    return {
      success: true,
      message: "Password reset instructions have been sent to your email address if an account exists.",
      resetToken: token,
    };
  }, []);

  const resetPassword = useCallback(async (token: string, newPass: string) => {
    const passVal = validatePassword(newPass);
    if (!passVal.isValid) {
      return { success: false, message: passVal.error || "Invalid password format." };
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (!error) {
          return { success: true, message: "Your password has been successfully updated." };
        }
      } catch (err) {
        console.warn("Supabase updateUser password fallback:", err);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const tokens: Record<string, { email: string; expires: number }> = JSON.parse(
      localStorage.getItem(RESET_TOKENS_KEY) || "{}"
    );

    const record = tokens[token];
    if (!record || record.expires < Date.now()) {
      return { success: false, message: "This password reset link is invalid or has expired." };
    }

    const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    const storedUsers: StoredUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [...DEFAULT_USERS];

    const userIdx = storedUsers.findIndex((u) => u.email.toLowerCase() === record.email.toLowerCase());
    if (userIdx === -1) {
      return { success: false, message: "User account not found." };
    }

    storedUsers[userIdx].passwordHash = await hashPassword(newPass);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));

    delete tokens[token];
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));

    return { success: true, message: "Your password has been successfully reset! You may now log in." };
  }, []);

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    if (!user) return;

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from("profiles")
          .update({
            full_name: data.fullName ? sanitizeString(data.fullName) : undefined,
            phone: data.phone ? sanitizePhone(data.phone) : undefined,
            bio: data.bio ? sanitizeString(data.bio) : undefined,
          })
          .eq("id", user.id);
      } catch (err) {
        console.warn("Supabase profile update fallback:", err);
      }
    }

    const updated: AuthUser = {
      ...user,
      ...data,
      fullName: data.fullName ? sanitizeString(data.fullName) : user.fullName,
      phone: data.phone ? sanitizePhone(data.phone) : user.phone,
      bio: data.bio ? sanitizeString(data.bio) : user.bio,
    };

    setUser(updated);

    const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsersRaw) {
      const storedUsers: StoredUser[] = JSON.parse(storedUsersRaw);
      const idx = storedUsers.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        storedUsers[idx] = { ...storedUsers[idx], ...updated };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
      }
    }

    if (localStorage.getItem(SESSION_STORAGE_KEY)) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
    }
  }, [user]);

  const changePassword = useCallback(async (currentPass: string, newPass: string) => {
    if (!user) {
      return { success: false, error: "You must be signed in to change your password." };
    }

    const passVal = validatePassword(newPass);
    if (!passVal.isValid) {
      return { success: false, error: passVal.error };
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (!error) {
          return { success: true, message: "Password changed successfully." };
        }
      } catch (err) {
        console.warn("Supabase changePassword fallback:", err);
      }
    }

    const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    const storedUsers: StoredUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [...DEFAULT_USERS];

    const idx = storedUsers.findIndex((u) => u.id === user.id);
    if (idx === -1) {
      return { success: false, error: "User account could not be found." };
    }

    const isMatch = await verifyPassword(currentPass, storedUsers[idx].passwordHash);
    if (!isMatch) {
      return { success: false, error: "Your current password does not match our records." };
    }

    storedUsers[idx].passwordHash = await hashPassword(newPass);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));

    return { success: true, message: "Your password has been changed successfully." };
  }, [user]);

  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    setIsLoading(true);

    try {
      const targetCallback = redirectTo || `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: targetCallback,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data?.url) {
        // Redirect browser to Google authentication URL
        window.location.href = data.url;
        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      console.error("Supabase Google OAuth error:", err);
      setIsLoading(false);
      return { success: false, error: err.message || "Failed to connect to Google authentication." };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signup,
        login,
        signInWithGoogle,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
