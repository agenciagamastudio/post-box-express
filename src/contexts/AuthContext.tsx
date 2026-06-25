import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: string;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh 5 minutes before expiry

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // First check if we have a persisted session
        const persistedSession = localStorage.getItem("auth_session");
        if (persistedSession) {
          try {
            const session = JSON.parse(persistedSession);
            // Verify session is still valid
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              await fetchProfile();
              setupTokenRefresh();
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.warn("Persisted session invalid, clearing:", error);
            localStorage.removeItem("auth_session");
          }
        }

        // Fall back to getting session from Supabase
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          // Persist session
          localStorage.setItem(
            "auth_session",
            JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at,
            })
          );
          // Fetch user profile from API
          await fetchProfile();
          // Set up token refresh
          setupTokenRefresh();
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        if (session) {
          // Persist session when signing in or updating
          localStorage.setItem(
            "auth_session",
            JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
            })
          );
          setupTokenRefresh();
        }
        await fetchProfile();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("auth_session");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const response = await fetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch profile");

        const profile = await response.json();
        setUser(profile);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  // Setup automatic token refresh
  const setupTokenRefresh = () => {
    const interval = setInterval(async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          clearInterval(interval);
          return;
        }

        // Check if token is expiring soon
        const expiresAt = sessionData.session.expires_at
          ? new Date(sessionData.session.expires_at * 1000)
          : null;
        const now = new Date();
        const timeUntilExpiry = expiresAt ? expiresAt.getTime() - now.getTime() : 0;

        // If token expires within threshold, refresh it
        if (timeUntilExpiry > 0 && timeUntilExpiry < TOKEN_REFRESH_THRESHOLD) {
          console.log("Token expiring soon, refreshing...");
          await refreshToken();
        }
      } catch (error) {
        console.error("Auto refresh error:", error);
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side session
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Sign out from Supabase
      await supabase.auth.signOut();
      setUser(null);

      // Clear persisted session
      localStorage.removeItem("auth_session");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (data.session) {
        // Persist refreshed session
        localStorage.setItem(
          "auth_session",
          JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          })
        );
        await fetchProfile();
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshToken,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
