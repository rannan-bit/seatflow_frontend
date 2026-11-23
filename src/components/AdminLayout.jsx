import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Armchair, Utensils, ClipboardList, Users, LogOut, Clock3 } from "lucide-react";
import Brand from "./Brand.jsx";

const staffLinks = [
  { label: "Dashboard", path: "/staff", Icon: LayoutDashboard },
  { label: "Queue management", path: "/staff/queue", Icon: Clock3 },
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
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("seatflowUser");
    navigate(role === "Admin" ? "/admin-login" : "/staff-login");
  }

  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem("seatflowUser") || "{}"); } catch { return {}; }
  })();

  const displayName = user?.name || `${role} account`;
  const initials = displayName.trim().charAt(0).toUpperCase() || role.charAt(0);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Brand />
        <small className="sidebar-label">{role.toUpperCase()} WORKSPACE</small>
        {links.map(({ label, path, Icon }) => (
          <NavLink key={path} end={path === "/staff" || path === "/admin"} to={path}>
            <Icon size={16} /> {label}
          </NavLink>
        ))}
        <div className="sidebar-user">
          <span title={displayName}>{initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </strong>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{ background: "none", border: "none", padding: "4px", display: "grid", placeItems: "center", cursor: "pointer", minHeight: "unset", color: "var(--color-subtle)", borderRadius: "6px" }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <span style={{ color: "var(--color-subtle)", fontSize: "13px" }}>
            {role} / <strong>{title}</strong>
          </span>
          <span className="status-pill available" style={{ fontSize: "11px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
            Restaurant open
          </span>
        </header>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
