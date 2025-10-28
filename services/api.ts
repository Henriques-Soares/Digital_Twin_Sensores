// services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * URL padrão da API por plataforma.
 * - Web: backend rodando local na 8080
 * - Android emulador: 10.0.2.2 (loopback do host)
 * - iOS simulador: localhost (ajuste se usar dispositivo físico)
 */
const DEFAULT_URL =
  Platform.OS === "web" ? "http://localhost:8080" : "http://10.0.2.2:8080";

/** Helpers de token/base URL para uso em telas */
export async function getBaseUrl(): Promise<string> {
  const stored = await AsyncStorage.getItem("api_base");
  const base = (stored || DEFAULT_URL).trim().replace(/\/+$/, "");
  return base || DEFAULT_URL;
}
export async function setBaseUrl(url: string) {
  await AsyncStorage.setItem("api_base", url.trim());
}
export async function getToken() {
  return AsyncStorage.getItem("token");
}
export async function setToken(token: string) {
  await AsyncStorage.setItem("token", token);
}
export async function clearToken() {
  await AsyncStorage.removeItem("token");
}

/** Erro enriquecido para exibir mensagens amigáveis */
export class ApiError extends Error {
  status: number;
  body?: string;
  constructor(status: number, message: string, body?: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/**
 * Fetch centralizado que injeta automaticamente o Authorization: Bearer <token>.
 * - Garante barra no path
 * - Stringifica objetos no body e define Content-Type
 * - Lança ApiError com status + corpo de resposta ao falhar
 */
export async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const base = await getBaseUrl();
  const token = await getToken();

  // Garante barra inicial
  const fullPath = path.startsWith("/") ? path : `/${path}`;

  const headers: Record<string, string> = {
    ...(init.headers as any),
  };

  // Se houver token, injeta
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body = init.body;

  // Se body for objeto JS, stringifica e define JSON
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    try {
      body = JSON.stringify(body);
    } catch {
      // mantém body como está se não der para stringificar
    }
  }

  const res = await fetch(`${base}${fullPath}`, { ...init, headers, body });

  // Trata erros (inclui CORS/Network)
  if (!res.ok) {
    let payloadText = "";
    try {
      // tenta extrair texto (ou JSON convertido)
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        payloadText = typeof j === "string" ? j : JSON.stringify(j);
      } else {
        payloadText = await res.text();
      }
    } catch {
      // ignore
    }
    const message = `HTTP ${res.status} – ${res.statusText || "Erro na requisição"}`;
    throw new ApiError(res.status, payloadText ? `${message}\n${payloadText}` : message, payloadText);
  }

  // Retorna JSON se vier como JSON, senão texto
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as T;
}
