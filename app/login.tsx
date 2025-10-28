// app/login.tsx
import React, { useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { apiFetch, getBaseUrl, setToken } from "../services/api";

// Use expo-router se disponível
let router: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("expo-router");
  router = mod.useRouter ? mod.useRouter() : null;
} catch {}

export default function LoginScreen() {
  const [email, setEmail] = useState("admin@dtwin.io");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseUrl, setBaseUrlState] = useState<string>("");

  React.useEffect(() => {
    getBaseUrl().then(setBaseUrlState).catch(() => {});
  }, []);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ token: string }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      if (!data?.token) throw new Error("Token não retornado pelo servidor.");
      await setToken(data.token);
      // navega
      if (router) {
        router.push("/sensors");
      } else if (typeof window !== "undefined") {
        window.location.href = "/sensors";
      }
    } catch (e: any) {
      const message = e?.message || "Falha ao entrar. Verifique conexão, CORS e credenciais.";
      setError(message);
      if (Platform.OS === "web") {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  }

  function gotoConfig() {
    if (router) {
      router.push("/config");
    } else if (typeof window !== "undefined") {
      window.location.href = "/config";
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondary} onPress={gotoConfig}>
        <Text style={styles.secondaryText}>Configurar URL da API</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.hint}>API: {baseUrl}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  input: {
    width: 360,
    maxWidth: "90%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    width: 360,
    maxWidth: "90%",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#e57373",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  secondary: {
    width: 360,
    maxWidth: "90%",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 12,
  },
  secondaryText: { color: "#333" },
  error: { marginTop: 12, color: "crimson", textAlign: "center", paddingHorizontal: 12 },
  hint: { marginTop: 8, color: "#666", fontSize: 12 },
});
