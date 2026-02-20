import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconArrowUp,
  IconArrowUpRight,
  IconArrowUpLeft,
  IconFlag,
  IconAlertTriangle,
  IconNavigation,
  IconX,
  IconVolume,
  IconVolumeOff,
  IconChevronUp,
  IconChevronDown,
  IconClock,
  IconRoute,
  IconGauge,
  IconMapPin,
} from "@tabler/icons-react";
import { useApp } from "../context/AppContext";
import { t } from "../context/translations";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN } from "../../config/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

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
  geometry?: GeoJSON.LineString;
}

interface NavigationModeProps {
  route: RouteData;
  origin: string;
  destination: string;
  onClose: () => void;
  mapCenter: { lat: number; lng: number };
}

const getStepIcon = (icon: string) => {
  switch (icon) {
    case "straight":
      return IconArrowUp;
    case "right":
      return IconArrowUpRight;
    case "left":
      return IconArrowUpLeft;
    case "arrive":
      return IconFlag;
    default:
      return IconArrowUp;
  }
};

const getStepDirectionColor = (icon: string) => {
  switch (icon) {
    case "straight":
      return "bg-[#2b7fff]";
    case "right":
      return "bg-[#2b7fff]";
    case "left":
      return "bg-[#2b7fff]";
    case "arrive":
      return "bg-green-500";
    default:
      return "bg-[#2b7fff]";
  }
};

const getStepDirectionLabel = (icon: string) => {
  switch (icon) {
    case "straight":
      return "Siga em frente";
    case "right":
      return "Vire à direita";
    case "left":
      return "Vire à esquerda";
    case "arrive":
      return "Destino";
    default:
      return "";
  }
};

// Parse distance string like "3.2 km" or "450m" to meters
function parseDistanceToMeters(dist: string): number {
  const cleaned = dist.replace(/\s/g, "").toLowerCase();
  if (cleaned.includes("km")) {
    return parseFloat(cleaned) * 1000;
  }
  return parseFloat(cleaned) || 0;
}

// Parse time string like "12 min" to seconds
function parseTimeToSeconds(time: string): number {
  const match = time.match(/(\d+)/);
  return match ? parseInt(match[1]) * 60 : 0;
}

