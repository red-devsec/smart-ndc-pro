import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";

import { login } from "../services/auth";
import { useAuthStore } from "../store/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert("Erreur", "Veuillez remplir tous les champs"); return; }
    setLoading(true);
    try {
      const { token, user } = await login(email, password);
      setToken(token);
      setUser(user);
      router.replace("/(tabs)");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Impossible de se connecter au serveur";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.bannerLogo}>
          <Text style={styles.bannerLogoText}>N</Text>
        </View>
        <View style={styles.bannerTextBlock}>
          <Text style={styles.bannerTitle}>Connexion</Text>
          <Text style={styles.bannerSubtitle}>SMART NDC</Text>
        </View>
      </View>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#98A2B3" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Mot de passe" placeholderTextColor="#98A2B3" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", padding: 24 },
  banner: {
    width: "100%",
    maxWidth: 400,
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 40,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#D6E4FF",
  },
  bannerLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#465FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  bannerLogoText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  bannerTextBlock: { flex: 1 },
  bannerTitle: { fontSize: 18, fontWeight: "700", color: "#1D2939", letterSpacing: 0.3 },
  bannerSubtitle: { fontSize: 13, fontWeight: "600", color: "#465FFF", marginTop: 1, letterSpacing: 0.5 },
  form: { gap: 16 },
  input: { height: 48, borderWidth: 1, borderColor: "#D0D5DD", borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: "#1D2939", backgroundColor: "#FCFCFD" },
  button: { height: 48, backgroundColor: "#465FFF", borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
