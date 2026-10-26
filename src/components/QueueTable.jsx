export default function QueueTable({ queue }) {
  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>TOKEN / GUEST</th><th>PARTY</th><th>CHECK-IN</th><th>STATUS</th></tr></thead>
        <tbody>
          {queue.map((guest) => (
            <tr key={guest.id}>
              <td><strong>{guest.id}</strong><small>{guest.name}</small></td>
              <td>{guest.guests} guests</td>
              <td>{guest.time}</td>
              <td><span className="status-pill waiting">{guest.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}