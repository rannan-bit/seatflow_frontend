self.addEventListener("push", (event) => {

    let data = {
        title: "SeatFlow",
        body: "Your table is ready!",
        url: "/"
    };

    if (event.data) {
        data = {
            ...data,
            ...event.data.json()
        };
    }

    const options = {
        body: data.body,
        icon: "/favicon.ico",
        data: {
            url: data.url
        }
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title,
            options
        )
    );

});

self.addEventListener("notificationclick", (event) => {

    event.notification.close();

    const url = event.notification.data?.url || "/";

    event.waitUntil(
        clients.openWindow(url)
    );

});