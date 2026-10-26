import { NavLink } from "react-router-dom";
import { Armchair, Utensils, ShoppingCart, ClipboardList } from "lucide-react";
import Brand from "./Brand.jsx";

const navigation = [
  { label: "Queue", path: "/customer/queue", Icon: Armchair },
  { label: "Menu", path: "/customer/menu", Icon: Utensils },
  { label: "Cart", path: "/customer/cart", Icon: ShoppingCart },
  { label: "Order", path: "/customer/order", Icon: ClipboardList }
];

export default function CustomerLayout({ active, children }) {
  return (
    <div className="customer-layout">
      <header className="customer-header">
        <Brand />
        <span className="profile-icon">◎</span>
      </header>
      <main className="customer-content">{children}</main>
      <nav className="bottom-nav">
        {navigation.map(({ label, path, Icon }) => (
          <NavLink key={label} to={path} className={active === label ? "active" : ""}>
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}