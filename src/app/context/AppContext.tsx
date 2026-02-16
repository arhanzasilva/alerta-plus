import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode, ComponentType } from "react";
import {
  IconFlagFilled,
  IconDropletFilled,
  IconAccessibleFilled,
  IconShieldFilled,
  IconHomeFilled,
  IconMoonFilled,
  IconCircleCheckFilled,
  IconEyeFilled,
  IconBoltFilled,
  IconStarFilled,
  IconTrophyFilled,
  IconMoodHappyFilled,
  IconRosetteDiscountCheckFilled,
  IconCrownFilled,
  IconMapPinFilled,
  IconAwardFilled,
} from "@tabler/icons-react";

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  neighborhood?: string;
  password?: string;
  transportMode: "pedestrian" | "motorcycle" | "car";
  needs: ("wheelchair" | "reduced-mobility" | "stroller")[];
  timePreference: "day" | "night" | "both";
  points: number;
  trustLevel: number;
  badges: string[];
  reportsCount: number;
  impactCount: number;
  confirmationsGiven: number;
  denialsGiven: number;
  routesSearched: number;
  loginMethod?: "email" | "google";
}

export interface Incident {
  id: string;
  type: "flood" | "obstacle" | "accessibility" | "construction" | "no-light" | "crime" | "danger-zone" | "theft" | "assault";
  location: { lat: number; lng: number; address: string };
  timestamp: number;
  reportedBy?: string;
  confirmations: number;
  denials: number;
  photo?: string;
  description?: string;
  status: "active" | "expired" | "resolved";
  severity: "low" | "medium" | "high" | "critical";
}

export interface FavoriteRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: string;
  time: string;
  safetyScore: number;
  gradient: string;
  icon: string;
  risk: string;
  warnings: number;
  savedAt: number;
}

export interface HelpRequest {
  id: string;
  type: string;
  comment: string;
  timestamp: number;
  status: "pending" | "inProgress" | "resolved";
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  gradient: string;
  category: "reports" | "community" | "explorer" | "safety" | "milestone";
  unlockedAt?: number;
}

