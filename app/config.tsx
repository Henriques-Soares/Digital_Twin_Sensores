import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function SettingsScreen() {
  const [url, setUrl] = useState('http://192.168.15.73:3333/sensores');
  const router = useRouter();
  const [error, setError] = useState('');

  async function salvarUrl() {
    setError(''); // limpa erro anterior
    if (!url || !url.startsWith('http')) {
      setError('URL inválida. Digite uma URL iniciando com http ou https.');
      return;
    }
    try {
      const response = await fetch(url);
      if (response.ok) {
        await AsyncStorage.setItem('API_URL', url);
        Alert.alert('Sucesso', 'URL salva!');
        router.back();
      } else {
        setError(`A URL respondeu com status ${response.status}. Verifique se ela está correta.`);
      }
    } catch (e) {
      setError('Não foi possível acessar a URL. Verifique se está correta e acessível.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuração de Conexão</Text>
      <Text style={styles.subtitle}>
        Aqui você pode definir a URL da API dos sensores (apenas se estiver integrado com backend).
        <Text style={{ color: '#888' }}> No momento, os dados estão mockados.</Text>
      </Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="http://localhost:3333/sensores"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="#bbb"
      />
      {/* Exibe a mensagem de erro se houver */}
      {error ? (
        <Text style={{ color: '#d00', marginBottom: 12, textAlign: 'center', fontWeight: 'bold' }}>
          {error}
        </Text>
      ) : null}
      <Pressable style={styles.btnPrimary} onPress={salvarUrl}>
        <Text style={styles.btnText}>SALVAR</Text>
      </Pressable>
      <Pressable
        style={[styles.btnSecondary, { marginTop: 12 }]}
        onPress={async () => {
          await AsyncStorage.removeItem('API_URL');
          Alert.alert('Pronto', 'Voltando para dados locais!');
          router.back();
        }}
      >
        <Text style={styles.btnText}>USAR DADOS DO PROJETO</Text>
      </Pressable>

      <Pressable style={styles.btnSecondary} onPress={() => router.back()}>
        <Text style={styles.btnText}>VOLTAR</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#b30000', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#222', marginBottom: 28 },
  input: {
    borderWidth: 1.5,
    borderColor: '#b30000',
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    backgroundColor: '#fafafa',
    marginBottom: 28,
  },
  btnPrimary: {
    backgroundColor: '#b30000',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  btnSecondary: {
    backgroundColor: '#444',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 1,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 16,
  },
});
