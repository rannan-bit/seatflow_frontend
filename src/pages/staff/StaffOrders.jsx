import { useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";

export default function StaffOrders() {
  const [orders, setOrders] = useState([
    { id: "SF-1082", guest: "Aarav Shah", items: "2 × Margherita, Fries", status: "Waiting seating" },
    { id: "SF-1081", guest: "Maya Thomas", items: "Rosé Penne, Salad", status: "Preparing" }
  ]);

  function updateStatus(id) {
    const nextStatus = { "Waiting seating": "Preparing", Preparing: "Ready", Ready: "Served", Served: "Served" };
    setOrders((items) => items.map((order) => order.id === id ? { ...order, status: nextStatus[order.status] } : order));
  }

  return (
    <AdminLayout role="Staff" title="Orders">
      <h1>Food orders</h1><p className="muted-text">Review incoming orders and update their progress.</p>
      <section className="panel"><div className="table-scroll"><table>
        <thead><tr><th>ORDER</th><th>GUEST</th><th>ITEMS</th><th>STATUS / ACTION</th></tr></thead>
        <tbody>{orders.map((order) => <tr key={order.id}><td>{order.id}</td><td>{order.guest}</td><td>{order.items}</td><td><button className="button button-outline" onClick={() => updateStatus(order.id)}>{order.status} · Update</button></td></tr>)}</tbody>
      </table></div></section>
    </AdminLayout>
  );
}