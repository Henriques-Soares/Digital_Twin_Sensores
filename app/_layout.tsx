// app/_layout.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useEffect, useState } from "react";

function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  // Rotas liberadas sem token
  const openRoutes = new Set<string>(["/login", "/config"]);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      setHasToken(!!token);

      const path = (pathname || "").toLowerCase();
      const isOpen = openRoutes.has(path);

      if (!token && !isOpen) {
        router.replace("/login");
      } else if (token && path === "/login") {
        router.replace("/sensors");
      }
      setChecked(true);
    })();
  }, [pathname]);

  if (!checked) return null; // splash simples
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <>
      <AuthGate>
        <Stack screenOptions={{ headerShown: true }}>
          <Stack.Screen name="sensors" options={{ title: "Sensores" }} />
          <Stack.Screen name="sensor/[id]" options={{ title: "Detalhe do Sensor" }} />
          <Stack.Screen name="config" options={{ title: "Configurações" }} />
          <Stack.Screen name="login" options={{ title: "Login" }} />
        </Stack>
      </AuthGate>
      <StatusBar style="auto" />
    </>
  );
}
