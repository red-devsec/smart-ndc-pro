import { useState, useCallback, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from "react-native";
import api from "../../services/api";
import { useBarcodeScanner, BarcodeResult } from "../../hooks/useBarcodeScanner";
import { useZebraScanner } from "../../hooks/useZebraScanner";

export default function ScanScreen() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState("1");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"camera" | "manual">("camera");

  // ── Camera barcode scanner ──
  const {
    permission, requestPermission, scanned,
    torchOn, handleBarcodeScanned, resetScan,
    CameraView, barcodeScannerSettings,
  } = useBarcodeScanner({
    onBarcodeScanned: (result: BarcodeResult) => {
      setBarcode(result.data);
      handleSearchWithCode(result.data);
    },
  });

  // ── Zebra scanner (terminaux durcis) ──
  const zebra = useZebraScanner({
    onBarcodeScanned: (result) => {
      setBarcode(result.data);
      handleSearchWithCode(result.data);
    },
  });

  const handleSearchWithCode = useCallback(async (code: string) => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await api.get(`/products/barcode/${encodeURIComponent(code)}`);
      if (res.data.success) {
        setProduct(res.data.data);
      } else {
        Alert.alert("Erreur", "Produit non trouvé");
      }
    } catch {
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => handleSearchWithCode(barcode.trim());

  const handleMovement = async (type: "in" | "out") => {
    if (!product) return;
    setLoading(true);
    try {
      const res = await api.post("/movements", {
        productId: product.id,
        type,
        reason: type === "in" ? "replenishment" : "sale",
        quantity: parseInt(qty) || 1,
      });
      if (res.data.success) {
        Alert.alert("Succès", `Mouvement ${type === "in" ? "entrée" : "sortie"} enregistré`);
        setProduct(null);
        setBarcode("");
        resetScan();
      } else {
        Alert.alert("Erreur", res.data.error);
      }
    } catch {
      Alert.alert("Erreur", "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // ── Permission caméra ──
  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        "Permission requise",
        "La permission caméra est nécessaire pour scanner les codes-barres. Activez-la dans les réglages."
      );
    }
  }, [permission]);

  // ── Mode écran (camera vs manual) ──
  if (mode === "camera" && permission?.granted) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={barcodeScannerSettings}
          enableTorch={torchOn}
        >
          {/* Scanner overlay */}
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.overlayText}>
              {scanned ? "Code détecté !" : "Positionnez le code-barres dans le cadre"}
            </Text>

            {/* Bottom controls */}
            <View style={styles.controls}>
              {scanned && (
                <TouchableOpacity style={styles.controlBtn} onPress={resetScan}>
                  <Text style={styles.controlBtnText}>Re-scanner</Text>
                </TouchableOpacity>
              )}
              {zebra.isAvailable && (
                <TouchableOpacity
                  style={[styles.controlBtn, { backgroundColor: "#2E90FA" }]}
                  onPress={() => zebra.startScanning()}
                >
                  <Text style={styles.controlBtnText}>Zebra</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.controlBtn, { backgroundColor: "#667085" }]}
                onPress={() => setMode("manual")}
              >
                <Text style={styles.controlBtnText}>Manuel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>

        {/* Product result overlay at bottom */}
        {product && (
          <View style={styles.productSheet}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productInfo}>
              Stock: {product.quantity} | {product.price} DH
            </Text>
            <View style={styles.qtyRow}>
              <TextInput
                style={styles.qtyInput}
                value={qty}
                onChangeText={setQty}
                keyboardType="numeric"
                placeholder="Qté"
              />
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#12B76A" }]}
                onPress={() => handleMovement("in")}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Entrée</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#F04438" }]}
                onPress={() => handleMovement("out")}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Sortie</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // ── Mode manuel / permission non accordée ──
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {!permission?.granted && (
        <View style={styles.permissionBanner}>
          <Text style={styles.permissionText}>
            Activez la caméra pour scanner automatiquement
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Activer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Code-barres"
          value={barcode}
          onChangeText={setBarcode}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>OK</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: "#465FFF" }]}
          onPress={() => {
            if (permission?.granted) {
              setMode("camera");
              resetScan();
            } else {
              requestPermission();
            }
          }}
        >
          <Text style={styles.searchBtnText}>📷</Text>
        </TouchableOpacity>
      </View>

      {product && (
        <View style={styles.productCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productInfo}>
            Stock: {product.quantity} | {product.price} DH
          </Text>
          <View style={styles.qtyRow}>
            <TextInput
              style={styles.qtyInput}
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              placeholder="Qté"
            />
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#12B76A" }]}
              onPress={() => handleMovement("in")}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Entrée</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#F04438" }]}
              onPress={() => handleMovement("out")}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Sortie</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ── Camera mode ──
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#fff",
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  overlayText: { color: "#fff", fontSize: 15, textAlign: "center", marginTop: 24, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  controls: { flexDirection: "row", gap: 12, marginTop: 40 },
  controlBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#465FFF", borderRadius: 10 },
  controlBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  productSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  // ── Manual mode ──
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  permissionBanner: {
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  permissionText: { fontSize: 13, color: "#3538CD", flex: 1, marginRight: 12 },
  permissionBtn: { backgroundColor: "#465FFF", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  permissionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  searchBtn: {
    height: 48,
    width: 48,
    backgroundColor: "#465FFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: { color: "#fff", fontWeight: "bold" },
  productCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  productName: { fontSize: 16, fontWeight: "600", color: "#1D2939" },
  productInfo: { fontSize: 13, color: "#667085", marginTop: 4 },
  qtyRow: { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center" },
  qtyInput: {
    width: 60,
    height: 44,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  actionBtn: { flex: 1, height: 44, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  actionBtnText: { color: "#fff", fontWeight: "600" },
});