// Format seconds to mm:ss or h:mm
function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}min`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Format meters to km or m
function formatDistance(meters: number): string {
  if (meters < 0) meters = 0;
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

// Calculate ETA
function getETA(secondsRemaining: number): string {
  const now = new Date();
  now.setSeconds(now.getSeconds() + secondsRemaining);
  return now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function NavigationMode({
  route,
  origin,
  destination,
  onClose,
  mapCenter,
}: NavigationModeProps) {
  const { theme, language } = useApp();
  const isDark = theme === "dark";
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepProgress, setStepProgress] = useState(0); // 0 to 1 within current step
  const [isMuted, setIsMuted] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState(0); // km/h
  const [isPaused, setIsPaused] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [useGPS, setUseGPS] = useState(true); // Toggle between GPS and simulation
  const [dismissedStepWarning, setDismissedStepWarning] = useState(false);
  const [dismissedOffRouteAlert, setDismissedOffRouteAlert] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullMapMode, setIsFullMapMode] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);

  const totalDistanceMeters = parseDistanceToMeters(route.distance);
  const totalTimeSeconds = parseTimeToSeconds(route.time);

  // Calculate cumulative distances for each step
  // Memoized to keep a stable reference and avoid re-registering the GPS watch on every render
  const stepDistances = useMemo(
    () => route.steps.map((s) => parseDistanceToMeters(s.distance)),
    [route.steps]
  );
  const totalStepDistance = useMemo(
    () => stepDistances.reduce((a, b) => a + b, 0) || totalDistanceMeters,
    [stepDistances, totalDistanceMeters]
  );

  // Refs for stale closure values in GPS watchPosition callback
  const currentStepIdxRef = useRef(currentStepIdx);
  currentStepIdxRef.current = currentStepIdx;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;
  const stepDistancesRef = useRef(stepDistances);
  stepDistancesRef.current = stepDistances;
  const totalStepDistanceRef = useRef(totalStepDistance);
  totalStepDistanceRef.current = totalStepDistance;

  // Calculate how much distance has been covered
  const coveredDistance = useMemo(() => {
    let covered = 0;
    for (let i = 0; i < currentStepIdx; i++) {
      covered += stepDistances[i];
    }
    covered += stepDistances[currentStepIdx] * stepProgress;
    return covered;
  }, [currentStepIdx, stepProgress, stepDistances]);

  const remainingDistance = Math.max(0, totalStepDistance - coveredDistance);
  const overallProgress = coveredDistance / totalStepDistance;
  const remainingTimeSeconds = Math.max(0, totalTimeSeconds * (1 - overallProgress));

  // Reset dismissed warnings when step changes
  useEffect(() => {
    setDismissedStepWarning(false);
  }, [currentStepIdx]);

  // Reset dismissed off-route alert when back on route
  useEffect(() => {
    if (!isOffRoute) {
      setDismissedOffRouteAlert(false);
    }
  }, [isOffRoute]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/navigation-day-v1',
      center: [mapCenter.lng, mapCenter.lat],
      zoom: 15,
      pitch: 45, // 3D tilt
      bearing: 0,
      attributionControl: false,
    });

    // Add zoom controls
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }), 'bottom-right');

    // Wait for map to load before drawing route
    map.on('load', () => {
      // Add route geometry if available
      if (route.geometry) {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry,
          },
        });

        // Route outline
        map.addLayer({
          id: 'route-outline',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0a2540',
            'line-width': 8,
            'line-opacity': 0.6,
          },
        });

        // Route line
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#2b7fff',
            'line-width': 5,
          },
        });

        // Fit bounds to route
        const coordinates = route.geometry.coordinates as [number, number][];
        const bounds = coordinates.reduce(
          (bounds, coord) => bounds.extend(coord),
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );
        map.fitBounds(bounds, { padding: 100, duration: 0 });
      }

      // Add destination marker
      if (route.geometry) {
        const coords = route.geometry.coordinates as [number, number][];
        const destCoord = coords[coords.length - 1];
        new mapboxgl.Marker({ color: '#10b981' })
          .setLngLat(destCoord)
          .addTo(map);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapCenter, route.geometry]);

  // Sync map style when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setStyle(isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/navigation-day-v1');
  }, [isDark]);

  // GPS tracking
  useEffect(() => {
    if (!useGPS || isPaused || hasArrived) return;

    if (!navigator.geolocation) {
      console.warn('Geolocation not supported, falling back to simulation');
      setUseGPS(false);
      return;
    }

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        setUserPosition(newPos);

        // Update speed (convert m/s to km/h)
        if (speed !== null && speed >= 0) {
          setSimulatedSpeed(speed * 3.6);
        }

        // Update user marker on map
        const map = mapInstanceRef.current;
        if (map) {
          if (!userMarkerRef.current) {
            // Create user marker
            const el = document.createElement('div');
            el.className = 'user-location-marker';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = '#2b7fff';
            el.style.border = '3px solid white';
            el.style.boxShadow = '0 0 10px rgba(43, 127, 255, 0.5)';

            userMarkerRef.current = new mapboxgl.Marker({ element: el })
              .setLngLat([longitude, latitude])
              .addTo(map);
          } else {
            userMarkerRef.current.setLngLat([longitude, latitude]);
          }

          // Recenter map on user (smooth follow)
          map.easeTo({
            center: [longitude, latitude],
            duration: 1000,
          });
        }

        // Check distance to next step and auto-advance
        if (route.geometry) {
          const coords = route.geometry.coordinates as [number, number][];

          // Find the coordinate for current step endpoint
          let stepEndIdx = 0;
          for (let i = 0; i <= currentStepIdxRef.current; i++) {
            stepEndIdx += Math.max(1, Math.floor((stepDistancesRef.current[i] / totalStepDistanceRef.current) * coords.length));
          }
          stepEndIdx = Math.min(stepEndIdx, coords.length - 1);

          const stepEndCoord = coords[stepEndIdx];
          const distToStepEnd = calculateDistance(
            latitude,
            longitude,
            stepEndCoord[1],
            stepEndCoord[0]
          );

          // If within 20m of step end, advance to next step
          if (distToStepEnd < 20 && currentStepIdxRef.current < route.steps.length - 1) {
            setCurrentStepIdx(prev => prev + 1);
            setStepProgress(0);

            if (!isMutedRef.current) {
              // Voice notification (optional)
              const nextStep = route.steps[currentStepIdxRef.current + 1];
              if (nextStep && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(nextStep.instruction);
                utterance.lang = 'pt-BR';
                window.speechSynthesis.speak(utterance);
              }
            }
          } else if (currentStepIdxRef.current === route.steps.length - 1 && distToStepEnd < 15) {
            // Arrived at destination
            setHasArrived(true);
          } else {
            // Update progress within current step
            const stepLength = stepDistancesRef.current[currentStepIdxRef.current];
            const progress = Math.max(0, Math.min(1, 1 - (distToStepEnd / stepLength)));
            setStepProgress(progress);
          }

          // Check if off route (more than 50m from any point on route)
          const minDistToRoute = coords.reduce((minDist, coord) => {
            const dist = calculateDistance(latitude, longitude, coord[1], coord[0]);
            return Math.min(minDist, dist);
          }, Infinity);

          setIsOffRoute(minDistToRoute > 50);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        // Fall back to simulation mode
        setUseGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    geoWatchIdRef.current = watchId;

    return () => {
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
    };
  }, [useGPS, isPaused, hasArrived, route.geometry, route.steps]);

  // Simulate navigation progress (fallback when GPS unavailable)
  useEffect(() => {
    if (useGPS || isPaused || hasArrived) return;

    intervalRef.current = setInterval(() => {
      setStepProgress((prev) => {
        // Speed of simulation - each tick advances ~2-5% of step
        const increment = 0.015 + Math.random() * 0.02;
        const next = prev + increment;

        if (next >= 1) {
          // Move to next step
          setCurrentStepIdx((prevIdx) => {
            const nextIdx = prevIdx + 1;
            if (nextIdx >= route.steps.length) {
              setHasArrived(true);
              return prevIdx;
            }
            return nextIdx;
          });
          return 0;
        }
        return next;
      });

      // Simulate speed variations
      setSimulatedSpeed(() => {
        const baseSpeed = totalDistanceMeters / totalTimeSeconds * 3.6; // km/h
        return Math.max(0, baseSpeed + (Math.random() - 0.5) * 10);
      });
    }, 800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [useGPS, isPaused, hasArrived, route.steps.length, totalDistanceMeters, totalTimeSeconds]);

  const currentStep = route.steps[currentStepIdx];
  const nextStep = currentStepIdx + 1 < route.steps.length ? route.steps[currentStepIdx + 1] : null;
  const CurrentIcon = getStepIcon(currentStep.icon);
  const currentStepDist = stepDistances[currentStepIdx];
  const metersToNextTurn = Math.max(0, currentStepDist * (1 - stepProgress));

  // Warnings in upcoming steps
  const upcomingWarnings = route.steps
    .slice(currentStepIdx)
    .filter((s) => s.warning);

  // Main container (always rendered)
  const mapElement = (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );

  // Arrival screen
  if (hasArrived) {
    return (
      <div className="fixed inset-0 z-[9999] overflow-hidden">
        {/* Map background */}
        {mapElement}

        {/* Arrival overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className={`${isDark ? "bg-[#1f2937]" : "bg-white"} rounded-[28px] p-8 mx-6 w-full max-w-sm text-center shadow-2xl`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <IconFlag className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#101828]"} mb-2 font-['Poppins']`}>
              {t("navmode.arrived", language)}
            </h2>
            <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[15px] font-['Poppins'] mb-2`}>
              {destination}
            </p>
            <div className="flex items-center justify-center gap-4 mb-6 mt-4">
              <div className="text-center">
                <p className={`${isDark ? "text-white" : "text-[#101828]"} text-xl font-bold font-['Poppins']`}>{route.distance}</p>
                <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[12px] font-['Poppins']`}>{t("navmode.covered", language)}</p>
              </div>
              <div className={`w-px h-10 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
              <div className="text-center">
                <p className={`${isDark ? "text-white" : "text-[#101828]"} text-xl font-bold font-['Poppins']`}>{route.time}</p>
                <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[12px] font-['Poppins']`}>{t("navmode.duration", language)}</p>
              </div>
              <div className={`w-px h-10 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
              <div className="text-center">
                <p className={`${isDark ? "text-white" : "text-[#101828]"} text-xl font-bold font-['Poppins']`}>{route.safetyScore}%</p>
                <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[12px] font-['Poppins']`}>{t("routes.safety", language)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-[#0a2540] text-white py-4 rounded-2xl font-bold text-[16px] font-['Poppins'] active:scale-95 transition"
            >
              {t("navmode.endNavigation", language)}
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#0a2540]">
      {/* Full-screen map */}
      {mapElement}

      {/* ===== TOP: Current instruction panel ===== */}
      <AnimatePresence>
        {!isFullMapMode && (
          <motion.div
            initial={{ y: -120 }}
            animate={{ y: 0 }}
            exit={{ y: -120 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-0 left-0 right-0 z-[200]"
          >
        {/* Main instruction */}
        <div className="bg-[#0a2540]/95 backdrop-blur-xl pt-[env(safe-area-inset-top)] shadow-2xl">
          <div className="px-4 pt-3 pb-3">
            {/* Top row: back + route info + mute */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={onClose}
                className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center active:scale-90 transition flex-shrink-0"
              >
                <IconX className="w-4 h-4 text-white" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{route.icon}</span>
                  <span className="text-white/80 text-[13px] font-medium font-['Poppins'] truncate">
                    {route.name}
                  </span>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-gradient-to-r ${route.gradient} flex-shrink-0`}>
                {route.safetyScore}%
              </div>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center active:scale-90 transition flex-shrink-0"
              >
                {isMuted ? (
                  <IconVolumeOff className="w-4 h-4 text-white/60" />
                ) : (
                  <IconVolume className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            {/* Current turn instruction - large */}
            <div className="flex items-center gap-4">
              <motion.div
                key={currentStepIdx}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-16 h-16 ${getStepDirectionColor(currentStep.icon)} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
              >
                <CurrentIcon className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.div
                  key={`dist-${currentStepIdx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <p className="text-white text-[28px] font-bold font-['Poppins'] leading-tight">
                    {formatDistance(metersToNextTurn)}
                  </p>
                  <p className="text-white text-[15px] font-semibold font-['Poppins'] leading-tight mt-0.5">
                    {currentStep.instruction}
                  </p>
                  <p className="text-white/60 text-[13px] font-['Poppins'] truncate">
                    {currentStep.street}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Step progress bar */}
            <div className="mt-3 h-1.5 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#2b7fff] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${stepProgress * 100}%` }}
                transition={{ ease: "linear", duration: 0.3 }}
              />
            </div>
          </div>

          {/* Next turn preview */}
          {nextStep && (
            <div className="px-4 py-2.5 bg-white/[8%] border-t border-white/10 flex items-center gap-3">
              <span className="text-white/40 text-[12px] font-['Poppins'] flex-shrink-0">
                {t("navmode.then", language)}
              </span>
              {(() => {
                const NextIcon = getStepIcon(nextStep.icon);
                return (
                  <NextIcon className="w-4 h-4 text-white/50 flex-shrink-0" />
                );
              })()}
              <span className="text-white/70 text-[13px] font-['Poppins'] truncate">
                {nextStep.instruction} — {nextStep.street}
              </span>
              <span className="text-white/40 text-[12px] font-['Poppins'] flex-shrink-0 ml-auto">
                {nextStep.distance}
              </span>
            </div>
          )}
        </div>

        {/* Warning alert (if current step has one) */}
        <AnimatePresence>
          {currentStep.warning && !dismissedStepWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 mt-3"
            >
              <div className="bg-orange-500/95 backdrop-blur-sm text-white px-4 py-3 rounded-2xl flex items-start gap-3 shadow-lg">
                <IconAlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold font-['Poppins'] leading-tight">
                    {t("navmode.cautionHere", language)}
                  </p>
                  <p className="text-white/90 text-[12px] font-['Poppins'] leading-tight mt-0.5">
                    {currentStep.warning}
                  </p>
                </div>
                <button
                  onClick={() => setDismissedStepWarning(true)}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition"
                  aria-label="Fechar alerta"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Off-route alert */}
        <AnimatePresence>
          {isOffRoute && !dismissedOffRouteAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 mt-3"
            >
              <div className="bg-red-500/95 backdrop-blur-sm text-white px-4 py-3 rounded-2xl flex items-start gap-3 shadow-lg">
                <IconAlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold font-['Poppins'] leading-tight">
                    {t("navmode.offRoute", language)}
                  </p>
                  <p className="text-white/90 text-[12px] font-['Poppins'] leading-tight mt-0.5">
                    {t("navmode.returnToRoute", language)}
                  </p>
                </div>
                <button
                  onClick={() => setDismissedOffRouteAlert(true)}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition"
                  aria-label="Fechar alerta"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MAP OVERLAY BUTTONS ===== */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[150] flex flex-col gap-3">
        {/* Pause/Resume */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition"
        >
          {isPaused ? (
            <IconNavigation className="w-5 h-5 text-[#2b7fff]" />
          ) : (
            <div className="flex gap-1">
              <div className="w-1.5 h-4 bg-[#0a2540] rounded-sm" />
              <div className="w-1.5 h-4 bg-[#0a2540] rounded-sm" />
            </div>
          )}
        </button>

        {/* Recenter */}
        <button
          onClick={() => {
            if (mapInstanceRef.current && userPosition) {
              mapInstanceRef.current.easeTo({
                center: [userPosition.lng, userPosition.lat],
                duration: 1000,
              });
            }
          }}
          className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition"
        >
          <IconMapPin className="w-5 h-5 text-[#0a2540]" />
        </button>

        {/* Toggle GPS/Simulation (for testing) */}
        <button
          onClick={() => setUseGPS(!useGPS)}
          className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition ${
            useGPS ? 'bg-green-500' : 'bg-gray-300'
          }`}
          title={useGPS ? 'GPS Ativo' : 'Simulação Ativa'}
        >
          <IconNavigation className={`w-5 h-5 ${useGPS ? 'text-white' : 'text-gray-600'}`} />
        </button>

        {/* Toggle Full Map Mode */}
        <button
          onClick={() => setIsFullMapMode(!isFullMapMode)}
          className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition ${
            isFullMapMode ? 'bg-blue-500' : 'bg-white'
          }`}
          title={isFullMapMode ? 'Mostrar Painéis' : 'Mapa Completo'}
        >
          <IconChevronDown className={`w-5 h-5 ${isFullMapMode ? 'text-white rotate-180' : 'text-[#0a2540]'} transition-transform`} />
        </button>
      </div>

      {/* Paused overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[180]"
          >
            <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[#0a2540] text-[15px] font-bold font-['Poppins']">
                {t("navmode.navPaused", language)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== BOTTOM: Stats & Steps panel ===== */}
      <AnimatePresence>
        {!isFullMapMode && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-[200]"
          >
        {/* Overall progress bar */}
        <div className="px-4 mb-1">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-400 rounded-full"
              animate={{ width: `${overallProgress * 100}%` }}
              transition={{ ease: "linear", duration: 0.5 }}
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className={`${isDark ? "bg-[#1f2937]" : "bg-white"} rounded-t-[28px] shadow-[0px_-10px_40px_0px_rgba(0,0,0,0.2)]`}>
          {/* Drag handle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-full flex items-center justify-center pt-3 pb-1 active:opacity-60 transition"
          >
            <div className={`w-10 h-1.5 ${isDark ? "bg-gray-600" : "bg-[#d1d5dc]"} rounded-full`} />
          </button>

          {/* Minimized view - just essential stats */}
          {isMinimized ? (
            <div className="px-5 py-3 pb-5 flex items-center justify-between" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
              <div className="flex items-center gap-1.5">
                <IconClock className="w-3.5 h-3.5 text-[#2b7fff]" />
                <span className={`${isDark ? "text-white" : "text-[#101828]"} text-[18px] font-bold font-['Poppins']`}>
                  {formatTime(remainingTimeSeconds)}
                </span>
              </div>

              <div className={`h-6 w-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />

              <div className="flex items-center gap-1.5">
                <IconRoute className="w-3.5 h-3.5 text-green-500" />
                <span className={`${isDark ? "text-white" : "text-[#101828]"} text-[18px] font-bold font-['Poppins']`}>
                  {formatDistance(remainingDistance)}
                </span>
              </div>

              <div className={`h-6 w-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />

              <div className="flex items-center gap-1.5">
                <IconGauge className="w-3.5 h-3.5 text-orange-500" />
                <span className={`${isDark ? "text-white" : "text-[#101828]"} text-[18px] font-bold font-['Poppins']`}>
                  {Math.round(simulatedSpeed)}
                </span>
                <span className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[13px] font-['Poppins']`}>
                  km/h
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Main stats row */}
              <div className="px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconClock className="w-4 h-4 text-[#2b7fff]" />
              <div>
                <p className={`${isDark ? "text-white" : "text-[#101828]"} text-[22px] font-bold font-['Poppins'] leading-none`}>
                  {formatTime(remainingTimeSeconds)}
                </p>
                <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[11px] font-['Poppins']`}>
                  {t("navmode.minLeft", language)}
                </p>
              </div>
            </div>

            <div className={`h-10 w-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />

            <div className="flex items-center gap-2">
              <IconRoute className="w-4 h-4 text-green-500" />
              <div>
                <p className={`${isDark ? "text-white" : "text-[#101828]"} text-[22px] font-bold font-['Poppins'] leading-none`}>
                  {formatDistance(remainingDistance)}
                </p>
                <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[11px] font-['Poppins']`}>
                  {t("navmode.remaining", language)}
                </p>
              </div>
            </div>

            <div className={`h-10 w-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />

            <div className="flex items-center gap-2">
              <IconGauge className="w-4 h-4 text-orange-500" />
              <div>
                <p className={`${isDark ? "text-white" : "text-[#101828]"} text-[22px] font-bold font-['Poppins'] leading-none`}>
                  {Math.round(simulatedSpeed)}
                </p>
                <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[11px] font-['Poppins']`}>
                  km/h
                </p>
              </div>
            </div>
          </div>

          {/* ETA row */}
          <div className="px-5 pb-3 flex items-center justify-between">
            <div className={`flex items-center gap-2 ${isDark ? "bg-gray-800" : "bg-[#f3f5f7]"} px-4 py-2 rounded-xl`}>
              <span className={`text-[13px] ${isDark ? "text-gray-400" : "text-[#7B838F]"} font-['Poppins']`}>
                {t("navmode.eta", language)}
              </span>
              <span className={`text-[15px] ${isDark ? "text-white" : "text-[#101828]"} font-bold font-['Poppins']`}>
                {getETA(remainingTimeSeconds)}
              </span>
            </div>

            {upcomingWarnings.length > 0 && (
              <div className={`flex items-center gap-1.5 ${isDark ? "bg-orange-500/15 border-orange-500/30" : "bg-orange-50 border-orange-200"} px-3 py-2 rounded-xl border`}>
                <IconAlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                <span className={`text-[12px] ${isDark ? "text-orange-400" : "text-orange-700"} font-semibold font-['Poppins']`}>
                  {upcomingWarnings.length} {upcomingWarnings.length === 1 ? t("routes.alert", language) : t("routes.alerts", language)}
                </span>
              </div>
            )}
          </div>

          {/* Toggle steps button */}
          <button
            onClick={() => setShowAllSteps(!showAllSteps)}
            className={`w-full px-5 py-2.5 border-t ${isDark ? "border-gray-700" : "border-gray-100"} flex items-center justify-center gap-2 ${isDark ? "active:bg-gray-700" : "active:bg-gray-50"} transition`}
          >
            {showAllSteps ? (
              <IconChevronDown className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-[#7B838F]"}`} />
            ) : (
              <IconChevronUp className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-[#7B838F]"}`} />
            )}
            <span className={`text-[13px] ${isDark ? "text-gray-400" : "text-[#7B838F]"} font-medium font-['Poppins']`}>
              {showAllSteps
                ? t("navmode.hideSteps", language)
                : `${route.steps.length - currentStepIdx - 1} ${t("navmode.stepsLeft", language)}`}
            </span>
          </button>

          {/* Expandable steps list */}
          <AnimatePresence>
            {showAllSteps && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`overflow-hidden border-t ${isDark ? "border-gray-700" : "border-gray-100"}`}
              >
                <div className="max-h-[35vh] overflow-y-auto px-5 py-3">
                  {route.steps.map((step, idx) => {
                    const StepIcon = getStepIcon(step.icon);
                    const isCompleted = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const isLast = idx === route.steps.length - 1;

                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 ${isCurrent ? "opacity-100" : isCompleted ? "opacity-40" : "opacity-70"}`}
                      >
                        {/* Timeline */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? isDark ? "bg-green-500/20" : "bg-green-100"
                                : isCurrent
                                  ? getStepDirectionColor(step.icon)
                                  : isLast
                                    ? "bg-green-500"
                                    : isDark ? "bg-gray-700" : "bg-gray-100"
                            }`}
                          >
                            {isCompleted ? (
                              <div className="w-3 h-3 bg-green-500 rounded-full" />
                            ) : (
                              <StepIcon
                                className={`w-3.5 h-3.5 ${
                                  isCurrent || isLast ? "text-white" : isDark ? "text-[#7B838F]" : "text-[#7B838F]"
                                }`}
                              />
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 min-h-[20px] flex-1 my-1 ${
                                isCompleted ? "bg-green-300" : isDark ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-3 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-[13px] font-semibold font-['Poppins'] ${
                                isCurrent ? isDark ? "text-white" : "text-[#101828]" : isCompleted ? `${isDark ? "text-gray-400" : "text-[#7B838F]"} line-through` : isDark ? "text-white" : "text-[#101828]"
                              }`}
                            >
                              {step.instruction}
                            </p>
                            {step.distance !== "—" && (
                              <span className={`text-[11px] ${isDark ? "text-gray-400" : "text-[#7B838F]"} font-['Poppins'] flex-shrink-0 ml-2`}>
                                {step.distance}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] ${isDark ? "text-gray-400" : "text-[#7B838F]"} font-['Poppins'] truncate`}>
                            {step.street}
                          </p>
                          {step.warning && !isCompleted && (
                            <div className={`mt-1.5 px-2.5 py-1.5 ${isDark ? "bg-orange-500/15 border-orange-500/30" : "bg-orange-50 border-orange-200"} border rounded-lg flex items-start gap-1.5`}>
                              <IconAlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className={`text-[10px] ${isDark ? "text-orange-400" : "text-orange-700"} font-medium font-['Poppins'] leading-tight`}>
                                {step.warning}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
            </>
          )}

          {/* End navigation button - always visible */}
          {!isMinimized && (
            <div className="px-5 pb-5 pt-2" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
              <button
                onClick={onClose}
                className={`w-full py-4 ${isDark ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-600"} border rounded-2xl text-[15px] font-bold font-['Poppins'] active:scale-95 transition flex items-center justify-center gap-2`}
              >
                <IconX className="w-5 h-5" />
                {t("navmode.endNavigation", language)}
              </button>
            </div>
          )}
        </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== FLOATING STATS BADGE (Full Map Mode) ===== */}
      <AnimatePresence>
        {isFullMapMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className={`${isDark ? "bg-[#1f2937]/95" : "bg-white/95"} backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-4`}>
              <div className="flex items-center gap-1.5">
                <IconClock className="w-3.5 h-3.5 text-[#2b7fff]" />
                <span className={`${isDark ? "text-white" : "text-[#101828]"} text-[16px] font-bold font-['Poppins']`}>
                  {formatTime(remainingTimeSeconds)}
                </span>
              </div>

              <div className={`h-5 w-px ${isDark ? "bg-gray-600" : "bg-gray-300"}`} />

              <div className="flex items-center gap-1.5">
                <IconRoute className="w-3.5 h-3.5 text-green-500" />
                <span className={`${isDark ? "text-white" : "text-[#101828]"} text-[16px] font-bold font-['Poppins']`}>
                  {formatDistance(remainingDistance)}
                </span>
              </div>

              <div className={`h-5 w-px ${isDark ? "bg-gray-600" : "bg-gray-300"}`} />

              <div className="flex items-center gap-1.5">
                <IconGauge className="w-3.5 h-3.5 text-orange-500" />
                <span className={`${isDark ? "text-white" : "text-[#101828]"} text-[16px] font-bold font-['Poppins']`}>
                  {Math.round(simulatedSpeed)}
                </span>
                <span className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[12px] font-['Poppins']`}>
                  km/h
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}