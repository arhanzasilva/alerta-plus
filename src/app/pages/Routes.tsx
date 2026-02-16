import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconNavigation,
  IconMapPin,
  IconAlertTriangle,
  IconCheck,
  IconShield,
  IconBolt,
  IconArrowLeft,
  IconChevronRight,
  IconCornerDownRight,
  IconArrowUp,
  IconArrowUpRight,
  IconArrowUpLeft,
  IconFlag,
  IconHeart,
  IconTrash,
  IconClock,
  IconRuler,
  IconShieldCheck,
  IconScale,
  IconHome,
  IconBriefcase,
  IconBriefcase2,
  IconPlus,
  IconX,
  IconCalendar,
  IconRepeat,
  IconPlayerPlay,
  IconPencil,
  IconBarbell,
  IconSchool,
  IconMapPinFilled,
} from "@tabler/icons-react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { NavigationMode } from "../components/NavigationMode";
import { useNavigate, useLocation } from "react-router";
import { t } from "../context/translations";

interface RouteStep {
  instruction: string;
  distance: string;
  icon: "straight" | "right" | "left" | "arrive";
  street: string;
  warning?: string;
}

interface RouteData {
  name: string;
  distance: string;
  time: string;
  risk: string;
  warnings: number;
  safetyScore: number;
  icon: string;
  gradient: string;
  description: string;
  steps: RouteStep[];
}

const MANAUS_CENTER = { lat: -3.0356, lng: -60.0222 };

type PlannedRouteCategory = "home" | "work" | "gym" | "school" | "custom";

interface PlannedRoute {
  id: string;
  name: string;
  category: PlannedRouteCategory;
  origin: string;
  destination: string;
  scheduledTime: string;
  days: string[];
  isActive: boolean;
  createdAt: number;
}

const DAYS_OF_WEEK = [
  { key: "seg", label: "S" },
  { key: "ter", label: "T" },
  { key: "qua", label: "Q" },
  { key: "qui", label: "Q" },
  { key: "sex", label: "S" },
  { key: "sab", label: "S" },
  { key: "dom", label: "D" },
];

const CATEGORY_CONFIG: Record<PlannedRouteCategory, { icon: any; color: string; bgLight: string; bgDark: string; label: string }> = {
  home: { icon: IconHome, color: "text-[#00BC7D]", bgLight: "bg-[#ecfdf5]", bgDark: "bg-emerald-500/15", label: "Casa" },
  work: { icon: IconBriefcase2, color: "text-[#2b7fff]", bgLight: "bg-[#eff6ff]", bgDark: "bg-blue-500/15", label: "Trabalho" },
  gym: { icon: IconBarbell, color: "text-orange-500", bgLight: "bg-orange-50", bgDark: "bg-orange-500/15", label: "Academia" },
  school: { icon: IconSchool, color: "text-purple-500", bgLight: "bg-purple-50", bgDark: "bg-purple-500/15", label: "Escola/Faculdade" },
  custom: { icon: IconMapPinFilled, color: "text-pink-500", bgLight: "bg-pink-50", bgDark: "bg-pink-500/15", label: "Outro" },
};

const STORAGE_KEY = "alertaplus_planned_routes";

const DEFAULT_PLANNED_ROUTES: PlannedRoute[] = [
  {
    id: "planned-default-1",
    name: "Casinha",
    category: "home",
    origin: "Condomínio Reserva da Cidade, Cidade Nova 2",
    destination: "Centro, Manaus",
    scheduledTime: "08:00",
    days: ["sab", "dom"],
    isActive: true,
    createdAt: 1700000000000,
  },
  {
    id: "planned-default-2",
    name: "Soft Live",
    category: "work",
    origin: "Condomínio Reserva da Cidade, Cidade Nova 2",
    destination: "Distrito Industrial, Manaus",
    scheduledTime: "07:30",
    days: ["sab", "dom"],
    isActive: true,
    createdAt: 1700000100000,
  },
];

function loadPlannedRoutes(): PlannedRoute[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.length > 0 ? parsed : DEFAULT_PLANNED_ROUTES;
    }
    return DEFAULT_PLANNED_ROUTES;
  } catch {
    return DEFAULT_PLANNED_ROUTES;
  }
}

