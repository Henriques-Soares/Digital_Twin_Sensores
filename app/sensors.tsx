import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Reading = {
  id: number;
  sensorId: string;
  value?: number;
  sensorValue?: number;
  timestamp: string;
};

async function getBaseUrl(): Promise<string> {
  const stored = await AsyncStorage.getItem('API_URL');
  if (stored && stored.trim()) return stored.replace(/\/+$/, '');
  return Platform.OS === 'web' ? 'http://localhost:8080' : 'http://10.0.2.2:8080';
}

async function fetchReadings(sensorId?: string): Promise<Reading[]> {
  const base = await getBaseUrl();
  const primary = sensorId
    ? `${base}/api/readings?sensorId=${encodeURIComponent(sensorId)}`
    : `${base}/api/readings`;

  try {
    const res = await fetch(primary);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as any[];
    return (Array.isArray(data) ? data : []).map((n) => ({
      id: n.id,
      sensorId: n.sensorId,
      value: n.value ?? n.sensorValue,
      timestamp: n.timestamp,
    }));
  } catch {
    if (sensorId) {
      const res = await fetch(`${base}/api/readings/sensor/${encodeURIComponent(sensorId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as any[];
      return (Array.isArray(data) ? data : []).map((n) => ({
        id: n.id,
        sensorId: n.sensorId,
        value: n.value ?? n.sensorValue,
        timestamp: n.timestamp,
      }));
    }
    throw new Error('Falha ao carregar leituras');
  }
}

export default function SensorListScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReadings();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => {
    const by: Record<string, Reading[]> = {};
    for (const r of items) (by[r.sensorId] ||= []).push(r);

    const latest = Object.entries(by).map(([sid, arr]) => {
      arr.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const last = arr[arr.length - 1];
      return { sensorId: sid, value: last?.value, timestamp: last?.timestamp };
    });

    return latest
      .filter((it) => !filter || it.sensorId.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => (a.sensorId > b.sensorId ? 1 : -1));
  }, [items, filter]);

  if (loading) return <ActivityIndicator style={{ marginTop: 32 }} />;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12 }}>
        <TextInput
          placeholder="Filtrar por sensorId (ex.: S-001)"
          value={filter}
          onChangeText={setFilter}
          style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
        />
        <TouchableOpacity onPress={() => router.push('/config')} style={{ paddingVertical: 8 }}>
          <Text style={{ color: '#007AFF', marginTop: 8 }}>⚙️ Abrir Configurações</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(it) => it.sensorId}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/sensor/[id]', params: { id: item.sensorId } })}
          >
            <Text style={styles.name}>{item.sensorId}</Text>
            <Text>Valor: {item.value?.toFixed(2) ?? '--'}</Text>
            <Text>Atualizado: {item.timestamp ? new Date(item.timestamp).toLocaleString() : '--'}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 15,
    padding: 18,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    minWidth: 180,
  },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
});
