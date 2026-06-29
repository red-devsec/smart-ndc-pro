import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function HrScreen() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    api.get(`/leaves?status=${filter}`)
      .then((r) => r.data.success && setLeaves(r.data.data))
      .catch(() => {});
  }, [filter]);

  const handleStatus = async (id: string, status: string) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      setLeaves((prev) => prev.filter((l) => l.id !== id));
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {["pending", "approved", "rejected"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, filter === t && styles.tabActive]}
            onPress={() => setFilter(t)}
          >
            <Text style={[styles.tabText, filter === t && styles.tabTextActive]}>
              {t === "pending" ? "En attente" : t === "approved" ? "Approuvés" : "Refusés"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={leaves}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.employeeName}</Text>
            <Text style={styles.detail}>{item.type} • {new Date(item.startDate).toLocaleDateString("fr-FR")} → {new Date(item.endDate).toLocaleDateString("fr-FR")}</Text>
            <Text style={styles.reason}>{item.reason}</Text>
            {filter === "pending" && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleStatus(item.id, "approved")}>
                  <Text style={styles.btnText}>Approuver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleStatus(item.id, "rejected")}>
                  <Text style={styles.btnText}>Refuser</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune demande</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  tabs: { flexDirection: "row", marginBottom: 16, gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#fff" },
  tabActive: { backgroundColor: "#465FFF" },
  tabText: { color: "#667085", fontWeight: "500" },
  tabTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10 },
  name: { fontSize: 15, fontWeight: "600", color: "#1D2939" },
  detail: { fontSize: 13, color: "#667085", marginTop: 4 },
  reason: { fontSize: 13, color: "#98A2B3", marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  approveBtn: { flex: 1, backgroundColor: "#12B76A", borderRadius: 8, padding: 10, alignItems: "center" },
  rejectBtn: { flex: 1, backgroundColor: "#F04438", borderRadius: 8, padding: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  empty: { textAlign: "center", color: "#98A2B3", marginTop: 40 },
});
