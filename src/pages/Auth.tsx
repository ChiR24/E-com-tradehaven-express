import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTwoFactor } from "@/contexts/TwoFactorContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdaptiveAuth } from '@/components/AdaptiveAuth';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const validations = {
  email: {
    required: true,
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    custom: (value: string) => {
      if (!value.includes(".")) {
        return "Please enter a valid email address";
      }
      return null;
    },
  },
  password: {
    required: true,
    minLength: 6,
    custom: (value: string) => {
      if (!/\d/.test(value)) {
        return "Password must contain at least one number";
      }
      if (!/[a-z]/.test(value)) {
        return "Password must contain at least one lowercase letter";
      }
      if (!/[A-Z]/.test(value)) {
        return "Password must contain at least one uppercase letter";
      }
      return null;
    },
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
};

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "reset" | "2fa">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, resetPassword, signOut } = useAuth();
  const { isEnabled: is2FAEnabled, verificationCode, setVerificationCode, verifyTwoFactor } = useTwoFactor();
  const rateLimit = useRateLimit();
  const [showAdaptiveAuth, setShowAdaptiveAuth] = useState(false);
  const [pendingAuthData, setPendingAuthData] = useState<{
    userId: string;
    username: string;
  } | null>(null);
  
  useSession({
    inactivityTimeout: 30,
    sessionDuration: 480,
  });

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
  } = useFormValidation(
    {
      email: "",
      password: "",
      username: "",
      fullName: "",
      verificationCode: "",
    },
    validations
  );

  useEffect(() => {
    // Check for session end messages
    const state = location.state as { message?: string };
    if (state?.message) {
      toast.error(state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }

    // Check for stored credentials
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      handleChange("email", storedEmail);
      setRememberMe(true);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Check rate limiting
      await rateLimit.recordAttempt();

      setLoading(true);

      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (error) throw error;

        // Show adaptive auth if needed
        if (data.user) {
          setPendingAuthData({
            userId: data.user.id,
            username: data.user.email || '',
          });
          setShowAdaptiveAuth(true);
          return;
        }

        if (is2FAEnabled) {
          setMode("2fa");
          return;
        }

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", values.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        
        navigate("/");
      } else if (mode === "signup") {
        await signUp(values.email, values.password, {
          username: values.username,
          full_name: values.fullName,
        });
        toast.success(
          "Sign up successful! Please check your email to verify your account."
        );
        setMode("login");
      } else if (mode === "2fa") {
        await verifyTwoFactor();
        navigate("/");
      } else {
        await resetPassword(values.email);
        toast.success("Password reset instructions have been sent to your email.");
        setMode("login");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: "login" | "signup" | "reset" | "2fa") => {
    setMode(newMode);
    resetForm();
    rateLimit.reset();
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      await rateLimit.recordAttempt();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAdaptiveAuthSuccess = () => {
    setShowAdaptiveAuth(false);
    setPendingAuthData(null);
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", values.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
    navigate("/");
  };

  const handleAdaptiveAuthCancel = () => {
    setShowAdaptiveAuth(false);
    setPendingAuthData(null);
    signOut();
  };

  // Render the 2FA verification form if in 2FA mode
  if (mode === "2fa") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-shop-50 to-shop-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          <div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Two-Factor Authentication
            </h2>
            <p className="mt-2 text-center text-shop-600">
              Please enter the verification code from your authenticator app
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="verificationCode"
                className="block text-sm font-medium text-shop-700"
              >
                Verification Code
              </label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1"
                autoFocus
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-shop-50 to-shop-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
          <div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {mode === "login"
                ? "Welcome Back!"
                : mode === "signup"
                ? "Create Account"
                : "Reset Password"}
            </h2>
            <p className="mt-2 text-center text-shop-600">
              {mode === "login"
                ? "Sign in to your account to continue"
                : mode === "signup"
                ? "Sign up to start shopping"
                : "Enter your email to reset your password"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-shop-700"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={values.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    onBlur={() => handleBlur("username")}
                    className={`mt-1 ${
                      touched.username && errors.username ? "border-red-500" : ""
                    }`}
                    autoFocus
                  />
                  {touched.username && errors.username && (
                    <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-shop-700"
                  >
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    value={values.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    className={`mt-1 ${
                      touched.fullName && errors.fullName ? "border-red-500" : ""
                    }`}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-shop-700"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`mt-1 ${
                  touched.email && errors.email ? "border-red-500" : ""
                }`}
                autoFocus={mode !== "signup"}
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {mode !== "reset" && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-shop-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`mt-1 pr-10 ${
                      touched.password && errors.password ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-accent border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => handleModeChange("reset")}
                  className="text-sm text-primary hover:text-accent"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Add password strength meter */}
            {(mode === "signup" || mode === "reset") && values.password && (
              <PasswordStrength password={values.password} className="mt-2" />
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
              disabled={loading || !isValid}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                "Sign In"
              ) : mode === "signup" ? (
                "Sign Up"
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          {mode !== "reset" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  onClick={() => handleOAuthSignIn("google")}
                  className="w-full"
                  variant="outline"
                >
                  Google
                </Button>
                <Button
                  type="button"
                  onClick={() => handleOAuthSignIn("github")}
                  className="w-full"
                  variant="outline"
                >
                  GitHub
                </Button>
              </div>
            </>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() =>
                handleModeChange(mode === "login" ? "signup" : "login")
              }
              className="text-primary hover:text-accent transition-colors"
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Show rate limit information if attempts exist */}
          {rateLimit.attempts > 0 && (
            <div className="text-xs text-gray-500 text-center">
              {rateLimit.isBlocked() ? (
                <p className="text-red-500">
                  Too many attempts. Please try again in {rateLimit.getRemainingBlockTime()} seconds.
                </p>
              ) : (
                <p>
                  {rateLimit.attempts} of 5 attempts used. Reset in{" "}
                  {Math.ceil((Date.now() - rateLimit.attempts * 60000) / 1000)} seconds.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Dialog open={showAdaptiveAuth} onOpenChange={setShowAdaptiveAuth}>
        <DialogContent>
          {pendingAuthData && (
            <AdaptiveAuth
              onSuccess={handleAdaptiveAuthSuccess}
              onCancel={handleAdaptiveAuthCancel}
              userId={pendingAuthData.userId}
              username={pendingAuthData.username}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Auth;