// Achievement definitions with conditions
export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  gradient: string;
  category: "reports" | "community" | "explorer" | "safety" | "milestone";
  condition: (profile: UserProfile, incidents: Incident[]) => boolean;
  progress: (profile: UserProfile, incidents: Incident[]) => { current: number; target: number };
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first-step",
    name: "Primeiro Passo",
    description: "Fez o primeiro reporte",
    icon: IconFlagFilled,
    gradient: "from-blue-400 to-blue-600",
    category: "reports",
    condition: (p) => p.reportsCount >= 1,
    progress: (p) => ({ current: Math.min(p.reportsCount, 1), target: 1 }),
  },
  {
    id: "rain-guardian",
    name: "Guardiao da Chuva",
    description: "Reportou 5+ alagamentos",
    icon: IconDropletFilled,
    gradient: "from-blue-500 to-cyan-600",
    category: "reports",
    condition: (p) => p.reportsCount >= 5,
    progress: (p) => ({ current: Math.min(p.reportsCount, 5), target: 5 }),
  },
  {
    id: "accessibility-ally",
    name: "Aliado da Acessibilidade",
    description: "3+ alertas de acessibilidade",
    icon: IconAccessibleFilled,
    gradient: "from-purple-500 to-purple-700",
    category: "reports",
    condition: (p) => p.reportsCount >= 3,
    progress: (p) => ({ current: Math.min(p.reportsCount, 3), target: 3 }),
  },
  {
    id: "safety-guardian",
    name: "Guardiao da Seguranca",
    description: "Reportou zonas de risco",
    icon: IconShieldFilled,
    gradient: "from-red-500 to-red-700",
    category: "safety",
    condition: (p, incs) => incs.some((i) => i.reportedBy === p.name && ["crime", "danger-zone", "assault", "theft"].includes(i.type)),
    progress: (p, incs) => {
      const count = incs.filter((i) => i.reportedBy === p.name && ["crime", "danger-zone", "assault", "theft"].includes(i.type)).length;
      return { current: Math.min(count, 1), target: 1 };
    },
  },
  {
    id: "neighborhood-protector",
    name: "Protetor do Bairro",
    description: "10+ contribuicoes",
    icon: IconHomeFilled,
    gradient: "from-green-500 to-green-700",
    category: "community",
    condition: (p) => p.reportsCount >= 10,
    progress: (p) => ({ current: Math.min(p.reportsCount, 10), target: 10 }),
  },
  {
    id: "night-sentinel",
    name: "Sentinela Noturno",
    description: "Reportou falta de iluminacao",
    icon: IconMoonFilled,
    gradient: "from-indigo-500 to-indigo-800",
    category: "safety",
    condition: (p, incs) => incs.some((i) => i.reportedBy === p.name && i.type === "no-light"),
    progress: (p, incs) => {
      const count = incs.filter((i) => i.reportedBy === p.name && i.type === "no-light").length;
      return { current: Math.min(count, 1), target: 1 };
    },
  },
  {
    id: "validator",
    name: "Validador",
    description: "Confirmou 10+ alertas",
    icon: IconCircleCheckFilled,
    gradient: "from-emerald-500 to-emerald-700",
    category: "community",
    condition: (p) => p.confirmationsGiven >= 10,
    progress: (p) => ({ current: Math.min(p.confirmationsGiven, 10), target: 10 }),
  },
  {
    id: "first-validator",
    name: "Olho Atento",
    description: "Confirmou o primeiro alerta",
    icon: IconEyeFilled,
    gradient: "from-teal-400 to-teal-600",
    category: "community",
    condition: (p) => p.confirmationsGiven >= 1,
    progress: (p) => ({ current: Math.min(p.confirmationsGiven, 1), target: 1 }),
  },
  {
    id: "score-100",
    name: "Pontuador",
    description: "Atingiu 100 pontos",
    icon: IconBoltFilled,
    gradient: "from-amber-500 to-amber-700",
    category: "milestone",
    condition: (p) => p.points >= 100,
    progress: (p) => ({ current: Math.min(p.points, 100), target: 100 }),
  },
  {
    id: "hero",
    name: "Heroi de Manaus",
    description: "Atingiu 500 pontos",
    icon: IconStarFilled,
    gradient: "from-yellow-500 to-orange-600",
    category: "milestone",
    condition: (p) => p.points >= 500,
    progress: (p) => ({ current: Math.min(p.points, 500), target: 500 }),
  },
  {
    id: "legend",
    name: "Lenda Urbana",
    description: "Atingiu 1000 pontos",
    icon: IconTrophyFilled,
    gradient: "from-yellow-400 to-yellow-700",
    category: "milestone",
    condition: (p) => p.points >= 1000,
    progress: (p) => ({ current: Math.min(p.points, 1000), target: 1000 }),
  },
  {
    id: "helper",
    name: "Mao Amiga",
    description: "Ajudou 10+ pessoas",
    icon: IconMoodHappyFilled,
    gradient: "from-pink-500 to-pink-700",
    category: "community",
    condition: (p) => p.impactCount >= 10,
    progress: (p) => ({ current: Math.min(p.impactCount, 10), target: 10 }),
  },
  {
    id: "big-helper",
    name: "Anjo da Guarda",
    description: "Ajudou 50+ pessoas",
    icon: IconRosetteDiscountCheckFilled,
    gradient: "from-sky-400 to-blue-600",
    category: "community",
    condition: (p) => p.impactCount >= 50,
    progress: (p) => ({ current: Math.min(p.impactCount, 50), target: 50 }),
  },
  {
    id: "veteran",
    name: "Veterano",
    description: "Nivel de confianca 3+",
    icon: IconAwardFilled,
    gradient: "from-violet-500 to-violet-700",
    category: "milestone",
    condition: (p) => p.trustLevel >= 3,
    progress: (p) => ({ current: Math.min(p.trustLevel, 3), target: 3 }),
  },
  {
    id: "master",
    name: "Mestre Alerta",
    description: "Nivel de confianca maximo",
    icon: IconCrownFilled,
    gradient: "from-yellow-500 to-amber-600",
    category: "milestone",
    condition: (p) => p.trustLevel >= 5,
    progress: (p) => ({ current: Math.min(p.trustLevel, 5), target: 5 }),
  },
  {
    id: "route-planner",
    name: "Planejador",
    description: "Buscou 5+ rotas",
    icon: IconMapPinFilled,
    gradient: "from-cyan-500 to-cyan-700",
    category: "explorer",
    condition: (p) => p.routesSearched >= 5,
    progress: (p) => ({ current: Math.min(p.routesSearched, 5), target: 5 }),
  },
];

export interface NotificationSettings {
  alerts: boolean;
  community: boolean;
  achievements: boolean;
  sound: boolean;
  vibration: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  alerts: true,
  community: true,
  achievements: true,
  sound: true,
  vibration: true,
};

