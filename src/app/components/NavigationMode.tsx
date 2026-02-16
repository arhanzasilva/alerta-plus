import { useState, useEffect, useCallback, useRef } from "react";
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDistanceMeters = parseDistanceToMeters(route.distance);
  const totalTimeSeconds = parseTimeToSeconds(route.time);

  // Calculate cumulative distances for each step
  const stepDistances = route.steps.map((s) => parseDistanceToMeters(s.distance));
  const totalStepDistance = stepDistances.reduce((a, b) => a + b, 0) || totalDistanceMeters;

  // Calculate how much distance has been covered
  const coveredDistance = useCallback(() => {
    let covered = 0;
    for (let i = 0; i < currentStepIdx; i++) {
      covered += stepDistances[i];
    }
    covered += stepDistances[currentStepIdx] * stepProgress;
    return covered;
  }, [currentStepIdx, stepProgress, stepDistances]);

  const remainingDistance = Math.max(0, totalStepDistance - coveredDistance());
  const overallProgress = coveredDistance() / totalStepDistance;
  const remainingTimeSeconds = Math.max(0, totalTimeSeconds * (1 - overallProgress));

  // Simulate navigation progress
  useEffect(() => {
    if (isPaused || hasArrived) return;

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
  }, [isPaused, hasArrived, route.steps.length, totalDistanceMeters, totalTimeSeconds]);

  const currentStep = route.steps[currentStepIdx];
  const nextStep = currentStepIdx + 1 < route.steps.length ? route.steps[currentStepIdx + 1] : null;
  const CurrentIcon = getStepIcon(currentStep.icon);
  const currentStepDist = stepDistances[currentStepIdx];
  const metersToNextTurn = Math.max(0, currentStepDist * (1 - stepProgress));

  // Warnings in upcoming steps
  const upcomingWarnings = route.steps
    .slice(currentStepIdx)
    .filter((s) => s.warning);

  // Arrival screen
  if (hasArrived) {
    return (
      <div className="fixed inset-0 z-[9999] overflow-hidden">
        {/* Map background */}
        <div className="absolute inset-0">
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.015},${mapCenter.lat - 0.015},${mapCenter.lng + 0.015},${mapCenter.lat + 0.015}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`}
            className="w-full h-full border-0"
            title="Mapa"
          />
        </div>

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
              Você chegou!
            </h2>
            <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[15px] font-['Poppins'] mb-2`}>
              {destination}
            </p>
            <div className="flex items-center justify-center gap-4 mb-6 mt-4">
              <div className="text-center">
                <p className={`${isDark ? "text-white" : "text-[#101828]"} text-xl font-bold font-['Poppins']`}>{route.distance}</p>
                <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[12px] font-['Poppins']`}>Percorridos</p>
              </div>
              <div className={`w-px h-10 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
              <div className="text-center">
                <p className={`${isDark ? "text-white" : "text-[#101828]"} text-xl font-bold font-['Poppins']`}>{route.time}</p>
                <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[12px] font-['Poppins']`}>Duração</p>
              </div>
              <div className={`w-px h-10 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
              <div className="text-center">
                <p className={`${isDark ? "text-white" : "text-[#101828]"} text-xl font-bold font-['Poppins']`}>{route.safetyScore}%</p>
                <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[12px] font-['Poppins']`}>Segurança</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-[#0a2540] text-white py-4 rounded-2xl font-bold text-[16px] font-['Poppins'] active:scale-95 transition"
            >
              Finalizar
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#0a2540]">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.02},${mapCenter.lat - 0.02},${mapCenter.lng + 0.02},${mapCenter.lat + 0.02}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`}
          className="w-full h-full border-0"
          title="Mapa Navegação"
        />
      </div>

      {/* ===== TOP: Current instruction panel ===== */}
      <motion.div
        initial={{ y: -120 }}
        animate={{ y: 0 }}
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
            <div className="px-4 py-2.5 bg-white/8 border-t border-white/10 flex items-center gap-3">
              <span className="text-white/40 text-[12px] font-['Poppins'] flex-shrink-0">
                Depois
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
          {currentStep.warning && (
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
                    Atenção neste trecho
                  </p>
                  <p className="text-white/90 text-[12px] font-['Poppins'] leading-tight mt-0.5">
                    {currentStep.warning}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
        <button className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition">
          <IconMapPin className="w-5 h-5 text-[#0a2540]" />
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
                Navegação pausada
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== BOTTOM: Stats & Steps panel ===== */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
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
            onClick={() => setShowAllSteps(!showAllSteps)}
            className="w-full flex items-center justify-center pt-3 pb-1 active:opacity-60 transition"
          >
            <div className={`w-10 h-1.5 ${isDark ? "bg-gray-600" : "bg-[#d1d5dc]"} rounded-full`} />
          </button>

          {/* Main stats row */}
          <div className="px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconClock className="w-4 h-4 text-[#2b7fff]" />
              <div>
                <p className={`${isDark ? "text-white" : "text-[#101828]"} text-[22px] font-bold font-['Poppins'] leading-none`}>
                  {formatTime(remainingTimeSeconds)}
                </p>
                <p className={`${isDark ? "text-gray-400" : "text-[#7B838F]"} text-[11px] font-['Poppins']`}>
                  min restantes
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
                  restantes
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
                Chegada estimada
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
                ? "Ocultar passos"
                : `${route.steps.length - currentStepIdx - 1} passos restantes`}
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

          {/* End navigation button */}
          <div className="px-5 pb-5 pt-2" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
            <button
              onClick={onClose}
              className={`w-full py-4 ${isDark ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-600"} border rounded-2xl text-[15px] font-bold font-['Poppins'] active:scale-95 transition flex items-center justify-center gap-2`}
            >
              <IconX className="w-5 h-5" />
              {t("navmode.endNavigation", language)}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}