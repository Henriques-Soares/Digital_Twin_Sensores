import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SensorListScreen() {
  const [sensors, setSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSensores() {
      setLoading(true);
      try {
        const url = await AsyncStorage.getItem('API_URL');
        if (url && url.startsWith('http')) {
          const res = await fetch(url);
          const data = await res.json();
          // Suporta tanto array quanto objeto (caso de JSON Server)
          setSensors(Array.isArray(data) ? data : (data.sensores || []));
        } else {
          import('../mock/sensors.json').then(data => setSensors(data.default || data));
        }
      } catch (err) {
        // Fallback para o mock se der erro
        import('../mock/sensors.json').then(data => setSensors(data.default || data));
      }
      setLoading(false);
    }
    fetchSensores();
  }, []);

  if (loading) return <Text style={{ textAlign: 'center', marginTop: 32 }}>Carregando...</Text>;

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
      <Text style={styles.title}>Sensores</Text>
      <FlatList
        data={sensors}
        keyExtractor={item => item.id?.toString?.() || item.id}
        renderItem={({ item, index }) => (
          <motion.view
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 * index, duration: 0.5 }}
            style={{
              ...styles.card,
              borderColor: item.status === 'OK' ? '#0a0' : '#f80'
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/sensor/${item.id}`)}
            >
              <Text style={styles.name}>{item.nome || item.name}</Text>
              <Text style={{ color: '#555' }}>
                Valor: {item.valorAtual || item.email || item.username || '--'}
              </Text>
              <Text style={{ color: item.status === 'OK' ? '#0a0' : '#f80', fontWeight: 'bold' }}>
                Status: {item.status || '---'}
              </Text>
            </TouchableOpacity>
          </motion.view>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#b30000', textAlign: 'center' },
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
