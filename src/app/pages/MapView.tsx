import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, Incident } from "../context/AppContext";
import L from "leaflet";
import { toast } from "sonner";
import { t, formatDistanceWithUnit } from "../context/translations";
import { useNavigate } from "react-router";
import {
  IconSearch,
  IconX,
  IconMapPin,
  IconClock,
  IconPlus,
  IconShieldFilled,
  IconCarFilled,
  IconSettingsFilled,
  IconMessageCircleFilled,
  IconAlertTriangle,
  IconAlertOctagon,
  IconWallet,
  IconHandStop,
  IconBadge,
  IconTrafficLights,
  IconBolt,
  IconBarrierBlock,
  IconBan,
  IconDroplet,
  IconBulbOff,
  IconCrane,
  IconWheelchair,
  IconSos,
  IconCamera,
  IconGasStation,
  IconCloudStorm,
  IconMapPinOff,
  IconSend,
  IconHome,
  IconBuilding,
  IconCurrentLocation,
} from "@tabler/icons-react";

// ─── Haversine distance (meters) ───
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Risk zone radius by severity ───
const RISK_RADII: Record<string, number> = {
  low: 80,
  medium: 120,
  high: 180,
  critical: 250,
};

// ─── Color map for incident types ───
const INCIDENT_COLORS: Record<string, string> = {
  crime: "#EF4444",
  "danger-zone": "#DC2626",
  theft: "#F97316",
  assault: "#B91C1C",
  flood: "#3B82F6",
  "no-light": "#8B5CF6",
  construction: "#F59E0B",
  obstacle: "#6B7280",
  accessibility: "#6366F1",
};

// ─── Security-related types (show as risk zones) ───
const SECURITY_TYPES = ["crime", "danger-zone", "theft", "assault"];

// ─── Alert Categories Data ───
const ALERT_CATEGORIES = [
  {
    group: "Seguranca",
    color: "#EF4444",
    icon: <IconShieldFilled size={18} />,
    items: [
      { id: "crime", label: "Inseguranca", color: "#EF4444", icon: <IconAlertTriangle size={22} /> },
      { id: "danger-zone", label: "Zona Perigosa", color: "#EF4444", icon: <IconAlertOctagon size={22} /> },
      { id: "theft", label: "Roubo/Furto", color: "#EF4444", icon: <IconWallet size={22} /> },
      { id: "assault", label: "Assalto", color: "#EF4444", icon: <IconHandStop size={22} /> },
      { id: "police", label: "Policia", color: "#EF4444", icon: <IconBadge size={22} /> },
    ],
  },
  {
    group: "Transito",
    color: "#F97316",
    icon: <IconCarFilled size={18} />,
    items: [
      { id: "traffic", label: "Transito", color: "#F59E0B", icon: <IconTrafficLights size={22} /> },
      { id: "accident", label: "Acidente", color: "#F97316", icon: <IconBolt size={22} /> },
      { id: "blocked", label: "Faixa Bloqueada", color: "#EA580C", icon: <IconBarrierBlock size={22} /> },
      { id: "closed-road", label: "Via Interditada", color: "#C2410C", icon: <IconBan size={22} /> },
    ],
  },
  {
    group: "Infraestrutura",
    color: "#6366F1",
    icon: <IconSettingsFilled size={18} />,
    items: [
      { id: "flood", label: "Alagamento", color: "#3B82F6", icon: <IconDroplet size={22} /> },
      { id: "no-light", label: "Sem Iluminacao", color: "#8B5CF6", icon: <IconBulbOff size={22} /> },
      { id: "construction", label: "Obras", color: "#3B82F6", icon: <IconCrane size={22} /> },
      { id: "accessibility", label: "Acessibilidade", color: "#3B82F6", icon: <IconWheelchair size={22} /> },
      { id: "obstacle", label: "Obstaculo", color: "#3B82F6", icon: <IconBarrierBlock size={22} /> },
    ],
  },
  {
    group: "Outros",
    color: "#6B7280",
    icon: <IconMessageCircleFilled size={18} />,
    items: [
      { id: "sos", label: "SOS", color: "#EF4444", icon: <IconSos size={22} /> },
      { id: "camera", label: "Camera", color: "#6B7280", icon: <IconCamera size={22} /> },
      { id: "fuel", label: "Combustivel", color: "#3B82F6", icon: <IconGasStation size={22} /> },
      { id: "climate", label: "Clima", color: "#6B7280", icon: <IconCloudStorm size={22} /> },
      { id: "map-error", label: "Erro no Mapa", color: "#8B5CF6", icon: <IconMapPinOff size={22} /> },
    ],
  },
];

