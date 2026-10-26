import { Link } from "react-router-dom";
import { Armchair, Utensils, ClipboardList, Users } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import StatsCards from "../../components/StatsCards.jsx";

const shortcuts = [
  { title: "Table management", description: "Manage table capacity and availability", path: "/admin/tables", Icon: Armchair },
  { title: "Menu management", description: "Update dishes, prices and availability", path: "/admin/menu", Icon: Utensils },
  { title: "Order management", description: "Review and update customer orders", path: "/admin/orders", Icon: ClipboardList },
  { title: "Staff management", description: "Manage restaurant staff accounts", path: "/admin/staff", Icon: Users }
];

export default function AdminDashboard() {
  return (
    <AdminLayout role="Admin" title="Dashboard">
      <h1>Restaurant overview</h1><p className="muted-text">Manage your restaurant operations from one place.</p>
      <StatsCards />
      <div className="shortcut-grid">
        {shortcuts.map(({ title, description, path, Icon }) => <Link className="shortcut-card" to={path} key={path}><Icon size={22} /><div><strong>{title}</strong><p>{description}</p></div><span>›</span></Link>)}
      </div>
    </AdminLayout>
  );
}