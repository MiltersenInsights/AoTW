fetch("https://opensheet.elk.sh/1-w0wJOoCeoN9KCt2J_wIaDQ5tB_FPJV0q9RHF7xzRvw/json")
  .then(response => response.json())
  .then(data => {
      if (data.length === 0) {
          console.error("No albums found");
          return;
      }

      let latestAlbum = data[data.length - 1]; // Get the last posted album

      // Extract album details
      const albumTitle = latestAlbum.Album || "Unknown Album";
      const postedBy = latestAlbum["Posted by"] || "Unknown";
      const datePosted = latestAlbum.Date || "Unknown Date";
      const coverImage = latestAlbum["Cover Image"] || "https://via.placeholder.com/400";
      const spotifyLink = latestAlbum["Spotify Link"] || "#";
      const posterComment = latestAlbum["Poster Comment"] || "";

      // Update the page content
      document.getElementById("album-title").textContent = albumTitle;
      document.getElementById("posted-by").textContent = `- ${postedBy}`;
      document.getElementById("posted-date").textContent = `Posted: ${datePosted}`;
      document.getElementById("album-cover").src = coverImage;
      document.getElementById("album-cover").alt = `Cover of ${albumTitle}`;
      document.getElementById("spotify-link").href = spotifyLink;

      // Handle the optional poster comment
      const commentElement = document.getElementById("poster-comment");
      if (posterComment) {
          commentElement.textContent = `"${posterComment}"`;
          commentElement.style.display = "block"; // Show it if there is a comment
      } else {
          commentElement.style.display = "none"; // Hide if no comment
      }

      // Fix mobile issue: Ensure entire album cover is clickable
      document.querySelectorAll(".album-item a").forEach(link => {
          link.addEventListener("click", function (event) {
              event.preventDefault(); // Prevent default browser opening

              const spotifyAppURL = spotifyLink.replace("https://open.spotify.com/", "spotify://");

              // Try to open Spotify app first
              window.location.href = spotifyAppURL;

              // If app is not installed, fallback to browser after 500ms
              setTimeout(() => {
                  window.open(spotifyLink, "_blank");
              }, 500);
          });
      });
  })
  .catch(error => console.error("Error loading album:", error));
