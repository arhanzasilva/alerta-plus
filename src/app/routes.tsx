import { createBrowserRouter, Navigate } from "react-router";
import { Splash } from "./pages/Splash";
import { Onboarding } from "./pages/Onboarding";
import { MapView } from "./pages/MapView";
import { ReportIncident } from "./pages/ReportIncident";
import { Profile } from "./pages/Profile";
import { Routes as RoutesPage } from "./pages/Routes";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { HelpFeedback } from "./pages/HelpFeedback";
import { HelpHistory } from "./pages/HelpHistory";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/splash" replace /> },
      { path: "splash", Component: Splash },
      { path: "onboarding", Component: Onboarding },
      { path: "map", Component: MapView },
      { path: "report", Component: ReportIncident },
      { path: "routes", Component: RoutesPage },
      { path: "notifications", Component: Notifications },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "help", Component: HelpFeedback },
      { path: "help-history", Component: HelpHistory },
      { path: "*", element: <Navigate to="/map" replace /> },
    ],
  },
]);