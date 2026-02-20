import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { t, useThemeClasses } from "../context/translations";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconInfoCircle,
  IconLoader2,
} from "@tabler/icons-react";

export function Login() {
  const navigate = useNavigate();
  const {
    userProfile,
    setUserProfile,
    updateUserProfile,
    setIsOnboarded,
    theme,
    language,
  } = useApp();
  const tc = useThemeClasses(theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState("");

  const userProfileRef = useRef(userProfile);
  userProfileRef.current = userProfile;
  const googleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (googleTimerRef.current) clearTimeout(googleTimerRef.current);
      if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    };
  }, []);

  const handleGoogleLogin = () => {
    if (isLoading) return;
    setError("");
    setLoginMode("google");
    setIsLoading(true);
    const gEmail = "usuario@gmail.com";
    googleTimerRef.current = setTimeout(() => {
      if (userProfileRef.current) {
        updateUserProfile({ email: gEmail, loginMethod: "google" });
      } else {
        setUserProfile({
          name: t("login.googleUserName", language),
          email: gEmail,
          neighborhood: "",
          transportMode: "pedestrian",
          needs: [],
          timePreference: "both",
          points: 0,
          trustLevel: 1,
          badges: [],
          reportsCount: 0,
          impactCount: 0,
          confirmationsGiven: 0,
          denialsGiven: 0,
          routesSearched: 0,
          loginMethod: "google",
        });
        setIsOnboarded(true);
      }
      setIsLoading(false);
      toast.success(t("login.successGoogle", language));
      navigate("/map", { replace: true });
    }, 1500);
  };

  const handleEmailLogin = () => {
    if (isLoading) return;
    setError("");

    if (!email.trim()) {
      setError(t("login.emailRequired", language));
      return;
    }
    if (password.length < 6) {
      setError(t("login.passwordMin", language));
      return;
    }

    setLoginMode("email");
    setIsLoading(true);
    emailTimerRef.current = setTimeout(() => {
      if (userProfileRef.current) {
        updateUserProfile({
          email: email.trim(),
          name: email.split("@")[0],
          loginMethod: "email",
        });
      } else {
        setUserProfile({
          name: email.split("@")[0],
          email: email.trim(),
          neighborhood: "",
          transportMode: "pedestrian",
          needs: [],
          timePreference: "both",
          points: 0,
          trustLevel: 1,
          badges: [],
          reportsCount: 0,
          impactCount: 0,
          confirmationsGiven: 0,
          denialsGiven: 0,
          routesSearched: 0,
          loginMethod: "email",
        });
        setIsOnboarded(true);
      }
      setIsLoading(false);
      toast.success(t("login.successEmail", language));
      navigate("/map", { replace: true });
    }, 1500);
  };

  return (
    <div className={`h-full w-full ${tc.bgPage2} overflow-y-auto flex flex-col`}>
      {/* ── Header ── */}
      <div
        className={`relative z-10 flex items-center px-4 pb-3 pt-[env(safe-area-inset-top,0px)] min-h-[60px] border-b ${tc.border} ${tc.bgCard}`}
      >
        <button
          onClick={() => navigate("/map", { replace: true })}
          className={`w-9 h-9 flex items-center justify-center rounded-full ${tc.activeRow}`}
        >
          <IconArrowLeft className={`w-5 h-5 ${tc.iconColor}`} />
        </button>
        <h1 className={`flex-1 text-left ${tc.textPrimary} text-[17px] font-['Poppins'] font-bold`}>
          {t("login.accountLogin", language)}
        </h1>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="px-5 pt-6 pb-8"
        >
          {/* Logo + heading */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-[88px] h-[88px] rounded-3xl flex items-center justify-center shadow-[0px_25px_50px_rgba(0,0,0,0.25)] mb-6"
              style={{
                backgroundImage:
                  "linear-gradient(141.54deg, rgb(10, 37, 64) 51.349%, rgb(28, 82, 135) 95.447%)",
              }}
            >
              {/* App icon: simplified Alerta+ */}
              <svg
                viewBox="0 0 76 46"
                className="w-[76px] h-[46px]"
                fill="none"
              >
                <path
                  d="M34.1498 3.79345V9.23151C33.0387 7.44143 31.4534 5.99581 29.3945 4.89463C27.3349 3.79345 24.9402 3.24248 22.2102 3.24248C19.0175 3.24248 16.1249 4.04594 13.5333 5.65211C10.941 7.25903 8.89352 9.55334 7.39024 12.5358C5.88544 15.5198 5.1338 18.9846 5.1338 22.931C5.1338 26.8775 5.88544 30.3551 7.39024 33.3609C8.89352 36.3675 10.941 38.6852 13.5333 40.314C16.1242 41.9435 18.9932 42.7583 22.1411 42.7583C24.871 42.7583 27.2658 42.2073 29.3254 41.1061C31.3842 40.0042 32.9924 38.5586 34.1498 36.7692V42.2073H46.0195V3.79345H34.1498ZM31.6859 29.9526C30.0428 31.6515 28.041 32.4995 25.6812 32.4995C23.3214 32.4995 21.3188 31.6387 19.6764 29.918C18.0333 28.1972 17.2125 25.8683 17.2125 22.9303C17.2125 19.9923 18.0333 17.6874 19.6764 16.0119C21.3188 14.3372 23.3206 13.499 25.6812 13.499C28.0417 13.499 30.042 14.3492 31.6859 16.0458C33.3275 17.7447 34.1498 20.0624 34.1498 22.9989C34.1498 25.9353 33.3275 28.2545 31.6859 29.9519V29.9526Z"
                  fill="white"
                />
                <path
                  d="M57.9948 17.2586V3.73466H46.0119V17.2586H32.6466C33.6467 18.7962 34.1491 20.7091 34.1491 23.0004C34.1491 25.2917 33.6308 27.2649 32.5994 28.8138V28.8176H46.0112V42.2661H57.9941V28.8176H70.8647V17.2586H57.9941H57.9948Z"
                  fill="#FFC107"
                />
              </svg>
            </div>
            <h2 className={`text-[20px] font-bold font-['Poppins'] ${tc.textPrimary} text-center`}>
              {t("login.signInTitle", language)}
            </h2>
            <p className={`text-[13px] font-['Poppins'] ${tc.textSecondary} text-center mt-1`}>
              {t("login.syncSubtitle", language)}
            </p>
          </div>

          {/* Google Button */}
          <button
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className={`w-full h-[50px] rounded-[14px] flex items-center justify-center gap-2.5 border transition active:scale-[0.97] disabled:opacity-60 shadow-sm ${
              tc.isDark
                ? "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                : "bg-white border-gray-200 text-[#101828] hover:bg-gray-50"
            }`}
          >
            {isLoading && loginMode === "google" ? (
              <IconLoader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                <g clipPath="url(#gclip)">
                  <path
                    d="M18.795 10.2056C18.795 9.55581 18.7367 8.93097 18.6284 8.33113H9.99735V11.8802H14.9294C14.8269 12.4412 14.6116 12.9756 14.2965 13.4511C13.9815 13.9265 13.5733 14.3331 13.0965 14.6461V16.9538H16.0707C17.8036 15.3543 18.8034 13.0049 18.8034 10.2056H18.795Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9.99735 19.1616C12.4717 19.1616 14.5462 18.3451 16.0624 16.9455L13.0882 14.6378C12.2718 15.1876 11.2304 15.5209 9.99735 15.5209C7.61465 15.5209 5.59019 13.913 4.86538 11.7469H1.81619V14.1129C3.32412 17.1038 6.41497 19.1616 9.99735 19.1616Z"
                    fill="#34A853"
                  />
                  <path
                    d="M4.86538 11.7386C4.68209 11.1887 4.57379 10.6055 4.57379 9.99735C4.57379 9.38918 4.68209 8.806 4.86538 8.25615V5.89011H1.81619C1.17203 7.16356 0.835335 8.57026 0.833113 9.99735C0.833113 11.472 1.18302 12.8716 1.81619 14.1046L4.86538 11.7386Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9.99735 4.48215C11.347 4.48215 12.5467 4.94869 13.5048 5.84845L16.1291 3.22415C14.5378 1.74121 12.4717 0.833113 9.99735 0.833113C6.41497 0.833113 3.32412 2.8909 1.81619 5.89011L4.86538 8.25615C5.59019 6.09005 7.61465 4.48215 9.99735 4.48215Z"
                    fill="#EA4335"
                  />
                </g>
                <defs>
                  <clipPath id="gclip">
                    <rect fill="white" height="20" width="20" />
                  </clipPath>
                </defs>
              </svg>
            )}
            <span className="text-[14px] font-medium font-['Poppins']">
              {isLoading && loginMode === "google"
                ? t("login.signingIn", language)
                : t("login.continueGoogle", language)}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className={`flex-1 h-px ${tc.isDark ? "bg-gray-700" : "bg-gray-200"}`} />
            <span className={`text-[12px] font-['Poppins'] ${tc.textSecondary}`}>
              {t("login.orEmail", language)}
            </span>
            <div className={`flex-1 h-px ${tc.isDark ? "bg-gray-700" : "bg-gray-200"}`} />
          </div>

          {/* Email field */}
          <div className="mb-3">
            <label className={`block text-[12px] font-medium font-['Poppins'] ${tc.textSecondary} mb-1.5`}>
              {t("login.email", language)}
            </label>
            <div className="relative">
              <IconMail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${tc.isDark ? "text-gray-500" : "text-[#99a1af]"}`} />
              <input
                type="email"
                placeholder={t("login.emailPlaceholder", language)}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className={`w-full h-[50px] pl-11 pr-4 rounded-[14px] border text-[14px] font-['Poppins'] outline-none transition focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] ${tc.inputBg}`}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-3">
            <label className={`block text-[12px] font-medium font-['Poppins'] ${tc.textSecondary} mb-1.5`}>
              {t("login.password", language)}
            </label>
            <div className="relative">
              <IconLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${tc.isDark ? "text-gray-500" : "text-[#99a1af]"}`} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("login.passwordPlaceholder", language)}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={`w-full h-[50px] pl-11 pr-12 rounded-[14px] border text-[14px] font-['Poppins'] outline-none transition focus:ring-2 focus:ring-[#2b7fff]/30 focus:border-[#2b7fff] ${tc.inputBg}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
              >
                {showPassword ? (
                  <IconEyeOff className={`w-[18px] h-[18px] ${tc.isDark ? "text-gray-500" : "text-[#99a1af]"}`} />
                ) : (
                  <IconEye className={`w-[18px] h-[18px] ${tc.isDark ? "text-gray-500" : "text-[#99a1af]"}`} />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-[12px] font-['Poppins'] mb-2"
            >
              {error}
            </motion.p>
          )}

          {/* Forgot password */}
          <div className="flex justify-end mb-4">
            <button className="text-[13px] font-medium font-['Poppins'] text-[#2b7fff]">
              {t("login.forgotPassword", language)}
            </button>
          </div>

          {/* Sign In button */}
          <button
            disabled={isLoading}
            onClick={handleEmailLogin}
            className="w-full h-[49px] bg-[#2b7fff] rounded-[14px] text-white text-[14px] font-medium font-['Poppins'] shadow-[0px_10px_15px_rgba(43,127,255,0.2),0px_4px_6px_rgba(43,127,255,0.2)] active:scale-[0.97] transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading && loginMode === "email" && (
              <IconLoader2 className="w-5 h-5 animate-spin" />
            )}
            {isLoading && loginMode === "email"
              ? t("login.signingIn", language)
              : t("login.signIn", language)}
          </button>

          {/* Create account */}
          <div className="flex items-center justify-center gap-1 mt-3">
            <span className={`text-[13px] font-['Poppins'] ${tc.textSecondary}`}>
              {t("login.noAccount", language)}
            </span>
            <button
              onClick={() => navigate("/register", { replace: true })}
              className="text-[15px] font-medium font-['Poppins'] text-[#2b7fff]"
            >
              {t("login.createNow", language)}
            </button>
          </div>

          {/* Info box */}
          <div
            className={`mt-8 rounded-[14px] p-4 border ${
              tc.isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-[#f9fafb] border-[#f3f4f6]"
            }`}
          >
            <div className="flex gap-3 items-start">
              <IconInfoCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tc.textSecondary}`} />
              <p className={`text-[12px] font-['Poppins'] ${tc.textSecondary} leading-[19.5px]`}>
                {t("login.infoText", language)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}