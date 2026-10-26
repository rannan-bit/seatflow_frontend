import { NavLink } from "react-router-dom";
import { LayoutDashboard, Armchair, Utensils, ClipboardList, Users, LogOut } from "lucide-react";
import Brand from "./Brand.jsx";

const staffLinks = [
  { label: "Dashboard", path: "/staff", Icon: LayoutDashboard },
  { label: "Tables & Queue", path: "/staff/tables", Icon: Armchair },
  { label: "Orders", path: "/staff/orders", Icon: ClipboardList }
];
const adminLinks = [
  { label: "Dashboard", path: "/admin", Icon: LayoutDashboard },
  { label: "Tables", path: "/admin/tables", Icon: Armchair },
  { label: "Menu management", path: "/admin/menu", Icon: Utensils },
  { label: "Orders", path: "/admin/orders", Icon: ClipboardList },
  { label: "Staff management", path: "/admin/staff", Icon: Users }
];

export default function AdminLayout({ role, title, children }) {
  const links = role === "Staff" ? staffLinks : adminLinks;
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Brand />
        <small className="sidebar-label">{role.toUpperCase()} WORKSPACE</small>
        {links.map(({ label, path, Icon }) => (
          <NavLink key={path} end={path === "/staff" || path === "/admin"} to={path}>
            <Icon size={17} /> {label}
          </NavLink>
        ))}
        <div className="sidebar-user">
          <span>{role[0]}</span>
          <strong>{role} account</strong>
          <LogOut size={15} />
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <span>{role} / <strong>{title}</strong></span>
          <span className="status-pill available">● Restaurant open</span>
        </header>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}