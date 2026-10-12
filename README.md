# Redesign de Visualizações de Dados

Página web simples para os **3 casos** do trabalho. Cada caso apresenta **uma imagem original** e **dois gráficos em D3.js**, totalizando seis redesigns ao final da atividade.

## Como executar

Abra a pasta no VS Code e use **Live Server** no arquivo `index.html`. Outra opção, no terminal, é executar `py -m http.server 5500` e acessar `http://localhost:5500`. A biblioteca D3.js é carregada pela internet.

## Como cada integrante adiciona sua parte

| Integrante | Arquivos de trabalho | Imagem original |
| --- | --- | --- |
| Caso 1 — Big Mac | `js/bigmac/info.js`, `designA.js`, `designB.js` | `imagens/bigmac-original.png` |
| Caso 2 | `js/caso2/info.js`, `designA.js`, `designB.js` | `imagens/caso2-original.png` |
| Caso 3 | `js/caso3/info.js`, `designA.js`, `designB.js` | `imagens/caso3-original.png` |

- No `info.js`, informe o título do caso, a fonte, o link e a imagem original.
- Nos arquivos `designA.js` e `designB.js`, crie os gráficos D3.js dentro dos respectivos elementos, como `#bigmac-designA` e `#bigmac-designB`.
- Coloque os arquivos de dados em `dados/` e as consultas DuckDB em `sql/`. **É obrigatório efetivamente usar DuckDB** para consultar, transformar ou validar os dados. As consultas devem ser executadas e documentadas.
- Não use bibliotecas de visualização de alto nível. Comente os códigos produzidos.
- A análise crítica, as justificativas dos redesigns e a comparação das soluções pertencem ao **relatório separado**, conforme o enunciado.

**Estado do projeto:** a página e a navegação já funcionam, mas as imagens originais, os seis gráficos e o processamento DuckDB ainda precisam ser inseridos. Nenhum dado fictício foi usado.

**Atenção:** o arquivo `dados/big-mac-full-index.csv` que já foi baixado pelo grupo **não está incluído neste pacote**. Mantenha-o em seu repositório ao copiar a página.
