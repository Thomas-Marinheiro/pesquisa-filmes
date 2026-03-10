const API_KEY = "a74c09f5ddc8638ff18a1b432fb0c5dd";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";
const LANGUAGE = "pt-BR";

const api = {
  async getPopular(pagina = 1, ordenarPor = "popularity.desc") {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&sort_by=${ordenarPor}&page=${pagina}&include_adult=false`;
    return await fetchJSON(url);
  },

  async searchMovies(consulta, pagina = 1) {
    const encoded = encodeURIComponent(consulta.trim());
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=${LANGUAGE}&query=${encoded}&page=${pagina}&include_adult=false`;
    return await fetchJSON(url);
  },

  async getMovieDetails(id) {
    const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=${LANGUAGE}&append_to_response=credits,videos`;
    return await fetchJSON(url);
  },

  async getNowPlaying(pagina = 1) {
    const url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=${LANGUAGE}&page=${pagina}`;
    return await fetchJSON(url);
  },

  poster(path, size = "w500") {
    return path ? `${IMG_BASE}/${size}${path}` : null;
  },
  backdrop(path, size = "w1280") {
    return path ? `${IMG_BASE}/${size}${path}` : null;
  },

  formatRating(voto) {
    return voto ? `★ ${voto.toFixed(1)}` : "N/A";
  },
  formatYear(data) {
    return data ? data.substring(0, 4) : "—";
  },
  formatDate(data) {
    if (!data) return "—";
    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  },
  formatMoney(valor) {
    if (!valor || valor === 0) return "N/D";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(valor);
  },
  formatRuntime(minutos) {
    if (!minutos) return "";
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  },
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.status_message || `HTTP ${res.status}`);
  }
  return res.json();
}
