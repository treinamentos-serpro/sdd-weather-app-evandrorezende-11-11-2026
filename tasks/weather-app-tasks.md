# Backlog de Tarefas: Weather App

Derivado de [specs/weather-app-spec.md](../specs/weather-app-spec.md) e [plans/weather-app-plan.md](../plans/weather-app-plan.md). As tarefas seguem a ordem das entregas e podem ser delegadas individualmente após suas dependências.

## Entrega 1: Contratos

### T-01 — Definir a janela da previsão de cinco dias

- **Descrição:** Resolver a pergunta de produto sobre incluir o dia atual ou exibir cinco dias completos futuros e propagar a decisão para os requisitos e o contrato da API.
- **Critérios de aceite:**
  - A especificação declara sem ambiguidade quais datas compõem a previsão.
  - O plano descreve o valor/estratégia de `forecast_days` e como os dias retornados serão apresentados.
  - Os critérios de aceite e os testes esperados usam a mesma definição.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.
- **Tipo:** Data.
- **Decisão:** cinco dias de calendário incluindo hoje, com `forecast_days=5` e `timezone=auto`.

### T-02 — Alinhar os tipos de domínio aos dados opcionais

- **Descrição:** Atualizar os tipos meteorológicos para representar campos opcionais sem substituir ausência por zero e manter temperaturas em Celsius.
- **Critérios de aceite:**
  - `CurrentWeather` contém temperatura, horário e código meteorológico; sensação térmica, umidade e vento são opcionais quando a fonte não os fornecer.
  - `ForecastDay` contém data e código meteorológico; mínima, máxima e probabilidade de precipitação podem estar ausentes.
  - `WeatherData` associa cidade, condições atuais e lista diária.
  - A unidade `Unit` continua distinguindo Celsius e Fahrenheit.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.

## Entrega 2: Integração Open-Meteo

### T-03 — Normalizar resultados da Geocoding API

- **Descrição:** Implementar o mapeamento e a validação da resposta de busca de cidades para o modelo `City`.
- **Critérios de aceite:**
  - A consulta envia o nome aparado, `count`, idioma português e formato JSON.
  - Resultados incluem identificador, nome, país, coordenadas e região quando disponíveis.
  - Resposta sem resultados retorna lista vazia.
  - Entrada vazia não dispara requisição.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.

### T-04 — Testar busca e mapeamento de cidades

- **Descrição:** Cobrir o contrato da Geocoding API com respostas simuladas, sem depender de acesso à rede.
- **Critérios de aceite:**
  - Testes verificam parâmetros, mapeamento de campos e região ausente.
  - Testes verificam resultados vazios e falha HTTP.
  - Testes confirmam que uma entrada em branco não chama `fetch`.
- **Dependências:** T-03.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.

### T-05 — Mapear clima atual e previsão da Forecast API

