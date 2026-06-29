import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ReportsScreen() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/dashboard")
      .then((r) => r.data.success && setStats(r.data.data))
      .catch(() => {});
  }, []);

  const handleExport = async () => {
    try {
      const res = await api.get("/reports/hr/attendance/export");
      if (res.data.success) {
        alert("Export généré : " + res.data.data.url);
      }
    } catch {
      alert("Erreur lors de l'export");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.section}>Rapports RH</Text>
      <TouchableOpacity style={styles.card} onPress={handleExport}>
        <Text style={styles.cardTitle}>📊 Exporter les pointages</Text>
        <Text style={styles.cardSub}>Générer un fichier Excel des présences</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Rapports Stock</Text>
      <View style={styles.statsGrid}>
        <View style={styles.stat}><Text style={styles.statValue}>{stats?.totalProducts || "-"}</Text><Text style={styles.statLabel}>Produits</Text></View>
        <View style={styles.stat}><Text style={styles.statValue}>{stats?.stockAlerts || "-"}</Text><Text style={styles.statLabel}>Alertes</Text></View>
        <View style={styles.stat}><Text style={styles.statValue}>{stats?.movementsToday || "-"}</Text><Text style={styles.statLabel}>Mouvements</Text></View>
      </View>

      <Text style={styles.section}>Rapports Combinés</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Traçabilité complète</Text>
        <Text style={styles.cardSub}>Qui a pris quoi et quand</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚠️ Anomalies</Text>
        <Text style={styles.cardSub}>Mouvements sans pointage détectés</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  section: { fontSize: 16, fontWeight: "600", color: "#1D2939", marginTop: 20, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#1D2939" },
  cardSub: { fontSize: 13, color: "#667085", marginTop: 4 },
  statsGrid: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#465FFF" },
  statLabel: { fontSize: 12, color: "#667085", marginTop: 4 },
});
