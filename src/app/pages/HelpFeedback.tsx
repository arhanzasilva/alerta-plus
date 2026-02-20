import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { t, useThemeClasses } from "../context/translations";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconChevronDown,
  IconPhone,
  IconAlertTriangle,
  IconDroplet,
  IconBulbOff,
  IconBarrierBlock,
  IconCar,
  IconPaw,
  IconDots,
  IconSend,
  IconLoader2,
  IconShieldCheck,
  IconInfoCircle,
} from "@tabler/icons-react";

const HELP_TYPES = [
  { key: "emergency", icon: IconAlertTriangle, color: "#ef4444" },
  { key: "safetyThreat", icon: IconShieldCheck, color: "#f97316" },
  { key: "flooding", icon: IconDroplet, color: "#3b82f6" },
  { key: "noLight", icon: IconBulbOff, color: "#6b7280" },
  { key: "infrastructure", icon: IconBarrierBlock, color: "#a855f7" },
  { key: "accident", icon: IconCar, color: "#ec4899" },
  { key: "animalRisk", icon: IconPaw, color: "#10b981" },
  { key: "other", icon: IconDots, color: "#6b7280" },
] as const;

const EMERGENCY_NUMBERS = [
  { key: "police", number: "190", color: "#2563eb" },
  { key: "fireDept", number: "193", color: "#ef4444" },
  { key: "ambulance", number: "192", color: "#f97316" },
  { key: "civilDefense", number: "(92) 3625-1895", color: "#6b7280" },
];

export function HelpFeedback() {
  const navigate = useNavigate();
  const { theme, language, addHelpRequest } = useApp();
  const tc = useThemeClasses(theme);

  const [selectedType, setSelectedType] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const handleSend = () => {
    if (isLoading) return;
    setError("");

    if (!selectedType) {
      setError(t("help.selectTypeError", language));
      return;
    }
    if (!comment.trim()) {
      setError(t("help.commentRequired", language));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      addHelpRequest({ type: selectedType, comment: comment.trim() });
      setIsLoading(false);
      toast.success(t("help.success", language));
      setSelectedType("");
      setComment("");
    }, 1500);
  };

  const selectedTypeData = HELP_TYPES.find((ht) => ht.key === selectedType);

  return (
    <div className={`h-full w-full ${tc.bgPage2} overflow-y-auto flex flex-col`}>
      {/* Header */}
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
          {t("help.title", language)}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-0 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="px-5 md:px-0 pt-5 pb-8 max-w-3xl mx-auto"
        >
          {/* Subtitle */}
          <p className={`text-[13px] font-['Poppins'] ${tc.textSecondary} mb-5 leading-[20px]`}>
            {t("help.subtitle", language)}
          </p>

          {/* Help type dropdown */}
          <div className="mb-4">
            <label className={`block text-[12px] font-medium font-['Poppins'] ${tc.textSecondary} mb-1.5`}>
              {t("help.helpType", language)}
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full h-[50px] px-4 rounded-[14px] border text-[14px] font-['Poppins'] outline-none transition flex items-center justify-between ${tc.inputBg} ${
                  dropdownOpen ? "ring-2 ring-[#00bc7d]/30 border-[#00bc7d]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {selectedTypeData ? (
                    <>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${selectedTypeData.color}20` }}
                      >
                        {(() => {
                          const Icon = selectedTypeData.icon;
                          return <Icon className="w-4 h-4" style={{ color: selectedTypeData.color }} />;
                        })()}
                      </div>
                      <span>{t(`help.${selectedTypeData.key}`, language)}</span>
                    </>
                  ) : (
                    <span className={tc.isDark ? "text-gray-500" : "text-gray-400"}>
                      {t("help.selectType", language)}
                    </span>
                  )}
                </div>
                <IconChevronDown
                  className={`w-5 h-5 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  } ${tc.isDark ? "text-gray-500" : "text-gray-400"}`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute z-50 left-0 right-0 mt-2 rounded-[14px] border shadow-lg overflow-hidden ${tc.modalBg} ${tc.border}`}
                  >
                    {HELP_TYPES.map((ht) => {
                      const Icon = ht.icon;
                      return (
                        <button
                          key={ht.key}
                          onClick={() => {
                            setSelectedType(ht.key);
                            setDropdownOpen(false);
                            setError("");
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                            selectedType === ht.key
                              ? tc.isDark
                                ? "bg-gray-700"
                                : "bg-[#00bc7d]/10"
                              : tc.isDark
                              ? "hover:bg-gray-700"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${ht.color}20` }}
                          >
                            <Icon className="w-[18px] h-[18px]" style={{ color: ht.color }} />
                          </div>
                          <span className={`text-[14px] font-['Poppins'] ${tc.textPrimary}`}>
                            {t(`help.${ht.key}`, language)}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Emergency numbers */}
          <div className="mb-5">
            <label className={`block text-[12px] font-medium font-['Poppins'] ${tc.textSecondary} mb-2`}>
              {t("help.emergencyNumbers", language)}
            </label>
            <div className="space-y-2">
              {EMERGENCY_NUMBERS.map((en) => (
                <div
                  key={en.key}
                  className={`flex items-center justify-between p-3 rounded-[14px] border ${
                    tc.isDark ? "bg-[#1f2937] border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${en.color}15` }}
                    >
                      <IconPhone className="w-[18px] h-[18px]" style={{ color: en.color }} />
                    </div>
                    <div>
                      <p className={`text-[13px] font-medium font-['Poppins'] ${tc.textPrimary}`}>
                        {t(`help.${en.key}`, language)}
                      </p>
                      <p className={`text-[12px] font-['Poppins'] ${tc.textSecondary}`}>
                        {en.number}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${en.number.replace(/[^\d+]/g, "")}`}
                    className="px-4 py-2 rounded-xl text-[12px] font-medium font-['Poppins'] text-white active:scale-[0.95] transition"
                    style={{ backgroundColor: en.color }}
                  >
                    {t("help.call", language)}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Comment field */}
          <div className="mb-4">
            <label className={`block text-[12px] font-medium font-['Poppins'] ${tc.textSecondary} mb-1.5`}>
              {t("help.comment", language)}
            </label>
            <textarea
              placeholder={t("help.commentPlaceholder", language)}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError("");
              }}
              rows={4}
              className={`w-full p-4 rounded-[14px] border text-[14px] font-['Poppins'] outline-none transition resize-none focus:ring-2 focus:ring-[#00bc7d]/30 focus:border-[#00bc7d] ${tc.inputBg}`}
            />
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

          {/* Send button */}
          <button
            disabled={isLoading}
            onClick={handleSend}
            className="w-full h-[49px] bg-[#00bc7d] rounded-[14px] text-white text-[14px] font-medium font-['Poppins'] shadow-[0px_10px_15px_rgba(0,188,125,0.2),0px_4px_6px_rgba(0,188,125,0.2)] active:scale-[0.97] transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <IconLoader2 className="w-5 h-5 animate-spin" />
            ) : (
              <IconSend className="w-5 h-5" />
            )}
            {isLoading ? t("help.sending", language) : t("help.sendHelp", language)}
          </button>

          {/* Info box */}
          <div
            className={`mt-6 rounded-[14px] p-4 border ${
              tc.isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-[#f9fafb] border-[#f3f4f6]"
            }`}
          >
            <div className="flex gap-3 items-start">
              <IconInfoCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tc.textSecondary}`} />
              <p className={`text-[12px] font-['Poppins'] ${tc.textSecondary} leading-[19.5px]`}>
                {t("help.infoText", language)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}