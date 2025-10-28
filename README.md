# Challenge Sprint 4 – Digital Twin Sensores (Frontend)

## 👥 Integrantes
- Henriques Paulo da Silva Soares | RM551033  
- Guilherme de Souza Pereira | RM552551  
- Laís de Fátima Silva Gonçalves | RM98851  
- João Vítor Estella de França | RM552479  
- Lucas Ramos Coelho | RM551975  

---

## 🚀 Descrição
Aplicativo mobile desenvolvido em **React Native (Expo + expo-router)** para exibir sensores de um **Digital Twin Industrial**.  
Nesta Sprint 4 o foco foi **escalabilidade, autenticação JWT, integração com banco PostgreSQL** e **melhoria da experiência mobile**.  

O sistema agora permite **login autenticado**, persistência de token, **dashboard consolidado** de múltiplos sensores e comunicação direta com o backend Spring Boot (PostgreSQL via Docker).

---

## 🧩 Arquitetura
Frontend (Expo/React Native)
│
▼
API Gateway / Backend (Spring Boot + JWT)
│
▼
Banco de Dados (PostgreSQL via Docker)


---

## 📱 Funcionalidades

### 🔐 Autenticação
- Tela **/login** integrada ao backend (`/auth/login`)  
- **Token JWT** salvo em `AsyncStorage` e propagado automaticamente nas requisições (`Authorization: Bearer <token>`)  
- Proteção de rotas via middleware (`app/_layout.tsx`)

### 📊 Dashboard Consolidado
- Tela **/sensors** exibe cards dos sensores em **grid (2 colunas)**  
- Atualizações em tempo real (requisições GET autenticadas)  
- Acesso rápido ao detalhe de cada sensor (**/sensor/[id]**)  
- Histórico das últimas leituras ordenadas por data  

### ⚙️ Configurações
- Tela **/config** permite definir a **URL da API** e testar conexão (`GET /api/readings`)  
- URL salva localmente (`api_base`) conforme o ambiente:
  - Web → `http://localhost:8080`
  - Android emulador → `http://10.0.2.2:8080`

### 💬 Feedback UX
- Alerts para sucesso/erro  
- Indicadores de carregamento (`ActivityIndicator`)  
- Controle de estado e mensagens responsivas  

---

## ⚙️ Como rodar o frontend

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Henriques-Soares/Digital_Twin_Sensores.git
   cd Digital_Twin_Sensores
