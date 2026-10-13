export function BatchCard({ batch }: { batch: { name: string; weightKg: number } }) {
  return (
    <article className="rounded-md border p-4 focus-visible:ring-2">
      <h2 className="text-lg font-semibold">{batch.name}</h2>
      <img src="/batch.jpg" alt="Harvest crates for this batch" />
      <p style={{ color: "#2F5D50" }}>{batch.weightKg} kg</p>
      <button className="transition-opacity">Mark as dispatched</button>
    </article>
  );
}
