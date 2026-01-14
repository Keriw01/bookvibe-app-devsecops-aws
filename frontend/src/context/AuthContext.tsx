import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import { UserDto } from "../dtos/UserDto";

interface AuthContextType {
  user: UserDto | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hasRole = useCallback(
    (roleName: string): boolean => {
      return user?.role?.name === roleName;
    },
    [user]
  );

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await authService.getCurrentUser();

      if (userData && userData.role && userData.role.name) {
        setUser(userData);
        setIsAuthenticated(true);
        console.log("Auth check successful:", userData);
      } else {
        console.warn("Auth check returned incomplete user data:", userData);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log("Auth check failed (user likely not logged in):", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("AuthProvider mounted, checking auth status...");
    const token = localStorage.getItem("refreshToken");
    if (token) {
      checkAuthStatus();
    } else {
      setIsLoading(false);
    }
  }, [checkAuthStatus]);

  const login = async (email: string, password: string) => {
    try {
      const loginResponse = await authService.login({ email, password });
      localStorage.setItem("refreshToken", loginResponse.refreshToken);

      const userData = loginResponse.user;
      setUser(userData);
      setIsAuthenticated(true);
      console.log("Login successful:", userData);
    } catch (error) {
      console.error("Login failed:", error);
      localStorage.removeItem("refreshToken");
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      const registerResponse = await authService.register({
        email,
        password,
        fullName,
      });
      localStorage.setItem("refreshToken", registerResponse.refreshToken);

      const userData = registerResponse.user;
      setUser(userData);
      setIsAuthenticated(true);
      console.log("Registration successful:", userData);
    } catch (error) {
      console.error("Registration failed:", error);
      localStorage.removeItem("refreshToken");
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      console.log("Logout successful on backend.");
    } catch (error) {
      console.error("Logout failed on backend:", error);
    } finally {
      localStorage.removeItem("refreshToken");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      console.log("Frontend state cleared after logout attempt.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated,
        isLoading,
        hasRole,
      }}
    >
      {!isLoading ? children : <div>Loading Application...</div>} {}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
