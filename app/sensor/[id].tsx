import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

type Reading = {
  id: number;
  sensorId: string;
  value?: number;
  sensorValue?: number;
  timestamp: string; // ISO
};

type LoadState = 'idle' | 'loading' | 'error' | 'ready';

async function getBaseUrl(): Promise<string> {
  const stored = await AsyncStorage.getItem('API_URL');
  if (stored && stored.trim()) return stored.replace(/\/+$/, '');
  return Platform.OS === 'web' ? 'http://localhost:8080' : 'http://10.0.2.2:8080';
}

function normalize(arr: any[]): Reading[] {
  return (Array.isArray(arr) ? arr : []).map((n) => ({
    id: Number(n.id ?? 0),
    sensorId: String(n.sensorId ?? ''),
    value: n.value ?? n.sensorValue,
    sensorValue: n.sensorValue,
    timestamp: String(n.timestamp ?? ''),
  }));
}

async function fetchBySensor(sensorId: string, signal?: AbortSignal): Promise<Reading[]> {
  const base = await getBaseUrl();
  try {
    const res = await fetch(`${base}/api/readings?sensorId=${encodeURIComponent(sensorId)}`, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return normalize(data);
  } catch {
    const res = await fetch(`${base}/api/readings/sensor/${encodeURIComponent(sensorId)}`, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return normalize(data);
  }
}

async function postReading(sensorId: string, value: number) {
  const base = await getBaseUrl();
  const resp = await fetch(`${base}/api/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sensorId, value }),
  });
  if (!resp.ok) throw new Error(`Falha no POST (HTTP ${resp.status})`);
  return resp.json();
}

function formatDate(iso?: string) {
  if (!iso) return '--';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleString();
}

export default function SensorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [items, setItems] = useState<Reading[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setState('loading');
    try {
      const arr = await fetchBySensor(String(id), ctrl.signal);
      arr.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setItems(arr);
      setState('ready');
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return;
      setState('error');
    }
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const onCreateMock = useCallback(async () => {
    try {
      const value = Number((Math.random() * 10 + 20).toFixed(2));
      await postReading(String(id), value);
      await load();
      Alert.alert('Sucesso', `Leitura ${value} registrada.`);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao registrar leitura.');
    }
  }, [id, load]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const last = items[items.length - 1];

  const { minVal, maxVal, avgVal } = useMemo(() => {
    const values = items.map((r) => Number(r.value ?? r.sensorValue ?? NaN)).filter((v) => !isNaN(v));
    const min = values.length ? Math.min(...values) : undefined;
    const max = values.length ? Math.max(...values) : undefined;
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : undefined;
    return { minVal: min, maxVal: max, avgVal: avg };
  }, [items]);

  // Dados do gráfico (labels enxutas com hora/min ou dia/hora, conforme quantidade)
  const chart = useMemo(() => {
    const values = items.map((r) => Number(r.value ?? r.sensorValue ?? 0));
    const labels = items.map((r) => {
      const d = new Date(r.timestamp);
      // rótulo curto
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    });

    // Evita labels gigantes: espaço disponível ~ largura da tela
    const width = Dimensions.get('window').width - 32;
    const maxLabels = Math.max(4, Math.floor(width / 60));
    if (labels.length > maxLabels) {
      const step = Math.ceil(labels.length / maxLabels);
      return {
        labels: labels.filter((_, i) => i % step === 0),
        datasets: [{ data: values.filter((_, i) => i % step === 0) }],
      };
    }
    return { labels, datasets: [{ data: values }] };
  }, [items]);

  if (state === 'loading') {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }

  if (state === 'error') {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ marginBottom: 10, color: '#b00020', fontWeight: '600' }}>
          Não foi possível carregar os dados do sensor.
        </Text>
        <Button title="Tentar novamente" onPress={load} />
        <View style={{ height: 10 }} />
        <Button title="Voltar" color="#666" onPress={() => router.back()} />
      </View>
    );
  }

  const chartWidth = Math.max(260, Dimensions.get('window').width - 32);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensor {id}</Text>

      <View style={styles.kpis}>
        <Text style={styles.meta}>Último: {last?.value !== undefined ? last.value.toFixed(2) : '--'}</Text>
        <Text style={styles.meta}>Hora: {formatDate(last?.timestamp)}</Text>
      </View>

      <View style={styles.kpisRow}>
        <Text style={styles.badge}>Mín: {minVal !== undefined ? minVal.toFixed(2) : '--'}</Text>
        <Text style={styles.badge}>Máx: {maxVal !== undefined ? maxVal.toFixed(2) : '--'}</Text>
        <Text style={styles.badge}>Média: {avgVal !== undefined ? avgVal.toFixed(2) : '--'}</Text>
      </View>

      {/* Gráfico (Chart Kit) */}
      <View style={{ marginVertical: 12 }}>
        <LineChart
          data={chart}
          width={chartWidth}
          height={220}
          withDots
          withShadow
          withInnerLines
          withOuterLines
          fromZero
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            propsForDots: { r: '3' },
          }}
          style={{ borderRadius: 12 }}
        />
      </View>

      {/* Histórico */}
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id ?? `${it.sensorId}-${it.timestamp}`)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTime}>{formatDate(item.timestamp)}</Text>
            <Text style={styles.rowVal}>
              {item.value !== undefined
                ? item.value.toFixed(2)
                : item.sensorValue !== undefined
                ? item.sensorValue.toFixed(2)
                : '--'}
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingVertical: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#666', marginTop: 8 }}>Sem leituras para este sensor.</Text>
        }
      />

      <View style={{ height: 12 }} />
      <Button title="Atualizar" onPress={load} />
      <View style={{ height: 8 }} />
      <Button title="Registrar Leitura" onPress={onCreateMock} />
      <View style={{ height: 8 }} />
      <Button title="Voltar" color="#666" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#b30000' },
  kpis: { marginBottom: 6 },
  kpisRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  badge: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, color: '#333',
  },
  meta: { marginBottom: 4, color: '#333' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  rowTime: { color: '#555' },
  rowVal: { fontWeight: '600' },
});
