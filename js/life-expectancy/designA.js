/*
 * Life Expectancy — Design A: ranking horizontal (D3.js, aulas 08, 09 e 10).
 * Entrada: dados/expectativa-ranking.csv, produzido pelo DuckDB.
 * Tarefa: comparar os 10 maiores e os 10 menores valores de 2025.
 * Escala numérica começa em ZERO (aula 10), igual nos dois painéis.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const area = d3.select("#life-expectancy-designA");
  if (area.empty()) return;

  try {
    // D3 vincula cada linha tratada ao respectivo marcador SVG.
    const dados = await d3.csv("dados/expectativa-ranking.csv", d => ({
      pais: d.pais,
      expectativa: Number(d.expectativa),
      grupo: d.grupo,
      ordem: Number(d.ordem)
    }));
    const validos = dados.filter(d => d.pais && Number.isFinite(d.expectativa));
    if (validos.length !== 20) throw new Error("Ranking incompleto: execute DuckDB.");

    area.selectAll("*").remove();
    area.append("h4")
      .style("margin", "14px 14px 4px")
      .text("Expectativa de vida: os maiores e menores valores em 2025");
    area.append("p")
      .style("margin", "0 14px 12px")
      .style("font-size", "13px")
      .text("Dez registros em cada extremo. Barras na mesma escala de 0 a 90 anos.");

    const corTexto = getComputedStyle(area.node()).color || "#e8edf4";
    const corEixo = "#9aa3ad";

    // Os painéis ficam lado a lado quando houver espaço; no celular, empilham.
    const grade = area.append("div")
      .style("display", "grid")
      .style("grid-template-columns", "repeat(auto-fit, minmax(min(100%, 500px), 1fr))")
      .style("gap", "16px")
      .style("padding", "0 12px 12px");

    const grupos = [
      { id: "maiores", titulo: "10 maiores expectativas", cor: "#4e91c9" },
      { id: "menores", titulo: "10 menores expectativas", cor: "#e09a54" }
    ];

    grupos.forEach(config => {
      const linhas = validos.filter(d => d.grupo === config.id)
        .sort((a, b) => d3.ascending(a.ordem, b.ordem));
      if (linhas.length !== 10) throw new Error(`Grupo ${config.id} incompleto.`);

      const painel = grade.append("div").style("min-width", "0");
      painel.append("h5")
        .style("margin", "5px 3px 8px")
        .style("font-size", "14px")
        .text(config.titulo);
      const rolamento = painel.append("div").style("overflow-x", "auto");

      const largura = 550;
      const altura = 375;
      const margem = { topo: 18, direita: 55, baixo: 45, esquerda: 189 };
      // Mesmo domínio/range em ambos os painéis = comparação honesta.
      const x = d3.scaleLinear().domain([0, 90])
        .range([margem.esquerda, largura - margem.direita]);
      const y = d3.scaleBand().domain(linhas.map(d => d.pais))
        .range([margem.topo, altura - margem.baixo]).padding(0.24);

      const svg = rolamento.append("svg")
        .attr("viewBox", `0 0 ${largura} ${altura}`)
        .attr("role", "img")
        .attr("aria-label", `${config.titulo}; expectativa de vida ao nascer em anos`)
        .style("display", "block")
        .style("width", "100%")
        .style("min-width", "485px")
        .style("height", "auto");

      // Grade discreta, eixo de 0 a 90 e rótulo da unidade.
      const marcas = [0, 20, 40, 60, 80];
      svg.append("g").selectAll("line.grade")
        .data(marcas).join("line")
        .attr("x1", d => x(d)).attr("x2", d => x(d))
        .attr("y1", margem.topo - 5).attr("y2", altura - margem.baixo)
        .attr("stroke", corEixo).attr("stroke-opacity", 0.2);
      svg.append("g")
        .attr("transform", `translate(0,${altura - margem.baixo})`)
        .call(d3.axisBottom(x).tickValues(marcas).tickSizeOuter(0))
        .call(g => g.selectAll("text").attr("fill", corTexto).attr("font-size", 12))
        .call(g => g.selectAll("line, path").attr("stroke", corEixo));
      svg.append("text")
        .attr("x", largura - margem.direita)
        .attr("y", altura - 5)
        .attr("text-anchor", "end").attr("fill", corTexto)
        .attr("font-size", 12).text("Anos");

      // Barras com início comum em zero — posição/comprimento codificam magnitude.
      svg.append("g").selectAll("rect.barra")
        .data(linhas).join("rect")
        .attr("x", x(0)).attr("y", d => y(d.pais))
        .attr("width", d => x(d.expectativa) - x(0))
        .attr("height", y.bandwidth()).attr("rx", 2)
        .attr("fill", config.cor)
        .append("title").text(d => `${d.pais}: ${d.expectativa} anos`);

      // Identificação direta das categorias e valores numéricos.
      svg.append("g").selectAll("text.nome")
        .data(linhas).join("text")
        .attr("x", margem.esquerda - 9)
        .attr("y", d => y(d.pais) + y.bandwidth() / 2)
        .attr("text-anchor", "end").attr("dominant-baseline", "middle")
        .attr("font-size", 11.5).attr("fill", corTexto)
        .text(d => d.pais);
      svg.append("g").selectAll("text.valor")
        .data(linhas).join("text")
        .attr("x", d => x(d.expectativa) + 7)
        .attr("y", d => y(d.pais) + y.bandwidth() / 2)
        .attr("dominant-baseline", "middle")
        .attr("font-weight", "600").attr("font-size", 12)
        .attr("fill", corTexto)
        .text(d => `${d.expectativa}`);
    });

    area.append("p")
      .style("margin", "4px 14px 14px").style("font-size", "12px")
      .text("Os dados são projeções arredondadas para anos inteiros. Quando há empate, a seleção de dez registros usa o nome em ordem alfabética; outros países podem ter o mesmo valor. Fonte: Visual Capitalist / ONU.");
  } catch (erro) {
    console.error("Design A (expectativa de vida):", erro);
    area.text("Não foi possível carregar o ranking. Execute 'py sql/preparar_expectativa.py' e abra o site pelo Live Server.");
  }
});