let estado = {
  consulta: "",
  pagina: 1,
  totalPaginas: 1,
  totalResultados: 0,
  ordenarPor: "popularity.desc",
  carregando: false,
  temporizadorDebounce: null,
  visualizacaoAtual: "home",
};

document.addEventListener("DOMContentLoaded", () => {
  initFavorites();
  updateFavCount();
  configurarBusca();
  carregarFilmes();
});

function configurarBusca() {
  const input = document.getElementById("search-input");
  const clearBtn = document.getElementById("search-clear");

  input.addEventListener("input", () => {
    const val = input.value;
    clearBtn.classList.toggle("visible", val.length > 0);

    clearTimeout(estado.temporizadorDebounce);
    estado.temporizadorDebounce = setTimeout(() => {
      estado.consulta = val.trim();
      estado.pagina = 1;
      carregarFilmes();
    }, 400);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      clearTimeout(estado.temporizadorDebounce);
      estado.consulta = input.value.trim();
      estado.pagina = 1;
      carregarFilmes();
    }
  });
}

function limparBusca() {
  const input = document.getElementById("search-input");
  input.value = "";
  document.getElementById("search-clear").classList.remove("visible");
  estado.consulta = "";
  estado.pagina = 1;
  carregarFilmes();
  input.focus();
}

function aoAlterarOrdenacao() {
  estado.ordenarPor = document.getElementById("sort-select").value;
  estado.pagina = 1;
  carregarFilmes();
}

async function carregarFilmes() {
  if (estado.carregando) return;
  estado.carregando = true;

  mostrarCarregamento(true);
  mostrarVazio(false);
  document.getElementById("movie-grid").innerHTML = "";
  document.getElementById("pagination").style.display = "none";

  try {
    let data;
    if (estado.consulta) {
      data = await api.searchMovies(estado.consulta, estado.pagina);
      definirTitulo(`Resultados para "${estado.consulta}"`);
    } else {
      data = await api.getPopular(estado.pagina, estado.ordenarPor);
      definirTitulo(obterRotuloOrdenacao(estado.ordenarPor));
    }

    estado.totalPaginas = Math.min(data.total_pages, 20);
    estado.totalResultados = data.total_results;

    mostrarCarregamento(false);

    const movies = data.results || [];

    if (movies.length === 0) {
      mostrarVazio(true);
    } else {
      definirContagemResultados(estado.totalResultados);
      renderizarGradeFilmes(movies, "movie-grid");
      renderizarPaginacao();
    }
  } catch (err) {
    mostrarCarregamento(false);
    console.error("Erro na API:", err);

    if (
      err.message.includes("401") ||
      err.message.includes("Invalid API key")
    ) {
      mostrarErroApiKey();
    } else {
      showToast("Erro ao carregar filmes. Verifique sua conexão.");
      mostrarVazio(true);
    }
  } finally {
    estado.carregando = false;
    document
      .getElementById("main-content")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function mostrarCarregamento(show) {
  document.getElementById("loading-state").style.display = show ? "" : "none";
}

function mostrarVazio(show) {
  document.getElementById("empty-state").style.display = show ? "" : "none";
}

function definirTitulo(title) {
  document.getElementById("section-title").textContent = title;
}

function definirContagemResultados(total) {
  const el = document.getElementById("result-count");
  el.textContent =
    total > 0 ? `${total.toLocaleString("pt-BR")} filmes encontrados` : "";
}

function obterRotuloOrdenacao(ordenarPor) {
  const labels = {
    "popularity.desc": "Em Alta Agora",
    "vote_average.desc": "Mais Bem Avaliados",
    "release_date.desc": "Lançamentos Recentes",
    "revenue.desc": "Maiores Bilheterias",
  };
  return labels[ordenarPor] || "Filmes";
}

function renderizarPaginacao() {
  if (estado.totalPaginas <= 1) return;

  const paginationEl = document.getElementById("pagination");
  const pageNumbers = document.getElementById("page-numbers");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  paginationEl.style.display = "flex";
  prevBtn.disabled = estado.pagina <= 1;
  nextBtn.disabled = estado.pagina >= estado.totalPaginas;

  pageNumbers.innerHTML = "";
  const pages = obterIntervaloPaginas(estado.pagina, estado.totalPaginas);
  pages.forEach((p) => {
    if (p === "...") {
      const dots = document.createElement("span");
      dots.textContent = "…";
      dots.style.cssText =
        "display:flex;align-items:center;color:var(--text-muted);padding:0 4px;";
      pageNumbers.appendChild(dots);
    } else {
      const btn = document.createElement("button");
      btn.className = `page-num ${p === estado.pagina ? "active" : ""}`;
      btn.textContent = p;
      btn.onclick = () => irParaPagina(p);
      pageNumbers.appendChild(btn);
    }
  });
}

function obterIntervaloPaginas(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function mudarPagina(delta) {
  irParaPagina(estado.pagina + delta);
}

function irParaPagina(pagina) {
  if (pagina < 1 || pagina > estado.totalPaginas) return;
  estado.pagina = pagina;
  carregarFilmes();
}

function exibirInicio() {
  estado.visualizacaoAtual = "home";
  document.getElementById("home-view").style.display = "";
  document.getElementById("favorites-view").style.display = "none";
  document.getElementById("hero").style.display = "";
  document.getElementById("nav-home").classList.add("active");
  document.getElementById("nav-favorites").classList.remove("active");
}

function exibirFavoritos() {
  estado.visualizacaoAtual = "favorites";
  document.getElementById("home-view").style.display = "none";
  document.getElementById("favorites-view").style.display = "";
  document.getElementById("hero").style.display = "none";
  document.getElementById("nav-home").classList.remove("active");
  document.getElementById("nav-favorites").classList.add("active");
  renderizarVisualizacaoFavoritos();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function alternarTema() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("cinescope_theme", next);
}

(function aplicarTema() {
  const saved = localStorage.getItem("cinescope_theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
})();

function mostrarErroApiKey() {
  const grid = document.getElementById("movie-grid");
  grid.innerHTML = `
    <div style="
      grid-column: 1/-1;
      text-align: center;
      padding: 60px 24px;
      animation: fadeUp 0.4s ease;
    ">
      <div style="font-size: 56px; margin-bottom: 20px;">🔑</div>
      <h3 style="
        font-family: var(--font-serif);
        font-size: 28px;
        color: var(--text-primary);
        margin-bottom: 12px;
      ">Chave de API não configurada</h3>
      <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 24px; line-height: 1.8;">
        Para usar o CineScope, você precisa de uma chave gratuita do TMDB.
        Abra o arquivo <code style="
          background: var(--bg-elevated);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 13px;
        ">services/api.js</code> e substitua <code style="
          background: var(--bg-elevated);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 13px;
        ">SUA_CHAVE_AQUI</code> pela sua chave.
      </p>
      <a href="https://www.themoviedb.org/settings/api" target="_blank" style="
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: var(--accent);
        color: #000;
        font-weight: 700;
        font-size: 14px;
        padding: 14px 28px;
        border-radius: 100px;
        text-decoration: none;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">
        ↗ Obter chave grátis no TMDB
      </a>
    </div>
  `;
}
