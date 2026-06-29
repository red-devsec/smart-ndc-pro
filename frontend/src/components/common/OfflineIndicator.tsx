import { useOfflineQueue } from "../../hooks/useOfflineQueue";

export function OfflineIndicator() {
  const { online, queue } = useOfflineQueue();
  if (online && queue.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        background: online ? "#92400e" : "#b91c1c",
        color: "white",
        padding: "8px 14px",
        borderRadius: 8,
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {online ? `Synchronisation: ${queue.length} en attente` : `Hors-ligne — ${queue.length} action(s) en file`}
    </div>
  );
}