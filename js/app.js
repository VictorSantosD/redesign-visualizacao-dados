/* Preenche os títulos, fontes e imagens originais usando os arquivos info.js.
   Os integrantes não precisam editar o index.html para preencher seu caso. */
document.addEventListener("DOMContentLoaded", () => {
  const casos = window.CASOS_INFO || {};

  ["bigmac", "caso2", "caso3"].forEach((id, indice) => {
    const info = casos[id];
    if (!info) return;

    // Atualiza o título e adiciona link para o gráfico original, quando existir.
    document.getElementById(`${id}-titulo`).textContent = `Caso ${indice + 1} — ${info.titulo}`;
    const fonte = document.getElementById(`${id}-fonte`);
    if (info.linkOriginal && /^https?:\/\//.test(info.linkOriginal)) {
      const link = document.createElement("a");
      link.href = info.linkOriginal;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = info.fonte || "Ver fonte original";
      fonte.append("Fonte: ", link);
    } else {
      fonte.textContent = info.fonte ? `Fonte: ${info.fonte}` : "Fonte: a definir";
    }

    // Mostra a imagem somente se o arquivo realmente existir.
    const area = document.getElementById(`${id}-original`);
    if (!info.imagemOriginal) return;
    const imagem = new Image();
    imagem.alt = `Visualização original: ${info.titulo}`;
    imagem.loading = "lazy";
    imagem.addEventListener("load", () => area.replaceChildren(imagem));
    imagem.addEventListener("error", () => { /* Mantém a mensagem de imagem pendente. */ });
    imagem.src = info.imagemOriginal;
  });
});
