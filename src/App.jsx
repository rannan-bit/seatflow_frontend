import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { initialFoods, initialQueue, initialTables } from "./data/initialData.js";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import CheckIn from "./pages/customer/CheckIn.jsx";
import QueueStatus from "./pages/customer/QueueStatus.jsx";
import Menu from "./pages/customer/Menu.jsx";
import Cart from "./pages/customer/Cart.jsx";
import OrderTracking from "./pages/customer/OrderTracking.jsx";
import StaffDashboard from "./pages/staff/StaffDashboard.jsx";
import TableQueue from "./pages/staff/TableQueue.jsx";
import StaffOrders from "./pages/staff/StaffOrders.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import TableManagement from "./pages/admin/TableManagement.jsx";
import MenuManagement from "./pages/admin/MenuManagement.jsx";
import OrderManagement from "./pages/admin/OrderManagement.jsx";
import StaffManagement from "./pages/admin/StaffManagement.jsx";

export default function App() {
  const [foods, setFoods] = useState(initialFoods);
  const [cart, setCart] = useState({});
  const [tables, setTables] = useState(initialTables);
  const [queue, setQueue] = useState(initialQueue);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Customer pages */}
      <Route path="/customer/check-in" element={<CheckIn />} />
      <Route path="/customer/queue" element={<QueueStatus />} />
      <Route path="/customer/menu" element={<Menu foods={foods} cart={cart} setCart={setCart} />} />
      <Route path="/customer/cart" element={<Cart foods={foods} cart={cart} setCart={setCart} />} />
      <Route path="/customer/order" element={<OrderTracking />} />

      {/* Staff pages */}
      <Route path="/staff-login" element={<Login role="Staff" />} />
      <Route path="/staff" element={<StaffDashboard />} />
      <Route path="/staff/tables" element={<TableQueue tables={tables} setTables={setTables} queue={queue} setQueue={setQueue} />} />
      <Route path="/staff/orders" element={<StaffOrders />} />

      {/* Admin pages */}
      <Route path="/admin-login" element={<Login role="Admin" />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/tables" element={<TableManagement tables={tables} setTables={setTables} />} />
      <Route path="/admin/menu" element={<MenuManagement foods={foods} setFoods={setFoods} />} />
      <Route path="/admin/orders" element={<OrderManagement />} />
      <Route path="/admin/staff" element={<StaffManagement />} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}