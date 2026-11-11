# Especificação do Produto: Weather App

## 1. Visão geral

Aplicação web responsiva para consultar as condições meteorológicas atuais e a previsão para os próximos cinco dias de uma cidade pesquisada. O usuário poderá alternar a unidade de temperatura entre Celsius e Fahrenheit.

## 2. Objetivos

- Permitir que o usuário encontre uma cidade e consulte seu clima.
- Exibir as condições atuais e a previsão de cinco dias de forma compreensível.
- Oferecer a temperatura em Celsius ou Fahrenheit.
- Permitir o uso em dispositivos móveis e em telas maiores.

## 3. Escopo

### Incluído

- Busca de cidades por nome.
- Exibição do clima atual da cidade selecionada.
- Exibição da previsão diária dos próximos cinco dias.
- Alternância entre Celsius e Fahrenheit.
- Interface responsiva para dispositivos móveis.
- Estados de carregamento, ausência de resultados e falha ao consultar dados.

### Fora do escopo nesta versão

- Previsão por hora.
- Alertas meteorológicos e notificações.
- Cadastro de usuário, sincronização entre dispositivos ou compartilhamento.
- Gerenciamento de uma lista de cidades favoritas.
- Consulta automática da localização do dispositivo.

Os itens fora do escopo podem ser reconsiderados após responder às perguntas em aberto.

## 4. Personas e necessidade

**Pessoa usuária:** alguém que deseja consultar rapidamente o tempo de uma cidade, seja para saber as condições atuais ou planejar os próximos dias, usando um celular ou outro dispositivo.

**Necessidade:** encontrar uma cidade, entender as condições atuais e verificar a tendência do tempo para cinco dias, escolhendo a unidade de temperatura que prefere.

## 5. Histórias de usuário

- Como pessoa usuária, quero buscar uma cidade pelo nome e selecionar o resultado correto para consultar o clima daquele local.
- Como pessoa usuária, quero ver a temperatura e as condições atuais da cidade selecionada para entender o tempo neste momento.
- Como pessoa usuária, quero consultar a previsão diária dos próximos cinco dias para planejar minhas atividades.
- Como pessoa usuária, quero alternar entre Celsius e Fahrenheit para visualizar as temperaturas na unidade que prefiro.
- Como pessoa usuária, quero receber feedback durante o carregamento ou quando uma consulta falhar para saber o que está acontecendo e poder tentar novamente.
- Como pessoa usuária em um dispositivo móvel, quero realizar a busca e consultar as informações sem perder conteúdo ou funcionalidades.

## 6. Requisitos funcionais

- **RF-01 — Buscar cidade:** o sistema deve permitir informar o nome de uma cidade e iniciar uma busca.
- **RF-02 — Selecionar resultado:** quando houver correspondências, o sistema consulta automaticamente a primeira cidade e apresenta opções distinguíveis para selecionar outra. Quando não houver correspondências, deve informar que nenhuma cidade foi encontrada.
- **RF-03 — Exibir clima atual:** após a seleção de uma cidade, o sistema deve apresentar seu nome e país, a temperatura atual e as condições meteorológicas atuais. Se os dados estiverem disponíveis na fonte, também deve apresentar sensação térmica, umidade e velocidade do vento.
- **RF-04 — Exibir previsão de cinco dias:** o sistema deve apresentar uma previsão diária para cinco dias de calendário, incluindo hoje, associada à cidade selecionada. Cada dia deve identificar a data e as condições meteorológicas; temperaturas mínima e máxima devem ser exibidas quando disponíveis.
- **RF-05 — Alternar unidade:** o usuário deve poder alternar a unidade de temperatura entre Celsius (°C) e Fahrenheit (°F). As temperaturas atuais, sensação térmica e temperaturas da previsão devem refletir a unidade escolhida.
- **RF-06 — Manter contexto durante a alternância:** alterar a unidade não deve limpar a cidade selecionada nem exigir uma nova busca da cidade.
- **RF-07 — Informar carregamento:** enquanto a busca ou a consulta meteorológica estiver em andamento, o sistema deve indicar que os dados estão sendo carregados.
- **RF-08 — Tratar falhas:** se não for possível obter os dados, o sistema deve apresentar uma mensagem compreensível e permitir que o usuário tente novamente.
- **RF-09 — Tratar entrada vazia:** o sistema não deve executar uma busca com o campo de cidade vazio ou composto apenas por espaços; deve orientar o usuário a informar uma cidade.

## 7. Requisitos não funcionais

- **RNF-01 — Responsividade:** os fluxos de busca e consulta devem funcionar em dispositivos móveis e em telas maiores, sem perda de conteúdo ou necessidade de rolagem horizontal da página.
- **RNF-02 — Acessibilidade:** controles devem ter nomes acessíveis, ser operáveis por teclado e apresentar foco visível. Informações e estados não devem depender apenas de cor.
- **RNF-03 — Compreensibilidade:** temperaturas devem indicar claramente a unidade; datas e condições devem estar associadas aos respectivos dias.
- **RNF-04 — Resiliência:** falhas de rede, ausência de resultados e respostas sem dados opcionais não devem impedir a utilização dos demais recursos disponíveis.
- **RNF-05 — Segurança e privacidade:** a aplicação não deve solicitar dados pessoais para a consulta descrita nesta versão. Caso uma integração exija credenciais, segredos não devem ser expostos na interface cliente.

