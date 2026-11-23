import { useEffect, useState } from "react";
import { Armchair, CheckCircle2, Users, Clock3 } from "lucide-react";
import { getAllQueuesAPI, getAllTablesAPI } from "../services/allAPI.js";

const STAT_CONFIGS = [
  { label: "Total tables",     valueKey: "total",     Icon: Armchair,      iconBg: "var(--color-primary-soft)",    iconColor: "var(--color-primary)" },
  { label: "Available tables", valueKey: "available", Icon: CheckCircle2,  iconBg: "#e4f4ec",                      iconColor: "#15694e" },
  { label: "Occupied tables",  valueKey: "occupied",  Icon: Users,         iconBg: "#fdf0f0",                      iconColor: "#a63434" },
  { label: "Waiting parties",  valueKey: "waiting",   Icon: Clock3,        iconBg: "#fdf5df",                      iconColor: "#92650a" }
];

export default function StatsCards() {
  const [tables, setTables] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const [tablesResponse, queueResponse] = await Promise.all([
          getAllTablesAPI(),
          getAllQueuesAPI()
        ]);

        if (!active) return;

        if (!Array.isArray(tablesResponse.data) || !Array.isArray(queueResponse.data)) {
          throw new Error("Invalid response received from the server.");
        }

        setTables(tablesResponse.data);
        setQueue(queueResponse.data);

      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load dashboard statistics."
          );
        }
      } finally {
        if (active) { setLoading(false); }
      }
    }

    loadStats();
    return () => { active = false; };
  }, []);

  const values = {
    total:     tables.length,
    available: tables.filter((t) => t.status === "Available").length,
    occupied:  tables.filter((t) => t.status === "Occupied").length,
    waiting:   queue.filter((e) => e.status === "Waiting").length
  };

  return (
    <>
      <div className="stats-grid">
        {STAT_CONFIGS.map(({ label, valueKey, Icon, iconBg, iconColor }) => (
          <article className="stat-card" key={label}>
            <Icon size={20} style={{ background: iconBg, color: iconColor }} />
            <small>{label}</small>
            <strong>{loading ? "—" : values[valueKey]}</strong>
            <span>{loading ? "Loading…" : "Live overview"}</span>
          </article>
        ))}
      </div>

      {error && <p className="form-error" style={{ marginTop: 8 }}>{error}</p>}
    </>
  );
}
