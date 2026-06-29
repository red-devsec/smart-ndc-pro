import { View, Text, FlatList, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    api.get("/employees")
      .then((r) => r.data.success && setEmployees(r.data.data))
      .catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.position}>{item.position}</Text>
              <Text style={styles.dept}>{item.departmentName}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun employé</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#465FFF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#1D2939" },
  position: { fontSize: 13, color: "#667085", marginTop: 2 },
  dept: { fontSize: 12, color: "#98A2B3", marginTop: 1 },
  empty: { textAlign: "center", color: "#98A2B3", marginTop: 40 },
});
