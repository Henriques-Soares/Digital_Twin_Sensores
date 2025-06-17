import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

// Função para simular novo histórico se for mock
function simularHistorico(hist: number[] = [], status: string) {
  if (!hist) return [];
  return hist.map(v =>
    Number((v + (Math.random() - 0.5) * (status === 'Alerta' ? 0.4 : 0.2)).toFixed(2))
  );
}

export default function SensorDetailScreen() {
  const { id } = useLocalSearchParams();
  const [sensor, setSensor] = useState<any>(null);
  const [fromMock, setFromMock] = useState(true);
  const router = useRouter();

  const fetchSensor = async () => {
    const url = await AsyncStorage.getItem('API_URL');
    if (url && url.startsWith('http')) {
      try {
        const res = await fetch(`${url.replace(/\/$/, '')}/${id}`);
        const data = await res.json();
        setSensor(data);
        setFromMock(false);
        return;
      } catch (e) {}
    }
    // Fallback para o mock local
    const data = (await import('../../mock/sensors.json')).default;
    const found = data.find((s: any) => s.id == id);
    setSensor(found);
    setFromMock(true);
  };

  useEffect(() => {
    fetchSensor();
  }, [id]);

  // Função para atualizar simulando dados novos (mock only)
  function atualizarSimulado() {
    if (!sensor || !fromMock) return;
    const novoHistorico = simularHistorico(sensor.historico, sensor.status);
    const novoValorAtual = novoHistorico[novoHistorico.length - 1];
    setSensor({
      ...sensor,
      valorAtual: novoValorAtual,
      historico: novoHistorico,
    });
  }

  if (!sensor) return <Text>Carregando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{sensor.nome || sensor.name}</Text>
      <Text style={styles.label}>
        Valor Atual: <Text style={styles.value}>{sensor.valorAtual || sensor.email || sensor.username || '--'}</Text>
      </Text>
      <Text style={styles.label}>
        Status: <Text style={[styles.value, { color: sensor.status === 'OK' ? '#0a0' : '#f80' }]}>{sensor.status || '---'}</Text>
      </Text>
      {sensor.historico && (
        <>
          <Text style={styles.label}>Histórico:</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {sensor.historico.map((v: number, i: number) => (
              <Text key={i} style={styles.history}>{v}</Text>
            ))}
          </View>
        </>
      )}
      {fromMock && <Button title="Atualizar" onPress={atualizarSimulado} />}
      <Button title="Voltar" onPress={() => router.back()} color="#666" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#c00' },
  label: { fontWeight: 'bold', marginTop: 12 },
  value: { fontWeight: 'normal' },
  history: { marginRight: 8, fontSize: 16, color: '#555' },
});