export type Language = "pt" | "en" | "es";
export type DistanceUnit = "km" | "mi";
export type AuthStatus = "guest" | "anonymous" | "authenticated";

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  authStatus: AuthStatus;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
  incidents: Incident[];
  addIncident: (incident: Omit<Incident, "id" | "timestamp" | "confirmations" | "denials" | "status">) => void;
  confirmIncident: (id: string) => void;
  denyIncident: (id: string) => void;
  mapLayers: {
    floods: boolean;
    attention: boolean;
    accessibility: boolean;
    noLight: boolean;
    construction: boolean;
    crimeZones: boolean;
  };
  toggleMapLayer: (layer: keyof AppContextType["mapLayers"]) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
  userLocation: { lat: number; lng: number } | null;
  favoriteRoutes: FavoriteRoute[];
  addFavoriteRoute: (route: FavoriteRoute) => void;
  removeFavoriteRoute: (id: string) => void;
  isFavoriteRoute: (id: string) => boolean;
  unlockedAchievements: Achievement[];
  newAchievements: Achievement[];
  clearNewAchievements: () => void;
  incrementRoutesSearched: () => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  helpRequests: HelpRequest[];
  addHelpRequest: (request: Omit<HelpRequest, "id" | "timestamp" | "status">) => void;
  updateHelpRequestStatus: (id: string, status: HelpRequest["status"]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [favoriteRoutes, setFavoriteRoutes] = useState<FavoriteRoute[]>([]);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<Set<string>>(new Set());
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [mapLayers, setMapLayers] = useState({
    floods: true,
    attention: true,
    accessibility: true,
    noLight: false,
    construction: true,
    crimeZones: true,
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({ lat: -3.1190, lng: -60.0217 });
  const [language, setLanguageState] = useState<Language>("pt");
  const [distanceUnit, setDistanceUnitState] = useState<DistanceUnit>("km");
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);

  const prevUnlockedRef = useRef<Set<string>>(new Set());

  // Derive auth status from profile state
  // guest = no profile (skipped onboarding or not started)
  // anonymous = profile exists but no loginMethod (local-only user)
  // authenticated = profile exists with loginMethod (logged in via email/google)
  const authStatus: AuthStatus = !userProfile
    ? "guest"
    : userProfile.loginMethod
      ? "authenticated"
      : "anonymous";

  // Geolocation: try real position, fallback to Manaus center
  useEffect(() => {
    let watchId: number | undefined;

    try {
      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {},
          { timeout: 5000, maximumAge: 60000 }
        );
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {},
          { enableHighAccuracy: false, maximumAge: 30000 }
        );
      }
    } catch (_e) {
      // keep fallback
    }

    return () => {
      if (watchId !== undefined) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch (_e2) {
          // ignore
        }
      }
    };
  }, []);

  // Load from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("alertaplus_profile");
    const savedOnboarded = localStorage.getItem("alertaplus_onboarded");
    const savedIncidents = localStorage.getItem("alertaplus_incidents");
    const savedTheme = localStorage.getItem("alertaplus_theme");
    const savedLanguage = localStorage.getItem("alertaplus_language");
    const savedDistanceUnit = localStorage.getItem("alertaplus_distance_unit");
    const savedFavorites = localStorage.getItem("alertaplus_favorites");
    const savedAchievements = localStorage.getItem("alertaplus_achievements");
    const savedNotifications = localStorage.getItem("alertaplus_notifications");
    const savedHelpRequests = localStorage.getItem("alertaplus_help_requests");

    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUserProfileState({
        confirmationsGiven: 0,
        denialsGiven: 0,
        routesSearched: 0,
        ...parsed,
      });
    }
    if (savedOnboarded) setIsOnboarded(JSON.parse(savedOnboarded));
    if (savedTheme) setTheme(savedTheme as "light" | "dark");
    if (savedLanguage) setLanguageState(savedLanguage as Language);
    if (savedDistanceUnit) setDistanceUnitState(savedDistanceUnit as DistanceUnit);
    if (savedFavorites) setFavoriteRoutes(JSON.parse(savedFavorites));
    if (savedAchievements) {
      const ids: string[] = JSON.parse(savedAchievements);
      setUnlockedAchievementIds(new Set(ids));
      prevUnlockedRef.current = new Set(ids);
    }
    if (savedNotifications) {
      setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(savedNotifications) });
    }
    if (savedHelpRequests) {
      setHelpRequests(JSON.parse(savedHelpRequests));
    }

    if (savedIncidents) {
      setIncidents(JSON.parse(savedIncidents));
    } else {
      const sampleIncidents: Incident[] = [
        {
          id: "1",
          type: "crime",
          severity: "high",
          location: { lat: -3.119, lng: -60.021, address: "Av. Sete de Setembro, Centro" },
          timestamp: Date.now() - 1800000,
          confirmations: 8,
          denials: 1,
          status: "active",
          description: "Relatos de atividade suspeita na regiao",
        },
        {
          id: "2",
          type: "danger-zone",
          severity: "critical",
          location: { lat: -3.120, lng: -60.022, address: "Praca da Policia, Centro" },
          timestamp: Date.now() - 3600000,
          confirmations: 15,
          denials: 2,
          status: "active",
          description: "Area com alto indice de ocorrencias",
        },
        {
          id: "3",
          type: "theft",
          severity: "medium",
          location: { lat: -3.118, lng: -60.023, address: "Rua 24 de Maio, Centro" },
          timestamp: Date.now() - 900000,
          confirmations: 5,
          denials: 0,
          status: "active",
          description: "Furtos reportados nas ultimas horas",
        },
        {
          id: "4",
          type: "flood",
          severity: "high",
          location: { lat: -3.121, lng: -60.020, address: "Av. Eduardo Ribeiro, Centro" },
          timestamp: Date.now() - 1200000,
          confirmations: 12,
          denials: 1,
          status: "active",
          description: "Alagamento apos chuva forte",
        },
        {
          id: "5",
          type: "no-light",
          severity: "medium",
          location: { lat: -3.117, lng: -60.024, address: "Rua Monsenhor Coutinho" },
          timestamp: Date.now() - 7200000,
          confirmations: 6,
          denials: 0,
          status: "active",
          description: "Postes de luz queimados",
        },
        {
          id: "6",
          type: "assault",
          severity: "critical",
          location: { lat: -3.122, lng: -60.019, address: "Beco do Comercio" },
          timestamp: Date.now() - 2700000,
          confirmations: 10,
          denials: 0,
          status: "active",
          description: "Assaltos frequentes neste horario",
        },
        {
          id: "7",
          type: "construction",
          severity: "low",
          location: { lat: -3.116, lng: -60.025, address: "Av. Getulio Vargas" },
          timestamp: Date.now() - 86400000,
          confirmations: 20,
          denials: 1,
          status: "active",
          description: "Obra de drenagem em andamento",
        },
        {
          id: "8",
          type: "accessibility",
          severity: "medium",
          location: { lat: -3.123, lng: -60.018, address: "Rua Henrique Martins" },
          timestamp: Date.now() - 5400000,
          confirmations: 7,
          denials: 2,
          status: "active",
          description: "Calcada danificada, dificil passagem",
        },
      ];
      setIncidents(sampleIncidents);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("alertaplus_profile", JSON.stringify(userProfile));
    } else {
      localStorage.removeItem("alertaplus_profile");
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("alertaplus_onboarded", JSON.stringify(isOnboarded));
  }, [isOnboarded]);

  useEffect(() => {
    localStorage.setItem("alertaplus_incidents", JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem("alertaplus_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("alertaplus_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("alertaplus_distance_unit", distanceUnit);
  }, [distanceUnit]);

  useEffect(() => {
    localStorage.setItem("alertaplus_favorites", JSON.stringify(favoriteRoutes));
  }, [favoriteRoutes]);

  useEffect(() => {
    localStorage.setItem("alertaplus_achievements", JSON.stringify([...unlockedAchievementIds]));
  }, [unlockedAchievementIds]);

  useEffect(() => {
    localStorage.setItem("alertaplus_notifications", JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem("alertaplus_help_requests", JSON.stringify(helpRequests));
  }, [helpRequests]);

  // ============= ACHIEVEMENTS ENGINE =============
  const checkAchievements = useCallback(
    (profile: UserProfile, currentIncidents: Incident[]) => {
      const newlyUnlocked: Achievement[] = [];

      ACHIEVEMENT_DEFS.forEach((def) => {
        if (!prevUnlockedRef.current.has(def.id) && def.condition(profile, currentIncidents)) {
          newlyUnlocked.push({
            id: def.id,
            name: def.name,
            description: def.description,
            icon: def.icon,
            gradient: def.gradient,
            category: def.category,
            unlockedAt: Date.now(),
          });
        }
      });

      if (newlyUnlocked.length > 0) {
        setUnlockedAchievementIds((prev) => {
          const next = new Set(prev);
          newlyUnlocked.forEach((a) => next.add(a.id));
          prevUnlockedRef.current = next;
          return next;
        });
        setNewAchievements((prev) => [...prev, ...newlyUnlocked]);
      }
    },
    []
  );

  useEffect(() => {
    if (userProfile) {
      checkAchievements(userProfile, incidents);
    }
  }, [userProfile, incidents, checkAchievements]);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  // ============= PROFILE =============
  const setUserProfile = useCallback((profile: UserProfile | null) => {
    setUserProfileState(profile);
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfileState((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const setDistanceUnit = useCallback((unit: DistanceUnit) => {
    setDistanceUnitState(unit);
  }, []);

  // ============= INCIDENTS =============
  const addIncident = useCallback((incident: Omit<Incident, "id" | "timestamp" | "confirmations" | "denials" | "status">) => {
    const newIncident: Incident = {
      ...incident,
      id: Date.now().toString(),
      timestamp: Date.now(),
      confirmations: 1,
      denials: 0,
      status: "active",
    };
    setIncidents((prev) => [newIncident, ...prev]);

    setUserProfileState((prev) => {
      if (!prev) return prev;
      const pointsMap = { low: 5, medium: 10, high: 15, critical: 20 };
      const points = pointsMap[incident.severity] || 10;
      const newTrust = Math.min(5, prev.trustLevel + (prev.reportsCount % 5 === 4 ? 1 : 0));
      return {
        ...prev,
        points: prev.points + points,
        reportsCount: prev.reportsCount + 1,
        impactCount: prev.impactCount + Math.floor(Math.random() * 5) + 1,
        trustLevel: newTrust,
      };
    });
  }, []);

  const confirmIncident = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id ? { ...inc, confirmations: inc.confirmations + 1 } : inc
      )
    );

    setUserProfileState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        points: prev.points + 5,
        confirmationsGiven: (prev.confirmationsGiven || 0) + 1,
      };
    });
  }, []);

  const denyIncident = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id ? { ...inc, denials: inc.denials + 1 } : inc
      )
    );

    setUserProfileState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        denialsGiven: (prev.denialsGiven || 0) + 1,
      };
    });
  }, []);

  const toggleMapLayer = (layer: keyof typeof mapLayers) => {
    setMapLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // ============= FAVORITE ROUTES =============
  const addFavoriteRoute = useCallback((route: FavoriteRoute) => {
    setFavoriteRoutes((prev) => {
      if (prev.some((r) => r.id === route.id)) return prev;
      return [route, ...prev];
    });
  }, []);

  const removeFavoriteRoute = useCallback((id: string) => {
    setFavoriteRoutes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const isFavoriteRoute = useCallback(
    (id: string) => favoriteRoutes.some((r) => r.id === id),
    [favoriteRoutes]
  );

  const incrementRoutesSearched = useCallback(() => {
    setUserProfileState((prev) => {
      if (!prev) return prev;
      return { ...prev, routesSearched: (prev.routesSearched || 0) + 1 };
    });
  }, []);

  const updateNotificationSettingsFn = useCallback((updates: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const addHelpRequest = useCallback((request: Omit<HelpRequest, "id" | "timestamp" | "status">) => {
    const newRequest: HelpRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: Date.now(),
      status: "pending",
    };
    setHelpRequests((prev) => [newRequest, ...prev]);
  }, []);

  const updateHelpRequestStatus = useCallback((id: string, status: HelpRequest["status"]) => {
    setHelpRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status } : req
      )
    );
  }, []);

  // Build unlocked achievements list
  const unlockedAchievements: Achievement[] = ACHIEVEMENT_DEFS
    .filter((def) => unlockedAchievementIds.has(def.id))
    .map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      gradient: def.gradient,
      category: def.category,
    }));

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        updateUserProfile,
        authStatus,
        isOnboarded,
        setIsOnboarded,
        incidents,
        addIncident,
        confirmIncident,
        denyIncident,
        mapLayers,
        toggleMapLayer,
        theme,
        toggleTheme,
        language,
        setLanguage,
        distanceUnit,
        setDistanceUnit,
        userLocation,
        favoriteRoutes,
        addFavoriteRoute,
        removeFavoriteRoute,
        isFavoriteRoute,
        unlockedAchievements,
        newAchievements,
        clearNewAchievements,
        incrementRoutesSearched,
        notificationSettings,
        updateNotificationSettings: updateNotificationSettingsFn,
        helpRequests,
        addHelpRequest,
        updateHelpRequestStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}