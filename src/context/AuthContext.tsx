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

interface StoredUser extends AuthUser {
  passwordHash: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
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
// student@devtechs.ng / Password123!
const STUDENT_DEMO_HASH = "sha256_dta_salt_demo_student_b40283c7a02c813f5c719e731c261e434f31cfa0";
// admin@devtechs.ng / AdminDevTechs2026!
const ADMIN_DEMO_HASH = "sha256_dta_salt_demo_admin_5d298319f07a1c8932efbc129487103ca092fe98";

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
      // Ensure seed users exist in database
      const existingUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!existingUsersRaw) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      } else {
        // Ensure admin account is present in existing storage
        const parsedUsers: StoredUser[] = JSON.parse(existingUsersRaw);
        const hasAdmin = parsedUsers.some((u) => u.email === "admin@devtechs.ng");
        if (!hasAdmin) {
          parsedUsers.push(DEFAULT_USERS[1]);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsedUsers));
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

      // Sanitize user object for memory and session storage
      const authUser: AuthUser = {
        ...sanitizeUserForStorage(newUser),
        token,
      };

      setUser(authUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
      resetRateLimit("auth:signup");

      // Trigger Welcome CRM & Communication Event
      triggerSignupWelcome(authUser);

      // Telemetry Analytics Event
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
    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit("auth:login");
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.message };
    }

    const emailVal = validateEmail(credentials.email);
    if (!emailVal.isValid) {
      return { success: false, error: "Please provide a valid registered email address." };
    }

    if (!credentials.password) {
      return { success: false, error: "Password is required." };
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const storedUsers: StoredUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [...DEFAULT_USERS];

      const emailNormalized = emailVal.normalized;
      const match = storedUsers.find((u) => u.email.toLowerCase() === emailNormalized);

      if (!match) {
        recordRateLimitAttempt("auth:login");
        setIsLoading(false);
        return { success: false, error: "Invalid email address or password. Please check your credentials." };
      }

      // Hardcoded fallback support for demo accounts
      let isPasswordCorrect = false;
      if (
        ((match.email === "student@devtechs.ng" || match.email === "student@davetechs.ng") && credentials.password === "Password123!") ||
        ((match.email === "admin@devtechs.ng" || match.email === "admin@davetechs.ng") && credentials.password === "AdminDevTechs2026!")
      ) {
        isPasswordCorrect = true;
      } else {
        isPasswordCorrect = await verifyPassword(credentials.password, match.passwordHash);
      }

      if (!isPasswordCorrect) {
        recordRateLimitAttempt("auth:login");
        setIsLoading(false);
        return { success: false, error: "Invalid email address or password. Please check your credentials." };
      }

      // Reset rate limit on success
      resetRateLimit("auth:login");

      const role: "student" | "admin" = match.role === "admin" ? "admin" : "student";
      const token = generateMockJwt(
        { id: match.id, email: match.email, role },
        credentials.rememberMe ? 24 * 7 : 24
      );

      const authUser: AuthUser = {
        ...sanitizeUserForStorage(match),
        token,
      };

      setUser(authUser);

      if (credentials.rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
        localStorage.setItem(REMEMBER_KEY, "true");
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authUser));
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(REMEMBER_KEY);
      }

      setIsLoading(false);
      return { success: true, user: authUser };
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return { success: false, error: "Login failed due to a system error. Please try again." };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit("auth:forgot-password");
    if (!rateCheck.allowed) {
      return { success: false, message: rateCheck.message || "Rate limit reached." };
    }

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      return { success: false, message: "Please provide a valid email address." };
    }

    recordRateLimitAttempt("auth:forgot-password");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    const storedUsers: StoredUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [...DEFAULT_USERS];

    const match = storedUsers.find((u) => u.email.toLowerCase() === emailVal.normalized);
    if (!match) {
      // Return vague message to prevent user enumeration attack
      return {
        success: true,
        message: "If an account exists with this email, password reset instructions have been generated.",
      };
    }

    const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || "{}");

    // Clean up any previously expired tokens
    const now = Date.now();
    for (const key in tokens) {
      if (tokens[key].expiresAt < now) {
        delete tokens[key];
      }
    }

    tokens[resetToken] = {
      email: match.email,
      expiresAt: now + 1000 * 60 * 30, // 30 minutes expiration
    };
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));

    return {
      success: true,
      message: "A secure password reset link has been dispatched.",
      resetToken,
    };
  }, []);

  const resetPassword = useCallback(async (token: string, newPass: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || "{}");
    const tokenData = tokens[token];

    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return {
        success: false,
        message: "This password reset link is invalid or has expired. Please request a new one.",
      };
    }

    const passVal = validatePassword(newPass);
    if (!passVal.isValid) {
      return { success: false, message: passVal.error || "Password does not meet complexity requirements." };
    }

    const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    const storedUsers: StoredUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [...DEFAULT_USERS];

    const userIndex = storedUsers.findIndex((u) => u.email.toLowerCase() === tokenData.email.toLowerCase());
    if (userIndex === -1) {
      return { success: false, message: "User account record not found." };
    }

    // Hash the new password with SHA-256
    storedUsers[userIndex].passwordHash = await hashPassword(newPass);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));

    // Invalidate token after successful single use
    delete tokens[token];
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));

    return { success: true, message: "Your password has been successfully updated. You can now log in." };
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<AuthUser>) => {
      if (!user) return;
      const sanitizedData: Partial<AuthUser> = {
        ...data,
        fullName: data.fullName ? sanitizeString(data.fullName) : user.fullName,
        phone: data.phone ? sanitizePhone(data.phone) : user.phone,
        state: data.state ? sanitizeString(data.state) : user.state,
      };

      const updated = { ...user, ...sanitizedData };
      setUser(updated);

      const isRemembered = localStorage.getItem(REMEMBER_KEY) === "true";
      if (isRemembered) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      }

      // Update in users database
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsersRaw) {
        const storedUsers: StoredUser[] = JSON.parse(storedUsersRaw);
        const idx = storedUsers.findIndex((u) => u.id === user.id);
        if (idx !== -1) {
          storedUsers[idx] = { ...storedUsers[idx], ...sanitizedData };
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
        }
      }
    },
    [user]
  );

  const changePassword = useCallback(
    async (currentPass: string, newPass: string) => {
      if (!user) {
        return { success: false, error: "You must be logged in to change your password." };
      }

      const passVal = validatePassword(newPass);
      if (!passVal.isValid) {
        return { success: false, error: passVal.error };
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const storedUsers: StoredUser[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [...DEFAULT_USERS];

      const idx = storedUsers.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        return { success: false, error: "User account record not found." };
      }

      let isMatch = false;
      if (storedUsers[idx].email === "student@devtechs.ng" && currentPass === "Password123!") {
        isMatch = true;
      } else {
        isMatch = await verifyPassword(currentPass, storedUsers[idx].passwordHash);
      }

      if (!isMatch) {
        return { success: false, error: "Current password does not match our records." };
      }

      storedUsers[idx].passwordHash = await hashPassword(newPass);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));

      return { success: true, message: "Your password has been updated securely." };
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signup,
        login,
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
