# Redesign de Visualizações de Dados

Aplicação web com três visualizações originais e seis redesigns em D3.js.

## Visualizações

| Visualização | Código D3.js | Imagem original |
| --- | --- | --- |
| Global Big Mac Index | `js/bigmac/` | `imagens/bigmac-original.png` |
| Kidult Hobbies | `js/kidult-hobbies/` | `imagens/kidult-hobbies-original.png` |
| Life Expectancy by Country in 2025 | `js/life-expectancy/` | `imagens/life-expectancy-original.webp` |

## Executar

Abra `index.html` com a extensão **Live Server** do VS Code. Alternativamente, execute `py -m http.server 5500` na raiz do projeto e visite `http://localhost:5500/`. É necessária conexão à internet para carregar o D3.js pelo CDN.

As visualizações utilizam os CSVs da pasta `dados/`. As consultas e scripts DuckDB para preparação/validação estão na pasta `sql/` e seus resultados CSV já estão incluídos.

O relatório crítico é entregue separadamente.
