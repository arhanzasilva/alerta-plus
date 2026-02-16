import { useRef, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import svgPaths from "../../imports/svg-hkfx6ct22z";
import { useApp } from "../context/AppContext";
import { t } from "../context/translations";
import { AchievementToast } from "./AchievementToast";

const NAV_PATHS = ["/map", "/notifications", "/profile"];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { incidents, language, theme } = useApp();

  // Count active alerts for badge
  const activeAlertCount = incidents.filter((i) => i.status === "active").length;

  // Track navigation direction for slide animations
  const prevPathIdxRef = useRef(-1);
  const [direction, setDirection] = useState(0);
  const [transitionKey, setTransitionKey] = useState(location.pathname);

  useEffect(() => {
    const currentIdx = NAV_PATHS.indexOf(location.pathname);
    if (currentIdx >= 0 && prevPathIdxRef.current >= 0) {
      setDirection(currentIdx > prevPathIdxRef.current ? 1 : -1);
    } else {
      setDirection(0);
    }
    if (currentIdx >= 0) {
      prevPathIdxRef.current = currentIdx;
    }
    setTransitionKey(location.pathname);
  }, [location.pathname]);

  // Don't show navigation on onboarding, splash, or root redirect
  if (location.pathname === "/" || location.pathname === "/onboarding" || location.pathname === "/splash") {
    return (
      <div className="fixed inset-0">
        <AchievementToast />
        <Outlet />
      </div>
    );
  }

  // Don't show navigation on settings or routes (full-screen pages)
  if (location.pathname === "/settings" || location.pathname === "/routes") {
    return (
      <div className="fixed inset-0">
        <AchievementToast />
        <Outlet />
      </div>
    );
  }

  // Don't show navigation on report page (accessed via quick report flow)
  if (location.pathname === "/report") {
    return (
      <div className="fixed inset-0">
        <AchievementToast />
        <Outlet />
      </div>
    );
  }

  const navItems = [
    { path: "/map", label: t("nav.map", language) },
    { path: "/notifications", label: t("nav.alerts", language) },
    { path: "/profile", label: t("nav.profile", language) },
  ];

  /* ── Custom SVG Nav Icons matching Figma (Responsive) ── */
  const NavMapIcon = ({ active }: { active: boolean }) => (
    <svg
      className="w-7 h-7 lg:w-8 lg:h-8"
      viewBox="0 0 22.3 20.55"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={svgPaths.p27229100}
        fill={active ? "white" : "rgba(255,255,255,0.6)"}
      />
    </svg>
  );

  const NavAlertasIcon = ({ active }: { active: boolean }) => (
    <svg
      className="w-7 h-7 lg:w-8 lg:h-8"
      viewBox="0 0 27.98 27.98"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={svgPaths.p17014c00}
        stroke="white"
        strokeOpacity={active ? 1 : 0.6}
        strokeWidth={2.72}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={svgPaths.p380a63a0}
        stroke="white"
        strokeOpacity={active ? 1 : 0.6}
        strokeWidth={2.72}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const NavPerfilIcon = ({ active }: { active: boolean }) => (
    <svg
      className="w-7 h-7 lg:w-8 lg:h-8"
      viewBox="0 0 28 28"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(7.97, 2.14)">
        <path
          d={svgPaths.p3996a500}
          stroke="white"
          strokeOpacity={active ? 1 : 0.6}
          strokeWidth={2.72}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g transform="translate(4.47, 16.13)">
        <path
          d={svgPaths.p23ed7d80}
          stroke="white"
          strokeOpacity={active ? 1 : 0.6}
          strokeWidth={2.72}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );

  const iconMap: Record<string, React.FC<{ active: boolean }>> = {
    "/map": NavMapIcon,
    "/notifications": NavAlertasIcon,
    "/profile": NavPerfilIcon,
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden">
      <AchievementToast />

      {/* Sidebar Navigation (Desktop only - lg+) */}
      <nav className="hidden lg:flex lg:flex-col bg-[#0a2540] w-20 xl:w-24 flex-shrink-0 py-8 items-center gap-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = iconMap[item.path];

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-2 w-16 xl:w-20 py-3 rounded-2xl hover:bg-white/5 active:scale-95 transition relative group"
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <IconComponent active={isActive} />

                {/* Notification badge */}
                {item.path === "/notifications" && activeAlertCount > 0 && (
                  <div className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 bg-[#fb2c36] rounded-full flex items-center justify-center border-2 border-[#0a2540]">
                    <span className="text-white text-[10px] font-bold font-['Poppins'] leading-none">
                      {activeAlertCount > 9 ? "9+" : activeAlertCount}
                    </span>
                  </div>
                )}
              </motion.div>

              <span
                className="text-[11px] xl:text-[12px] font-medium font-['Poppins'] text-center"
                style={{
                  color: isActive ? "white" : "rgba(255,255,255,0.6)",
                }}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="nav-indicator-desktop"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2b7fff] rounded-r-full"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Main content with enter-only page transitions */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          key={transitionKey}
          initial={{
            x: direction > 0 ? "6%" : direction < 0 ? "-6%" : 0,
            opacity: 0,
          }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            x: { type: "tween", duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
            opacity: { duration: 0.15 },
          }}
          className="absolute inset-0"
        >
          <Outlet />
        </motion.div>
      </div>

      {/* Bottom Navigation (Mobile/Tablet only - hidden on lg+) */}
      <nav
        className="lg:hidden bg-[#0a2540] h-[80px] flex items-start justify-evenly px-8 flex-shrink-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = iconMap[item.path];

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 w-[60px] h-[64px] mt-2 active:scale-95 transition relative"
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <IconComponent active={isActive} />

                {/* Notification badge */}
                {item.path === "/notifications" && activeAlertCount > 0 && (
                  <div className="absolute -top-[4px] -right-[8px] min-w-[17px] h-[16px] px-[1.5px] bg-[#fb2c36] rounded-full flex items-center justify-center border-[1.5px] border-[#0a2540]">
                    <span className="text-white text-[9px] font-bold font-['Poppins'] leading-[9px]">
                      {activeAlertCount > 9 ? "9+" : activeAlertCount}
                    </span>
                  </div>
                )}
              </motion.div>

              <span
                className="text-[12px] font-medium leading-[16px] font-['Poppins'] text-center"
                style={{
                  color: isActive ? "white" : "rgba(255,255,255,0.6)",
                }}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="nav-indicator-mobile"
                  className="absolute bottom-[7px] w-[5px] h-[5px] bg-[#2b7fff] rounded-full"
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}