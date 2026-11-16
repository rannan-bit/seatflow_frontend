import { useEffect, useState } from "react";
import { Armchair, CheckCircle2, Users, Clock3 } from "lucide-react";
import { getAllQueuesAPI, getAllTablesAPI } from "../services/allAPI.js";

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
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, []);

  const stats = [
    {
      label: "Total tables",
      value: tables.length,
      Icon: Armchair
    },
    {
      label: "Available tables",
      value: tables.filter((table) => table.status === "Available").length,
      Icon: CheckCircle2
    },
    {
      label: "Occupied tables",
      value: tables.filter((table) => table.status === "Occupied").length,
      Icon: Users
    },
    {
      label: "Waiting parties",
      value: queue.filter((entry) => entry.status === "Waiting").length,
      Icon: Clock3
    }
  ];

  return (
    <>
      <div className="stats-grid">
        {stats.map(({ label, value, Icon }) => (
          <article className="stat-card" key={label}>
            <Icon size={20} />
            <small>{label}</small>
            <strong>{loading ? "—" : value}</strong>
            <span>{loading ? "Loading…" : "Live overview"}</span>
          </article>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}
    </>
  );
}