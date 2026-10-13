/*
 * Design A — Big Mac Index (D3.js)
 * Dados preparados pelo DuckDB: dados/bigmac-tratado.csv
 *
 * Aulas 07 a 11: marcadores, canais visuais, selecoes,
 * escalas, eixos, graficos de barras e uso de cores.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const area = d3.select("#bigmac-designA");
  if (area.empty()) return;

  try {
    // Carrega o CSV tratado e converte os campos numericos.
    const dados = await d3.csv("dados/bigmac-tratado.csv", d => ({
      pais: d.pais,
      codigo: d.codigo,
      data: d.data_referencia,
      indice: Number(d.indice_percentual),
      preco: Number(d.preco_dolar)
    }));

    const paises = dados
      .filter(d => d.pais && Number.isFinite(d.indice))
      .sort((a, b) => d3.descending(a.indice, b.indice));

    if (!paises.length) throw new Error("O CSV tratado esta vazio.");

    // Duas cores para distinguir valores negativos e positivos.
    const azul = "#3274B5";
    const laranja = "#D97732";

    const [ano, mes] = paises[0].data.split("-");
    const periodo = `${mes}/${ano}`;

    // Usa as cores de texto da propria pagina (inclusive tema escuro).
    const corTexto = getComputedStyle(area.node()).color || "#ffffff";
    const corEixo = "#989da5";

    // Maior magnitude define uma escala SIMETRICA comum a todas as colunas.
    // Assim, 30% tem o mesmo comprimento em qualquer painel.
    const maximo = d3.max(paises, d => Math.abs(d.indice));
    const limite = Math.max(10, Math.ceil(maximo / 10) * 10);

    function desenhar() {
      const larguraDisponivel = area.node().clientWidth;

      // No desktop, os 52 paises ocupam tres colunas, reduzindo a altura.
      // Em telas menores, usamos duas ou uma para preservar a legibilidade.
      const colunas = larguraDisponivel >= 1110 ? 3 : larguraDisponivel >= 730 ? 2 : 1;
      const itensPorColuna = Math.ceil(paises.length / colunas);
      const larguraColuna = Math.max(310, larguraDisponivel / colunas);
      const alturaLinha = 23;

      area.selectAll("*").remove();
      area.style("overflow", "hidden");

      area.append("p")
        .style("margin", "12px 14px 3px")
        .style("font-size", "15px")
        .style("font-weight", "600")
        .style("color", corTexto)
        .text(`Índice Big Mac: preços comparados aos EUA (%) — ${periodo}`);

      area.append("p")
        .style("margin", "0 14px 10px")
        .style("font-size", "12px")
        .style("color", corTexto)
        .text("Azul: Big Mac mais barato; laranja: mais caro. Zero = mesmo preço dos EUA.");

      const grade = area.append("div")
        .style("display", "grid")
        .style("grid-template-columns", `repeat(${colunas}, minmax(0, 1fr))`)
        .style("gap", "6px")
        .style("padding", "0 10px 12px");

      for (let coluna = 0; coluna < colunas; coluna++) {
        const inicio = coluna * itensPorColuna;
        const trecho = paises.slice(inicio, inicio + itensPorColuna);
        if (!trecho.length) continue;

        // Cada coluna tem a MESMA escala horizontal e a mesma linha de zero.
        const margem = {
          topo: 33,
          baixo: 5,
          esquerda: 131,
          direita: 52
        };
        const largura = larguraColuna - 12;
        const altura = margem.topo + trecho.length * alturaLinha + margem.baixo;

        const escalaX = d3.scaleLinear()
          .domain([-limite, limite])
          .range([margem.esquerda, largura - margem.direita]);

        const escalaY = d3.scaleBand()
          .domain(trecho.map(d => d.codigo))
          .range([margem.topo, altura - margem.baixo])
          .padding(0.19);

        const svg = grade.append("div")
          .append("svg")
          .attr("viewBox", `0 0 ${largura} ${altura}`)
          .attr("role", "img")
          .attr("aria-label", `Big Mac Index, países ${inicio + 1} a ${inicio + trecho.length}`)
          .style("display", "block")
          .style("width", "100%")
          .style("height", "auto");

        // Eixo e valores em porcentagem.
        svg.append("g")
          .attr("transform", `translate(0, ${margem.topo - 5})`)
          .call(
            d3.axisTop(escalaX)
              .tickValues([-limite, 0, limite])
              .tickFormat(d => `${d}%`)
              .tickSize(4)
          )
          .call(g => g.selectAll("text")
            .attr("fill", corTexto)
            .attr("font-size", 10))
          .call(g => g.selectAll("line, path").attr("stroke", corEixo));

        // Linha vertical de referencia em zero.
        svg.append("line")
          .attr("x1", escalaX(0))
          .attr("x2", escalaX(0))
          .attr("y1", margem.topo - 5)
          .attr("y2", altura - margem.baixo)
          .attr("stroke", corEixo)
          .attr("stroke-width", 1);

        // Nomes dos paises alinhados a esquerda da area das barras.
        svg.append("g")
          .selectAll("text")
          .data(trecho)
          .join("text")
          .attr("x", margem.esquerda - 8)
          .attr("y", d => escalaY(d.codigo) + escalaY.bandwidth() / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("font-size", 11)
          .attr("fill", corTexto)
          .text(d => d.pais)
          .append("title")
          .text(d => d.pais);

        // Cada registro do CSV e representado por um retangulo.
        svg.append("g")
          .selectAll("rect")
          .data(trecho)
          .join("rect")
          .attr("x", d => Math.min(escalaX(0), escalaX(d.indice)))
          .attr("y", d => escalaY(d.codigo))
          .attr("width", d => Math.abs(escalaX(d.indice) - escalaX(0)))
          .attr("height", escalaY.bandwidth())
          .attr("fill", d => d.indice < 0 ? azul : laranja)
          .append("title")
          .text(d => {
            const percentual = d.indice.toLocaleString("pt-BR", {
              minimumFractionDigits: 1, maximumFractionDigits: 1
            });
            return `${d.pais}: ${percentual}%\nBig Mac: US$ ${d.preco.toFixed(2)}`;
          });

        // Os percentuais ficam junto a extremidade de cada barra.
        // Se couberem, vao DENTRO da barra; caso contrario, ficam fora.
        // A cor do texto muda para manter contraste no fundo escuro e nas barras.
        svg.append("g")
          .selectAll("text")
          .data(trecho)
          .join("text")
          .attr("y", d => escalaY(d.codigo) + escalaY.bandwidth() / 2)
          .attr("dominant-baseline", "middle")
          .attr("font-size", 11)
          .attr("font-weight", "600")
          .text(d => `${d.indice > 0 ? "+" : ""}${d.indice.toFixed(1).replace(".", ",")}%`)
          .each(function(d) {
            const rotulo = d3.select(this);
            const tamanhoBarra = Math.abs(escalaX(d.indice) - escalaX(0));
            const tamanhoTexto = this.getComputedTextLength();
            const cabeDentro = tamanhoBarra >= tamanhoTexto + 12;

            if (d.indice < 0) {
              rotulo
                .attr("x", escalaX(d.indice) + (cabeDentro ? 6 : -6))
                .attr("text-anchor", cabeDentro ? "start" : "end");
            } else {
              rotulo
                .attr("x", escalaX(d.indice) + (cabeDentro ? -6 : 6))
                .attr("text-anchor", cabeDentro ? "end" : "start");
            }

            // Texto claro nas barras azuis; texto escuro nas laranjas.
            // Fora das barras, herda a cor normal da pagina.
            rotulo.attr("fill", cabeDentro
              ? (d.indice < 0 ? "#ffffff" : "#171717")
              : corTexto);
          });
      }
    }

    desenhar();

    // Reorganiza apenas quando o numero de colunas precisa mudar.
    let colunasAnteriores = area.node().clientWidth >= 1110 ? 3
      : area.node().clientWidth >= 730 ? 2 : 1;

    window.addEventListener("resize", () => {
      const largura = area.node().clientWidth;
      const colunasAtuais = largura >= 1110 ? 3 : largura >= 730 ? 2 : 1;
      if (colunasAtuais !== colunasAnteriores) {
        colunasAnteriores = colunasAtuais;
        desenhar();
      }
    });

  } catch (erro) {
    console.error("Falha ao desenhar o Big Mac Index:", erro);
    area.text("Nao foi possivel carregar dados/bigmac-tratado.csv. Use o Live Server e confira o arquivo.");
  }
});
