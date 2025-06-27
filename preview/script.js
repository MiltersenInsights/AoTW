const sheetURL = "https://opensheet.elk.sh/1-w0wJOoCeoN9KCt2J_wIaDQ5tB_FPJV0q9RHF7xzRvw/json";

async function fetchAlbums() {
  try {
    const response = await fetch(sheetURL);
    const data = await response.json();

    if (!data.length) {
      console.error("No albums found");
      return;
    }

    const albumGrid = document.getElementById("albumGrid");
    const albumRows = document.getElementById("albumRows");

    if (albumGrid) {
      // === GRID PAGE ===
      const searchInput = document.getElementById("albumSearch");
      const sortSelect = document.getElementById("sortSelect");
      const posterFilter = document.getElementById("posterFilter");
      const infoToggle = document.getElementById("toggleInfo");
      const spinner = document.getElementById("spinner");

      let allAlbums = [...data].sort((a, b) => new Date(b.Date) - new Date(a.Date));

      // Populate filter
      [...new Set(allAlbums.map(a => a["Posted by"]).filter(Boolean))]
        .sort()
        .forEach(poster => {
          const opt = document.createElement("option");
          opt.value = poster;
          opt.textContent = poster;
          posterFilter.appendChild(opt);
        });

      const renderAlbums = albums => {
        albumGrid.innerHTML = "";
        albums.forEach(album => {
          const albumItem = document.createElement("div");
          albumItem.classList.add("album-item");
          if (!infoToggle.checked) albumItem.classList.add("hide-info");

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
        let filtered = allAlbums;

        if (query) {
          filtered = filtered.filter(a =>
            (a.Album || "").toLowerCase().includes(query) ||
            (a["Posted by"] || "").toLowerCase().includes(query) ||
            (a.Date || "").toLowerCase().includes(query)
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

        renderAlbums(filtered);
      };

      infoToggle.addEventListener("click", () => {
        infoToggle.classList.toggle("active");
        const showInfo = infoToggle.classList.contains("active");
        document.querySelectorAll(".album-item").forEach(item =>
          item.classList.toggle("hide-info", !showInfo)
        );
      });

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
      // === TABLE PAGE ===
      const searchInput = document.getElementById("albumSearch");
      const sortSelect = document.getElementById("sortSelect");
      const posterFilter = document.getElementById("posterFilter");
      const infoToggle = document.getElementById("toggleInfo");
      const spinner = document.getElementById("spinner");

      let allAlbums = [...data].sort((a, b) => new Date(b.Date) - new Date(a.Date));

      [...new Set(allAlbums.map(a => a["Posted by"]).filter(Boolean))]
        .sort()
        .forEach(poster => {
          const opt = document.createElement("option");
          opt.value = poster;
          opt.textContent = poster;
          posterFilter.appendChild(opt);
        });

      const renderTable = albums => {
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

      infoToggle.addEventListener("click", () => {
        infoToggle.classList.toggle("active");
        filterAndRender();
      });

      renderTable(allAlbums);
      searchInput.addEventListener("input", filterAndRender);
      sortSelect.addEventListener("change", filterAndRender);
      posterFilter.addEventListener("change", filterAndRender);

      spinner?.remove();
      document.body.classList.add("loaded");

    } else {
      // === INDEX PAGE ===
      const latest = data[data.length - 1];

      document.getElementById("album-title").textContent = latest.Album || "Unknown Album";
      document.getElementById("posted-by").textContent = `- ${latest["Posted by"] || "Unknown"}`;
      document.getElementById("posted-date").textContent = `Posted: ${latest.Date || "Unknown Date"}`;
      document.getElementById("album-cover").src = latest["Cover Image"] || "https://via.placeholder.com/400";
      document.getElementById("album-cover").alt = `Cover of ${latest.Album}`;
      document.getElementById("spotify-link").href = latest["Spotify Link"] || "#";

      const comment = document.getElementById("poster-comment");
      comment.textContent = latest["Poster Comment"] ? `"${latest["Poster Comment"]}"` : "";
      comment.style.display = latest["Poster Comment"] ? "block" : "none";

      document.body.classList.add("loaded");
    }

  } catch (error) {
    console.error("Error loading album:", error);
    document.body.classList.add("loaded");
  }
}

fetchAlbums();
