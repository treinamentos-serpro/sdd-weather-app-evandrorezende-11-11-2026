# Plano Técnico: Weather App

## Architecture (Overview)

Aplicação cliente de página única (SPA) construída com React e Vite. A arquitetura separa apresentação, orquestração do fluxo de consulta, acesso às APIs externas e tipos/funções de domínio:

- **Apresentação:** componentes React em `src/components/` renderizam busca, seleção de cidade, clima atual, previsão e estados de carregamento, vazio e erro.
- **Orquestração:** `src/hooks/useWeather.ts` coordena busca, seleção, consulta e nova tentativa, expondo estado consumível pela tela.
- **Integração:** `src/services/weatherService.ts` encapsula chamadas HTTP à Open-Meteo, valida respostas e transforma os DTOs da API em tipos do domínio.
- **Domínio/apresentação:** `src/types/weather.ts` define contratos; `src/lib/` contém conversão de temperatura, formatação e interpretação dos códigos meteorológicos.
- **Composição:** `src/App.tsx` compõe os componentes e mantém a unidade de apresentação.

O fluxo de dados é unidirecional: interação do usuário -> hook -> serviço -> API -> mapeamento para domínio -> atualização do estado -> renderização. Não há servidor próprio nem segredo de API, pois a Open-Meteo não exige chave para os endpoints considerados.

**Aderência a validar na implementação:** RF-02 exige que a pessoa usuária selecione a cidade quando houver resultados. O hook existente seleciona/carrega automaticamente o primeiro resultado e a tela atual não apresenta a lista; a arquitetura planejada deve renderizar opções desambiguadas e carregar o clima apenas para a cidade escolhida.

## Tech Stack

- **React 19 + TypeScript strict:** interface tipada e componentes funcionais.
- **Vite:** servidor de desenvolvimento e build estático.
- **Tailwind CSS 3:** estilos utilitários responsivos, seguindo o tema já definido no projeto.
- **Vitest + Testing Library + jsdom:** testes unitários e de componentes; `@testing-library/user-event` para interações.
- **Playwright:** testes de fluxo E2E em Chromium desktop e perfil móvel.
- **Biome:** lint e formatação conforme scripts do projeto.
- **pnpm:** instalação e execução de scripts.
- **Open-Meteo Geocoding API e Forecast API:** busca de localidades e dados meteorológicos sem API key.

Não adicionar biblioteca de estado global, cache de consultas ou cliente HTTP enquanto o escopo continuar limitado a uma cidade consultada por vez. `fetch`, React state e os utilitários já instalados atendem ao fluxo.

## Project Structure

Estrutura existente a preservar e responsabilidades planejadas:

```text
src/
  App.tsx                         # composição da página e unidade escolhida
  main.tsx                        # bootstrap React
  components/
    SearchBar.tsx                 # entrada e envio da busca
    CityResults.tsx               # lista acessível de cidades selecionáveis (a criar)
    UnitToggle.tsx                # controle Celsius/Fahrenheit
    CurrentWeather.tsx            # condições atuais
    ForecastList.tsx               # lista da previsão diária
    ForecastCard.tsx               # apresentação de um dia
    states/
      EmptyState.tsx              # estado inicial/sem resultados
      LoadingState.tsx            # carregamento
      ErrorState.tsx              # falha e nova tentativa
  hooks/
    useWeather.ts                 # coordenação do fluxo e estado da consulta
  lib/
    format.ts                     # datas e valores de apresentação
    temperature.ts                # conversão/formatação de temperatura
    weatherCodes.ts               # códigos WMO para descrições/ícones
  services/
    weatherService.ts             # Open-Meteo, parsing e mapeamento
  types/
    weather.ts                    # tipos de domínio e unidade
  styles/
    index.css                     # Tailwind e estilos globais

tests/
  unit/                            # serviços, funções puras, hooks e componentes
  e2e/                             # fluxos completos no browser
  setup.ts                        # configuração de testes
```

`CityResults.tsx` é o único componente novo previsto para atender explicitamente à seleção e desambiguação dos resultados. A lista pode ser implementada dentro de `SearchBar` se a composição e acessibilidade permanecerem claras; nesse caso, não criar arquivo adicional.

## Data Model

Tipos de domínio sugeridos (nomes podem permanecer alinhados aos existentes):

