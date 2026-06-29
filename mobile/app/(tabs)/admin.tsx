import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminScreen() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get("/admin/stats")
      .then((r) => r.data.success && setStats(r.data.data))
      .catch(() => {});
    api.get("/admin/users")
      .then((r) => r.data.success && setUsers(r.data.data))
      .catch(() => {});
  }, []);

  const statCards = [
    { label: "Utilisateurs", value: stats?.users },
    { label: "Employés", value: stats?.employees },
    { label: "Produits", value: stats?.products },
    { label: "Mouvements", value: stats?.movements },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Administration</Text>
      <View style={styles.statsGrid}>
        {statCards.map((s, i) => (
          <View key={i} style={styles.stat}>
            <Text style={styles.statValue}>{s.value ?? "-"}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Services</Text>
      <View style={styles.servicesGrid}>
        {[
          { name: "PostgreSQL", status: "online" },
          { name: "Redis", status: "online" },
          { name: "RabbitMQ", status: "online" },
          { name: "MinIO", status: "online" },
        ].map((s, i) => (
          <View key={i} style={styles.serviceCard}>
            <View style={[styles.dot, { backgroundColor: s.status === "online" ? "#12B76A" : "#F04438" }]} />
            <Text style={styles.serviceName}>{s.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Utilisateurs ({users.length})</Text>
      {users.map((u) => (
        <View key={u.id} style={styles.userCard}>
          <Text style={styles.userName}>{u.name}</Text>
          <Text style={styles.userRole}>{u.role}</Text>
          <Text style={styles.userEmail}>{u.email}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1D2939", marginBottom: 20 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  stat: { width: "47%", backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#465FFF" },
  statLabel: { fontSize: 13, color: "#667085", marginTop: 4 },
  section: { fontSize: 16, fontWeight: "600", color: "#1D2939", marginBottom: 12 },
  servicesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  serviceCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, padding: 12, gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  serviceName: { fontSize: 13, color: "#1D2939" },
  userCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8 },
  userName: { fontSize: 15, fontWeight: "600", color: "#1D2939" },
  userRole: { fontSize: 13, color: "#465FFF", marginTop: 2 },
  userEmail: { fontSize: 12, color: "#98A2B3", marginTop: 2 },
});
