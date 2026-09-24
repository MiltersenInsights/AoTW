const sheetURL = "https://opensheet.elk.sh/1-w0wJOoCeoN9KCt2J_wIaDQ5tB_FPJV0q9RHF7xzRvw/json";

const MUSIC_SERVICE_KEY = "aotwMusicService";

// Escape user-supplied text before injecting into innerHTML.
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

function normalizeSheetKey(key) {
  return String(key || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getSheetValue(row, possibleHeaders) {
  if (!row) return "";
  const wanted = possibleHeaders.map(normalizeSheetKey);

  for (const [key, value] of Object.entries(row)) {
    if (wanted.includes(normalizeSheetKey(key))) {
      return String(value || "").trim();
    }
  }

  return "";
}

function getSelectedMusicService() {
  return localStorage.getItem(MUSIC_SERVICE_KEY) || "spotify";
}

function getMusicLinks(album) {
  return {
    spotify: getSheetValue(album, ["Spotify Link", "Spotify", "Spotify URL", "Spotify Url"]),
    apple: getSheetValue(album, ["Apple Music Link", "Apple Music", "Apple Link", "Apple Music URL", "Apple Music Url"])
  };
}

function resolveMusicLinkFromUrls(spotifyUrl, appleUrl) {
  if (getSelectedMusicService() === "apple") {
    return appleUrl || spotifyUrl || "#";
  }
  return spotifyUrl || appleUrl || "#";
}

function getResolvedMusicLabelFromUrls(spotifyUrl, appleUrl) {
  if (getSelectedMusicService() === "apple") {
    return appleUrl ? "Apple Music" : "Spotify";
  }
  return spotifyUrl ? "Spotify" : "Apple Music";
}

function getMusicLink(album) {
  const links = getMusicLinks(album);
  return resolveMusicLinkFromUrls(links.spotify, links.apple);
}

function hydrateMusicAnchor(anchor, album) {
  const links = getMusicLinks(album);

  anchor.classList.add("music-link");
  anchor.dataset.spotifyUrl = links.spotify || "";
  anchor.dataset.appleUrl = links.apple || "";
  anchor.target = "_blank";
  anchor.rel = "noopener";

  updateMusicAnchor(anchor, album.Album || "album");
}

function updateMusicAnchor(anchor, albumTitle = "album") {
  const spotifyUrl = anchor.dataset.spotifyUrl || "";
  const appleUrl = anchor.dataset.appleUrl || "";
  const href = resolveMusicLinkFromUrls(spotifyUrl, appleUrl);
  const label = getResolvedMusicLabelFromUrls(spotifyUrl, appleUrl);

  anchor.href = href;
  anchor.title = `Open on ${label}`;
  anchor.setAttribute("aria-label", `Open ${albumTitle} on ${label}`);

  const serviceText = anchor.querySelector("[data-service-text]");
  if (serviceText) serviceText.textContent = label;

  return href;
}

function updateAllMusicLinks() {
  document.querySelectorAll("a.music-link").forEach(anchor => updateMusicAnchor(anchor));
}

function updateServiceSwitchUI() {
  const selected = getSelectedMusicService();
  document.querySelectorAll(".service-btn").forEach(btn => {
    const isActive = btn.dataset.service === selected;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

function setSelectedMusicService(service) {
  localStorage.setItem(MUSIC_SERVICE_KEY, service === "apple" ? "apple" : "spotify");
  updateServiceSwitchUI();
  updateAllMusicLinks();
}

function setupMusicServiceSwitch() {
  updateServiceSwitchUI();

  document.querySelectorAll(".service-btn").forEach(btn => {
    btn.addEventListener("click", () => setSelectedMusicService(btn.dataset.service));
  });

  // Resolve the selected service at click time. This avoids stale hrefs after switching.
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest("a.music-link");
    if (!anchor) return;

    const href = updateMusicAnchor(anchor);
    if (!href || href === "#") {
      e.preventDefault();
      alert("No music link is available for this album yet.");
    }
  }, true);
}

function sortAlbums(albums, sortValue) {
  const sorted = [...albums];

  switch (sortValue) {
    case "oldest":
      sorted.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      break;
    case "az":
      sorted.sort((a, b) => (a.Album || "").localeCompare(b.Album || ""));
      break;
    case "za":
      sorted.sort((a, b) => (b.Album || "").localeCompare(a.Album || ""));
      break;
    default:
      sorted.sort((a, b) => new Date(b.Date) - new Date(a.Date));
  }

  return sorted;
}

function filterAlbums(albums, query, selectedPoster) {
  let filtered = [...albums];

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(album =>
      (album.Album || "").toLowerCase().includes(q) ||
      (album["Posted by"] || "").toLowerCase().includes(q) ||
      (album.Date || "").toLowerCase().includes(q)
    );
  }

  if (selectedPoster) {
    filtered = filtered.filter(album => album["Posted by"] === selectedPoster);
  }

  return filtered;
}

function populatePosterFilter(albums, posterFilter) {
  if (!posterFilter) return;

  const uniquePosters = [...new Set(albums.map(a => a["Posted by"]).filter(Boolean))].sort();

  uniquePosters.forEach(poster => {
    const option = document.createElement("option");
    option.value = poster;
    option.textContent = poster;
    posterFilter.appendChild(option);
  });
}

function renderIndexPage(data) {
  const latestAlbum = data[data.length - 1];
  const albumLink = document.getElementById("spotify-link");

  document.getElementById("album-title").textContent = latestAlbum.Album || "Unknown Album";
  document.getElementById("posted-by").textContent = `- ${latestAlbum["Posted by"] || "Unknown"}`;
  document.getElementById("posted-date").textContent = `Posted: ${latestAlbum.Date || "Unknown Date"}`;
  document.getElementById("album-cover").src = latestAlbum["Cover Image"] || "https://via.placeholder.com/400";
  document.getElementById("album-cover").alt = `Cover of ${latestAlbum.Album || "album"}`;

  hydrateMusicAnchor(albumLink, latestAlbum);

  const commentElement = document.getElementById("poster-comment");
  if (latestAlbum["Poster Comment"]) {
    commentElement.textContent = `"${latestAlbum["Poster Comment"]}"`;
    commentElement.style.display = "block";
  } else {
    commentElement.style.display = "none";
  }
}

function renderGridPage(data) {
  const albumGrid = document.getElementById("albumGrid");
  const searchInput = document.getElementById("albumSearch");
  const sortSelect = document.getElementById("sortSelect");
  const posterFilter = document.getElementById("posterFilter");
  const infoToggleButton = document.getElementById("toggleInfo");
  const spinner = document.getElementById("spinner");

  let allAlbums = sortAlbums(data, "newest");

  if (infoToggleButton) {
    infoToggleButton.addEventListener("click", () => {
      infoToggleButton.classList.toggle("active");
      const showInfo = infoToggleButton.classList.contains("active");
      document.querySelectorAll(".album-item").forEach(item => {
        item.classList.toggle("hide-info", !showInfo);
      });
    });
  }

  populatePosterFilter(allAlbums, posterFilter);

  const renderAlbums = (albums) => {
    albumGrid.innerHTML = "";

    albums.forEach((album, index) => {
      const albumItem = document.createElement("div");
      albumItem.classList.add("album-item");
      albumItem.classList.toggle("hide-info", !infoToggleButton?.classList.contains("active"));

      // Earlier/newer cards paint above later cards during overlap.
      const z = 1000 + albums.length - index;
      albumItem.style.zIndex = String(z);

      const coverImage = album["Cover Image"] || "https://via.placeholder.com/200";
      const comment = (album["Poster Comment"] || "").trim();

      const link = document.createElement("a");
      hydrateMusicAnchor(link, album);
      link.style.display = "block";

      const commentBlock = comment ? `
        <button class="comment-badge" type="button" aria-label="Show poster comment">i</button>
        <div class="album-comment" role="dialog" aria-label="Poster comment">
          <button class="comment-close" type="button" aria-label="Close comment">✕</button>
          <div class="album-comment-inner">
            <p class="album-comment-text">“${escapeHtml(comment)}”</p>
            <span class="album-comment-by">— ${escapeHtml(album["Posted by"] || "")}</span>
          </div>
        </div>
      ` : "";

      albumItem.style.backgroundImage = `url(${coverImage})`;
      albumItem.innerHTML = `
        ${commentBlock}
        <div class="album-info">
          <h3>${escapeHtml(album.Album || "")}</h3>
          <div class="album-meta">
            <span>Posted by: ${escapeHtml(album["Posted by"] || "")}</span>
            <span> on ${escapeHtml(album.Date || "")}</span>
          </div>
        </div>
      `;

      link.appendChild(albumItem);
      albumGrid.appendChild(link);
    });

    updateAllMusicLinks();
  };

  const filterAndRender = () => {
    const filtered = filterAlbums(allAlbums, searchInput.value, posterFilter.value);
    renderAlbums(sortAlbums(filtered, sortSelect.value));
  };

  renderAlbums(allAlbums);

  searchInput?.addEventListener("input", filterAndRender);
  sortSelect?.addEventListener("change", filterAndRender);
  posterFilter?.addEventListener("change", filterAndRender);

  window.addEventListener("keydown", e => {
    if (e.key === "/" && searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  const closeAllComments = () => {
    document.querySelectorAll(".album-item.comment-open")
      .forEach(el => el.classList.remove("comment-open"));
  };

  albumGrid.addEventListener("click", (e) => {
    const item = e.target.closest(".album-item");

    if (e.target.closest(".comment-badge")) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = item.classList.contains("comment-open");
      closeAllComments();
      if (!isOpen) item.classList.add("comment-open");
      return;
    }

    if (e.target.closest(".comment-close")) {
      e.preventDefault();
      e.stopPropagation();
      item.classList.remove("comment-open");
      return;
    }

    if (item && item.classList.contains("comment-open")) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".album-item")) closeAllComments();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllComments();
  });

  spinner?.remove();
}

function renderTablePage(data) {
  const tableRows = document.getElementById("albumRows");
  const searchInput = document.getElementById("albumSearch");
  const sortSelect = document.getElementById("sortSelect");
  const posterFilter = document.getElementById("posterFilter");
  const spinner = document.getElementById("spinner");

  let allAlbums = sortAlbums(data, "newest");
  populatePosterFilter(allAlbums, posterFilter);

  const renderRows = (albums) => {
    tableRows.innerHTML = "";

    albums.forEach(album => {
      const links = getMusicLinks(album);
      const href = resolveMusicLinkFromUrls(links.spotify, links.apple);
      const label = getResolvedMusicLabelFromUrls(links.spotify, links.apple);
      const symbol = getSelectedMusicService() === "apple" && links.apple ? "" : "▶";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(album.Date || "")}</td>
        <td>${escapeHtml(album["Posted by"] || "")}</td>
        <td>${escapeHtml(album.Album || "")}</td>
        <td>
          <a class="music-link"
             href="${escapeHtml(href)}"
             target="_blank"
             rel="noopener"
             title="Open on ${escapeHtml(label)}"
             aria-label="Open on ${escapeHtml(label)}"
             data-spotify-url="${escapeHtml(links.spotify)}"
             data-apple-url="${escapeHtml(links.apple)}">${symbol}</a>
        </td>
      `;

      tableRows.appendChild(row);
    });

    updateAllMusicLinks();
  };

  const filterAndRender = () => {
    const filtered = filterAlbums(allAlbums, searchInput.value, posterFilter.value);
    renderRows(sortAlbums(filtered, sortSelect.value));
  };

  renderRows(allAlbums);

  searchInput?.addEventListener("input", filterAndRender);
  sortSelect?.addEventListener("change", filterAndRender);
  posterFilter?.addEventListener("change", filterAndRender);

  spinner?.remove();
}

async function fetchAlbums() {
  try {
    setupMusicServiceSwitch();

    const response = await fetch(sheetURL);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.error("No albums found");
      document.body.classList.add("loaded");
      return;
    }

    console.log("AoTW sheet columns:", Object.keys(data[0] || {}));

    if (document.getElementById("albumGrid")) {
      renderGridPage(data);
    } else if (document.getElementById("albumRows")) {
      renderTablePage(data);
    } else {
      renderIndexPage(data);
    }

    updateAllMusicLinks();
    document.body.classList.add("loaded");
  } catch (error) {
    console.error("Error loading album:", error);
    document.body.classList.add("loaded");
  }
}

fetchAlbums();
