import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode, ComponentType } from "react";
import { generateSeedIncidents, SEED_VERSION, SEED_VERSION_KEY } from "../data/seedIncidents";
import { haversineDistance } from "../data/crimeZones";
import { useNotifications } from "../hooks/useNotifications";
import { db, auth } from "../../config/firebase";
import {
  collection, onSnapshot, doc, setDoc, getDoc, addDoc, updateDoc, increment,
  getDocs, writeBatch, query, where,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
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
  type: "flood" | "obstacle" | "accessibility" | "construction" | "no-light" | "crime" | "danger-zone" | "theft" | "assault" | "drug-traffic" | "gang-territory";
  location: { lat: number; lng: number; address: string };
  timestamp: number;
  reportedBy?: string;
  uid?: string;
  official?: boolean;
  permanent?: boolean;
  officialSource?: string;
  nextReviewAt?: number;
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

const INCIDENT_TYPE_LABELS: Record<string, string> = {
  flood: "Alagamento",
  obstacle: "Obstáculo na via",
  accessibility: "Problema de acessibilidade",
  construction: "Obra na via",
  "no-light": "Sem iluminação",
  crime: "Ocorrência policial",
  "danger-zone": "Zona de perigo",
  theft: "Furto/Roubo",
  assault: "Assalto",
  "drug-traffic": "Boca de tráfico",
  "gang-territory": "Território de gangue",
};

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
    condition: (p, incs) => incs.filter((i) => !i.official && (i.uid === p.id || (p.name && i.reportedBy === p.name)) && i.type === "flood").length >= 5,
    progress: (p, incs) => {
      const count = incs.filter((i) => !i.official && (i.uid === p.id || (p.name && i.reportedBy === p.name)) && i.type === "flood").length;
      return { current: Math.min(count, 5), target: 5 };
    },
  },
  {
    id: "accessibility-ally",
    name: "Aliado da Acessibilidade",
    description: "3+ alertas de acessibilidade",
    icon: IconAccessibleFilled,
    gradient: "from-purple-500 to-purple-700",
    category: "reports",
    condition: (p, incs) => incs.filter((i) => !i.official && (i.uid === p.id || (p.name && i.reportedBy === p.name)) && i.type === "accessibility").length >= 3,
    progress: (p, incs) => {
      const count = incs.filter((i) => !i.official && (i.uid === p.id || (p.name && i.reportedBy === p.name)) && i.type === "accessibility").length;
      return { current: Math.min(count, 3), target: 3 };
    },
  },
  {
    id: "safety-guardian",
    name: "Guardiao da Seguranca",
    description: "Reportou zonas de risco",
    icon: IconShieldFilled,
    gradient: "from-red-500 to-red-700",
    category: "safety",
    condition: (p, incs) => incs.some((i) => !i.official && (i.uid === p.id || (p.name && i.reportedBy === p.name)) && ["crime", "danger-zone", "assault", "theft"].includes(i.type)),
    progress: (p, incs) => {
      const count = incs.filter((i) => !i.official && (i.uid === p.id || (p.name && i.reportedBy === p.name)) && ["crime", "danger-zone", "assault", "theft"].includes(i.type)).length;
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
    condition: (p, incs) => incs.some((i) => !i.official && (i.uid === p.id || (p.name && i.reportedBy === p.name)) && i.type === "no-light"),
    progress: (p, incs) => {
      const count = incs.filter((i) => !i.official && (i.uid === p.id || (p.name && i.reportedBy === p.name)) && i.type === "no-light").length;
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
  firebaseSignOut: () => Promise<void>;
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
  setUserLocation: (loc: { lat: number; lng: number }) => void;
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
  dismissedNotifIds: Set<string>;
  readNotifIds: Set<string>;
  dismissNotif: (id: string) => void;
  dismissNotifs: (ids: string[]) => void;
  markNotifRead: (id: string) => void;
  markAllNotifsRead: (ids: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [favoriteRoutes, setFavoriteRoutes] = useState<FavoriteRoute[]>([]);
  // Map<id, unlockedAt timestamp>
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<Map<string, number>>(new Map());
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [mapLayers, setMapLayers] = useState({
    floods: true,
    attention: true,
    accessibility: true,
    noLight: true,
    construction: true,
    crimeZones: true,
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [language, setLanguageState] = useState<Language>("pt");
  const [distanceUnit, setDistanceUnitState] = useState<DistanceUnit>("km");


  const [dismissedNotifIds, setDismissedNotifIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("alertaplus_dismissed_notifs");
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
    } catch { return new Set(); }
  });
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("alertaplus_read_notifs");
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
    } catch { return new Set(); }
  });

  const prevUnlockedRef = useRef<Map<string, number>>(new Map());
  const hasLoadedRef = useRef(false);
  const authUidRef = useRef<string | null>(null);
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const knownIncidentIdsRef = useRef<Set<string>>(new Set());

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
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 5000 }
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

  // Firebase Auth state listener — load profile from Firestore on login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        authUidRef.current = firebaseUser.uid;
        const loginMethod = (firebaseUser.providerData[0]?.providerId === "google.com" ? "google" : "email") as "google" | "email";
        const defaults: UserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Usuário",
          email: firebaseUser.email || "",
          loginMethod,
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
        };

        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const raw = snap.data() as Partial<UserProfile> & {
              achievements?: Record<string, number>;
              favoriteRoutes?: FavoriteRoute[];
              notificationSettings?: Partial<NotificationSettings>;
            };
            const { achievements: achData, favoriteRoutes: favData, notificationSettings: notifData, ...profileData } = raw;
            setUserProfileState({ ...defaults, ...profileData, id: firebaseUser.uid, loginMethod });
            // Load achievements from Firestore
            if (achData) {
              const map = new Map<string, number>();
              Object.entries(achData).forEach(([id, ts]) => map.set(id, ts));
              setUnlockedAchievementIds(map);
              prevUnlockedRef.current = map;
            }
            // Load favorites from Firestore
            if (favData) setFavoriteRoutes(favData);
            // Load notification settings from Firestore
            if (notifData) setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...notifData });
          } else {
            // New user — save defaults to Firestore
            await setDoc(doc(db, "users", firebaseUser.uid), defaults);
            setUserProfileState(defaults);
          }
        } catch {
          // Offline fallback: try localStorage cache
          const cached = localStorage.getItem(`alertaplus_profile_${firebaseUser.uid}`);
          setUserProfileState(cached ? { ...defaults, ...JSON.parse(cached) } : defaults);
        }
        setIsOnboarded(true);
      } else {
        authUidRef.current = null;
        // Logged out — restore anonymous/guest state
        const savedProfile = localStorage.getItem("alertaplus_profile");
        if (savedProfile) {
          try { setUserProfileState(JSON.parse(savedProfile)); } catch { setUserProfileState(null); }
        } else {
          setUserProfileState(null);
        }
      }
    });
    return unsub;
  }, []);

  // Load from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("alertaplus_profile");
    const savedOnboarded = localStorage.getItem("alertaplus_onboarded");
    const savedTheme = localStorage.getItem("alertaplus_theme");
    const savedLanguage = localStorage.getItem("alertaplus_language");
    const savedDistanceUnit = localStorage.getItem("alertaplus_distance_unit");
    const savedFavorites = localStorage.getItem("alertaplus_favorites");
    const savedAchievements = localStorage.getItem("alertaplus_achievements");
    const savedNotifications = localStorage.getItem("alertaplus_notifications");

    try { if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUserProfileState({
        confirmationsGiven: 0,
        denialsGiven: 0,
        routesSearched: 0,
        ...parsed,
      });
    } } catch { /* ignore corrupted profile */ }
    try { if (savedOnboarded) setIsOnboarded(JSON.parse(savedOnboarded)); } catch { /* ignore */ }
    if (savedTheme) setTheme(savedTheme as "light" | "dark");
    if (savedLanguage) setLanguageState(savedLanguage as Language);
    if (savedDistanceUnit) setDistanceUnitState(savedDistanceUnit as DistanceUnit);
    try { if (savedFavorites) setFavoriteRoutes(JSON.parse(savedFavorites)); } catch { /* ignore */ }
    try { if (savedAchievements) {
      const parsed = JSON.parse(savedAchievements);
      const map = new Map<string, number>();
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && typeof parsed[0] === "string") {
          // Legacy format: string[]
          (parsed as string[]).forEach((id) => map.set(id, Date.now()));
        } else {
          // New format: {id, unlockedAt}[]
          (parsed as {id: string; unlockedAt: number}[]).forEach((e) => map.set(e.id, e.unlockedAt));
        }
      }
      setUnlockedAchievementIds(map);
      prevUnlockedRef.current = map;
    } } catch { /* ignore */ }
    try { if (savedNotifications) {
      setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(savedNotifications) });
    } } catch { /* ignore */ }

    // Delay flag so save effects don't fire with initial (empty) state
    queueMicrotask(() => { hasLoadedRef.current = true; });
  }, []);

  // Save profile: Firestore (authenticated) + localStorage cache
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (userProfile) {
      if (userProfile.id && userProfile.loginMethod) {
        // Authenticated user — save to Firestore + localStorage cache
        const { id, ...data } = userProfile;
        updateDoc(doc(db, "users", id), data).catch(() => {
          // Offline — will sync next time
        });
        localStorage.setItem(`alertaplus_profile_${id}`, JSON.stringify(userProfile));
      } else {
        // Anonymous/guest — localStorage only
        localStorage.setItem("alertaplus_profile", JSON.stringify(userProfile));
      }
    } else {
      localStorage.removeItem("alertaplus_profile");
    }
  }, [userProfile]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    localStorage.setItem("alertaplus_onboarded", JSON.stringify(isOnboarded));
  }, [isOnboarded]);

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
    if (hasLoadedRef.current && authUidRef.current) {
      updateDoc(doc(db, "users", authUidRef.current), { favoriteRoutes }).catch(() => {});
    }
  }, [favoriteRoutes]);

  useEffect(() => {
    const entries = [...unlockedAchievementIds.entries()].map(([id, unlockedAt]) => ({ id, unlockedAt }));
    localStorage.setItem("alertaplus_achievements", JSON.stringify(entries));
    if (hasLoadedRef.current && authUidRef.current) {
      const achObj: Record<string, number> = {};
      unlockedAchievementIds.forEach((ts, id) => { achObj[id] = ts; });
      updateDoc(doc(db, "users", authUidRef.current), { achievements: achObj }).catch(() => {});
    }
  }, [unlockedAchievementIds]);

  useEffect(() => {
    localStorage.setItem("alertaplus_notifications", JSON.stringify(notificationSettings));
    if (hasLoadedRef.current && authUidRef.current) {
      updateDoc(doc(db, "users", authUidRef.current), { notificationSettings }).catch(() => {});
    }
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem("alertaplus_dismissed_notifs", JSON.stringify([...dismissedNotifIds]));
  }, [dismissedNotifIds]);

  useEffect(() => {
    localStorage.setItem("alertaplus_read_notifs", JSON.stringify([...readNotifIds]));
  }, [readNotifIds]);

  const dismissNotif = useCallback((id: string) => {
    setDismissedNotifIds((prev) => new Set([...prev, id]));
    setReadNotifIds((prev) => new Set([...prev, id]));
  }, []);

  const dismissNotifs = useCallback((ids: string[]) => {
    setDismissedNotifIds((prev) => new Set([...prev, ...ids]));
    setReadNotifIds((prev) => new Set([...prev, ...ids]));
  }, []);

  const markNotifRead = useCallback((id: string) => {
    setReadNotifIds((prev) => new Set([...prev, id]));
  }, []);

  const markAllNotifsRead = useCallback((ids: string[]) => {
    setReadNotifIds((prev) => new Set([...prev, ...ids]));
  }, []);

  // ============= ACHIEVEMENTS ENGINE =============
  const checkAchievements = useCallback(
    (profile: UserProfile, currentIncidents: Incident[]) => {
      const newlyUnlocked: Achievement[] = [];

      ACHIEVEMENT_DEFS.forEach((def) => {
        if (!prevUnlockedRef.current.has(def.id) && def.condition(profile, currentIncidents)) { // Map.has() works the same as Set.has()
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
          const next = new Map(prev);
          newlyUnlocked.forEach((a) => next.set(a.id, a.unlockedAt!));
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

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const setDistanceUnit = useCallback((unit: DistanceUnit) => {
    setDistanceUnitState(unit);
  }, []);

  // ============= INCIDENTS — Firestore =============

  // Seed Firestore on first load (check version key in localStorage)
  useEffect(() => {
    const seedFirestore = async () => {
      const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
      if (storedVersion === SEED_VERSION) return; // already seeded this version

      const seeds = generateSeedIncidents();
      const batch = writeBatch(db);
      seeds.forEach((inc) => {
        batch.set(doc(db, "incidents", inc.id), inc);
      });
      await batch.commit();
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    };
    seedFirestore().catch(console.error);
  }, []);

  // Keep userLocationRef in sync (used inside onSnapshot closure without re-subscribing)
  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  // Real-time listener + proximity notifications for new incidents
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "incidents"), (snap) => {
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Incident));

      // Notify user about new active incidents within 2 km
      if (
        knownIncidentIdsRef.current.size > 0 &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const loc = userLocationRef.current;
        if (loc) {
          data.forEach((inc) => {
            if (inc.status !== "active" || knownIncidentIdsRef.current.has(inc.id)) return;
            const dist = haversineDistance(loc.lat, loc.lng, inc.location.lat, inc.location.lng);
            if (dist <= 2000) {
              const label = INCIDENT_TYPE_LABELS[inc.type] ?? inc.type;
              new Notification("⚠️ Alerta próximo a você", {
                body: `${label} — ${inc.location.address}`,
                icon: "/favicon.png",
                badge: "/favicon.png",
              });
            }
          });
        }
      }

      knownIncidentIdsRef.current = new Set(data.map((d) => d.id));
      setIncidents(data);
    });
    return unsub;
  }, []);

  // Auto-expiração (atualiza Firestore — idempotente entre clientes)
  useEffect(() => {
    const EXPIRE_AFTER_MS = 4 * 60 * 60 * 1000;
    const EXPIRE_FIXED_MS = 30 * 24 * 60 * 60 * 1000;
    const FIXED_TYPES = ["drug-traffic", "gang-territory"];
    const MIN_DENIALS = 3;

    const check = async () => {
      const now = Date.now();
      const snap = await getDocs(query(collection(db, "incidents"), where("status", "==", "active")));
      const batch = writeBatch(db);
      let changed = false;
      snap.docs.forEach((d) => {
        const inc = d.data() as Incident;
        if (inc.id?.startsWith("seed-") || inc.permanent) return;
        const expireMs = FIXED_TYPES.includes(inc.type) ? EXPIRE_FIXED_MS : EXPIRE_AFTER_MS;
        const tooOld = now - inc.timestamp > expireMs;
        const contested = inc.denials >= MIN_DENIALS && inc.denials > inc.confirmations;
        if (tooOld || contested) {
          batch.update(d.ref, { status: "expired" });
          changed = true;
        }
      });
      if (changed) await batch.commit();
    };

    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const addIncident = useCallback((incident: Omit<Incident, "id" | "timestamp" | "confirmations" | "denials" | "status">) => {
    const raw = {
      ...incident,
      uid: authUidRef.current ?? undefined,
      timestamp: Date.now(),
      confirmations: 1,
      denials: 0,
      status: "active" as const,
    };
    // Firestore rejects undefined values — strip them out
    const newIncident = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined)
    );
    addDoc(collection(db, "incidents"), newIncident).catch(console.error);

    const impactDelta = Math.floor(Math.random() * 5) + 1;
    setUserProfileState((prev) => {
      if (!prev) return prev;
      const pointsMap = { low: 5, medium: 10, high: 15, critical: 20 };
      const points = pointsMap[incident.severity] || 10;
      const newTrust = Math.min(5, prev.trustLevel + (prev.reportsCount % 5 === 4 ? 1 : 0));
      return {
        ...prev,
        points: prev.points + points,
        reportsCount: prev.reportsCount + 1,
        impactCount: prev.impactCount + impactDelta,
        trustLevel: newTrust,
      };
    });
  }, []);

  const confirmIncident = useCallback((id: string) => {
    updateDoc(doc(db, "incidents", id), { confirmations: increment(1) }).catch(console.error);
    setUserProfileState((prev) => {
      if (!prev) return prev;
      return { ...prev, points: prev.points + 5, confirmationsGiven: (prev.confirmationsGiven || 0) + 1 };
    });
  }, []);

  const denyIncident = useCallback((id: string) => {
    updateDoc(doc(db, "incidents", id), { denials: increment(1) }).catch(console.error);
    setUserProfileState((prev) => {
      if (!prev) return prev;
      return { ...prev, denialsGiven: (prev.denialsGiven || 0) + 1 };
    });
  }, []);

  const toggleMapLayer = useCallback((layer: keyof typeof mapLayers) => {
    setMapLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

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

  // FCM: register token for authenticated users + handle foreground messages
  useNotifications(userProfile?.id && userProfile?.loginMethod ? userProfile.id : null);

  // Build unlocked achievements list (Map preserves unlockedAt timestamp)
  const unlockedAchievements: Achievement[] = ACHIEVEMENT_DEFS
    .filter((def) => unlockedAchievementIds.has(def.id))
    .map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      gradient: def.gradient,
      category: def.category,
      unlockedAt: unlockedAchievementIds.get(def.id),
    }));

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        updateUserProfile,
        firebaseSignOut: () => signOut(auth),
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
        setUserLocation,
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
        dismissedNotifIds,
        readNotifIds,
        dismissNotif,
        dismissNotifs,
        markNotifRead,
        markAllNotifsRead,
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