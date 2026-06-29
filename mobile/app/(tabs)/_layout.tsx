import { useEffect } from "react";
import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { router } from "expo-router";
import { syncPendingActions, startPeriodicSync } from "../../services/sync";
import { subscribeToNetwork } from "../../services/offline";

type UserRole = "ADMIN" | "MANAGER" | "RH" | "MAGASINIER" | "EMPLOYE";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    dashboard: "📊", employees: "👥", products: "📦",
    scan: "📷", profile: "👤", reports: "📈",
    hr: "📋", admin: "⚙️", rfid: "📡",
  };
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: focused ? 24 : 22 }}>{icons[name] || "📄"}</Text>
    </View>
  );
}

interface TabDef {
  name: string;
  title: string;
  icon: string;
  roles: UserRole[];
}

const allTabs: TabDef[] = [
  { name: "dashboard", title: "Dashboard", icon: "dashboard", roles: ["ADMIN", "MANAGER", "RH", "MAGASINIER", "EMPLOYE"] },
  { name: "rfid", title: "Pointage", icon: "rfid", roles: ["ADMIN", "MANAGER", "RH", "MAGASINIER", "EMPLOYE"] },
  { name: "employees", title: "Employés", icon: "employees", roles: ["ADMIN", "RH"] },
  { name: "hr", title: "RH", icon: "hr", roles: ["ADMIN", "RH"] },
  { name: "products", title: "Stock", icon: "products", roles: ["ADMIN", "MANAGER", "MAGASINIER"] },
  { name: "scan", title: "Scan", icon: "scan", roles: ["ADMIN", "MANAGER", "MAGASINIER"] },
  { name: "reports", title: "Rapports", icon: "reports", roles: ["ADMIN", "MANAGER", "RH", "MAGASINIER"] },
  { name: "admin", title: "Admin", icon: "admin", roles: ["ADMIN"] },
  { name: "profile", title: "Profil", icon: "profile", roles: ["ADMIN", "MANAGER", "RH", "MAGASINIER", "EMPLOYE"] },
];

export default function TabLayout() {
  const user = useAuthStore((s) => s.user);
  const userRole = (user?.role || "EMPLOYE") as UserRole;

  // Sync offline queue on mount and when coming back online
  useEffect(() => {
    syncPendingActions();
    const stopSync = startPeriodicSync();
    const unsub = subscribeToNetwork((online) => {
      if (online) syncPendingActions();
    });
    return () => { stopSync(); unsub(); };
  }, []);

  const visibleTabs = allTabs.filter((t) => t.roles.includes(userRole));

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: "#465FFF",
      tabBarInactiveTintColor: "#98A2B3",
      tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#E4E7EC", paddingBottom: 8, height: 60 },
      headerStyle: { backgroundColor: "#fff" },
      headerTitleStyle: { color: "#1D2939", fontWeight: "600" },
    }}>
      {visibleTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => <TabIcon name={tab.icon} focused={focused} />,
          }}
        />
      ))}
    </Tabs>
  );
}
