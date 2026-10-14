// Design B - Mapa de calor com as quatro faixas etárias.

document.addEventListener("DOMContentLoaded", async () => {

    const area = d3.select("#kidult-hobbies-designB");
    if (area.empty()) return;

    // Lê os dados da planilha.
    const dados = await d3.dsv(";", "dados/kidult.csv", d => ({
        idade: d["Age Group"],
        hobby: d["Game"],
        percentual: Number(d["Percentage"])
    }));

    const idades = ["18-34", "35-49", "50-64", "65+"];
    const hobbies = [...new Set(dados.map(d => d.hobby))];

    // Limpa a área para evitar textos repetidos.
    area.selectAll("*").remove();
    area.text("");

    // Título e explicações no mesmo estilo usado no outro gráfico.
    area.append("p")
        .style("margin", "12px 14px 4px")
        .style("font-size", "15px")
        .style("font-weight", "600")
        .style("color", "#FFFFFF")
        .text("Kidult Hobbies: percepção dos hobbies por idade");

    area.append("p")
        .style("margin", "0 14px 12px")
        .style("font-size", "12px")
        .style("color", "#FFFFFF")
        .text("Comparação dos 20 hobbies entre as quatro faixas etárias da pesquisa: 18-34, 35-49, 50-64 e 65+.");

    area.append("p")
        .style("margin", "-6px 14px 12px")
        .style("font-size", "12px")
        .style("color", "#FFFFFF")
        .text("Cada célula mostra o percentual que considera o hobby infantil. Cores mais intensas indicam percentuais maiores.");

    // Tamanho e margens.
    const largura = 950;
    const altura = 850;

    const margem = {
        top: 80,
        right: 40,
        bottom: 45,
        left: 260
    };

    const w = largura - margem.left - margem.right;
    const h = altura - margem.top - margem.bottom;

    // Cria o SVG.
    const svg = area
        .append("svg")
        .attr("viewBox", `0 0 ${largura} ${altura}`)
        .attr("width", "100%")
        .style("max-width", `${largura}px`);

    const g = svg.append("g")
        .attr("transform",
            `translate(${margem.left}, ${margem.top})`
        );

    // Escalas das idades e hobbies.
    const x = d3.scaleBand()
        .domain(idades)
        .range([0, w])
        .padding(0.08);

    const y = d3.scaleBand()
        .domain(hobbies)
        .range([0, h])
        .padding(0.08);

    // Cores de acordo com o percentual.
    const cor = d3.scaleLinear()
        .domain([0, 25, 50, 75, 100])
        .range([
            "#FFF4B8",
            "#FFD166",
            "#F8963E",
            "#D9412E",
            "#8B1538"
        ])
        .interpolate(d3.interpolateRgb)
        .clamp(true);

    // Retângulos do mapa de calor.
    g.selectAll(".celula")
        .data(dados)
        .join("rect")
        .attr("class", "celula")
        .attr("x", d => x(d.idade))
        .attr("y", d => y(d.hobby))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => cor(d.percentual));

    // Valores dentro das células.
    g.selectAll(".valor")
        .data(dados)
        .join("text")
        .attr("class", "valor")
        .attr("x", d => x(d.idade) + x.bandwidth() / 2)
        .attr("y", d => y(d.hobby) + y.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", d => d.percentual >= 60 ? "#FFFFFF" : "#292524")
        .text(d => d.percentual + "%");

    // Eixos.
    g.append("g")
        .call(d3.axisTop(x).tickSize(0))
        .call(eixo => eixo.select(".domain").remove());

    g.append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .call(eixo => eixo.select(".domain").remove());

    // Legenda de cores.
    const valoresLegenda = [0, 25, 50, 75, 100];

    const legenda = svg.append("g")
        .attr("transform", `translate(${margem.left}, 28)`);

    legenda.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", "13px")
        .attr("fill", "#FFFFFF")
        .text("Percentual que considera o hobby infantil");

    legenda.selectAll("rect")
        .data(valoresLegenda)
        .join("rect")
        .attr("x", (d, i) => i * 55)
        .attr("y", 12)
        .attr("width", 55)
        .attr("height", 12)
        .attr("fill", d => cor(d));

    legenda.selectAll(".numero")
        .data(valoresLegenda)
        .join("text")
        .attr("class", "numero")
        .attr("x", (d, i) => i * 55)
        .attr("y", 38)
        .attr("font-size", "11px")
        .attr("fill", "#FFFFFF")
        .text(d => d + "%");
});