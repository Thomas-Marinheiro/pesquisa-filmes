let currentModalMovieId = null;

async function abrirModal(movieId) {
  currentModalMovieId = movieId;

  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  definirCarregamentoModal();

  try {
    const movie = await api.getMovieDetails(movieId);
    popularModal(movie);
  } catch (err) {
    console.error("Erro ao carregar detalhes:", err);
    showToast("Erro ao carregar detalhes do filme.");
    fecharModalBotao();
  }
}

function definirCarregamentoModal() {
  document.getElementById("modal-title").textContent = "Carregando…";
  document.getElementById("modal-overview").textContent = "";
  document.getElementById("modal-tagline").textContent = "";
  document.getElementById("modal-year").textContent = "";
  document.getElementById("modal-rating").textContent = "";
  document.getElementById("modal-runtime").textContent = "";
  document.getElementById("modal-release").textContent = "…";
  document.getElementById("modal-votes").textContent = "…";
  document.getElementById("modal-budget").textContent = "…";
  document.getElementById("modal-revenue").textContent = "…";
  document.getElementById("modal-genres").innerHTML = "";
  document.getElementById("modal-poster").src = "";
  document.getElementById("modal-banner").style.backgroundImage = "";
}

function popularModal(movie) {
  const isFav = favorites.has(movie.id);

  const banner = document.getElementById("modal-banner");
  const backdropUrl = api.backdrop(movie.backdrop_path);
  if (backdropUrl) {
    banner.style.backgroundImage = `url(${backdropUrl})`;
    banner.style.backgroundSize = "cover";
    banner.style.backgroundPosition = "center top";
  }

  const posterUrl = api.poster(movie.poster_path, "w342");
  document.getElementById("modal-poster").src = posterUrl || "";
  document.getElementById("modal-poster").alt = movie.title;

  document.getElementById("modal-title").textContent = movie.title;
  document.getElementById("modal-tagline").textContent = movie.tagline || "";
  document.getElementById("modal-overview").textContent =
    movie.overview || "Sinopse não disponível.";

  document.getElementById("modal-year").textContent = api.formatYear(
    movie.release_date,
  );
  document.getElementById("modal-runtime").textContent = api.formatRuntime(
    movie.runtime,
  );

  const ratingEl = document.getElementById("modal-rating");
  if (movie.vote_average) {
    ratingEl.textContent = `★ ${movie.vote_average.toFixed(1)}`;
    ratingEl.style.display = "flex";
  } else {
    ratingEl.style.display = "none";
  }

  document.getElementById("modal-release").textContent = api.formatDate(
    movie.release_date,
  );
  document.getElementById("modal-votes").textContent = movie.vote_count
    ? `${movie.vote_count.toLocaleString("pt-BR")} votos`
    : "—";
  document.getElementById("modal-budget").textContent = api.formatMoney(
    movie.budget,
  );
  document.getElementById("modal-revenue").textContent = api.formatMoney(
    movie.revenue,
  );

  const genreContainer = document.getElementById("modal-genres");
  genreContainer.innerHTML = "";
  if (movie.genres && movie.genres.length > 0) {
    movie.genres.forEach((g) => {
      const tag = document.createElement("span");
      tag.className = "genre-tag";
      tag.textContent = g.name;
      genreContainer.appendChild(tag);
    });
  }

  const favBtn = document.getElementById("modal-fav-btn");
  const favIcon = document.getElementById("modal-fav-icon");
  atualizarBotaoFavModal(isFav);
}

function atualizarBotaoFavModal(isFav) {
  const favBtn = document.getElementById("modal-fav-btn");
  const favIcon = document.getElementById("modal-fav-icon");
  favIcon.textContent = isFav ? "♥" : "♡";
  favBtn.innerHTML = `<span id="modal-fav-icon">${isFav ? "♥" : "♡"}</span> ${isFav ? "Remover" : "Favoritar"}`;
  favBtn.classList.toggle("active", isFav);
}

function alternarFavoritoDoModal() {
  if (!currentModalMovieId) return;
  alternarFavoritoPorId(currentModalMovieId);
  atualizarBotaoFavModal(favorites.has(currentModalMovieId));
}

function fecharModalBotao() {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.remove("open");
  document.body.style.overflow = "";
  currentModalMovieId = null;
}

function fecharModal(event) {
  if (event.target === document.getElementById("modal-overlay")) {
    fecharModalBotao();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharModalBotao();
});
