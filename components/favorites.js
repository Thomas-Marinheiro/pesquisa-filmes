const FAVORITES_KEY = "cinescope_favorites";

let favorites = new Map();

function initFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      arr.forEach((movie) => favorites.set(movie.id, movie));
    }
  } catch (e) {
    console.warn("Erro ao carregar favoritos:", e);
    favorites = new Map();
  }
  atualizarContagemFavoritos();
}

function salvarFavoritos() {
  try {
    const arr = Array.from(favorites.values());
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn("Erro ao salvar favoritos:", e);
  }
}

function alternarFavoritoPorId(movieId) {
  if (favorites.has(movieId)) {
    const title = favorites.get(movieId)?.title || "Filme";
    favorites.delete(movieId);
    showToast(`"${title}" removido dos favoritos`);
  } else {
    const card = document.querySelector(`.movie-card[data-id="${movieId}"]`);
    if (card) {
      const title = card.querySelector(".card-title")?.textContent || "";
      const year = card.querySelector(".card-year")?.textContent || "";
      const posterEl = card.querySelector(".card-poster");
      const ratingEl = card.querySelector(".card-rating");

      favorites.set(movieId, {
        id: movieId,
        title,
        release_date: year ? `${year}-01-01` : null,
        poster_path: posterEl ? extrairCaminhoPoster(posterEl.src) : null,
        vote_average: ratingEl
          ? parseFloat(ratingEl.textContent.replace("★", "").trim())
          : 0,
      });
      showToast(`"${title}" adicionado aos favoritos ♥`);
    } else {
      favorites.set(movieId, { id: movieId, title: "Filme" });
      showToast("Adicionado aos favoritos ♥");
    }
  }

  salvarFavoritos();
  atualizarContagemFavoritos();
  atualizarBotoesFavoritos();

  if (document.getElementById("favorites-view").style.display !== "none") {
    renderizarVisualizacaoFavoritos();
  }
}

function extrairCaminhoPoster(src) {
  const match = src.match(/\/w\d+(.+)/);
  return match ? match[1] : null;
}

function atualizarContagemFavoritos() {
  const count = favorites.size;
  const countEl = document.getElementById("fav-count");
  countEl.textContent = count;
  countEl.style.display = count > 0 ? "" : "none";
}

function renderizarVisualizacaoFavoritos() {
  const grid = document.getElementById("favorites-grid");
  const empty = document.getElementById("fav-empty");
  const favList = Array.from(favorites.values());

  if (favList.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "";
    return;
  }

  empty.style.display = "none";
  grid.innerHTML = "";
  favList.forEach((movie, index) => {
    grid.appendChild(criarCartaoFilme(movie, index));
  });
}

function limparTodosFavoritos() {
  if (favorites.size === 0) return;
  if (!confirm("Remover todos os favoritos?")) return;
  favorites.clear();
  salvarFavoritos();
  atualizarContagemFavoritos();
  renderizarVisualizacaoFavoritos();
  showToast("Favoritos limpos");
}

let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3000);
}