function savePlannedRoutes(routes: PlannedRoute[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

export function Routes() {
  const {
    incidents,
    favoriteRoutes,
    addFavoriteRoute,
    removeFavoriteRoute,
    isFavoriteRoute,
    incrementRoutesSearched,
    theme,
    language,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // ═══ Read navigation state from MapView shortcuts/recents/search ═══
  const navState = location.state as {
    origin?: string;
    destination?: string;
    autoSearch?: boolean;
  } | null;

  const [origin, setOrigin] = useState(navState?.origin || "");
  const [destination, setDestination] = useState(navState?.destination || "");
  const [showResults, setShowResults] = useState(
    !!(navState?.autoSearch && navState?.origin && navState?.destination)
  );
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Planned routes state
  const [plannedRoutes, setPlannedRoutes] = useState<PlannedRoute[]>(loadPlannedRoutes);
  const [showAddPlanned, setShowAddPlanned] = useState(false);
  const [editingPlanned, setEditingPlanned] = useState<PlannedRoute | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<PlannedRouteCategory>("work");
  const [formOrigin, setFormOrigin] = useState("");
  const [formDestination, setFormDestination] = useState("");
  const [formTime, setFormTime] = useState("07:30");
  const [formDays, setFormDays] = useState<string[]>(["seg", "ter", "qua", "qui", "sex"]);

  useEffect(() => {
    savePlannedRoutes(plannedRoutes);
  }, [plannedRoutes]);

  // Handle side effects from navigation state (clear history, track search)
  useEffect(() => {
    if (!navState) return;

    // Clear the state so it doesn't re-trigger on re-renders
    window.history.replaceState({}, "");

    if (navState.autoSearch && navState.origin && navState.destination) {
      incrementRoutesSearched();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormCategory("work");
    setFormOrigin("");
    setFormDestination("");
    setFormTime("07:30");
    setFormDays(["seg", "ter", "qua", "qui", "sex"]);
    setEditingPlanned(null);
  };

  const openAddPlanned = () => {
    resetForm();
    setShowAddPlanned(true);
  };

  const openEditPlanned = (route: PlannedRoute) => {
    setEditingPlanned(route);
    setFormName(route.name);
    setFormCategory(route.category);
    setFormOrigin(route.origin);
    setFormDestination(route.destination);
    setFormTime(route.scheduledTime);
    setFormDays(route.days);
    setShowAddPlanned(true);
  };

  const handleSavePlanned = () => {
    if (!formName.trim() || !formOrigin.trim() || !formDestination.trim()) {
      toast.error(t("routes.fillRequired", language));
      return;
    }

    if (editingPlanned) {
      setPlannedRoutes(prev =>
        prev.map(r => r.id === editingPlanned.id ? {
          ...r,
          name: formName.trim(),
          category: formCategory,
          origin: formOrigin.trim(),
          destination: formDestination.trim(),
          scheduledTime: formTime,
          days: formDays,
        } : r)
      );
      toast.success(t("routes.plannedUpdated", language));
    } else {
      const newRoute: PlannedRoute = {
        id: `planned-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        origin: formOrigin.trim(),
        destination: formDestination.trim(),
        scheduledTime: formTime,
        days: formDays,
        isActive: true,
        createdAt: Date.now(),
      };
      setPlannedRoutes(prev => [...prev, newRoute]);
      toast.success(t("routes.plannedCreated", language));
    }

    setShowAddPlanned(false);
    resetForm();
  };

  const togglePlannedActive = (id: string) => {
    setPlannedRoutes(prev =>
      prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
    );
  };

  const deletePlannedRoute = (id: string) => {
    setPlannedRoutes(prev => prev.filter(r => r.id !== id));
    toast(t("routes.plannedRemoved", language));
  };

  const usePlannedRoute = (route: PlannedRoute) => {
    setOrigin(route.origin);
    setDestination(route.destination);
    setShowResults(true);
    incrementRoutesSearched();
    toast.success(t("routes.routeLoaded", language));
  };

  const toggleFormDay = (day: string) => {
    setFormDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const getDaysSummary = (days: string[]) => {
    if (days.length === 7) return t("routes.allDays", language);
    if (days.length === 5 && !days.includes("sab") && !days.includes("dom")) return t("routes.weekdays", language);
    if (days.length === 2 && days.includes("sab") && days.includes("dom")) return t("routes.weekends", language);
    return days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ");
  };

  const handleSearch = () => {
    if (origin && destination) {
      setShowResults(true);
      incrementRoutesSearched();
    }
  };

  const handleUseCurrentLocation = () => {
    setOrigin("Condomínio Reserva da Cidade, Cidade Nova 2");
  };

  const routes: RouteData[] = [
    {
      name: t("routes.safestRoute", language),
      distance: "3.2 km",
      time: "12 min",
      risk: "low",
      warnings: 0,
      safetyScore: 95,
      icon: "🛡️",
      gradient: "from-green-500 to-green-600",
      description: t("routes.safestDesc", language),
      steps: [
        { instruction: "Siga em frente", distance: "450m", icon: "straight", street: "R. Laurentino Braz" },
        { instruction: "Vire à direita", distance: "800m", icon: "right", street: "Av. Noel Nutels" },
        { instruction: "Vire à esquerda", distance: "1.2km", icon: "left", street: "Av. Brasil", warning: "Zona iluminada, prefira calçada direita" },
        { instruction: "Siga em frente", distance: "500m", icon: "straight", street: "R. Recife" },
        { instruction: "Vire à direita", distance: "250m", icon: "right", street: "Av. Desembargador João Machado" },
        { instruction: "Chegou ao destino", distance: "—", icon: "arrive", street: destination || "Destino" },
      ],
    },
    {
      name: t("routes.balancedRoute", language),
      distance: "2.8 km",
      time: "10 min",
      risk: "medium",
      warnings: 2,
      safetyScore: 75,
      icon: "⚖️",
      gradient: "from-yellow-500 to-orange-500",
      description: t("routes.balancedDesc", language),
      steps: [
        { instruction: "Siga em frente", distance: "300m", icon: "straight", street: "R. Laurentino Braz" },
        { instruction: "Vire à esquerda", distance: "600m", icon: "left", street: "Av. das Torres", warning: "Trânsito intenso no horário de pico" },
        { instruction: "Vire à direita", distance: "900m", icon: "right", street: "Av. Autaz Mirim", warning: "2 alertas de atividade suspeita próximos" },
        { instruction: "Siga em frente", distance: "600m", icon: "straight", street: "R. São Luís" },
        { instruction: "Vire à direita", distance: "400m", icon: "right", street: "R. Recife" },
        { instruction: "Chegou ao destino", distance: "—", icon: "arrive", street: destination || "Destino" },
      ],
    },
    {
      name: t("routes.fastestRoute", language),
      distance: "2.3 km",
      time: "8 min",
      risk: "high",
      warnings: 4,
      safetyScore: 45,
      icon: "⚡",
      gradient: "from-red-500 to-red-600",
      description: t("routes.fastestDesc", language),
      steps: [
        { instruction: "Siga em frente", distance: "200m", icon: "straight", street: "R. Laurentino Braz" },
        { instruction: "Vire à esquerda", distance: "500m", icon: "left", street: "Travessa Local", warning: "Iluminação precária nesta rua" },
        { instruction: "Vire à direita", distance: "700m", icon: "right", street: "R. Beco da Feira", warning: "Zona com alto índice de furtos" },
        { instruction: "Siga em frente", distance: "500m", icon: "straight", street: "Av. Autaz Mirim", warning: "Alagamento reportado nas chuvas" },
        { instruction: "Vire à esquerda", distance: "400m", icon: "left", street: "R. São Luís", warning: "Calçada danificada, difícil passagem" },
        { instruction: "Chegou ao destino", distance: "—", icon: "arrive", street: destination || "Destino" },
      ],
    },
  ];

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#111827]" : "bg-[#f9fafb]";
  const textPrimary = isDark ? "text-white" : "text-[#101828]";
  const textSecondary = isDark ? "text-gray-400" : "text-[#6a7282]";
  const cardBg = isDark ? "bg-[#1f2937]" : "bg-white";
  const cardBorder = isDark ? "border-gray-700" : "border-gray-100";
  const inputBg = isDark ? "bg-gray-800" : "bg-white";

  const getRouteIconStyle = (icon: string) => {
    if (icon === "🛡️") return "bg-green-100 text-green-600";
    if (icon === "⚖️") return "bg-amber-100 text-amber-600";
    return "bg-red-100 text-red-600";
  };

  const getStepIcon = (icon: string) => {
    switch (icon) {
      case "straight": return IconArrowUp;
      case "right": return IconArrowUpRight;
      case "left": return IconArrowUpLeft;
      case "arrive": return IconFlag;
      default: return IconArrowUp;
    }
  };

  const handleToggleFavorite = (routeIdx: number, route: RouteData) => {
    const routeId = `route-${routeIdx}-${origin}-${destination}`;
    if (isFavoriteRoute(routeId)) {
      removeFavoriteRoute(routeId);
      toast(t("routes.removedFavorite", language));
    } else {
      addFavoriteRoute({
        id: routeId,
        name: route.name,
        origin,
        destination,
        distance: route.distance,
        time: route.time,
        safetyScore: route.safetyScore,
        gradient: route.gradient,
        icon: route.icon,
        risk: route.risk,
        warnings: route.warnings,
        savedAt: Date.now(),
      });
      toast.success(t("routes.savedFavorite", language));
    }
  };

  // ==========================================
  // NAVIGATION MAP VIEW
  // ==========================================
  if (isNavigating && selectedRouteIdx !== null) {
    const route = routes[selectedRouteIdx];
    return (
      <NavigationMode
        route={route}
        origin={origin}
        destination={destination}
        onClose={() => {
          setIsNavigating(false);
          setSelectedRouteIdx(null);
          navigate("/map");
        }}
        mapCenter={MANAUS_CENTER}
      />
    );
  }

  // ==========================================
  // SELECTED ROUTE DETAIL VIEW
  // ==========================================
  if (selectedRouteIdx !== null) {
    const route = routes[selectedRouteIdx];
    const routeId = `route-${selectedRouteIdx}-${origin}-${destination}`;
    const isFav = isFavoriteRoute(routeId);

    return (
      <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
        <div className={`relative z-10 p-5 border-b ${cardBorder} flex items-center gap-4 flex-shrink-0`}>
          <button onClick={() => setSelectedRouteIdx(null)} className={`${textPrimary} active:scale-90 transition`}>
            <IconArrowLeft className="w-7 h-7" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getRouteIconStyle(route.icon)}`}>
                {route.icon === "🛡️" && <IconShieldCheck className="w-5 h-5" />}
                {route.icon === "⚖️" && <IconScale className="w-5 h-5" />}
                {route.icon === "⚡" && <IconBolt className="w-5 h-5" />}
              </span>
              <h1 className={`text-xl ${textPrimary} font-bold`}>{route.name}</h1>
            </div>
            <p className={`text-sm ${textSecondary}`}>{route.description}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          <div className={`rounded-2xl overflow-hidden mb-5 border ${cardBorder} h-[180px] relative`}>
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${MANAUS_CENTER.lng - 0.025},${MANAUS_CENTER.lat - 0.025},${MANAUS_CENTER.lng + 0.025},${MANAUS_CENTER.lat + 0.025}&layer=mapnik&marker=${MANAUS_CENTER.lat},${MANAUS_CENTER.lng}`}
              className="w-full h-full border-0"
              title="Prévia da Rota"
            />
            <button
              onClick={() => handleToggleFavorite(selectedRouteIdx, route)}
              className={`absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition border shadow-sm ${isFav ? "bg-pink-500 border-pink-400 text-white" : isDark ? "bg-gray-800/90 border-gray-700 text-gray-300" : "bg-white/90 border-gray-200 text-gray-700"}`}
            >
              <IconHeart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { val: route.distance, label: "Distância", icon: IconRuler },
              { val: route.time, label: "Tempo", icon: IconClock },
              { val: `${route.safetyScore}%`, label: "Segurança", icon: IconShield },
            ].map((s) => {
              const StatIcon = s.icon;
              return (
                <div key={s.label} className={`${isDark ? "bg-white/[0.04]" : "bg-gray-50"} rounded-xl p-2 text-center`}>
                  <StatIcon className={`w-3.5 h-3.5 mx-auto mb-1 ${textSecondary}`} />
                  <div className={`text-sm ${textPrimary}`}>{s.val}</div>
                  <div className={`text-[10px] ${textSecondary}`}>{s.label}</div>
                </div>
              );
            })}
          </div>

          {route.warnings > 0 ? (
            <div className={`flex items-center gap-3 px-4 py-3 ${isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50/80 border-orange-100"} border rounded-xl mb-5`}>
              <IconAlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className={`${textSecondary} text-sm`}>{route.warnings} {route.warnings === 1 ? "alerta" : "alertas"} nesta rota</span>
            </div>
          ) : (
            <div className={`flex items-center gap-3 px-4 py-3 ${isDark ? "bg-green-500/10 border-green-500/20" : "bg-green-50/80 border-green-100"} border rounded-xl mb-5`}>
              <IconCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className={`${textSecondary} text-sm`}>Nenhum alerta conhecido</span>
            </div>
          )}

          <div className="mb-6">
            <h3 className={`${textPrimary} font-bold mb-4 flex items-center gap-2`}>
              <IconCornerDownRight className="w-5 h-5" />
              Passo a passo
            </h3>
            <div className={`${cardBg} border ${cardBorder} rounded-2xl overflow-hidden`}>
              {route.steps.map((step, idx) => {
                const StepIcon = getStepIcon(step.icon);
                const isLast = idx === route.steps.length - 1;
                return (
                  <div key={idx} className={`flex items-start gap-3 p-4 ${!isLast ? `border-b ${cardBorder}` : ""}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isLast ? "bg-green-500" : idx === 0 ? "bg-[#2b7fff]" : isDark ? "bg-white/[0.06]" : "bg-gray-100"}`}>
                      <StepIcon className={`w-4 h-4 ${isLast || idx === 0 ? "text-white" : textPrimary}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[14px] font-semibold ${textPrimary} font-['Poppins']`}>{step.instruction}</p>
                      <p className={`text-[12px] ${textSecondary} font-['Poppins']`}>{step.street}{step.distance !== "—" && ` • ${step.distance}`}</p>
                      {step.warning && (
                        <div className={`mt-2 px-3 py-2 ${isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50/80 border-orange-100"} border rounded-lg flex items-start gap-2`}>
                          <IconAlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className={`text-[11px] ${isDark ? "text-orange-400" : "text-orange-600"} font-medium font-['Poppins'] leading-[16px]`}>{step.warning}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`relative z-10 p-6 pt-4 flex-shrink-0 ${bgClass}`}>
          <button
            onClick={() => setIsNavigating(true)}
            className={`w-full py-4 rounded-2xl font-bold text-lg active:scale-95 transition shadow-sm flex items-center justify-center gap-3 bg-[#2b7fff] text-white`}
          >
            <IconNavigation className="w-5 h-5" />
            {t("routes.startNavigation", language)}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN ROUTES VIEW (Search + Results)
  // ==========================================
  return (
    <div className={`h-full w-full ${bgClass} flex flex-col overflow-hidden`}>
      <div className={`relative z-10 p-5 border-b ${cardBorder} flex-shrink-0 flex items-center gap-4`}>
        <button onClick={() => navigate("/map")} className={`${textPrimary} active:scale-90 transition`}>
          <IconArrowLeft className="w-7 h-7" />
        </button>
        <div>
          <h1 className={`text-2xl ${textPrimary} mb-1`}>{t("routes.smartRoutes", language)}</h1>
          <p className={`text-sm ${textSecondary}`}>{t("routes.findSafest", language)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative z-10 bg-[#aaaaaa1f]">
        {!showResults ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* ========== PLANNED ROUTES SECTION ========== */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`${textSecondary} text-sm flex items-center gap-2`}>
                  <IconCalendar className="w-4 h-4 text-[#2b7fff]" />
                  {t("routes.plannedRoutes", language)}
                </h3>
                <button
                  onClick={openAddPlanned}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2b7fff] rounded-lg text-white text-xs active:scale-95 transition"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>

              {plannedRoutes.length === 0 ? (
                <div className={`${cardBg} border ${cardBorder} rounded-xl p-5`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                      <IconRepeat className={`w-5 h-5 ${textSecondary}`} />
                    </div>
                    <p className={`${textPrimary} text-sm font-medium mb-1`}>Nenhuma rota planejada</p>
                    <p className={`${textSecondary} text-xs leading-relaxed`}>
                      Adicione rotas do dia a dia como trabalho, casa ou academia e programe horários.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {plannedRoutes.map((planned, idx) => {
                    const catConfig = CATEGORY_CONFIG[planned.category];
                    const CatIcon = catConfig.icon;
                    return (
                      <motion.div
                        key={planned.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden ${!planned.isActive ? "opacity-50" : ""}`}
                      >
                        <div className="p-3.5">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 ${catConfig.bgLight} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <CatIcon className={`w-5 h-5 ${catConfig.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`${textPrimary} text-sm font-bold truncate`}>{planned.name}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${catConfig.bgLight} ${catConfig.color}`}>
                                  {catConfig.label}
                                </span>
                              </div>
                              <p className={`${textSecondary} text-xs truncate mt-0.5`}>
                                {planned.origin} → {planned.destination}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex items-center gap-1">
                                  <IconClock className={`w-3 h-3 ${textSecondary}`} />
                                  <span className={`text-xs font-medium ${textPrimary}`}>{planned.scheduledTime}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <IconRepeat className={`w-3 h-3 ${textSecondary}`} />
                                  <span className={`text-xs ${textSecondary}`}>{getDaysSummary(planned.days)}</span>
                                </div>
                              </div>

                              {/* Day pills */}
                              <div className="flex gap-1 mt-2">
                                {DAYS_OF_WEEK.map((day, dIdx) => {
                                  const isSelected = planned.days.includes(day.key);
                                  return (
                                    <div
                                      key={`${planned.id}-${day.key}-${dIdx}`}
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                                        isSelected
                                          ? `bg-[#2b7fff] text-white`
                                          : `${isDark ? "bg-white/[0.06] text-white/30" : "bg-gray-100 text-gray-300"}`
                                      }`}
                                    >
                                      {day.label}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className={`flex items-center gap-2 mt-3 pt-3 border-t ${cardBorder}`}>
                            <button
                              onClick={() => usePlannedRoute(planned)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#2b7fff] rounded-lg text-white text-xs active:scale-95 transition"
                            >
                              <IconPlayerPlay className="w-3.5 h-3.5" />
                              Usar rota
                            </button>
                            <button
                              onClick={() => openEditPlanned(planned)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-white/[0.06] hover:bg-white/10" : "bg-gray-50 hover:bg-gray-100"} active:scale-90 transition`}
                            >
                              <IconPencil className={`w-3.5 h-3.5 ${textSecondary}`} />
                            </button>
                            <button
                              onClick={() => togglePlannedActive(planned.id)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-90 transition ${
                                planned.isActive
                                  ? "bg-emerald-50 hover:bg-emerald-100"
                                  : "bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              <IconCalendar className={`w-3.5 h-3.5 ${planned.isActive ? "text-emerald-500" : textSecondary}`} />
                            </button>
                            <button
                              onClick={() => deletePlannedRoute(planned.id)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:scale-90 transition"
                            >
                              <IconTrash className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ========== ADD/EDIT PLANNED ROUTE MODAL ========== */}
            <AnimatePresence>
              {showAddPlanned && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-end justify-center"
                >
                  <div className="absolute inset-0 bg-black/60" onClick={() => { setShowAddPlanned(false); resetForm(); }} />
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className={`relative w-full max-w-lg ${isDark ? "bg-[#1a1a1a]" : "bg-white"} rounded-t-3xl max-h-[90vh] flex flex-col`}
                  >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1">
                      <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-gray-300"}`} />
                    </div>

                    {/* Header */}
                    <div className={`flex items-center justify-between px-5 py-3 border-b ${cardBorder}`}>
                      <h2 className={`${textPrimary} text-[17px] font-bold font-['Poppins']`}>
                        {editingPlanned ? "Editar rota" : "Nova rota planejada"}
                      </h2>
                      <button
                        onClick={() => { setShowAddPlanned(false); resetForm(); }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-gray-100"} active:scale-90 transition`}
                      >
                        <IconX className={`w-4 h-4 ${textSecondary}`} />
                      </button>
                    </div>

                    {/* Form */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                      {/* Name */}
                      <div>
                        <label className={`block ${textSecondary} text-xs mb-1.5 font-medium`}>Nome da rota *</label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Ex: Ir para o trabalho"
                          className={`w-full px-4 py-3 ${inputBg} border ${cardBorder} rounded-xl ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                        />
                      </div>

                      {/* Category selector */}
                      <div>
                        <label className={`block ${textSecondary} text-xs mb-1.5 font-medium`}>Categoria</label>
                        <div className="grid grid-cols-5 gap-2">
                          {(Object.entries(CATEGORY_CONFIG) as [PlannedRouteCategory, typeof CATEGORY_CONFIG["home"]][]).map(([key, config]) => {
                            const CIcon = config.icon;
                            const isSelected = formCategory === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setFormCategory(key)}
                                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all active:scale-95 ${
                                  isSelected
                                    ? `${isDark ? config.bgDark : config.bgLight} border-current ${config.color}`
                                    : `${isDark ? "bg-white/[0.04] border-white/10" : "bg-gray-50 border-gray-100"}`
                                }`}
                              >
                                <CIcon className={`w-5 h-5 ${isSelected ? config.color : textSecondary}`} />
                                <span className={`text-[10px] font-medium ${isSelected ? config.color : textSecondary}`}>
                                  {config.label.split("/")[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Origin */}
                      <div>
                        <label className={`block ${textSecondary} text-xs mb-1.5 font-medium`}>Origem *</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formOrigin}
                            onChange={(e) => setFormOrigin(e.target.value)}
                            placeholder="De onde você sai?"
                            className={`w-full px-4 py-3 ${inputBg} border ${cardBorder} rounded-xl ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 pr-16`}
                          />
                          <button
                            type="button"
                            onClick={() => setFormOrigin("Condomínio Reserva da Cidade, Cidade Nova 2")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#2b7fff] rounded-lg text-white text-[10px] active:scale-95 transition"
                          >
                            Atual
                          </button>
                        </div>
                      </div>

                      {/* Destination */}
                      <div>
                        <label className={`block ${textSecondary} text-xs mb-1.5 font-medium`}>Destino *</label>
                        <input
                          type="text"
                          value={formDestination}
                          onChange={(e) => setFormDestination(e.target.value)}
                          placeholder="Para onde você vai?"
                          className={`w-full px-4 py-3 ${inputBg} border ${cardBorder} rounded-xl ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                        />
                      </div>

                      {/* Time */}
                      <div>
                        <label className={`block ${textSecondary} text-xs mb-1.5 font-medium`}>Horário programado</label>
                        <div className="relative">
                          <IconClock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                          <input
                            type="time"
                            value={formTime}
                            onChange={(e) => setFormTime(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${cardBorder} rounded-xl ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                          />
                        </div>
                      </div>

                      {/* Days of week */}
                      <div>
                        <label className={`block ${textSecondary} text-xs mb-1.5 font-medium`}>Dias da semana</label>
                        <div className="flex gap-2">
                          {DAYS_OF_WEEK.map((day, dIdx) => {
                            const isSelected = formDays.includes(day.key);
                            return (
                              <button
                                key={`form-${day.key}-${dIdx}`}
                                type="button"
                                onClick={() => toggleFormDay(day.key)}
                                className={`flex-1 h-10 rounded-xl flex items-center justify-center text-xs font-medium transition-all active:scale-90 ${
                                  isSelected
                                    ? "bg-[#2b7fff] text-white"
                                    : `${isDark ? "bg-white/[0.06] text-white/40" : "bg-gray-100 text-gray-400"}`
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                        {/* Quick presets */}
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setFormDays(["seg", "ter", "qua", "qui", "sex"])}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition active:scale-95 ${
                              formDays.length === 5 && !formDays.includes("sab")
                                ? "bg-[#2b7fff]/15 text-[#2b7fff]"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            Dias úteis
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormDays(["sab", "dom"])}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition active:scale-95 ${
                              formDays.length === 2 && formDays.includes("sab")
                                ? "bg-[#2b7fff]/15 text-[#2b7fff]"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            Fim de semana
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormDays(["seg", "ter", "qua", "qui", "sex", "sab", "dom"])}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition active:scale-95 ${
                              formDays.length === 7
                                ? "bg-[#2b7fff]/15 text-[#2b7fff]"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            Todos
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className={`px-5 py-4 border-t ${cardBorder} flex-shrink-0`} style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
                      <button
                        onClick={handleSavePlanned}
                        disabled={!formName.trim() || !formOrigin.trim() || !formDestination.trim()}
                        className="w-full bg-[#2b7fff] text-white py-3.5 rounded-xl text-sm font-medium active:scale-[0.98] transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <IconCheck className="w-4 h-4" />
                        {editingPlanned ? "Salvar alterações" : "Criar rota planejada"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Favorite Routes */}
            {favoriteRoutes.length > 0 && (
              <div>
                <h3 className={`${textSecondary} text-sm mb-3 flex items-center gap-2`}>
                  <IconHeart className="w-4 h-4 text-pink-500" />
                  {t("routes.favoriteRoutes", language)}
                </h3>
                <div className="space-y-2">
                  {favoriteRoutes.map((fav) => (
                    <motion.div key={fav.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`${cardBg} border ${cardBorder} rounded-xl p-3.5`}>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`${textPrimary} text-sm font-bold truncate`}>{fav.name}</p>
                          <p className={`${textSecondary} text-xs truncate`}>{fav.origin} → {fav.destination}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs ${textSecondary}`}>{fav.distance}</span>
                            <span className={`text-xs ${textSecondary}`}>{fav.time}</span>
                            <span className={`text-xs ${fav.safetyScore >= 80 ? "text-green-500" : fav.safetyScore >= 60 ? "text-yellow-500" : "text-red-500"}`}>
                              {fav.safetyScore}%
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => { removeFavoriteRoute(fav.id); toast("Rota removida dos favoritos"); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-white/[0.06] hover:bg-white/10" : "bg-gray-50 hover:bg-gray-100"} active:scale-90 transition`}
                        >
                          <IconTrash className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => { setShowResults(false); setSelectedRouteIdx(null); }} className={`flex items-center gap-2 ${textSecondary} mb-2 active:scale-95 transition text-sm`}>
              <IconArrowLeft className="w-4 h-4" />
              <span>{t("routes.newSearch", language)}</span>
            </button>

            <div className={`${cardBg} border ${cardBorder} p-3.5 rounded-xl`}>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-2.5 h-2.5 bg-[#2b7fff] rounded-full" />
                <div className={`text-sm ${textSecondary}`}><strong className={textPrimary}>De:</strong> {origin}</div>
              </div>
              <div className={`border-t ${cardBorder} my-0`} />
              <div className="flex items-center gap-3 mt-2.5">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                <div className={`text-sm ${textSecondary}`}><strong className={textPrimary}>Para:</strong> {destination}</div>
              </div>
            </div>

            {routes.map((route, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <div className={`${cardBg} border ${cardBorder} p-4 rounded-2xl`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getRouteIconStyle(route.icon)}`}>
                        {route.icon === "🛡️" && <IconShieldCheck className="w-5 h-5" />}
                        {route.icon === "⚖️" && <IconScale className="w-5 h-5" />}
                        {route.icon === "⚡" && <IconBolt className="w-5 h-5" />}
                      </span>
                      <div className="min-w-0">
                        <div className={`${textPrimary} text-[15px]`}>{route.name}</div>
                        <div className={`${textSecondary} text-xs`}>{route.description}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                      {idx === 0 && <div className="bg-green-500/10 text-green-600 text-[11px] px-2.5 py-1 rounded-full">Recomendada</div>}
                      {route.warnings > 0 && (
                        <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 text-[11px] px-2.5 py-1 rounded-full">
                          <IconAlertTriangle className="w-3 h-3" />
                          {route.warnings} {route.warnings === 1 ? "alerta" : "alertas"}
                        </div>
                      )}
                      {route.warnings === 0 && idx !== 0 && (
                        <div className="flex items-center gap-1 bg-green-500/10 text-green-600 text-[11px] px-2.5 py-1 rounded-full">
                          <IconCheck className="w-3 h-3" />
                          Seguro
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { val: route.distance, label: "Distância", icon: IconRuler },
                      { val: route.time, label: "Tempo", icon: IconClock },
                      { val: `${route.safetyScore}%`, label: "Segurança", icon: IconShield },
                    ].map((s) => {
                      const StatIcon = s.icon;
                      return (
                        <div key={s.label} className={`${theme === "dark" ? "bg-white/[0.04]" : "bg-gray-50"} rounded-lg p-2 text-center`}>
                          <StatIcon className={`w-3 h-3 mx-auto mb-0.5 ${textSecondary}`} />
                          <div className={`text-sm ${textPrimary}`}>{s.val}</div>
                          <div className={`text-[10px] ${textSecondary}`}>{s.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={() => setSelectedRouteIdx(idx)} className={`w-full py-2.5 rounded-lg active:scale-[0.98] transition text-sm flex items-center justify-center gap-2 ${
                    idx === 0 ? "bg-green-500 text-white" :
                    idx === 1 ? "bg-amber-500 text-white" :
                    "bg-red-500 text-white"
                  }`}>
                    {t("routes.viewDetails", language)}
                  </button>
                </div>
              </motion.div>
            ))}

            <div className={`${theme === "dark" ? "bg-white/[0.03]" : "bg-gray-50"} border ${cardBorder} p-4 rounded-xl`}>
              <div className="flex items-start gap-3">
                <IconAlertTriangle className={`w-4 h-4 ${textSecondary} mt-0.5 flex-shrink-0`} />
                <div className={`text-xs ${textSecondary} leading-relaxed`}>
                  <strong className={textPrimary}>{t("routes.important", language)}</strong> {t("routes.disclaimer", language)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}