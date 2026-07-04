import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "../types";

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  loginWithEmail: (
    email: string,
    role?: UserRole,
    details?: {
      name?: string;
      phone?: string;
      areaOfOperation?: string;
      yearsOfExperience?: number;
    }
  ) => Promise<{ success: boolean; message: string; otpHint?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateLocalProfile: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load persisted session
    const savedToken = localStorage.getItem("sahibhoomi_token");
    const savedUser = localStorage.getItem("sahibhoomi_user");

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser) as UserProfile;
        // Verify user block status
        fetch(`/api/admin/users`)
          .then(res => {
            if (res.ok) return res.json();
            return [];
          })
          .then((users: UserProfile[]) => {
            const freshUser = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
            if (freshUser && freshUser.status === "blocked") {
              // Blocked! Log out
              logout();
            } else if (freshUser) {
              setCurrentUser(freshUser);
              localStorage.setItem("sahibhoomi_user", JSON.stringify(freshUser));
            } else {
              setCurrentUser(user);
            }
          })
          .catch(() => {
            setCurrentUser(user);
          })
          .finally(() => {
            setToken(savedToken);
            setIsLoading(false);
          });
      } catch (e) {
        localStorage.removeItem("sahibhoomi_token");
        localStorage.removeItem("sahibhoomi_user");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginWithEmail = async (
    email: string,
    role: UserRole = "buyer",
    details?: {
      name?: string;
      phone?: string;
      areaOfOperation?: string;
      yearsOfExperience?: number;
    }
  ) => {
    try {
      const res = await fetch("/api/auth/login-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, ...details })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Failed to request OTP" };
      }

      return { success: true, message: data.message, otpHint: data.otpHint };
    } catch (e: any) {
      return { success: false, message: e.message || "Network error occurred" };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Verification failed" };
      }

      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem("sahibhoomi_token", data.token);
      localStorage.setItem("sahibhoomi_user", JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const adminLogin = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Admin login failed" };
      }

      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem("sahibhoomi_token", data.token);
      localStorage.setItem("sahibhoomi_user", JSON.stringify(data.user));

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("sahibhoomi_token");
    localStorage.removeItem("sahibhoomi_user");
  };

  const updateLocalProfile = (updated: Partial<UserProfile>) => {
    if (currentUser) {
      const newProfile = { ...currentUser, ...updated };
      setCurrentUser(newProfile);
      localStorage.setItem("sahibhoomi_user", JSON.stringify(newProfile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        role: currentUser ? currentUser.role : null,
        token,
        isLoading,
        loginWithEmail,
        verifyOtp,
        adminLogin,
        logout,
        updateLocalProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
