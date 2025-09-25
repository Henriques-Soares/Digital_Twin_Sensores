import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="sensors" options={{ title: "Sensores" }} />
        <Stack.Screen name="sensor/[id]" options={{ title: "Detalhe do Sensor" }} />
        <Stack.Screen name="config" options={{ title: "Configurações" }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
