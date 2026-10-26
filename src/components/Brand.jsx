import { Link } from "react-router-dom";
import { Armchair } from "lucide-react";

export default function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-icon"><Armchair size={17} /></span>
      <span>
        <strong>SeatFlow</strong>
        <small>THE OLIVE ROOM · INDIRANAGAR</small>
      </span>
    </Link>
  );
}