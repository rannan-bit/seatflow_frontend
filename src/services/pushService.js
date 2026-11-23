import { savePushSubscriptionAPI } from "./allAPI.js";

// Register service worker
export const registerServiceWorker = async () => {

    if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker is not supported");
    }

    return await navigator.serviceWorker.register(
        "/service-worker.js"
    );
};


// Convert VAPID key
export const urlBase64ToUint8Array = (base64String) => {

    const padding = "=".repeat(
        (4 - base64String.length % 4) % 4
    );

    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from(
        [...rawData].map(char => char.charCodeAt(0))
    );
};


// Subscribe customer
export const subscribeCustomerToPush = async (token) => {

    if (!window.isSecureContext) {
        throw new Error("Push requires HTTPS or localhost");
    }

    if (!("PushManager" in window)) {
        throw new Error("Push notifications are not supported");
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        throw new Error("Notification permission denied");
    }

    const registration = await registerServiceWorker();

    let subscription =
        await registration.pushManager.getSubscription();

    if (!subscription) {

        const publicKey =
            import.meta.env.VITE_VAPID_PUBLIC_KEY;

        if (!publicKey) {
            throw new Error("VAPID public key is missing");
        }

        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,

            applicationServerKey:
                urlBase64ToUint8Array(publicKey)
        });
    }

    await savePushSubscriptionAPI({
        token,
        subscription: subscription.toJSON()
    });

    return subscription;
};