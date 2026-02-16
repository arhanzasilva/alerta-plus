import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { t, useThemeClasses } from "../context/translations";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconUser,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconInfoCircle,
  IconLoader2,
} from "@tabler/icons-react";

export function Register() {
  const navigate = useNavigate();
  const {
    setUserProfile,
    setIsOnboarded,
    theme,
    language,
  } = useApp();
  const tc = useThemeClasses(theme);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Format birth date input as DD/MM/YYYY
  const handleBirthDateChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    let formatted = "";
    if (digits.length > 0) formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += "/" + digits.slice(2, 4);
    if (digits.length > 4) formatted += "/" + digits.slice(4, 8);
    setBirthDate(formatted);
    setError("");
  };

  const handleCreateAccount = () => {
    if (isLoading) return;
    setError("");

    if (!name.trim()) {
      setError(t("register.nameRequired", language));
      return;
    }
    if (!email.trim()) {
      setError(t("register.emailRequired", language));
      return;
    }
    if (password.length < 6) {
      setError(t("register.passwordMin", language));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("register.passwordsMismatch", language));
      return;
    }
    if (!agreedTerms) {
      setError(t("register.acceptTerms", language));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setUserProfile({
        name: name.trim(),
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
      setIsLoading(false);
      toast.success(t("register.success", language));
      navigate("/profile", { replace: true });
    }, 1500);
  };

  return (
    <div className={`h-full w-full ${tc.bgPage2} overflow-y-auto flex flex-col`}>
      {/* ── Header ── */}
      <div
        className={`relative z-10 flex items-center gap-3 px-4 pb-3 pt-[env(safe-area-inset-top,0px)] min-h-[60px] border-b ${tc.border} ${tc.bgCard}`}
      >
        <button
          onClick={() => navigate(-1)}
          className={`w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 ${tc.activeRow}`}
        >
          <IconArrowLeft className={`w-5 h-5 ${tc.iconColor}`} />
        </button>
        <h1 className={`${tc.textPrimary} text-[17px] font-['Poppins'] font-bold`}>
          {t("register.title", language)}
        </h1>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="px-5 pt-5 pb-8"
        >
          {/* Subtitle */}
          <p className={`text-[13px] font-['Poppins'] ${tc.textSecondary} mb-5 leading-[20px]`}>
            {t("register.subtitle", language)}
          </p>

          {/* Name field */}
          <div className="mb-3">
            <label className={`block text-[12px] font-medium font-['Poppins'] ${tc.textSecondary} mb-1.5`}>
              {t("register.fullName", language)}
            </label>
            <div className="relative">
              <IconUser className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${tc.isDark ? "text-gray-500" : "text-[#99a1af]"}`} />
              <input
                type="text"
                placeholder={t("register.fullNamePlaceholder", language)}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                className={`w-full h-[50px] pl-11 pr-4 rounded-[14px] border text-[14px] font-['Poppins'] outline-none transition focus:ring-2 focus:ring-[#00bc7d]/30 focus:border-[#00bc7d] ${tc.inputBg}`}
              />
            </div>
          </div>

          {/* Birth date field */}
          <div className="mb-3">
            <label className={`block text-[12px] font-medium font-['Poppins'] ${tc.textSecondary} mb-1.5`}>
              {t("register.birthDate", language)}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder={t("register.birthDatePlaceholder", language)}
                value={birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
                className={`w-full h-[50px] pl-3 pr-4 rounded-[14px] border text-[14px] font-['Poppins'] outline-none transition focus:ring-2 focus:ring-[#00bc7d]/30 focus:border-[#00bc7d] ${tc.inputBg}`}
              />
            </div>
          </div>

          {/* Email field */}
          <div className="mb-3">
            <label className={`block text-[12px] font-medium font-['Poppins'] ${tc.textSecondary} mb-1.5`}>
              {t("register.email", language)}
            </label>
            <div className="relative">
              <IconMail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${tc.isDark ? "text-gray-500" : "text-[#99a1af]"}`} />
              <input
                type="email"
                placeholder={t("register.emailPlaceholder", language)}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className={`w-full h-[50px] pl-11 pr-4 rounded-[14px] border text-[14px] font-['Poppins'] outline-none transition focus:ring-2 focus:ring-[#00bc7d]/30 focus:border-[#00bc7d] ${tc.inputBg}`}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-3">
            <label className={`block text-[12px] font-medium font-['Poppins'] ${tc.textSecondary} mb-1.5`}>
              {t("register.password", language)}
            </label>
            <div className="relative">
              <IconLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${tc.isDark ? "text-gray-500" : "text-[#99a1af]"}`} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("register.passwordPlaceholder", language)}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={`w-full h-[50px] pl-11 pr-12 rounded-[14px] border text-[14px] font-['Poppins'] outline-none transition focus:ring-2 focus:ring-[#00bc7d]/30 focus:border-[#00bc7d] ${tc.inputBg}`}
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

          {/* Confirm password field */}
          <div className="mb-3">
            <label className={`block text-[12px] font-medium font-['Poppins'] ${tc.textSecondary} mb-1.5`}>
              {t("register.confirmPassword", language)}
            </label>
            <div className="relative">
              <IconLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ${tc.isDark ? "text-gray-500" : "text-[#99a1af]"}`} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("register.confirmPasswordPlaceholder", language)}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                className={`w-full h-[50px] pl-11 pr-12 rounded-[14px] border text-[14px] font-['Poppins'] outline-none transition focus:ring-2 focus:ring-[#00bc7d]/30 focus:border-[#00bc7d] ${tc.inputBg}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
              >
                {showConfirmPassword ? (
                  <IconEyeOff className={`w-[18px] h-[18px] ${tc.isDark ? "text-gray-500" : "text-[#99a1af]"}`} />
                ) : (
                  <IconEye className={`w-[18px] h-[18px] ${tc.isDark ? "text-gray-500" : "text-[#99a1af]"}`} />
                )}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3 mb-4 pt-1">
            <button
              type="button"
              onClick={() => { setAgreedTerms(!agreedTerms); setError(""); }}
              className={`w-5 h-5 mt-0.5 rounded-lg border-[1.5px] flex-shrink-0 flex items-center justify-center transition ${
                agreedTerms
                  ? "bg-[#00bc7d] border-[#00bc7d]"
                  : tc.isDark
                  ? "border-gray-500 bg-transparent"
                  : "border-[#d1d5dc] bg-transparent"
              }`}
            >
              {agreedTerms && (
                <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <p className={`text-[12px] font-['Poppins'] ${tc.textSecondary} leading-[19.5px]`}>
              {t("register.agreeTerms", language)}{" "}
              <span className="text-[#2b7fff] font-medium">{t("register.termsOfUse", language)}</span>
              {" "}{t("register.and", language)}{" "}
              <span className="text-[#2b7fff] font-medium">{t("register.privacyPolicy", language)}</span>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-[12px] font-['Poppins'] mb-3"
            >
              {error}
            </motion.p>
          )}

          {/* Create Account button */}
          <button
            disabled={isLoading}
            onClick={handleCreateAccount}
            className="w-full h-[49px] bg-[#00bc7d] rounded-[14px] text-white text-[14px] font-medium font-['Poppins'] shadow-[0px_10px_15px_rgba(0,188,125,0.2),0px_4px_6px_rgba(0,188,125,0.2)] active:scale-[0.97] transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading && <IconLoader2 className="w-5 h-5 animate-spin" />}
            {isLoading
              ? t("register.creating", language)
              : t("register.createAccount", language)}
          </button>

          {/* Already have account */}
          <div className="flex items-center justify-center gap-1 mt-3">
            <span className={`text-[13px] font-['Poppins'] ${tc.textSecondary}`}>
              {t("register.hasAccount", language)}
            </span>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="text-[16px] font-medium font-['Poppins'] text-[#2b7fff]"
            >
              {t("register.login", language)}
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
                {t("register.infoText", language)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}