```ts
type Unit = 'celsius' | 'fahrenheit';

interface City {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface CurrentWeather {
  time: string;
  temperature: number;          // sempre Celsius no domínio
  apparentTemperature?: number;  // Celsius, quando disponível
  weatherCode: number;
  humidity?: number;
  windSpeed?: number;
}

interface ForecastDay {
  date: string;                  // data local da cidade, formato ISO YYYY-MM-DD
  min?: number;                  // Celsius
  max?: number;                  // Celsius
  weatherCode: number;
  precipitationProbability?: number;
}

interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
}
```

Regras do modelo:

- Coordenadas e metadados da cidade vêm da resposta de geocodificação; `admin1` é opcional.
- Campos que podem faltar na API são opcionais no domínio, em vez de substituir ausência por zero.
- Temperaturas são mantidas em Celsius no domínio. A conversão para Fahrenheit ocorre apenas na apresentação; mudar unidade não exige nova requisição.
- `weatherCode` conserva o código WMO numérico; `src/lib/weatherCodes.ts` fornece a descrição apropriada.
- Os tipos de resposta HTTP devem ser separados dos tipos de domínio e tratados como dados não confiáveis antes do mapeamento.

## Data Flow

1. A pessoa informa um nome; a UI remove espaços periféricos e impede consulta vazia.
2. O hook marca o fluxo como `loading` e solicita cidades ao serviço de geocodificação.
3. O serviço mapeia resultados para `City`; lista vazia resulta em estado `empty`.
4. O hook consulta automaticamente a primeira cidade e a UI apresenta os resultados com cidade, região (se fornecida) e país para permitir outra seleção.
5. O hook solicita clima atual e previsão para latitude/longitude selecionadas. O serviço mapeia a resposta para `WeatherData`.
6. Em sucesso, o hook mantém cidade e dados selecionados em estado `success`; a tela compõe clima atual e previsão.
7. O controle de unidade altera apenas estado local de apresentação; a tela converte e formata todas as temperaturas em Celsius ou Fahrenheit.
8. Em erro, o hook expõe estado `error` e ação de nova tentativa para a consulta da última cidade ou da busca anterior, conforme a etapa que falhou.

Cada nova busca deve invalidar ou cancelar requisições anteriores para evitar que uma resposta lenta sobrescreva a seleção mais recente. Isso pode ser feito com `AbortController`/identificador de requisição no hook e propagação do `AbortSignal` ao serviço.

## External APIs

### Open-Meteo Geocoding API

- **Endpoint:** `GET https://geocoding-api.open-meteo.com/v1/search`
- **Parâmetros:** `name` (termo codificado), `count` (limitar opções, inicialmente 5), `language=pt`, `format=json`.
- **Resposta usada:** `id`, `name`, `country`, `admin1`, `latitude`, `longitude`.
- **Sem resultados:** ausência de `results` ou lista vazia deve ser normalizada para lista vazia, não erro de rede.

### Open-Meteo Forecast API

- **Endpoint:** `GET https://api.open-meteo.com/v1/forecast`
- **Parâmetros:** `latitude`, `longitude`, `current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code`, `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`, `timezone=auto` e `forecast_days=5`.
- **Mapeamento:** `current` e matrizes de `daily` são convertidos em entidades `CurrentWeather` e `ForecastDay`; alinhar arrays pelo índice e validar os campos obrigatórios.
- **Janela de previsão:** `forecast_days=5` retorna cinco dias de calendário, incluindo hoje no fuso horário da cidade.
- **Unidades:** usar Celsius e km/h, padrões da API, mantendo Celsius no domínio e rotulando a velocidade do vento.
- **Operação:** usar `URL`/`URLSearchParams`, `fetch`, timeout via `AbortController` e checagem de `Response.ok`. Não há chave de API; respeitar limites de uso e exibir atribuição à Open-Meteo.

A integração direta do navegador é apropriada para a API pública sem credenciais. Se uma política de quota, disponibilidade ou uso futuro exigir segredo ou cache compartilhado, introduzir backend/proxy será uma decisão arquitetural separada, fora do escopo atual.

## State Management

Usar estado local React, sem Redux/Zustand ou servidor de cache. O estado da consulta deve ser uma máquina discriminada para evitar combinações incoerentes:

- `idle`: ainda sem busca;
- `loading`: busca de cidade ou carregamento do clima em andamento;
- `success`: dados prontos;
- `empty`: busca sem correspondência;
- `error`: falha recuperável com mensagem e contexto de retry.

Separar do estado de consulta:

- texto digitado no formulário;
- lista de cidades retornadas;
- cidade selecionada e dados meteorológicos;
- unidade de apresentação (`celsius` ou `fahrenheit`).

