# Challenge Sprint 3 – Digital Twin Sensores (Frontend)

## 👥 Integrantes
- Henriques Paulo da Silva Soares | RM551033
- Guilherme de Souza Pereira | RM552551
- Laís de Fátima Silva Gonçalves | RM98851
- João Vítor Estella de França | RM552479
- Lucas Ramos Coelho | RM551975

---

## 🚀 Descrição
Aplicativo mobile desenvolvido em **React Native (Expo)** para exibir sensores de um **Digital Twin**.  
Na Sprint 3 o app foi integrado ao **backend em Java Spring Boot (H2)**, substituindo o mock local por dados reais.

---

## 📱 Funcionalidades
- **Lista de Sensores**: carrega dados em tempo real do backend.  
- **Tela de Detalhe**: exibe histórico de leituras de cada sensor.  
- **Gráfico Dinâmico**: histórico renderizado com `react-native-chart-kit`.  
- **Registrar Leitura**: envia POST mock para o backend.  
- **Tela de Configurações**: permite alterar a URL da API e testar a conexão.  
- **Indicadores de carregamento** e mensagens de erro.  
- **Navegação moderna e animações** via `expo-router`.

---

## ⚙️ Como rodar o frontend

1. Clone o repositório:
   ```bash
   git clone https://github.com/Henriques-Soares/Digital_Twin_Sensores.git
   cd Digital_Twin_Sensores
