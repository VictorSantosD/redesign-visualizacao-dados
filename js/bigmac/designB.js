/*
 * Design B - Evolucao historica do Big Mac Index.
 * Os dados sao transformados pelo DuckDB: dados/bigmac-historico.csv.
 *
 * Conteudos das aulas:
 * - dados temporais e quantitativos (Aula 05);
 * - selecao, filtragem e derivacao (Aula 06);
 * - linhas e posicao como marcadores/canais (Aulas 07 e 10);
 * - selecoes, data() e join() (Aula 08);
 * - escalas e eixos do D3.js (Aula 09).
 */

document.addEventListener("DOMContentLoaded", async () => {
  const area = d3.select("#bigmac-designB");
  if (area.empty()) return;

  try {
    // 1. Carrega o arquivo produzido pelo DuckDB.
    const converterData = d3.timeParse("%Y-%m-%d");
    const dados = await d3.csv("dados/bigmac-historico.csv", d => ({
      pais: d.pais,
      codigo: d.codigo,
      data: converterData(d.data_referencia),
      indice: Number(d.indice_percentual)
    }));

    // 2. Seleciona quatro paises por apresentarem trajetorias contrastantes.
    // Brasil: oscilacoes; China: valores negativos persistentes;
    // Japao: reducao dos valores; Reino Unido: aproximacao do zero.
    // E uma selecao ilustrativa, nao uma amostra representativa do mundo.
    // Os demais paises continuam disponiveis no CSV tratado.
    const escolhidos = [
      { codigo: "BRA", nome: "Brasil" },
      { codigo: "CHN", nome: "China" },
      { codigo: "JPN", nome: "Japão" },
      { codigo: "GBR", nome: "Reino Unido" }
    ];

    const series = escolhidos.map(pais => ({
      nome: pais.nome,
      codigo: pais.codigo,
      valores: dados
        .filter(d => d.codigo === pais.codigo && d.data && Number.isFinite(d.indice))
        .sort((a, b) => d3.ascending(a.data, b.data))
    })).filter(s => s.valores.length > 0);

    if (series.length === 0) {
      throw new Error("Nao ha registros para os paises selecionados.");
    }

    // 3. Calcula escalas COMUNS aos quatro graficos.
    // Isso evita que a mesma diferenca pareca maior em um pais do que em outro.
    const todos = series.flatMap(s => s.valores);
    const periodo = d3.extent(todos, d => d.data);
    const limite = Math.max(20,
      Math.ceil(d3.max(todos, d => Math.abs(d.indice)) / 20) * 20);

    const largura = 440;
    const altura = 240;
    const margem = { topo: 24, direita: 76, baixo: 32, esquerda: 52 };

    const x = d3.scaleTime()
      .domain(periodo)
      .range([margem.esquerda, largura - margem.direita]);

    const y = d3.scaleLinear()
      .domain([-limite, limite])
      .range([altura - margem.baixo, margem.topo]);

    // A mesma cor representa a mesma medida nos quatro paineis.
    const corLinha = "#3274B5";
    const corTexto = getComputedStyle(area.node()).color || "#24272d";
    const corReferencia = "#9299a3";

    // Identifica a cor de fundo da pagina para destacar os rotulos
    // sem criar caixas ou fundos coloridos sobre o grafico.
    function encontrarCorFundo(elemento) {
      let atual = elemento;
      while (atual) {
        const fundo = getComputedStyle(atual).backgroundColor;
        if (fundo && fundo !== "transparent" &&
            fundo !== "rgba(0, 0, 0, 0)") {
          return fundo;
        }
        atual = atual.parentElement;
      }
      return "#ffffff";
    }
    const corFundo = encontrarCorFundo(area.node());
    const anoInicial = periodo[0].getFullYear();
    const anoFinal = periodo[1].getFullYear();

    // 4. Cria titulo e subtitulo curtos, mas autoexplicativos.
    area.selectAll("*").remove();
    area.append("p")
      .style("margin", "12px 14px 4px")
      .style("font-size", "15px")
      .style("font-weight", "600")
      .style("color", corTexto)
      .text(`Índice Big Mac em 4 países: evolução histórica (${anoInicial}–${anoFinal})`);

    area.append("p")
      .style("margin", "0 14px 12px")
      .style("font-size", "12px")
      .style("color", corTexto)
      .text("Brasil, China, Japão e Reino Unido: selecionados por trajetórias diferentes de preços relativos aos EUA.");

    area.append("p")
      .style("margin", "-6px 14px 12px")
      .style("font-size", "12px")
      .style("color", corTexto)
      .text("0% = mesmo preço dos EUA; positivo = mais caro; negativo = mais barato.");

    // Os quatro graficos ficam em duas colunas no computador e uma no celular.
    const grade = area.append("div")
      .style("display", "grid")
      .style("grid-template-columns", "repeat(auto-fit, minmax(min(100%, 360px), 1fr))")
      .style("gap", "10px")
      .style("padding", "0 12px 14px");

    // 5. Desenha um pequeno grafico de linhas por pais.
    series.forEach(serie => {
      const painel = grade.append("div");

      painel.append("p")
        .style("margin", "0 0 2px")
        .style("font-size", "13px")
        .style("font-weight", "600")
        .style("color", corTexto)
        .text(serie.nome);

      const svg = painel.append("svg")
        .attr("viewBox", `0 0 ${largura} ${altura}`)
        .attr("role", "img")
        .attr("aria-label", `Evolução do índice Big Mac para ${serie.nome}`)
        .style("display", "block")
        .style("width", "100%")
        .style("height", "auto");

      // Eixos temporais e percentuais estudados na Aula 09.
      svg.append("g")
        .attr("transform", `translate(0, ${altura - margem.baixo})`)
        .call(d3.axisBottom(x).ticks(d3.timeYear.every(5)).tickFormat(d3.timeFormat("%Y")));

      svg.append("g")
        .attr("transform", `translate(${margem.esquerda}, 0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

      // Linha horizontal que representa a igualdade com os EUA (0%).
      svg.append("line")
        .attr("x1", margem.esquerda)
        .attr("x2", largura - margem.direita)
        .attr("y1", y(0))
        .attr("y2", y(0))
        .attr("stroke", corReferencia)
        .attr("stroke-dasharray", "4 3");

      // Gerador de linha: data no eixo X e percentual no eixo Y.
      const linha = d3.line()
        .x(d => x(d.data))
        .y(d => y(d.indice));

      svg.append("path")
        .datum(serie.valores)
        .attr("fill", "none")
        .attr("stroke", corLinha)
        .attr("stroke-width", 2.4)
        .attr("d", linha);

      // Pontos pequenos deixam os valores individuais consultaveis.
      svg.append("g")
        .selectAll("circle")
        .data(serie.valores)
        .join("circle")
        .attr("cx", d => x(d.data))
        .attr("cy", d => y(d.indice))
        .attr("r", 2.2)
        .attr("fill", corLinha)
        .append("title")
        .text(d => `${serie.nome} - ${d3.timeFormat("%m/%Y")(d.data)}: ${d.indice.toFixed(1).replace(".", ",")}%`);

      // Exibe o percentual da ultima observacao ao lado do fim da linha.
      // A margem direita evita que o rotulo ultrapasse o SVG.
      const ultimo = serie.valores[serie.valores.length - 1];
      const percentualFinal = `${ultimo.indice > 0 ? "+" : ""}${ultimo.indice.toFixed(1).replace(".", ",")}%`;

      svg.append("text")
        .attr("x", x(ultimo.data) + 8)
        .attr("y", y(ultimo.indice))
        .attr("dominant-baseline", "middle")
        .attr("font-size", 12)
        .attr("font-weight", "600")
        .attr("fill", corTexto)
        .text(percentualFinal)
        .append("title")
        .text(`Valor em ${d3.timeFormat("%m/%Y")(ultimo.data)}`);

      // 6. Destaca o MAIOR e o MENOR valor da serie de cada pais.
      // As marcas mostram os extremos do periodo, nao apenas variacoes
      // locais de um ano para outro.
      const maximo = d3.greatest(serie.valores, d => d.indice);
      const minimo = d3.least(serie.valores, d => d.indice);
      const extremos = [
        { dado: maximo, tipo: "Máx", deslocamentoY: -12 },
        { dado: minimo, tipo: "Mín", deslocamentoY: 17 }
      ];

      // Formata os valores com sinal e virgula decimal.
      function formatarPercentual(valor) {
        const sinal = valor > 0 ? "+" : "";
        return `${sinal}${valor.toFixed(1).replace(".", ",")}%`;
      }

      extremos.forEach(extremo => {
        const ponto = extremo.dado;
        const posX = x(ponto.data);
        const posY = y(ponto.indice);
        const esquerda = margem.esquerda;
        const direita = largura - margem.direita;

        // Aproxima o rotulo do ponto, mas evita sair da area util.
        // Nos anos mais recentes, alinha para a esquerda para nao
        // coincidir com o percentual final de 2025.
        let ancora = "middle";
        let rotuloX = posX;
        if (posX > direita - 65) {
          ancora = "end";
          rotuloX = posX - 9;
        } else if (posX < esquerda + 65) {
          ancora = "start";
          rotuloX = posX + 9;
        }

        svg.append("circle")
          .attr("cx", posX)
          .attr("cy", posY)
          .attr("r", 4.3)
          .attr("fill", corLinha)
          .attr("stroke", corFundo)
          .attr("stroke-width", 1.5)
          .append("title")
          .text(`${extremo.tipo} — ${serie.nome}, ${d3.timeFormat("%m/%Y")(ponto.data)}: ${formatarPercentual(ponto.indice)}`);

        // Uma borda fina da cor do fundo separa o texto da linha.
        svg.append("text")
          .attr("x", rotuloX)
          .attr("y", posY + extremo.deslocamentoY)
          .attr("text-anchor", ancora)
          .attr("font-size", 11)
          .attr("font-weight", "600")
          .attr("fill", corTexto)
          .attr("stroke", corFundo)
          .attr("stroke-width", 3)
          .attr("stroke-linejoin", "round")
          .style("paint-order", "stroke")
          .text(`${extremo.tipo} ${formatarPercentual(ponto.indice)}`);
      });

      // Texto legivel tanto no tema claro como no escuro.
      svg.selectAll(".tick text")
        .attr("fill", corTexto)
        .attr("font-size", 11);
      svg.selectAll(".tick line, .domain").attr("stroke", corReferencia);
    });

  } catch (erro) {
    console.error("Erro ao montar o Design B:", erro);
    area.text("Nao foi possivel carregar dados/bigmac-historico.csv. Execute o script DuckDB e abra com Live Server.");
  }
});
