/*
 * Life Expectancy — Design B: histograma (D3.js, aulas 06, 09 e 10).
 * Entrada: dados/expectativa-distribuicao.csv, gerado pelo DuckDB.
 * DuckDB faz binning de 5 anos e calcula a frequência por intervalo.
 * Tarefa: identificar a concentração/distribuição de países e territórios.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const area = d3.select("#life-expectancy-designB");
  if (area.empty()) return;

  try {
    const dados = await d3.csv("dados/expectativa-distribuicao.csv", d => ({
      inicio: Number(d.faixa_inicio),
      fim: Number(d.faixa_fim),
      quantidade: Number(d.quantidade)
    }));
    const faixas = dados.filter(d =>
      Number.isFinite(d.inicio) && Number.isFinite(d.fim) &&
      Number.isInteger(d.quantidade) && d.quantidade >= 0
    ).sort((a, b) => d3.ascending(a.inicio, b.inicio));

    if (!faixas.length) throw new Error("O histograma não contém dados válidos.");
    const total = d3.sum(faixas, d => d.quantidade);
    if (total !== 238) throw new Error(`Esperados 238 registros, encontrados ${total}.`);
    const classeModal = d3.greatest(faixas, d => d.quantidade);

    area.selectAll("*").remove();
    area.append("h4")
      .style("margin", "14px 14px 4px")
      .text("Como se distribuem as expectativas de vida em 2025?");
    area.append("p")
      .style("margin", "0 14px 12px").style("font-size", "13px")
      .text("Número de países e territórios por intervalos de 5 anos.");

    const corTexto = getComputedStyle(area.node()).color || "#e8edf4";
    const corEixo = "#9aa3ad";
    const largura = 830;
    const altura = 410;
    const margem = { topo: 40, direita: 26, baixo: 67, esquerda: 65 };

    // O eixo X é quantitativo e contínuo: os intervalos ficam contíguos.
    const limiteInferior = d3.min(faixas, d => d.inicio);
    const limiteSuperior = d3.max(faixas, d => d.inicio + 5);
    const x = d3.scaleLinear()
      .domain([limiteInferior, limiteSuperior])
      .range([margem.esquerda, largura - margem.direita]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(faixas, d => d.quantidade)])
      .nice()
      .range([altura - margem.baixo, margem.topo]);

    const rolagem = area.append("div")
      .style("overflow-x", "auto")
      .style("padding", "0 12px");
    const svg = rolagem.append("svg")
      .attr("viewBox", `0 0 ${largura} ${altura}`)
      .attr("role", "img")
      .attr("aria-label", "Histograma com frequência de países e territórios por faixas de expectativa de vida")
      .style("display", "block").style("width", "100%")
      .style("min-width", "615px").style("height", "auto");

    // Grade horizontal auxilia a leitura das frequências.
    svg.append("g").selectAll("line.grade")
      .data(y.ticks(5)).join("line")
      .attr("x1", margem.esquerda).attr("x2", largura - margem.direita)
      .attr("y1", d => y(d)).attr("y2", d => y(d))
      .attr("stroke", corEixo).attr("stroke-opacity", 0.2);

    // Ticks nas fronteiras: 55, 60, 65 ... 90. A classe é [55,60), etc.
    const ticks = d3.range(limiteInferior, limiteSuperior + 1, 5);
    svg.append("g")
      .attr("transform", `translate(0,${altura - margem.baixo})`)
      .call(d3.axisBottom(x).tickValues(ticks).tickFormat(d3.format("d")).tickSizeOuter(0))
      .call(g => g.selectAll("text").attr("fill", corTexto).attr("font-size", 12))
      .call(g => g.selectAll("line, path").attr("stroke", corEixo));
    svg.append("g")
      .attr("transform", `translate(${margem.esquerda},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("d")))
      .call(g => g.selectAll("text").attr("fill", corTexto).attr("font-size", 12))
      .call(g => g.selectAll("line, path").attr("stroke", corEixo));

    // As barras são adjacentes (histograma, não barras por categorias arbitrárias).
    svg.append("g").selectAll("rect.classe")
      .data(faixas).join("rect")
      .attr("x", d => x(d.inicio))
      .attr("y", d => y(d.quantidade))
      .attr("width", d => x(d.inicio + 5) - x(d.inicio) - 1)
      .attr("height", d => y(0) - y(d.quantidade))
      .attr("fill", d => d.inicio === classeModal.inicio ? "#e09a54" : "#4e91c9")
      .append("title")
      .text(d => `${d.inicio}–${d.fim} anos: ${d.quantidade} países e territórios`);

    svg.append("g").selectAll("text.frequencia")
      .data(faixas).join("text")
      .attr("x", d => (x(d.inicio) + x(d.inicio + 5)) / 2)
      .attr("y", d => y(d.quantidade) - 9)
      .attr("text-anchor", "middle").attr("font-size", 15)
      .attr("font-weight", "600").attr("fill", corTexto)
      .text(d => d.quantidade);

    svg.append("text")
      .attr("x", (margem.esquerda + largura - margem.direita) / 2)
      .attr("y", altura - 17).attr("text-anchor", "middle")
      .attr("font-size", 13).attr("fill", corTexto)
      .text("Expectativa de vida ao nascer (anos)");
    svg.append("text")
      .attr("x", 17).attr("y", margem.topo - 12)
      .attr("font-size", 12).attr("fill", corTexto)
      .text("Quantidade");

    area.append("p")
      .style("margin", "4px 14px 14px").style("font-size", "12px")
      .text(`Total: ${total} países e territórios; faixa mais frequente: ${classeModal.inicio}–${classeModal.fim} anos (${classeModal.quantidade}). O resultado conta países e territórios, não pessoas; cada registro tem peso igual.`);
  } catch (erro) {
    console.error("Design B (expectativa de vida):", erro);
    area.text("Não foi possível carregar o histograma. Execute 'py sql/preparar_expectativa.py' e abra o site pelo Live Server.");
  }
});