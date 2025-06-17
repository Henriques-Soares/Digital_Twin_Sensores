# Challenge Sprint 1 - Digital Twin Sensores

## Integrantes
- Henriques Paulo da Silva Soares | RM551033
- GUILHERME DE SOUZA PEREIRA | RM552551
- LAIS DE FÁTIMA SILVA GONÇALVES | RM98851
- JOÃO VÍTOR ESTELLA DE FRANÇA | RM552479
- LUCAS RAMOS COELHO | RM551975

## Descrição
Aplicativo mobile (React Native/Expo) para exibir sensores de um Digital Twin, permitindo listar, detalhar e simular atualização, além de integração dinâmica com API real ou mock local.

## Funcionalidades
- Lista de sensores (mock e API)
- Tela de detalhe do sensor
- Botão “Atualizar” (simulação)
- Tela de configurações (URL da API)
- Navegação moderna e animações
- Mock de sensores em `mock/sensors.json`

## Como rodar o projeto

1. Clone o repositório:
    ```
    git clone https://github.com/Henriques-Soares/Digital_Twin_Sensores.git
    cd Digital_Twin_Sensores
    ```
2. Instale as dependências:
    ```
    npm install
    ```
3. Inicie o projeto:
    ```
    npx expo start
    ```
4. **Mock local:** O app já carrega dados de `mock/sensors.json` por padrão.
5. **API própria (opcional):**  
    - Instale JSON Server:
      ```
      npm install -g json-server
      ```
    - Rode a API:
      ```
      npx json-server --watch db.json --port 3333
      ```
    - No app, configure a URL para:  
      `http://<SEU_IP_LOCAL>:3333/sensores`

## Mock de Dados
Arquivo: `mock/sensors.json`

```json
[
  {
    "id": 1,
    "nome": "Sensor de Pressão",
    "valorAtual": 5.2,
    "status": "OK",
    "historico": [4.8, 5.1, 5.2, 5.0, 4.9]
  },
  // ...
]
