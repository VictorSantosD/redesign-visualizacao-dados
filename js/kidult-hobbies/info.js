
// Informações do Caso 2.
window.CASOS_INFO = window.CASOS_INFO || {};

window.CASOS_INFO.caso2 = {
    titulo: "Kidult Hobbies: diferenças entre gerações",
    fonte: "YouGov (2025) - Makeover Monday 2025/W38",
    linkOriginal: "https://makeovermonday.vercel.app/dataset/do-younger-britons-see-kidult-hobbies-as-less-childish",
    imagemOriginal: "imagens/caso2-original.png"
};

// Coloca a imagem original na página.
document.addEventListener("DOMContentLoaded", () => {
    const area = document.getElementById("caso2-original");

    if (!area) return;

    const imagem = document.createElement("img");
    imagem.src = "imagens/caso2-original.png";
    imagem.alt = "Visualização original da YouGov";
    imagem.style.maxWidth = "100%";
    imagem.style.height = "auto";

    area.replaceChildren(imagem);
});
