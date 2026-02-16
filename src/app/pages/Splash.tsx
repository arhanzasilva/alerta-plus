import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import svgPaths from "../../imports/svg-h2odaglmib";
import { useApp } from "../context/AppContext";

export function Splash() {
  const navigate = useNavigate();
  const { isOnboarded } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOnboarded) {
        navigate("/map", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate, isOnboarded]);

  return (
    <div className="h-full w-full bg-[#0A2540] flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-[200px] h-[122px]"
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
    </div>
  );
}