- **Descrição:** Solicitar e converter dados atuais e diários da Open-Meteo para os tipos de domínio, mantendo temperaturas em Celsius.
- **Critérios de aceite:**
  - A requisição usa latitude/longitude selecionadas, `timezone=auto` e os campos de clima atual e diário definidos no plano.
  - A resposta é mapeada por índice para registros diários com datas locais.
  - Campos opcionais ausentes permanecem ausentes, não são convertidos em zero.
  - A janela da previsão segue a decisão registrada em T-01.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/services/weatherService.ts`, `src/types/weather.ts`.
- **Tipo:** Data.

### T-06 — Testar resposta e mapeamento da previsão

- **Descrição:** Verificar o contrato da Forecast API com fixtures determinísticas.
- **Critérios de aceite:**
  - Testes verificam parâmetros de unidade, fuso, dias e variáveis solicitadas.
  - Testes verificam mapeamento dos dados atuais e diários.
  - Respostas HTTP inválidas, sem campos obrigatórios ou com campos opcionais ausentes são tratadas conforme o contrato.
  - Os testes verificam a quantidade e as datas retornadas de acordo com T-01.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.

### T-07 — Suportar timeout e cancelamento das requisições

- **Descrição:** Permitir que serviços recebam sinal de cancelamento, mantenham timeout limitado e convertam falhas de rede em erros compreensíveis.
- **Critérios de aceite:**
  - Chamadas HTTP aceitam e propagam `AbortSignal`.
  - Timeout encerra a requisição e produz erro tratável pela interface.
  - Cancelamento esperado por busca mais recente não é exposto como erro ao usuário.
  - Testes cobrem timeout, falha de rede e cancelamento.
- **Dependências:** T-03, T-05.
- **Arquivos prováveis:** `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`.
- **Tipo:** Data.

## Entrega 3: Busca e orquestração

### T-08 — Implementar o fluxo explícito de busca e seleção

- **Descrição:** Ajustar o hook para separar busca de cidades da consulta meteorológica e representar as etapas do fluxo.
- **Critérios de aceite:**
  - Após uma busca com resultados, o hook expõe as cidades e consulta automaticamente a primeira, permitindo selecionar outra.
  - `selectCity` consulta o clima apenas para a cidade escolhida.
  - Estados distinguem inicial, carregamento, sucesso, vazio e erro.
  - `retry` repete a etapa que falhou usando o último contexto válido.
- **Dependências:** T-03, T-05, T-07.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data.

### T-09 — Testar transições do hook de clima

- **Descrição:** Cobrir o fluxo do hook, incluindo seleção manual e estados recuperáveis.
- **Critérios de aceite:**
  - Testes verificam busca sem resultados, lista de resultados e seleção de cidade.
  - Testes verificam sucesso, erro e nova tentativa.
  - Testes confirmam que a busca carrega automaticamente a primeira cidade.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.
- **Tipo:** Test.

### T-10 — Evitar atualização com respostas obsoletas

- **Descrição:** Cancelar ou ignorar resultados de consultas anteriores quando uma nova busca ou seleção começa.
- **Critérios de aceite:**
  - Uma resposta atrasada de uma consulta anterior não substitui a cidade e os dados da consulta mais recente.
  - Cancelamentos não levam o hook ao estado de erro.
  - Teste determinístico cobre duas requisições resolvidas fora de ordem.
- **Dependências:** T-07, T-08.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`, `tests/unit/useWeather.test.ts`.
- **Tipo:** Data.

### T-11 — Criar lista acessível de cidades encontradas

- **Descrição:** Exibir resultados de geocodificação distinguíveis e permitir seleção por teclado ou ponteiro.
- **Critérios de aceite:**
  - Cada resultado mostra nome e país, além de região quando disponível.
  - Cada opção tem nome acessível e pode ser alcançada e selecionada por teclado.
  - Selecionar uma opção chama o callback da cidade correspondente.
  - Lista vazia não é apresentada como falha técnica.
- **Dependências:** T-08.
- **Arquivos prováveis:** `src/components/CityResults.tsx` (novo) ou `src/components/SearchBar.tsx`.
- **Tipo:** UI.

### T-12 — Conectar busca, seleção e estados na tela principal

- **Descrição:** Integrar o formulário e os resultados ao hook e renderizar os estados de busca e consulta na aplicação.
- **Critérios de aceite:**
  - Submeter uma busca apresenta carregamento, resultados selecionáveis e os dados da primeira cidade.
  - Selecionar uma cidade carrega e exibe seus dados.
  - Busca sem correspondência exibe orientação para tentar novamente.
  - Erro exibe mensagem compreensível e ação de retry.
