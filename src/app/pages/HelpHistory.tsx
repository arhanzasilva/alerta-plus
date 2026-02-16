import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import type { HelpRequest } from "../context/AppContext";
import { t, useThemeClasses } from "../context/translations";
import {
  IconArrowLeft,
  IconAlertTriangle,
  IconDroplet,
  IconBulbOff,
  IconBarrierBlock,
  IconCar,
  IconPaw,
  IconDots,
  IconShieldCheck,
  IconClock,
  IconLoader2,
  IconCircleCheck,
  IconClipboardList,
  IconPlus,
} from "@tabler/icons-react";

const HELP_TYPE_CONFIG: Record<
  string,
  { icon: typeof IconAlertTriangle; color: string; gradient: string }
> = {
  emergency: { icon: IconAlertTriangle, color: "#ef4444", gradient: "from-red-500 to-red-600" },
  safetyThreat: { icon: IconShieldCheck, color: "#f97316", gradient: "from-orange-500 to-orange-600" },
  flooding: { icon: IconDroplet, color: "#3b82f6", gradient: "from-blue-500 to-blue-600" },
  noLight: { icon: IconBulbOff, color: "#6b7280", gradient: "from-gray-500 to-gray-600" },
  infrastructure: { icon: IconBarrierBlock, color: "#a855f7", gradient: "from-purple-500 to-purple-600" },
  accident: { icon: IconCar, color: "#ec4899", gradient: "from-pink-500 to-pink-600" },
  animalRisk: { icon: IconPaw, color: "#10b981", gradient: "from-emerald-500 to-emerald-600" },
  other: { icon: IconDots, color: "#6b7280", gradient: "from-gray-500 to-gray-600" },
};

function getStatusConfig(
  status: HelpRequest["status"],
  language: string
): { label: string; color: string; bgColor: string; icon: typeof IconClock } {
  switch (status) {
    case "pending":
      return {
        label:
          language === "pt"
            ? "Pendente"
            : language === "es"
            ? "Pendiente"
            : "Pending",
        color: "text-amber-600",
        bgColor: "bg-amber-100",
        icon: IconClock,
      };
    case "inProgress":
      return {
        label:
          language === "pt"
            ? "Em andamento"
            : language === "es"
            ? "En progreso"
            : "In progress",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: IconLoader2,
      };
    case "resolved":
      return {
        label:
          language === "pt"
            ? "Resolvido"
            : language === "es"
            ? "Resuelto"
            : "Resolved",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: IconCircleCheck,
      };
  }
}

function formatRelativeTime(timestamp: number, language: string): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return language === "pt" ? "Agora" : language === "es" ? "Ahora" : "Now";
  }
  if (minutes < 60) {
    return language === "pt"
      ? `${minutes} min atrás`
      : language === "es"
      ? `hace ${minutes} min`
      : `${minutes} min ago`;
  }
  if (hours < 24) {
    return language === "pt"
      ? `${hours}h atrás`
      : language === "es"
      ? `hace ${hours}h`
      : `${hours}h ago`;
  }
  return language === "pt"
    ? `${days}d atrás`
    : language === "es"
    ? `hace ${days}d`
    : `${days}d ago`;
}

export function HelpHistory() {
  const navigate = useNavigate();
  const { theme, language, helpRequests, updateHelpRequestStatus } = useApp();
  const tc = useThemeClasses(theme);
  const isDark = theme === "dark";

  const pendingCount = helpRequests.filter((r) => r.status === "pending").length;
  const resolvedCount = helpRequests.filter((r) => r.status === "resolved").length;

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
        <h1 className={`${tc.textPrimary} text-[17px] font-['Poppins'] font-bold flex-1`}>
          {t("history.title", language)}
        </h1>
        <button
          onClick={() => navigate("/help")}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#00bc7d] active:scale-[0.92] transition"
        >
          <IconPlus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-0 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="px-5 md:px-0 pt-5 pb-8 max-w-4xl mx-auto"
        >
          {/* Stats summary */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 mb-5">
            <div
              className={`rounded-[14px] p-3 text-center border ${
                isDark ? "bg-[#1f2937] border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className={`text-xl font-bold ${tc.textPrimary}`}>
                {helpRequests.length}
              </div>
              <div className={`text-[11px] ${tc.textSecondary} font-medium font-['Poppins']`}>
                {t("history.total", language)}
              </div>
            </div>
            <div
              className={`rounded-[14px] p-3 text-center border ${
                isDark ? "bg-[#1f2937] border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className="text-xl font-bold text-amber-500">{pendingCount}</div>
              <div className={`text-[11px] ${tc.textSecondary} font-medium font-['Poppins']`}>
                {t("history.pending", language)}
              </div>
            </div>
            <div
              className={`rounded-[14px] p-3 text-center border ${
                isDark ? "bg-[#1f2937] border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className="text-xl font-bold text-green-500">{resolvedCount}</div>
              <div className={`text-[11px] ${tc.textSecondary} font-medium font-['Poppins']`}>
                {t("history.resolved", language)}
              </div>
            </div>
          </div>

          {/* Empty state */}
          {helpRequests.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  isDark ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <IconClipboardList className={`w-9 h-9 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
              </div>
              <p className={`${tc.textPrimary} font-medium font-['Poppins'] mb-1`}>
                {t("history.empty", language)}
              </p>
              <p className={`text-[13px] ${tc.textSecondary} font-['Poppins'] text-center max-w-[260px] mb-5`}>
                {t("history.emptyDesc", language)}
              </p>
              <button
                onClick={() => navigate("/help")}
                className="px-6 py-2.5 bg-[#00bc7d] text-white rounded-xl text-[14px] font-medium font-['Poppins'] active:scale-[0.95] transition"
              >
                {t("history.newRequest", language)}
              </button>
            </motion.div>
          )}

          {/* Request list */}
          <AnimatePresence>
            {helpRequests.map((req, idx) => {
              const typeConfig = HELP_TYPE_CONFIG[req.type] || HELP_TYPE_CONFIG.other;
              const TypeIcon = typeConfig.icon;
              const statusCfg = getStatusConfig(req.status, language);
              const StatusIcon = statusCfg.icon;

              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`rounded-[16px] p-4 mb-3 border ${
                    isDark
                      ? "bg-[#1f2937] border-gray-700"
                      : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Type icon */}
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      <TypeIcon className="w-5 h-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[14px] font-medium font-['Poppins'] ${tc.textPrimary}`}>
                          {t(`help.${req.type}`, language)}
                        </span>
                        <span className={`text-[11px] ${tc.textSecondary} font-['Poppins']`}>
                          {formatRelativeTime(req.timestamp, language)}
                        </span>
                      </div>

                      <p className={`text-[13px] ${tc.textSecondary} font-['Poppins'] line-clamp-2 mb-2`}>
                        {req.comment}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium font-['Poppins'] ${statusCfg.bgColor} ${statusCfg.color}`}
                        >
                          <StatusIcon className={`w-3 h-3 ${req.status === "inProgress" ? "animate-spin" : ""}`} />
                          {statusCfg.label}
                        </span>

                        {/* Simulate status change */}
                        {req.status === "pending" && (
                          <button
                            onClick={() => updateHelpRequestStatus(req.id, "resolved")}
                            className={`text-[11px] font-medium font-['Poppins'] px-3 py-1 rounded-lg transition active:scale-[0.95] ${
                              isDark
                                ? "text-green-400 bg-green-500/10"
                                : "text-green-600 bg-green-50"
                            }`}
                          >
                            {t("history.markResolved", language)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
