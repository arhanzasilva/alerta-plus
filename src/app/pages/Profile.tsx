import { useState } from "react";
import { useApp, ACHIEVEMENT_DEFS } from "../context/AppContext";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { t } from "../context/translations";
import { toast } from "sonner";
import {
  IconSettings,
  IconMoon,
  IconHelpCircle,
  IconChevronRight,
  IconChevronDown,
  IconUserPlus,
  IconAward,
  IconMail,
  IconTrendingUp,
  IconLock,
  IconLogout,
  IconCloudUpload,
  IconUser,
  IconRefresh,
  IconLoader2,
  IconClipboardList,
} from "@tabler/icons-react";

const getTrustLevelLabel = (level: number) => {
  if (level >= 4) return { label: "Veterano", color: "from-purple-500 to-purple-600" };
  if (level >= 3) return { label: "Confiavel", color: "from-blue-500 to-blue-600" };
  if (level >= 2) return { label: "Ativo", color: "from-green-500 to-green-600" };
  return { label: "Iniciante", color: "from-gray-500 to-gray-600" };
};

export function Profile() {
  const {
    userProfile,
    setUserProfile,
    updateUserProfile,
    setIsOnboarded,
    incidents,
    toggleTheme,
    theme,
    unlockedAchievements,
    language,
    authStatus,
    helpRequests,
  } = useApp();
  const navigate = useNavigate();
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const isDark = theme === "dark";
  const pageBg = isDark ? "bg-[#111827]" : "bg-[#F8F9FB]";
  const headerBg = isDark ? "bg-[#1f2937]" : "bg-white";
  const headerText = isDark ? "text-white" : "text-gray-900";
  const menuBtnClass = isDark ? "bg-[#1f2937] border-gray-700" : "bg-white border-gray-200";
  const menuTextClass = isDark ? "text-white" : "text-gray-900";
  const subtextClass = isDark ? "text-gray-400" : "text-gray-500";
  const cardShadow = isDark ? "shadow-none" : "shadow-sm";

  // ─── Shared menu items ───
  const menuItems = [
    {
      icon: IconSettings,
      label: t("profile.settings", language),
      iconBg: "bg-slate-500",
      badge: 0,
      action: () => navigate("/settings"),
    },
    {
      icon: IconMoon,
      label: t("profile.darkMode", language),
      iconBg: "bg-slate-700",
      badge: 0,
      action: () => toggleTheme(),
    },
    {
      icon: IconHelpCircle,
      label: t("profile.helpFeedback", language),
      iconBg: "bg-violet-500",
      badge: 0,
      action: () => navigate("/help"),
    },
    {
      icon: IconClipboardList,
      label: t("profile.helpHistory", language),
      iconBg: "bg-emerald-500",
      badge: helpRequests.filter((r) => r.status === "pending").length,
      action: () => navigate("/help-history"),
    },
  ];

  // ─── Shared Menu List ───
  const MenuList = () => (
    <>
      {menuItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * idx }}
            onClick={item.action}
            className={`w-full p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition border ${menuBtnClass} ${cardShadow}`}
          >
            <div
              className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className={`${menuTextClass} flex-1 text-left`}>
              {item.label}
            </span>
            {item.badge > 0 && (
              <span className="w-6 h-6 bg-red-500 rounded-full text-white text-[12px] font-bold flex items-center justify-center">
                {item.badge}
              </span>
            )}
            <IconChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>
        );
      })}
    </>
  );

  // ─── Login Card (shared between guest & anonymous) ───
  const LoginCard = ({ compact }: { compact?: boolean }) => (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`bg-[#0A2540] rounded-3xl ${compact ? "p-4" : "p-5"} text-white shadow-lg relative overflow-hidden`}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-3">
          <div className={`${compact ? "w-11 h-11" : "w-14 h-14"} bg-white/15 rounded-full flex items-center justify-center border-2 border-white/20`}>
            {compact ? (
              <IconCloudUpload className="w-5 h-5 text-white" />
            ) : (
              <IconUserPlus className="w-7 h-7 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h2 className={`mb-0.5 ${compact ? "text-[14px]" : "text-[16px]"} font-bold`}>
              {compact ? t("profile.connectAccount", language) : t("profile.loginCreate", language)}
            </h2>
            <p className={`text-white/60 ${compact ? "text-[12px]" : "text-[13px]"}`}>
              {compact ? t("profile.syncData", language) : t("profile.unlockGamification", language)}
            </p>
          </div>
          <IconChevronDown
            className={`w-5 h-5 text-white/60 transition-transform ${
              showLoginOptions ? "rotate-180" : ""
            }`}
            onClick={() => setShowLoginOptions(!showLoginOptions)}
          />
        </div>

        <button
          onClick={() => setShowLoginOptions(true)}
          className={`w-full bg-white/15 text-white ${compact ? "py-2.5 text-[13px]" : "py-3 text-[14px]"} rounded-xl font-bold hover:bg-white/25 active:scale-[0.97] transition border border-white/15 flex items-center justify-center gap-2`}
        >
          <IconAward className="w-4 h-4" />
          {t("profile.loginOptions", language)}
        </button>

        <AnimatePresence>
          {showLoginOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mt-3">
                <button
                  disabled={isLoggingIn}
                  onClick={() => {
                    if (isLoggingIn) return;
                    setIsLoggingIn(true);
                    const gEmail = "usuario@gmail.com";
                    setTimeout(() => {
                      if (userProfile) {
                        updateUserProfile({ email: gEmail, loginMethod: "google" });
                      } else {
                        setUserProfile({
                          name: "Usuário Google",
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
                      setIsLoggingIn(false);
                      setShowLoginOptions(false);
                      toast.success(
                        language === "pt" ? "Login com Google realizado!" :
                        language === "es" ? "¡Inicio con Google exitoso!" :
                        "Google login successful!"
                      );
                    }, 1500);
                  }}
                  className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-[14px] hover:bg-gray-100 active:scale-[0.97] transition flex items-center justify-center gap-2.5 disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <IconLoader2 className="w-5 h-5 animate-spin text-slate-500" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {isLoggingIn
                    ? (language === "pt" ? "Conectando..." : language === "es" ? "Conectando..." : "Connecting...")
                    : t("profile.googleLogin", language)
                  }
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-[14px] hover:bg-gray-100 active:scale-[0.97] transition flex items-center justify-center gap-2.5"
                >
                  <IconMail className="w-[18px] h-[18px] text-slate-600" />
                  {t("profile.emailLogin", language)}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  // ─── Stats Grid (shared between anonymous & authenticated) ───
  const StatsGrid = () => (
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
      <div className={`rounded-2xl p-4 text-center border ${isDark ? "bg-gray-800 border-gray-700" : "bg-[#F8F9FA] border-gray-100"}`}>
        <div className={`text-3xl font-bold mb-1 ${headerText}`}>
          {userProfile!.points}
        </div>
        <div className={`text-xs ${subtextClass} font-medium`}>{t("profile.points", language)}</div>
      </div>
      <div className={`rounded-2xl p-4 text-center border ${isDark ? "bg-gray-800 border-gray-700" : "bg-[#F8F9FA] border-gray-100"}`}>
        <div className={`text-3xl font-bold mb-1 ${headerText}`}>
          {userProfile!.reportsCount}
        </div>
        <div className={`text-xs ${subtextClass} font-medium`}>
          {t("profile.reports", language)}
        </div>
      </div>
      <div className={`rounded-2xl p-4 text-center border ${isDark ? "bg-gray-800 border-gray-700" : "bg-[#F8F9FA] border-gray-100"}`}>
        <div className={`text-3xl font-bold mb-1 ${headerText}`}>
          {userProfile!.impactCount}
        </div>
        <div className={`text-xs ${subtextClass} font-medium`}>
          {t("profile.impact", language)}
        </div>
      </div>
    </div>
  );

  // ─── Impact Card ───
  const ImpactCard = () => (
    <div className={`p-5 rounded-2xl mb-6 border ${isDark ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-200"}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <IconTrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className={`text-sm ${subtextClass} mb-1`}>
            {t("profile.impactThisMonth", language)}
          </div>
          <div className={`${headerText} font-bold text-[16px]`}>
            {t("profile.youHelped", language)} {userProfile!.impactCount}{" "}
            {userProfile!.impactCount === 1 ? t("profile.person", language) : t("profile.people", language)}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Achievements Section ───
  const AchievementsSection = () => {
    const achievementsWithProgress = ACHIEVEMENT_DEFS.map((def) => {
      const unlocked = unlockedAchievements.some((a) => a.id === def.id);
      const progress = def.progress(userProfile!, incidents);
      return { ...def, unlocked, progress };
    });

    const unlockedCount = achievementsWithProgress.filter((a) => a.unlocked).length;
    const totalCount = achievementsWithProgress.length;

    const categories = [
      { key: "milestone", label: t("profile.milestones", language) },
    ];

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl ${headerText} font-bold flex items-center gap-2`}>
            {t("profile.achievements", language)}
          </h3>
          <span className={`${subtextClass} text-sm font-medium`}>
            {unlockedCount}/{totalCount}
          </span>
        </div>

        {/* Overall progress bar */}
        <div className={`rounded-2xl p-4 mb-4 border ${isDark ? "bg-[#1f2937] border-gray-700 shadow-none" : "bg-white border-gray-200 shadow-sm"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm ${subtextClass}`}>
              {t("profile.overallProgress", language)}
            </span>
            <span className={`text-sm font-bold ${headerText}`}>
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
          <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
            />
          </div>
        </div>

        {/* Achievements by category */}
        {categories.map((cat) => {
          const catAchievements = achievementsWithProgress.filter((a) => a.category === cat.key);
          if (catAchievements.length === 0) return null;
          const catUnlocked = catAchievements.filter((a) => a.unlocked).length;

          return (
            <div key={cat.key} className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`${headerText} font-bold text-sm`}>{cat.label}</span>
                <span className={`${subtextClass} text-xs`}>
                  ({catUnlocked}/{catAchievements.length})
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {catAchievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-2xl text-center transition relative overflow-hidden ${
                      achievement.unlocked
                        ? `border-2 ${isDark ? "border-gray-600" : "border-gray-200"}`
                        : `border-2 ${isDark ? "border-gray-700" : "border-gray-200"} opacity-60`
                    }`}
                  >
                    {achievement.unlocked && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${achievement.gradient} opacity-10`} />
                    )}
                    <div className={`relative z-10 rounded-2xl p-4 ${isDark ? "bg-[#1f2937]" : "bg-white"}`}>
                      <div className="flex items-center justify-center mb-2">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${achievement.gradient} flex items-center justify-center shadow-md ${!achievement.unlocked ? "grayscale" : ""}`}>
                          {(() => { const AchIcon = achievement.icon; return <AchIcon size={24} className="text-white" />; })()}
                        </div>
                      </div>
                      <div className={`${headerText} font-bold text-sm mb-0.5 truncate`}>
                        {achievement.name}
                      </div>
                      <div className={`text-xs ${subtextClass} mb-2`}>
                        {achievement.description}
                      </div>

                      {!achievement.unlocked && (
                        <div className="mt-1">
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                            <div
                              className={`h-full bg-gradient-to-r ${achievement.gradient} rounded-full transition-all`}
                              style={{
                                width: `${Math.min(100, (achievement.progress.current / achievement.progress.target) * 100)}%`,
                              }}
                            />
                          </div>
                          <div className={`text-xs ${subtextClass} mt-1 flex items-center justify-center gap-1`}>
                            <IconLock className="w-3 h-3" />
                            {achievement.progress.current}/{achievement.progress.target}
                          </div>
                        </div>
                      )}
                      {achievement.unlocked && (
                        <div className="text-xs text-green-500 font-semibold mt-1">
                          {t("profile.unlocked", language)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };


  // ══════════════════════════════════════════════════════════
  //  ESTADO 0: Visitante (guest)
  // ══════════════════════════════════════════════════════════
  if (authStatus === "guest") {
    return (
      <div className={`h-full w-full ${pageBg} overflow-y-auto`}>
        {/* Header */}
        <div className={`relative z-10 p-5 md:px-8 lg:px-12 border-b ${isDark ? "border-gray-700" : "border-gray-200"} flex-shrink-0 ${headerBg}`}>
          <div className="max-w-5xl mx-auto">
            <h1 className={`text-2xl ${headerText} font-bold`}>{t("profile.title", language)}</h1>
          </div>
        </div>

        <div className="relative z-10 p-6 md:px-8 lg:px-12 space-y-4 max-w-5xl mx-auto">
          {/* Login Card */}
          <LoginCard />

          {/* Menu Items */}
          <MenuList />

          {/* Credit */}
          <p className="text-center text-[11px] text-gray-400 font-['Poppins'] pt-4 pb-2">
            Criado por criative92 ®
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  //  ESTADO 1: Anônimo com perfil (anonymous)
  // ══════════════════════════════════════════════════════════
  if (authStatus === "anonymous") {
    const trustLevel = getTrustLevelLabel(userProfile!.trustLevel);

    return (
      <div className={`h-full w-full ${pageBg} overflow-y-auto`}>
        {/* Header */}
        <div className={`relative z-10 p-5 md:px-8 lg:px-12 border-b ${isDark ? "border-gray-700" : "border-gray-200"} flex-shrink-0 ${headerBg}`}>
          <div className="max-w-5xl mx-auto">
            <h1 className={`text-2xl ${headerText} font-bold`}>{t("profile.title", language)}</h1>
          </div>
        </div>

        <div className="relative z-10 p-6 md:px-8 lg:px-12 max-w-5xl mx-auto">
          {/* User Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-3xl p-6 mb-6 border ${isDark ? "bg-[#1f2937] border-gray-700 shadow-none" : "bg-white border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]"}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 shadow-sm ${isDark ? "bg-gray-700 border-gray-600" : "bg-[#EFF6FF] border-[#DBEAFE]"}`}>
                <IconUser className={`w-10 h-10 ${isDark ? "text-gray-400" : "text-blue-400"}`} />
              </div>
              <div className="flex-1">
                <h2 className={`font-bold mb-0.5 ${headerText} text-[20px]`}>
                  {userProfile!.name || t("profile.anonymousUser", language)}
                </h2>
                <p className={subtextClass}>
                  {userProfile!.neighborhood || "Manaus, AM"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500"}`}>
                    {t("profile.localProfile", language)}
                  </span>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${trustLevel.color} text-white shadow-sm`}>
                    {trustLevel.label}
                  </div>
                </div>
              </div>
            </div>

            <StatsGrid />
          </motion.div>

          {/* Connect Account Card */}
          <div className="mb-6">
            <LoginCard compact />
          </div>

          {/* Impact Card */}
          <ImpactCard />

          {/* Achievements */}
          <AchievementsSection />

          {/* Actions & Menu */}
          <div className="space-y-2 pb-6">
            <MenuList />

            {/* Reset Profile */}
            <button
              onClick={() => {
                setUserProfile(null);
                setIsOnboarded(false);
                localStorage.removeItem("alertaplus_profile");
                navigate("/onboarding");
              }}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition border mt-3 ${isDark ? "bg-orange-500/10 border-orange-500/30" : "bg-orange-50 border-orange-200"}`}
            >
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <IconRefresh className="w-5 h-5 text-white" />
              </div>
              <span className="text-orange-500 font-bold">{t("profile.resetProfile", language)}</span>
            </button>

            {/* Credit */}
            <p className="text-center text-[11px] text-gray-400 font-['Poppins'] pt-4 pb-2">
              Criado por criative92 ®
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  //  ESTADO 2: Autenticado (authenticated)
  // ══════════════════════════════════════════════════════════
  const trustLevel = getTrustLevelLabel(userProfile!.trustLevel);

  return (
    <div className={`h-full w-full ${pageBg} overflow-y-auto`}>
      {/* Header */}
      <div className={`relative z-10 p-5 md:px-8 lg:px-12 border-b ${isDark ? "border-gray-700" : "border-gray-200"} flex-shrink-0 ${headerBg}`}>
        <div className="max-w-5xl mx-auto">
          <h1 className={`text-2xl ${headerText} font-bold`}>{t("profile.title", language)}</h1>
        </div>
      </div>

      <div className="relative z-10 p-6 md:px-8 lg:px-12 max-w-5xl mx-auto">
        {/* User Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-3xl p-6 mb-6 border ${isDark ? "bg-[#1f2937] border-gray-700 shadow-none" : "bg-white border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]"}`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2 shadow-sm ${isDark ? "bg-gray-700 border-gray-600" : "bg-[#EFF6FF] border-[#DBEAFE]"}`}>
              {userProfile!.loginMethod === "google" ? (
                <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              ) : (
                <span>👤</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className={`font-bold mb-0.5 ${headerText} text-[20px]`}>
                {userProfile!.name || t("profile.anonymousUser", language)}
              </h2>
              <p className={subtextClass}>
                {userProfile!.neighborhood || "Manaus, AM"}
              </p>
              {userProfile!.email && (
                <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-[13px] truncate`}>
                  {userProfile!.email}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                {userProfile!.loginMethod && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    userProfile!.loginMethod === "google"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-emerald-100 text-emerald-600"
                  }`}>
                    {t("profile.connectedVia", language)} {userProfile!.loginMethod === "google" ? "Google" : "E-mail"}
                  </span>
                )}
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${trustLevel.color} text-white shadow-sm`}>
                  {trustLevel.label}
                </div>
              </div>
            </div>
          </div>

          <StatsGrid />
        </motion.div>

        {/* Impact Card */}
        <ImpactCard />

        {/* Achievements */}
        <AchievementsSection />

        {/* Actions & Menu */}
        <div className="space-y-2 pb-6">
          {/* Account Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/settings", { state: { openAccount: true } })}
            className={`w-full p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition border ${menuBtnClass} ${cardShadow}`}
          >
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <IconUser className="w-5 h-5 text-white" />
            </div>
            <span className={`${menuTextClass} flex-1 text-left`}>
              {t("profile.account", language)}
            </span>
            <IconChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>

          <MenuList />

          {/* Logout */}
          <button
            onClick={() => {
              setUserProfile(null);
              setIsOnboarded(false);
              localStorage.clear();
              navigate("/onboarding");
            }}
            className={`w-full p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition border mt-3 ${isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"}`}
          >
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <IconLogout className="w-5 h-5 text-white" />
            </div>
            <span className="text-red-500 font-bold">{t("profile.logout", language)}</span>
          </button>

          {/* Credit */}
          <p className="text-center text-[11px] text-gray-400 font-['Poppins'] pt-4 pb-2">
            Criado por criative92 ®
          </p>
        </div>
      </div>
    </div>
  );
}