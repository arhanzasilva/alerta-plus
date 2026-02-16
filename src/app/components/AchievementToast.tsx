import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export function AchievementToast() {
  const { newAchievements, clearNewAchievements } = useApp();

  useEffect(() => {
    if (newAchievements.length > 0) {
      // Show each achievement toast with a stagger
      newAchievements.forEach((achievement, idx) => {
        setTimeout(() => {
          toast.custom(
            (t) => (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="w-full max-w-[356px] mx-auto"
              >
                <div
                  className={`bg-gradient-to-r ${achievement.gradient} rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-white/20`}
                >
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30 text-white">
                    {(() => { const AchIcon = achievement.icon; return <AchIcon size={24} className="text-white" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-[11px] font-semibold font-['Poppins'] uppercase tracking-wider mb-0.5">
                      Conquista desbloqueada!
                    </p>
                    <p className="text-white text-[16px] font-bold font-['Poppins'] truncate">
                      {achievement.name}
                    </p>
                    <p className="text-white/80 text-[12px] font-['Poppins']">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ),
            {
              duration: 4000,
              position: "top-center",
            }
          );
        }, idx * 800);
      });

      clearNewAchievements();
    }
  }, [newAchievements, clearNewAchievements]);

  return null;
}