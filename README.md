# SeatFlow — Readable React UI

This version is reorganized into small files so you can understand and edit each page separately.

## Folder structure

```text
src/
├── App.jsx                    # All routes and shared app state
├── main.jsx                   # React entry point
├── components/
│   ├── Brand.jsx               # SeatFlow logo
│   ├── CustomerLayout.jsx      # Customer header and bottom navigation
│   ├── AdminLayout.jsx         # Staff/Admin sidebar layout
│   ├── StatsCards.jsx          # Dashboard stat cards
│   ├── QueueTable.jsx          # Queue table
│   └── TableGrid.jsx           # Restaurant tables
├── data/
│   └── initialData.js          # Sample menu, tables and queue
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── customer/
│   │   ├── CheckIn.jsx
│   │   ├── QueueStatus.jsx
│   │   ├── Menu.jsx
│   │   ├── Cart.jsx
│   │   └── OrderTracking.jsx
│   ├── staff/
│   │   ├── StaffDashboard.jsx
│   │   ├── TableQueue.jsx
│   │   └── StaffOrders.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── TableManagement.jsx
│       ├── MenuManagement.jsx
│       ├── OrderManagement.jsx
│       └── StaffManagement.jsx
└── styles/
    └── global.css              # Shared responsive styles
```

## Run the app

1. Extract the ZIP and open its folder in VS Code.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local URL shown in the terminal.

## Useful routes

- `/customer/check-in`
- `/customer/queue`
- `/customer/menu`
- `/customer/cart`
- `/customer/order`
- `/staff-login`, `/staff`, `/staff/tables`, `/staff/orders`
- `/admin-login`, `/admin`, `/admin/tables`, `/admin/menu`, `/admin/orders`, `/admin/staff`

This is a frontend demo using sample data. Login is not real authentication, and data is not stored in a backend yet.
