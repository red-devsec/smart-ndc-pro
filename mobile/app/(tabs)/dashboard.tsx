import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/dashboard")
      .then((r) => r.data.success && setStats(r.data.data))
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Employés", value: stats?.totalEmployees ?? "-", color: "#465FFF" },
    { label: "Présents", value: stats?.presentToday ?? "-", color: "#12B76A" },
    { label: "Absents", value: stats?.absentToday ?? "-", color: "#F04438" },
    { label: "Alertes Stock", value: stats?.stockAlerts ?? "-", color: "#F79009" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Bonjour 👋</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</Text>
      <View style={styles.grid}>
        {cards.map((c, i) => (
          <View key={i} style={[styles.card, { borderLeftColor: c.color, borderLeftWidth: 4 }]}>
            <Text style={[styles.cardValue, { color: c.color }]}>{c.value}</Text>
            <Text style={styles.cardLabel}>{c.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Derniers mouvements</Text>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.movement}>
          <Text style={styles.movementProduct}>Produit #{i}</Text>
          <Text style={styles.movementMeta}>Il y a {i * 10} minutes</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#1D2939", marginBottom: 4 },
  date: { fontSize: 14, color: "#667085", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  card: { width: "47%", backgroundColor: "#fff", borderRadius: 12, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardValue: { fontSize: 28, fontWeight: "bold" },
  cardLabel: { fontSize: 13, color: "#667085", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1D2939", marginBottom: 12 },
  movement: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 8 },
  movementProduct: { fontSize: 14, fontWeight: "500", color: "#1D2939" },
  movementMeta: { fontSize: 12, color: "#98A2B3", marginTop: 2 },
});
