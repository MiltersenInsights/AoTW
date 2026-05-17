const sheetURL = "https://opensheet.elk.sh/1-w0wJOoCeoN9KCt2J_wIaDQ5tB_FPJV0q9RHF7xzRvw/json";

// Escape user-supplied text before injecting into innerHTML (poster comments may contain quotes, <, &, etc.)
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

async function fetchAlbums() {
  try {
    const response = await fetch(sheetURL);
    const data = await response.json();

    if (data.length === 0) {
      console.error("No albums found");
      return;
    }

    const albumGrid = document.getElementById("albumGrid");

    if (albumGrid) {
      // ✅ We are on grid.html
      const searchInput = document.getElementById("albumSearch");
      const sortSelect = document.getElementById("sortSelect");
      const posterFilter = document.getElementById("posterFilter");
      const infoToggle = document.getElementById("toggleInfo");
      const spinner = document.getElementById("spinner");

      let allAlbums = [...data];

      // Sort initially by newest
      allAlbums.sort((a, b) => new Date(b.Date) - new Date(a.Date));

      // Toggle handling
      const infoToggleButton = document.getElementById("toggleInfo");

      infoToggleButton.addEventListener("click", () => {
      infoToggleButton.classList.toggle("active");
    
      const showInfo = infoToggleButton.classList.contains("active");
      const albumItems = document.querySelectorAll(".album-item");
    
      albumItems.forEach(item => {
        item.classList.toggle("hide-info", !showInfo);
        });
      });

      // Populate filter dropdown
      const uniquePosters = [...new Set(allAlbums.map(a => a["Posted by"]).filter(Boolean))];
      uniquePosters.sort();
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
          const comment = (album["Poster Comment"] || "").trim();

          const link = document.createElement("a");
          link.href = spotifyLink;
          link.target = "_blank";
          link.style.display = "block";

          // Poster comment badge + overlay — only rendered when a comment exists
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
              <h3>${album.Album}</h3>
              <div class="album-meta">
                <span>Posted by: ${album["Posted by"]}</span>
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

      // Initial render
      renderAlbums(allAlbums);

      // Hook up listeners
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

      // --- Poster comment interactions ---
      // Delegated on the grid so it keeps working after every filter/sort re-render.
      const closeAllComments = () => {
        document.querySelectorAll(".album-item.comment-open")
          .forEach(el => el.classList.remove("comment-open"));
      };

      albumGrid.addEventListener("click", (e) => {
        const item = e.target.closest(".album-item");

        // Tapped the (i) badge → open this comment, close any other
        if (e.target.closest(".comment-badge")) {
          e.preventDefault();   // stop the wrapping <a> from opening Spotify
          e.stopPropagation();
          const isOpen = item.classList.contains("comment-open");
          closeAllComments();
          if (!isOpen) item.classList.add("comment-open");
          return;
        }

        // Tapped the ✕ → close this comment
        if (e.target.closest(".comment-close")) {
          e.preventDefault();
          e.stopPropagation();
          item.classList.remove("comment-open");
          return;
        }

        // Tapped anywhere on an OPEN comment → keep reading, don't jump to Spotify
        if (item && item.classList.contains("comment-open")) {
          e.preventDefault();
          e.stopPropagation();
        }
        // Otherwise: a normal tap on the cover lets the <a> open Spotify as before
      });

      // Click outside any tile, or press Escape, closes an open comment
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".album-item")) closeAllComments();
      });
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllComments();
      });

      spinner?.remove();
      document.body.classList.add("loaded");
    } else {
      // ✅ We are on index.html
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
