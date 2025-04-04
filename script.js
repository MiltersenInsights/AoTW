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

    if (albumGrid) {
      // ✅ We are on grid.html
      const searchInput = document.getElementById("albumSearch");
      const sortSelect = document.getElementById("sortSelect");
      const posterFilter = document.getElementById("posterFilter");
      const spinner = document.getElementById("spinner");

      let allAlbums = [...data];

      // Sort initially by newest
      allAlbums.sort((a, b) => new Date(b.Date) - new Date(a.Date));

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
      window.addEventListener("keydown", e => {
        if (e.key === "/") {
          e.preventDefault();
          searchInput.focus();
        }
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
