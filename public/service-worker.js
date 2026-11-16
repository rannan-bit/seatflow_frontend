// Receive push notification
self.addEventListener("push", (event) => {
    let data = {
        title: "SeatFlow Notification",
        body: "You have a new notification!",
        url: "/customer/queue"
    };

    if (event.data) {
        try {
            data = {
                ...data,
                ...event.data.json()
            };
        } catch (error) {
            console.error("Invalid push notification data", error);
        }
    }

    const options = {
        body: data.body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: {
            url: data.url || "/customer/queue"
        },
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});


// Handle notification click
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || "/customer/queue";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((clientList) => {

            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    return client.focus().then(() => {
                        if ("navigate" in client) {
                            return client.navigate(targetUrl);
                        }
                    });
                }
            }

            return clients.openWindow(targetUrl);
        })
    );
});