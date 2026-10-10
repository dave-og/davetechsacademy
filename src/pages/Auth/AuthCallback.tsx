import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import "./Auth.css";

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Verifying your Google account...");

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      // 1. Check for URL errors (e.g., user clicked Cancel in Google prompt)
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        if (error === "access_denied") {
          setErrorMessage("Google sign-in was cancelled.");
        } else {
          setErrorMessage(errorDescription || "We couldn't complete Google sign-in. Please try again.");
        }
        return;
      }

      if (!isSupabaseConfigured()) {
        // Fallback for local mock environment
        setStatusMessage("Completing authentication...");
        setTimeout(() => {
          if (isMounted) {
            navigate("/dashboard", { replace: true });
          }
        }, 600);
        return;
      }

      try {
        // 2. Check for PKCE Authorization Code
        const code = searchParams.get("code");
        if (code) {
          const { data: codeData, error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (codeError) {
            console.warn("PKCE code exchange error:", codeError);
          } else if (codeData?.session?.user) {
            setStatusMessage("Preparing your student dashboard...");
            await ensureUserProfile(codeData.session.user);
            if (isMounted) {
              navigate("/dashboard", { replace: true });
            }
            return;
          }
        }

        // 3. Retrieve session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          // If hash tokens are still processing, listen for auth change
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
              if (event === "SIGNED_IN" && currentSession?.user) {
                await ensureUserProfile(currentSession.user);
                if (isMounted) {
                  navigate("/dashboard", { replace: true });
                }
              }
            }
          );

          // Timeout safety after 6 seconds
          setTimeout(() => {
            if (isMounted && !user) {
              setErrorMessage("Authentication session timed out. Please try signing in again.");
            }
          }, 6000);

          return () => {
            subscription.unsubscribe();
          };
        }

        // 3. User authenticated: Ensure profile exists
        if (session.user) {
          setStatusMessage("Preparing your student dashboard...");
          await ensureUserProfile(session.user);
          if (isMounted) {
            navigate("/dashboard", { replace: true });
          }
        }
      } catch (err: any) {
        console.error("Auth callback exception:", err);
        if (isMounted) {
          setErrorMessage(err.message || "Something went wrong while connecting to Google.");
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, searchParams, user]);

  /**
   * Checks if user profile exists in public.profiles and inserts if missing.
   */
  async function ensureUserProfile(authUser: any) {
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!existingProfile) {
        const fullName =
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          "Dave Techs Student";

        const avatarUrl =
          authUser.user_metadata?.avatar_url ||
          authUser.user_metadata?.picture ||
          null;

        await supabase.from("profiles").upsert(
          {
            id: authUser.id,
            email: authUser.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            role: "student",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
      }
    } catch (profileErr) {
      console.warn("Could not synchronize public profile:", profileErr);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: "center", padding: "var(--sp-12) var(--sp-8)" }}>
          {errorMessage ? (
            <div>
              <div style={{ fontSize: "40px", marginBottom: "var(--sp-4)" }}>⚠️</div>
              <h2 className="auth-card__title" style={{ fontSize: "var(--fs-xl)" }}>
                Authentication Error
              </h2>
              <p className="auth-card__subtitle" style={{ marginBottom: "var(--sp-6)" }}>
                {errorMessage}
              </p>
              <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "center" }}>
                <Link to="/login">
                  <Button variant="primary" size="md">
                    Return to Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="secondary" size="md">
                    Try Creating Account
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="callback-spinner-wrapper" style={{ margin: "0 auto var(--sp-6) auto" }}>
                <div className="callback-gold-spinner" />
              </div>
              <h2 className="auth-card__title" style={{ fontSize: "var(--fs-xl)" }}>
                {statusMessage}
              </h2>
              <p className="auth-card__subtitle">
                Please wait while we establish your secure session with Dave Techs Academy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
