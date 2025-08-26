const sheetURL = "https://opensheet.elk.sh/1-w0wJOoCeoN9KCt2J_wIaDQ5tB_FPJV0q9RHF7xzRvw/json";

async function fetchAlbums() {
  try {
    const response = await fetch(sheetURL);
    const data = await response.json();

    if (data.length === 0) {
      console.error("No albums found");
      return;
    }

    const albumGrid = document.getElementById("albumGrid");
    const albumRows = document.getElementById("albumRows");

    if (albumGrid) {
      // ✅ grid.html logic
      const searchInput = document.getElementById("albumSearch");
      const sortSelect = document.getElementById("sortSelect");
      const posterFilter = document.getElementById("posterFilter");
      const infoToggle = document.getElementById("toggleInfo");
      const spinner = document.getElementById("spinner");

      let allAlbums = [...data];
      allAlbums.sort((a, b) => new Date(b.Date) - new Date(a.Date));

      const infoToggleButton = document.getElementById("toggleInfo");
      infoToggleButton.addEventListener("click", () => {
        infoToggleButton.classList.toggle("active");
        const showInfo = infoToggleButton.classList.contains("active");
        const albumItems = document.querySelectorAll(".album-item");
        albumItems.forEach(item => {
          item.classList.toggle("hide-info", !showInfo);
        });
      });

      const uniquePosters = [...new Set(allAlbums.map(a => a["Posted by"]).filter(Boolean))].sort();
      uniquePosters.forEach(poster => {
        const option = document.createElement("option");
        option.value = poster;
        option.textContent = poster;
        posterFilter.appendChild(option);
      });

      const renderAlbums = (albums) => {
        albumGrid.innerHTML = "";
        albums.forEach(album => {
          const albumItem = document.createElement("div");
          albumItem.classList.add("album-item");
          if (!infoToggle.checked) {
            albumItem.classList.add("hide-info");
          }

          const coverImage = album["Cover Image"] || "https://via.placeholder.com/200";
          const spotifyLink = album["Spotify Link"] || "#";

          const link = document.createElement("a");
          link.href = spotifyLink;
          link.target = "_blank";
          link.style.display = "block";

          albumItem.style.backgroundImage = `url(${coverImage})`;
          albumItem.innerHTML = `
            <div class="album-info">
              <h3>${album.Album}</h3>
              <div class="album-meta">
                <span>Posted by ${album["Posted by"]}</span>
                <span> on ${album.Date}</span>
              </div>
            </div>
          `;

          link.appendChild(albumItem);
          albumGrid.appendChild(link);
        });
      };

      const filterAndRender = () => {
        const query = searchInput.value.toLowerCase();
        const selectedPoster = posterFilter.value;
        let filtered = allAlbums;

        if (query) {
          filtered = filtered.filter(album =>
            (album.Album || "").toLowerCase().includes(query) ||
            (album["Posted by"] || "").toLowerCase().includes(query) ||
            (album.Date || "").toLowerCase().includes(query)
          );
        }

        if (selectedPoster) {
          filtered = filtered.filter(album => album["Posted by"] === selectedPoster);
        }

        switch (sortSelect.value) {
          case "oldest":
            filtered.sort((a, b) => new Date(a.Date) - new Date(b.Date));
            break;
          case "az":
            filtered.sort((a, b) => a.Album.localeCompare(b.Album));
            break;
          case "za":
            filtered.sort((a, b) => b.Album.localeCompare(a.Album));
            break;
          default:
            filtered.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        }

        renderAlbums(filtered);
      };

      renderAlbums(allAlbums);
      searchInput.addEventListener("input", filterAndRender);
      sortSelect.addEventListener("change", filterAndRender);
      posterFilter.addEventListener("change", filterAndRender);
      infoToggle.addEventListener("change", filterAndRender);

      window.addEventListener("keydown", e => {
        if (e.key === "/") {
          e.preventDefault();
          searchInput.focus();
        }
      });

      spinner?.remove();
      document.body.classList.add("loaded");

    } else if (albumRows) {
      // ✅ table.html logic
      const searchInput = document.getElementById("albumSearch");
      const sortSelect = document.getElementById("sortSelect");
      const posterFilter = document.getElementById("posterFilter");
      const toggleInfo = document.getElementById("toggleInfo");
      const spinner = document.getElementById("spinner");

      let allAlbums = [...data];
      allAlbums.sort((a, b) => new Date(b.Date) - new Date(a.Date));

      const uniquePosters = [...new Set(allAlbums.map(a => a["Posted by"]).filter(Boolean))].sort();
      uniquePosters.forEach(poster => {
        const opt = document.createElement("option");
        opt.value = poster;
        opt.textContent = poster;
        posterFilter.appendChild(opt);
      });

const renderTable = (albums) => {
  albumRows.innerHTML = "";
  albums.forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.Date}</td>
      <td>${a["Posted by"]}</td>
      <td>${a.Album}</td>
      <td><a href="${a["Spotify Link"] || "#"}" target="_blank">🔗</a></td>
    `;
    albumRows.appendChild(tr);
  });
};

      const filterAndRender = () => {
        let filtered = [...allAlbums];
        const q = searchInput.value.toLowerCase();
        if (q) {
          filtered = filtered.filter(a =>
            (a.Album || "").toLowerCase().includes(q) ||
            (a["Posted by"] || "").toLowerCase().includes(q) ||
            (a.Date || "").toLowerCase().includes(q)
          );
        }

        if (posterFilter.value) {
          filtered = filtered.filter(a => a["Posted by"] === posterFilter.value);
        }

        switch (sortSelect.value) {
          case "oldest":
            filtered.sort((a, b) => new Date(a.Date) - new Date(b.Date));
            break;
          case "az":
            filtered.sort((a, b) => a.Album.localeCompare(b.Album));
            break;
          case "za":
            filtered.sort((a, b) => b.Album.localeCompare(a.Album));
            break;
          default:
            filtered.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        }

        renderTable(filtered);
      };

      toggleInfo.addEventListener("click", () => {
        toggleInfo.classList.toggle("active");
        filterAndRender();
      });

      renderTable(allAlbums);
      searchInput.addEventListener("input", filterAndRender);
      sortSelect.addEventListener("change", filterAndRender);
      posterFilter.addEventListener("change", filterAndRender);

      spinner?.remove();
      document.body.classList.add("loaded");
    } else {
      // ✅ index.html logic
      const latestAlbum = data[data.length - 1];
      document.getElementById("album-title").textContent = latestAlbum.Album || "Unknown Album";
      document.getElementById("posted-by").textContent = `- ${latestAlbum["Posted by"] || "Unknown"}`;
      document.getElementById("posted-date").textContent = `Posted: ${latestAlbum.Date || "Unknown Date"}`;
      document.getElementById("album-cover").src = latestAlbum["Cover Image"] || "https://via.placeholder.com/400";
      document.getElementById("album-cover").alt = `Cover of ${latestAlbum.Album}`;
      document.getElementById("spotify-link").href = latestAlbum["Spotify Link"] || "#";

      const commentElement = document.getElementById("poster-comment");
      if (latestAlbum["Poster Comment"]) {
        commentElement.textContent = `"${latestAlbum["Poster Comment"]}"`;
        commentElement.style.display = "block";
      } else {
        commentElement.style.display = "none";
      }

      document.body.classList.add("loaded");
    }

  } catch (error) {
    console.error("Error loading album:", error);
    document.body.classList.add("loaded");
  }
}

fetchAlbums();

/* ==============================================
   AoTW — Mobile tap overlap (v1)
   Goal: apply a short “pop” on tap to mimic desktop hover
   Paste this near the bottom of script.js (after albums render)
   ============================================== */

(function enableMobileTapPop(){
  const grid = document.getElementById("albumGrid");
  if (!grid) return;

  // Simple feature detect for touch-capable screens
  const isTouch = matchMedia("(pointer: coarse)").matches;

  if (!isTouch) return; // only do this on touch devices

  // Delegate tap: add .touch-pop briefly on the tapped .album-item
  grid.addEventListener("touchstart", (e) => {
    const card = e.target.closest(".album-item");
    if (!card) return;
    // Remove existing pop
    grid.querySelectorAll(".album-item.touch-pop").forEach(el => el.classList.remove("touch-pop"));
    // Add pop
    card.classList.add("touch-pop");
    // Remove it shortly after, but allow navigation to proceed
    setTimeout(() => card.classList.remove("touch-pop"), 220);
  }, {passive: true});

  // Also handle quick taps via mouse on small tablets
  grid.addEventListener("click", (e) => {
    if (!matchMedia("(max-width: 479px)").matches) return;
    const card = e.target.closest(".album-item");
    if (!card) return;
    card.classList.add("touch-pop");
    setTimeout(() => card.classList.remove("touch-pop"), 180);
  });
})();
