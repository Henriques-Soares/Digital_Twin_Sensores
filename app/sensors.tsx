// app/sensors.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiFetch } from '../services/api';

type Reading = {
  id: number;
  sensorId: string;
  value: number;
  timestamp: string; // ISO
};

export default function SensorsScreen() {
  const router = useRouter();
  const [data, setData] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sensorFilter, setSensorFilter] = useState('');

  const baseUrlState = {
    get: async () => (await AsyncStorage.getItem('api_base')) || (Platform.OS === 'web' ? 'http://localhost:8080' : 'http://10.0.2.2:8080'),
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = sensorFilter ? `/api/readings?sensorId=${encodeURIComponent(sensorFilter)}` : `/api/readings`;
      const arr = await apiFetch<any[]>(qs);
      const mapped: Reading[] = (Array.isArray(arr) ? arr : []).map((n) => ({
        id: n.id,
        sensorId: n.sensorId,
        value: Number(n.value ?? n.sensorValue ?? 0),
        timestamp: n.timestamp ?? n.timestamp_utc ?? n.timestampUtc,
      }));
      setData(mapped);
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao carregar leituras.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [sensorFilter]);

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

  const baseInfo = useMemo(() => {
    return baseUrlState.get();
  }, []);

  function openDetail(sensorId: string) {
    router.push(`/sensor/${encodeURIComponent(sensorId)}`);
  }

  function renderItem({ item }: { item: Reading }) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => openDetail(item.sensorId)}>
        <Text style={styles.cardTitle}>{item.sensorId}</Text>
        <Text style={styles.cardValue}>{item.value}</Text>
        <Text style={styles.cardTime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensores</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Filtrar por Sensor ID"
          value={sensorFilter}
          onChangeText={setSensorFilter}
          onSubmitEditing={load}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.btn} onPress={load}>
          <Text style={styles.btnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.baseUrl}>
        Base da API: {/** mostrado assíncrono */}
      </Text>
      {/* exibe async */}
      <AsyncValue promise={baseInfo} />

      {loading ? (
        <View style={{ paddingTop: 20 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(it) => `${it.id}-${it.sensorId}`}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          style={{ marginTop: 12 }}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Sem leituras.</Text>}
        />
      )}
    </View>
  );
}

function AsyncValue({ promise }: { promise: Promise<string> }) {
  const [v, setV] = useState<string>("");
  useEffect(() => {
    let alive = true;
    promise.then((s) => alive && setV(s));
    return () => { alive = false; };
  }, [promise]);
  return <Text selectable style={{ color: '#555' }}>{v}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10 },
  btn: { backgroundColor: '#b30000', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16 },
  btnText: { color: '#fff', fontWeight: 'bold' },

  baseUrl: { marginTop: 8, color: '#666' },

  card: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 12, padding: 12, marginTop: 12, gap: 6 },
  cardTitle: { fontWeight: '700' },
  cardValue: { fontSize: 20, fontWeight: '700' },
  cardTime: { color: '#666', fontSize: 12 },
});
