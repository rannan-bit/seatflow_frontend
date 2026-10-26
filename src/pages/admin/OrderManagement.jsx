import { useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";

const startingOrders = [
  { id: "SF-1082", customer: "Aarav Shah", items: "2 × Classic Margherita, Fries", status: "Waiting seating" },
  { id: "SF-1081", customer: "Maya Thomas", items: "Rosé Penne, Salad", status: "Preparing" },
  { id: "SF-1080", customer: "Adil Rahman", items: "Lava Cake, Fries", status: "Ready" }
];

export default function OrderManagement() {
  const [orders, setOrders] = useState(startingOrders);
  function changeStatus(id, status) {
    setOrders((items) => items.map((order) => order.id === id ? { ...order, status } : order));
  }

  return (
    <AdminLayout role="Admin" title="Order management">
      <h1>Order management</h1><p className="muted-text">View orders and update their current status.</p>
      <section className="panel"><div className="table-scroll"><table>
        <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>STATUS</th></tr></thead>
        <tbody>{orders.map((order) => <tr key={order.id}><td>{order.id}</td><td>{order.customer}</td><td>{order.items}</td><td><select value={order.status} onChange={(event) => changeStatus(order.id, event.target.value)}><option>Waiting seating</option><option>Preparing</option><option>Ready</option><option>Served</option><option>Cancelled</option></select></td></tr>)}</tbody>
      </table></div></section>
    </AdminLayout>
  );
}