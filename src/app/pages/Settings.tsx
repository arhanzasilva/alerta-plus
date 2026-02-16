import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import type { Language, DistanceUnit } from "../context/AppContext";
import { t, useThemeClasses } from "../context/translations";
import {
  IconArrowLeft,
  IconX,
  IconSettings,
  IconMap,
  IconVolume,
  IconNavigation,
  IconCar,
  IconDiamond,
  IconBell,
  IconBellRinging,
  IconRoute,
  IconUserCircle,
  IconShieldCheck,
  IconInfoCircle,
  IconHeart,
  IconChartBar,
  IconGasStation,
  IconGauge,
  IconMusic,
  IconChevronRight,
  IconChevronDown,
  IconSun,
  IconGlobe,
  IconDeviceMobileVibration,
  IconDeviceMobile,
  IconEye,
  IconMapPin,
  IconClock,
  IconCompass,
  IconBike,
  IconWalk,
  IconCheck,
  IconDroplet,
  IconFlame,
  IconBolt,
  IconMicrophone,
  IconRadio,
  IconHeadphones,
  IconExternalLink,
  IconPlayerPlay,
  IconMessageCircle,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconSend,
  IconLink,
  IconCopy,
  IconShare,
  IconMail,
  IconAlertTriangle,
  IconActivity,
  IconLogout,
  IconKey,
  IconAt,
  IconEyeOff,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

type SettingsView = "main" | "general" | "map-display" | "sound" | "navigation" | "vehicle" | "reminders" | "notifications" | "account" | "privacy" | "about" | "audio-player" | "invite-friend" | "speedometer";

interface SettingItem {
  icon: any;
  label: string;
  iconBg: string;
  action?: () => void;
  view?: SettingsView;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: () => void;
  subtitle?: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export function Settings() {
  const navigate = useNavigate();
  const { toggleTheme, theme, language, setLanguage, distanceUnit, setDistanceUnit, userProfile, setUserProfile, updateUserProfile, mapLayers, toggleMapLayer, notificationSettings, updateNotificationSettings, setIsOnboarded } = useApp();
  const tc = useThemeClasses(theme);
  const [currentView, setCurrentView] = useState<SettingsView>("main");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [navPrefs, setNavPrefs] = useState({
    avoidTolls: false,
    avoidHighways: false,
    preferSafe: true,
    autoReroute: true,
  });
  const [vehicleType, setVehicleType] = useState(
    userProfile?.transportMode === "car" ? "car" : userProfile?.transportMode === "motorcycle" ? "motorcycle" : "walking"
  );
  const [fuelType, setFuelType] = useState("gasoline");
  const [expandedDropdown, setExpandedDropdown] = useState<"vehicle" | "fuel" | null>(null);
  const [mapVoice, setMapVoice] = useState("female-default");
  const [voiceVolume, setVoiceVolume] = useState(80);
  const [voiceDuringMusic, setVoiceDuringMusic] = useState(true);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [autoPlayOnNav, setAutoPlayOnNav] = useState(true);
  const [pauseDuringAlerts, setPauseDuringAlerts] = useState(true);
  const [speedoEnabled, setSpeedoEnabled] = useState(true);
  const [speedoUnit, setSpeedoUnit] = useState<"kmh" | "mph">("kmh");
  const [speedLimitAlert, setSpeedLimitAlert] = useState(true);
  const [speedAlertSound, setSpeedAlertSound] = useState(true);
  const [speedThreshold, setSpeedThreshold] = useState(10);
  const [showSpeedOnMap, setShowSpeedOnMap] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!userProfile?.email);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState(userProfile?.email || "");
  const [loggedInMethod, setLoggedInMethod] = useState<"email" | "google">(userProfile?.loginMethod || "email");
  const [accountView, setAccountView] = useState<"login" | "register">("login");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Edit modal state for account fields
  const [editField, setEditField] = useState<"name" | "email" | "neighborhood" | "password" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editValue2, setEditValue2] = useState(""); // for confirm password
  const [editOldPassword, setEditOldPassword] = useState("");
  const [editError, setEditError] = useState("");

  const bgClass = tc.bgPage2;
  const textPrimary = tc.textPrimary;
  const textSecondary = tc.textSecondary;
  const cardBg = tc.bgCard;
  const sectionBg = tc.bgSection;
  const dividerColor = tc.border;
  const iconColor = tc.iconColor;
  const iconSecondary = tc.iconSecondary;
  const chevronColor = tc.chevronColor;
  const toggleOffBg = tc.toggleOff;
  const activeRowBg = tc.activeRow;

  const renderSettingRow = (item: SettingItem, idx: number, isLast: boolean) => {
    const Icon = item.icon;
    const handleClick = () => {
      if (item.toggle && item.onToggle) {
        item.onToggle();
      } else if (item.view) {
        setCurrentView(item.view);
      } else if (item.action) {
        item.action();
      }
    };
    return (
      <div
        key={idx}
        role="button"
        tabIndex={0}
        onPointerUp={handleClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
        className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg} ${!isLast ? `border-b ${dividerColor}` : ""}`}
      >
        <div className={`w-8 h-8 ${item.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-[16px] h-[16px] text-white`} />
        </div>
        <div className="flex-1 text-left">
          <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>
            {item.label}
          </span>
          {item.subtitle && (
            <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>{item.subtitle}</p>
          )}
        </div>
        {item.toggle ? (
          <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${item.toggleValue ? "bg-[#00bc7d]" : toggleOffBg}`}>
            <div
              className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
              style={{ transform: item.toggleValue ? "translateX(20px)" : "translateX(0px)" }}
            />
          </div>
        ) : (
          <IconChevronRight className={`w-4 h-4 ${chevronColor} flex-shrink-0`} />
        )}
      </div>
    );
  };

  const renderSubpage = (title: string, items: SettingItem[]) => (
    <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
        <button onClick={() => setCurrentView("main")} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
          <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
        </button>
        <h1 className={`flex-1 text-left ml-2 text-[17px] ${textPrimary} font-bold font-['Poppins']`}>{title}</h1>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8">
        <div className={`${cardBg} mx-0`}>
          {items.map((item, idx) => renderSettingRow(item, idx, idx === items.length - 1))}
        </div>
      </div>
    </div>
  );

  // ===== SUBPAGES =====

  if (currentView === "general") {
    const languageOptions: { value: Language; label: string; flag: string }[] = [
      { value: "pt", label: t("lang.pt", language), flag: "🇧🇷" },
      { value: "en", label: t("lang.en", language), flag: "🇺🇸" },
      { value: "es", label: t("lang.es", language), flag: "🇪🇸" },
    ];
    const unitOptions: { value: DistanceUnit; label: string; icon: string }[] = [
      { value: "km", label: t("unit.km", language), icon: "📏" },
      { value: "mi", label: t("unit.mi", language), icon: "📐" },
    ];
    const currentLang = languageOptions.find((l) => l.value === language)!;
    const currentUnit = unitOptions.find((u) => u.value === distanceUnit)!;

    return (
      <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
          <button onClick={() => setCurrentView("main")} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
            <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
          </button>
          <h1 className={`flex-1 text-left ml-2 text-[17px] ${textPrimary} font-bold font-['Poppins']`}>{t("settings.general", language)}</h1>
          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-8">
          <div className={`${cardBg} mx-0`}>
            {/* Dark Theme Toggle */}
            <div
              role="button"
              tabIndex={0}
              onPointerUp={toggleTheme}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleTheme(); }}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg} border-b ${dividerColor}`}
            >
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconSun className="w-[16px] h-[16px] text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>
                  {t("general.darkTheme", language)}
                </span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>{t("general.darkThemeDesc", language)}</p>
              </div>
              <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${theme === "dark" ? "bg-[#00bc7d]" : toggleOffBg}`}>
                <div
                  className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                  style={{ transform: theme === "dark" ? "translateX(20px)" : "translateX(0px)" }}
                />
              </div>
            </div>

            {/* Language Selector */}
            <div
              role="button"
              tabIndex={0}
              onPointerUp={() => setShowLanguageModal(true)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowLanguageModal(true); }}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg} border-b ${dividerColor}`}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconGlobe className="w-[16px] h-[16px] text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>
                  {t("general.language", language)}
                </span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>{currentLang.flag} {currentLang.label}</p>
              </div>
              <IconChevronRight className={`w-4 h-4 ${chevronColor} flex-shrink-0`} />
            </div>

            {/* Distance Unit Selector */}
            <div
              role="button"
              tabIndex={0}
              onPointerUp={() => setShowUnitModal(true)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowUnitModal(true); }}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg}`}
            >
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconDeviceMobile className="w-[16px] h-[16px] text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>
                  {t("general.distanceUnits", language)}
                </span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>{currentUnit.label}</p>
              </div>
              <IconChevronRight className={`w-4 h-4 ${chevronColor} flex-shrink-0`} />
            </div>
          </div>
        </div>

        {/* Language Modal */}
        <AnimatePresence>
          {showLanguageModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
              onClick={() => setShowLanguageModal(false)}
            >
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`w-full max-w-md ${tc.modalBg} rounded-t-3xl p-5 pb-8`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <h2 className={`text-[17px] ${textPrimary} font-bold font-['Poppins'] mb-4`}>{t("general.selectLanguage", language)}</h2>
                <div className="space-y-2">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setLanguage(opt.value);
                        setShowLanguageModal(false);
                        toast.success(opt.value === "pt" ? "Idioma alterado!" : opt.value === "en" ? "Language changed!" : "Idioma cambiado!");
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                        language === opt.value
                          ? "bg-[#00bc7d]/10 border-[#00bc7d]/40"
                          : `${tc.isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`
                      }`}
                    >
                      <span className="text-[20px]">{opt.flag}</span>
                      <span className={`${textPrimary} text-[15px] font-medium font-['Poppins'] flex-1 text-left`}>{opt.label}</span>
                      {language === opt.value && <IconCheck className="w-5 h-5 text-[#00bc7d] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Distance Unit Modal */}
        <AnimatePresence>
          {showUnitModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
              onClick={() => setShowUnitModal(false)}
            >
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`w-full max-w-md ${tc.modalBg} rounded-t-3xl p-5 pb-8`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <h2 className={`text-[17px] ${textPrimary} font-bold font-['Poppins'] mb-4`}>{t("general.selectUnit", language)}</h2>
                <div className="space-y-2">
                  {unitOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setDistanceUnit(opt.value);
                        setShowUnitModal(false);
                        toast.success(language === "en" ? "Unit changed!" : language === "es" ? "Unidad cambiada!" : "Unidade alterada!");
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                        distanceUnit === opt.value
                          ? "bg-[#00bc7d]/10 border-[#00bc7d]/40"
                          : `${tc.isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`
                      }`}
                    >
                      <span className="text-[20px]">{opt.icon}</span>
                      <span className={`${textPrimary} text-[15px] font-medium font-['Poppins'] flex-1 text-left`}>{opt.label}</span>
                      {distanceUnit === opt.value && <IconCheck className="w-5 h-5 text-[#00bc7d] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (currentView === "map-display") {
    return renderSubpage("Exibição de mapa", [
      {
        icon: IconEye,
        label: "Alagamentos",
        iconBg: "bg-blue-500",
        toggle: true,
        toggleValue: mapLayers.floods,
        onToggle: () => toggleMapLayer("floods"),
      },
      {
        icon: IconEye,
        label: "Zonas de atenção",
        iconBg: "bg-red-500",
        toggle: true,
        toggleValue: mapLayers.attention,
        onToggle: () => toggleMapLayer("attention"),
      },
      {
        icon: IconEye,
        label: "Acessibilidade",
        iconBg: "bg-purple-500",
        toggle: true,
        toggleValue: mapLayers.accessibility,
        onToggle: () => toggleMapLayer("accessibility"),
      },
      {
        icon: IconEye,
        label: "Sem iluminação",
        iconBg: "bg-yellow-500",
        toggle: true,
        toggleValue: mapLayers.noLight,
        onToggle: () => toggleMapLayer("noLight"),
      },
      {
        icon: IconEye,
        label: "Obras",
        iconBg: "bg-orange-500",
        toggle: true,
        toggleValue: mapLayers.construction,
        onToggle: () => toggleMapLayer("construction"),
      },
    ]);
  }

  if (currentView === "sound") {
    return renderSubpage("Voz e som", [
      {
        icon: IconVolume,
        label: "Sons de alerta",
        iconBg: "bg-blue-500",
        toggle: true,
        toggleValue: notificationSettings.sound,
        onToggle: () => updateNotificationSettings({ sound: !notificationSettings.sound }),
      },
      {
        icon: IconDeviceMobileVibration,
        label: "Vibração",
        iconBg: "bg-purple-500",
        toggle: true,
        toggleValue: notificationSettings.vibration,
        onToggle: () => updateNotificationSettings({ vibration: !notificationSettings.vibration }),
      },
    ]);
  }

  if (currentView === "navigation") {
    return renderSubpage("Navegação", [
      {
        icon: IconShieldCheck,
        label: "Preferir rotas seguras",
        iconBg: "bg-green-500",
        toggle: true,
        toggleValue: navPrefs.preferSafe,
        onToggle: () => setNavPrefs(p => ({ ...p, preferSafe: !p.preferSafe })),
      },
      {
        icon: IconCompass,
        label: "Reroute automático",
        iconBg: "bg-blue-500",
        toggle: true,
        toggleValue: navPrefs.autoReroute,
        onToggle: () => setNavPrefs(p => ({ ...p, autoReroute: !p.autoReroute })),
      },
      {
        icon: IconDiamond,
        label: "Evitar pedágios",
        iconBg: "bg-amber-500",
        toggle: true,
        toggleValue: navPrefs.avoidTolls,
        onToggle: () => setNavPrefs(p => ({ ...p, avoidTolls: !p.avoidTolls })),
      },
    ]);
  }

  if (currentView === "vehicle") {
    const vehicleOptions = [
      { value: "car", label: "Carro", icon: IconCar, description: "Rotas otimizadas para carros" },
      { value: "motorcycle", label: "Moto", icon: IconBike, description: "Rotas para motocicletas" },
      { value: "bicycle", label: "Bicicleta", icon: IconBike, description: "Ciclovias e rotas seguras" },
      { value: "walking", label: "A pé", icon: IconWalk, description: "Rotas para pedestres" },
    ];
    const fuelOptions = [
      { value: "gasoline", label: "Gasolina comum", icon: IconGasStation },
      { value: "gasoline_premium", label: "Gasolina aditivada", icon: IconGasStation },
      { value: "ethanol", label: "Etanol", icon: IconDroplet },
      { value: "diesel", label: "Diesel", icon: IconFlame },
      { value: "gnv", label: "GNV (Gás Natural)", icon: IconBolt },
    ];
    const currentVehicle = vehicleOptions.find(v => v.value === vehicleType) || vehicleOptions[0];
    const currentFuel = fuelOptions.find(f => f.value === fuelType) || fuelOptions[0];
    const optionBg = tc.isDark ? "bg-gray-800" : "bg-gray-50";
    const optionActiveBg = "bg-[#00bc7d]/10 border-[#00bc7d]/40";
    const optionBorder = tc.isDark ? "border-gray-600" : "border-gray-200";

    return (
      <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
        <div className={`flex items-center justify-between px-4 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
          <button type="button" onClick={() => { setCurrentView("main"); setExpandedDropdown(null); }} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
            <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
          </button>
          <h1 className={`flex-1 text-left ml-2 text-[17px] ${textPrimary} font-bold font-['Poppins']`}>Detalhes do veículo</h1>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          {/* Vehicle Type */}
          <div className={`${cardBg} mx-0`}>
            <button
              type="button"
              onClick={() => setExpandedDropdown(expandedDropdown === "vehicle" ? null : "vehicle")}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg} border-b ${dividerColor} bg-transparent`}
            >
              <div className="w-8 h-8 bg-[#00bc7d] rounded-lg flex items-center justify-center flex-shrink-0">
                <IconCar className="w-[16px] h-[16px] text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>
                  Tipo de veículo
                </span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>{currentVehicle.label}</p>
              </div>
              <IconChevronDown
                className={`w-4 h-4 ${chevronColor} flex-shrink-0 transition-transform duration-200 ${expandedDropdown === "vehicle" ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {expandedDropdown === "vehicle" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 space-y-2">
                    {vehicleOptions.map((option) => {
                      const OptionIcon = option.icon;
                      const isSelected = vehicleType === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setVehicleType(option.value);
                            setExpandedDropdown(null);
                            toast.success(`Veículo: ${option.label}`);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                            isSelected ? optionActiveBg : `${optionBg} ${optionBorder}`
                          }`}
                        >
                          <OptionIcon className={`w-5 h-5 ${isSelected ? "text-[#00bc7d]" : iconSecondary}`} />
                          <div className="flex-1 text-left">
                            <span className={`${textPrimary} text-[14px] font-medium font-['Poppins']`}>
                              {option.label}
                            </span>
                            <p className={`${textSecondary} text-[11px] font-['Poppins']`}>{option.description}</p>
                          </div>
                          {isSelected && <IconCheck className="w-5 h-5 text-[#00bc7d] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fuel Type */}
            <button
              type="button"
              onClick={() => setExpandedDropdown(expandedDropdown === "fuel" ? null : "fuel")}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg} bg-transparent`}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconGasStation className="w-[16px] h-[16px] text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>
                  Tipo de combustível
                </span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>{currentFuel.label}</p>
              </div>
              <IconChevronDown
                className={`w-4 h-4 ${chevronColor} flex-shrink-0 transition-transform duration-200 ${expandedDropdown === "fuel" ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {expandedDropdown === "fuel" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 space-y-2">
                    {fuelOptions.map((option) => {
                      const OptionIcon = option.icon;
                      const isSelected = fuelType === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFuelType(option.value);
                            setExpandedDropdown(null);
                            toast.success(`Combustível: ${option.label}`);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                            isSelected ? optionActiveBg : `${optionBg} ${optionBorder}`
                          }`}
                        >
                          <OptionIcon className={`w-5 h-5 ${isSelected ? "text-orange-500" : iconSecondary}`} />
                          <div className="flex-1 text-left"><span className={`${textPrimary} text-[14px] font-medium font-['Poppins']`}>{option.label}</span></div>
                          {isSelected && <IconCheck className="w-5 h-5 text-orange-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "reminders") {
    return renderSubpage("Lembretes e alertas", [
      {
        icon: IconBellRinging,
        label: "Alertas de segurança",
        iconBg: "bg-red-500",
        toggle: true,
        toggleValue: notificationSettings.alerts,
        onToggle: () => updateNotificationSettings({ alerts: !notificationSettings.alerts }),
      },
      {
        icon: IconBell,
        label: "Alertas da comunidade",
        iconBg: "bg-blue-500",
        toggle: true,
        toggleValue: notificationSettings.community,
        onToggle: () => updateNotificationSettings({ community: !notificationSettings.community }),
      },
      {
        icon: IconChartBar,
        label: "Conquistas",
        iconBg: "bg-yellow-500",
        toggle: true,
        toggleValue: notificationSettings.achievements,
        onToggle: () => updateNotificationSettings({ achievements: !notificationSettings.achievements }),
      },
    ]);
  }

  if (currentView === "notifications") {
    return renderSubpage("Notificações", [
      {
        icon: IconBellRinging,
        label: "Alertas push",
        iconBg: "bg-purple-500",
        toggle: true,
        toggleValue: notificationSettings.alerts,
        onToggle: () => updateNotificationSettings({ alerts: !notificationSettings.alerts }),
      },
      {
        icon: IconVolume,
        label: "Som de notificação",
        iconBg: "bg-blue-500",
        toggle: true,
        toggleValue: notificationSettings.sound,
        onToggle: () => updateNotificationSettings({ sound: !notificationSettings.sound }),
      },
      {
        icon: IconDeviceMobileVibration,
        label: "Vibração",
        iconBg: "bg-teal-500",
        toggle: true,
        toggleValue: notificationSettings.vibration,
        onToggle: () => updateNotificationSettings({ vibration: !notificationSettings.vibration }),
      },
    ]);
  }

  if (currentView === "account") {
    const isDark = theme === "dark";
    const inputBg = tc.inputBg;
    const inputFocusBorder = "focus:border-[#2b7fff]";

    const handleEmailLogin = () => {
      setLoginError("");
      if (!loginEmail.trim()) { setLoginError("Digite seu e-mail"); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) { setLoginError("E-mail inválido"); return; }
      if (!loginPassword.trim() || loginPassword.length < 6) { setLoginError("Senha deve ter no mínimo 6 caracteres"); return; }
      setIsLoggingIn(true);
      setTimeout(() => {
        setIsLoggingIn(false);
        setIsLoggedIn(true);
        setLoggedInEmail(loginEmail);
        setLoggedInMethod("email");
        // Update global profile with login info
        if (userProfile) {
          updateUserProfile({ email: loginEmail, loginMethod: "email", password: loginPassword });
        } else {
          setUserProfile({
            name: "",
            email: loginEmail,
            neighborhood: "",
            password: loginPassword,
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
        toast.success("Login realizado com sucesso!");
      }, 1500);
    };

    const handleGoogleLogin = () => {
      setLoginError(""); setRegisterError(""); setIsLoggingIn(true);
      setTimeout(() => {
        setIsLoggingIn(false);
        setIsLoggedIn(true);
        const gEmail = "usuario@gmail.com";
        setLoggedInEmail(gEmail);
        setLoggedInMethod("google");
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
        toast.success("Login com Google realizado!");
      }, 1500);
    };

    const handleRegister = () => {
      setRegisterError("");
      if (!registerName.trim()) { setRegisterError("Digite seu nome"); return; }
      if (!registerEmail.trim()) { setRegisterError("Digite seu e-mail"); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) { setRegisterError("E-mail inválido"); return; }
      if (!registerPassword.trim() || registerPassword.length < 6) { setRegisterError("Senha deve ter no mínimo 6 caracteres"); return; }
      if (registerPassword !== registerConfirmPassword) { setRegisterError("As senhas não coincidem"); return; }
      if (!acceptedTerms) { setRegisterError("Aceite os termos de uso para continuar"); return; }
      setIsRegistering(true);
      setTimeout(() => {
        setIsRegistering(false);
        setIsLoggedIn(true);
        setLoggedInEmail(registerEmail);
        setLoggedInMethod("email");
        // Create global profile with registration data
        if (userProfile) {
          updateUserProfile({ name: registerName.trim(), email: registerEmail, password: registerPassword, loginMethod: "email" });
        } else {
          setUserProfile({
            name: registerName.trim(),
            email: registerEmail,
            neighborhood: "",
            password: registerPassword,
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
        toast.success("Conta criada com sucesso!");
      }, 1800);
    };

    const handleLogout = () => {
      setIsLoggedIn(false); setLoginEmail(""); setLoginPassword(""); setLoggedInEmail(""); setLoginError(""); setAccountView("login");
      setUserProfile(null);
      setIsOnboarded(false);
      localStorage.removeItem("alertaplus_profile");
      toast("Você saiu da conta");
    };

    // Handle saving edited field
    const handleSaveEdit = () => {
      setEditError("");
      if (editField === "name") {
        if (!editValue.trim()) { setEditError("Digite seu nome"); return; }
        updateUserProfile({ name: editValue.trim() });
        toast.success("Nome atualizado!");
        setEditField(null);
      } else if (editField === "email") {
        if (!editValue.trim()) { setEditError("Digite seu e-mail"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editValue)) { setEditError("E-mail inválido"); return; }
        updateUserProfile({ email: editValue.trim() });
        setLoggedInEmail(editValue.trim());
        toast.success("E-mail atualizado!");
        setEditField(null);
      } else if (editField === "neighborhood") {
        if (!editValue.trim()) { setEditError("Digite seu bairro"); return; }
        updateUserProfile({ neighborhood: editValue.trim() });
        toast.success("Bairro atualizado!");
        setEditField(null);
      } else if (editField === "password") {
        if (userProfile?.password && editOldPassword !== userProfile.password) { setEditError("Senha atual incorreta"); return; }
        if (!editValue.trim() || editValue.length < 6) { setEditError("Nova senha deve ter no mínimo 6 caracteres"); return; }
        if (editValue !== editValue2) { setEditError("As senhas não coincidem"); return; }
        updateUserProfile({ password: editValue });
        toast.success("Senha alterada com sucesso!");
        setEditField(null);
      }
      setEditValue("");
      setEditValue2("");
      setEditOldPassword("");
    };

    const openEditField = (field: "name" | "email" | "neighborhood" | "password") => {
      setEditError("");
      setEditValue(field === "name" ? (userProfile?.name || "") : field === "email" ? (loggedInEmail || userProfile?.email || "") : field === "neighborhood" ? (userProfile?.neighborhood || "") : "");
      setEditValue2("");
      setEditOldPassword("");
      setEditField(field);
    };

    const switchToRegister = () => { setLoginError(""); setRegisterError(""); setRegisterName(""); setRegisterEmail(""); setRegisterPassword(""); setRegisterConfirmPassword(""); setAcceptedTerms(false); setAccountView("register"); };
    const switchToLogin = () => { setRegisterError(""); setLoginError(""); setAccountView("login"); };

    const GoogleIcon = () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    );

    const getPasswordStrength = (pw: string) => {
      if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return 4;
      if (pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 3;
      if (pw.length >= 6) return 2;
      return 1;
    };
    const strengthLabels = ["", "Muito fraca", "Fraca", "Boa", "Forte"];
    const strengthColors = ["", "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-[#00bc7d]"];

    // === Edit field modal ===
    const EditFieldModal = () => {
      if (!editField) return null;
      const fieldLabels: Record<string, string> = { name: "Nome", email: "E-mail", neighborhood: "Bairro", password: "Alterar senha" };
      const fieldPlaceholders: Record<string, string> = { name: "Seu nome completo", email: "seu@email.com", neighborhood: "Ex: Cidade Nova, Flores...", password: "Nova senha" };
      const isPassword = editField === "password";

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setEditField(null)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`${tc.modalBg} rounded-t-[28px] w-full max-w-md p-6 pb-8`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-[#d1d5dc] rounded-full mx-auto mb-5" />
            <h3 className={`${textPrimary} text-[18px] font-bold font-['Poppins'] mb-4`}>{fieldLabels[editField]}</h3>

            {isPassword && userProfile?.password && (
              <div className="mb-3">
                <label className={`${textSecondary} text-[12px] font-medium font-['Poppins'] mb-1.5 block`}>Senha atual</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><IconKey className="w-4.5 h-4.5 text-gray-400" /></div>
                  <input type="password" placeholder="Senha atual" value={editOldPassword} onChange={(e) => { setEditOldPassword(e.target.value); setEditError(""); }} className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-[14px] font-['Poppins'] outline-none transition-colors ${inputBg} ${inputFocusBorder}`} />
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className={`${textSecondary} text-[12px] font-medium font-['Poppins'] mb-1.5 block`}>
                {isPassword ? "Nova senha" : fieldLabels[editField]}
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  {editField === "name" && <IconUserCircle className="w-4.5 h-4.5 text-gray-400" />}
                  {editField === "email" && <IconAt className="w-4.5 h-4.5 text-gray-400" />}
                  {editField === "neighborhood" && <IconMapPin className="w-4.5 h-4.5 text-gray-400" />}
                  {isPassword && <IconKey className="w-4.5 h-4.5 text-gray-400" />}
                </div>
                <input
                  type={isPassword ? "password" : editField === "email" ? "email" : "text"}
                  placeholder={fieldPlaceholders[editField]}
                  value={editValue}
                  onChange={(e) => { setEditValue(e.target.value); setEditError(""); }}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-[14px] font-['Poppins'] outline-none transition-colors ${inputBg} ${inputFocusBorder}`}
                  autoFocus
                />
              </div>
            </div>

            {isPassword && (
              <div className="mb-3">
                <label className={`${textSecondary} text-[12px] font-medium font-['Poppins'] mb-1.5 block`}>Confirmar nova senha</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><IconKey className="w-4.5 h-4.5 text-gray-400" /></div>
                  <input type="password" placeholder="Repita a nova senha" value={editValue2} onChange={(e) => { setEditValue2(e.target.value); setEditError(""); }} onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); }} className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-[14px] font-['Poppins'] outline-none transition-colors ${inputBg} ${inputFocusBorder}`} />
                </div>
              </div>
            )}

            <AnimatePresence>
              {editError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"}`}>
                    <IconAlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className={`text-[12px] font-medium font-['Poppins'] ${isDark ? "text-red-400" : "text-red-500"}`}>{editError}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setEditField(null)} className={`flex-1 py-3.5 rounded-xl border ${isDark ? "border-gray-600" : "border-gray-200"} ${textPrimary} font-medium text-[14px] font-['Poppins'] active:scale-[0.98] transition`}>
                Cancelar
              </button>
              <button type="button" onClick={handleSaveEdit} className="flex-1 py-3.5 rounded-xl bg-[#2b7fff] text-white font-medium text-[14px] font-['Poppins'] active:scale-[0.98] transition shadow-lg shadow-[#2b7fff]/20">
                Salvar
              </button>
            </div>
          </motion.div>
        </motion.div>
      );
    };

    // Derive logged-in state from both local flag and global profile
    const effectiveLoggedIn = isLoggedIn || !!(userProfile?.email);
    const effectiveEmail = loggedInEmail || userProfile?.email || "";
    const effectiveMethod = loggedInMethod || userProfile?.loginMethod || "email";

    // === Logged-in view ===
    if (effectiveLoggedIn) {
      return (
        <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
          <div className={`flex items-center justify-between px-4 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
            <button onClick={() => setCurrentView("main")} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
              <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
            </button>
            <h1 className={`flex-1 text-left ml-2 text-[17px] ${textPrimary} font-bold font-['Poppins']`}>Conta e login</h1>
            <div className="w-9" />
          </div>
          <div className="flex-1 overflow-y-auto pb-8">
            <div className="px-5 pt-5 pb-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`${isDark ? "bg-white/[0.04] border-white/10" : "bg-gray-50 border-gray-200"} rounded-2xl p-5 border`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2b7fff] to-[#FFC107] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <IconUserCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${textPrimary} text-[16px] font-bold font-['Poppins'] truncate`}>{userProfile?.name || "Usuário Alerta+"}</p>
                    <p className={`${textSecondary} text-[13px] font-['Poppins'] truncate`}>{effectiveEmail}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 bg-[#00bc7d] rounded-full" />
                      <span className="text-[#00bc7d] text-[11px] font-medium font-['Poppins']">{effectiveMethod === "google" ? "Conectado via Google" : "Conectado via e-mail"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className={`px-5 py-3 ${sectionBg}`}><p className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>Informações da conta</p></div>
            <div className={`${cardBg}`}>
              {renderSettingRow({ icon: IconUserCircle, label: "Nome", iconBg: "bg-blue-500", subtitle: userProfile?.name || "Toque para definir", action: () => openEditField("name") }, 0, false)}
              {renderSettingRow({ icon: IconAt, label: "E-mail", iconBg: "bg-indigo-500", subtitle: effectiveEmail || "Toque para definir", action: () => openEditField("email") }, 1, false)}
              {renderSettingRow({ icon: IconMapPin, label: "Bairro", iconBg: "bg-[#00bc7d]", subtitle: userProfile?.neighborhood || "Toque para definir", action: () => openEditField("neighborhood") }, 2, false)}
              {renderSettingRow({ icon: IconKey, label: "Alterar senha", iconBg: "bg-amber-500", action: () => openEditField("password") }, 3, true)}
            </div>
            <div className="px-5 pt-5">
              <button type="button" onClick={handleLogout} className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border font-medium text-[14px] font-['Poppins'] active:scale-[0.98] transition ${isDark ? "border-red-500/30 text-red-400 active:bg-red-500/10" : "border-red-200 text-red-500 active:bg-red-50"}`}>
                <IconLogout className="w-4.5 h-4.5" />Sair da conta
              </button>
            </div>
          </div>

          {/* Edit field modal */}
          <AnimatePresence>
            {editField && <EditFieldModal />}
          </AnimatePresence>
        </div>
      );
    }

    // === Register view ===
    if (accountView === "register") {
      return (
        <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
          <div className={`flex items-center justify-between px-4 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
            <button onClick={switchToLogin} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
              <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
            </button>
            <h1 className={`flex-1 text-left ml-2 text-[17px] ${textPrimary} font-bold font-['Poppins']`}>Criar conta</h1>
            <div className="w-9" />
          </div>
          <div className="flex-1 overflow-y-auto pb-8">
            {/* Header */}
            <div className="px-5 pt-6 pb-2">
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-4">
                <div className="w-[88px] h-[88px] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl" style={{ backgroundImage: "linear-gradient(141deg, #0a2540 51%, #1c5287 95%)" }}>
                  <span className="text-white text-3xl font-bold font-['Poppins']">a<span className="text-[#FFC107]">+</span></span>
                </div>
                <h2 className={`${textPrimary} text-[20px] font-bold font-['Poppins'] mb-1`}>Crie sua conta</h2>
                <p className={`${textSecondary} text-[13px] font-['Poppins']`}>Junte-se à comunidade Alerta+ e ajude a tornar Manaus mais segura</p>
              </motion.div>
            </div>

            {/* Google signup */}
            <div className="px-5 pb-4">
              <button type="button" onClick={handleGoogleLogin} disabled={isRegistering} className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border font-medium text-[14px] font-['Poppins'] active:scale-[0.98] transition ${isDark ? "bg-white/[0.06] border-white/10 text-white active:bg-white/10" : "bg-white border-gray-200 text-gray-900 active:bg-gray-50 shadow-sm"} ${isRegistering ? "opacity-60 pointer-events-none" : ""}`}>
                <GoogleIcon />
                Cadastrar com Google
              </button>
            </div>

            {/* Divider */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-4">
                <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <span className={`${textSecondary} text-[12px] font-['Poppins']`}>ou cadastre com e-mail</span>
                <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
              </div>
            </div>

            {/* Form */}
            <div className="px-5 space-y-3">
              {/* Name */}
              <div>
                <label className={`${textSecondary} text-[12px] font-medium font-['Poppins'] mb-1.5 block`}>Nome completo</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><IconUserCircle className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} /></div>
                  <input type="text" placeholder="Seu nome" value={registerName} onChange={(e) => { setRegisterName(e.target.value); setRegisterError(""); }} className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-[14px] font-['Poppins'] outline-none transition-colors ${inputBg} ${inputFocusBorder}`} />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className={`${textSecondary} text-[12px] font-medium font-['Poppins'] mb-1.5 block`}>E-mail</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><IconMail className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} /></div>
                  <input type="email" placeholder="seu@email.com" value={registerEmail} onChange={(e) => { setRegisterEmail(e.target.value); setRegisterError(""); }} className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-[14px] font-['Poppins'] outline-none transition-colors ${inputBg} ${inputFocusBorder}`} />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className={`${textSecondary} text-[12px] font-medium font-['Poppins'] mb-1.5 block`}>Senha</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><IconKey className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} /></div>
                  <input type={showRegisterPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={registerPassword} onChange={(e) => { setRegisterPassword(e.target.value); setRegisterError(""); }} className={`w-full pl-11 pr-12 py-3.5 rounded-xl border text-[14px] font-['Poppins'] outline-none transition-colors ${inputBg} ${inputFocusBorder}`} />
                  <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1">
                    {showRegisterPassword ? <IconEyeOff className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} /> : <IconEye className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} />}
                  </button>
                </div>
              </div>
              {/* Confirm Password */}
              <div>
                <label className={`${textSecondary} text-[12px] font-medium font-['Poppins'] mb-1.5 block`}>Confirmar senha</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><IconKey className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} /></div>
                  <input type={showRegisterConfirmPassword ? "text" : "password"} placeholder="Repita a senha" value={registerConfirmPassword} onChange={(e) => { setRegisterConfirmPassword(e.target.value); setRegisterError(""); }} onKeyDown={(e) => { if (e.key === "Enter") handleRegister(); }} className={`w-full pl-11 pr-12 py-3.5 rounded-xl border text-[14px] font-['Poppins'] outline-none transition-colors ${inputBg} ${inputFocusBorder}`} />
                  <button type="button" onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1">
                    {showRegisterConfirmPassword ? <IconEyeOff className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} /> : <IconEye className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} />}
                  </button>
                </div>
              </div>
              {/* Password strength */}
              {registerPassword.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => {
                      const s = getPasswordStrength(registerPassword);
                      return <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${level <= s ? strengthColors[s] : isDark ? "bg-white/10" : "bg-gray-200"}`} />;
                    })}
                  </div>
                  <p className={`${textSecondary} text-[11px] font-['Poppins']`}>{strengthLabels[getPasswordStrength(registerPassword)]}</p>
                </motion.div>
              )}
              {/* Terms */}
              <div role="button" tabIndex={0} onPointerUp={() => setAcceptedTerms(!acceptedTerms)} className="flex items-start gap-3 pt-1 cursor-pointer select-none">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${acceptedTerms ? "bg-[#2b7fff] border-[#2b7fff]" : isDark ? "border-white/20 bg-transparent" : "border-gray-300 bg-transparent"}`}>
                  {acceptedTerms && <IconCheck className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] leading-relaxed`}>
                  Concordo com os <span className="text-[#2b7fff] font-medium" onClick={(e) => { e.stopPropagation(); toast("Termos de uso"); }}>Termos de Uso</span> e a <span className="text-[#2b7fff] font-medium" onClick={(e) => { e.stopPropagation(); toast("Política de Privacidade"); }}>Política de Privacidade</span>
                </p>
              </div>
              {/* Error */}
              <AnimatePresence>
                {registerError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"} border`}>
                      <IconAlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-red-500 text-[12px] font-medium font-['Poppins']">{registerError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Register button */}
              <button type="button" onClick={handleRegister} disabled={isRegistering} className={`w-full py-3.5 rounded-[14px] bg-[#00bc7d] text-white font-medium text-[14px] font-['Poppins'] active:scale-[0.98] transition shadow-lg shadow-[#00bc7d]/20 ${isRegistering ? "opacity-60 pointer-events-none" : ""}`}>
                {isRegistering ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Criando conta...
                  </span>
                ) : "Criar conta"}
              </button>
              {/* Back to login */}
              <p className={`${textSecondary} text-[13px] font-['Poppins'] text-center pt-2`}>
                Já tem uma conta?{" "}
                <button type="button" onClick={switchToLogin} className="text-[#2b7fff] font-medium active:opacity-70 transition">Faça login</button>
              </p>
            </div>
            {/* Info */}
            <div className="px-5 pt-5">
              <div className={`${isDark ? "bg-white/[0.03] border-white/5" : "bg-gray-50 border-gray-100"} rounded-xl p-4 border`}>
                <div className="flex items-start gap-3">
                  <IconInfoCircle className={`w-4 h-4 ${textSecondary} mt-0.5 flex-shrink-0`} />
                  <p className={`${textSecondary} text-[12px] font-['Poppins'] leading-relaxed`}>Sua conta permite salvar alertas, acumular pontos de confiança e sincronizar preferências entre dispositivos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // === Login view ===
    return (
      <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
        <div className={`flex items-center justify-between px-4 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
          <button onClick={() => setCurrentView("main")} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
            <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
          </button>
          <h1 className={`flex-1 text-left ml-2 text-[17px] ${textPrimary} font-bold font-['Poppins']`}>Conta e login</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 overflow-y-auto pb-8">
          {/* Header */}
          <div className="px-5 pt-6 pb-2">
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-4">
              <div className="w-[88px] h-[88px] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl" style={{ backgroundImage: "linear-gradient(141deg, #0a2540 51%, #1c5287 95%)" }}>
                <span className="text-white text-3xl font-bold font-['Poppins']">a<span className="text-[#FFC107]">+</span></span>
              </div>
              <h2 className={`${textPrimary} text-[20px] font-bold font-['Poppins'] mb-1`}>Entre na sua conta</h2>
              <p className={`${textSecondary} text-[13px] font-['Poppins']`}>Sincronize seus dados e alertas em qualquer dispositivo</p>
            </motion.div>
          </div>
          {/* Google */}
          <div className="px-5 pb-4">
            <button type="button" onClick={handleGoogleLogin} disabled={isLoggingIn} className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border font-medium text-[14px] font-['Poppins'] active:scale-[0.98] transition ${isDark ? "bg-white/[0.06] border-white/10 text-white active:bg-white/10" : "bg-white border-gray-200 text-gray-900 active:bg-gray-50 shadow-sm"} ${isLoggingIn ? "opacity-60 pointer-events-none" : ""}`}>
              <GoogleIcon />
              {isLoggingIn ? "Conectando..." : "Continuar com Google"}
            </button>
          </div>
          {/* Divider */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-4">
              <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
              <span className={`${textSecondary} text-[12px] font-['Poppins']`}>ou entre com e-mail</span>
              <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
            </div>
          </div>
          {/* Email form */}
          <div className="px-5 space-y-3">
            <div>
              <label className={`${textSecondary} text-[12px] font-medium font-['Poppins'] mb-1.5 block`}>E-mail</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><IconMail className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} /></div>
                <input type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }} className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-[14px] font-['Poppins'] outline-none transition-colors ${inputBg} ${inputFocusBorder}`} />
              </div>
            </div>
            <div>
              <label className={`${textSecondary} text-[12px] font-medium font-['Poppins'] mb-1.5 block`}>Senha</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><IconKey className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} /></div>
                <input type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }} onKeyDown={(e) => { if (e.key === "Enter") handleEmailLogin(); }} className={`w-full pl-11 pr-12 py-3.5 rounded-xl border text-[14px] font-['Poppins'] outline-none transition-colors ${inputBg} ${inputFocusBorder}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1">
                  {showPassword ? <IconEyeOff className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} /> : <IconEye className={`w-4.5 h-4.5 ${isDark ? "text-white/30" : "text-gray-400"}`} />}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {loginError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"} border`}>
                    <IconAlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-red-500 text-[12px] font-medium font-['Poppins']">{loginError}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-end">
              <button type="button" onClick={() => toast("Link de recuperação enviado para seu e-mail")} className="text-[#2b7fff] text-[13px] font-medium font-['Poppins'] active:opacity-70 transition">Esqueceu a senha?</button>
            </div>
            <button type="button" onClick={handleEmailLogin} disabled={isLoggingIn} className={`w-full py-3.5 rounded-xl bg-[#2b7fff] text-white font-medium text-[14px] font-['Poppins'] active:scale-[0.98] transition shadow-lg shadow-[#2b7fff]/20 ${isLoggingIn ? "opacity-60 pointer-events-none" : ""}`}>
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Entrando...
                </span>
              ) : "Entrar"}
            </button>
            <p className={`${textSecondary} text-[13px] font-['Poppins'] text-center pt-2`}>
              Não tem conta?{" "}
              <button type="button" onClick={switchToRegister} className="text-[#2b7fff] font-medium active:opacity-70 transition">Crie uma agora</button>
            </p>
          </div>
          {/* Info */}
          <div className="px-5 pt-5">
            <div className={`${isDark ? "bg-white/[0.03] border-white/5" : "bg-gray-50 border-gray-100"} rounded-xl p-4 border`}>
              <div className="flex items-start gap-3">
                <IconInfoCircle className={`w-4 h-4 ${textSecondary} mt-0.5 flex-shrink-0`} />
                <p className={`${textSecondary} text-[12px] font-['Poppins'] leading-relaxed`}>Ao fazer login, seus alertas, conquistas e preferências serão sincronizados e protegidos na nuvem. Você poderá acessar sua conta em qualquer dispositivo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "privacy") {
    return renderSubpage("Privacidade", [
      {
        icon: IconEye,
        label: "Perfil público",
        iconBg: "bg-indigo-500",
        toggle: true,
        toggleValue: true,
        onToggle: () => toast("Opção alternada"),
      },
      {
        icon: IconMapPin,
        label: "Compartilhar localização",
        iconBg: "bg-red-500",
        toggle: true,
        toggleValue: true,
        onToggle: () => toast("Opção alternada"),
      },
    ]);
  }

  if (currentView === "about") {
    return (
      <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
        <div className={`flex items-center justify-between px-4 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
          <button onClick={() => setCurrentView("main")} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
            <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
          </button>
          <h1 className={`flex-1 text-left ml-2 text-[17px] ${textPrimary} font-bold font-['Poppins']`}>Sobre</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center w-full max-w-[350px]"
          >
            <div className="w-[136px] h-[136px] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl" style={{ backgroundImage: "linear-gradient(141deg, #0a2540 60%, #1c5287 95%)" }}>
              <span className="text-white text-5xl font-bold font-['Poppins']">a<span className="text-[#FFC107]">+</span></span>
            </div>
            <p className={`${textSecondary} text-[14px] font-['Poppins'] mb-1`}>
              Informação para circular com mais segurança
            </p>
            <p className={`${tc.isDark ? "text-gray-500" : "text-[#bababa]"} text-[13px] font-['Poppins'] mb-8`}>
              Versão 1.0.0
            </p>
            <div className="space-y-3 text-left">
              <div className={`${tc.isDark ? "bg-gray-800 border-gray-700" : "bg-[#f3f4f6] border-[#e5e7eb]"} rounded-2xl p-4 border`}>
                <p className={`${textSecondary} text-[13px] font-['Poppins'] leading-relaxed`}>
                  Alerta+ é um aplicativo colaborativo focado na segurança urbana de Manaus,
                  que centraliza alertas de segurança e infraestrutura em um mapa interativo.
                </p>
              </div>
              <div className={`${tc.isDark ? "bg-gray-800 border-gray-700" : "bg-[#f3f4f6] border-[#e5e7eb]"} rounded-2xl p-4 border`}>
                <p className={`${textSecondary} text-[13px] font-['Poppins']`}>
                  Desenvolvido com ❤️ para Manaus
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (currentView === "audio-player") {
    const isDark = tc.isDark;
    const voiceOptions = [
      { value: "female-default", label: "Feminina (Padrão)", description: "Voz feminina natural em português", icon: IconMicrophone },
      { value: "male-default", label: "Masculina", description: "Voz masculina natural em português", icon: IconMicrophone },
      { value: "female-calm", label: "Feminina Calma", description: "Tom mais suave e tranquilo", icon: IconMicrophone },
      { value: "male-deep", label: "Masculina Grave", description: "Tom mais grave e firme", icon: IconMicrophone },
      { value: "female-young", label: "Feminina Jovem", description: "Voz jovem e dinâmica", icon: IconMicrophone },
    ];
    const currentVoice = voiceOptions.find(v => v.value === mapVoice) || voiceOptions[0];
    const optionBg = isDark ? "bg-white/5" : "bg-gray-50";
    const optionActiveBg = isDark ? "bg-red-500/15 border-red-500/40" : "bg-red-50 border-red-300";
    const optionBorder = isDark ? "border-white/10" : "border-gray-200";

    return (
      <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
        <div className={`flex items-center justify-between px-4 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
          <button onClick={() => setCurrentView("main")} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
            <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
          </button>
          <h1 className={`flex-1 text-left ml-2 text-[17px] ${textPrimary} font-bold font-['Poppins']`}>Áudio</h1>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          {/* Voice Selection Section */}
          <div className={`px-5 py-3 ${sectionBg}`}>
            <p className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>Voz do mapa</p>
          </div>
          <div className={`${cardBg}`}>
            {/* Current voice display */}
            <div className={`px-5 py-4 border-b ${dividerColor}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <IconMicrophone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>Voz atual</p>
                  <p className={`${textSecondary} text-[12px] font-['Poppins']`}>{currentVoice.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast("Reproduzindo amostra da voz...")}
                  className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center active:scale-90 transition"
                >
                  <IconPlayerPlay className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Voice options */}
              <div className="space-y-2">
                {voiceOptions.map((option) => {
                  const isSelected = mapVoice === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setMapVoice(option.value);
                        toast.success(`Voz alterada: ${option.label}`);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-[0.98] ${
                        isSelected ? optionActiveBg : `${optionBg} ${optionBorder}`
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-red-500" : isDark ? "bg-white/10" : "bg-gray-200"}`}>
                        <IconMicrophone className={`w-4 h-4 ${isSelected ? "text-white" : iconSecondary}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <span className={`${textPrimary} text-[14px] font-medium font-['Poppins']`}>
                          {option.label}
                        </span>
                        <p className={`${textSecondary} text-[11px] font-['Poppins']`}>{option.description}</p>
                      </div>
                      {isSelected && <IconCheck className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice volume slider */}
            <div className={`px-5 py-4 border-b ${dividerColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <IconVolume className="w-4 h-4 text-white" />
                  </div>
                  <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>Volume da voz</span>
                </div>
                <span className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>{voiceVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={voiceVolume}
                onChange={(e) => setVoiceVolume(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${voiceVolume}%, ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"} ${voiceVolume}%, ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"} 100%)`,
                }}
              />
            </div>

            {/* Voice during music toggle */}
            <div
              role="button"
              tabIndex={0}
              onPointerUp={() => setVoiceDuringMusic(!voiceDuringMusic)}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg}`}
            >
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconRadio className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>
                  Voz sobre música
                </span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>Falar instruções mesmo com música</p>
              </div>
              <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${voiceDuringMusic ? "bg-[#00bc7d]" : toggleOffBg}`}>
                <div
                  className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                  style={{ transform: voiceDuringMusic ? "translateX(20px)" : "translateX(0px)" }}
                />
              </div>
            </div>
          </div>

          {/* Spotify Section */}
          <div className={`px-5 py-3 ${sectionBg}`}>
            <p className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>Streaming de música</p>
          </div>
          <div className={`${cardBg}`}>
            {/* Spotify connection card */}
            <div className={`px-5 py-4 border-b ${dividerColor}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#1DB954] rounded-xl flex items-center justify-center flex-shrink-0">
                  <IconMusic className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>Spotify</p>
                  <p className={`text-[12px] font-['Poppins'] ${spotifyConnected ? "text-[#1DB954]" : textSecondary}`}>
                    {spotifyConnected ? "Conectado" : "Não conectado"}
                  </p>
                </div>
                {spotifyConnected && (
                  <div className="w-2.5 h-2.5 bg-[#1DB954] rounded-full animate-pulse" />
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (spotifyConnected) {
                    setSpotifyConnected(false);
                    toast("Spotify desconectado");
                  } else {
                    setSpotifyConnected(true);
                    toast.success("Spotify conectado com sucesso!");
                  }
                }}
                className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-medium text-[14px] font-['Poppins'] active:scale-[0.98] transition ${
                  spotifyConnected
                    ? `${isDark ? "bg-white/[0.06] border-white/10" : "bg-gray-50 border-gray-200"} border ${textPrimary}`
                    : "bg-[#1DB954] text-white"
                }`}
              >
                {spotifyConnected ? (
                  <>
                    <IconX className="w-4 h-4" />
                    Desconectar Spotify
                  </>
                ) : (
                  <>
                    <IconExternalLink className="w-4 h-4" />
                    Conectar ao Spotify
                  </>
                )}
              </button>

              {spotifyConnected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3"
                >
                  <div className={`${isDark ? "bg-white/[0.04] border-white/10" : "bg-gray-50 border-gray-100"} rounded-xl p-3.5 border`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${isDark ? "bg-white/10" : "bg-gray-200"} flex items-center justify-center`}>
                        <IconHeadphones className={`w-5 h-5 ${textSecondary}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`${textPrimary} text-[13px] font-medium font-['Poppins'] truncate`}>Pronto para reproduzir</p>
                        <p className={`${textSecondary} text-[11px] font-['Poppins']`}>Seu Spotify está conectado ao Alerta+</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Auto play on navigation */}
            <div
              role="button"
              tabIndex={0}
              onPointerUp={() => setAutoPlayOnNav(!autoPlayOnNav)}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg} border-b ${dividerColor}`}
            >
              <div className="w-8 h-8 bg-[#00bc7d] rounded-lg flex items-center justify-center flex-shrink-0">
                <IconPlayerPlay className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>
                  Reproduzir ao navegar
                </span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>Iniciar música ao começar navegação</p>
              </div>
              <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${autoPlayOnNav ? "bg-[#00bc7d]" : toggleOffBg}`}>
                <div
                  className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                  style={{ transform: autoPlayOnNav ? "translateX(20px)" : "translateX(0px)" }}
                />
              </div>
            </div>

            {/* Pause during alerts */}
            <div
              role="button"
              tabIndex={0}
              onPointerUp={() => setPauseDuringAlerts(!pauseDuringAlerts)}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg}`}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconBell className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>
                  Pausar em alertas
                </span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>Pausar música ao receber alertas de segurança</p>
              </div>
              <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${pauseDuringAlerts ? "bg-[#00bc7d]" : toggleOffBg}`}>
                <div
                  className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                  style={{ transform: pauseDuringAlerts ? "translateX(20px)" : "translateX(0px)" }}
                />
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="px-5 pt-4">
            <div className={`${isDark ? "bg-white/[0.03] border-white/5" : "bg-gray-50 border-gray-100"} rounded-xl p-4 border`}>
              <div className="flex items-start gap-3">
                <IconInfoCircle className={`w-4 h-4 ${textSecondary} mt-0.5 flex-shrink-0`} />
                <p className={`${textSecondary} text-[12px] font-['Poppins'] leading-relaxed`}>
                  As instruções de voz do mapa serão reproduzidas mesmo durante a reprodução de música. O volume da música será reduzido automaticamente durante as instruções.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "speedometer") {
    const isDark = tc.isDark;
    const optionBg = isDark ? "bg-gray-800" : "bg-gray-50";
    const optionActiveBg = isDark ? "bg-orange-500/15 border-orange-500/40" : "bg-orange-50 border-orange-300";
    const optionBorder = isDark ? "border-gray-600" : "border-gray-200";

    const speedUnits = [
      { value: "kmh" as const, label: "km/h", description: "Quilômetros por hora" },
      { value: "mph" as const, label: "mph", description: "Milhas por hora" },
    ];

    return (
      <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
        <div className={`flex items-center justify-between px-4 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
          <button onClick={() => setCurrentView("main")} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
            <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
          </button>
          <h1 className={`flex-1 text-left ml-2 text-[17px] ${textPrimary} font-bold font-['Poppins']`}>Velocímetro</h1>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          {/* Speedometer preview */}
          <div className="px-5 pt-5 pb-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`${isDark ? "bg-white/[0.04] border-white/10" : "bg-gray-50 border-gray-200"} rounded-2xl p-5 border flex flex-col items-center`}
            >
              <div className="relative w-32 h-32 mb-3">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle cx="60" cy="60" r="54" fill="none" stroke={isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"} strokeWidth="8" strokeLinecap="round" strokeDasharray="226 113" transform="rotate(135 60 60)" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${226 * 0.45} ${339 - 226 * 0.45}`} transform="rotate(135 60 60)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`${textPrimary} text-[32px] font-bold font-['Poppins'] leading-none`}>45</span>
                  <span className={`${textSecondary} text-[11px] font-['Poppins']`}>{speedoUnit === "kmh" ? "km/h" : "mph"}</span>
                </div>
              </div>
              <p className={`${textSecondary} text-[12px] font-['Poppins']`}>Pré-visualização do velocímetro</p>
            </motion.div>
          </div>

          {/* Main toggle */}
          <div className={`px-5 py-3 ${sectionBg}`}>
            <p className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>Exibição</p>
          </div>
          <div className={`${cardBg}`}>
            <div
              role="button"
              tabIndex={0}
              onPointerUp={() => setSpeedoEnabled(!speedoEnabled)}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg} border-b ${dividerColor}`}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconGauge className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>Mostrar velocímetro</span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>Exibir durante a navegação</p>
              </div>
              <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${speedoEnabled ? "bg-[#00bc7d]" : toggleOffBg}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200" style={{ transform: speedoEnabled ? "translateX(20px)" : "translateX(0px)" }} />
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onPointerUp={() => setShowSpeedOnMap(!showSpeedOnMap)}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg}`}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconActivity className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>Velocidade no mapa</span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>Mostrar velocidade atual sobre o mapa</p>
              </div>
              <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${showSpeedOnMap ? "bg-[#00bc7d]" : toggleOffBg}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200" style={{ transform: showSpeedOnMap ? "translateX(20px)" : "translateX(0px)" }} />
              </div>
            </div>
          </div>

          {/* Speed unit */}
          <div className={`px-5 py-3 ${sectionBg}`}>
            <p className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>Unidade de velocidade</p>
          </div>
          <div className={`${cardBg}`}>
            <div className="px-5 py-4">
              <div className="flex gap-3">
                {speedUnits.map((unit) => {
                  const isSelected = speedoUnit === unit.value;
                  return (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => {
                        setSpeedoUnit(unit.value);
                        toast.success(`Unidade: ${unit.label}`);
                      }}
                      className={`flex-1 flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl border transition-all active:scale-[0.98] ${
                        isSelected ? optionActiveBg : `${optionBg} ${optionBorder}`
                      }`}
                    >
                      <span className={`text-[20px] font-bold font-['Poppins'] ${isSelected ? "text-orange-500" : textPrimary}`}>
                        {unit.label}
                      </span>
                      <span className={`${textSecondary} text-[11px] font-['Poppins']`}>{unit.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Speed limit alerts */}
          <div className={`px-5 py-3 ${sectionBg}`}>
            <p className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>Alertas de velocidade</p>
          </div>
          <div className={`${cardBg}`}>
            <div
              role="button"
              tabIndex={0}
              onPointerUp={() => setSpeedLimitAlert(!speedLimitAlert)}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg} border-b ${dividerColor}`}
            >
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconAlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>Alerta de limite</span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>Avisar ao exceder o limite da via</p>
              </div>
              <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${speedLimitAlert ? "bg-[#00bc7d]" : toggleOffBg}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200" style={{ transform: speedLimitAlert ? "translateX(20px)" : "translateX(0px)" }} />
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onPointerUp={() => setSpeedAlertSound(!speedAlertSound)}
              className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg} border-b ${dividerColor}`}
            >
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconVolume className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>Som do alerta</span>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] mt-0.5`}>Emitir som ao ultrapassar limite</p>
              </div>
              <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${speedAlertSound ? "bg-[#00bc7d]" : toggleOffBg}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200" style={{ transform: speedAlertSound ? "translateX(20px)" : "translateX(0px)" }} />
              </div>
            </div>

            {/* Threshold slider */}
            <div className={`px-5 py-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconGauge className="w-4 h-4 text-white" />
                  </div>
                  <span className={`${textPrimary} text-[15px] font-medium font-['Poppins']`}>Tolerância</span>
                </div>
                <span className="text-orange-500 text-[14px] font-bold font-['Poppins']">+{speedThreshold} {speedoUnit === "kmh" ? "km/h" : "mph"}</span>
              </div>
              <p className={`${textSecondary} text-[12px] font-['Poppins'] mb-3 ml-11`}>Alertar quando exceder o limite em</p>
              <input
                type="range"
                min="10"
                max="120"
                step="10"
                value={speedThreshold}
                onChange={(e) => setSpeedThreshold(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${((speedThreshold - 10) / 110) * 100}%, ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"} ${((speedThreshold - 10) / 110) * 100}%, ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"} 100%)`,
                }}
              />
              <div className="flex justify-between mt-1.5">
                {[10, 30, 50, 70, 90, 120].map(v => (
                  <span key={v} className={`text-[10px] font-['Poppins'] ${speedThreshold === v ? "text-orange-500 font-bold" : textSecondary}`}>
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="px-5 pt-4">
            <div className={`${isDark ? "bg-white/[0.03] border-white/5" : "bg-gray-50 border-gray-100"} rounded-xl p-4 border`}>
              <div className="flex items-start gap-3">
                <IconInfoCircle className={`w-4 h-4 ${textSecondary} mt-0.5 flex-shrink-0`} />
                <p className={`${textSecondary} text-[12px] font-['Poppins'] leading-relaxed`}>
                  O velocímetro utiliza os dados de GPS do dispositivo. A precisão pode variar dependendo do sinal. Os limites de velocidade são baseados nos dados do OpenStreetMap para as vias de Manaus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "invite-friend") {
    const isDark = tc.isDark;
    const shareLink = "https://alerta.plus/convite?ref=app";
    const shareMessage = "Conheça o Alerta+! Um app colaborativo de segurança urbana para Manaus. Baixe agora:";

    const shareChannels = [
      {
        id: "whatsapp",
        label: "WhatsApp",
        icon: IconMessageCircle,
        bg: "bg-[#25D366]",
        action: () => {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage + " " + shareLink)}`, "_blank");
          toast.success("Abrindo WhatsApp...");
        },
      },
      {
        id: "instagram",
        label: "Instagram",
        icon: IconBrandInstagram,
        bg: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]",
        action: () => {
          toast.success("Link copiado! Cole nos Stories ou DM do Instagram");
          navigator.clipboard?.writeText(shareLink);
        },
      },
      {
        id: "facebook",
        label: "Facebook",
        icon: IconBrandFacebook,
        bg: "bg-[#1877F2]",
        action: () => {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, "_blank");
          toast.success("Abrindo Facebook...");
        },
      },
      {
        id: "twitter",
        label: "X (Twitter)",
        icon: IconBrandTwitter,
        bg: "bg-[#1DA1F2]",
        action: () => {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareLink)}`, "_blank");
          toast.success("Abrindo X...");
        },
      },
      {
        id: "telegram",
        label: "Telegram",
        icon: IconSend,
        bg: "bg-[#0088cc]",
        action: () => {
          window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareMessage)}`, "_blank");
          toast.success("Abrindo Telegram...");
        },
      },
      {
        id: "email",
        label: "E-mail",
        icon: IconMail,
        bg: "bg-[#EA4335]",
        action: () => {
          window.open(`mailto:?subject=${encodeURIComponent("Conheça o Alerta+!")}&body=${encodeURIComponent(shareMessage + "\n\n" + shareLink)}`, "_blank");
          toast.success("Abrindo e-mail...");
        },
      },
    ];

    return (
      <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
        <div className={`flex items-center justify-between px-4 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
          <button onClick={() => setCurrentView("main")} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
            <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
          </button>
          <h1 className={`flex-1 text-left ml-2 text-[17px] ${textPrimary} font-bold font-['Poppins']`}>Convide um amigo</h1>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          {/* Hero card */}
          <div className="px-5 pt-5 pb-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-[#2b7fff] to-[#FFC107] rounded-2xl p-5 text-center"
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <IconHeart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-white text-[18px] font-bold font-['Poppins'] mb-1">
                Compartilhe o Alerta+
              </h2>
              <p className="text-white/80 text-[13px] font-['Poppins'] leading-relaxed">
                Ajude a tornar Manaus mais segura convidando seus amigos e familiares
              </p>
            </motion.div>
          </div>

          {/* Copy link */}
          <div className={`px-5 py-3 ${sectionBg}`}>
            <p className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>Link de convite</p>
          </div>
          <div className={`${cardBg}`}>
            <div className={`px-5 py-4`}>
              <div className={`flex items-center gap-3 rounded-xl p-3 border ${isDark ? "bg-gray-800 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                <IconLink className={`w-4 h-4 ${textSecondary} flex-shrink-0`} />
                <span className={`${textPrimary} text-[13px] font-['Poppins'] flex-1 truncate`}>
                  {shareLink}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(shareLink);
                    toast.success("Link copiado!");
                  }}
                  className="bg-pink-500 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium font-['Poppins'] active:scale-95 transition flex items-center gap-1.5"
                >
                  <IconCopy className="w-3.5 h-3.5" />
                  Copiar
                </button>
              </div>
            </div>
          </div>

          {/* Share channels */}
          <div className={`px-5 py-3 ${sectionBg}`}>
            <p className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>Compartilhar via</p>
          </div>
          <div className={`${cardBg}`}>
            {shareChannels.map((channel, idx) => {
              const ChannelIcon = channel.icon;
              const isLast = idx === shareChannels.length - 1;
              return (
                <div
                  key={channel.id}
                  role="button"
                  tabIndex={0}
                  onPointerUp={channel.action}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") channel.action(); }}
                  className={`w-full flex items-center gap-4 px-5 py-[14px] cursor-pointer select-none ${activeRowBg} ${!isLast ? `border-b ${dividerColor}` : ""}`}
                >
                  <div className={`w-8 h-8 ${channel.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <ChannelIcon className="w-[16px] h-[16px] text-white" />
                  </div>
                  <span className={`${textPrimary} text-[15px] font-medium font-['Poppins'] flex-1`}>
                    {channel.label}
                  </span>
                  <IconExternalLink className={`w-4 h-4 ${chevronColor} flex-shrink-0`} />
                </div>
              );
            })}
          </div>

          {/* QR Code section */}
          <div className={`px-5 py-3 ${sectionBg}`}>
            <p className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>QR Code</p>
          </div>
          <div className={`${cardBg}`}>
            <div className="px-5 py-5">
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-3">
                  <div className="w-32 h-32 grid grid-cols-5 grid-rows-5 gap-0.5 p-2">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-[1px] ${
                          [0,1,2,4,5,6,8,10,12,14,18,20,22,24].includes(i) ? "bg-gray-900" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className={`${textSecondary} text-[12px] font-['Poppins'] text-center`}>
                  Peça para seu amigo escanear este código
                </p>
              </div>
            </div>
          </div>

          {/* Native share */}
          <div className="px-5 pt-4">
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "Alerta+", text: shareMessage, url: shareLink });
                } else {
                  navigator.clipboard?.writeText(shareLink);
                  toast.success("Link copiado!");
                }
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-pink-500 text-white font-medium text-[14px] font-['Poppins'] active:scale-[0.98] transition"
            >
              <IconShare className="w-4.5 h-4.5" />
              Mais opções de compartilhamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== MAIN SETTINGS VIEW =====
  const sections: SettingSection[] = [
    {
      title: "",
      items: [
        { icon: IconSettings, label: t("settings.general", language), iconBg: "bg-[#00bc7d]", view: "general" },
        { icon: IconMap, label: t("settings.mapDisplay", language), iconBg: "bg-[#00bc7d]", view: "map-display" },
        { icon: IconVolume, label: t("settings.voiceSound", language), iconBg: "bg-[#00bc7d]", view: "sound" },
      ],
    },
    {
      title: t("settings.drivingPrefs", language),
      items: [
        { icon: IconNavigation, label: t("settings.navigation", language), iconBg: "bg-blue-500", view: "navigation" },
        { icon: IconCar, label: t("settings.vehicleDetails", language), iconBg: "bg-[#00bc7d]", view: "vehicle" },
        { icon: IconBellRinging, label: t("settings.remindersAlerts", language), iconBg: "bg-red-500", view: "reminders" },
        { icon: IconGauge, label: t("settings.speedometer", language), iconBg: "bg-orange-500", view: "speedometer" },
        { icon: IconMusic, label: t("settings.audio", language), iconBg: "bg-red-500", view: "audio-player" },
      ],
    },
    {
      title: t("settings.notifications", language),
      items: [
        { icon: IconBell, label: t("settings.notifications", language), iconBg: "bg-purple-500", view: "notifications" },
        { icon: IconRoute, label: t("settings.plannedRoutes", language), iconBg: "bg-blue-500", action: () => { navigate("/routes"); } },
        { icon: IconClock, label: t("settings.reminders", language), iconBg: "bg-red-500", view: "reminders" },
      ],
    },
    {
      title: t("settings.account", language),
      items: [
        { icon: IconUserCircle, label: t("settings.accountLogin", language), iconBg: "bg-blue-500", view: "account" },
        { icon: IconShieldCheck, label: t("settings.privacy", language), iconBg: "bg-yellow-500", view: "privacy" },
      ],
    },
    {
      title: "",
      items: [
        { icon: IconInfoCircle, label: t("settings.about", language), iconBg: "bg-blue-500", view: "about" },
        { icon: IconHeart, label: t("settings.inviteFriend", language), iconBg: "bg-pink-500", view: "invite-friend" },
      ],
    },
  ];

  return (
    <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 md:px-8 lg:px-12 pt-[44px] pb-3 flex-shrink-0 border-b ${dividerColor}`}>
        <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
            <IconArrowLeft className={`w-5 h-5 ${iconColor}`} />
          </button>
          <h1 className={`flex-1 text-left ml-2 text-[17px] md:text-lg ${textPrimary} font-bold font-['Poppins']`}>{t("settings.title", language)}</h1>
          <button onClick={() => navigate("/map")} className="w-9 h-9 flex items-center justify-center active:scale-90 transition">
            <IconX className={`w-5 h-5 ${iconSecondary}`} />
          </button>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-1 bg-gradient-to-r from-[#2b7fff] via-emerald-400 to-[#FFC107] flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8 px-0 md:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && (
              <div className={`px-5 py-3 ${sectionBg}`}>
                <p className={`${textSecondary} text-[13px] font-medium font-['Poppins']`}>
                  {section.title}
                </p>
              </div>
            )}
            <div className={cardBg}>
              {section.items.map((item, idx) =>
                renderSettingRow(item, sIdx * 10 + idx, idx === section.items.length - 1)
              )}
            </div>
          </div>
        ))}

          {/* Version */}
          <div className="pt-8 pb-4">
            <p className={`${chevronColor} text-[13px] font-['Poppins'] text-center`}>
              {t("settings.version", language)} 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}