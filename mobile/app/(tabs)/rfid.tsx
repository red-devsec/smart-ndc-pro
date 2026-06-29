import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { useRfidScanner } from "../../hooks/useRfidScanner";
import { useAuthStore } from "../../store/authStore";

export default function RfidScreen() {
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const user = useAuthStore((s) => s.user);

  const handleTagRead = async (tag: { id: string }) => {
    setStatus("scanning");
    setMessage("Badge détecté ! Enregistrement...");
    try {
      const res = await api.post("/attendance/checkin", { rfidUid: tag.id });
      if (res.data.success) {
        setStatus("success");
        setMessage(res.data.message || "Pointage enregistré");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.response?.data?.error || "Erreur de pointage");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const { isSupported, isScanning, readRfidTag } = useRfidScanner({
    onTagRead: handleTagRead,
  });

  const handleManualScan = async () => {
    setStatus("scanning");
    setMessage("Approchez le badge du téléphone...");
    try {
      await readRfidTag();
    } catch {
      setStatus("error");
      setMessage("Aucun badge détecté");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Pointage RFID/NFC</Text>
        <Text style={styles.subtitle}>
          Utilisez le lecteur NFC du téléphone ou un lecteur physique
        </Text>

        <View style={styles.readerBox}>
          {status === "idle" && (
            <Text style={styles.readerIcon}>📡</Text>
          )}
          {status === "scanning" && (
            <ActivityIndicator size="large" color="#465FFF" />
          )}
          {status === "success" && (
            <Text style={styles.readerIcon}>✅</Text>
          )}
          {status === "error" && (
            <Text style={styles.readerIcon}>❌</Text>
          )}
          <Text style={[
            styles.statusText,
            status === "success" && { color: "#12B76A" },
            status === "error" && { color: "#F04438" },
          ]}>{message}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isScanning && styles.buttonDisabled]}
          onPress={handleManualScan}
          disabled={isScanning}
        >
          <Text style={styles.buttonText}>
            {isScanning ? "Scan en cours..." : "Scanner mon badge"}
          </Text>
        </TouchableOpacity>

        {!isSupported && (
          <Text style={styles.warning}>
            NFC non disponible sur cet appareil. Utilisez un lecteur RFID physique.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16, justifyContent: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 24, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", color: "#1D2939" },
  subtitle: { fontSize: 13, color: "#667085", textAlign: "center", marginTop: 8, marginBottom: 24 },
  readerBox: { width: 160, height: 160, borderRadius: 80, backgroundColor: "#F0F4FF", justifyContent: "center", alignItems: "center", marginBottom: 24 },
  readerIcon: { fontSize: 48 },
  statusText: { fontSize: 14, color: "#667085", marginTop: 8, textAlign: "center" },
  button: { backgroundColor: "#465FFF", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  warning: { fontSize: 12, color: "#F79009", textAlign: "center", marginTop: 16 },
});
