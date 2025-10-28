import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

// DEFAULT por plataforma (SEM duplicar)
const DEFAULT_URL = Platform.OS === 'web' ? 'http://localhost:8080' : 'http://10.0.2.2:8080';

export default function SettingsScreen() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      const current = (await AsyncStorage.getItem('API_URL')) || DEFAULT_URL;
      setUrl(current);
    })();
  }, []);

  async function salvarUrl() {
    setError('');
    const u = (url || '').trim().replace(/\/+$/, '');
    if (!/^https?:\/\/.+/i.test(u)) {
      setError('URL inválida. Ex.: http://IP:8080');
      return;
    }
    await AsyncStorage.setItem('API_URL', u);
    Alert.alert('OK', 'API URL salva!');
    router.back();
  }

  async function testarConexao() {
    setTesting(true);
    try {
      const base = (url || '').trim().replace(/\/+$/, '');
      const res = await fetch(`${base}/api/readings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const qtd = Array.isArray(data) ? data.length : 0;
      Alert.alert('Conectado ✅', `GET /api/readings retornou ${qtd} registro(s).`);
    } catch (e: any) {
      Alert.alert('Falha ❌', e?.message || 'Verifique a URL e se o backend está rodando.');
    } finally {
      setTesting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      <Text style={styles.label}>API URL (sem path)</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder={DEFAULT_URL}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, !!error && { borderColor: '#c00' }]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}

      <Pressable onPress={salvarUrl} style={styles.btnPrimary}>
        <Text style={styles.btnText}>Salvar</Text>
      </Pressable>

      <Pressable onPress={() => setUrl(DEFAULT_URL)} style={styles.btnSecondary}>
        <Text style={styles.btnText}>Usar padrão ({DEFAULT_URL})</Text>
      </Pressable>

      <Pressable disabled={testing} onPress={testarConexao} style={[styles.btnGhost, testing && { opacity: 0.6 }]}>
        <Text style={styles.btnGhostText}>{testing ? 'Testando...' : 'Testar conexão (GET /api/readings)'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 10 },
  error: { color: '#c00', marginBottom: 16 },
  btnPrimary: { backgroundColor: '#b30000', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  btnSecondary: { backgroundColor: '#444', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  btnGhost: { paddingVertical: 14, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 10 },
  btnGhostText: { color: '#333', fontWeight: '600' },
});
