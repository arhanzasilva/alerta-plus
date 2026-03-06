import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import svgPaths from "../../imports/svg-h2odaglmib";
import { useApp } from "../context/AppContext";

const DURATION = 2800;

export function Splash() {
  const navigate = useNavigate();
  const { isOnboarded } = useApp();
  const isOnboardedRef = useRef(isOnboarded);
  isOnboardedRef.current = isOnboarded;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(elapsed / DURATION, 1));
    }, 16);

    const timer = setTimeout(() => {
      clearInterval(interval);
      navigate(isOnboardedRef.current ? "/map" : "/onboarding", { replace: true });
    }, DURATION);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="h-full w-full bg-[#0A2540] flex flex-col items-center justify-center relative overflow-hidden">

      {/* Background glow blobs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(43,127,255,0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,193,7,0.08) 0%, transparent 70%)", top: "30%", left: "60%" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Pulse rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-[#2b7fff]/20"
          initial={{ width: 120, height: 120, opacity: 0.6 }}
          animate={{ width: 120 + i * 80, height: 120 + i * 80, opacity: 0 }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 w-[180px] h-[110px] mb-6"
      >
        <svg
          className="block w-full h-full"
          viewBox="0 0 281 172"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <path d={svgPaths.p30b43e00} fill="white" />
          <path d={svgPaths.p13913280} fill="#FFC107" />
        </svg>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-10 text-white/50 text-[13px] font-['Poppins'] tracking-widest uppercase mb-16"
      >
        Alertas urbanos em tempo real
      </motion.p>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-12 w-[160px] h-[3px] rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="w-full h-full bg-white/10 rounded-full" />
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#2b7fff] to-[#FFC107]"
          style={{ width: `${progress * 100}%` }}
        />
      </motion.div>
    </div>
  );
}
