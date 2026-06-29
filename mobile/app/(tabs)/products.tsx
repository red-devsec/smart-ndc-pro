import { View, Text, FlatList, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get("/products")
      .then((r) => r.data.success && setProducts(r.data.data))
      .catch(() => {});
  }, []);

  const stockColor = (qty: number, threshold: number) => {
    if (qty <= 0) return "#F04438";
    if (qty <= threshold) return "#F79009";
    return "#12B76A";
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.badge, { backgroundColor: stockColor(item.quantity, item.minThreshold) }]}>
                <Text style={styles.badgeText}>{item.quantity}</Text>
              </View>
            </View>
            <Text style={styles.category}>{item.categoryName}</Text>
            <Text style={styles.barcode}>{item.barcode}</Text>
            <Text style={styles.price}>{item.price.toLocaleString("fr-FR")} DH</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun produit</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "600", color: "#1D2939", flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  category: { fontSize: 13, color: "#667085", marginTop: 4 },
  barcode: { fontSize: 12, color: "#98A2B3", marginTop: 2 },
  price: { fontSize: 14, fontWeight: "500", color: "#465FFF", marginTop: 4 },
  empty: { textAlign: "center", color: "#98A2B3", marginTop: 40 },
});