// ─── Map Layer Filters ───
const LAYER_FILTERS = [
  { key: "floods" as const, label: "Alagamentos", color: "#3B82F6", icon: <IconDroplet size={15} /> },
  { key: "attention" as const, label: "Atencao", color: "#F59E0B", icon: <IconAlertTriangle size={15} /> },
  { key: "accessibility" as const, label: "Acessibilidade", color: "#3B82F6", icon: <IconWheelchair size={15} /> },
  { key: "noLight" as const, label: "Sem Luz", color: "#8B5CF6", icon: <IconBulbOff size={15} /> },
  { key: "construction" as const, label: "Obras", color: "#F59E0B", icon: <IconCrane size={15} /> },
  { key: "crimeZones" as const, label: "Zonas de Risco", color: "#EF4444", icon: <IconAlertOctagon size={15} /> },
];

// ─── Recent locations mock data ───
const RECENT_LOCATIONS = [
  { id: "1", name: "R.Laurentino, n26", address: "26 Rua Laurentino, Cidade Nova 2, AM" },
  { id: "2", name: "Av. Beira Mar, n12", address: "12 Av. Beira Mar, Centro, Coroado, AM" },
];

const SUGGESTIONS = [
  { id: "1", name: "R.Laurentino, n26", address: "26 Rua Laurentino, Cidade Nova 2, AM" },
  { id: "2", name: "Av. Beira Mar, n12", address: "12 Av. Beira Mar, Centro, Coroado, AM" },
  { id: "3", name: "Rua 24 de Maio, Centro", address: "Rua 24 de Maio, Centro, Manaus, AM" },
  { id: "4", name: "Teatro Amazonas", address: "Largo de Sao Sebastiao, Centro", distance: "1.2 km" },
  { id: "5", name: "Manauara Shopping", address: "Av. Mario Ypiranga, 4390 - Adrianopolis", distance: "3.5 km" },
  { id: "6", name: "Arena da Amazonia", address: "Av. Constantino Nery, Flores", distance: "4.1 km" },
];

// ─── Severity data ───
const SEVERITY_LEVELS = [
  { id: "low", label: "Baixo", dots: 1, color: "#6B7280" },
  { id: "medium", label: "Medio", dots: 2, color: "#F59E0B" },
  { id: "high", label: "Alto", dots: 3, color: "#F97316" },
  { id: "critical", label: "Critico", dots: 4, color: "#EF4444" },
];

// ─── Filter which incidents are visible based on map layer toggles ───
function filterVisibleIncidents(
  incidents: Incident[],
  mapLayers: Record<string, boolean>
): Incident[] {
  return incidents.filter((inc) => {
    if (inc.status !== "active") return false;
    if (SECURITY_TYPES.includes(inc.type) && !mapLayers.crimeZones) return false;
    if (inc.type === "flood" && !mapLayers.floods) return false;
    if (inc.type === "no-light" && !mapLayers.noLight) return false;
    if (inc.type === "construction" && !mapLayers.construction) return false;
    if (inc.type === "accessibility" && !mapLayers.accessibility) return false;
    return true;
  });
}

// ═══════════════════════════════════════
// ═══ PROXIMITY ALERT TYPES ═══
// ═══════════════════════════════════════
interface ProximityInfo {
  level: "pre-alert" | "alert";
  incident: Incident;
  distance: number;
}

