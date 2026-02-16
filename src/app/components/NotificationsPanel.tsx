import { useState, useMemo } from "react";
import {
  IconX,
  IconBell,
  IconBellOff,
  IconCloudRain,
  IconBarrierBlock,
  IconAccessible,
  IconBulb,
  IconShield,
  IconAlertTriangle,
  IconCheck,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { Incident } from "../context/AppContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: number;
  type: "alert" | "system" | "community" | "achievement";
  severity?: "low" | "medium" | "high" | "critical";
  alertType?: string;
  read: boolean;
  incidentId?: string;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
}

export function NotificationsPanel({
  isOpen,
  onClose,
  incidents,
}: NotificationsPanelProps) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications = useMemo<Notification[]>(() => {
    const alertNotifs: Notification[] = incidents
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
      }));

    const systemNotifs: Notification[] = [
      {
        id: "sys-1",
        title: "Bem-vindo ao Alerta+",
        message:
          "Configure suas preferências de notificação para receber alertas relevantes.",
        time: Date.now() - 86400000 * 2,
        type: "system",
        read: readIds.has("sys-1"),
      },
      {
        id: "sys-2",
        title: "Atualização de segurança",
        message:
          "Novos dados de segurança do Centro de Manaus foram adicionados ao mapa.",
        time: Date.now() - 86400000,
        type: "system",
        read: readIds.has("sys-2"),
      },
    ];

    const communityNotifs: Notification[] = [
      {
        id: "comm-1",
        title: "Alerta da comunidade",
        message:
          "3 pessoas confirmaram o alagamento na Av. Eduardo Ribeiro. Evite a região.",
        time: Date.now() - 3600000 * 2,
        type: "community",
        severity: "high",
        read: readIds.has("comm-1"),
      },
      {
        id: "comm-2",
        title: "Zona segura atualizada",
        message:
          "A Rua Monsenhor Coutinho agora tem iluminação restaurada, segundo 5 moradores.",
        time: Date.now() - 3600000 * 4,
        type: "community",
        severity: "low",
        read: readIds.has("comm-2"),
      },
    ];

    return [...alertNotifs, ...communityNotifs, ...systemNotifs].sort(
      (a, b) => b.time - a.time
    );
  }, [incidents, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

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

  const groupNotifications = () => {
    const now = Date.now();
    const oneHour = 3600000;
    const oneDay = 86400000;

    const recent = notifications.filter((n) => now - n.time < oneHour);
    const today = notifications.filter(
      (n) => now - n.time >= oneHour && now - n.time < oneDay
    );
    const older = notifications.filter((n) => now - n.time >= oneDay);

    return { recent, today, older };
  };

  const groups = groupNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 z-[300]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-[360px] bg-white z-[301] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-[48px] pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <IconBell className="w-6 h-6 text-[#0a2540]" />
                <div>
                  <h2 className="text-[18px] font-bold text-[#101828] font-['Poppins']">
                    Notificações
                  </h2>
                  {unreadCount > 0 && (
                    <p className="text-[12px] text-[#7B838F] font-['Poppins']">
                      {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-3 py-1.5 text-[12px] font-medium text-[#2b7fff] bg-[#eff6ff] rounded-full hover:bg-[#dbeafe] active:scale-95 transition font-['Poppins']"
                  >
                    Ler todas
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition"
                >
                  <IconX className="w-5 h-5 text-[#7B838F]" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <IconBellOff className="w-16 h-16 text-[#d1d5dc] mb-4" />
                  <p className="text-[#404751] text-[16px] font-semibold font-['Poppins'] mb-1">
                    Tudo tranquilo
                  </p>
                  <p className="text-[#7B838F] text-[14px] font-['Poppins'] text-center">
                    Você não tem notificações no momento
                  </p>
                </div>
              ) : (
                <>
                  {groups.recent.length > 0 && (
                    <NotificationGroup
                      title="Recentes"
                      notifications={groups.recent}
                      onMarkRead={markAsRead}
                      getTimeLabel={getTimeLabel}
                    />
                  )}
                  {groups.today.length > 0 && (
                    <NotificationGroup
                      title="Hoje"
                      notifications={groups.today}
                      onMarkRead={markAsRead}
                      getTimeLabel={getTimeLabel}
                    />
                  )}
                  {groups.older.length > 0 && (
                    <NotificationGroup
                      title="Anteriores"
                      notifications={groups.older}
                      onMarkRead={markAsRead}
                      getTimeLabel={getTimeLabel}
                    />
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationGroup({
  title,
  notifications,
  onMarkRead,
  getTimeLabel,
}: {
  title: string;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  getTimeLabel: (time: number) => string;
}) {
  return (
    <div>
      <div className="px-5 py-2.5 bg-[#f9fafb]">
        <p className="text-[12px] font-semibold text-[#7B838F] font-['Poppins'] uppercase tracking-wider">
          {title}
        </p>
      </div>
      {notifications.map((notif, idx) => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onMarkRead={onMarkRead}
          getTimeLabel={getTimeLabel}
          index={idx}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
  getTimeLabel,
  index,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  getTimeLabel: (time: number) => string;
  index: number;
}) {
  const getIcon = () => {
    if (notification.type === "system") return IconBell;
    if (notification.type === "achievement") return IconCheck;

    switch (notification.alertType) {
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

  const getIconBg = () => {
    if (notification.type === "system") return "bg-[#0a2540]";
    if (notification.type === "community") {
      if (notification.severity === "high" || notification.severity === "critical")
        return "bg-red-500";
      return "bg-blue-500";
    }

    switch (notification.severity) {
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

  const Icon = getIcon();

  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onMarkRead(notification.id)}
      className={`w-full px-5 py-4 flex items-start gap-3 border-b border-gray-50 text-left transition active:bg-gray-50 ${
        notification.read ? "opacity-60" : ""
      }`}
    >
      {/* Unread dot */}
      <div className="w-2 flex-shrink-0 mt-4">
        {!notification.read && (
          <div className="w-2 h-2 bg-[#2b7fff] rounded-full" />
        )}
      </div>

      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBg()}`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-[14px] font-semibold text-[#101828] font-['Poppins'] truncate">
            {notification.title}
          </p>
          <span className="text-[11px] text-[#7B838F] font-['Poppins'] flex-shrink-0 mt-0.5">
            {getTimeLabel(notification.time)}
          </span>
        </div>
        <p className="text-[13px] text-[#7B838F] font-['Poppins'] leading-[18px] line-clamp-2">
          {notification.message}
        </p>
        {notification.severity && notification.type === "alert" && (
          <div className="mt-1.5">
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${getIconBg()}`}
            >
              {notification.severity === "critical" && "Crítico"}
              {notification.severity === "high" && "Alto"}
              {notification.severity === "medium" && "Médio"}
              {notification.severity === "low" && "Baixo"}
            </span>
          </div>
        )}
      </div>
    </motion.button>
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