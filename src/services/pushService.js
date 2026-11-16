import { savePushSubscriptionAPI } from "./allAPI";

export const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
        throw new Error("Your browser does not support service workers.");
    }

    try {
        const registration = await navigator.serviceWorker.register(
            "/service-worker.js"
        );

        console.log("Service Worker registered:", registration);

        return registration;

    } catch (error) {
        console.error("Service Worker registration failed:", error);
        throw error;
    }
};
export const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);

    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from(
        [...rawData].map((char) => char.charCodeAt(0))
    );
};
export const subscribeCustomerToPush = async (token) => {
    try {
        // Request notification permission
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            throw new Error("Notification permission was not granted.");
        }

        // Register service worker
        const registration = await registerServiceWorker();

        // Create browser push subscription
        let subscription = await registration.pushManager.getSubscription();
        console.log(subscription);
        

        if (!subscription) {
            const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

            if (!publicKey) {
                throw new Error("VAPID public key is missing.");
            }

            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });
        }

        // Save subscription in backend
        const response = await savePushSubscriptionAPI({
            token,
            subscription: subscription.toJSON()
        });

        if (response?.status !== 200 || response?.data?.success !== true) {
            throw new Error(
                response?.data?.message ||
                response?.message ||
                "Failed to save push subscription."
            );
        }

        console.log("Push subscription saved:", response.data);

        return subscription;

    } catch (error) {
        console.error("Push subscription failed:", error);
        throw error;
    }
};