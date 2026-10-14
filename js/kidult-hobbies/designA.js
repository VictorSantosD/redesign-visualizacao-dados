
// Design A - Comparação entre as gerações de 18-34 e 65+ anos.

document.addEventListener("DOMContentLoaded", async () => {

    const area = d3.select("#kidult-hobbies-designA");
    if (area.empty()) return;

    // Lê os dados da planilha.
    const dados = await d3.dsv(";", "dados/kidult.csv", d => ({
        idade: d["Age Group"],
        hobby: d["Game"],
        percentual: Number(d["Percentage"])
    }));

    // Separa os dados por idade.
    const jovens = dados.filter(d => d.idade === "18-34");
    const idosos = dados.filter(d => d.idade === "65+");

    // Junta os valores e calcula as diferenças.
    const comparacao = jovens.map(j => {
        const i = idosos.find(d => d.hobby === j.hobby);

        return {
            hobby: j.hobby,
            jovens: j.percentual,
            idosos: i.percentual,
            diferenca: Math.abs(i.percentual - j.percentual)
        };
    });

    // Ordena pelas maiores diferenças.
    comparacao.sort((a, b) => b.diferenca - a.diferenca);

    // Limpa a área para não repetir os textos do HTML.
    area.selectAll("*").remove();
    area.text("");

    // Título e explicações no mesmo estilo do Big Mac.
    area.append("p")
        .style("margin", "12px 14px 4px")
        .style("font-size", "15px")
        .style("font-weight", "600")
        .style("color", "#FFFFFF")
        .text("Kidult Hobbies: diferenças entre jovens e idosos");

    area.append("p")
        .style("margin", "0 14px 12px")
        .style("font-size", "12px")
        .style("color", "#FFFFFF")
        .text("Comparação de 20 hobbies entre britânicos de 18 a 34 anos e pessoas com 65 anos ou mais.");

    area.append("p")
        .style("margin", "-6px 14px 12px")
        .style("font-size", "12px")
        .style("color", "#FFFFFF")
        .text("Cada ponto mostra o percentual que considera o hobby infantil. Quanto maior a distância entre os pontos, maior a diferença entre as gerações.");

    // Tamanho e margens.
    const largura = 1050;
    const altura = 850;

    const margem = {
        top: 60,
        right: 40,
        bottom: 50,
        left: 250
    };

    const w = largura - margem.left - margem.right;
    const h = altura - margem.top - margem.bottom;

    // Cria o SVG abaixo das explicações.
    const svg = area
        .append("svg")
        .attr("viewBox", `0 0 ${largura} ${altura}`)
        .attr("width", "100%")
        .style("max-width", `${largura}px`);

    const g = svg.append("g")
        .attr("transform",
            `translate(${margem.left}, ${margem.top})`
        );

    // Escalas dos percentuais e hobbies.
    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, w]);

    const y = d3.scaleBand()
        .domain(comparacao.map(d => d.hobby))
        .range([0, h])
        .padding(0.3);

    // Eixos.
    g.append("g")
        .attr("transform", `translate(0, ${h})`)
        .call(
            d3.axisBottom(x)
                .tickValues([0, 25, 50, 75, 100])
                .tickFormat(d => d + "%")
        );

    g.append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .call(eixo => eixo.select(".domain").remove());

    // Liga os valores dos dois grupos.
    g.selectAll(".linha")
        .data(comparacao)
        .join("line")
        .attr("class", "linha")
        .attr("x1", d => x(d.jovens))
        .attr("x2", d => x(d.idosos))
        .attr("y1", d => y(d.hobby) + y.bandwidth() / 2)
        .attr("y2", d => y(d.hobby) + y.bandwidth() / 2)
        .attr("stroke", "#9CA3AF")
        .attr("stroke-width", 2.5);

    // Pontos dos jovens.
    g.selectAll(".jovens")
        .data(comparacao)
        .join("circle")
        .attr("class", "jovens")
        .attr("cx", d => x(d.jovens))
        .attr("cy", d => y(d.hobby) + y.bandwidth() / 2)
        .attr("r", 5)
        .attr("fill", "#2563EB");

    // Pontos dos idosos.
    g.selectAll(".idosos")
        .data(comparacao)
        .join("circle")
        .attr("class", "idosos")
        .attr("cx", d => x(d.idosos))
        .attr("cy", d => y(d.hobby) + y.bandwidth() / 2)
        .attr("r", 5)
        .attr("fill", "#DC2626");

    // Legenda.
    const legenda = svg.append("g")
        .attr("transform", `translate(${margem.left}, 30)`);

    legenda.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", "#2563EB");

    legenda.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .attr("fill", "#FFFFFF")
        .text("18-34 anos");

    legenda.append("circle")
        .attr("cx", 140)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", "#DC2626");

    legenda.append("text")
        .attr("x", 152)
        .attr("y", 4)
        .attr("fill", "#FFFFFF")
        .text("65+ anos");
});