A unidade não deve ser persistida entre sessões até a pergunta correspondente da especificação ser decidida. Não persistir cidade nem coordenadas no armazenamento local nesta versão. Ao selecionar uma cidade ou iniciar nova busca, limpar somente os estados relacionados para impedir exibição de dados antigos como se fossem atuais.

## Error Handling

- **Entrada inválida:** validar e orientar sem chamar a API.
- **Sem resultados:** estado `empty`, distinto de erro técnico.
- **Falha de rede, timeout ou cancelamento:** converter falha em erro de domínio compreensível; não exibir stack trace. Cancelamentos causados por busca mais recente não devem ser mostrados como erro ao usuário.
- **HTTP não-2xx:** tratar como falha recuperável de geocodificação ou previsão; permitir nova tentativa manual sem repetição automática ilimitada.
- **JSON inválido ou resposta inesperada:** validar a estrutura mínima antes do mapeamento; mensagem de indisponibilidade/inconsistência, sem usar valores inventados.
- **Campos opcionais ausentes:** omitir esses campos na UI; nunca usar `0` como substituto de valor desconhecido.
- **Previsão parcial:** mostrar somente períodos e valores disponíveis, identificando claramente a indisponibilidade conforme caso de borda da especificação.
- **Requisições concorrentes:** abortar ou ignorar respostas obsoletas após nova busca/seleção.
- **Nova tentativa:** repetir a etapa que falhou com o contexto salvo; apresentar estado de carregamento durante a operação.

## Testing Strategy

### Unitários e componentes (Vitest)

- `temperature.test.ts`: conversões Celsius/Fahrenheit, arredondamento e símbolos.
- `weatherCodes.test.ts` e `format.test.ts`: códigos conhecidos, código desconhecido, datas e valores limítrofes.
- `weatherService.test.ts`: URLs/parâmetros, mapeamento de DTO, resultados vazios, campos opcionais, HTTP não-2xx, timeout, JSON inválido e resposta incompleta. Mockar `fetch`; testes não devem depender da rede pública.
- `useWeather` e componentes: transições de estado, busca vazia, seleção explícita de cidade, retry, cancelamento/resposta obsoleta, acessibilidade e alternância de unidade sem nova consulta.
- Usar Testing Library com consultas por role/label e `user-event`; verificar estados de loading, empty, error e success.

### E2E (Playwright)

- Fluxo de busca -> lista de resultados -> seleção -> clima atual e cinco itens de previsão.
- Busca sem resultados e nova busca.
- Alternância °C/°F sem perder cidade e sem requisição extra de clima.
- Falha de rede/servidor e retry.
- Operação por teclado e semântica dos controles principais.
- Executar ao menos em Chromium desktop e perfil móvel já definidos na configuração do projeto.
- Interceptar as chamadas Open-Meteo com respostas determinísticas nos fluxos E2E; reservar validação da API real para uma verificação manual/integrada opcional, para evitar testes flakey e dependência de rede/quota.

### Gates do projeto

Para mudanças em código, executar `pnpm lint`, `pnpm build` e `pnpm test`; executar `pnpm test:e2e` para alterações que afetem fluxos integrados ou antes da entrega funcional.

## Risks & Trade-offs

- **Seleção ambígua:** a primeira cidade é consultada automaticamente e pode não ser a desejada; apresentar país/região e permitir escolher outra correspondência.
- **Integração direta versus backend:** chamada direta é simples e suficiente sem API key, mas transfere ao cliente disponibilidade, quota e retry. Um backend só é justificado por requisito operacional ou segredo futuro.
- **Estado local versus cache dedicado:** estado local reduz dependências e atende à consulta única; não oferece cache sofisticado nem deduplicação global de requisições. Reavaliar somente se histórico/favoritos ou múltiplas cidades entrarem no escopo.
- **Campos opcionais da API:** dados podem variar por local e resposta. Modelar ausência explicitamente melhora honestidade, mas exige que componentes sejam tolerantes a conteúdo parcial.
- **Concorrência e stale responses:** sem cancelamento/controle de versão, buscas rápidas podem deixar dados de uma cidade anterior na tela. A proteção deve fazer parte da camada de orquestração.
- **Testes de API real:** são úteis para detectar mudanças externas, mas instáveis por rede, latência e limite de uso; a suíte obrigatória deve usar mocks e contratos conhecidos.
- **Acessibilidade e responsividade:** componentes compactos de resultado e unidades podem degradar em telas pequenas ou teclado; validar com testes de teclado e viewport móvel.
