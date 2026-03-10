function criarCartaoFilme(filme, index = 0) {
  const isFav = favorites.has(filme.id);
  const poster = api.poster(filme.poster_path);
  const rating = filme.vote_average ? filme.vote_average.toFixed(1) : null;
  const year = api.formatYear(filme.release_date);

  const card = document.createElement("div");
  card.className = "movie-card";
  card.style.setProperty("--card-delay", `${index * 0.05}s`);
  card.setAttribute("data-id", filme.id);

  card.innerHTML = `
    <div class="card-poster-wrap">
      ${
        poster
          ? `<img class="card-poster" src="${poster}" alt="${escapeHTML(filme.title)}" loading="lazy" />`
          : `<div class="card-no-poster">
             <span class="card-no-poster-icon">🎬</span>
             <span>Sem imagem</span>
           </div>`
      }

      ${rating ? `<div class="card-rating">★ ${rating}</div>` : ""}

      <button
        class="card-fav-btn ${isFav ? "active" : ""}"
        onclick="handleFavClick(event, ${filme.id})"
        title="${isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
        aria-label="${isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
      >${isFav ? "♥" : "♡"}</button>

      <div class="card-overlay"></div>
    </div>

    <div class="card-info">
      <div class="card-title">${escapeHTML(filme.title)}</div>
      <div class="card-year">${year}</div>
    </div>
  `;

  card.addEventListener("click", (e) => {
    if (e.target.closest(".card-fav-btn")) return;
    abrirModal(filme.id);
  });

  return card;
}

function renderizarGradeFilmes(movies, containerId = "movie-grid") {
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";

  movies.forEach((movie, index) => {
    grid.appendChild(criarCartaoFilme(movie, index));
  });
}

function atualizarBotoesFavoritos() {
  document.querySelectorAll(".card-fav-btn").forEach((btn) => {
    const card = btn.closest(".movie-card");
    const id = parseInt(card.getAttribute("data-id"));
    const isFav = favorites.has(id);
    btn.textContent = isFav ? "♥" : "♡";
    btn.classList.toggle("active", isFav);
    btn.title = isFav ? "Remover dos favoritos" : "Adicionar aos favoritos";
  });
}

function handleFavClick(event, movieId) {
  event.stopPropagation();
  alternarFavoritoPorId(movieId);
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}
