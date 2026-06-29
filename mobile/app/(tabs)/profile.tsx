import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { logout } from "../../services/auth";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const reset = useAuthStore((s) => s.reset);

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          reset();
          router.replace("/login");
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.name}>{user?.name || "Utilisateur"}</Text>
      <Text style={styles.role}>{user?.role || "Employé"}</Text>
      <Text style={styles.email}>{user?.email || ""}</Text>
      <View style={styles.menu}>
        {["Mes pointages", "Mes congés", "Mes attestations", "Mes bulletins"].map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem}>
            <Text style={styles.menuItemText}>{item}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16, alignItems: "center" },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#465FFF", justifyContent: "center", alignItems: "center", marginTop: 40, marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  name: { fontSize: 20, fontWeight: "bold", color: "#1D2939" },
  role: { fontSize: 14, color: "#667085" },
  email: { fontSize: 13, color: "#98A2B3", marginBottom: 24 },
  menu: { width: "100%" },
  menuItem: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 8 },
  menuItemText: { fontSize: 15, color: "#1D2939" },
  arrow: { fontSize: 20, color: "#98A2B3" },
  logoutBtn: { marginTop: 40, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, borderWidth: 1, borderColor: "#F04438" },
  logoutText: { color: "#F04438", fontSize: 15, fontWeight: "500" },
});