- **Dependências:** T-09, T-11.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/SearchBar.tsx`, `src/components/states/EmptyState.tsx`, `src/components/states/LoadingState.tsx`, `src/components/states/ErrorState.tsx`.
- **Tipo:** UI.

## Entrega 4: Apresentação meteorológica

### T-13 — Exibir campos disponíveis no clima atual

- **Descrição:** Ajustar o painel de clima atual para apresentar os dados suportados pelo domínio sem exibir campos ausentes.
- **Critérios de aceite:**
  - Nome da cidade e país, temperatura e condição atual são apresentados.
  - Sensação térmica, umidade e vento aparecem apenas quando disponíveis.
  - A unidade da temperatura fica visível e os dados opcionais ausentes não aparecem como zero ou texto inválido.
- **Dependências:** T-02, T-05.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/lib/format.ts`, `src/lib/weatherCodes.ts`.
- **Tipo:** UI.

### T-14 — Apresentar a previsão diária conforme o contrato

- **Descrição:** Exibir os dias retornados pela API em uma lista responsiva, com valores opcionais tratados de forma explícita.
- **Critérios de aceite:**
  - Cada item associa data e condição meteorológica ao mesmo dia.
  - Quantidade e janela de dias seguem T-01.
  - Máximas e mínimas aparecem quando disponíveis; valores ausentes não são apresentados como zero.
  - Uma resposta parcial não cria dados fictícios para dias sem previsão.
- **Dependências:** T-01, T-05.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`, `src/lib/format.ts`, `src/lib/weatherCodes.ts`.
- **Tipo:** UI.

### T-15 — Aplicar alternância de unidade a todas as temperaturas

- **Descrição:** Garantir que o controle converta todas as temperaturas exibidas sem nova consulta ou perda da cidade selecionada.
- **Critérios de aceite:**
  - Temperatura atual, sensação térmica e máximas/mínimas refletem Celsius ou Fahrenheit conforme a seleção.
  - A unidade está identificada junto aos valores.
  - Alternar a unidade não limpa dados e não dispara nova chamada de clima.
- **Dependências:** T-13, T-14.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/UnitToggle.tsx`, `src/components/CurrentWeather.tsx`, `src/components/ForecastCard.tsx`, `src/lib/temperature.ts`.
- **Tipo:** UI.

### T-16 — Testar componentes e estados meteorológicos

- **Descrição:** Verificar renderização dos dados, acessibilidade e comportamento da interface em seus estados principais.
- **Critérios de aceite:**
  - Testes cobrem campos opcionais presentes e ausentes no clima atual e na previsão.
  - Testes verificam a alternância de unidade e a unidade exibida.
  - Busca, seleção e retry podem ser exercidos por consultas acessíveis e interações de usuário.
  - Loading, vazio e erro são distinguíveis de sucesso.
- **Dependências:** T-12, T-13, T-14, T-15.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`, `tests/unit/SearchBar.test.tsx`, `tests/unit/UnitToggle.test.tsx`, novos testes de componentes se necessário.
- **Tipo:** Test.

## Entrega 5: Validação integrada

### T-17 — Cobrir os fluxos principais com Playwright

- **Descrição:** Validar os fluxos ponta a ponta em desktop e viewport móvel usando respostas Open-Meteo interceptadas.
- **Critérios de aceite:**
  - Teste percorre busca, consulta automática, seleção de outra cidade, clima atual e previsão com a quantidade de dias definida em T-01.
  - Testes cobrem ausência de resultados, falha com nova tentativa e alternância de unidade.
  - Interações principais funcionam por teclado e sem rolagem horizontal na viewport móvel.
  - Os testes não dependem de rede real nem de quota da Open-Meteo.
- **Dependências:** T-12, T-15.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test.

### T-18 — Executar os gates de qualidade do projeto

- **Descrição:** Verificar lint, build, testes unitários e E2E antes de considerar a entrega concluída.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` concluem sem falhas relacionadas à entrega.
  - Falhas são corrigidas ou registradas com causa reproduzível antes do fechamento.
- **Dependências:** T-04, T-06, T-09, T-10, T-16, T-17.
- **Arquivos prováveis:** nenhum arquivo específico; eventualmente arquivos de código ou teste afetados pelas falhas.
- **Tipo:** Infra.
