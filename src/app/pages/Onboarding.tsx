import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { t, useThemeClasses } from "../context/translations";
import svgPaths from "../../imports/svg-90w5vqo0ll";
import backArrowSvg from "../../imports/svg-53og7kmmrf";

// ─── Step indicator bar ───
function StepBar({ step, isDark }: { step: number; isDark: boolean }) {
  return (
    <div className="flex gap-2 w-full">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`flex-1 h-[6px] rounded-full transition-colors duration-300 ${
            i <= step
              ? isDark
                ? "bg-blue-500"
                : step === 0
                ? "bg-[#1e456c]"
                : "bg-[#0a2540]"
              : isDark
              ? "bg-gray-600"
              : step === 0
              ? "bg-white"
              : "bg-white"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Step 1: Welcome ───
function WelcomeStep({ onNext, isDark, language }: { onNext: () => void; isDark: boolean; language: string }) {
  return (
    <div
      className="flex flex-col items-center justify-between h-full px-6 py-6"
      style={{
        background: isDark
          ? "linear-gradient(to bottom, #1f2937 34%, #374151 100%)"
          : "linear-gradient(to bottom, #0a2540 34%, #8f8e8a 100%)",
      }}
    >
      <StepBar step={0} isDark={isDark} />

      <div className="flex flex-col items-center text-center flex-1 justify-center gap-4">
        {/* Logo */}
        <div className="w-[292px] h-[80px] mb-2">
          <svg
            className="block w-full h-full"
            viewBox="0 0 292 80"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <path d={svgPaths.p3d23d4f0} fill="white" />
            <path d={svgPaths.p3b111800} fill="white" />
            <path d={svgPaths.p3cb01a80} fill="white" />
            <path d={svgPaths.p6364c00} fill="white" />
            <path d={svgPaths.p2a9d7c00} fill="white" />
            <path d={svgPaths.p9beb500} fill="white" />
            <path d={svgPaths.p33d71980} fill="#FFC107" />
          </svg>
        </div>

        <p className="text-white text-[20px] font-['Poppins'] leading-[21px] w-[266px]">
          {t("onboarding.subtitle", language)}
        </p>

        {/* Features */}
        <div className="flex flex-col gap-6 mt-8 w-full max-w-[329px]">
          <FeatureItem
            icon="location"
            title={t("onboarding.feature1Title", language)}
            desc={t("onboarding.feature1Desc", language)}
          />
          <FeatureItem
            icon="alert"
            title={t("onboarding.feature2Title", language)}
            desc={t("onboarding.feature2Desc", language)}
          />
          <FeatureItem
            icon="check"
            title={t("onboarding.feature3Title", language)}
            desc={t("onboarding.feature3Desc", language)}
          />
        </div>
      </div>

      <button
        onClick={onNext}
        className={`w-full max-w-[329px] h-[68px] rounded-[116px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.14)] flex items-center justify-center gap-3 active:scale-[0.97] transition ${
          isDark ? "bg-blue-600 hover:bg-blue-700" : "bg-white/50"
        }`}
      >
        <span className={`text-[18px] font-bold font-['Poppins'] ${isDark ? "text-white" : "text-[#0a2540]"}`}>
          {t("onboarding.start", language)}
        </span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12H19"
            stroke={isDark ? "white" : "#0A2540"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={svgPaths.pa979980}
            stroke={isDark ? "white" : "#0A2540"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  const iconPaths: Record<string, ReactNode> = {
    location: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d={svgPaths.p36b26030}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={svgPaths.p17937400}
          fill="white"
        />
      </svg>
    ),
    alert: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d={svgPaths.p3e64c00}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    check: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d={svgPaths.p3069ed00}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
        {iconPaths[icon]}
      </div>
      <div className="flex-1">
        <h3 className="text-white text-[18px] font-['Poppins'] font-semibold leading-[28px] text-left">
          {title}
        </h3>
        <p className="text-[#e2e2e2] text-[14px] font-['Poppins'] leading-[15px] mt-1 text-left">
          {desc}
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Profile Selection ───
const PROFILES = [
  { id: "pedestrian", emoji: "🚶" },
  { id: "car", emoji: "🚗" },
  { id: "motorcycle", emoji: "🏍️" },
  { id: "wheelchair", emoji: "♿" },
  { id: "elderly", emoji: "👴" },
  { id: "family", emoji: "👨‍👩‍👧" },
  { id: "night", emoji: "🌙" },
];

function ProfileStep({
  selected,
  onSelect,
  onNext,
  onSkip,
  isDark,
  language,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onSkip: () => void;
  isDark: boolean;
  language: string;
}) {
  const tc = useThemeClasses(isDark ? "dark" : "light");

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundImage: isDark
          ? "linear-gradient(180deg, #374151 16.7%, #1f2937 94.4%)"
          : "linear-gradient(180deg, #FFC107 16.7%, #FFFFFF 94.4%)",
      }}
    >
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
        <StepBar step={1} isDark={isDark} />

        <div className="mt-8 mb-8">
          <h1 className={`${tc.textPrimary} text-[30px] font-bold font-['Poppins'] leading-[36px] w-[274px]`}>
            {t("onboarding.chooseProfile", language)}
          </h1>
          <p className={`${tc.textSecondary} text-[16px] font-['Poppins'] leading-[24px] mt-2 w-[323px]`}>
            {t("onboarding.selectOption", language)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {PROFILES.map((p) => {
            const label = t(`onboarding.profile.${p.id}`, language);
            const desc = t(`onboarding.profile.${p.id}Desc`, language);
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`flex flex-col items-center gap-4 rounded-3xl p-6 transition shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1)] active:scale-[0.97] ${
                  isSelected
                    ? isDark
                      ? "bg-blue-900/40 border-[1.5px] border-blue-500"
                      : "bg-[#dbeafe] border-[1.5px] border-[#51a2ff]"
                    : isDark
                    ? "bg-gray-700/30 border-[1.5px] border-transparent"
                    : "bg-white/[18%] border-[1.5px] border-transparent"
                } ${p.id === "night" ? "col-span-1" : ""}`}
              >
                <span className="text-[60px] leading-[60px]">{p.emoji}</span>
                <div className="text-center">
                  <p className={`${tc.textPrimary} text-[20px] font-bold font-['Poppins'] leading-[28px]`}>
                    {label}
                  </p>
                  <p className={`${tc.textSecondary} text-[14px] font-medium font-['Poppins'] leading-[15px] mt-1`}>
                    {desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="px-6 pb-6 pt-6 flex flex-col items-center gap-5"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))"
            : "linear-gradient(to bottom, transparent, rgba(0,0,0,0.55))",
        }}
      >
        <button
          onClick={onNext}
          className={`w-full max-w-[329px] h-[68px] rounded-[116px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.06)] flex items-center justify-center gap-3 active:scale-[0.97] transition ${
            isDark ? "bg-blue-600 hover:bg-blue-700" : "bg-[rgba(10,37,64,0.2)]"
          }`}
        >
          <span className={`text-[18px] font-bold font-['Poppins'] ${isDark ? "text-white" : "text-[#0a2540]"}`}>
            {t("onboarding.continue", language)}
          </span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19" stroke={isDark ? "white" : "#0A2540"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.pa979980} stroke={isDark ? "white" : "#0A2540"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={onSkip} className={`text-[18px] font-['Poppins'] ${isDark ? "text-gray-400" : "text-[rgba(10,37,64,0.51)]"}`}>
          {t("onboarding.skip", language)}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Profile Info ───
function InfoStep({
  name,
  setName,
  neighborhood,
  setNeighborhood,
  email,
  setEmail,
  needs,
  toggleNeed,
  timePreference,
  setTimePreference,
  onBack,
  onFinish,
  onSkip,
  isDark,
  language,
}: {
  name: string;
  setName: (v: string) => void;
  neighborhood: string;
  setNeighborhood: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  needs: string[];
  toggleNeed: (n: string) => void;
  timePreference: string;
  setTimePreference: (v: string) => void;
  onBack: () => void;
  onFinish: () => void;
  onSkip: () => void;
  isDark: boolean;
  language: string;
}) {
  const tc = useThemeClasses(isDark ? "dark" : "light");

  const needOptions = [
    { id: "wheelchair", emoji: "♿" },
    { id: "reduced-mobility", emoji: "👴" },
    { id: "stroller", emoji: "👶" },
  ];

  const timeOptions = [
    { id: "day", emoji: "☀️" },
    { id: "night", emoji: "🌙" },
    { id: "both", emoji: "⏰" },
  ];

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundImage: isDark
          ? "linear-gradient(108deg, #1f2937 0%, #374151 50%, #1f2937 100%)"
          : "linear-gradient(108deg, #EFF6FF 0%, #FAF5FF 50%, #FDF2F8 100%)",
      }}
    >
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
        <StepBar step={2} isDark={isDark} />

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 mt-6"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d={backArrowSvg.p571e900}
              stroke={isDark ? "#9CA3AF" : "#4A5565"}
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.83 10H4.17"
              stroke={isDark ? "#9CA3AF" : "#4A5565"}
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={`${tc.textSecondary} text-[16px] font-medium font-['Poppins']`}>
            {t("onboarding.back", language)}
          </span>
        </button>

        <h1 className={`${tc.textPrimary} text-[30px] font-bold font-['Poppins'] leading-[36px] mt-4`}>
          {t("onboarding.almostThere", language)}
        </h1>
        <p className={`${tc.textSecondary} text-[16px] font-['Poppins'] leading-[24px] mt-2`}>
          {t("onboarding.completeInfo", language)}
        </p>

        <div className="mt-6 flex flex-col gap-1">
          {/* Name */}
          <div className="flex flex-col gap-3">
            <label className={`${tc.textPrimary} text-[16px] font-bold font-['Poppins']`}>
              {t("onboarding.whatIsYourName", language)}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("onboarding.namePlaceholder", language)}
              className={`w-full h-[59px] rounded-2xl border px-5 text-[16px] font-['Poppins'] focus:outline-none focus:border-[#51a2ff] ${
                isDark
                  ? "border-gray-600 bg-gray-800 text-white placeholder:text-gray-500"
                  : "border-[#d1d5dc] bg-white text-gray-900 placeholder:text-[#99a1af]"
              }`}
            />
            <p className={`text-[13px] font-['Poppins'] ${isDark ? "text-gray-500" : "text-[#ababab]"}`}>
              {t("onboarding.anonymousNote", language)}
            </p>
          </div>

          {/* Neighborhood */}
          <div className="flex flex-col gap-3 mt-1">
            <label className={`${tc.textPrimary} text-[16px] font-bold font-['Poppins']`}>
              {t("onboarding.whatIsYourNeighborhood", language)}
            </label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder={t("onboarding.neighborhoodPlaceholder", language)}
              className={`w-full h-[59px] rounded-2xl border px-5 text-[16px] font-['Poppins'] focus:outline-none focus:border-[#51a2ff] ${
                isDark
                  ? "border-gray-600 bg-gray-800 text-white placeholder:text-gray-500"
                  : "border-[#d1d5dc] bg-white text-gray-900 placeholder:text-[#99a1af]"
              }`}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-3 mt-1">
            <label className={`${tc.textPrimary} text-[16px] font-bold font-['Poppins']`}>
              {t("onboarding.email", language)}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("onboarding.emailPlaceholder", language)}
              className={`w-full h-[59px] rounded-2xl border px-5 text-[16px] font-['Poppins'] focus:outline-none focus:border-[#51a2ff] ${
                isDark
                  ? "border-gray-600 bg-gray-800 text-white placeholder:text-gray-500"
                  : "border-[#d1d5dc] bg-white text-gray-900 placeholder:text-[#99a1af]"
              }`}
            />
          </div>

          {/* Needs */}
          <div className="flex flex-col gap-3 mt-3">
            <label className={`${tc.textPrimary} text-[16px] font-bold font-['Poppins']`}>
              {t("onboarding.additionalNeeds", language)}
            </label>
            {needOptions.map((opt) => {
              const isActive = needs.includes(opt.id);
              const needKeyMap: Record<string, string> = { "wheelchair": "wheelchair", "reduced-mobility": "reducedMobility", "stroller": "stroller" };
              const label = t(`onboarding.need.${needKeyMap[opt.id] ?? opt.id}`, language);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleNeed(opt.id)}
                  className={`w-full h-[67px] rounded-2xl flex items-center gap-3 px-4 transition border ${
                    isActive
                      ? isDark
                        ? "bg-blue-900/40 border-blue-500"
                        : "bg-[#dbeafe] border-[#51a2ff]"
                      : isDark
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-[#d1d5dc]"
                  }`}
                >
                  <span className="text-[24px]">{opt.emoji}</span>
                  <span className={`${tc.textPrimary} text-[16px] font-medium font-['Poppins']`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time preference */}
          <div className="flex flex-col gap-3 mt-3">
            <label className={`${tc.textPrimary} text-[16px] font-bold font-['Poppins']`}>
              {t("onboarding.whenDoYouCirculate", language)}
            </label>
            <div className="flex gap-3">
              {timeOptions.map((opt) => {
                const isActive = timePreference === opt.id;
                const label = t(`onboarding.time.${opt.id}`, language);
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTimePreference(opt.id)}
                    className={`flex-1 h-[99px] rounded-2xl flex flex-col items-center justify-center gap-2 transition border ${
                      isActive
                        ? isDark
                          ? "bg-blue-900/40 border-blue-500"
                          : "bg-[#dbeafe] border-[#51a2ff]"
                        : isDark
                        ? "bg-gray-800 border-gray-600"
                        : "bg-white border-[#d1d5dc]"
                    }`}
                  >
                    <span className="text-[30px]">{opt.emoji}</span>
                    <span className={`${tc.textPrimary} text-[14px] font-bold font-['Poppins']`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="px-6 pb-6 pt-6 flex flex-col items-center gap-5"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))"
            : "linear-gradient(to bottom, transparent, rgba(0,0,0,0.55))",
        }}
      >
        <button
          onClick={onFinish}
          className={`w-full max-w-[329px] h-[68px] rounded-[116px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.06)] flex items-center justify-center active:scale-[0.97] transition ${
            isDark ? "bg-blue-600 hover:bg-blue-700" : "bg-[#0a2540]"
          }`}
        >
          <span className="text-white text-[18px] font-bold font-['Poppins']">
            {t("onboarding.finish", language)}
          </span>
        </button>
        <button onClick={onSkip} className={`text-[18px] font-['Poppins'] ${isDark ? "text-gray-400" : "text-[rgba(10,37,64,0.51)]"}`}>
          {t("onboarding.skip", language)}
        </button>
      </div>
    </div>
  );
}

// ─── Main Onboarding Component ───
export function Onboarding() {
  const navigate = useNavigate();
  const { setUserProfile, setIsOnboarded, theme, language } = useApp();

  const [step, setStep] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [email, setEmail] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [timePreference, setTimePreference] = useState("both");

  const isDark = theme === "dark";

  const toggleNeed = (id: string) => {
    setNeeds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const getTransportMode = (): "pedestrian" | "motorcycle" | "car" => {
    if (selectedProfile === "car") return "car";
    if (selectedProfile === "motorcycle") return "motorcycle";
    return "pedestrian";
  };

  // Estado 0 → Visitante: pula sem criar perfil
  const skipAsGuest = () => {
    setUserProfile(null);
    setIsOnboarded(true);
    navigate("/map", { replace: true });
  };

  // Estado 1 → Anônimo com perfil: cria perfil local sem loginMethod
  const finishOnboarding = (skipInfo?: boolean) => {
    const profile = {
      name: skipInfo ? "" : name,
      neighborhood: skipInfo ? "" : neighborhood,
      transportMode: getTransportMode(),
      needs: needs as ("wheelchair" | "reduced-mobility" | "stroller")[],
      timePreference: timePreference as "day" | "night" | "both",
      points: 0,
      trustLevel: 1,
      badges: [],
      reportsCount: 0,
      impactCount: 0,
      confirmationsGiven: 0,
      denialsGiven: 0,
      routesSearched: 0,
    };
    setUserProfile(profile);
    setIsOnboarded(true);
    navigate("/map", { replace: true });
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <WelcomeStep onNext={() => setStep(1)} isDark={isDark} language={language} />
          </motion.div>
        )}
        {step === 1 && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <ProfileStep
              selected={selectedProfile}
              onSelect={setSelectedProfile}
              onNext={() => setStep(2)}
              onSkip={skipAsGuest}
              isDark={isDark}
              language={language}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <InfoStep
              name={name}
              setName={setName}
              neighborhood={neighborhood}
              setNeighborhood={setNeighborhood}
              email={email}
              setEmail={setEmail}
              needs={needs}
              toggleNeed={toggleNeed}
              timePreference={timePreference}
              setTimePreference={setTimePreference}
              onBack={() => setStep(1)}
              onFinish={() => finishOnboarding()}
              onSkip={() => finishOnboarding(true)}
              isDark={isDark}
              language={language}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}