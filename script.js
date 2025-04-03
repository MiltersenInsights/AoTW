const sheetURL = "https://opensheet.elk.sh/1-w0wJOoCeoN9KCt2J_wIaDQ5tB_FPJV0q9RHF7xzRvw/json";

async function fetchAlbums() {
    try {
        const response = await fetch(sheetURL);
        const data = await response.json();

        if (data.length === 0) {
            console.error("No albums found");
            return;
        }

        const albumGrid = document.getElementById("albumGrid"); // Exists only in grid.html

        if (albumGrid) {
            // ✅ We are on grid.html, load multiple albums
            data.forEach(album => {
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
                            <span>Posted by: ${album["Posted by"]} </span>
                            <span> on ${album.Date}</span>
                        </div>
                    </div>
                `;

                link.appendChild(albumItem);
                albumGrid.appendChild(link);
            });

            // ✅ Ensure body is visible only after albums are loaded
            document.body.classList.add("loaded");
        } else {
            // ✅ We are on index.html, load only the latest album
            let latestAlbum = data[data.length - 1];

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

            // ✅ Body should be visible once data is set
            document.body.classList.add("loaded");
        }
    } catch (error) {
        console.error("Error loading album:", error);
        document.body.classList.add("loaded"); // Avoid permanent blank screen
    }
}

// Start fetching albums
fetchAlbums();