export function MapView() {
  const { mapLayers, toggleMapLayer, addIncident, userLocation, incidents, theme, language, distanceUnit } = useApp();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  // Theme-aware classes for overlays
  const sheetBg = isDark ? "bg-[#1f2937]" : "bg-white";
  const sheetText = isDark ? "text-white" : "text-[#101828]";
  const sheetTextSec = isDark ? "text-gray-400" : "text-[#4a5565]";
  const sheetTextMuted = isDark ? "text-gray-500" : "text-[#9ca3af]";
  const sheetInputBg = isDark ? "bg-gray-800" : "bg-[#f3f4f6]";
  const sheetBorder = isDark ? "border-gray-700" : "border-[rgba(122,122,122,0.15)]";
  const sheetCardBg = isDark ? "bg-gray-800" : "bg-[#f8f9fa]";
  const sheetDarkTitle = isDark ? "text-white" : "text-[#0a2540]";
  const sheetCardBorder = isDark ? "border-gray-600" : "border-[#e5e7eb]";

  // View states
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAlertType, setSelectedAlertType] = useState<string | null>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [proximityAlert, setProximityAlert] = useState<ProximityInfo | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Alert details form
  const [severity, setSeverity] = useState("high");
  const [description, setDescription] = useState("");

  // Map center
  const lat = userLocation?.lat || -3.119;
  const lng = userLocation?.lng || -60.021;

  // ═══ Leaflet direct integration (no react-leaflet) ═══
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const overlayLayerRef = useRef<L.LayerGroup | null>(null);

  // Visible incidents
  const visibleIncidents = useMemo(
    () => filterVisibleIncidents(incidents, mapLayers),
    [incidents, mapLayers]
  );

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org/copyright">OSM</a>',
    }).addTo(map);

    overlayLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Force a resize after mount to fix grey tiles
    const resizeTimer = setTimeout(() => {
      if (mapRef.current) {
        try {
          mapRef.current.invalidateSize();
        } catch (_) {
          // Map may have been removed before timeout fired
        }
      }
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
      overlayLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const pos: L.LatLngExpression = [userLocation.lat, userLocation.lng];

    // Blue accuracy circle
    if (userCircleRef.current) {
      userCircleRef.current.setLatLng(pos);
    } else {
      userCircleRef.current = L.circle(pos, {
        radius: 50,
        color: "#2b7fff",
        fillColor: "#2b7fff",
        fillOpacity: 0.08,
        weight: 1,
        opacity: 0.3,
      }).addTo(map);
    }

    // Blue dot marker
    const icon = L.divIcon({
      className: "",
      html: '<div class="user-location-dot"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(pos);
    } else {
      userMarkerRef.current = L.marker(pos, { icon, zIndexOffset: 1000 }).addTo(map);
    }
  }, [userLocation]);

  // Pan map when user location changes significantly
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    map.setView([userLocation.lat, userLocation.lng], map.getZoom(), { animate: true });
  }, [userLocation]);

  // Render incident overlays (zones + markers)
  useEffect(() => {
    const layer = overlayLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    visibleIncidents.forEach((inc) => {
      const color = INCIDENT_COLORS[inc.type] || "#6B7280";
      const radius = RISK_RADII[inc.severity] || 120;
      const isSecurityZone = SECURITY_TYPES.includes(inc.type);
      const isNear = proximityAlert?.incident.id === inc.id;
      const center: L.LatLngExpression = [inc.location.lat, inc.location.lng];

      // Risk zone circle
      const zoneCircle = L.circle(center, {
        radius,
        color,
        fillColor: color,
        fillOpacity: isNear ? 0.25 : 0.12,
        weight: isNear ? 2.5 : 1.5,
        opacity: isNear ? 0.9 : 0.5,
        dashArray: isSecurityZone ? undefined : "6 4",
        className: isNear ? "risk-zone-pulse" : undefined,
      });
      layer.addLayer(zoneCircle);

      // Incident dot marker
      const dot = L.circleMarker(center, {
        radius: 6,
        color: "white",
        fillColor: color,
        fillOpacity: 1,
        weight: 2,
      });

      const severityLabel =
        inc.severity === "critical" ? "Critico" :
        inc.severity === "high" ? "Alto" :
        inc.severity === "medium" ? "Medio" : "Baixo";

      dot.bindPopup(
        `<div style="font-family:Poppins,sans-serif;min-width:160px">` +
        `<p style="font-size:13px;font-weight:700;color:#0a2540;margin:0 0 2px">${inc.description || inc.type}</p>` +
        `<p style="font-size:11px;color:#6B7280;margin:0 0 4px">${inc.location.address}</p>` +
        `<div style="display:flex;align-items:center;gap:6px">` +
        `<span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>` +
        `<span style="font-size:10px;font-weight:500;color:${color}">${severityLabel}</span>` +
        `<span style="font-size:10px;color:#9ca3af;margin-left:4px">${inc.confirmations} confirmacoes</span>` +
        `</div></div>`,
        { closeButton: false, className: "leaflet-popup-custom" }
      );
      layer.addLayer(dot);
    });
  }, [visibleIncidents, proximityAlert]);

  // ═══ Proximity detection ═══
  useEffect(() => {
    if (!userLocation) return;

    let closest: ProximityInfo | null = null;

    for (const inc of visibleIncidents) {
      if (dismissedAlerts.has(inc.id)) continue;
      const dist = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        inc.location.lat,
        inc.location.lng
      );
      const zoneRadius = RISK_RADII[inc.severity] || 120;

      if (dist <= zoneRadius) {
        if (!closest || dist < closest.distance) {
          closest = { level: "alert", incident: inc, distance: dist };
        }
      } else if (dist <= zoneRadius + 200) {
        if (!closest || (closest.level !== "alert" && dist < closest.distance)) {
          closest = { level: "pre-alert", incident: inc, distance: dist };
        }
      }
    }

    setProximityAlert(closest);
  }, [userLocation, visibleIncidents, dismissedAlerts]);

  const handleSelectAlertType = (typeId: string) => {
    setSelectedAlertType(typeId);
    setShowAlertModal(false);
    setShowAlertDetails(true);
  };

  const getAlertInfo = (typeId: string) => {
    for (const cat of ALERT_CATEGORIES) {
      const item = cat.items.find((i) => i.id === typeId);
      if (item) return { ...item, group: cat.group };
    }
    return null;
  };

  const handleSubmitAlert = useCallback(() => {
    if (!selectedAlertType) return;
    addIncident({
      type: selectedAlertType as any,
      severity: severity as any,
      location: {
        lat: userLocation?.lat || -3.119,
        lng: userLocation?.lng || -60.021,
        address: "Proximo a sua localizacao",
      },
      description: description || undefined,
      reportedBy: "Usuario",
    });
    setShowAlertDetails(false);
    setSelectedAlertType(null);
    setSeverity("high");
    setDescription("");
    toast.success("Alerta enviado com sucesso!");
  }, [selectedAlertType, severity, description, addIncident, userLocation]);

  const dismissProximityAlert = useCallback(() => {
    if (proximityAlert) {
      setDismissedAlerts((prev) => new Set(prev).add(proximityAlert.incident.id));
      setProximityAlert(null);
    }
  }, [proximityAlert]);

  const handleRecenter = useCallback(() => {
    const map = mapRef.current;
    if (map && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
    }
    toast("Centralizando no GPS...");
  }, [userLocation]);

  return (
    <div className="h-full w-full relative bg-[#eee] overflow-hidden lg:flex">
      {/* ══ Leaflet Map Container (direct API) ═══ */}
      <div ref={mapContainerRef} className="absolute inset-0 lg:static lg:flex-1 z-0" />

      {/* ═══ Proximity Alert Banner ═══ */}
      <AnimatePresence>
        {proximityAlert && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-0 left-0 right-0 z-[25] safe-area-top"
          >
            <div
              className={`mx-3 mt-[42px] rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-xl ${
                proximityAlert.level === "alert"
                  ? "bg-red-600/95"
                  : "bg-amber-500/95"
              }`}
              style={{
                animation:
                  proximityAlert.level === "alert"
                    ? "alert-flash 1.5s ease-in-out infinite"
                    : "none",
              }}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  proximityAlert.level === "alert"
                    ? "bg-white/20"
                    : "bg-white/25"
                }`}
              >
                {proximityAlert.level === "alert" ? (
                  <IconAlertOctagon size={22} className="text-white" />
                ) : (
                  <IconAlertTriangle size={22} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[14px] font-bold font-['Poppins'] leading-tight">
                  {proximityAlert.level === "alert"
                    ? t("mapview.riskZone", language)
                    : t("mapview.riskNearby", language)}
                </p>
                <p className="text-white/80 text-[12px] font-['Poppins'] leading-tight mt-0.5 truncate">
                  {proximityAlert.incident.description ||
                    proximityAlert.incident.location.address}
                </p>
                <p className="text-white/60 text-[11px] font-['Poppins'] mt-0.5">
                  {formatDistanceWithUnit(proximityAlert.distance, distanceUnit)} {t("mapview.distanceAway", language)}
                </p>
              </div>
              <button
                onClick={dismissProximityAlert}
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 active:scale-90 transition"
              >
                <IconX size={16} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Full-screen red overlay when inside a risk zone ═══ */}
      <AnimatePresence>
        {proximityAlert?.level === "alert" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background:
                "radial-gradient(circle at center, transparent 30%, rgba(220, 38, 38, 0.12) 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══ Top blue glow (from Figma) ═══ */}
      <div className="absolute top-0 left-0 right-0 h-[86px] bg-[#2b7fff] opacity-10 blur-[64px] rounded-full pointer-events-none z-[5]" />

      {/* ═══ Layers Button (top right) ═══ */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-[37px] right-3 lg:top-6 lg:right-[420px] xl:right-[480px] w-[50px] h-[50px] lg:w-14 lg:h-14 bg-[rgba(10,37,64,0.5)] rounded-[16px] lg:rounded-2xl flex items-center justify-center z-10 active:scale-95 transition hover:bg-[rgba(10,37,64,0.7)]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12.83 2.18C12.57 2.06 12.29 2 12 2C11.71 2 11.43 2.06 11.17 2.18L2.6 6.08C2.42 6.16 2.27 6.29 2.17 6.45C2.06 6.61 2 6.8 2 7C2 7.19 2.06 7.38 2.17 7.54C2.27 7.7 2.42 7.83 2.6 7.91L11.18 11.82C11.44 11.94 11.72 12 12.01 12C12.29 12 12.57 11.94 12.83 11.82L21.42 7.92C21.6 7.84 21.75 7.71 21.85 7.55C21.96 7.39 22.02 7.2 22.02 7C22.02 6.81 21.96 6.62 21.85 6.46C21.75 6.3 21.6 6.17 21.42 6.09L12.83 2.18Z"
            fill="white"
            fillOpacity="0.8"
          />
          <path
            d="M2 12C2 12.19 2.05 12.38 2.16 12.54C2.26 12.7 2.41 12.83 2.58 12.91L11.18 16.82C11.44 16.94 11.72 17 12 17C12.29 17 12.57 16.94 12.83 16.82L21.41 12.92C21.59 12.84 21.74 12.71 21.84 12.55C21.95 12.38 22 12.19 22 12"
            stroke="white"
            strokeOpacity="0.8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17C2 17.19 2.05 17.38 2.16 17.54C2.26 17.7 2.41 17.83 2.58 17.91L11.18 21.82C11.44 21.94 11.72 22 12 22C12.29 22 12.57 21.94 12.83 21.82L21.41 17.92C21.59 17.84 21.74 17.71 21.84 17.55C21.95 17.38 22 17.19 22 17"
            stroke="white"
            strokeOpacity="0.8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ═══ Recenter Button (top right, below layers) ═══ */}
      <button
        onClick={handleRecenter}
        className="absolute top-[96px] right-3 lg:top-[104px] lg:right-[420px] xl:right-[480px] w-[50px] h-[50px] lg:w-14 lg:h-14 bg-[rgba(10,37,64,0.5)] rounded-[16px] lg:rounded-2xl flex items-center justify-center z-10 active:scale-95 transition hover:bg-[rgba(10,37,64,0.7)]"
      >
        <IconCurrentLocation size={22} className="text-white/80" />
      </button>

      {/* ═══ Filters Overlay ═══ */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-[37px] right-[74px] lg:top-6 lg:right-[484px] xl:right-[544px] ${sheetBg} rounded-2xl shadow-xl z-20 p-3 w-[214px] lg:w-60`}
          >
            <p className={`${sheetText} text-[13px] font-bold font-['Poppins'] mb-2 px-2 pb-2 border-b ${isDark ? "border-gray-700" : "border-[#f3f4f6]"}`}>
              {t("mapview.mapLayers", language)}
            </p>
            {LAYER_FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => toggleMapLayer(filter.key)}
                className="w-full flex items-center gap-3 py-2"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: filter.color + "20", color: filter.color }}
                >
                  {filter.icon}
                </div>
                <span className={`flex-1 text-left text-[13px] font-medium font-['Poppins'] ${mapLayers[filter.key] ? sheetText : sheetTextMuted}`}>
                  {filter.label}
                </span>
                <div
                  className="w-10 h-5 rounded-full transition-colors relative"
                  style={{
                    backgroundColor: mapLayers[filter.key] ? filter.color : "transparent",
                    border: mapLayers[filter.key] ? "none" : "1.5px solid #d1d5dc",
                  }}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      mapLayers[filter.key] ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Alert FAB (gradient orange) ═══ */}
      <button
        onClick={() => setShowAlertModal(true)}
        className="absolute right-4 bottom-[380px] lg:bottom-8 lg:left-auto lg:right-[420px] xl:right-[480px] w-14 h-14 lg:w-16 lg:h-16 rounded-full shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] flex items-center justify-center z-10 active:scale-90 transition"
        style={{ backgroundImage: "linear-gradient(135deg, #FF8904 0%, #F54900 100%)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M21.73 18L13.73 4C13.55 3.69 13.3 3.44 13 3.26C12.69 3.08 12.34 2.99 11.99 2.99C11.64 2.99 11.29 3.08 10.98 3.26C10.68 3.44 10.42 3.69 10.25 4L2.25 18C2.07 18.3 1.98 18.65 1.98 19C1.98 19.36 2.08 19.7 2.25 20.01C2.43 20.31 2.69 20.56 2.99 20.74C3.3 20.91 3.65 21 4 21H20C20.35 21 20.69 20.91 21 20.73C21.3 20.55 21.55 20.3 21.73 20C21.9 19.69 22 19.35 22 19C22 18.65 21.9 18.3 21.73 18Z"
            fill="white"
          />
          <path d="M12 9V13" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 17H12.01" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* ═══ Bottom Sheet / Side Panel ═══ */}
      <div className={`absolute bottom-0 left-0 right-0 lg:relative lg:w-[400px] xl:w-[460px] lg:h-full ${sheetBg} rounded-t-[24px] lg:rounded-none z-10 shadow-[0px_-17px_23px_0px_rgba(0,0,0,0.25)] lg:shadow-none lg:border-l ${isDark ? "lg:border-gray-700" : "lg:border-gray-200"} flex flex-col`}>
        {/* Handle (mobile only) */}
        <div className="lg:hidden flex justify-center pt-3 pb-2">
          <div className={`w-16 h-1.5 ${isDark ? "bg-gray-600" : "bg-[#d1d5dc]"} rounded-full`} />
        </div>

        <div className="px-6 pb-5 lg:py-6 lg:overflow-y-auto lg:flex-1">
          {/* Search Bar */}
          <button
            onClick={() => setShowSearch(true)}
            className={`w-full h-[55px] ${sheetInputBg} rounded-[16px] flex items-center gap-2 px-4 mb-4`}
          >
            <IconSearch className={`w-5 h-5 ${isDark ? "text-gray-500" : "text-[#c2c3ca]"}`} />
            <span className={`${isDark ? "text-gray-500" : "text-[#c2c3ca]"} text-[16px] font-['Poppins']`}>
              {t("mapview.searchPlaceholder", language)}
            </span>
          </button>

          {/* Shortcuts */}
          <div className="flex gap-2 mb-5">
            {/* Casa */}
            <button
              onClick={() => navigate("/routes", { state: { origin: t("mapview.currentLocation", language), destination: "Condomínio Reserva da Cidade, Cidade Nova 2", autoSearch: true } })}
              className={`flex items-center gap-2.5 ${isDark ? "bg-emerald-900/30 border-emerald-800/40" : "bg-[#ecfdf5] border-[#d1fae5]"} rounded-[16px] px-3 py-2 border active:scale-95 transition`}
            >
              <div className="w-8 h-8 bg-[#00BC7D] rounded-[14px] flex items-center justify-center">
                <IconHome size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className={`${sheetText} text-[16px] font-bold font-['Poppins']`}>{t("mapview.home", language)}</p>
                <p className={`${sheetTextSec} text-[9px] font-medium font-['Poppins']`}>Ha 1 min</p>
              </div>
            </button>
            {/* Trabalho */}
            <button
              onClick={() => navigate("/routes", { state: { origin: t("mapview.currentLocation", language), destination: "Centro Empresarial, Av. Eduardo Ribeiro, Centro", autoSearch: true } })}
              className={`flex items-center gap-2.5 ${isDark ? "bg-blue-900/30 border-blue-800/40" : "bg-[#eff6ff] border-[#e4f0ff]"} rounded-[16px] px-3 py-2 border active:scale-95 transition`}
            >
              <div className="w-8 h-8 bg-[#2b7fff] rounded-[14px] flex items-center justify-center">
                <IconBuilding size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className={`${sheetText} text-[16px] font-bold font-['Poppins']`}>{t("mapview.work", language)}</p>
                <p className={`${sheetTextSec} text-[9px] font-medium font-['Poppins']`}>Ha 49 min</p>
              </div>
            </button>
            {/* Novo */}
            <button
              onClick={() => navigate("/routes")}
              className={`flex items-center gap-2.5 ${isDark ? "bg-gray-800 border-gray-700" : "bg-[#f8f8f8] border-[#f8f8f8]"} rounded-[16px] px-3 py-2 border active:scale-95 transition`}
            >
              <div className="w-8 h-8 bg-[#9ba5a6] rounded-[14px] flex items-center justify-center">
                <IconPlus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className={`${sheetText} text-[16px] font-bold font-['Poppins']`}>{t("mapview.new", language)}</p>
                <p className={`${sheetTextSec} text-[9px] font-medium font-['Poppins']`}>{t("mapview.add", language)}</p>
              </div>
            </button>
          </div>

          {/* Recentes */}
          <p className={`${isDark ? "text-gray-500" : "text-[#404751] opacity-[0.36]"} text-[14px] font-semibold font-['Poppins'] mb-3`}>{t("mapview.recents", language)}</p>
          {RECENT_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => navigate("/routes", { state: { origin: t("mapview.currentLocation", language), destination: loc.address, autoSearch: true } })}
              className={`w-full flex items-center gap-2.5 py-3 border-b ${sheetBorder} last:border-0`}
            >
              <div className={`w-8 h-8 ${isDark ? "bg-gray-600" : "bg-[#c0c0c0]"} rounded-full flex items-center justify-center flex-shrink-0`}>
                <IconClock className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className={`${sheetText} text-[15px] font-semibold font-['Poppins']`}>
                  {loc.name}
                </p>
                <p className={`${sheetTextSec} text-[13px] font-medium font-['Poppins']`}>
                  {loc.address}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Fullscreen Search ═══ */}
      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 z-30 lg:flex lg:items-center lg:justify-center"
              onClick={() => setShowSearch(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`absolute inset-0 lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[600px] lg:max-h-[80vh] lg:rounded-3xl ${sheetBg} z-40 flex flex-col lg:shadow-2xl`}
            >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className={`w-16 h-1.5 ${isDark ? "bg-gray-600" : "bg-[#d1d5dc]"} rounded-full`} />
            </div>

            {/* Search input */}
            <div className="px-6 mb-4">
              <div className={`w-full h-[55px] ${sheetInputBg} rounded-[16px] flex items-center gap-2 px-4`}>
                <IconSearch className={`w-5 h-5 ${isDark ? "text-gray-500" : "text-[#c2c3ca]"}`} />
                <input
                  type="text"
                  placeholder={t("mapview.searchPlaceholder", language)}
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      setShowSearch(false);
                      navigate("/routes", { state: { origin: t("mapview.currentLocation", language), destination: searchQuery.trim(), autoSearch: true } });
                    }
                  }}
                  className={`flex-1 bg-transparent text-[16px] font-['Poppins'] ${isDark ? "placeholder:text-gray-500 text-white" : "placeholder:text-[#c2c3ca] text-[#101828]"} focus:outline-none`}
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                  <IconX className={`w-5 h-5 ${sheetTextMuted}`} />
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <div className="px-5 flex-1 overflow-y-auto">
              <p className={`${isDark ? "text-gray-500" : "text-[#404751] opacity-[0.36]"} text-[14px] font-semibold font-['Poppins'] mb-3`}>
                {t("mapview.suggestions", language)}
              </p>
              {SUGGESTIONS.filter((s) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
              }).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setShowSearch(false);
                    navigate("/routes", { state: { origin: t("mapview.currentLocation", language), destination: s.address, autoSearch: true } });
                  }}
                  className={`w-full flex items-center gap-2.5 py-3.5 border-b ${sheetBorder}`}
                >
                  <div className={`w-8 h-8 ${isDark ? "bg-gray-600" : "bg-[#c0c0c0]"} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <IconMapPin className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`${sheetText} text-[15px] font-semibold font-['Poppins']`}>
                      {s.name}
                    </p>
                    <p className={`${sheetTextSec} text-[13px] font-medium font-['Poppins']`}>
                      {s.address}
                    </p>
                  </div>
                  {s.distance && (
                    <span className={`${sheetTextSec} text-[13px] font-['Poppins'] flex-shrink-0`}>
                      {s.distance}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Alert Category Modal ═══ */}
      <AnimatePresence>
        {showAlertModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 z-30 lg:flex lg:items-center lg:justify-center"
              onClick={() => setShowAlertModal(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`absolute bottom-0 left-0 right-0 lg:relative lg:w-[650px] lg:max-h-[85vh] ${sheetBg} rounded-t-3xl lg:rounded-3xl z-40 max-h-[85%] overflow-y-auto lg:shadow-2xl`}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-16 h-1.5 ${isDark ? "bg-gray-600" : "bg-[#d1d5dc]"} rounded-full`} />
              </div>

              <div className="px-5 pb-24">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className={`${sheetDarkTitle} text-[20px] font-bold font-['Poppins']`}>
                      {t("mapview.whatDoYouSee", language)}
                    </h2>
                    <p className={`${sheetTextMuted} text-[13px] font-['Poppins']`}>
                      {t("mapview.selectCategory", language)}
                    </p>
                  </div>
                  <button onClick={() => setShowAlertModal(false)}>
                    <IconX className={`w-6 h-6 ${sheetTextMuted}`} />
                  </button>
                </div>

                {ALERT_CATEGORIES.map((cat) => (
                  <div key={cat.group} className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: cat.color + "20", color: cat.color }}
                      >
                        {cat.icon}
                      </div>
                      <p className={`${sheetDarkTitle} text-[16px] font-bold font-['Poppins']`}>
                        {cat.group}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {cat.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectAlertType(item.id)}
                          className={`flex flex-col items-center gap-2 p-3 ${sheetCardBg} rounded-2xl ${isDark ? "hover:bg-gray-700" : "hover:bg-[#f0f1f3]"} active:scale-95 transition`}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: item.color + "15", color: item.color }}
                          >
                            {item.icon}
                          </div>
                          <span className={`${sheetDarkTitle} text-[12px] font-medium font-['Poppins'] text-center leading-tight`}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Alert Details Modal ═══ */}
      <AnimatePresence>
        {showAlertDetails && selectedAlertType && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 z-30 lg:flex lg:items-center lg:justify-center"
              onClick={() => setShowAlertDetails(false)}
            />

            {/* Risk info banner at top */}
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className="absolute top-0 left-0 right-0 lg:hidden bg-[#0a2540]/90 px-5 py-4 z-40 flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <IconAlertTriangle size={18} className="text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <p className="text-white text-[14px] font-bold font-['Poppins']">
                  Risco Medio - Cidade Nova
                </p>
                <p className="text-white/60 text-[12px] font-['Poppins']">
                  Atencao em paradas de onibus e areas comerciais.
                </p>
                <p className="text-white/40 text-[11px] font-['Poppins']">
                  Furto - Roubo de celular - Pico: 17h - 22h
                </p>
              </div>
              <button onClick={() => setShowAlertDetails(false)}>
                <IconX className="w-5 h-5 text-white/60" />
              </button>
            </motion.div>

            {/* Details bottom sheet / centered modal */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`absolute bottom-0 left-0 right-0 lg:relative lg:w-[600px] lg:max-h-[85vh] ${sheetBg} rounded-t-3xl lg:rounded-3xl z-40 max-h-[70%] overflow-y-auto lg:shadow-2xl`}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-16 h-1.5 ${isDark ? "bg-gray-600" : "bg-[#d1d5dc]"} rounded-full`} />
              </div>

              <div className="px-5 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className={`${sheetDarkTitle} text-[20px] font-bold font-['Poppins']`}>
                      {t("mapview.alertDetails", language)}
                    </h2>
                    <p className={`${sheetTextMuted} text-[13px] font-['Poppins']`}>
                      {t("mapview.adjustSeverity", language)}
                    </p>
                  </div>
                  <button onClick={() => setShowAlertDetails(false)}>
                    <IconX className={`w-6 h-6 ${sheetTextMuted}`} />
                  </button>
                </div>

                {/* Selected alert type card */}
                {(() => {
                  const info = getAlertInfo(selectedAlertType);
                  if (!info) return null;
                  return (
                    <div className={`${sheetCardBg} rounded-2xl p-4 flex items-center gap-3 mb-4`}>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-[22px] flex-shrink-0"
                        style={{ backgroundColor: info.color + "15" }}
                      >
                        {info.icon}
                      </div>
                      <div>
                        <p className={`${sheetDarkTitle} text-[16px] font-bold font-['Poppins']`}>
                          {info.label}
                        </p>
                        <p className={`${sheetTextMuted} text-[13px] font-['Poppins']`}>
                          {info.group === "Seguranca"
                            ? t("mapview.knownRiskArea", language)
                            : info.group === "Transito"
                            ? t("mapview.trafficProblem", language)
                            : info.group === "Infraestrutura"
                            ? t("mapview.infraProblem", language)
                            : t("mapview.generalAlert", language)}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: info.color }}
                          />
                          <span
                            className="text-[11px] font-['Poppins']"
                            style={{ color: info.color }}
                          >
                            {info.group}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Location */}
                <div className="flex items-center gap-2 mb-4">
                  <IconMapPin className={`w-4 h-4 ${sheetTextMuted}`} />
                  <span className={`${sheetTextSec} text-[14px] font-['Poppins']`}>
                    {t("mapview.nearYourLocation", language)}
                  </span>
                </div>

                {/* Severity selector */}
                <p className={`${sheetDarkTitle} text-[15px] font-bold font-['Poppins'] mb-3`}>
                  {t("mapview.severityLevel", language)}
                </p>
                <div className="flex gap-3 mb-5">
                  {SEVERITY_LEVELS.map((level) => {
                    const isActive = severity === level.id;
                    return (
                      <button
                        key={level.id}
                        onClick={() => setSeverity(level.id)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition border ${
                          isActive
                            ? "border-transparent"
                            : `${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-[#e5e7eb]"}`
                        }`}
                        style={
                          isActive
                            ? { backgroundColor: level.color, color: "white" }
                            : {}
                        }
                      >
                        <div className="flex gap-0.5">
                          {Array.from({ length: level.dots }).map((_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: isActive
                                  ? "white"
                                  : level.color,
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className={`text-[12px] font-bold font-['Poppins'] ${
                            isActive ? "text-white" : `${isDark ? "text-gray-400" : "text-[#6B7280]"}`
                          }`}
                        >
                          {level.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Description */}
                <p className={`${sheetDarkTitle} text-[15px] font-bold font-['Poppins'] mb-2`}>
                  {t("mapview.descriptionOptional", language)}
                </p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Ex: "Vi pessoas suspeitas na esquina..."'
                  className={`w-full h-[80px] ${sheetCardBg} rounded-2xl p-4 text-[14px] font-['Poppins'] ${isDark ? "placeholder:text-gray-500 text-white border-gray-600" : "placeholder:text-[#9ca3af] text-[#0a2540] border-[#e5e7eb]"} focus:outline-none border resize-none mb-3`}
                />

                {/* Add photo */}
                <button className={`w-full h-[48px] border ${sheetCardBorder} rounded-2xl flex items-center justify-center gap-2 mb-3`}>
                  <IconCamera size={16} className={sheetTextMuted} />
                  <span className={`${sheetTextMuted} text-[14px] font-['Poppins']`}>
                    {t("mapview.addPhoto", language)}
                  </span>
                </button>

                {/* Points earned */}
                <p className={`text-center text-[13px] font-['Poppins'] ${sheetTextMuted} mb-4`}>
                  <IconBolt size={14} className="inline-block text-[#F97316] -mt-0.5" /> {t("mapview.youWillEarn", language)}{" "}
                  <span className="text-[#F97316] font-bold">
                    +{severity === "low" ? 5 : severity === "medium" ? 10 : severity === "high" ? 15 : 20} {t("mapview.points", language)}
                  </span>
                </p>

                {/* Submit button */}
                <button
                  onClick={handleSubmitAlert}
                  className="w-full h-[56px] rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition shadow-lg"
                  style={{ backgroundImage: "linear-gradient(135deg, #FF8904 0%, #F54900 100%)" }}
                >
                  <IconSend size={20} className="text-white" />
                  <span className="text-white text-[16px] font-bold font-['Poppins']">
                    {t("mapview.sendAlert", language)}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}