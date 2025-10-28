// app/sensor/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiFetch } from "../../services/api";

type Reading = {
  id: number;
  sensorId: string;
  value: number;
  timestamp: string; // ISO
};

export default function SensorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [items, setItems] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const arr = await apiFetch<any[]>(
        `/api/readings?sensorId=${encodeURIComponent(String(id))}`
      );
      const mapped: Reading[] = (Array.isArray(arr) ? arr : []).map((n) => ({
        id: Number(n.id),
        sensorId: String(n.sensorId ?? n.sensor_id ?? id),
        value: Number(n.value ?? n.sensorValue ?? n.sensor_value ?? 0),
        timestamp: String(n.timestamp ?? n.timestamp_utc ?? n.timestampUtc),
      }));
      // Ordena do mais recente para o mais antigo
      mapped.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setItems(mapped);
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao carregar histórico.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sensor</Text>
        <Text style={{ marginTop: 12 }}>ID inválido.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensor: {String(id)}</Text>

      {loading ? (
        <View style={{ paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      ) : items.length === 0 ? (
        <Text style={{ marginTop: 16 }}>Sem leituras.</Text>
      ) : (
        <FlatList
          style={{ marginTop: 12 }}
          data={items}
          keyExtractor={(r) => `${r.id}-${r.timestamp}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTime}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.rowId}>ID leitura: {item.id}</Text>
              </View>
              <Text style={styles.rowValue}>{item.value}</Text>
            </View>
          )}
          ListFooterComponent={<View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowTime: { color: "#333", fontWeight: "600" },
  rowId: { color: "#666", fontSize: 12, marginTop: 2 },
  rowValue: { fontWeight: "800", fontSize: 18 },
});
