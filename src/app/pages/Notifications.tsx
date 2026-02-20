import { useState, useMemo, useEffect } from "react";
import {
  IconBell,
  IconBellOff,
  IconCloudRain,
  IconBarrierBlock,
  IconAccessible,
  IconBulb,
  IconShield,
  IconAlertTriangle,
  IconMapPin,
  IconNavigation,
  IconRadar,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { t, formatDistanceWithUnit } from "../context/translations";

// ─── Haversine distance in meters ───
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)} m`;
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

interface NotifItem {
  id: string;
  title: string;
  message: string;
  time: number;
  type: "alert" | "system" | "community";
  severity?: "low" | "medium" | "high" | "critical";
  alertType?: string;
  read: boolean;
  incidentId?: string;
  distance: number; // meters from user
  lat?: number;
  lng?: number;
}

// Timestamps fixos — calculados uma única vez no carregamento do módulo
const COMMUNITY_NOTIFS_BASE: Omit<NotifItem, "read">[] = [
  {
    id: "comm-1",
    title: "Alerta da comunidade",
    message:
      "3 pessoas confirmaram o alagamento na Av. Eduardo Ribeiro. Evite a região.",
    time: Date.now() - 3600000 * 2,
    type: "community",
    severity: "high",
    distance: 0, // recalculado no useMemo
    lat: -3.121,
    lng: -60.02,
  },
  {
    id: "comm-2",
    title: "Zona segura atualizada",
    message:
      "A Rua Monsenhor Coutinho agora tem iluminação restaurada, segundo 5 moradores.",
    time: Date.now() - 3600000 * 4,
    type: "community",
    severity: "low",
    distance: 0,
    lat: -3.117,
    lng: -60.024,
  },
];

const SYSTEM_NOTIFS_BASE: Omit<NotifItem, "read">[] = [
  {
    id: "sys-1",
    title: "Bem-vindo ao Alerta+",
    message:
      "Configure suas preferências de notificação para receber alertas relevantes.",
    time: Date.now() - 86400000 * 2,
    type: "system",
    distance: 0,
  },
];

const RADIUS_OPTIONS = [
  { label: "500m", value: 500 },
  { label: "1 km", value: 1000 },
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "Todos", value: Infinity },
];

export function Notifications() {
  const { incidents, userLocation, theme, language, distanceUnit } = useApp();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [selectedRadius, setSelectedRadius] = useState(500);
  // Ticker: força re-render a cada 30s para atualizar labels de tempo
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // ─── Build notifications with distance ───
  const allNotifications = useMemo<NotifItem[]>(() => {
    const userLat = userLocation?.lat ?? -3.119;
    const userLng = userLocation?.lng ?? -60.0217;

    const alertNotifs: NotifItem[] = incidents
      .filter((i) => i.status === "active")
      .map((inc) => ({
        id: `notif-${inc.id}`,
        title: getAlertTitle(inc.type),
        message: inc.description || inc.location.address,
        time: inc.timestamp,
        type: "alert" as const,
        severity: inc.severity,
        alertType: inc.type,
        read: readIds.has(`notif-${inc.id}`),
        incidentId: inc.id,
        distance: haversineDistance(userLat, userLng, inc.location.lat, inc.location.lng),
        lat: inc.location.lat,
        lng: inc.location.lng,
      }));

    const communityNotifs: NotifItem[] = COMMUNITY_NOTIFS_BASE.map((n) => ({
      ...n,
      read: readIds.has(n.id),
      distance: n.lat != null && n.lng != null
        ? haversineDistance(userLat, userLng, n.lat, n.lng)
        : 0,
    }));

    const systemNotifs: NotifItem[] = SYSTEM_NOTIFS_BASE.map((n) => ({
      ...n,
      read: readIds.has(n.id),
    }));

    return [...alertNotifs, ...communityNotifs, ...systemNotifs];
  }, [incidents, readIds, userLocation]);

  // ─── Filter by radius and sort by distance ───
  const filteredNotifications = useMemo(() => {
    return allNotifications
      .filter((n) => {
        // System notifications always show
        if (n.type === "system") return true;
        return n.distance <= selectedRadius;
      })
      .sort((a, b) => {
        // System at bottom
        if (a.type === "system" && b.type !== "system") return 1;
        if (b.type === "system" && a.type !== "system") return -1;
        // Closer first, then by severity
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const aSev = severityOrder[a.severity ?? "low"] ?? 3;
        const bSev = severityOrder[b.severity ?? "low"] ?? 3;
        if (aSev !== bSev) return aSev - bSev;
        return a.distance - b.distance;
      });
  }, [allNotifications, selectedRadius]);

  const locationAlertCount = allNotifications.filter(
    (n) => n.type !== "system" && n.distance <= selectedRadius
  ).length;
  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) =>
    setReadIds((prev) => new Set([...prev, id]));

  const markAllAsRead = () =>
    setReadIds(new Set(filteredNotifications.map((n) => n.id)));

  const getTimeLabel = (time: number) => {
    const diff = Date.now() - time;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getIcon = (notif: NotifItem) => {
    if (notif.type === "system") return IconBell;
    switch (notif.alertType) {
      case "flood":
        return IconCloudRain;
      case "construction":
      case "obstacle":
        return IconBarrierBlock;
      case "accessibility":
        return IconAccessible;
      case "no-light":
        return IconBulb;
      case "crime":
      case "danger-zone":
      case "theft":
      case "assault":
        return IconShield;
      default:
        return IconAlertTriangle;
    }
  };

  const getIconBg = (notif: NotifItem) => {
    if (notif.type === "system") return "bg-[#0a2540]";
    if (notif.type === "community") {
      if (notif.severity === "high" || notif.severity === "critical")
        return "bg-red-500";
      return "bg-blue-500";
    }
    switch (notif.severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getSeverityLabel = (sev: string) => {
    switch (sev) {
      case "critical":
        return "Crítico";
      case "high":
        return "Alto";
      case "medium":
        return "Médio";
      case "low":
        return "Baixo";
      default:
        return "";
    }
  };

  // ─── Theme classes ───
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-[#111827]" : "bg-[#F8F9FB]";
  const textPrimary = isDark ? "text-white" : "text-[#101828]";
  const textSecondary = isDark ? "text-gray-400" : "text-[#6a7282]";
  const cardBg = isDark ? "bg-[#1f2937]" : "bg-white";
  const cardBorder = isDark ? "border-gray-700" : "border-gray-100";
  const headerBg = isDark ? "bg-[#1f2937]/90 backdrop-blur-xl" : "bg-white/80 backdrop-blur-xl";
  const chipActive = "bg-[#2b7fff] text-white";
  const chipInactive = isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500";

  return (
    <div className={`h-full w-full ${bgMain} flex flex-col overflow-hidden relative`}>
      {/* Decorative blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl bg-blue-400/20" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl bg-purple-400/15" />
      </div>

      {/* ─── Header ─── */}
      <div className={`relative z-10 flex-shrink-0 border-b ${cardBorder} ${headerBg}`}>
        <div className="px-5 md:px-8 lg:px-12 pt-5 pb-3 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2b7fff]/15 flex items-center justify-center">
                <IconBell className="w-5 h-5 text-[#2b7fff]" />
              </div>
              <div>
                <h1 className={`text-[20px] ${textPrimary} font-['Poppins'] font-[Poppins] font-bold`}>
                  {t("alerts.nearby", language)}
                </h1>
                <div className="flex items-center gap-1.5">
                  <IconMapPin className={`w-3 h-3 ${textSecondary}`} />
                  <p className={`text-[12px] ${textSecondary} font-['Poppins']`}>
                    {userLocation
                      ? `${locationAlertCount} ${t("alerts.inArea", language)}`
                      : t("alerts.gettingLocation", language)}
                  </p>
                </div>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-[11px] font-semibold text-[#2b7fff] bg-[#2b7fff]/10 rounded-full hover:bg-[#2b7fff]/20 active:scale-95 transition font-['Poppins']"
              >
                {t("alerts.readAll", language)}
              </button>
            )}
          </div>
        </div>

        {/* ─── Radius Filter ─── */}
        <div className="px-5 md:px-8 lg:px-12 pb-3 flex items-center gap-2 max-w-6xl mx-auto w-full">
          <IconRadar className={`w-4 h-4 flex-shrink-0 ${textSecondary}`} />
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedRadius(opt.value)}
                className={`rounded-full text-[11px] font-semibold transition active:scale-95 whitespace-nowrap font-['Poppins'] ${ selectedRadius === opt.value ? chipActive : chipInactive } px-[17px] py-[4px]`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Notification List ─── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-0 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 px-6"
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
              >
                <IconBellOff className={`w-10 h-10 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
              </div>
              <p
                className={`${textPrimary} text-[16px] font-semibold font-['Poppins'] mb-1`}
              >
                {t("alerts.quietArea", language)}
              </p>
              <p
                className={`${textSecondary} text-[13px] font-['Poppins'] text-center max-w-[260px]`}
              >
                {t("alerts.noAlerts", language)}{" "}
                {selectedRadius < 1000
                  ? `${selectedRadius}m`
                  : `${selectedRadius / 1000} km`}
                . {t("alerts.increaseRadius", language)}
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notif, idx) => {
              const Icon = getIcon(notif);
              const isLocationBased = notif.type !== "system";

              return (
                <motion.button
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => markAsRead(notif.id)}
                  className={`w-full px-5 md:px-6 py-4 md:py-5 flex items-start gap-3 md:gap-4 border-b ${cardBorder} text-left transition active:scale-[0.99] hover:bg-gray-50/50 dark:hover:bg-gray-800/30 ${
                    notif.read ? "opacity-40" : ""
                  }`}
                >
                  {/* Unread dot */}
                  <div className="w-2 flex-shrink-0 mt-4">
                    {!notif.read && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-[#2b7fff] rounded-full"
                      />
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBg(notif)}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p
                        className={`text-[14px] font-semibold ${textPrimary} font-['Poppins'] truncate`}
                      >
                        {notif.title}
                      </p>
                      <span
                        className={`text-[11px] ${textSecondary} font-['Poppins'] flex-shrink-0 mt-0.5`}
                      >
                        {getTimeLabel(notif.time)}
                      </span>
                    </div>

                    <p
                      className={`text-[13px] ${textSecondary} font-['Poppins'] leading-[18px] line-clamp-2`}
                    >
                      {notif.message}
                    </p>

                    {/* Distance + Severity badges */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {isLocationBased && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-['Poppins'] ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}
                        >
                          <IconNavigation className="w-2.5 h-2.5" />
                          {formatDistanceWithUnit(notif.distance, distanceUnit)}
                        </span>
                      )}

                      {notif.severity && notif.type !== "system" && (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${getIconBg(notif)}`}
                        >
                          {getSeverityLabel(notif.severity)}
                        </span>
                      )}

                      {notif.type === "community" && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-['Poppins'] ${isDark ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}
                        >
                          {t("notif.community", language)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })
            )}
          </AnimatePresence>

          {/* Bottom count summary */}
          {filteredNotifications.length > 0 && (
            <div className="px-5 md:px-6 py-4 md:py-6 flex items-center justify-center">
            <p className={`text-[12px] ${textSecondary} font-['Poppins']`}>
              {filteredNotifications.filter((n) => n.type !== "system").length} alerta
              {filteredNotifications.filter((n) => n.type !== "system").length !== 1 ? "s" : ""}{" "}
              {selectedRadius === Infinity
                ? "no total"
                : `num raio de ${selectedRadius < 1000 ? `${selectedRadius}m` : `${selectedRadius / 1000} km`}`}
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getAlertTitle(type: string): string {
  switch (type) {
    case "flood":
      return "Alagamento detectado";
    case "construction":
      return "Obra na região";
    case "obstacle":
      return "Obstáculo na via";
    case "accessibility":
      return "Problema de acessibilidade";
    case "no-light":
      return "Sem iluminação";
    case "crime":
      return "Atividade suspeita";
    case "danger-zone":
      return "Zona perigosa";
    case "theft":
      return "Furto/Roubo";
    case "assault":
      return "Assalto reportado";
    default:
      return "Alerta";
  }
}