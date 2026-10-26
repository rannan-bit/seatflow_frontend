import { Armchair, CheckCircle2, Users, Clock3 } from "lucide-react";

const stats = [
  { label: "Total tables", value: "12", Icon: Armchair },
  { label: "Available tables", value: "7", Icon: CheckCircle2 },
  { label: "Occupied tables", value: "4", Icon: Users },
  { label: "Waiting parties", value: "3", Icon: Clock3 }
];

export default function StatsCards() {
  return (
    <div className="stats-grid">
      {stats.map(({ label, value, Icon }) => (
        <article className="stat-card" key={label}>
          <Icon size={20} />
          <small>{label}</small>
          <strong>{value}</strong>
          <span>Live overview</span>
        </article>
      ))}
    </div>
  );
}