## 8. Critérios de aceite

- **CA-01:** dada uma busca por um nome de cidade válido, quando houver resultados, então os dados da primeira cidade são exibidos automaticamente e o usuário consegue identificar e selecionar outra cidade.
- **CA-02:** dada uma busca sem correspondências, então a interface informa que nenhuma cidade foi encontrada e permite iniciar outra busca.
- **CA-03:** após selecionar uma cidade com dados disponíveis, a interface exibe o nome da cidade, o país, a temperatura atual e uma descrição das condições atuais.
- **CA-04:** após selecionar uma cidade com previsão disponível, a interface exibe cinco dias incluindo hoje, com data e condições meteorológicas; exibe máximas e mínimas quando fornecidas.
- **CA-05:** ao alternar de Celsius para Fahrenheit ou vice-versa, todas as temperaturas apresentadas são atualizadas para a unidade selecionada, sem remover a cidade consultada.
- **CA-06:** durante uma consulta em andamento, há uma indicação de carregamento; após uma falha, há uma mensagem compreensível e uma ação de nova tentativa.
- **CA-07:** uma busca vazia ou contendo apenas espaços não inicia uma consulta e recebe orientação para informar uma cidade.
- **CA-08:** em uma viewport móvel e em uma viewport de desktop, o usuário consegue buscar uma cidade, selecionar um resultado e consultar clima atual e previsão sem rolagem horizontal da página.
- **CA-09:** os controles principais podem ser alcançados e acionados por teclado, com foco visível e nomes acessíveis.

## 9. Casos de borda

- **Entrada vazia ou somente com espaços:** não iniciar a busca e orientar a pessoa usuária a informar uma cidade.
- **Nenhum resultado para a busca:** informar que nenhuma cidade foi encontrada e permitir uma nova busca.
- **Várias cidades com o mesmo nome:** consultar a primeira e apresentar contexto suficiente nos resultados para diferenciá-las e permitir a seleção do local desejado.
- **Falha ou indisponibilidade da consulta:** exibir uma mensagem compreensível, manter disponível a ação de nova tentativa e não apresentar dados como se fossem atuais quando a consulta falhar.
- **Dados meteorológicos opcionais ausentes:** omitir os campos indisponíveis, como sensação térmica, umidade, vento ou máximas e mínimas, sem inventar valores nem bloquear a exibição dos demais dados.
- **Previsão incompleta na fonte:** apresentar somente os períodos disponíveis e indicar claramente que parte da previsão não pôde ser carregada, em vez de preencher dias ausentes com valores inferidos.
- **Alternância de unidade após uma consulta:** atualizar as temperaturas exibidas sem limpar a cidade selecionada; os valores que não forem temperaturas não devem ser convertidos.
- **Nome de cidade longo em tela pequena:** manter o nome legível sem sobrepor outros conteúdos ou impedir o uso dos controles.

## 10. Riscos e mitigação

- **Ambiguidade de nomes de cidades:** cidades diferentes podem ter o mesmo nome. Apresentar informações de desambiguação, como região e país, nos resultados.
- **Indisponibilidade ou lentidão da fonte meteorológica:** pode impedir ou atrasar as consultas. Exibir estados de carregamento e erro, com opção de nova tentativa.
- **Dados incompletos ou inconsistentes:** alguns campos podem não ser fornecidos para todas as cidades. Tratar os dados opcionais sem quebrar a visualização e não mostrar valores enganosos.
- **Layout em telas pequenas:** informações meteorológicas podem ficar comprimidas. Priorizar leitura e controles essenciais em larguras móveis.

## 11. Perguntas em aberto

- A busca deve aceitar apenas cidades ou também localidades e regiões? Deve sugerir resultados enquanto o usuário digita ou buscar após envio explícito?
- Quando nomes forem iguais, quais dados de contexto devem aparecer para distinguir os resultados (país, estado/região ou ambos)?
- Quais campos do clima atual são obrigatórios além de temperatura e descrição das condições?
- A unidade escolhida deve permanecer apenas durante a sessão ou ser salva entre visitas?
- A aplicação deve oferecer localização automática do dispositivo ou manter a busca manual como único meio de selecionar uma cidade?
- Há requisitos de idioma, fuso horário e formato de data além do idioma da interface definido para o produto?
- Qual tempo máximo de espera ou meta de desempenho deve ser atendido para busca e carregamento dos dados?
- Há uma fonte de dados meteorológicos definida e limites de disponibilidade ou atualização que precisem ser considerados?

## 12. Premissas provisórias

- A seleção da cidade é iniciada por busca manual; geolocalização não é necessária nesta versão.
- A previsão é diária, e não horária.
- A interface apresenta resultados de busca suficientes para distinguir cidades homônimas.
- A fonte de dados pode fornecer condições atuais e previsão para a cidade selecionada; o formato exato de resposta será definido no plano técnico.
- Campos meteorológicos complementares são apresentados apenas quando disponíveis.
