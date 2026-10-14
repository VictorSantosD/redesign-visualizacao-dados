/* Exibe a fonte de cada visualização e mantém os links para as publicações originais. */
document.addEventListener("DOMContentLoaded", () => {
  const casos = window.CASOS_INFO || {};

  ["bigmac", "kidult-hobbies", "life-expectancy"].forEach(id => {
    const info = casos[id];
    if (!info) return;

    const titulo = document.getElementById(`${id}-titulo`);
    const fonte = document.getElementById(`${id}-fonte`);
    if (!titulo || !fonte) return;

    titulo.textContent = info.titulo;
    fonte.textContent = "";

    if (info.linkOriginal && /^https?:\/\//.test(info.linkOriginal)) {
      const link = document.createElement("a");
      link.href = info.linkOriginal;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = info.fonte;
      fonte.append("Fonte: ", link);
    } else if (info.fonte) {
      fonte.textContent = `Fonte: ${info.fonte}`;
    }
  });
});
