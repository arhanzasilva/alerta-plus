import { useEffect, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { messaging, db } from "../../config/firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

/**
 * Registers FCM token for the authenticated user and handles foreground notifications.
 * Requires VITE_FIREBASE_VAPID_KEY env variable — does nothing if missing.
 */
export function useNotifications(uid: string | null) {
  const setupDone = useRef(false);

  useEffect(() => {
    if (!uid || setupDone.current || !messaging || !VAPID_KEY) return;
    if (!("Notification" in window)) return;

    const setup = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        setupDone.current = true;

        const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        const token = await getToken(messaging!, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (token) {
          updateDoc(doc(db, "users", uid), {
            fcmTokens: arrayUnion(token),
          }).catch(() => {});
        }

        // Handle messages while the app is in the foreground
        onMessage(messaging!, (payload) => {
          const title = payload.notification?.title ?? "Alerta+";
          const body = payload.notification?.body ?? "Novo alerta na sua região";
          new Notification(title, { body, icon: "/favicon.png" });
        });
      } catch (err) {
        console.warn("FCM setup failed:", err);
      }
    };

    setup();
  }, [uid]);
}
